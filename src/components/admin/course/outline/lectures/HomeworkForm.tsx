import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Homework } from '@/lib/types/homework';

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
  const [isRequired, setIsRequired] = useState(false);
  const [position, setPosition] = useState<number>(1);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setType(initialData.type || 'single_choice');
      setOptions(initialData.options as string[] || ['', '', '', '']);
      setImageUrl(initialData.image_url || '');
      setIsRequired(initialData.is_required || false);
      setPosition(initialData.position || 1);
    } else {
      // Reset form fields when adding a new homework
      setTitle('');
      setDescription('');
      setType('single_choice');
      setOptions(['', '', '', '']);
      setImageUrl('');
      setIsRequired(false);
      setPosition(1);
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: Homework = {
      id: initialData?.id,
      lecture_id: lectureId,
      course_id: courseId,
      title,
      description,
      type,
      options,
      image_url: imageUrl,
      is_required: isRequired,
      position: position
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
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
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
      {type === 'single_choice' || type === 'multiple_choice' ? (
        <div className="space-y-2">
          <Label>选项</Label>
          {options.map((option, index) => (
            <div key={index} className="flex space-x-2">
              <Input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`选项 ${index + 1}`}
              />
            </div>
          ))}
        </div>
      ) : null}

      <div>
        <Label htmlFor="imageUrl">图片 URL</Label>
        <Input
          type="url"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="isRequired">是否必填</Label>
        <Input
          type="checkbox"
          id="isRequired"
          checked={isRequired}
          onChange={(e) => setIsRequired(e.target.checked)}
        />
      </div>

      <div>
        <Label htmlFor="position">位置</Label>
        <Input
          type="number"
          id="position"
          value={position}
          onChange={(e) => setPosition(Number(e.target.value))}
        />
      </div>

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
