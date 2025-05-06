
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Homework } from '@/lib/types/homework';
import RichTextEditor from './RichTextEditor';
import { Plus, Trash2 } from 'lucide-react';

interface HomeworkFormProps {
  lectureId: string;
  courseId: number;
  initialData?: Homework | null;
  onSubmit: (data: Homework) => Promise<any>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const HomeworkForm: React.FC<HomeworkFormProps> = ({
  lectureId,
  courseId,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('single_choice');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setType(initialData.type || 'single_choice');
      
      // 确保options是一个数组
      const homeworkOptions = initialData.options as any;
      if (Array.isArray(homeworkOptions)) {
        setOptions(homeworkOptions);
      } else if (homeworkOptions && homeworkOptions.choices && Array.isArray(homeworkOptions.choices)) {
        // 对于使用{choices: []}格式存储的选项
        setOptions(homeworkOptions.choices);
      } else {
        // 默认设置为空数组
        setOptions(['', '', '', '']);
      }
      
      setImageUrl(initialData.image_url || '');
    } else {
      // Reset form fields when adding a new homework
      setTitle('');
      setDescription('');
      setType('single_choice');
      setOptions(['', '', '', '']);
      setImageUrl('');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 根据类型准备选项数据
    let formattedOptions;
    if (type === 'single_choice' || type === 'multiple_choice') {
      // 只保留非空选项
      const filteredOptions = options.filter(opt => opt.trim() !== '');
      formattedOptions = {
        choices: filteredOptions
      };
    } else {
      // 对于填空题，可以添加其他选项格式
      formattedOptions = {};
    }

    const data: Homework = {
      id: initialData?.id,
      lecture_id: lectureId,
      course_id: courseId,
      title,
      description,
      type,
      options: formattedOptions,
      image_url: imageUrl
    };

    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission failed:", error);
      // Handle error appropriately, e.g., display an error message
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // 添加选项
  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  // 删除选项
  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return; // 保持至少有一个选项
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">标题</Label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">描述</Label>
        <div className="mt-1">
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="请输入作业的详细说明内容..."
          />
        </div>
      </div>
      <div>
        <Label htmlFor="type">类型</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger>
            <SelectValue placeholder="选择类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single_choice">单选题</SelectItem>
            <SelectItem value="multiple_choice">多选题</SelectItem>
            <SelectItem value="fill_blank">填空题</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Options for multiple choice questions */}
      {(type === 'single_choice' || type === 'multiple_choice') && Array.isArray(options) && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>选项</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddOption}
              className="flex items-center"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              添加选项
            </Button>
          </div>
          {options.map((option, index) => (
            <div key={index} className="flex space-x-2 items-center">
              <Input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`选项 ${index + 1}`}
                className="flex-grow"
              />
              {options.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveOption(index)}
                  className="h-8 w-8 text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '提交中...' : '提交'}
        </Button>
      </div>
    </form>
  );
};
