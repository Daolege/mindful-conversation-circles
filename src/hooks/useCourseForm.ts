
import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CourseWithDetails } from '@/lib/types/course-new';

const formSchema = z.object({
  title: z.string().min(2, {
    message: "课程标题必须至少包含2个字符",
  }),
  description: z.string().optional(),
  price: z.number().min(0, {
    message: "价格必须大于等于0",
  }),
  currency: z.string().optional(),
  language: z.string().default("zh"),
  category: z.string().default("zh"), // Add category field
  featured: z.boolean().default(false).optional(),
  display_order: z.number().optional(),
  status: z.string().optional(),
  learning_objectives: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  target_audience: z.array(z.string()).optional(),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    position: z.number(),
    lectures: z.array(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      duration: z.string().optional(),
      position: z.number(),
      video_url: z.string().optional(),
      has_homework: z.boolean().optional(),
      section_id: z.string().optional(),
      is_free: z.boolean().optional(),
      requires_homework_completion: z.boolean().optional(),
    })).optional()
  })).optional(),
  instructor_name: z.string().optional(),
  instructor_bio: z.string().optional(),
  instructor_avatar: z.string().optional(),
  thumbnail_url: z.string().optional(),
});

export function useCourseForm(initialData?: Partial<CourseWithDetails>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Log initial data to help with debugging
  console.log("[useCourseForm] Initial data:", initialData);
  console.log("[useCourseForm] Initial language value:", initialData?.language || initialData?.category);
  console.log("[useCourseForm] Initial category value:", initialData?.category);

  // For backward compatibility, use either language or category
  const initialLanguage = initialData?.language || initialData?.category || 'zh';

  const defaultValues: CourseWithDetails = {
    id: initialData?.id ?? 0,
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    price: initialData?.price ?? 0,
    currency: initialData?.currency ?? 'cny',
    language: initialLanguage, // Use detected language value
    category: initialData?.category ?? initialLanguage, // Keep category synced with language for backward compatibility
    featured: initialData?.featured ?? false,
    display_order: initialData?.display_order ?? 0,
    status: initialData?.status ?? 'draft',
    learning_objectives: initialData?.learning_objectives ?? [],
    requirements: initialData?.requirements ?? [],
    target_audience: initialData?.target_audience ?? [],
    sections: initialData?.sections ?? [],
    instructor_name: initialData?.instructor_name ?? '',
    instructor_bio: initialData?.instructor_bio ?? '',
    instructor_avatar: initialData?.instructor_avatar ?? '',
    thumbnail_url: initialData?.thumbnail_url ?? '',
  };

  // Log the constructed default values for debugging
  console.log("[useCourseForm] Constructed default values:", defaultValues);
  console.log("[useCourseForm] Final language value:", defaultValues.language);

  const form = useForm<CourseWithDetails>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    mode: "onChange"
  });

  const onSubmit = useCallback(async (values: CourseWithDetails) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Log submission values for debugging
      console.log("[useCourseForm] Form values being submitted:", values);
      console.log("[useCourseForm] Language being submitted:", values.language);
      console.log("[useCourseForm] Category being submitted:", values.category);
      
      // Make sure category is synchronized with language for backward compatibility
      if (values.language && values.category !== values.language) {
        values.category = values.language;
        console.log("[useCourseForm] Synchronized category with language:", values.category);
      }
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Form values submitted:", values);
      // Here you would typically make your API call

    } catch (error: any) {
      console.error("Form submission error:", error);
      setErrorMessage(error.message || "An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    form,
    onSubmit,
    isSubmitting,
    errorMessage
  };
}
