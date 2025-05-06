
import React, { useState, useEffect, useCallback, memo } from 'react';
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
import RichTextEditor from '@/components/admin/course/outline/lectures/RichTextEditor';

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
  
  // Safe choice change handler using functional updates
  const handleChoiceChange = useCallback((choice: string) => {
    // Use a functional update to avoid dependency on selectedChoices
    setSelectedChoices(prevChoices => {
      console.log(`Choice changed: ${choice}, current selection:`, prevChoices);
      
      if (homework.type === 'single_choice') {
        // For single choice, always return an array with just this choice
        return [choice];
      } else {
        // For multiple choice, toggle the selection
        return prevChoices.includes(choice) 
          ? prevChoices.filter(c => c !== choice) 
          : [...prevChoices, choice];
      }
    });
  }, [homework.type]); // Only depend on homework.type, not on selectedChoices
  
  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };
  
  const handleRichTextChange = (content: string) => {
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
  
  // Completely refactored render function for choice options with improved event handling
  const renderChoiceOptions = useCallback(() => {
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
        
        <div className="grid grid-cols-1 gap-2" data-homework-choices="container">
          {homework.options.choices.map((choice: string, index: number) => {
            // Create a stable unique ID for this choice
            const choiceId = `choice-${homework.id}-${index}`;
            const isSelected = selectedChoices.includes(choice);
            
            return (
              <ChoiceOptionCard 
                key={`choice-card-${homework.id}-${index}`}
                choiceId={choiceId}
                choice={choice}
                isSelected={isSelected}
                onSelect={() => handleChoiceChange(choice)}
                index={index}
              />
            );
          })}
        </div>
      </div>
    );
  }, [homework.id, homework.options, homework.type, selectedChoices, handleChoiceChange]);
  
  // Memoize the form content for better performance
  const formContent = useCallback(() => {
    if ((homework.type === 'single_choice' || homework.type === 'multiple_choice')) {
      return renderChoiceOptions();
    } else if (homework.type === 'file') {
      return (
        <div className="space-y-3">
          <Label>上传文件</Label>
          <FileInput onChange={handleFileChange} />
          <p className="text-xs text-gray-500">支持常见文档和图片格式</p>
        </div>
      );
    } else {
      return (
        <div className="space-y-3">
          <Label htmlFor="answer">你的答案</Label>
          <div className="min-h-[150px] border rounded-md overflow-hidden">
            <RichTextEditor 
              initialContent={answer}
              onChange={handleRichTextChange}
              placeholder="请输入你的答案..."
              className="min-h-[150px]"
            />
          </div>
        </div>
      );
    }
  }, [homework.type, answer, renderChoiceOptions]);
  
  return (
    <form 
      onSubmit={(e) => {
        // Ensure the form submission is properly handled
        handleSubmit(e);
      }} 
      className="space-y-4 p-4 relative"
      data-homework-type={homework.type}
      data-homework-id={homework.id}
    >
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
        {formContent()}
      </div>
      
      {/* 固定底部按钮栏，确保它始终在底部且不会被内容遮挡 */}
      <div className="flex justify-end gap-2 absolute bottom-0 left-0 right-0 bg-white p-4 border-t shadow-sm z-10">
        {onCancel && (
          <Button 
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault(); // Prevent default button behavior
              if (onCancel) onCancel();
            }}
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

// Extracted choice option card component to improve isolation and prevent event bubbling issues
const ChoiceOptionCard = memo(({ 
  choiceId, 
  choice, 
  isSelected, 
  onSelect,
  index
}: { 
  choiceId: string;
  choice: string;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
}) => {
  // Handle card click with proper event prevention
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
  };
  
  // Handle checkbox click with proper event prevention
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };
  
  // Handle label click with proper event prevention
  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <Card 
      className={`
        border transition-all duration-300 hover:bg-gray-50 cursor-pointer p-3
        ${isSelected ? 'border-gray-400 bg-gray-50 shadow-md' : 'border-gray-200'}
      `}
      onClick={handleCardClick}
      data-choice-index={index}
      data-choice-text={choice.substring(0, 20)}
      data-selected={isSelected ? 'true' : 'false'}
      data-testid={`choice-option-${index}`}
    >
      <div className="flex items-center space-x-2">
        <Checkbox 
          id={choiceId}
          checked={isSelected}
          onCheckedChange={() => {
            // This will only be triggered by keyboard/accessibility interactions
            // since we're handling click events separately
            onSelect();
          }}
          className="h-4 w-4"
          onClick={handleCheckboxClick}
          data-selected={isSelected ? 'true' : 'false'}
        />
        <Label 
          htmlFor={choiceId}
          className="text-sm cursor-pointer flex-1"
          onClick={handleLabelClick}
        >
          {choice}
        </Label>
      </div>
    </Card>
  );
});

ChoiceOptionCard.displayName = 'ChoiceOptionCard';
