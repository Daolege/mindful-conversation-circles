
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveSection } from '@/lib/services/sectionService';
import { CourseSection } from '@/lib/types/course-new';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface AddSectionFormProps {
  courseId: number;
  position: number;
  onCancel: () => void;
  onSectionAdded: (section: CourseSection) => void;
  isVisible: boolean;
}

export const AddSectionForm: React.FC<AddSectionFormProps> = ({ 
  courseId, 
  position, 
  onCancel, 
  onSectionAdded,
  isVisible 
}) => {
  const [title, setTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsAdding(true);
    try {
      // First check if we have a valid course ID
      if (!courseId || courseId <= 0) {
        toast.error("课程ID无效，请确保先保存课程基本信息");
        return;
      }
      
      // Create section in database
      const { data, error } = await saveSection({
        course_id: courseId,
        title: title.trim(),
        position
      });

      if (error) {
        toast.error(`创建章节失败: ${error.message}`);
        return;
      }
      
      if (data && data.length > 0) {
        const newSection = data[0];
        // Update local state with the new section
        onSectionAdded(newSection);
        toast.success("章节添加成功");
        // Reset form
        setTitle('');
      } else {
        toast.error("创建章节失败：未返回数据");
      }
    } catch (err: any) {
      toast.error(`添加章节出错: ${err.message}`);
      console.error("添加章节时出错:", err);
    } finally {
      setIsAdding(false);
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <form onSubmit={handleSubmit} className="border rounded-md p-4 bg-gray-50 mb-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="section-title" className="block text-sm font-medium mb-1">
            章节标题
          </label>
          <Input
            id="section-title"
            placeholder="输入章节标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline"
            onClick={onCancel}
            disabled={isAdding}
          >
            取消
          </Button>
          <Button 
            type="submit"
            disabled={!title.trim() || isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                添加中...
              </>
            ) : '添加章节'}
          </Button>
        </div>
      </div>
    </form>
  );
};
