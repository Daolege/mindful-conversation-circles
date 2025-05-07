
import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Maximize,
  Minimize,
  Settings,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/authHooks";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface VideoPlayerProps {
  videoUrl?: string;
  title: string;
  courseId: string;
  lessonId: string;
}

export const VideoPlayer = ({ videoUrl, title, courseId, lessonId }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const updateLastWatchedTime = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('course_progress')
        .upsert([{
          course_id: parseInt(courseId),
          lecture_id: lessonId,
          user_id: user?.id,
          last_watched_at: new Date().toISOString()
        } as any]);

      if (error) throw error;
      
    } catch (error) {
      console.error('Error updating last watched time:', error);
      toast.error('无法更新观看时间');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = async () => {
      await updateLastWatchedTime();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [courseId, lessonId, user?.id]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (!isFullScreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        } else if ((videoRef.current as any).mozRequestFullScreen) {
          (videoRef.current as any).mozRequestFullScreen();
        } else if ((videoRef.current as any).webkitRequestFullscreen) {
          (videoRef.current as any).webkitRequestFullscreen();
        } else if ((videoRef.current as any).msRequestFullscreen) {
          (videoRef.current as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
      setIsFullScreen(!isFullScreen);
    }
  };

  const handleTimeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setIsSettingsOpen(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Auto hide controls
  useEffect(() => {
    if (showControls) {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      
      controlsTimeout.current = setTimeout(() => {
        if (!isSettingsOpen) {
          setShowControls(false);
        }
      }, 3000);
    }
    
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [showControls, isSettingsOpen]);

  return (
    <div
      className="relative w-full aspect-video bg-black group rounded-lg overflow-hidden"
      onMouseEnter={() => setShowControls(true)}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => !isSettingsOpen && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        playsInline
      />
      
      {!isPlaying && !showControls && (
        <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
          <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
            <Play className="h-12 w-12 text-white" />
          </div>
        </div>
      )}
      
      {(showControls || loading) && (
        <div className="absolute bottom-0 left-0 w-full bg-white/10 backdrop-blur-sm text-gray-800 p-4 flex flex-col transition-opacity duration-300 border-t border-white/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button onClick={togglePlay} className="hover:bg-white/30 p-1 rounded-full">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-800" />
                ) : (
                  isPlaying ? <Pause className="h-5 w-5 text-gray-800" /> : <Play className="h-5 w-5 text-gray-800" />
                )}
              </button>
              <div className="text-sm text-gray-800">
                <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="hover:bg-white/30 p-1 rounded-full"
                >
                  <Settings className="h-5 w-5 text-gray-800" />
                </button>
                {isSettingsOpen && (
                  <div className="absolute right-0 bottom-10 w-32 bg-white border border-gray-100 rounded-md shadow-lg z-10">
                    <div className="p-2 text-sm font-medium border-b border-gray-100">播放速度</div>
                    <button
                      onClick={() => handlePlaybackRateChange(1.0)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${playbackRate === 1.0 ? 'bg-gray-100' : ''}`}
                    >
                      1.0x
                    </button>
                    <button
                      onClick={() => handlePlaybackRateChange(1.25)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${playbackRate === 1.25 ? 'bg-gray-100' : ''}`}
                    >
                      1.25x
                    </button>
                    <button
                      onClick={() => handlePlaybackRateChange(1.5)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${playbackRate === 1.5 ? 'bg-gray-100' : ''}`}
                    >
                      1.5x
                    </button>
                    <button
                      onClick={() => handlePlaybackRateChange(1.75)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${playbackRate === 1.75 ? 'bg-gray-100' : ''}`}
                    >
                      1.75x
                    </button>
                    <button
                      onClick={() => handlePlaybackRateChange(2.0)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${playbackRate === 2.0 ? 'bg-gray-100' : ''}`}
                    >
                      2.0x
                    </button>
                    <button
                      onClick={() => handlePlaybackRateChange(2.25)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${playbackRate === 2.25 ? 'bg-gray-100' : ''}`}
                    >
                      2.25x
                    </button>
                    <button
                      onClick={() => handlePlaybackRateChange(2.5)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${playbackRate === 2.5 ? 'bg-gray-100' : ''}`}
                    >
                      2.5x
                    </button>
                    <button
                      onClick={() => handlePlaybackRateChange(3.0)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${playbackRate === 3.0 ? 'bg-gray-100' : ''}`}
                    >
                      3.0x
                    </button>
                  </div>
                )}
              </div>
              <button onClick={toggleFullScreen} className="hover:bg-white/30 p-1 rounded-full">
                {isFullScreen ? <Minimize className="h-5 w-5 text-gray-800" /> : <Maximize className="h-5 w-5 text-gray-800" />}
              </button>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.1"
            value={currentTime}
            onChange={handleTimeSliderChange}
            className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
          />
        </div>
      )}
    </div>
  );
};
