
import React, { useState, useEffect } from 'react';
import { VideoUploader } from '@/components/course/video/VideoUploader';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Save, X, Trash2, RefreshCw } from 'lucide-react';
import { toast } from "sonner";

const VideoPanel = ({ 
  lectureId, 
  courseId,
  initialVideoData = null,
  onVideoUpdate = () => {},
}) => {
  const [videoData, setVideoData] = useState(initialVideoData || null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [videoName, setVideoName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (initialVideoData) {
      setVideoData(initialVideoData);
      setVideoName(initialVideoData.name || '');
    }
  }, [initialVideoData]);

  const handleUploadComplete = (url) => {
    // 模拟视频上传完成后的数据
    const newVideoData = {
      id: `video-${Date.now()}`,
      url,
      name: videoName || `视频文件-${new Date().toLocaleDateString()}`,
      uploaded_at: new Date().toISOString(),
      size: '未知大小', // 实际情况下应从上传响应获取
    };
    
    setVideoData(newVideoData);
    setVideoName(newVideoData.name);
    onVideoUpdate(newVideoData);
    
    // 模拟API调用成功
    toast.success('视频上传成功');
  };

  const handleUploadError = (error) => {
    toast.error('视频上传失败', {
      description: error.message
    });
  };

  const handleSaveVideoName = () => {
    if (!videoName.trim()) {
      toast.error('视频名称不能为空');
      return;
    }

    // 更新视频名称
    const updatedVideo = { ...videoData, name: videoName };
    setVideoData(updatedVideo);
    onVideoUpdate(updatedVideo);
    setIsEditingName(false);
    
    toast.success('视频名称已更新');
  };

  const handleDeleteVideo = () => {
    // 模拟删除视频
    setIsDeleting(true);
    
    setTimeout(() => {
      setVideoData(null);
      setVideoName('');
      onVideoUpdate(null);
      setIsDeleting(false);
      toast.success('视频已删除');
    }, 500);
  };

  const handleRefreshVideo = () => {
    // 模拟刷新视频数据
    setIsRefreshing(true);
    
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('视频数据已刷新');
    }, 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveVideoName();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setVideoName(videoData?.name || '');
    }
  };

  // 处理双击事件
  const handleDoubleClick = () => {
    if (!isEditingName && videoData) {
      setIsEditingName(true);
    }
  };

  // 处理失焦自动保存
  const handleBlur = () => {
    if (isEditingName) {
      handleSaveVideoName();
    }
  };

  return (
    <Card className="border border-gray-200 mb-4">
      <CardContent className="p-4">
        {!videoData ? (
          <div className="space-y-4">
            <div className="text-sm font-medium mb-2">上传视频文件</div>
            <div className="text-xs text-gray-500 mb-4">
              支持MP4, WebM等浏览器可播放的格式，最大10G
            </div>
            
            <VideoUploader
              lectureId={lectureId}
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="font-medium">视频文件</div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshVideo}
                  disabled={isRefreshing}
                  className="h-8 px-2"
                >
                  {isRefreshing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleDeleteVideo}
                  disabled={isDeleting}
                  className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  {isDeleting ? (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      删除中
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Trash2 className="h-4 w-4" />
                      删除视频
                    </span>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                {isEditingName ? (
                  <div className="flex-grow flex items-center gap-2">
                    <Input
                      value={videoName}
                      onChange={(e) => setVideoName(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onBlur={handleBlur}
                      className="h-8"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleSaveVideoName}
                      className="h-8 w-8"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setIsEditingName(false);
                        setVideoName(videoData.name);
                      }}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span 
                      className="text-sm font-medium cursor-pointer"
                      onDoubleClick={handleDoubleClick}
                    >
                      {videoData.name}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setIsEditingName(true)}
                      className="h-7 w-7"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  上传于: {new Date(videoData.uploaded_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VideoPanel;
