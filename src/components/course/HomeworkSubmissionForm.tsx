
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/authHooks';
import { submitHomework, uploadHomeworkFile } from '@/lib/services/homeworkService';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { FileInput } from '@/components/course/FileInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, X } from 'lucide-react';
import { dismissAllToasts } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import RichTextEditor from '@/components/admin/course/outline/lectures/RichTextEditor'; // 修改为默认导入

interface HomeworkSubmissionFormProps {
  homework: {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    options?: any;
    lecture_id: string;
    course_id: number;
  };
  courseId: string | number; 
  lectureId: string;
  onSubmitSuccess: () => void;
  onCancel?: () => void;
}

export const HomeworkSubmissionForm: React.FC<HomeworkSubmissionFormProps> = ({
  homework,
  courseId,
  lectureId,
  onSubmitSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [answer, setAnswer] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  
  // Clear toasts when component unmounts
  useEffect(() => {
    return () => {
      dismissAllToasts();
    };
  }, []);
  
  const handleChoiceChange = (choice: string) => {
    if (homework.type === 'single_choice') {
      setSelectedChoices([choice]);
    } else {
      // For multiple choice, toggle the selection
      setSelectedChoices(prev => 
        prev.includes(choice) 
          ? prev.filter(c => c !== choice) 
          : [...prev, choice]
      );
    }
  };
  
  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };
  
  const handleRichTextChange = (content) => {
    setAnswer(content);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('请先登录');
      return;
    }
    
    try {
      // Clear any existing toasts
      dismissAllToasts();
      
      setSubmitting(true);
      
      // Format the answer based on homework type
      let finalAnswer = answer;
      let finalFileUrl = fileUrl;
      
      // Handle file upload if needed
      if (selectedFile) {
        finalFileUrl = await uploadHomeworkFile(selectedFile, user.id, homework.id);
        if (!finalFileUrl) {
          toast.error('文件上传失败');
          setSubmitting(false);
          return;
        }
      }
      
      // For choice-based homework, use the selected choices as the answer
      if (homework.type === 'single_choice' || homework.type === 'multiple_choice') {
        finalAnswer = JSON.stringify(selectedChoices);
      }
      
      // Ensure courseId is a number
      const numericCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId;
      
      const submission = {
        user_id: user.id,
        homework_id: homework.id,
        lecture_id: lectureId,
        course_id: numericCourseId,
        answer: finalAnswer,
        file_url: finalFileUrl
      };
      
      console.log('Submitting homework:', submission);
      
      const success = await submitHomework(submission);
      
      if (success) {
        toast.success('作业提交成功');
        onSubmitSuccess();
      } else {
        toast.error('作业提交失败');
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
      toast.error('作业提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };
  
  const renderChoiceOptions = () => {
    if (!homework.options || !homework.options.choices || !Array.isArray(homework.options.choices)) {
      return null;
    }
    
    return (
      <div className="space-y-3">
        {homework.type === 'single_choice' && (
          <p className="text-sm text-gray-500 mb-2">请选择一个选项：</p>
        )}
        {homework.type === 'multiple_choice' && (
          <p className="text-sm text-gray-500 mb-2">可选择多个选项：</p>
        )}
        
        <div className="grid grid-cols-1 gap-2">
          {homework.options.choices.map((choice: string, index: number) => (
            <Card 
              key={`${homework.id}-${index}-${choice.substring(0, 10)}`}
              className={`
                border transition-all duration-300 hover:bg-gray-50 cursor-pointer p-3
                ${selectedChoices.includes(choice) ? 'border-gray-400 bg-gray-50 shadow-md' : 'border-gray-200'}
              `}
              onClick={(e) => {
                e.preventDefault(); // Prevent the default form behavior that causes page jumps
                handleChoiceChange(choice); // Directly update the selection state
              }}
              data-choice-index={index}
              data-choice-text={choice.substring(0, 20)}
            >
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`choice-${homework.id}-${index}`}
                  checked={selectedChoices.includes(choice)}
                  onCheckedChange={() => handleChoiceChange(choice)}
                  className="h-4 w-4"
                  onClick={(e) => {
                    // This prevents the event from triggering the Card's onClick handler
                    e.stopPropagation();
                  }}
                />
                <Label 
                  htmlFor={`choice-${homework.id}-${index}`}
                  className="text-sm cursor-pointer flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {choice}
                </Label>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 relative">
      {/* 内容区域，添加底部内边距为按钮栏腾出空间 */}
      <div className="pb-16 overflow-y-auto max-h-[60vh]">
        {/* Display homework description if available */}
        {homework.description && (
          <div 
            className="text-sm bg-gray-50 p-4 rounded-md shadow-inner mb-4" 
            dangerouslySetInnerHTML={{ __html: homework.description }}
          />
        )}
        
        {/* Handle different homework types */}
        {(homework.type === 'single_choice' || homework.type === 'multiple_choice') ? (
          renderChoiceOptions()
        ) : homework.type === 'file' ? (
          <div className="space-y-3">
            <Label>上传文件</Label>
            <FileInput onChange={handleFileChange} />
            <p className="text-xs text-gray-500">支持常见文档和图片格式</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Label htmlFor="answer">你的答案</Label>
            {/* 使用富文本编辑器替代普通文本框 */}
            <div className="min-h-[150px] border rounded-md overflow-hidden">
              <RichTextEditor 
                initialContent={answer}
                onChange={handleRichTextChange}
                placeholder="请输入你的答案..."
                className="min-h-[150px]"
              />
            </div>
          </div>
        )}
      </div>
      
      {/* 固定底部按钮栏，确保它始终在底部且不会被内容遮挡 */}
      <div className="flex justify-end gap-2 absolute bottom-0 left-0 right-0 bg-white p-4 border-t shadow-sm z-10">
        {onCancel && (
          <Button 
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={submitting}
            className="text-gray-700 border-gray-300"
          >
            <X className="h-4 w-4 mr-1" />
            取消
          </Button>
        )}
        
        <Button 
          type="submit"
          size="sm"
          disabled={submitting}
          className="bg-gray-800 hover:bg-gray-900 text-white"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              提交中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-1" />
              提交作业
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
