import { useState, useEffect, useCallback, useRef } from 'react';
import { CourseSection, CourseLecture } from '@/lib/types/course-new';
import { toast } from 'sonner';
import { getSectionsByCourseId } from '@/lib/services/sectionService';
import { saveLecture, deleteLecture, updateLecture } from '@/lib/services/lectureService';

interface UseCourseOutlineManagerProps {
  courseId: number;
  initialSections?: CourseSection[];
  onSectionsChange?: (sections: CourseSection[]) => void;
}

export const useCourseOutlineManager = ({
  courseId,
  initialSections = [],
  onSectionsChange
}: UseCourseOutlineManagerProps) => {
  const [sections, setSections] = useState<CourseSection[]>(initialSections);
  const [expandedSectionIds, setExpandedSectionIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null);
  const loadAttempted = useRef(false);
  
  const loadSections = useCallback(async () => {
    if (!courseId) {
      console.log("[useCourseOutlineManager] 无效的课程ID:", courseId);
      setLoadError("未提供课程ID");
      return;
    }
    
    if (loading) {
      console.log("[useCourseOutlineManager] 已在加载中，跳过重复请求");
      return;
    }
    
    console.log("[useCourseOutlineManager] 开始加载课程ID:", courseId, "的章节");
    setLoading(true);
    setLoadError(null);
    
    try {
      if (isNaN(Number(courseId)) || Number(courseId) <= 0) {
        throw new Error("课程ID必须是有效的数字");
      }
      
      const { data, error } = await getSectionsByCourseId(Number(courseId));
      
      if (error) {
        console.error("[useCourseOutlineManager] 加载章节出错:", error);
        throw new Error(error.message || "加载章节失败");
      }
      
      if (data) {
        console.log(`[useCourseOutlineManager] 成功加载 ${data.length} 个章节`);
        
        if (data.length > 0 && data.length <= 5) {
          const newExpandedSet = new Set<string>();
          data.forEach(section => newExpandedSet.add(section.id));
          setExpandedSectionIds(newExpandedSet);
        }
        
        setSections(data);
        onSectionsChange?.(data);
      } else {
        console.log("[useCourseOutlineManager] 未找到章节，设置为空数组");
        setSections([]);
        onSectionsChange?.([]);
      }
      
      loadAttempted.current = true;
    } catch (err: any) {
      console.error("[useCourseOutlineManager] 加载章节失败:", err);
      setLoadError(err.message || "加载章节失败");
      toast.error("加载章节数据失败", {
        description: err.message || "请检查网络连接并重试"
      });
    } finally {
      console.log("[useCourseOutlineManager] 加载完成，重置loading状态");
      setLoading(false);
    }
  }, [courseId, loading, onSectionsChange]);
  
  useEffect(() => {
    if (courseId && !loadAttempted.current && initialSections.length === 0) {
      console.log("[useCourseOutlineManager] 首次加载或courseId变化，加载章节数据");
      loadSections();
    } else if (initialSections.length > 0) {
      console.log("[useCourseOutlineManager] 使用初始章节数据:", initialSections.length);
      setSections(initialSections);
      
      if (initialSections.length > 0 && initialSections.length <= 5) {
        const newExpandedSet = new Set<string>();
        initialSections.forEach(section => newExpandedSet.add(section.id));
        setExpandedSectionIds(newExpandedSet);
      }
    }
  }, [courseId, initialSections, loadSections]);
  
  useEffect(() => {
    return () => {
      loadAttempted.current = false;
    };
  }, []);
  
  const toggleSectionExpansion = useCallback((sectionId: string) => {
    setExpandedSectionIds(prev => {
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
    setSections(prevSections => {
      const updatedSections = prevSections.map(section => 
        section.id === sectionId ? { ...section, ...updates } : section
      );
      
      onSectionsChange?.(updatedSections);
      return updatedSections;
    });
  }, [onSectionsChange]);
  
  const addSection = useCallback((newSection: CourseSection) => {
    try {
      console.log("useCourseOutlineManager - 添加章节开始:", newSection);
      
      setSections(prevSections => {
        console.log("useCourseOutlineManager - 之前的章节数量:", prevSections.length);
        const updatedSections = [...prevSections, newSection];
        console.log("useCourseOutlineManager - 更新后的章节数量:", updatedSections.length);
        
        if (onSectionsChange) {
          console.log("useCourseOutlineManager - 调用onSectionsChange");
          onSectionsChange(updatedSections);
        }
        
        return updatedSections;
      });
      
      setExpandedSectionIds(prev => {
        console.log("useCourseOutlineManager - 设置展开章节");
        const newExpanded = new Set(prev);
        newExpanded.add(newSection.id);
        return newExpanded;
      });
      
      console.log("useCourseOutlineManager - 章节添加成功");
      return true;
    } catch (error) {
      console.error("useCourseOutlineManager - 添加章节失败:", error);
      return false;
    }
  }, [onSectionsChange]);
  
  const deleteSection = useCallback(async (sectionId: string) => {
    try {
      setSections(prevSections => {
        const updatedSections = prevSections.filter(section => section.id !== sectionId);
        onSectionsChange?.(updatedSections);
        return updatedSections;
      });
      
      setExpandedSectionIds(prev => {
        const newExpanded = new Set(prev);
        newExpanded.delete(sectionId);
        return newExpanded;
      });
      
      return true;
    } catch (error) {
      console.error("useCourseOutlineManager - 删除章节失败:", error);
      return false;
    }
  }, [onSectionsChange]);
  
  const addLecture = useCallback(async (
    sectionId: string, 
    title: string, 
    isFree: boolean = false
  ) => {
    try {
      console.log('useCourseOutlineManager: 添加新课时', { sectionId, title, isFree });
      const position = sections.find(s => s.id === sectionId)?.lectures?.length || 0;
      
      const { data, error } = await saveLecture({
        section_id: sectionId,
        title,
        is_free: isFree,
        position
      });
      
      if (error) {
        console.error('useCourseOutlineManager: 添加课时失败', error);
        toast.error("添加课时失败", { description: error.message });
        return false;
      }
      
      if (data && data.length > 0) {
        const newLecture = data[0];
        console.log('useCourseOutlineManager: 课时创建成功', newLecture);
        
        setSections(prevSections => {
          const updatedSections = prevSections.map(section => {
            if (section.id === sectionId) {
              return {
                ...section,
                lectures: [...(section.lectures || []), newLecture]
              };
            }
            return section;
          });
          
          onSectionsChange?.(updatedSections);
          return updatedSections;
        });
        
        toast.success("课时添加成功");
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('useCourseOutlineManager: 添加课时出错', err);
      toast.error("添加课时出错", { description: err.message });
      return false;
    }
  }, [sections, onSectionsChange]);
  
  const updateLecture = useCallback((
    sectionId: string,
    lectureId: string,
    updates: Partial<CourseLecture>
  ) => {
    setSections(prevSections => {
      const updatedSections = prevSections.map(section => {
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
      
      onSectionsChange?.(updatedSections);
      return updatedSections;
    });
    
    // 如果有需要可以调用API更新课时
  }, [onSectionsChange]);
  
  const deleteLecture = useCallback((sectionId: string, lectureId: string) => {
    setSections(prevSections => {
      const updatedSections = prevSections.map(section => {
        if (section.id === sectionId && section.lectures) {
          return {
            ...section,
            lectures: section.lectures.filter(lecture => lecture.id !== lectureId)
          };
        }
        return section;
      });
      
      onSectionsChange?.(updatedSections);
      return updatedSections;
    });
    
    toast.success("课时已删除", { description: "记得保存大纲以应用更改" });
  }, [onSectionsChange]);
  
  const updateLecturesOrder = useCallback((sectionId: string, updatedLectures: CourseLecture[]) => {
    setSections(prevSections => {
      const updatedSections = prevSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            lectures: updatedLectures
          };
        }
        return section;
      });
      
      onSectionsChange?.(updatedSections);
      return updatedSections;
    });
  }, [onSectionsChange]);
  
  const reorderSections = useCallback((updatedSections: CourseSection[]) => {
    setSections(updatedSections);
    onSectionsChange?.(updatedSections);
    toast.success("章节顺序已更新", { description: "记得保存大纲以应用更改" });
  }, [onSectionsChange]);
  
  const updateLectureHomeworkRequirement = useCallback((lectureId: string, requiresHomework: boolean) => {
    setSections(prevSections => {
      const updatedSections = prevSections.map(section => {
        if (section.lectures) {
          const hasLecture = section.lectures.some(lecture => lecture.id === lectureId);
          if (hasLecture) {
            return {
              ...section,
              lectures: section.lectures.map(lecture => 
                lecture.id === lectureId ? 
                { ...lecture, requires_homework_completion: requiresHomework } : 
                lecture
              )
            };
          }
        }
        return section;
      });
      
      onSectionsChange?.(updatedSections);
      return updatedSections;
    });
    
    toast.success(
      requiresHomework ? "已开启作业要求" : "已关闭作业要求", 
      { description: "记得保存大纲以应用更改" }
    );
  }, [onSectionsChange]);

  return {
    sections,
    loading,
    loadError,
    expandedSectionIds,
    deletingSectionId,
    toggleSectionExpansion,
    updateSection,
    addSection,
    deleteSection,
    addLecture,
    updateLecture,
    deleteLecture,
    updateLecturesOrder,
    reorderSections,
    refreshSections: loadSections,
    setDeletingSectionId,
    homeworkSettings: {
      updateLectureHomeworkRequirement
    }
  };
};
