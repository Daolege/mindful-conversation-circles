import React, { useState, useEffect } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { CourseFormValues } from "@/lib/types/course-new";
import { useTranslation } from "react-i18next";
import { getEnabledLanguages } from '@/lib/services/language/languageService';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// 定义表单验证模式
const formSchema = z.object({
  title: z.string().min(2, { message: "标题必须至少2个字符" }).max(100, { message: "标题不能超过100个字符" }),
  description: z.string().min(10, { message: "描述必须至少10个字符" }).optional(),
  price: z.coerce.number().min(0, { message: "价格必须大于或等于0" }),
  original_price: z.coerce.number().min(0, { message: "原价必须大于或等于0" }).optional().nullable(),
  language: z.string().default("zh"),
  currency: z.string().default("cny"),
  status: z.enum(["draft", "published", "archived"]),
  display_order: z.coerce.number().int().min(0).default(0),
});

interface BasicInfoFormProps {
  onTabChange: (tab: string) => void;
  onCourseCreated: (courseId: number) => void;
  courseId?: number | null;
}

export const BasicInfoForm = ({ onTabChange, onCourseCreated, courseId }: BasicInfoFormProps) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!courseId);
  const [languages, setLanguages] = useState<any[]>([]);
  const [languageError, setLanguageError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation(['admin']);
  
  // Initialize form
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      original_price: null,
      language: "zh",
      currency: "cny",
      status: "draft" as const,
      display_order: 0,
    }
  });

  // Load available languages from the database using the languageService
  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const languagesData = await getEnabledLanguages();
          
        if (languagesData && languagesData.length > 0) {
          // Transform to the format needed for select options
          const languageOptions = languagesData.map(lang => ({
            value: lang.code,
            label: `${lang.nativeName} (${lang.name})`
          }));
          
          setLanguages(languageOptions);
          console.log("Loaded languages:", languageOptions.length);
        } else {
          console.log("No languages found in database, using fallback options");
          // Fallback to hardcoded languages if none found in database
          setLanguages([
            { value: "zh", label: "中文" },
            { value: "en", label: "English" },
            { value: "fr", label: "Français" },
            { value: "de", label: "Deutsch" },
            { value: "es", label: "Español" },
            { value: "ja", label: "日本語" },
            { value: "ko", label: "한국어" },
            { value: "ru", label: "Русский" }
          ]);
        }
      } catch (err) {
        console.error("Error loading languages:", err);
        // Fallback to hardcoded languages on error
        setLanguages([
          { value: "zh", label: "中文" },
          { value: "en", label: "English" },
          { value: "fr", label: "Français" },
          { value: "de", label: "Deutsch" },
          { value: "es", label: "Español" },
          { value: "ja", label: "日本語" },
          { value: "ko", label: "한국어" },
          { value: "ru", label: "Русский" }
        ]);
      }
    };
    
    loadLanguages();
  }, []);

  // If there's courseId, load existing course data
  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId) return;
      
      try {
        setInitialLoading(true);
        const { data, error } = await supabase
          .from('courses_new')
          .select('*')
          .eq('id', courseId)
          .single();
        
        if (error) {
          console.error("Error loading course data:", error);
          toast.error("加载课程数据失败");
          return;
        }
        
        if (data) {
          // Make sure we handle the language field correctly
          const courseData = data as any;
          
          // First try language field, then fallback to category if needed
          let languageValue = "zh"; // Default fallback
          
          try {
            // Check if language column exists in the data
            if ('language' in courseData && courseData.language) {
              console.log("Using language field value:", courseData.language);
              languageValue = courseData.language;
            } 
            // Fallback to category if language doesn't exist
            else if ('category' in courseData && ['zh', 'en', 'fr', 'de', 'es', 'ja', 'ko', 'ru'].includes(courseData.category)) {
              languageValue = courseData.category;
              console.log("Using category as language fallback:", languageValue);
            }
          } catch (err) {
            console.error("Error processing language field:", err);
          }
          
          console.log("Loaded course data:", courseData);
          console.log("Language value:", languageValue);
          
          form.reset({
            title: courseData.title || "",
            description: courseData.description || "",
            price: courseData.price || 0,
            original_price: courseData.original_price,
            language: languageValue,
            currency: courseData.currency || "cny",
            status: (courseData.status as "draft" | "published" | "archived") || "draft",
            display_order: courseData.display_order || 0,
          });
        }
      } catch (err) {
        console.error("Error in loadCourseData:", err);
        toast.error("加载课程数据时出错");
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadCourseData();
  }, [courseId, form]);

  // 表单提交处理
  const onSubmit = async (values: CourseFormValues) => {
    try {
      setLoading(true);
      setLanguageError(null);
      
      // Log the values being sent to the server
      console.log("Submitting form values:", values);
      console.log("Language being submitted:", values.language);
      
      if (courseId) {
        // Update existing course
        try {
          // First try updating with both language and category
          const { error } = await supabase
            .from('courses_new')
            .update({
              title: values.title,
              description: values.description,
              price: values.price,
              original_price: values.original_price,
              category: values.language, // Set category to same value for backward compatibility
              language: values.language, // Try to set language column
              currency: values.currency,
              status: values.status,
              display_order: values.display_order,
              updated_at: new Date().toISOString()
            })
            .eq('id', courseId);
          
          // If we get a column does not exist error, try without language column
          if (error && error.code === '42703') {
            console.log("Language column doesn't exist, trying without it");
            
            const { error: retryError } = await supabase
              .from('courses_new')
              .update({
                title: values.title,
                description: values.description,
                price: values.price,
                original_price: values.original_price,
                category: values.language, // Still set category as before
                currency: values.currency,
                status: values.status,
                display_order: values.display_order,
                updated_at: new Date().toISOString()
              })
              .eq('id', courseId);
            
            if (retryError) {
              throw new Error(`更新课程失败: ${retryError.message}`);
            } else {
              // Show warning about missing column
              setLanguageError("数据库缺少语言(language)字段。系统将使用category字段作为临时解决方案。由于数据库结构原因，可能无法使用全部功能。");
              toast.success("课程已更新", {
                description: "使用了向后兼容模式"
              });
            }
          } else if (error) {
            throw new Error(`更新课程失败: ${error.message}`);
          } else {
            toast.success("课程已成功更新");
          }
        } catch (err: any) {
          console.error("Error updating course:", err);
          toast.error(`更新课程失败: ${err.message}`);
          return;
        }
        
        onTabChange('curriculum');
      } else {
        // Create new course
        const { data: maxOrderData } = await supabase
          .from('courses_new')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1);
        
        // Set new course's display order to current max value+1, or 1 (if no courses)
        const nextDisplayOrder = maxOrderData && maxOrderData.length > 0 
          ? (maxOrderData[0].display_order || 0) + 1 
          : 1;
        
        try {
          // First try with both language and category fields
          const { data, error } = await supabase
            .from('courses_new')
            .insert({
              title: values.title,
              description: values.description,
              price: values.price,
              original_price: values.original_price,
              category: values.language, // Set category for backward compatibility
              language: values.language, // Set dedicated language field
              currency: values.currency,
              status: values.status,
              display_order: nextDisplayOrder,
            })
            .select('id');
          
          // If we get a column does not exist error, try without language column
          if (error && error.code === '42703') {
            console.log("Language column doesn't exist, trying without it");
            
            const { data: retryData, error: retryError } = await supabase
              .from('courses_new')
              .insert({
                title: values.title,
                description: values.description,
                price: values.price,
                original_price: values.original_price,
                category: values.language, // Use language as category
                currency: values.currency,
                status: values.status,
                display_order: nextDisplayOrder,
              })
              .select('id');
              
            if (retryError) {
              throw new Error(`创建课程失败: ${retryError.message}`);
            }
            
            if (retryData && retryData.length > 0) {
              const newCourseId = retryData[0].id;
              setLanguageError("数据库缺少语言(language)字段。系统将使用category字段作为临时解决方案。由于数据库结构原因，可能无法使用全部功能。");
              toast.success("课程已成功创建", {
                description: "使用了向后兼容模式"
              });
              onCourseCreated(newCourseId);
            }
          } else if (error) {
            throw new Error(`创建课程失败: ${error.message}`);
          } else if (data && data.length > 0) {
            const newCourseId = data[0].id;
            toast.success("课程已成功创建");
            onCourseCreated(newCourseId);
          }
        } catch (err: any) {
          console.error("Error creating course:", err);
          toast.error(`创建课程失败: ${err.message}`);
          return;
        }
      }
    } catch (err: any) {
      console.error("Error in onSubmit:", err);
      toast.error("保存课程时出错", {
        description: err.message || "请稍后重试"
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">加载课程数据...</span>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 bg-white rounded-lg border border-gray-100">
        <div className="grid grid-cols-1 gap-6 md:gap-8">
          <h2 className="text-xl font-medium">基本信息</h2>
          
          {languageError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>数据库兼容性警告</AlertTitle>
              <AlertDescription>
                {languageError}
              </AlertDescription>
            </Alert>
          )}
          
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>课程标题 *</FormLabel>
                <FormControl>
                  <Input placeholder="输入课程标题" {...field} />
                </FormControl>
                <FormDescription>
                  简明扼要地描述课程内容
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>课程描述</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="输入课程描述" 
                    className="min-h-[150px]" 
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>
                  详细说明课程内容、目标和收益
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>价格 (元) *</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={0.01} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="original_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>原价 (元，可选)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={0} 
                      step={0.01} 
                      {...field} 
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === '' ? null : Number(val));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('courseLanguage')}</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  value={field.value || "zh"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectLanguage')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {languages.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {t('courseLanguageDescription')}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>发布状态 *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">草稿</SelectItem>
                    <SelectItem value="published">已发布</SelectItem>
                    <SelectItem value="archived">已归档</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  草稿状态下不会向用户展示课程
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin?tab=courses-new')}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存并继续
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
