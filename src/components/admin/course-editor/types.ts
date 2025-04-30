
export interface CourseEditorContextType {
  data: {
    id?: number | null;
    title?: string;
    description?: string;
  };
  saving: boolean;
  hasChanges: boolean; 
  saveError: string | null;
  savedSections: {
    objectives: boolean;
    requirements: boolean;
    audiences: boolean;
  };
  sectionVisibility: {
    objectives: boolean;
    requirements: boolean;
    audiences: boolean;
    materials: boolean; // Added materials visibility
  };
  setSaving: (saving: boolean) => void;
  setHasChanges: (hasChanges: boolean) => void;
  setSaveError: (error: string | null) => void;
  setSavedSection: (section: 'objectives' | 'requirements' | 'audiences', saved: boolean) => void;
  setSectionVisibility: (section: 'objectives' | 'requirements' | 'audiences' | 'materials', isVisible: boolean) => void; // Updated with materials
  trackSaveAttempt: (source: string) => void;
  handleSaveComplete: (success: boolean, error?: string) => void;
}
