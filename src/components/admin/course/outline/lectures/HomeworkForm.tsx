
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

interface HomeworkFormProps {
  lectureId: string;
  courseId: number;
  initialData?: any;
  onSubmit: (data: any) => Promise<any>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

// Define schema for homework form
const homeworkSchema = z.object({
  title: z.string().min(1, '标题不能为空'),
  description: z.string().optional(),
  type: z.enum(['single_choice', 'multiple_choice', 'fill_blank']),
  question: z.string().min(1, '问题不能为空'),
  choices: z.string().optional(),
});

export const HomeworkForm: React.FC<HomeworkFormProps> = ({
  lectureId,
  courseId,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  // Initialize form with the proper schema
  const form = useForm({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      type: initialData?.type || 'single_choice',
      question: initialData?.options?.question || '',
      choices: initialData?.options?.choices 
        ? (Array.isArray(initialData?.options?.choices) 
            ? initialData?.options?.choices.join('\n') 
            : initialData?.options?.choices)
        : '',
    },
  });

  // Parse the choices string into an array
  const parseChoices = (choicesString: string) => {
    if (!choicesString) return [];
    return choicesString
      .split('\n')
      .map((choice) => choice.trim())
      .filter((choice) => choice !== '');
  };

  // Handle form submission
  const handleFormSubmit = async (values: z.infer<typeof homeworkSchema>) => {
    try {
      // Prepare options based on homework type
      const options = {
        question: values.question,
        choices: values.type !== 'fill_blank' ? parseChoices(values.choices) : undefined,
      };

      // Prepare data for submission
      const homeworkData: any = {
        title: values.title,
        description: values.description || '',
        type: values.type,
        lecture_id: lectureId,
        course_id: courseId,
        options: options,
      };

      // If we're editing an existing homework, include its ID
      if (initialData && initialData.id) {
        homeworkData.id = initialData.id;
      }

      // Submit the data
      await onSubmit(homeworkData);
    } catch (error) {
      console.error('[HomeworkForm] Error submitting form:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>标题</FormLabel>
              <FormControl>
                <Input placeholder="作业标题" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>描述（选填）</FormLabel>
              <FormControl>
                <Textarea placeholder="作业描述" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>类型</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="选择类型" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="single_choice">单选题</SelectItem>
                  <SelectItem value="multiple_choice">多选题</SelectItem>
                  <SelectItem value="fill_blank">填空题</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="question"
          render={({ field }) => (
            <FormItem>
              <FormLabel>问题</FormLabel>
              <FormControl>
                <Textarea placeholder="输入问题内容" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        {form.watch('type') !== 'fill_blank' && (
          <FormField
            control={form.control}
            name="choices"
            render={({ field }) => (
              <FormItem>
                <FormLabel>选项（每行一个）</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="输入选项，每行一个"
                    rows={5}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end space-x-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              '保存'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
