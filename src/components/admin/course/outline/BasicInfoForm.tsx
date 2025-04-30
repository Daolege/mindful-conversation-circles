
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

// 定义表单验证模式
const formSchema = z.object({
  title: z.string().min(2, { message: "标题必须至少2个字符" }).max(100, { message: "标题不能超过100个字符" }),
  description: z.string().min(10, { message: "描述必须至少10个字符" }).optional(),
  price: z.coerce.number().min(0, { message: "价格必须大于或等于0" }),
  original_price: z.coerce.number().min(0, { message: "原价必须大于或等于0" }).optional().nullable(),
  category: z.string().optional(),
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
  const navigate = useNavigate();
  
  // 初始化表单
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      original_price: null,
      category: "",
      currency: "cny",
      status: "draft" as const,
      display_order: 0,
    }
  });

  // 如果有courseId，加载现有课程数据
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
          // 设置表单值
          form.reset({
            title: data.title || "",
            description: data.description || "",
            price: data.price || 0,
            original_price: data.original_price,
            category: data.category || "",
            currency: data.currency || "cny",
            status: (data.status as "draft" | "published" | "archived") || "draft",
            display_order: data.display_order || 0,
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
      
      if (courseId) {
        // 更新现有课程
        const { error } = await supabase
          .from('courses_new')
          .update({
            title: values.title,
            description: values.description,
            price: values.price,
            original_price: values.original_price,
            category: values.category,
            currency: values.currency,
            status: values.status,
            display_order: values.display_order,
            updated_at: new Date().toISOString()
          })
          .eq('id', courseId);
        
        if (error) {
          console.error("Error updating course:", error);
          toast.error("更新课程失败");
          return;
        }
        
        toast.success("课程已成功更新");
        onTabChange('curriculum');
      } else {
        // 创建新课程
        const { data: maxOrderData } = await supabase
          .from('courses_new')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1);
        
        // 设置新课程的显示顺序为当前最大值+1，或者1（如果没有课程）
        const nextDisplayOrder = maxOrderData && maxOrderData.length > 0 
          ? (maxOrderData[0].display_order || 0) + 1 
          : 1;
        
        const { data, error } = await supabase
          .from('courses_new')
          .insert({
            title: values.title,
            description: values.description,
            price: values.price,
            original_price: values.original_price,
            category: values.category,
            currency: values.currency,
            status: values.status,
            display_order: nextDisplayOrder,
          })
          .select('id');
        
        if (error) {
          console.error("Error creating course:", error);
          toast.error("创建课程失败");
          return;
        }
        
        if (data && data.length > 0) {
          const newCourseId = data[0].id;
          toast.success("课程已成功创建");
          onCourseCreated(newCourseId);
        }
      }
    } catch (err) {
      console.error("Error in onSubmit:", err);
      toast.error("保存课程时出错");
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>分类</FormLabel>
                <FormControl>
                  <Input placeholder="课程分类" {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>
                  例如：编程、设计、营销等
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
