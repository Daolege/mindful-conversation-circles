
import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

// Schema is moved to a separate file for reuse
export const courseFormSchema = z.object({
  title: z.string().min(2, "标题至少需要2个字符").max(100, "标题不能超过100个字符"),
  description: z.string().optional(),
  price: z.coerce.number().int().min(0, "价格不能为负数"),
  original_price: z.coerce.number().int().min(0, "原价不能为负数").optional().nullable(),
  currency: z.string().default("cny"),
  language: z.string().default("zh"),
  display_order: z.coerce.number().int().default(0),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  is_featured: z.boolean().default(false),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseBasicFormProps {
  form: any;
  onSubmit: (values: CourseFormValues) => void;
  isSubmitting: boolean;
}

const CourseBasicForm: React.FC<CourseBasicFormProps> = ({ 
  form, 
  onSubmit,
  isSubmitting
}) => {
  const { t } = useTranslation(['admin']);
  console.log("[CourseBasicForm] Rendering with form values:", form.getValues());

  // Available languages that courses can be taught in
  const languageOptions = [
    { value: "zh", label: "中文" },
    { value: "en", label: "English" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "es", label: "Español" },
    { value: "ja", label: "日本語" },
    { value: "ko", label: "한국어" },
    { value: "ru", label: "Русский" }
  ];

  return (
    <Card className="p-6">
      <Form {...form}>
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            console.log("[CourseBasicForm] Form submitted via onSubmit event");
            const values = form.getValues();
            console.log("[CourseBasicForm] Form values on submit:", values);
            onSubmit(values);
          }} 
          className="space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-lg font-medium">课程基本信息</h2>
            <p className="text-gray-500 text-sm">请填写课程的基本信息，包括标题、描述和价格</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>课程标题 <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="输入课程标题" {...field} />
                  </FormControl>
                  <FormDescription>
                    一个简短而有吸引力的标题，建议不超过25个字
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courseLanguage')}</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || 'zh'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectLanguage')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {languageOptions.map((option) => (
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
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel>课程描述</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="输入课程描述" 
                      rows={5}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    简洁明了地描述课程内容和目标受众
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>课程价格 (元) <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="0"
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value === '' ? '0' : e.target.value;
                        field.onChange(parseInt(value, 10));
                      }}
                    />
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
                  <FormLabel>原价 (元)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={field.value === null ? '' : field.value}
                      onChange={(e) => {
                        const value = e.target.value === '' ? null : parseInt(e.target.value, 10);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    如果设置了原价，将显示折扣信息
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>货币</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择货币" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cny">人民币 (CNY)</SelectItem>
                      <SelectItem value="usd">美元 (USD)</SelectItem>
                      <SelectItem value="eur">欧元 (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>展示顺序</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      placeholder="0"
                      {...field} 
                      onChange={(e) => {
                        const value = e.target.value === '' ? '0' : e.target.value;
                        field.onChange(parseInt(value, 10));
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    数字越小排序越靠前
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
                  <FormLabel>课程状态</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
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
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-x-2 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>首页推荐</FormLabel>
                    <FormDescription>
                      设置为推荐课程将显示在首页推荐区域
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default CourseBasicForm;
