
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CourseEditorContextType } from './types';
import { toast } from 'sonner';

// Create a default context value
const defaultContextValue: CourseEditorContextType = {
  data: {},
  saving: false,
  hasChanges: false,
  saveError: null,
  savedSections: {
    objectives: false,
    requirements: false,
    audiences: false
  },
  sectionVisibility: {
    objectives: true,
    requirements: true,
    audiences: true,
    materials: false // Default materials to hidden
  },
  setSaving: () => {},
  setHasChanges: () => {},
  setSaveError: () => {},
  setSavedSection: () => {},
  setSectionVisibility: () => {},
  trackSaveAttempt: () => {},
  handleSaveComplete: () => {},
};

const CourseEditorContext = createContext<CourseEditorContextType | undefined>(undefined);

interface CourseEditorProviderProps {
  children: React.ReactNode;
  value?: Partial<CourseEditorContextType>;
}

export const CourseEditorProvider = ({ children, value }: CourseEditorProviderProps) => {
  const [saving, setSaving] = useState(value?.saving || false);
  const [hasChanges, setHasChanges] = useState(value?.hasChanges || false);
  const [data, setData] = useState<CourseEditorContextType['data']>(value?.data || {});
  const [saveError, setSaveError] = useState<string | null>(value?.saveError || null);
  const [lastSaveSource, setLastSaveSource] = useState<string | null>(null);
  // Persist saved sections from passed value or use default
  const [savedSections, setSavedSections] = useState(value?.savedSections || {
    objectives: false,
    requirements: false,
    audiences: false
  });
  // Store section visibility state
  const [sectionVisibilityState, setSectionVisibilityState] = useState(value?.sectionVisibility || {
    objectives: true,
    requirements: true,
    audiences: true,
    materials: false // Default materials visibility to false (hidden)
  });

  const setSavedSection = useCallback((section: 'objectives' | 'requirements' | 'audiences', saved: boolean) => {
    setSavedSections(prev => ({
      ...prev,
      [section]: saved
    }));
    console.log(`[CourseEditor] Setting saved section ${section} to ${saved}`);
    
    // Store in localStorage to persist across refreshes
    try {
      const courseId = data.id;
      if (courseId) {
        const storageKey = `course_${courseId}_saved_sections`;
        const savedSectionsData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        localStorage.setItem(storageKey, JSON.stringify({
          ...savedSectionsData,
          [section]: saved
        }));
        console.log(`[CourseEditor] Saved section ${section} state to localStorage for course ${courseId}`);
      }
    } catch (err) {
      console.error('[CourseEditor] Error saving section state to localStorage:', err);
    }
  }, [data.id]);
  
  const setSectionVisibility = useCallback((section: 'objectives' | 'requirements' | 'audiences' | 'materials', isVisible: boolean) => {
    setSectionVisibilityState(prev => ({
      ...prev,
      [section]: isVisible
    }));
    console.log(`[CourseEditor] Setting visibility for ${section} to ${isVisible}`);
    
    // Store in localStorage to persist across refreshes
    try {
      const courseId = data.id;
      if (courseId) {
        const storageKey = `course_${courseId}_section_visibility`;
        const visibilityData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        localStorage.setItem(storageKey, JSON.stringify({
          ...visibilityData,
          [section]: isVisible
        }));
        console.log(`[CourseEditor] Saved ${section} visibility state to localStorage for course ${courseId}`);
      }
    } catch (err) {
      console.error('[CourseEditor] Error saving section visibility to localStorage:', err);
    }
  }, [data.id]);
  
  // Load saved sections from localStorage on component mount
  React.useEffect(() => {
    try {
      const courseId = data.id;
      if (courseId) {
        // Load saved sections status
        const savedSectionsStorageKey = `course_${courseId}_saved_sections`;
        const savedSectionsData = JSON.parse(localStorage.getItem(savedSectionsStorageKey) || '{}');
        
        if (Object.keys(savedSectionsData).length > 0) {
          console.log(`[CourseEditor] Loading saved sections from localStorage for course ${courseId}:`, savedSectionsData);
          
          setSavedSections(prev => ({
            ...prev,
            ...savedSectionsData
          }));
        }
        
        // Load section visibility status
        const visibilityStorageKey = `course_${courseId}_section_visibility`;
        const visibilityData = JSON.parse(localStorage.getItem(visibilityStorageKey) || '{}');
        
        if (Object.keys(visibilityData).length > 0) {
          console.log(`[CourseEditor] Loading section visibility from localStorage for course ${courseId}:`, visibilityData);
          
          setSectionVisibilityState(prev => ({
            ...prev,
            ...visibilityData
          }));
        }
      }
    } catch (err) {
      console.error('[CourseEditor] Error loading saved data from localStorage:', err);
    }
  }, [data.id]);

  const trackSaveAttempt = useCallback((source: string) => {
    console.log(`[CourseEditor] Save attempt from: ${source}`);
    setSaving(true);
    setSaveError(null);
    setLastSaveSource(source);
  }, []);

  const handleSaveComplete = useCallback((success: boolean, error?: string) => {
    setSaving(false);
    
    if (success) {
      setHasChanges(false);
      setSaveError(null);
      console.log(`[CourseEditor] Save successful from source: ${lastSaveSource}`);
      
      // Optional success message based on source
      if (lastSaveSource) {
        // We don't need to show a toast here as specific components handle their own success messages
      }
    } else if (error) {
      setSaveError(error);
      console.error(`[CourseEditor] Save error from source ${lastSaveSource}:`, error);
      
      // Optional error message based on source
      if (lastSaveSource && !error.includes("已经显示了错误提示")) {
        toast.error(`保存失败: ${error}`);
      }
    }
  }, [lastSaveSource]);

  return (
    <CourseEditorContext.Provider value={{
      data,
      saving,
      hasChanges,
      saveError,
      savedSections,
      sectionVisibility: sectionVisibilityState,
      setSaving,
      setHasChanges,
      setSaveError,
      setSavedSection,
      setSectionVisibility,
      trackSaveAttempt,
      handleSaveComplete,
    }}>
      {children}
    </CourseEditorContext.Provider>
  );
};

export const useCourseEditor = () => {
  const context = useContext(CourseEditorContext);
  if (!context) {
    throw new Error('useCourseEditor must be used within CourseEditorProvider');
  }
  return context;
};
