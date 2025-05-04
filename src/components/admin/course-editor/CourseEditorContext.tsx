import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getCourseNewById } from '@/lib/services/courseNewService';
import { supabase } from '@/integrations/supabase/client';
import { selectFromTable, deleteFromTable, insertIntoTable } from '@/lib/services/typeSafeSupabase';
import { getDefaultLearningObjectives, getDefaultLearningModes, getDefaultTargetAudience } from '@/lib/services/courseDefaultContentService';

// Define CourseMaterial type to fix TypeScript errors
interface CourseMaterial {
  id: string;
  course_id: number;
  name: string;
  url: string;
  position: number;
  is_visible: boolean;
}

// Type definitions for the context
export interface CourseEditorContextType {
  formData: {
    title: string;
    description: string;
    price: number;
    originalprice: number;
    category: string;
    instructor: string;
    language: string;
    level: string;
    duration: string;
    lectures: number;
    enrollment_count: number;
    display_order: number;
    featured: boolean;
    imageurl: string;
    video_url?: string;
    syllabus: any[];
    materials: CourseMaterial[];
    requirements: string[];
    whatyouwilllearn: string[];
    target_audience: string[];
    highlights: any[];
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  isSaving: boolean;
  editingSection: number | null;
  setEditingSection: React.Dispatch<React.SetStateAction<number | null>>;
  editingLecture: { sectionIndex: number; lectureIndex: number } | null;
  setEditingLecture: React.Dispatch<React.SetStateAction<{ sectionIndex: number; lectureIndex: number } | null>>;
  editingMaterial: number | null;
  setEditingMaterial: React.Dispatch<React.SetStateAction<number | null>>;
  newSectionTitle: string;
  setNewSectionTitle: React.Dispatch<React.SetStateAction<string>>;
  newLectureTitle: string;
  setNewLectureTitle: React.Dispatch<React.SetStateAction<string>>;
  newLectureDuration: string;
  setNewLectureDuration: React.Dispatch<React.SetStateAction<string>>;
  newMaterialName: string;
  setNewMaterialName: React.Dispatch<React.SetStateAction<string>>;
  newMaterialUrl: string;
  setNewMaterialUrl: React.Dispatch<React.SetStateAction<string>>;
  newObjective: string;
  setNewObjective: React.Dispatch<React.SetStateAction<string>>;
  newRequirement: string;
  setNewRequirement: React.Dispatch<React.SetStateAction<string>>;
  newAudienceItem: string;
  setNewAudienceItem: React.Dispatch<React.SetStateAction<string>>;
  newHighlight: string;
  setNewHighlight: React.Dispatch<React.SetStateAction<string>>;
  updateSectionTitle: (sectionIndex: number, title: string) => void;
  addSection: () => void;
  removeSection: (index: number) => void;
  addLecture: (sectionIndex: number) => void;
  removeLecture: (sectionIndex: number, lectureIndex: number) => void;
  addMaterial: () => void;
  removeMaterial: (index: number) => void;
  addObjective: () => void;
  removeObjective: (index: number) => void;
  addRequirement: () => void;
  removeRequirement: (index: number) => void;
  addAudienceItem: () => void;
  removeAudienceItem: (index: number) => void;
  addHighlight: () => void;
  removeHighlight: (index: number) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  // Add new properties for homework support
  data?: {
    id?: number;
    title?: string;
    description?: string;
  };
  saving: boolean;
  hasChanges: boolean;
  saveError: string | null;
  savedSections?: {
    objectives: boolean;
    requirements: boolean;
    audiences: boolean;
  };
  sectionVisibility?: {
    objectives: boolean;
    requirements: boolean;
    audiences: boolean;
    materials: boolean;
  };
  setSectionVisibility?: (visibility: any) => void;
  setSavedSection?: (section: string, value: boolean) => void;
  setHasChanges?: (hasChanges: boolean) => void;
  trackSaveAttempt: (section: string) => void;
  handleSaveComplete: (success: boolean, errorMessage?: string) => void;
  // Add missing handleChange function for CourseEditor.tsx
  handleChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const CourseEditorContext = createContext<CourseEditorContextType>({} as CourseEditorContextType);

export const CourseEditorProvider: React.FC<{ 
  children: React.ReactNode;
  value?: Partial<CourseEditorContextType>;
}> = ({ children, value }) => {
  // Basic state setup
  const { courseId } = useParams<{ courseId: string }>();
  const numericCourseId = courseId ? parseInt(courseId) : undefined;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    originalprice: 0,
    category: '',
    instructor: '',
    language: 'zh',
    level: '初级',
    duration: '',
    lectures: 0,
    enrollment_count: 0,
    display_order: 0,
    featured: false,
    imageurl: '',
    video_url: '',
    syllabus: [],
    materials: [],
    requirements: [],
    whatyouwilllearn: [],
    target_audience: [],
    highlights: []
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  
  // Editor state
  const [editingSection, setEditingSection] = useState<number | null>(null);
  const [editingLecture, setEditingLecture] = useState<{ sectionIndex: number; lectureIndex: number } | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<number | null>(null);
  
  // New item states
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newLectureTitle, setNewLectureTitle] = useState('');
  const [newLectureDuration, setNewLectureDuration] = useState('');
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialUrl, setNewMaterialUrl] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newRequirement, setNewRequirement] = useState('');
  const [newAudienceItem, setNewAudienceItem] = useState('');
  const [newHighlight, setNewHighlight] = useState('');
  
  // Add states for homework support
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeSaveSection, setActiveSaveSection] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false); // Add missing saveSuccess state
  
  // State for section visibility and saved status
  const [savedSections, setSavedSections] = useState({
    objectives: false,
    requirements: false,
    audiences: false
  });
  
  const [sectionVisibility, setSectionVisibility] = useState({
    objectives: true,
    requirements: true,
    audiences: true,
    materials: true
  });
  
  // Function to update saved sections
  const setSavedSection = (section: string, value: boolean) => {
    setSavedSections(prev => ({
      ...prev,
      [section]: value
    }));
  };
  
  // Load course data if editing
  useEffect(() => {
    const loadCourse = async () => {
      if (!numericCourseId) {
        // If creating new course, load default content
        setFormData(prev => ({
          ...prev,
          whatyouwilllearn: getDefaultLearningObjectives().map(item => item.text),
          requirements: getDefaultLearningModes().map(item => item.text),
          target_audience: getDefaultTargetAudience().map(item => item.text)
        }));
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('[CourseEditorContext] 开始加载课程数据:', numericCourseId);
        const response = await getCourseNewById(numericCourseId);
        
        if (response && response.error) {
          console.error('[CourseEditorContext] Error loading course with ID', numericCourseId, ':', response.error);
          toast.error('加载课程数据失败');
          setIsLoading(false);
          return;
        }
        
        // Handle response.data which can be CourseData or CourseData[]
        const courseData = response?.data;
        if (courseData && !Array.isArray(courseData)) {
          // Now TypeScript knows courseData is a single CourseData object
          const data = courseData;
          console.log('[CourseEditorContext] Loaded course data:', data);
          
          // For syllabus which may not exist in courses_new
          let syllabus = [];
          try {
            // Try to get syllabus from stringified JSON - using safe property access
            const syllabusData = data.syllabus_data || data.syllabus_json || '[]';
            if (typeof syllabusData === 'string') {
              syllabus = JSON.parse(syllabusData);
            } else if (syllabusData) {
              syllabus = syllabusData;
            }
          } catch (e) {
            console.error('[CourseEditorContext] Error parsing syllabus JSON:', e);
            syllabus = [];
          }
          
          // Helper function to safely parse JSON fields
          const safeParseJson = (field: any, defaultValue: any[] = []) => {
            if (!field) return defaultValue;
            if (typeof field === 'string') {
              try {
                return JSON.parse(field);
              } catch (e) {
                return defaultValue;
              }
            }
            return field;
          };
          
          // Prepare defaults for missing data
          let learningObjectives = getDefaultLearningObjectives().map(item => item.text);
          let requirements = getDefaultLearningModes().map(item => item.text);
          let targetAudience = getDefaultTargetAudience().map(item => item.text);
          
          // Add detailed logging for the data we're receiving
          console.log('[CourseEditorContext] 数据字段值:', {
            learning_objectives: data.learning_objectives,
            requirements: data.requirements,
            target_audience: data.target_audience,
          });
          
          // Map for properties with different names in courses_new
          const formattedData = {
            ...formData,
            ...data,
            // Map properties from courses_new to the expected format
            description: data.description || '',
            price: Number(data.price || 0),
            originalprice: Number(data.original_price || 0), // Map from original_price
            syllabus: Array.isArray(syllabus) ? syllabus : [],
            materials: data.materials || [],
            // Handle collections that might be stored in JSON fields in courses_new
            requirements: safeParseJson(data.requirements || data.requirements_data || data.requirements_json, requirements),
            whatyouwilllearn: safeParseJson(data.learning_objectives || data.learning_objectives_json, learningObjectives),
            target_audience: safeParseJson(data.target_audience || data.target_audience_data || data.audience_json || data.audience, targetAudience),
            highlights: safeParseJson(data.highlights || data.highlights_data || data.highlights_json, []),
            lectures: Number(data.lectures || data.lecture_count || 0),
            enrollment_count: Number(data.enrollment_count || 0),
            display_order: Number(data.display_order || 0),
            featured: Boolean(data.is_featured || false), // Map from is_featured
            language: data.language || 'zh',
            // Make sure imageurl is properly mapped
            imageurl: data.thumbnail_url || data.imageurl || ''
          };
          
          console.log('[CourseEditorContext] 格式化后的数据:', {
            requirements: formattedData.requirements.length,
            whatyouwilllearn: formattedData.whatyouwilllearn.length,
            target_audience: formattedData.target_audience.length,
          });
          setFormData(formattedData);
        } else {
          console.warn('[CourseEditorContext] No course data or unexpected format received:', courseData);
          // Still set default content for new course
          setFormData(prev => ({
            ...prev,
            whatyouwilllearn: getDefaultLearningObjectives().map(item => item.text),
            requirements: getDefaultLearningModes().map(item => item.text),
            target_audience: getDefaultTargetAudience().map(item => item.text)
          }));
        }
      } catch (error) {
        console.error('[CourseEditorContext] Error loading course:', error);
        toast.error('加载课程数据失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCourse();
  }, [numericCourseId]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Convert numeric values
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Form submission handler - Update to use courseNewService instead
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    try {
      setSaving(true);
      setSaveSuccess(false);
      setSaveError(null);
      
      // Import directly to avoid circular dependencies
      const { updateCourseNew, createCourseNew } = await import('@/lib/services/courseNewService');
      
      // Prepare data for saving to courses_new table
      const courseData = {
        id: numericCourseId,
        title: formData.title,
        description: formData.description,
        price: formData.price,
        original_price: formData.originalprice,
        category: formData.category,
        language: formData.language || 'zh',
        display_order: formData.display_order || 0,
        is_featured: formData.featured,
        // Map other fields needed
      };
      
      console.log('[CourseEditorContext] 保存课程基本数据:', courseData);
      
      let result;
      if (numericCourseId) {
        // Update existing course
        result = await updateCourseNew(numericCourseId, courseData);
      } else {
        // Create new course
        result = await createCourseNew(courseData);
      }
      
      if (result && result.data) {
        // Save was successful
        toast.success('课程基本信息保存成功');
        
        // Get the courseId (either existing or newly created)
        const courseId = numericCourseId || result.data.id;
        
        // 详细记录要保存的学习目标内容
        console.log('[CourseEditorContext] 准备保存学习目标:', {
          count: formData.whatyouwilllearn.length,
          items: formData.whatyouwilllearn.slice(0, 3)
        });
        
        let saveErrors = [];
        
        // 保存学习目标到数据库
        try {
          // 增强日志记录
          console.log(`[CourseEditorContext] 开始保存学习目标数据: ${formData.whatyouwilllearn.length}项`);
          
          if (await saveCourseCollectionItems('course_learning_objectives', courseId, formData.whatyouwilllearn)) {
            console.log('[CourseEditorContext] 学习目标保存成功');
            setSavedSection('objectives', true);
          } else {
            console.error('[CourseEditorContext] 学习目标保存失败，无明确错误');
            saveErrors.push('学习目标');
          }
        } catch (err) {
          console.error('[CourseEditorContext] 保存学习目标失败:', err);
          saveErrors.push('学习目标');
        }
        
        // 详细记录要保存的课程要求内容
        console.log('[CourseEditorContext] 准备保存课程要求:', {
          count: formData.requirements.length,
          items: formData.requirements.slice(0, 3)
        });
        
        // 保存课程要求到数据库
        try {
          // 增强日志记录
          console.log(`[CourseEditorContext] 开始保存课程要求数据: ${formData.requirements.length}项`);
          
          if (await saveCourseCollectionItems('course_requirements', courseId, formData.requirements)) {
            console.log('[CourseEditorContext] 课程要求保存成功');
            setSavedSection('requirements', true);
          } else {
            console.error('[CourseEditorContext] 课程要求保存失败，无明确错误');
            saveErrors.push('课程要求');
          }
        } catch (err) {
          console.error('[CourseEditorContext] 保存课程要求失败:', err);
          saveErrors.push('课程要求');
        }
        
        // 详细记录要保存的目标受众内容
        console.log('[CourseEditorContext] 准备保存适合人群:', {
          count: formData.target_audience.length,
          items: formData.target_audience.slice(0, 3)
        });
        
        // 保存目标受众到数据库
        try {
          // 增强日志记录
          console.log(`[CourseEditorContext] 开始保存适合人群数据: ${formData.target_audience.length}项`);
          
          if (await saveCourseCollectionItems('course_audiences', courseId, formData.target_audience)) {
            console.log('[CourseEditorContext] 适合人群保存成功');
            setSavedSection('audiences', true);
          } else {
            console.error('[CourseEditorContext] 适合人群保存失败，无明确错误');
            saveErrors.push('适合人群');
          }
        } catch (err) {
          console.error('[CourseEditorContext] 保存适合人群失败:', err);
          saveErrors.push('适合人群');
        }
        
        if (saveErrors.length > 0) {
          toast.warning(`部分内容保存失败: ${saveErrors.join(', ')}`);
        } else {
          toast.success('课程保存成功');
        }
        
        // 刷新React Query缓存，确保页面刷新后显示最新数据
        try {
          // 使用import动态导入避免循环依赖
          const { useQueryClient } = await import('@tanstack/react-query');
          // 直接调用useQueryClient会导致错误，因为它是一个React Hook
          // 所以我们使用window对象传递一个全局事件来触发缓存失效
          const event = new CustomEvent('invalidate-course-cache', { 
            detail: { courseId } 
          });
          window.dispatchEvent(event);
          console.log('[CourseEditorContext] 发送缓存失效事件，queryKey:', ['course-new', courseId]);
          
          // 强制刷新页面以确保获取最新数据
          // 这是一个不太优雅但非常有效的方法
          setTimeout(() => {
            window.location.href = `/courses-new/${courseId}?t=${Date.now()}`;
          }, 1500);
        } catch (err) {
          console.error('[CourseEditorContext] Error invalidating React Query cache:', err);
        }
        
      } else {
        toast.error('保存课程时出错');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('保存课程失败');
    } finally {
      setIsSaving(false);
      setSaving(false);
    }
  };

  // Helper function to save collection items (learning objectives, requirements, or target audience)
  const saveCourseCollectionItems = async (
    tableName: 'course_learning_objectives' | 'course_requirements' | 'course_audiences', 
    courseId: number, 
    items: string[]
  ) => {
    try {
      console.log(`[CourseEditorContext] 开始保存 ${tableName} 数据:`, {
        courseId,
        itemCount: items.length,
        firstItem: items.length > 0 ? items[0] : 'none'
      });
      
      // 首先检查表是否存在
      const { data: tableCheck, error: tableError } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);
        
      if (tableError) {
        console.error(`[CourseEditorContext] 表 ${tableName} 访问错误:`, tableError);
        throw new Error(`表 ${tableName} 访问错误: ${tableError.message}`);
      }
      
      console.log(`[CourseEditorContext] 表 ${tableName} 访问成功`);
      
      // First, delete existing items for this course to prevent duplicates
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('course_id', courseId);
        
      if (deleteError) {
        console.error(`[CourseEditorContext] 删除现有 ${tableName} 时出错:`, deleteError);
        throw deleteError;
      }
      
      console.log(`[CourseEditorContext] 成功删除课程 ${courseId} 的现有 ${tableName} 项`);
      
      // Then insert all items with positions
      if (items.length > 0) {
        // 创建插入项目的数组
        const itemsToInsert = items.map((content, index) => ({
          course_id: courseId,
          content,
          position: index,
          is_visible: true
        }));
        
        console.log(`[CourseEditorContext] 准备插入的 ${tableName} 数据:`, {
          count: itemsToInsert.length,
          samples: itemsToInsert.slice(0, 2)
        });
        
        // 使用更直接的插入方式，避免typeSafeSupabase可能的问题
        const { data, error } = await supabase
          .from(tableName)
          .insert(itemsToInsert)
          .select();
          
        if (error) {
          console.error(`[CourseEditorContext] 插入 ${tableName} 时出错:`, error);
          throw error;
        }
        
        console.log(`[CourseEditorContext] 成功保存了 ${items.length} 项到 ${tableName}:`, {
          insertedCount: data?.length || 0
        });
      } else {
        console.log(`[CourseEditorContext] ${tableName} 没有项目需要保存`);
      }
      
      return true;
    } catch (err) {
      console.error(`[CourseEditorContext] saveCourseCollectionItems 异常 (${tableName}):`, err);
      throw err;
    }
  };
  
  // Section handlers
  const updateSectionTitle = (sectionIndex: number, title: string) => {
    const updatedSyllabus = [...formData.syllabus];
    updatedSyllabus[sectionIndex].title = title;
    setFormData({ ...formData, syllabus: updatedSyllabus });
  };
  
  const addSection = () => {
    if (!newSectionTitle.trim()) {
      toast.error('请输入章节标题');
      return;
    }
    
    const updatedSyllabus = [...formData.syllabus, {
      title: newSectionTitle,
      lectures: []
    }];
    
    setFormData({ ...formData, syllabus: updatedSyllabus });
    setNewSectionTitle('');
  };
  
  const removeSection = (index: number) => {
    const updatedSyllabus = [...formData.syllabus];
    updatedSyllabus.splice(index, 1);
    setFormData({ ...formData, syllabus: updatedSyllabus });
  };
  
  // Lecture handlers
  const addLecture = (sectionIndex: number) => {
    if (!newLectureTitle.trim()) {
      toast.error('请输入课时标题');
      return;
    }
    
    const updatedSyllabus = [...formData.syllabus];
    updatedSyllabus[sectionIndex].lectures.push({
      title: newLectureTitle,
      duration: newLectureDuration
    });
    
    setFormData({ ...formData, syllabus: updatedSyllabus });
    setNewLectureTitle('');
    setNewLectureDuration('');
  };
  
  const removeLecture = (sectionIndex: number, lectureIndex: number) => {
    const updatedSyllabus = [...formData.syllabus];
    updatedSyllabus[sectionIndex].lectures.splice(lectureIndex, 1);
    setFormData({ ...formData, syllabus: updatedSyllabus });
  };
  
  // Material handlers
  const addMaterial = () => {
    if (!newMaterialName.trim() || !newMaterialUrl.trim()) {
      toast.error('请输入资料名称和链接');
      return;
    }
    
    const updatedMaterials = [
      ...formData.materials, 
      {
        id: `temp-${Date.now()}`,
        course_id: numericCourseId || 0,
        name: newMaterialName,
        url: newMaterialUrl,
        position: formData.materials.length,
        is_visible: true
      }
    ];
    
    setFormData({ ...formData, materials: updatedMaterials });
    setNewMaterialName('');
    setNewMaterialUrl('');
  };
  
  const removeMaterial = (index: number) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials.splice(index, 1);
    setFormData({ ...formData, materials: updatedMaterials });
  };
  
  // Learning objectives handlers
  const addObjective = () => {
    if (!newObjective.trim()) return;
    
    setFormData({
      ...formData,
      whatyouwilllearn: [...formData.whatyouwilllearn, newObjective]
    });
    setNewObjective('');
  };
  
  const removeObjective = (index: number) => {
    const updatedObjectives = [...formData.whatyouwilllearn];
    updatedObjectives.splice(index, 1);
    setFormData({ ...formData, whatyouwilllearn: updatedObjectives });
  };
  
  // Requirements handlers
  const addRequirement = () => {
    if (!newRequirement.trim()) return;
    
    setFormData({
      ...formData,
      requirements: [...formData.requirements, newRequirement]
    });
    setNewRequirement('');
  };
  
  const removeRequirement = (index: number) => {
    const updatedRequirements = [...formData.requirements];
    updatedRequirements.splice(index, 1);
    setFormData({ ...formData, requirements: updatedRequirements });
  };
  
  // Target audience handlers
  const addAudienceItem = () => {
    if (!newAudienceItem.trim()) return;
    
    setFormData({
      ...formData,
      target_audience: [...formData.target_audience, newAudienceItem]
    });
    setNewAudienceItem('');
  };
  
  const removeAudienceItem = (index: number) => {
    const updatedAudience = [...formData.target_audience];
    updatedAudience.splice(index, 1);
    setFormData({ ...formData, target_audience: updatedAudience });
  };
  
  // Highlights handlers
  const addHighlight = () => {
    if (!newHighlight.trim()) return;
    
    setFormData({
      ...formData,
      highlights: [...formData.highlights, newHighlight]
    });
    setNewHighlight('');
  };
  
  const removeHighlight = (index: number) => {
    const updatedHighlights = [...formData.highlights];
    updatedHighlights.splice(index, 1);
    setFormData({ ...formData, highlights: updatedHighlights });
  };
  
  // New handlers for homework support
  const trackSaveAttempt = (section: string) => {
    console.log('[CourseEditorContext] Tracking save attempt for section:', section);
    setActiveSaveSection(section);
    setSaving(true);
    setHasChanges(true);
    setSaveError(null);
  };

  const handleSaveComplete = (success: boolean, errorMessage?: string) => {
    console.log('[CourseEditorContext] Save complete -', success ? 'SUCCESS' : 'FAILED', errorMessage || '');
    setSaving(false);
    if (!success && errorMessage) {
      setSaveError(errorMessage);
    } else {
      setSaveError(null);
    }
    
    if (success && activeSaveSection) {
      // If a save section is tracked, mark it as saved
      setSavedSection(activeSaveSection, true);
    }
    
    // Reset active save section
    setActiveSaveSection(null);
  };
  
  // Combine context value with any provided external values
  const contextValue: CourseEditorContextType = {
    formData,
    setFormData,
    activeTab,
    setActiveTab,
    isLoading,
    isSaving,
    editingSection,
    setEditingSection,
    editingLecture,
    setEditingLecture,
    editingMaterial,
    setEditingMaterial,
    newSectionTitle,
    setNewSectionTitle,
    newLectureTitle,
    setNewLectureTitle,
    newLectureDuration,
    setNewLectureDuration,
    newMaterialName,
    setNewMaterialName,
    newMaterialUrl,
    setNewMaterialUrl,
    newObjective,
    setNewObjective,
    newRequirement,
    setNewRequirement,
    newAudienceItem,
    setNewAudienceItem,
    newHighlight,
    setNewHighlight,
    updateSectionTitle,
    addSection,
    removeSection,
    addLecture,
    removeLecture,
    addMaterial,
    removeMaterial,
    addObjective,
    removeObjective,
    addRequirement,
    removeRequirement,
    addAudienceItem,
    removeAudienceItem,
    addHighlight,
    removeHighlight,
    handleFormSubmit,
    // New properties for homework support
    saving,
    hasChanges,
    saveError,
    trackSaveAttempt,
    handleSaveComplete,
    // Add handleChange function
    handleChange,
    // Add saved sections and section visibility
    savedSections,
    sectionVisibility,
    setSectionVisibility,
    setSavedSection,
    setHasChanges,
    data: {
      id: numericCourseId,
      title: formData.title,
      description: formData.description
    },
    ...value // Merge with any provided values
  };
  
  return (
    <CourseEditorContext.Provider value={contextValue}>
      {children}
    </CourseEditorContext.Provider>
  );
};

export const useCourseEditor = () => useContext(CourseEditorContext);
