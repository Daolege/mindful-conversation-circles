import { useState, useEffect, useCallback, useRef } from 'react';
import { CourseSection, CourseLecture } from '@/lib/types/course-new';
import { toast } from 'sonner';
import { getSectionsByCourseId } from '@/lib/services/sectionService';
import { 
  saveLecture, 
  deleteLecture,
  updateLecture
} from '@/lib/services/lectureService';

interface UseCourseOutlineProps {
  courseId: number;
  initialSections?: CourseSection[];
  onSectionsChange?: (sections: CourseSection[]) => void;
}

export const useCourseOutline = ({
  courseId,
  initialSections = [],
  onSectionsChange
}: UseCourseOutlineProps) => {
  const [sections, setSections] = useState<CourseSection[]>(initialSections);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);
  const [localCacheKey] = useState(`course_outline_${courseId}_draft`);
  const [savingProgress, setSavingProgress] = useState(0);
  const [apiRequestCount, setApiRequestCount] = useState(0);
  const isInitialLoadComplete = useRef(false);
  
  const loadSections = useCallback(async (forceNumericId?: number) => {
    // 使用传入的强制ID或课程ID
    const effectiveCourseId = forceNumericId || courseId;
    
    if (!effectiveCourseId) {
      console.error("[useCourseOutline 调试] No courseId provided");
      setLoadError("未提供课程ID");
      return;
    }
    
    console.log("[useCourseOutline 调试] Loading sections for courseId:", effectiveCourseId);
    console.log("[useCourseOutline 调试] courseId type:", typeof effectiveCourseId);
    
    if (loading) {
      console.log("[useCourseOutline 调试] Already loading, skipping duplicate request");
      return;
    }
    
    setLoading(true);
    setLoadError(null);
    setApiRequestCount(prev => prev + 1);
    
    try {
      // 确保ID是数字
      const numericId = Number(effectiveCourseId);
      if (isNaN(numericId) || numericId <= 0) {
        console.error("[useCourseOutline 调试] Invalid numeric ID:", numericId);
        throw new Error("课程ID必须是有效的数字");
      }
      
      console.log("[useCourseOutline 调试] Starting API call to getSectionsByCourseId with ID:", numericId);
      const { data, error } = await getSectionsByCourseId(numericId);
      console.log("[useCourseOutline 调试] API call completed");
      console.log("[useCourseOutline 调试] API response:", { data, error });
      
      if (error) {
        console.error("[useCourseOutline 调试] API error:", error);
        throw new Error(error.message);
      }
      
      if (data) {
        console.log("[useCourseOutline 调试] Sections loaded successfully:", data.length, data);
        if (data.length > 0 && data.length <= 5) {
          const newExpandedSet = new Set<string>();
          data.forEach(section => newExpandedSet.add(section.id));
          setExpandedSections(newExpandedSet);
        }

        setSections(data);
        onSectionsChange?.(data);
      } else {
        console.log("[useCourseOutline 调试] No sections found, setting empty array");
        setSections([]);
        onSectionsChange?.([]);
      }
      
      isInitialLoadComplete.current = true;
    } catch (err: any) {
      console.error("[useCourseOutline 调试] Failed to load sections:", err);
      console.error("[useCourseOutline 调试] Error details:", err.stack || "No stack trace");
      setLoadError(err.message || "加载章节失败");
      toast.error("加载章节数据失败");
    } finally {
      console.log("[useCourseOutline 调试] Finished loading attempt, setting loading to false");
      console.log("[useCourseOutline 调试] Total API requests made:", apiRequestCount + 1);
      setLoading(false);
    }
  }, [courseId, onSectionsChange, apiRequestCount, loading]);
  
  // 尝试通过不同方式获取课程ID并加载数据，但只在初始化时执行一次
  useEffect(() => {
    // 防止重复加载，使用ref追踪是否已完成初始加载
    if (isInitialLoadComplete.current) {
      console.log("[useCourseOutline 调试] Initial load already completed, skipping");
      return;
    }
    
    console.log("[useCourseOutline 调试] Effect triggered with courseId:", courseId);
    console.log("[useCourseOutline 调试] initialSections length:", initialSections?.length || 0);
    
    // 尝试从URL解析课程ID作为备份
    const pathParts = window.location.pathname.split('/');
    const courseIdFromPath = pathParts[pathParts.length - 1];
    let numericCourseId = courseId;
    
    // 如果courseId无效，尝试从URL获取
    if (!numericCourseId || isNaN(Number(numericCourseId)) || Number(numericCourseId) <= 0) {
      if (courseIdFromPath && !isNaN(Number(courseIdFromPath))) {
        numericCourseId = Number(courseIdFromPath);
        console.log("[useCourseOutline 调试] Using courseId from URL:", numericCourseId);
      }
    }
    
    if (initialSections?.length) {
      console.log("[useCourseOutline 调试] Using initialSections");
      setSections(initialSections);
      
      try {
        const cachedSections = localStorage.getItem(localCacheKey);
        if (cachedSections) {
          console.log("[useCourseOutline 调试] Found cached sections");
          const parsedSections = JSON.parse(cachedSections);
          if (Array.isArray(parsedSections) && parsedSections.length > 0) {
            console.log("[useCourseOutline 调试] Using cached sections:", parsedSections.length);
            setSections(parsedSections);
            onSectionsChange?.(parsedSections);
            
            if (parsedSections.length <= 5) {
              const newExpandedSet = new Set<string>();
              parsedSections.forEach(section => newExpandedSet.add(section.id));
              setExpandedSections(newExpandedSet);
            }
            
            isInitialLoadComplete.current = true;
          }
        } else {
          console.log("[useCourseOutline 调试] No cached sections found");
        }
      } catch (error) {
        console.error("[useCourseOutline 调试] Error loading cached sections:", error);
      }
    } else if (numericCourseId) {
      console.log("[useCourseOutline 调试] No initialSections, calling loadSections with ID:", numericCourseId);
      loadSections(Number(numericCourseId));
    } else {
      console.log("[useCourseOutline 调试] No courseId and no initialSections");
      setLoadError("无法确定课程ID");
    }
  }, [courseId, initialSections, localCacheKey, loadSections, onSectionsChange]);
  
  // 只在sections变化且不等于initialSections时才保存到localStorage
  useEffect(() => {
    if (sections !== initialSections && sections.length > 0 && isInitialLoadComplete.current) {
      try {
        localStorage.setItem(localCacheKey, JSON.stringify(sections));
        console.log("[useCourseOutline 调试] Saved sections to localStorage, key:", localCacheKey);
      } catch (error) {
        console.error("[useCourseOutline 调试] Error saving sections to localStorage:", error);
      }
    }
  }, [sections, localCacheKey, initialSections]);
  
  // ... 保留其他函数代码 ...

  const toggleSectionExpansion = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return newExpanded;
    });
  }, []);
  
  const updateSection = useCallback((sectionId: string, updates: Partial<CourseSection>) => {
    setSections(prevSections =>
      prevSections.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      )
    );
    
    const updatedSections = sections.map(section => 
      section.id === sectionId ? { ...section, ...updates } : section
    );
    onSectionsChange?.(updatedSections);
  }, [sections, onSectionsChange]);
  
  const addSection = useCallback((newSection: CourseSection) => {
    try {
      setSections(prevSections => {
        const updatedSections = [...prevSections, newSection];
        if (onSectionsChange) {
          onSectionsChange(updatedSections);
        }
        return updatedSections;
      });
      return true;
    } catch (error) {
      console.error("添加章节失败:", error);
      return false;
    }
  }, [onSectionsChange]);
  
  const deleteSection = useCallback(async (sectionId: string) => {
    try {
      setSections(prevSections => {
        const updatedSections = prevSections.filter(section => section.id !== sectionId);
        if (onSectionsChange) {
          onSectionsChange(updatedSections);
        }
        return updatedSections;
      });
      
      setExpandedSections(prev => {
        const newExpanded = new Set(prev);
        newExpanded.delete(sectionId);
        return newExpanded;
      });
      
      return true;
    } catch (error) {
      console.error("删除章节失败:", error);
      return false;
    }
  }, [onSectionsChange]);
  
  const addLecture = useCallback(async (
    sectionId: string, 
    title: string, 
    isFree: boolean = false
  ) => {
    try {
      const position = sections.find(s => s.id === sectionId)?.lectures?.length || 0;
      const { data, error } = await saveLecture({
        section_id: sectionId,
        title,
        is_free: isFree,
        position
      });
      
      if (error) {
        toast.error("添加课时失败", { description: error.message });
        return false;
      }
      
      if (data && data.length > 0) {
        const newLecture = data[0];
        const updatedSections = sections.map(section => {
          if (section.id === sectionId) {
            return {
              ...section,
              lectures: [...(section.lectures || []), newLecture]
            };
          }
          return section;
        });
        
        setSections(updatedSections);
        onSectionsChange?.(updatedSections);
        toast.success("课时添加成功");
        return true;
      }
      
      return false;
    } catch (err: any) {
      toast.error("添加课时出错", { description: err.message });
      return false;
    }
  }, [sections, onSectionsChange]);
  
  const updateLectureInSection = useCallback((
    sectionId: string,
    lectureId: string,
    updates: Partial<CourseLecture>
  ) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId && section.lectures) {
        return {
          ...section,
          lectures: section.lectures.map(lecture => 
            lecture.id === lectureId ? { ...lecture, ...updates } : lecture
          )
        };
      }
      return section;
    });
    
    setSections(updatedSections);
    onSectionsChange?.(updatedSections);
  }, [sections, onSectionsChange]);
  
  const deleteLectureFromSection = useCallback((sectionId: string, lectureId: string) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId && section.lectures) {
        return {
          ...section,
          lectures: section.lectures.filter(lecture => lecture.id !== lectureId)
        };
      }
      return section;
    });
    
    setSections(updatedSections);
    onSectionsChange?.(updatedSections);
    toast.success("课时已删除", { description: "记得保存大纲以应用更改" });
  }, [sections, onSectionsChange]);
  
  const updateLecturesOrder = useCallback((sectionId: string, updatedLectures: CourseLecture[]) => {
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          lectures: updatedLectures
        };
      }
      return section;
    });
    
    setSections(updatedSections);
    onSectionsChange?.(updatedSections);
  }, [sections, onSectionsChange]);
  
  const refreshData = useCallback(() => {
    console.log("[useCourseOutline 调试] Refreshing data for courseId:", courseId);
    
    // 重置初始化标记，允许重新加载
    isInitialLoadComplete.current = false;
    
    // 尝试从URL解析课程ID作为备份
    const pathParts = window.location.pathname.split('/');
    const courseIdFromPath = pathParts[pathParts.length - 1];
    let effectiveCourseId = courseId;
    
    // 如果courseId无效，尝试从URL获取
    if (!effectiveCourseId || isNaN(Number(effectiveCourseId)) || Number(effectiveCourseId) <= 0) {
      if (courseIdFromPath && !isNaN(Number(courseIdFromPath))) {
        effectiveCourseId = Number(courseIdFromPath);
        console.log("[useCourseOutline 调试] Using courseId from URL for refresh:", effectiveCourseId);
      }
    }
    
    loadSections(Number(effectiveCourseId));
    toast.info("正在刷新章节数据...");
  }, [courseId, loadSections]);
  
  return {
    sections,
    setSections,
    expandedSections,
    loading,
    loadError,
    deletingSectionId,
    savingProgress,
    toggleSectionExpansion,
    updateSection,
    addSection,
    deleteSection,
    addLecture,
    updateLectureInSection,
    deleteLectureFromSection,
    updateLecturesOrder,
    refreshData,
    setDeletingSectionId
  };
};
