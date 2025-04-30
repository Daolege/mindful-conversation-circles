
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
}

const CourseEditorContext = createContext<CourseEditorContextType>({} as CourseEditorContextType);

export const CourseEditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  
  // Context value
  const value = {
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
    handleFormSubmit
  };
  
  return (
    <CourseEditorContext.Provider value={value}>
      {children}
    </CourseEditorContext.Provider>
  );
};

export const useCourseEditor = () => useContext(CourseEditorContext);
