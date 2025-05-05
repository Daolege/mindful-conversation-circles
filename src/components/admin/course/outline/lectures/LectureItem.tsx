
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  GripVertical, 
  Video,
  BookOpen
} from 'lucide-react';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { HomeworkPanel } from './HomeworkPanel';
import VideoPanel from './VideoPanel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface LectureItemProps {
  id: string;
  title: string;
  position: number;
  sectionId: string;
  isFree?: boolean;
  duration?: string | null;
  showHomeworkSettings?: boolean;
  requiresHomeworkCompletion?: boolean;
  requiresSequentialLearning?: boolean;
  videoData?: any | null;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
  dragHandleProps: any;
  courseId?: number;
  onHomeworkRequirementChange?: (requiresHomework: boolean) => void;
  onSequentialLearningChange?: (requiresSequential: boolean) => void;
}

export const LectureItem = ({
  id,
  title,
  position,
  sectionId,
  isFree = false,
  duration,
  showHomeworkSettings = false,
  requiresHomeworkCompletion = false,
  requiresSequentialLearning = false,
  videoData = null,
  onUpdate,
  onDelete,
  dragHandleProps,
  courseId,
  onHomeworkRequirementChange,
  onSequentialLearningChange
}: LectureItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const [isVideoUploaderOpen, setIsVideoUploaderOpen] = useState(false);
  const [showHomeworkPanel, setShowHomeworkPanel] = useState(false);
  const [localIsFree, setLocalIsFree] = useState(isFree);
  const [localVideoData, setLocalVideoData] = useState(videoData);
  const [hasHomework, setHasHomework] = useState(false);
  
  // 使用useEffect确保localIsFree与props同步
  useEffect(() => {
    setLocalIsFree(isFree);
  }, [isFree]);

  useEffect(() => {
    setLocalVideoData(videoData);
  }, [videoData]);
  
  // 监测是否有作业数据的简单方法 - 实际应用中可能需要更详细的检查
  useEffect(() => {
    // 这里需要根据您的数据结构编写实际的检查逻辑
    // 暂时使用简单的setTimeout模拟异步检查
    const checkForHomework = async () => {
      setTimeout(() => {
        // 这里仅作示例，实际情况下您需要根据真实的数据结构来判断
        // 例如检查数据库或本地状态中是否存在与此课时相关的作业
        const hasHomeworkData = Math.random() > 0.5; // 模拟50%概率有作业
        setHasHomework(hasHomeworkData);
      }, 500);
    };
    
    checkForHomework();
  }, [id]);
  
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition,
    isDragging
  } = useSortable({
    id: dragHandleProps.id,
    data: dragHandleProps.data
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1
  };

  const handleSaveTitle = () => {
    if (editedTitle.trim() !== "") {
      onUpdate({ title: editedTitle });
      setIsEditing(false);
    } else {
      toast.error('课时标题不能为空');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditedTitle(title);
      setIsEditing(false);
    }
  };
  
  const handleIsFreeChange = (checked: boolean) => {
    setLocalIsFree(checked);
    onUpdate({ is_free: checked });
  };

  const toggleHomeworkPanel = () => {
    setShowHomeworkPanel(!showHomeworkPanel);
    setIsVideoUploaderOpen(false); // 关闭视频上传器
  };

  const toggleVideoUploader = () => {
    setIsVideoUploaderOpen(!isVideoUploaderOpen);
    setShowHomeworkPanel(false); // 关闭作业面板
  };

  const handleVideoUpdate = (newVideoData) => {
    setLocalVideoData(newVideoData);
    onUpdate({ video_data: newVideoData });
  };

  const hasVideo = !!localVideoData;

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "border border-gray-200 mb-2 transition-colors",
        isDragging ? "shadow-lg ring-2 ring-primary/20" : ""
      )}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          {/* 左侧拖拽控制和标题 */}
          <div className="flex items-center flex-grow">
            <div 
              className="mr-2 cursor-grab p-1 hover:bg-gray-100 rounded text-gray-500"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={18} />
            </div>
            
            {isEditing ? (
              <div className="flex-grow">
                <Input 
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-8"
                  autoFocus
                />
              </div>
            ) : (
              <div className="flex-grow">
                <div className="font-medium">
                  <span className="text-sm text-gray-500 mr-1">{position + 1}.</span>
                  {title}
                </div>
              </div>
            )}
          </div>
          
          {/* 右侧操作按钮 */}
          <div className="flex items-center gap-1">
            {!isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={toggleVideoUploader} 
                  className="h-8 px-2"
                >
                  <Video 
                    className={cn(
                      "h-4 w-4 mr-1",
                      hasVideo ? "fill-[#262626] text-[#262626]" : ""
                    )} 
                  />
                  {hasVideo ? "视频已传" : "上传视频"}
                </Button>

                <Button variant="outline" size="sm" onClick={toggleHomeworkPanel} className="h-8 px-2">
                  <BookOpen 
                    className={cn(
                      "h-4 w-4 mr-1",
                      hasHomework ? "fill-[#262626] text-[#262626]" : ""
                    )} 
                  />
                  作业
                </Button>
                
                <div className="flex items-center ml-2">
                  <Checkbox
                    id={`lecture-free-${id}`}
                    checked={localIsFree}
                    onCheckedChange={handleIsFreeChange}
                    className="mr-1"
                  />
                  <label 
                    htmlFor={`lecture-free-${id}`}
                    className="text-xs cursor-pointer"
                  >
                    免费
                  </label>
                </div>
                
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onDelete}
                  className="h-8 w-8 text-[#555555] hover:text-[#333333] hover:bg-gray-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSaveTitle}
                  className="h-8 w-8"
                >
                  <Save className="h-4 w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditedTitle(title);
                    setIsEditing(false);
                  }}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* 视频上传面板（可折叠） */}
      <Collapsible open={isVideoUploaderOpen} onOpenChange={setIsVideoUploaderOpen}>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-3">
            <VideoPanel 
              lectureId={id}
              courseId={courseId}
              initialVideoData={localVideoData}
              onVideoUpdate={handleVideoUpdate}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
      
      {/* 作业面板（可折叠） - 移除了"学习此课时需要完成作业"复选框 */}
      <Collapsible open={showHomeworkPanel} onOpenChange={setShowHomeworkPanel}>
        <CollapsibleContent>
          <CardContent className="pt-0 pb-3">
            <HomeworkPanel 
              lectureId={id}
              courseId={courseId}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
