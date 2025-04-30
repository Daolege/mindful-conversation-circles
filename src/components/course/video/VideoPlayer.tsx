
import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/authHooks';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  videoUrl: string;
  courseId: number;
  lectureId: string;
  onComplete?: () => void;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  courseId,
  lectureId,
  onComplete,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(true);
  const [watchPercentage, setWatchPercentage] = useState(0);
  const { user } = useAuth();
  const [completionThreshold, setCompletionThreshold] = useState(80); // 默认80%
  
  // 记录播放进度的阈值（毫秒）
  const PROGRESS_UPDATE_THRESHOLD = 5000;
  let lastProgressUpdate = 0;

  useEffect(() => {
    loadVideoProgress();
    loadCompletionThreshold();
  }, [videoUrl, courseId, lectureId]);

  const loadCompletionThreshold = async () => {
    try {
      const { data, error } = await supabase
        .from('video_completion_settings')
        .select('completion_threshold')
        .single();

      if (error) throw error;
      if (data) {
        // 确保将阈值转换为数字并设置
        setCompletionThreshold(Number(data.completion_threshold));
      }
    } catch (err) {
      console.error('Error loading completion threshold:', err);
    }
  };

  const loadVideoProgress = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('video_progress')
        .select('last_position, watch_percentage, watch_duration, total_duration')
        .match({ user_id: user.id, course_id: courseId, lecture_id: lectureId })
        .single();

      if (error) throw error;

      if (data) {
        if (videoRef.current) {
          videoRef.current.currentTime = data.last_position;
        }
        setWatchPercentage(data.watch_percentage);
      }
    } catch (err) {
      console.error('Error loading video progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (currentTime: number, duration: number) => {
    if (!user?.id) return;

    const now = Date.now();
    if (now - lastProgressUpdate < PROGRESS_UPDATE_THRESHOLD) return;
    lastProgressUpdate = now;

    const percentage = Math.floor((currentTime / duration) * 100);
    const completed = percentage >= completionThreshold;

    try {
      const { error } = await supabase
        .from('video_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          lecture_id: lectureId,
          last_position: currentTime,
          watch_percentage: percentage,
          watch_duration: Math.floor(currentTime),
          total_duration: Math.floor(duration),
          completed,
          watch_count: completed ? 1 : 0
        }, {
          onConflict: 'user_id,lecture_id,course_id'
        });

      if (error) throw error;

      setWatchPercentage(percentage);
      if (completed && onComplete) {
        toast.success(`恭喜! 您已完成该视频 ${completionThreshold}% 的学习`);
        onComplete();
      }
    } catch (err) {
      console.error('Error updating video progress:', err);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    updateProgress(video.currentTime, video.duration);
  };

  return (
    <div className={cn("relative", className)}>
      <video
        ref={videoRef}
        className="w-full aspect-video"
        controls
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={() => setLoading(false)}
        src={videoUrl}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-white">加载中...</div>
        </div>
      )}
      
      {watchPercentage > 0 && (
        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm">
          已观看 {watchPercentage}%
        </div>
      )}
    </div>
  );
};
