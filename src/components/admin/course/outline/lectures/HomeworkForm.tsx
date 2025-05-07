
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
  const [formInitialized, setFormInitialized] = useState(false);

  // 改进的初始化逻辑，正确处理选项数据
  useEffect(() => {
    if (initialData) {
      console.log('HomeworkForm - 初始化数据:', initialData);
      
      // 设置基本字段
      setTitle(initialData.title || '');
      
      // 确保description是字符串类型
      setDescription(initialData.description || '');
      
      // 确保type字段一致
      setType(initialData.type || 'single_choice');
      
      // 初始化图片URL
      setImageUrl(initialData.image_url || '');
      
      // 改进的选项处理逻辑，处理多种可能的数据格式
      let optionsArray = ['', '', '', ''];
      
      // 检查options是否存在且不为null
      if (initialData.options) {
        console.log('HomeworkForm - 原始选项数据:', initialData.options, 'type:', typeof initialData.options);
        
        if (typeof initialData.options === 'object') {
          // 如果options是对象且包含choices数组
          if (initialData.options && 
              typeof initialData.options === 'object' && 
              'choices' in initialData.options && 
              Array.isArray(initialData.options.choices)) {
            console.log('HomeworkForm - 使用options.choices数组:', initialData.options.choices);
            // 将非字符串值转换为字符串
            optionsArray = initialData.options.choices.map(choice => 
              String(choice)
            );
            
            // 确保至少有最小数量选项
            while (optionsArray.length < 2) {
              optionsArray.push('');
            }
          } 
          // 如果options本身是数组（兼容旧数据）
          else if (Array.isArray(initialData.options)) {
            console.log('HomeworkForm - 使用options数组:', initialData.options);
            // 将非字符串值转换为字符串
            optionsArray = initialData.options.map(choice => 
              String(choice)
            );
            
            // 确保至少有最小数量选项
            while (optionsArray.length < 2) {
              optionsArray.push('');
            }
          }
        }
      }
      
      // 设置处理好的选项数组
      setOptions(optionsArray);
      
      // 标记表单已初始化
      setFormInitialized(true);
      console.log('HomeworkForm - 初始化完成', {type, options: optionsArray});
    } else {
      // 重置表单字段
      setTitle('');
      setDescription('');
      setType('single_choice');
      setOptions(['', '', '', '']);
      setImageUrl('');
      setFormInitialized(true);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 调试日志
    console.log('提交前的表单数据:', {
      title,
      description,
      type,
      options,
      imageUrl
    });

    // 根据类型准备选项数据
    let formattedOptions;
    if (type === 'single_choice' || type === 'multiple_choice') {
      // 只保留非空选项
      const filteredOptions = options.filter(opt => opt.trim() !== '');
      formattedOptions = {
        choices: filteredOptions
      };
    } else if (type === 'fill_blank') {
      // 对于填空题，可以添加其他选项格式
      formattedOptions = {
        question: options[0] || '请填写你的答案：'
      };
    } else {
      // 默认空选项
      formattedOptions = {};
    }

    console.log('格式化后的选项:', formattedOptions);

    const data: Homework = {
      id: initialData?.id,
      lecture_id: lectureId,
      course_id: courseId,
      title,
      description, 
      type,
      options: formattedOptions,
      image_url: imageUrl,
      // 保留现有position或使用0作为默认值
      position: initialData?.position || 0
    };

    try {
      console.log('准备提交的作业数据:', data);
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

  // 监听description变化
  const handleDescriptionChange = (value: string) => {
    console.log('描述内容已更改:', value);
    setDescription(value);
  };

  // 如果表单尚未初始化完成，显示加载状态
  if (!formInitialized && initialData) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-500"></div>
        <span className="ml-2">加载作业数据...</span>
      </div>
    );
  }

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
            onChange={handleDescriptionChange}
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

      <div className="flex justify-between items-center pt-4">
        <div>
          {(type === 'single_choice' || type === 'multiple_choice') && (
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
          )}
        </div>
        <div className="flex space-x-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '提交中...' : '提交'}
          </Button>
        </div>
      </div>
    </form>
  );
};
