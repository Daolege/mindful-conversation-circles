import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  getCourseById,
  saveCourse,
  updateCourseOrder,
} from "@/lib/services/courseService";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { supabase } from "@/integrations/supabase/client";

// Function to get all courses
const getCourses = async () => {
  try {
    const { data, error } = await supabase
      .from('courses_new')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Function to create a new course
const createCourse = async (courseData) => {
  try {
    const { data, error } = await saveCourse(courseData);
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Function to update a course
const updateCourse = async (courseData) => {
  try {
    const { data, error } = await saveCourse(courseData);
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// Function to delete a course
const deleteCourse = async (courseId) => {
  try {
    const { data, error } = await supabase
      .from('courses_new')
      .delete()
      .eq('id', courseId);
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

const courseSchema = z.object({
  title: z.string().min(2, {
    message: "标题必须至少包含 2 个字符",
  }),
  description: z.string().optional(),
  price: z.coerce.number(),
  category: z.string().optional(),
  instructor: z.string().optional(),
  language: z.string().optional(),
  level: z.string().optional(),
  duration: z.string().optional(),
  lectures: z.coerce.number().optional(),
  enrollment_count: z.coerce.number().optional(),
  display_order: z.coerce.number().optional(),
  featured: z.boolean().optional(),
  imageurl: z.string().optional(),
});

const CourseManagement = () => {
  const [open, setOpen] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [reorderLoading, setReorderLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof courseSchema>>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      category: "",
      instructor: "",
      language: "",
      level: "",
      duration: "",
      lectures: 0,
      enrollment_count: 0,
      display_order: 0,
      featured: false,
      imageurl: "",
    },
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });

  const { mutate: addCourse, isPending: isAdding } = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("课程已成功创建");
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("创建课程时出错");
      console.error("Error creating course:", error);
    },
  });

  const { mutate: changeCourse, isPending: isChanging } = useMutation({
    mutationFn: updateCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("课程已成功更新");
      setOpen(false);
      setEditCourse(null);
      form.reset();
    },
    onError: (error) => {
      toast.error("更新课程时出错");
      console.error("Error updating course:", error);
    },
  });

  const { mutate: removeCourse, isPending: isRemoving } = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("课程已成功删除");
      setOpen(false);
      setEditCourse(null);
      form.reset();
    },
    onError: (error) => {
      toast.error("删除课程时出错");
      console.error("Error deleting course:", error);
    },
  });

  useEffect(() => {
    if (editCourse) {
      setOpen(true);
      form.setValue("title", editCourse.title);
      form.setValue("description", editCourse.description || "");
      form.setValue("price", editCourse.price);
      form.setValue("category", editCourse.category || "");
      form.setValue("instructor", editCourse.instructor || "");
      form.setValue("language", editCourse.language || "");
      form.setValue("level", editCourse.level || "");
      form.setValue("duration", editCourse.duration || "");
      form.setValue("lectures", editCourse.lectures || 0);
      form.setValue("enrollment_count", editCourse.enrollment_count || 0);
      form.setValue("display_order", editCourse.display_order || 0);
      form.setValue("featured", editCourse.featured || false);
      form.setValue("imageurl", editCourse.imageurl || "");
    }
  }, [editCourse, form]);

  const onSubmit = (values: z.infer<typeof courseSchema>) => {
    if (editCourse) {
      changeCourse({ id: editCourse.id, ...values });
    } else {
      addCourse(values);
    }
  };

  const handleDelete = () => {
    if (editCourse) {
      removeCourse(editCourse.id);
    }
  };

  const handleOpen = () => {
    setEditCourse(null);
    form.reset();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditCourse(null);
    form.reset();
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = reorder(
      courses || [],
      result.source.index,
      result.destination.index
    );

    handleCoursesReorder(items);
  };

  const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const handleCoursesReorder = async (newCourses: any[]) => {
    try {
      setReorderLoading(true);
      console.log("[CourseManagement] Reordering courses:", newCourses);
      
      // Extract just the course IDs for the updateCourseOrder function
      const courseIds: number[] = newCourses.map(course => course.id);
      
      const result = await updateCourseOrder(courseIds);
      
      if (result.success) {
        toast.success("课程顺序已更新");
      } else {
        toast.error("更新课程顺序失败");
        console.error("[CourseManagement] Error updating course order:", result.error);
      }
      
    } catch (error) {
      console.error("[CourseManagement] Error in handleCoursesReorder:", error);
      toast.error("更新课程顺序时出错");
    } finally {
      setReorderLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">课程管理</h1>
        <Button onClick={handleOpen} disabled={isAdding}>
          <Plus className="mr-2 h-4 w-4" />
          添加课程
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editCourse ? "编辑课程" : "创建课程"}</DialogTitle>
            <DialogDescription>
              {editCourse
                ? "编辑课程信息，完成后点击保存。"
                : "创建一个新的课程，填写以下信息。"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>标题</FormLabel>
                    <FormControl>
                      <Input placeholder="课程标题" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>描述</FormLabel>
                    <FormControl>
                      <Input placeholder="课程描述" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>价格</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="课程价格" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>分类</FormLabel>
                    <FormControl>
                      <Input placeholder="课程分类" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instructor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>讲师</FormLabel>
                    <FormControl>
                      <Input placeholder="讲师姓名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>语言</FormLabel>
                    <FormControl>
                      <Input placeholder="课程语言" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>级别</FormLabel>
                    <FormControl>
                      <Input placeholder="课程级别" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>持续时间</FormLabel>
                    <FormControl>
                      <Input placeholder="课程时长" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lectures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>讲座</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="课程讲座" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="enrollment_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>招生人数</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="课程招生" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>显示顺序</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="课程显示" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>特色</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(value === 'true')}
                        defaultValue={field.value ? 'true' : 'false'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择是否特色" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">是</SelectItem>
                          <SelectItem value="false">否</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageurl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>图片网址</FormLabel>
                    <FormControl>
                      <Input placeholder="课程图片" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                {editCourse && (
                  <Button
                    type="button"
                    variant="destructive"
                    className="mr-2"
                    onClick={handleDelete}
                    disabled={isRemoving}
                  >
                    {isRemoving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="mr-2 h-4 w-4" />
                    )}
                    删除
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isAdding || isChanging}
                >
                  {isAdding || isChanging ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "提交"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          加载课程中...
        </div>
      ) : courses && courses.length > 0 ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <Table>
            <TableCaption>课程列表</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">排序</TableHead>
                <TableHead>标题</TableHead>
                <TableHead>价格</TableHead>
                <TableHead>类别</TableHead>
                <TableHead>讲师名称</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <Droppable droppableId="courses">
              {(provided) => (
                <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                  {courses.map((course, index) => (
                    <Draggable
                      key={course.id}
                      draggableId={String(course.id)}
                      index={index}
                    >
                      {(provided) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <TableCell className="text-center">
                            <GripVertical className="cursor-move" />
                          </TableCell>
                          <TableCell>{course.title}</TableCell>
                          <TableCell>{course.price}</TableCell>
                          <TableCell>{course.category}</TableCell>
                          <TableCell>{course.instructor_name || '未知讲师'}</TableCell>
                          <TableCell>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditCourse(course)}
                            >
                              编辑
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </DragDropContext>
      ) : (
        <p>没有找到课程。</p>
      )}
    </div>
  );
};

export { CourseManagement };
