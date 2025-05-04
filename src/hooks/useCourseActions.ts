
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getCourseNewById, saveFullCourse, clearCourseLocalStorageData } from "@/lib/services/courseNewService";
import { toast } from "sonner";
import { CourseSection, CourseDataForInsert } from "@/lib/types/course-new";
import { CourseFormValues } from "@/components/admin/course-editor/CourseBasicForm";

export const useCourseActions = (courseId?: string) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // 判断是否为编辑模式
  const isEditMode = courseId !== "new" && !!courseId;
  
  const saveCourse = useCallback(async (values: CourseFormValues, sections: CourseSection[] = []) => {
    // Prevent multiple submissions
    if (saving) {
      console.log("[useCourseActions 调试] Already saving, preventing duplicate submission");
      return false;
    }
    
    try {
      console.log("[useCourseActions 调试] 开始保存课程");
      console.log("[useCourseActions 调试] courseId:", courseId);
      console.log("[useCourseActions 调试] isEditMode:", isEditMode);
      
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
      
      console.log("[useCourseActions 调试] 课程数据:", courseData);
      let result;
      
      if (isEditMode && courseId) {
        const courseIdNum = parseInt(courseId);
        console.log("[useCourseActions 调试] 更新现有课程:", courseIdNum);
        result = await saveFullCourse(courseIdNum, courseData, sections);
        
        if (result.success) {
          setSaveSuccess(true);
          toast.success("课程更新成功");
          
          console.log("[useCourseActions 调试] 课程更新成功，准备导航");
          // 明确使用replace: true确保替换当前历史记录，避免返回按钮问题
          navigate(`/admin/courses-new/${courseIdNum}?tab=curriculum`, { replace: true });
          console.log("[useCourseActions 调试] 导航已执行");
          return true;
        } else {
          setSaveError(result.error?.message || "更新课程失败");
          toast.error("保存课程时出错", {
            description: result.error?.message
          });
          return false;
        }
      } else {
        // 创建新课程
        console.log("[useCourseActions 调试] 创建新课程:");
        const { data, error, success } = await saveFullCourse(0, courseData, sections);
        
        console.log("[useCourseActions 调试] 创建结果:", { success, data, error });
        
        if (error) {
          setSaveError(error.message || "创建课程失败");
          toast.error("创建课程失败", {
            description: error.message
          });
          return false;
        }
        
        if (success && data && data.id) {
          // 创建成功后直接导航到新课程的大纲页面
          setSaveSuccess(true);
          toast.success("课程创建成功");
          
          console.log("[useCourseActions 调试] 新课程ID:", data.id);
          console.log("[useCourseActions 调试] 准备导航到:", `/admin/courses-new/${data.id}?tab=curriculum`);
          
          // 使用硬重定向而不是React Router导航，确保页面完全重载
          window.location.href = `/admin/courses-new/${data.id}?tab=curriculum`;
          return data.id;
        } else {
          setSaveError("创建课程失败：无法获取新课程ID");
          toast.error("创建课程失败", {
            description: "无法获取新课程ID"
          });
          return false;
        }
      }
    } catch (err: any) {
      console.error("[useCourseActions 调试] Error saving course:", err);
      setSaveError(err.message || "保存课程时出错");
      toast.error("保存课程失败", {
        description: err.message
      });
      return false;
    } finally {
      // Always reset the saving state when done
      setSaving(false);
    }
  }, [courseId, isEditMode, saving, navigate]);
  
  const handleBack = useCallback(() => {
    navigate("/admin?tab=courses-new");
  }, [navigate]);
  
  const refreshCourse = useCallback(() => {
    if (courseId && courseId !== "new") {
      clearCourseLocalStorageData(parseInt(courseId));
      return true;
    }
    return false;
  }, [courseId]);
  
  return {
    isEditMode,
    saving,
    saveSuccess,
    saveError,
    saveCourse,
    handleBack,
    refreshCourse
  };
};
