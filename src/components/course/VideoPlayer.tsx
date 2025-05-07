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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTooltipRef = useRef<HTMLDivElement>(null);
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

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = duration * clickPosition;
    
    if (newTime >= 0 && newTime <= duration) {
      setCurrentTime(newTime);
      videoRef.current.currentTime = newTime;
    }
  };
  
  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const hoverPosition = (e.clientX - rect.left) / rect.width;
    setHoverProgress(hoverPosition * 100);
    
    // Update tooltip position if available
    if (progressTooltipRef.current) {
      const tooltipWidth = progressTooltipRef.current.offsetWidth;
      let tooltipPosition = e.clientX - rect.left - (tooltipWidth / 2);
      
      // Keep tooltip within progress bar bounds
      if (tooltipPosition < 0) tooltipPosition = 0;
      if (tooltipPosition + tooltipWidth > rect.width) tooltipPosition = rect.width - tooltipWidth;
      
      progressTooltipRef.current.style.left = `${tooltipPosition}px`;
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
        if (!isSettingsOpen && isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    }
    
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [showControls, isSettingsOpen, isPlaying]);

  const getHoveredTime = () => {
    if (hoverProgress === null || !duration) return "0:00";
    return formatTime((hoverProgress / 100) * duration);
  };

  return (
    <div
      className="relative w-full aspect-video bg-white shadow-lg rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => !isSettingsOpen && isPlaying && setShowControls(false)}
      onClick={(e) => {
        // Prevent clicks on controls from toggling play
        if ((e.target as HTMLElement).closest('.video-controls')) return;
        togglePlay();
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain"
        playsInline
      />
      
      {!isPlaying && !showControls && (
        <div className="absolute inset-0 flex items-center justify-center cursor-pointer">
          <div className="rounded-full bg-white/30 p-5 backdrop-blur-sm transition-all duration-200 hover:bg-white/40 hover:scale-105">
            <Play className="h-14 w-14 text-gray-800 drop-shadow-md" />
          </div>
        </div>
      )}
      
      {(showControls || loading) && (
        <div className="absolute bottom-0 left-0 w-full bg-white/30 backdrop-blur-md text-gray-800 animate-fade-in transition-all duration-300 video-controls">
          <div 
            ref={progressBarRef}
            className="relative h-2 bg-gray-300 cursor-pointer"
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => setHoverProgress(null)}
          >
            {/* Progress bar */}
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            
            {/* Hover preview */}
            {hoverProgress !== null && (
              <>
                <div 
                  className="absolute top-0 h-full bg-blue-300 opacity-50"
                  style={{ width: `${hoverProgress}%` }}
                />
                <div 
                  ref={progressTooltipRef}
                  className="absolute -top-8 transform -translate-x-1/2 bg-white shadow-md rounded px-2 py-1 text-xs font-medium"
                >
                  {getHoveredTime()}
                </div>
              </>
            )}
            
            {/* Progress indicator */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md transition-all duration-100"
              style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }} 
                variant="ghost" 
                className="p-1 h-auto rounded-full hover:bg-black/10 transition-all duration-200"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-gray-800" />
                ) : (
                  isPlaying ? 
                    <Pause className="h-6 w-6 text-gray-800" /> : 
                    <Play className="h-6 w-6 text-gray-800" />
                )}
              </Button>
              <div className="text-sm font-medium text-gray-800">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <DropdownMenu open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      className="p-1 h-auto rounded-full hover:bg-black/10"
                    >
                      <Settings className="h-6 w-6 text-gray-800" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-lg rounded-md min-w-[140px]">
                    <div className="py-2 px-3 text-sm font-medium border-b border-gray-200">播放速度</div>
                    {[1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 3.0].map((rate) => (
                      <DropdownMenuItem
                        key={rate}
                        className={`px-3 py-2 text-sm cursor-pointer ${playbackRate === rate ? 'bg-blue-50 text-blue-600 font-medium' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaybackRateChange(rate);
                        }}
                      >
                        {rate}x
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullScreen();
                }} 
                variant="ghost" 
                className="p-1 h-auto rounded-full hover:bg-black/10"
              >
                {isFullScreen ? 
                  <Minimize className="h-6 w-6 text-gray-800" /> : 
                  <Maximize className="h-6 w-6 text-gray-800" />
                }
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Current playback rate indicator */}
      {showControls && playbackRate !== 1.0 && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-white/80 backdrop-blur-sm rounded text-sm font-medium text-gray-800">
          {playbackRate}x
        </div>
      )}
    </div>
  );
};
