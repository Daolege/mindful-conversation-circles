import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
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
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
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

  const skipBack = () => {
    if (videoRef.current) {
      videoRef.current.currentTime -= 10;
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime += 10;
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div
      className="relative w-full aspect-video bg-black group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        muted={false}
        playsInline
      />
      {(showControls || loading) && (
        <div className="absolute bottom-0 left-0 w-full bg-black/50 text-white p-4 flex flex-col transition-opacity duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button onClick={togglePlay} className="hover:opacity-70">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />
                )}
              </button>
              <button onClick={skipBack} className="hover:opacity-70">
                <SkipBack className="h-5 w-5" />
              </button>
              <button onClick={skipForward} className="hover:opacity-70">
                <SkipForward className="h-5 w-5" />
              </button>
              <div className="text-sm">
                <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="hover:opacity-70">
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20"
              />
              <button onClick={toggleFullScreen} className="hover:opacity-70">
                {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="hover:opacity-70"
                >
                  <Settings className="h-5 w-5" />
                </button>
                {isSettingsOpen && (
                  <div className="absolute right-0 mt-2 w-32 bg-black border rounded-md shadow-md z-10">
                    <button
                      onClick={() => handlePlaybackRateChange(0.5)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${playbackRate === 0.5 ? 'bg-gray-700' : ''
                        }`}
                    >
                      0.5x
                    </button>
                    <button
                      onClick={() => handlePlaybackRateChange(1)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${playbackRate === 1 ? 'bg-gray-700' : ''
                        }`}
                    >
                      1x
                    </button>
                    <button
                      onClick={() => handlePlaybackRateChange(1.5)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${playbackRate === 1.5 ? 'bg-gray-700' : ''
                        }`}
                    >
                      1.5x
                    </button>
                    <button
                      onClick={() => handlePlaybackRateChange(2)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${playbackRate === 2 ? 'bg-gray-700' : ''
                        }`}
                    >
                      2x
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max={duration}
            step="0.1"
            value={currentTime}
            onChange={handleTimeSliderChange}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};
