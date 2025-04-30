
export interface CourseNew {
  id: number;
  title: string;
  description?: string;
  price: number;
  original_price?: number | null;
  currency: string;
  category?: string | null;
  display_order: number;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  lecture_count?: number;
  enrollment_count?: number;
  created_at?: string;
  updated_at?: string;
  published_at?: string | null;
  sections?: CourseSection[];
}

export interface CourseSection {
  id: string;
  course_id: number;
  title: string;
  position: number;
  created_at?: string;
  updated_at?: string;
  lectures?: CourseLecture[];
}

export interface CourseLecture {
  id: string;
  section_id: string;
  title: string;
  position: number;
  is_free?: boolean;
  duration?: string;
  video_url?: string;
  requires_homework_completion?: boolean;
  completion_threshold?: number;
  created_at?: string;
  updated_at?: string;
  submission_count?: number;
}

export interface CourseWithDetails extends CourseNew {
  sections?: CourseSection[];
}

export interface CourseFormValues {
  title: string;
  description?: string;
  price: number;
  original_price?: number | null;
  currency: string;
  category?: string | null;
  display_order: number;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
}

// 添加拖拽排序相关类型
export interface DragEndResult {
  active: {
    id: string;
  };
  over?: {
    id: string;
  };
}
