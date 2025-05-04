
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Loader2, X } from 'lucide-react';
import { uploadLectureVideo } from '@/lib/services/lectureService';

interface VideoUploaderProps {
  lectureId: string;
  onUploadComplete: (url: string) => void;
  onUploadError: (error: Error) => void;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({
  lectureId,
  onUploadComplete,
  onUploadError
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFileName(null);
      return;
    }

    // Set the selected filename
    setSelectedFileName(file.name);

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/avi'];
    if (!validTypes.includes(file.type)) {
      toast.error('不支持的文件格式', {
        description: '请上传 MP4、WebM 或 AVI 格式的视频'
      });
      setSelectedFileName(null);
      return;
    }

    setUploading(true);
    try {
      const { data, error } = await uploadLectureVideo(
        lectureId,
        file,
        (progress) => setProgress(progress)
      );

      if (error) throw error;
      if (data?.url) {
        onUploadComplete(data.url);
        toast.success('视频上传成功');
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      onUploadError(err);
      toast.error('上传失败', {
        description: err.message
      });
      setSelectedFileName(null);
    } finally {
      setUploading(false);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const clearSelectedFile = () => {
    setSelectedFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/avi"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={uploading ? "outline" : "default"}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              上传中 {progress}%
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              选择视频文件
            </div>
          )}
        </Button>
        
        {selectedFileName && (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md">
            <span className="text-sm text-gray-600 truncate max-w-[200px]">
              {selectedFileName}
            </span>
            {!uploading && (
              <button 
                onClick={clearSelectedFile}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

