import React, { useState, useEffect, useCallback, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/authHooks';
import { submitHomework, uploadHomeworkFile } from '@/lib/services/homeworkService';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { FileInput } from '@/components/course/FileInput';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, X, AlertCircle } from 'lucide-react';
import { dismissAllToasts } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import RichTextEditor from '@/components/admin/course/outline/lectures/RichTextEditor';
import { useTranslations } from '@/hooks/useTranslations';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
  const { t } = useTranslations();
  const [answer, setAnswer] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // 组件卸载时清除toast提示
  useEffect(() => {
    return () => {
      dismissAllToasts();
    };
  }, []);
  
  // 安全的选项变更处理函数，使用函数式更新
  const handleChoiceChange = useCallback((choice: string) => {
    // 使用函数式更新来避免依赖selectedChoices
    setSelectedChoices(prevChoices => {
      console.log(`Choice changed: ${choice}, current selection:`, prevChoices);
      
      if (homework.type === 'single_choice') {
        // 对于单选题，总是返回一个只包含此选项的数组
        return [choice];
      } else {
        // 对于多选题，切换选择
        return prevChoices.includes(choice) 
          ? prevChoices.filter(c => c !== choice) 
          : [...prevChoices, choice];
      }
    });
  }, [homework.type]); // 仅依赖homework.type，不依赖于selectedChoices
  
  // Handle radio selection (for single choice)
  const handleRadioChange = (value: string) => {
    setSelectedChoices([value]);
    setErrorMessage(null); // Clear any errors
  };
  
  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setErrorMessage(null); // 用户做出更改时清除任何错误
  };
  
  const handleRichTextChange = (content: string) => {
    setAnswer(content);
    setErrorMessage(null); // 用户做出更改时清除任何错误
  };
  
  const validateSubmission = () => {
    if (!user?.id) {
      return t('errors:pleaseLoginFirst');
    }
    
    // 根据作业类型验证
    if (homework.type === 'single_choice' && selectedChoices.length === 0) {
      return '请选择一个选项';
    }
    
    if (homework.type === 'multiple_choice' && selectedChoices.length === 0) {
      return '请至少选择一个选项';
    }
    
    if (homework.type === 'file' && !selectedFile) {
      return '请上传一个文件';
    }
    
    if (homework.type === 'text' && !answer.trim()) {
      return '请输入你的答案';
    }
    
    return null; // 无验证错误
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清除任何现有的错误消息
    setErrorMessage(null);
    
    // 验证提交
    const validationError = validateSubmission();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    
    if (!user?.id) {
      toast.error(t('errors:pleaseLoginFirst'));
      return;
    }
    
    try {
      // 清除任何现有的toast提示
      dismissAllToasts();
      
      setSubmitting(true);
      
      // 根据作业类型格式化答案
      let finalAnswer = answer;
      let finalFileUrl = fileUrl;
      
      // 如果需要，处理文件上传
      if (selectedFile) {
        finalFileUrl = await uploadHomeworkFile(selectedFile, user.id, homework.id);
        if (!finalFileUrl) {
          setErrorMessage('文件上传失败，请重试');
          setSubmitting(false);
          return;
        }
      }
      
      // 对于选择题，使用选定的选项作为答案
      if (homework.type === 'single_choice' || homework.type === 'multiple_choice') {
        finalAnswer = JSON.stringify(selectedChoices);
      }
      
      // 确保courseId为数字
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
        setErrorMessage('作业提交失败，请重试');
      }
    } catch (error) {
      console.error('Error submitting homework:', error);
      setErrorMessage(`提交失败: ${(error as any)?.message || '未知错误'}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // 渲染多选题选项
  const renderMultipleChoiceOptions = () => {
    if (!homework.options || !homework.options.choices || !Array.isArray(homework.options.choices)) {
      return null;
    }
    
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-500 mb-2">可选择多个选项：</p>
        
        <div className="grid grid-cols-1 gap-2" data-homework-choices="container">
          {homework.options.choices.map((choice: string, index: number) => {
            const choiceId = `choice-${homework.id}-${index}`;
            const isSelected = selectedChoices.includes(choice);
            
            return (
              <MultipleChoiceOptionCard 
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
  };
  
  // 渲染单选题选项
  const renderSingleChoiceOptions = () => {
    if (!homework.options || !homework.options.choices || !Array.isArray(homework.options.choices)) {
      return null;
    }
    
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-500 mb-2">请选择一个选项：</p>
        
        <RadioGroup 
          value={selectedChoices[0] || ""} 
          onValueChange={handleRadioChange}
          className="grid grid-cols-1 gap-2" 
          data-homework-choices="container"
        >
          {homework.options.choices.map((choice: string, index: number) => {
            const choiceId = `choice-${homework.id}-${index}`;
            
            return (
              <SingleChoiceOptionCard 
                key={`choice-card-${homework.id}-${index}`}
                choiceId={choiceId}
                choice={choice}
                isSelected={selectedChoices[0] === choice}
                value={choice}
                index={index}
              />
            );
          })}
        </RadioGroup>
      </div>
    );
  };
  
  // 根据作业类型渲染不同的表单
  const renderFormContent = () => {
    if (homework.type === 'single_choice') {
      return renderSingleChoiceOptions();
    } else if (homework.type === 'multiple_choice') {
      return renderMultipleChoiceOptions();
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
  };
  
  return (
    <form 
      onSubmit={(e) => {
        // 确保表单提交被正确处理
        handleSubmit(e);
      }} 
      className="space-y-4 p-4 relative"
      data-homework-type={homework.type}
      data-homework-id={homework.id}
    >
      {/* 内容区域，不设置固定高度，让其根据内容自动调整 */}
      <div className="pb-16">
        {/* 显示作业描述（如果有） */}
        {homework.description && (
          <div 
            className="text-sm bg-gray-50 p-4 rounded-md shadow-inner mb-4" 
            dangerouslySetInnerHTML={{ __html: homework.description }}
          />
        )}
        
        {/* 错误消息显示 */}
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-100 rounded-md text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
        
        {/* 处理不同的作业类型 */}
        {renderFormContent()}
      </div>
      
      {/* 固定底部按钮栏，确保它始终在底部且不会被内容遮挡 */}
      <div className="flex justify-end gap-2 absolute bottom-0 left-0 right-0 bg-white p-4 border-t shadow-sm z-10">
        {onCancel && (
          <Button 
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.preventDefault(); // 阻止默认按钮行为
              e.stopPropagation(); // 阻止事件传播
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

// Single choice option card component - completely rewritten to properly handle clicks
const SingleChoiceOptionCard = memo(({ 
  choiceId, 
  choice, 
  isSelected,
  value,
  index
}: { 
  choiceId: string;
  choice: string;
  isSelected: boolean;
  value: string;
  index: number;
}) => {
  // Handle card click to trigger radio selection
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Find the radio input in this card and click it programmatically
    const radioEl = document.getElementById(choiceId) as HTMLElement;
    if (radioEl) {
      radioEl.click();
    }
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
        <RadioGroupItem 
          id={choiceId} 
          value={value}
          className="h-4 w-4" 
          data-selected={isSelected ? 'true' : 'false'}
        />
        <Label 
          htmlFor={choiceId}
          className="text-sm cursor-pointer flex-1"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCardClick(e);
          }}
        >
          {choice}
        </Label>
      </div>
    </Card>
  );
});

// Multiple choice option card component - unchanged
const MultipleChoiceOptionCard = memo(({ 
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
  // 处理卡片点击，正确阻止事件
  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();
  };
  
  // 处理复选框点击，正确阻止事件
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };
  
  // 处理标签点击，正确阻止事件
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
            // 这只会被键盘/辅助功能交互触发
            // 因为我们单独处理点击事件
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

// Set display names for all components
SingleChoiceOptionCard.displayName = 'SingleChoiceOptionCard';
MultipleChoiceOptionCard.displayName = 'MultipleChoiceOptionCard';
