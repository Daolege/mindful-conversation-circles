
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { getCourseById, saveCourse } from '@/lib/services/courseService';

// Type definitions for the context
export interface CourseEditorContextType {
  formData: any;
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
  
  // Load course data if editing
  useEffect(() => {
    const loadCourse = async () => {
      if (!numericCourseId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data } = await getCourseById(numericCourseId);
        
        if (data) {
          // Initialize syllabus if it doesn't exist or isn't an array
          let syllabus = data.syllabus || [];
          if (typeof syllabus === 'string') {
            try {
              syllabus = JSON.parse(syllabus);
            } catch (e) {
              console.error('Error parsing syllabus JSON:', e);
              syllabus = [];
            }
          }
          
          setFormData({
            ...data,
            description: data.description || '',
            syllabus: Array.isArray(syllabus) ? syllabus : [],
            materials: data.materials || [],
            requirements: data.requirements || [],
            whatyouwilllearn: data.whatYouWillLearn || data.whatyouwilllearn || [],
            target_audience: data.target_audience || [],
            highlights: data.highlights || []
          });
        }
      } catch (error) {
        console.error('Error loading course:', error);
        toast.error('加载课程数据失败');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCourse();
  }, [numericCourseId]);
  
  // Form submission handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    try {
      // Prepare data for saving
      const courseData = {
        ...formData,
        id: numericCourseId,
        // Ensure required fields
        display_order: formData.display_order || 0
      };
      
      const result = await saveCourse(courseData);
      if (result && result.data) {
        toast.success('课程保存成功');
      } else {
        toast.error('保存课程时出错');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('保存课程失败');
    } finally {
      setIsSaving(false);
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
    setActiveSaveSection(section);
    setSaving(true);
    setHasChanges(true);
    setSaveError(null);
  };

  const handleSaveComplete = (success: boolean, errorMessage?: string) => {
    setSaving(false);
    if (!success && errorMessage) {
      setSaveError(errorMessage);
    } else {
      setSaveError(null);
    }
    
    if (success && activeSaveSection) {
      // If a save section is tracked, mark it as saved
      if (value?.setSavedSection) {
        value.setSavedSection(activeSaveSection, true);
      }
    }
    
    // Reset active save section
    setActiveSaveSection(null);
  };
  
  // Combine context value with any provided external values
  const contextValue = {
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
    ...value // Merge with any provided values
  };
  
  return (
    <CourseEditorContext.Provider value={contextValue}>
      {children}
    </CourseEditorContext.Provider>
  );
};

export const useCourseEditor = () => useContext(CourseEditorContext);
