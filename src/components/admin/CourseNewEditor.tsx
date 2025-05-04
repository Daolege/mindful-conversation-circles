
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getCourseNewById, 
  createCourseNew, 
  updateCourseNew, 
  saveFullCourse, 
  clearCourseLocalStorageData 
} from "@/lib/services/courseNewService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, Save, Book, ListChecks, Target, Users, Plus, Trash2, Upload, AlertCircle, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CourseNew, CourseSection, CourseLecture, CourseWithDetails, CourseDataForInsert } from "@/lib/types/course-new";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CourseOutlineEditor } from './course/outline/CourseOutlineEditor';
import { CourseOtherSettings } from './course/settings/CourseOtherSettings';

const courseFormSchema = z.object({
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

type CourseFormValues = z.infer<typeof courseFormSchema>;

const CourseNewEditor = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const isEditMode = courseId !== "new";
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh components
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      original_price: null,
      currency: "cny",
      language: "zh",
      display_order: 0,
      status: "draft",
      is_featured: false,
    },
  });

  const loadCourse = useCallback(async () => {
    if (isEditMode && courseId) {
      try {
        setLoading(true);
        setSaveSuccess(false);
        setSaveError(null);
        
        const courseIdNum = parseInt(courseId);
        const { data, error } = await getCourseNewById(courseIdNum);
        
        if (error) {
          toast.error("加载课程数据失败", { description: error.message });
          setSaveError(error.message);
          return;
        }
        
        if (data) {
          const courseDetails = data as CourseWithDetails;
          form.reset({
            title: courseDetails.title,
            description: courseDetails.description || "",
            price: courseDetails.price,
            original_price: courseDetails.original_price,
            currency: courseDetails.currency,
            language: courseDetails.language || "zh",
            display_order: courseDetails.display_order,
            status: courseDetails.status as "draft" | "published" | "archived",
            is_featured: courseDetails.is_featured,
          });
          
          if (courseDetails.sections) {
            console.log("Loading sections:", courseDetails.sections);
            setSections(courseDetails.sections);
          } else {
            setSections([]);
          }

          // Clear any previous save states
          setSaveSuccess(false);
          setSaveError(null);
        } else {
          toast.error("找不到课程", { description: "未能找到指定的课程数据" });
          setSaveError("找不到课程");
        }
      } catch (err: any) {
        console.error("Error loading course:", err);
        toast.error("加载课程数据时出错");
        setSaveError(err.message || "加载课程数据时出错");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [courseId, form, isEditMode]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse, refreshKey]);

  const onSubmit = async (values: CourseFormValues) => {
    try {
      setSaving(true);
      setSaveSuccess(false);
      setSaveError(null);
      
      const courseData: CourseDataForInsert = {
        title: values.title,
        description: values.description,
        price: values.price,
        original_price: values.original_price,
        currency: values.currency,
        language: values.language,
        display_order: values.display_order,
        status: values.status,
        is_featured: values.is_featured,
      };
      
      let result;
      
      if (isEditMode && courseId) {
        const courseIdNum = parseInt(courseId);
        
        // Use the full course save function that also handles sections and lectures
        result = await saveFullCourse(courseIdNum, courseData, sections);
        
        if (result.success) {
          const currentTab = activeTab;
          
          setSaveSuccess(true);
          toast.success("课程保存成功", {
            description: "所有章节和课时已成功保存"
          });
          
          // Force refresh the components to get fresh data
          setTimeout(() => {
            setRefreshKey(prev => prev + 1);
          }, 500);
          
          navigate(`/admin/courses-new/${courseIdNum}?tab=${currentTab}`);
        } else {
          setSaveError(result.error?.message || "保存课程失败");
          throw new Error(result.error?.message || "更新课程失败");
        }
      } else {
        result = await createCourseNew(courseData);
        
        if (result.data) {
          setSaveSuccess(true);
          toast.success("课程创建成功");
          navigate(`/admin/courses-new/${result.data.id}`);
        } else {
          setSaveError(result.error?.message || "创建课程失败");
          throw new Error(result.error?.message || "创建课程失败");
        }
      }
    } catch (err: any) {
      console.error("Error saving course:", err);
      toast.error("保存课程失败", { description: err.message });
      setSaveError(err.message || "保存课程失败");
    } finally {
      setSaving(false);
    }
  };

  const handleForceRefresh = (e: React.MouseEvent) => {
    e.preventDefault(); // 防止页面刷新
    
    // Clear any cached data first
    if (courseId && courseId !== "new") {
      clearCourseLocalStorageData(parseInt(courseId));
    }
    // Then trigger a refresh
    setRefreshKey(prev => prev + 1);
    toast.info("重新加载课程数据中...");
  };

  const handleBackToList = (e: React.MouseEvent) => {
    e.preventDefault(); // 防止页面刷新
    navigate("/admin?tab=courses-new");
  };

  const statusOptions = [
    { value: "draft", label: "草稿" },
    { value: "published", label: "已发布" },
    { value: "archived", label: "已归档" },
  ];

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <p className="text-lg">加载课程数据...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={() => {}} 
        style={{ display: 'none' }} 
        accept="video/*"
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBackToList} type="button">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "编辑课程" : "创建新课程"}
          </h1>
        </div>
        <div className="flex gap-2">
          {isEditMode && (
            <Button
              onClick={handleForceRefresh}
              variant="outline"
              className="flex items-center gap-2"
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
          )}
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={saving}
            className="flex items-center gap-2"
            type="button"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            保存课程
          </Button>
        </div>
      </div>
      
      {saveSuccess && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>保存成功</AlertTitle>
          <AlertDescription>
            课程数据已成功保存。所有章节和课时信息已更新。
          </AlertDescription>
        </Alert>
      )}
      
      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>保存失败</AlertTitle>
          <AlertDescription>
            {saveError}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            基本信息
          </TabsTrigger>
          <TabsTrigger value="curriculum" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            课程大纲
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            其他设置
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            预览
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="basic" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>基本信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>课程名称</FormLabel>
                        <FormControl>
                          <Input placeholder="输入课程名称" {...field} />
                        </FormControl>
                        <FormDescription>
                          这是将展示在课程列表和页面上的名称
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
                            placeholder="简要描述这个课程..."
                            className="min-h-32"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          详细介绍课程内容和学习收获
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>课程价格</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>当前价格 (CNY)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="original_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>原价</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="可选"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => {
                                const value = e.target.value ? parseInt(e.target.value) : null;
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            原价 (CNY)，显示折扣效果
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>课程语言</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || "zh"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择课程语言" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {languageOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>课程的授课语言</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>状态</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="选择课程状态" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            草稿不会显示在前台，归档不会显示在课程列表
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="display_order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>显示顺序</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>
                            数值越小显示越靠前
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel>推荐课程</FormLabel>
                            <FormDescription>
                              推荐课程会在首页特别位置展示
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-4 py-4">
              {!isEditMode ? (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>课程大纲</CardTitle>
                  </CardHeader>
                  <CardContent className="py-6 flex justify-center">
                    <div className="text-center space-y-4 max-w-md">
                      <AlertCircle className="h-12 w-12 mx-auto text-yellow-500" />
                      <h3 className="text-xl font-medium text-gray-900">需要先保存课程基本信息</h3>
                      <p className="text-gray-500">
                        请完成并保存课程的基本信息，系统会创建课程后自动跳转到编辑页面，
                        您就可以编辑课程大纲了。
                      </p>
                      <Button
                        onClick={() => setActiveTab("basic")}
                        variant="outline"
                        className="mt-2"
                      >
                        返回基本信息
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <CourseOutlineEditor 
                  key={`outline-editor-${refreshKey}`}
                  courseId={parseInt(courseId as string)}
                  sections={sections}
                  onSectionsChange={setSections}
                  onSaveSuccess={() => {
                    setSaveSuccess(true);
                    // Schedule a refresh to get fresh data after changes
                    setTimeout(() => {
                      setRefreshKey(prev => prev + 1);
                    }, 500);
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 py-4">
              {!isEditMode ? (
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>其他设置</CardTitle>
                  </CardHeader>
                  <CardContent className="py-6 flex justify-center">
                    <div className="text-center space-y-4 max-w-md">
                      <AlertCircle className="h-12 w-12 mx-auto text-yellow-500" />
                      <h3 className="text-xl font-medium text-gray-900">需要先保存课程基本信息</h3>
                      <p className="text-gray-500">
                        请完成并保存课程的基本信息，系统会创建课程后自动跳转到编辑页面，
                        您就可以编辑课程的其他设置了。
                      </p>
                      <Button
                        onClick={() => setActiveTab("basic")}
                        variant="outline"
                        className="mt-2"
                      >
                        返回基本信息
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <CourseOtherSettings 
                  key={`settings-${refreshKey}`}
                  courseId={parseInt(courseId as string)}
                />
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>课程预览</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center py-8 text-gray-500">课程预览功能开发中...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default CourseNewEditor;
