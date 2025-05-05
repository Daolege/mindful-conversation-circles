
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/authHooks";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface HomeworkSubmissionFormProps {
  homework: {
    id: string;
    title: string;
    type: 'single_choice' | 'multiple_choice' | 'fill_blank';
    options: any;
    image_url: string | null;
    lecture_id: string;
  };
  courseId: string; // Add courseId prop to interface
  lectureId: string; // Add lectureId prop to interface
  onSubmitSuccess: () => void;
  onCancel: () => void;
}

export const HomeworkSubmissionForm = ({ homework, courseId, lectureId, onSubmitSuccess, onCancel }: HomeworkSubmissionFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [singleChoiceAnswer, setSingleChoiceAnswer] = useState<string | null>(null);
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState<string[]>([]);
  const [textAnswer, setTextAnswer] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    console.log('Current singleChoiceAnswer:', singleChoiceAnswer);
  }, [singleChoiceAnswer]);

  useEffect(() => {
    let valid = false;
    
    if (homework.type === 'single_choice') {
      valid = singleChoiceAnswer !== null && singleChoiceAnswer !== '';
    } else if (homework.type === 'multiple_choice') {
      valid = multipleChoiceAnswers.length > 0;
    } else if (homework.type === 'fill_blank') {
      valid = textAnswer.trim().length > 0;
    }
    
    setIsFormValid(valid);
  }, [singleChoiceAnswer, multipleChoiceAnswers, textAnswer, homework.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user?.id) {
      toast.error('您需要登录才能提交作业');
      return;
    }
    
    setIsSubmitting(true);
    let fileUrl = null;
    
    try {
      if (selectedFile && homework.type === 'fill_blank') {
        setIsUploading(true);
        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${user.id}/${homework.id}/${Math.random()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('homework-submissions')
          .upload(filePath, selectedFile);
          
        if (uploadError) {
          throw uploadError;
        }
        
        fileUrl = data.path;
        setIsUploading(false);
      }
      
      let answer: string | null = null;
      
      if (homework.type === 'single_choice') {
        answer = singleChoiceAnswer;
      } else if (homework.type === 'multiple_choice') {
        answer = JSON.stringify(multipleChoiceAnswers);
      } else if (homework.type === 'fill_blank') {
        answer = textAnswer;
      }
      
      // 使用通过props传入的courseId，而不是从URL解析
      const numericCourseId = parseInt(courseId);
      
      if (!numericCourseId || isNaN(numericCourseId)) {
        console.error('无效的课程ID', courseId);
        throw new Error('无效的课程ID');
      } else {
        console.log('使用传入的课程ID:', numericCourseId);
      }
      
      const { error } = await supabase
        .from('homework_submissions')
        .insert([
          {
            user_id: user.id,
            homework_id: homework.id,
            course_id: numericCourseId,
            lecture_id: lectureId, // 使用传入的lectureId
            answer: answer,
            file_url: fileUrl
          }
        ]);
        
      if (error) {
        throw error;
      }
      
      toast.success('作业提交成功');
      onSubmitSuccess();
    } catch (error: any) {
      console.error('Error submitting homework:', error);
      toast.error('提交作业失败: ' + (error.message || '未知错误'));
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleSingleChoiceClick = (choice: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`单选选项点击: ${choice}`);
    setSingleChoiceAnswer(choice);
  };

  const handleMultipleChoiceChange = (choice: string) => {
    setMultipleChoiceAnswers(prev => {
      if (prev.includes(choice)) {
        return prev.filter(item => item !== choice);
      } 
      else {
        return [...prev, choice];
      }
    });
  };

  const renderFormByType = () => {
    switch (homework.type) {
      case 'single_choice':
        return (
          <div className="space-y-3">
            {homework.options?.choices?.map((choice: string, index: number) => {
              const isSelected = singleChoiceAnswer === choice;
              return (
                <div
                  key={index}
                  onClick={(e) => handleSingleChoiceClick(choice, e)}
                  className={`flex items-center space-x-2 p-4 border rounded-md cursor-pointer transition-all 
                    ${isSelected 
                      ? 'bg-grayscale-100 border-grayscale-300 shadow-sm' 
                      : 'border-grayscale-200 hover:bg-grayscale-50'
                    }`}
                  data-selected={isSelected ? "true" : "false"}
                  role="button"
                  tabIndex={0}
                  aria-checked={isSelected}
                >
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border 
                    ${isSelected 
                      ? 'border-knowledge-primary bg-knowledge-primary' 
                      : 'border-grayscale-300'
                    }`}>
                    {isSelected && (
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    )}
                  </div>
                  <span className={`flex-grow ${isSelected ? 'text-knowledge-primary font-semibold' : 'text-grayscale-600'}`}>
                    {choice}
                  </span>
                </div>
              );
            })}
          </div>
        );
        
      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {homework.options?.choices?.map((choice: string, index: number) => {
              const isSelected = multipleChoiceAnswers.includes(choice);
              return (
                <div 
                  key={index} 
                  className={`flex items-center space-x-2 p-3 border rounded-md cursor-pointer transition-all
                    ${isSelected
                      ? 'bg-grayscale-100 border-grayscale-300 shadow-sm'
                      : 'border-grayscale-200 hover:bg-grayscale-50'
                    }`}
                  onClick={() => handleMultipleChoiceChange(choice)}
                >
                  <div 
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border
                      ${isSelected 
                        ? 'bg-knowledge-primary border-knowledge-primary' 
                        : 'bg-white border-grayscale-300'
                      }`}
                  >
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    )}
                  </div>
                  <Label className={`flex-grow cursor-pointer ${isSelected ? 'text-knowledge-primary font-semibold' : 'text-grayscale-600'}`}>
                    {choice}
                  </Label>
                </div>
              );
            })}
          </div>
        );
        
      case 'fill_blank':
        return (
          <div className="space-y-4">
            {homework.image_url && (
              <div className="rounded-lg overflow-hidden bg-gray-50">
                <img 
                  src={homework.image_url} 
                  alt="题目��片" 
                  className="w-full max-h-[400px] object-contain"
                />
              </div>
            )}
            <Textarea 
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="space-y-2">
              <Input
                id="file-upload"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  已选择文件: {selectedFile.name}
                </p>
              )}
            </div>
          </div>
        );
        
      default:
        return <p>不支持的作业类型</p>;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" onClick={(e) => e.stopPropagation()}>
      <div>
        {homework.options?.question && (
          <div className="mb-4">
            <p className="whitespace-pre-wrap">{homework.options.question}</p>
          </div>
        )}
        
        <div className="bg-white">
          {renderFormByType()}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-3">
        <Button 
          type="button" 
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onCancel();
          }}
          disabled={isSubmitting || isUploading}
          className="rounded-10 border border-black bg-white text-black hover:bg-black hover:text-white"
        >
          取消
        </Button>
        <Button 
          type="submit"
          disabled={!isFormValid || isSubmitting || isUploading}
          className={`rounded-10 border border-black ${isFormValid ? 'bg-white text-black hover:bg-black hover:text-white' : 'bg-gray-200 text-gray-500'}`}
          variant={isFormValid ? "outline" : "secondary"}
        >
          {isUploading ? '文件上传中...' : isSubmitting ? '提交中...' : '提交答案'}
        </Button>
      </div>
    </form>
  );
};
