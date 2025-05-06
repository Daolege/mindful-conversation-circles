
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/authHooks';
import { submitHomework, uploadHomeworkFile } from '@/lib/services/homeworkService';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { FileInput } from '@/components/course/FileInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, X } from 'lucide-react';

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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('请先登录');
      return;
    }
    
    try {
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
      
      // Submit the homework
      const success = await submitHomework({
        user_id: user.id,
        homework_id: homework.id,
        lecture_id: lectureId,
        course_id: numericCourseId,
        answer: finalAnswer,
        file_url: finalFileUrl
      });
      
      if (success) {
        // Reset form and notify parent
        setAnswer('');
        setSelectedFile(null);
        setFileUrl(null);
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
      toast.error('提交作业失败');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render different form based on homework type
  const renderForm = () => {
    switch (homework.type) {
      case 'file':
        return (
          <div className="space-y-4">
            <Label htmlFor="file-upload">上传文件</Label>
            <FileInput onChange={handleFileChange} />
            <div className="text-sm text-gray-500">
              支持上传各类文档、图片等文件
            </div>
          </div>
        );
        
      case 'single_choice':
      case 'multiple_choice':
        const choices = homework.options?.choices || [];
        return (
          <div className="space-y-4">
            <div className="font-medium">
              {homework.options?.question || '请选择答案'}
            </div>
            <div className="space-y-2">
              {choices.map((choice: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`choice-${index}`}
                    checked={selectedChoices.includes(choice)}
                    onCheckedChange={() => handleChoiceChange(choice)}
                  />
                  <Label htmlFor={`choice-${index}`} className="cursor-pointer">
                    {choice}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return (
          <div className="space-y-4">
            <Label htmlFor="answer">你的答案</Label>
            <Textarea
              id="answer"
              placeholder="请输入你的答案..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={6}
              className="resize-y"
            />
          </div>
        );
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      {homework.description && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-medium mb-2">作业描述</h3>
          <div dangerouslySetInnerHTML={{ __html: homework.description }} />
        </div>
      )}
      
      {renderForm()}
      
      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={submitting}
          >
            <X className="h-4 w-4 mr-2" />
            取消
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={submitting || (!answer && !selectedFile && selectedChoices.length === 0)}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              提交中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              提交作业
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
