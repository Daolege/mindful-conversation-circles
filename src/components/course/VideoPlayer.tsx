
import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  Maximize,
  Minimize,
  Settings,
  Volume2,
  VolumeX,
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
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

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
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Handle fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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
    if (!containerRef.current) return;
    
    if (!isFullScreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).mozRequestFullScreen) {
        (containerRef.current as any).mozRequestFullScreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen();
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

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoRef.current.muted = newMuted;
      
      if (newMuted) {
        videoRef.current.volume = 0;
        setVolume(0);
      } else {
        videoRef.current.volume = 1;
        setVolume(1);
      }
    }
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
  
  // Video thumbnail preview on hover (placeholder for future improvement)
  const getPreviewTimePosition = () => {
    if (hoverProgress === null) return 0;
    return (hoverProgress / 100) * duration;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black overflow-hidden rounded-xl group"
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
      
      {/* Large play button overlay when paused and not showing controls */}
      {!isPlaying && !showControls && (
        <div className="absolute inset-0 flex items-center justify-center cursor-pointer z-10">
          <div className="bg-black/30 backdrop-blur-md rounded-full p-6 shadow-lg flex items-center justify-center transition-transform duration-300 ease-in-out transform hover:scale-110">
            <Play className="h-16 w-16 text-white fill-white/10" strokeWidth={1.5} />
          </div>
        </div>
      )}
      
      {/* Video controls overlay */}
      {(showControls || loading) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-20 pb-2 px-4 animate-fade-in duration-300 video-controls z-20">
          <div 
            ref={progressBarRef}
            className="relative h-2.5 bg-white/20 cursor-pointer rounded-full mb-3 overflow-hidden group/progress"
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => setHoverProgress(null)}
          >
            {/* Progress bar background */}
            <div className="absolute inset-0 rounded-full"></div>
            
            {/* Current progress */}
            <div 
              className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            
            {/* Hover preview */}
            {hoverProgress !== null && (
              <>
                <div 
                  className="absolute top-0 h-full bg-white/50 rounded-full"
                  style={{ width: `${hoverProgress}%` }}
                />
                <div 
                  ref={progressTooltipRef}
                  className="absolute -top-9 transform -translate-x-1/2 bg-black/80 backdrop-blur-md text-white shadow-xl rounded-md px-2.5 py-1.5 text-xs font-medium z-30"
                >
                  {getHoveredTime()}
                </div>
              </>
            )}
            
            {/* Progress indicator */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-xl transition-all duration-100 opacity-0 scale-0 group-hover/progress:opacity-100 group-hover/progress:scale-100"
              style={{ left: `${(currentTime / duration) * 100}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }} 
                variant="ghost" 
                className="p-1 h-auto rounded-full hover:bg-white/10 transition-all duration-200"
              >
                {loading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  isPlaying ? 
                    <Pause className="h-6 w-6 text-white" /> : 
                    <Play className="h-6 w-6 text-white" />
                )}
              </Button>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  variant="ghost"
                  className="p-1 h-auto rounded-full hover:bg-white/10 hidden sm:block"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5 text-white" />
                  ) : (
                    <Volume2 className="h-5 w-5 text-white" />
                  )}
                </Button>
                
                <div className="hidden sm:block w-24">
                  <Slider
                    defaultValue={[1]}
                    value={[volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    className="h-1"
                  />
                </div>
              </div>
              
              <div className="text-sm font-medium text-white/90">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <DropdownMenu open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      className="p-1 h-auto rounded-full hover:bg-white/10"
                    >
                      <Settings className="h-5 w-5 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="bg-black/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-lg min-w-[140px]"
                  >
                    <div className="py-2 px-3 text-sm font-medium text-white/80 border-b border-white/10">播放速度</div>
                    {[1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 3.0].map((rate) => (
                      <DropdownMenuItem
                        key={rate}
                        className={`px-3 py-2 text-sm cursor-pointer text-white/80 ${
                          playbackRate === rate 
                            ? 'bg-white/10 text-white font-medium' 
                            : 'hover:bg-white/5'
                        }`}
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
                className="p-1 h-auto rounded-full hover:bg-white/10"
              >
                {isFullScreen ? 
                  <Minimize className="h-5 w-5 text-white" /> : 
                  <Maximize className="h-5 w-5 text-white" />
                }
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Current playback rate indicator */}
      {showControls && playbackRate !== 1.0 && (
        <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-xs font-medium text-white">
          {playbackRate}x
        </div>
      )}
      
      {/* Video title - show when controls are visible */}
      {showControls && title && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent px-4 py-3 text-white font-medium">
          {title}
        </div>
      )}
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-30">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      )}
    </div>
  );
};
