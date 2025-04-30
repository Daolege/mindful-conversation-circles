
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HomeworkFormProps {
  lectureId: string;
  courseId: number;
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const HomeworkForm = ({
  lectureId,
  courseId,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting
}: HomeworkFormProps) => {
  // 表单状态
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [homeworkType, setHomeworkType] = useState(initialData?.type || 'single_choice');
  const [question, setQuestion] = useState(initialData?.options?.question || '');
  const [choices, setChoices] = useState(initialData?.options?.choices || ['选项1', '选项2', '选项3', '选项4']);
  const [formError, setFormError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 验证单个字段
  const validateField = (field: string, value: any): string | null => {
    switch(field) {
      case 'title':
        return !value.trim() ? '请输入作业标题' : null;
      case 'question':
        return !value.trim() ? '请输入问题内容' : null;
      case 'choices':
        return (homeworkType !== 'fill_blank' && value.length < 2) ? '选择题至少需要两个选项' : null;
      default:
        return null;
    }
  };

  // 添加新选项
  const addChoice = () => {
    setChoices([...choices, `选项${choices.length + 1}`]);
  };

  // 更新选项内容
  const updateChoice = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    setChoices(newChoices);
    
    // Clear validation error if fixed
    if (choices.length >= 2) {
      setValidationErrors(prev => ({...prev, choices: null}));
    }
  };

  // 删除选项
  const removeChoice = (index: number) => {
    if (choices.length <= 2) {
      setValidationErrors(prev => ({...prev, choices: '选择题至少需要两个选项'}));
      return;
    }
    const newChoices = choices.filter((_, i) => i !== index);
    setChoices(newChoices);
  };

  // 处理字段变化，实时验证
  const handleFieldChange = (field: string, value: any) => {
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
    
    // 更新对应字段的值
    switch(field) {
      case 'title':
        setTitle(value);
        break;
      case 'description':
        setDescription(value);
        break;
      case 'question':
        setQuestion(value);
        break;
      case 'homeworkType':
        setHomeworkType(value);
        break;
      default:
        break;
    }
    
    // 修改后清除成功状态
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setFormError(null);
    
    // 全面验证所有字段
    const errors: {[key: string]: string} = {};
    const titleError = validateField('title', title);
    const questionError = validateField('question', question);
    const choicesError = validateField('choices', choices);
    
    if (titleError) errors.title = titleError;
    if (questionError) errors.question = questionError;
    if (choicesError) errors.choices = choicesError;
    
    setValidationErrors(errors);
    
    // 如果有错误，显示toast并返回
    if (Object.keys(errors).length > 0) {
      toast.error('请修正表单错误后再提交');
      return;
    }

    // 准备提交数据
    const homeworkData = {
      title,
      description: description || null,
      type: homeworkType,
      lecture_id: lectureId,
      course_id: courseId,
      options: {
        question,
        choices: homeworkType !== 'fill_blank' ? choices : undefined
      }
    };

    console.log('准备提交作业数据:', homeworkData);
    
    try {
      await onSubmit(homeworkData);
      setSaveSuccess(true);
      toast.success('作业保存成功！');
    } catch (error: any) {
      console.error('提交作业失败:', error);
      setFormError(error.message || '提交作业失败，请重试');
      toast.error('保存失败:' + (error.message || '提交作业失败，请重试'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {saveSuccess && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>作业保存成功！</AlertDescription>
        </Alert>
      )}
      
      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      
      {/* 作业类型选择 */}
      <div>
        <label htmlFor="homework-type" className="block text-sm font-medium mb-1">
          作业类型<span className="text-red-500">*</span>
        </label>
        <Select 
          value={homeworkType} 
          onValueChange={(value) => handleFieldChange('homeworkType', value)}
        >
          <SelectTrigger id="homework-type">
            <SelectValue placeholder="选择作业类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single_choice">单选题</SelectItem>
            <SelectItem value="multiple_choice">多选题</SelectItem>
            <SelectItem value="fill_blank">填空题</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 标题输入 */}
      <div>
        <label htmlFor="homework-title" className="block text-sm font-medium mb-1">
          作业标题<span className="text-red-500">*</span>
        </label>
        <Input
          id="homework-title"
          value={title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          placeholder="例如: 本章复习单选题"
          className={validationErrors.title ? "border-red-500" : ""}
        />
        {validationErrors.title && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.title}</p>
        )}
      </div>

      {/* 描述输入 */}
      <div>
        <label htmlFor="homework-description" className="block text-sm font-medium mb-1">
          描述 (可选)
        </label>
        <Textarea
          id="homework-description"
          value={description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="作业描述或其他说明"
          rows={2}
        />
      </div>

      {/* 问题输入 */}
      <div>
        <label htmlFor="homework-question" className="block text-sm font-medium mb-1">
          问题内容<span className="text-red-500">*</span>
        </label>
        <Textarea
          id="homework-question"
          value={question}
          onChange={(e) => handleFieldChange('question', e.target.value)}
          placeholder="请输入问题内容"
          rows={3}
          className={validationErrors.question ? "border-red-500" : ""}
        />
        {validationErrors.question && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.question}</p>
        )}
      </div>

      {/* 选项部分 (仅对选择题类型显示) */}
      {(homeworkType === 'single_choice' || homeworkType === 'multiple_choice') && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium">
              选项<span className="text-red-500">*</span>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addChoice}
            >
              添加选项
            </Button>
          </div>
          <div className="space-y-2">
            {choices.map((choice, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={choice}
                  onChange={(e) => updateChoice(index, e.target.value)}
                  placeholder={`选项 ${index + 1}`}
                  className={`flex-1 ${validationErrors.choices ? "border-red-500" : ""}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 h-9 w-9"
                  onClick={() => removeChoice(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          {validationErrors.choices && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.choices}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            提示: {homeworkType === 'single_choice' ? '单选题中，第一个选项将被视为正确答案' : '多选题中，学生可以选择多个选项'}
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-2">
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          取消
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting || Object.values(validationErrors).some(error => !!error)}
          className="min-w-[100px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              保存中...
            </>
          ) : initialData ? '更新作业' : '创建作业'}
        </Button>
      </div>
    </form>
  );
};
