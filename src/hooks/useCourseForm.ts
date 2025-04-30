
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CourseFormValues, courseFormSchema } from '@/components/admin/course-editor/CourseBasicForm';
import { CourseWithDetails } from '@/lib/types/course-new';

export const useCourseForm = (initialData?: Partial<CourseWithDetails>) => {
  console.log('[useCourseForm] Initializing with data:', initialData);
  
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      original_price: null,
      currency: "cny",
      category: null,
      display_order: 0,
      status: "draft",
      is_featured: false,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('[useCourseForm] Resetting form with initial data:', initialData);
      
      form.reset({
        title: initialData.title || '',
        description: initialData.description || '',
        price: initialData.price || 0,
        original_price: initialData.original_price || null,
        currency: initialData.currency || 'cny',
        category: initialData.category || null,
        display_order: initialData.display_order || 0,
        status: (initialData.status as "draft" | "published" | "archived") || 'draft',
        is_featured: !!initialData.is_featured,
      });
    }
  }, [initialData, form]);

  // Log form values when they change
  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log('[useCourseForm] Form values updated:', value);
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const validateForm = () => {
    console.log('[useCourseForm] Validating form');
    const values = form.getValues();
    console.log('[useCourseForm] Current values:', values);
    
    const result = courseFormSchema.safeParse(values);
    if (!result.success) {
      console.error('[useCourseForm] Validation errors:', result.error);
      toast.error('表单验证失败', {
        description: '请检查所有必填字段',
      });
      return false;
    }
    
    console.log('[useCourseForm] Form is valid');
    return true;
  };

  return {
    form,
    validateForm,
  };
};
