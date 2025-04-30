import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableHead, TableHeader } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { useState, useRef } from "react";
import { DraggableCourseRow } from "./course/DraggableCourseRow";
import { transformCourseData } from "@/lib/types/course";
import { updateCourseOrder } from "@/lib/services/courseService";
import { CourseNew } from "@/lib/types/course-new";

// Helper function to convert Course to CourseNew type
const convertToNewCourseFormat = (course: any): CourseNew => {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    price: course.price,
    original_price: course.originalPrice,
    currency: "cny", // Default value
    display_order: course.display_order || 0,
    status: course.status || "draft", // Add default status
    is_featured: course.featured || false, // Convert featured to is_featured
    lecture_count: course.lectures,
    enrollment_count: course.studentCount,
    created_at: course.created_at || course.lastupdated,
    updated_at: course.lastupdated,
    published_at: course.published_at,
    category: course.category
  };
};

export const CourseManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const draggedItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses", searchTerm],
    queryFn: async () => {
      console.log("Fetching courses with search term:", searchTerm);
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error("Error fetching courses:", error);
        throw error;
      }
      
      const transformedData = data.map(course => transformCourseData(course));
      
      const filteredData = transformedData.filter(course => 
        !searchTerm || 
        course.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return filteredData;
    }
  });

  const { mutate: handleUpdateCourseOrder } = useMutation({
    mutationFn: async ({ courses }: { courses: { id: number; display_order: number }[] }) => {
      const success = await updateCourseOrder(courses);
      if (!success) throw new Error("Failed to update course order");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    },
    onError: (error) => {
      console.error("Error updating course order:", error);
      toast.error("更新课程顺序失败");
    }
  });

  const { mutate: deleteCourse } = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id as any);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      toast.success("课程已删除");
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    },
    onError: (error) => {
      console.error("Error deleting course:", error);
      toast.error("删除课程失败");
    }
  });

  const handleDragStart = (index: number) => {
    console.log("Drag started at index:", index);
    draggedItemIndex.current = index;
    setIsDragging(true);
  };

  const handleDragOver = (index: number) => {
    if (draggedItemIndex.current === null || !isDragging) return;
    
    dragOverItemIndex.current = index;
    console.log("Dragging over index:", index);
  };

  const handleDragEnd = async () => {
    console.log("Drag ended. Dragged from", draggedItemIndex.current, "to", dragOverItemIndex.current);
    
    if (
      draggedItemIndex.current === null || 
      dragOverItemIndex.current === null || 
      draggedItemIndex.current === dragOverItemIndex.current ||
      !courses
    ) {
      draggedItemIndex.current = null;
      dragOverItemIndex.current = null;
      setIsDragging(false);
      return;
    }
    
    const sourceIndex = draggedItemIndex.current;
    const destinationIndex = dragOverItemIndex.current;
    
    // Create a copy of the courses array
    const updatedCourses = [...courses];
    
    // Remove the dragged item
    const [draggedCourse] = updatedCourses.splice(sourceIndex, 1);
    
    // Insert it at the new position
    updatedCourses.splice(destinationIndex, 0, draggedCourse);
    
    // Visual update first (optimistic UI)
    queryClient.setQueryData(["admin-courses", searchTerm], updatedCourses);
    
    // Update display_order for all affected courses
    try {
      console.log("Updating course orders...");
      const coursesToUpdate = updatedCourses.map((course, index) => {
        return { 
          id: course.id, 
          display_order: index + 1 
        };
      });
      
      await handleUpdateCourseOrder({ courses: coursesToUpdate });
      toast.success("课程顺序已更新");
    } catch (error) {
      console.error("Error updating course order:", error);
      toast.error("更新课程顺序失败");
      // Revert the optimistic update
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
    }
    
    // Reset drag state
    draggedItemIndex.current = null;
    dragOverItemIndex.current = null;
    setIsDragging(false);
  };

  const handleAddCourse = () => navigate("/admin/courses/new");
  const handleEditCourse = (courseId: number) => navigate(`/admin/courses/${courseId}`);

  // Convert courses to CourseNew format before rendering
  const formattedCourses = courses?.map(course => convertToNewCourseFormat(course));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">课程管理</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative w-1/2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="搜索课程..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={handleAddCourse}
            className="flex items-center gap-1"
          >
            <Plus size={16} />
            添加课程
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : formattedCourses && formattedCourses.length > 0 ? (
          <Table>
            <TableHeader>
              <tr>
                <TableHead>ID</TableHead>
                <TableHead>课程名称</TableHead>
                <TableHead>价格</TableHead>
                <TableHead>报名人数</TableHead>
                <TableHead>发布时间</TableHead>
                <TableHead>操作</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {formattedCourses.map((course, index) => (
                <DraggableCourseRow
                  key={course.id}
                  course={course}
                  index={index}
                  onEdit={handleEditCourse}
                  onDelete={(courseId) => {
                    setCourseToDelete(courseId);
                    setDeleteDialogOpen(true);
                  }}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                />
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">未找到课程</p>
          </div>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除此课程吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => courseToDelete && deleteCourse(courseToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
