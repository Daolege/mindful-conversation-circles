
export interface ListItem {
  id: string;
  text: string;
  position: number;
  is_visible: boolean;
  icon?: string;
}

export interface ListSectionConfig {
  title: string;
  description: string;
  icon?: string;
}

export interface CourseSection {
  id: string;
  title: string;
  position: number;
  course_id: number;
  created_at?: string;
  updated_at?: string;
  lectures?: CourseLecture[];
}

export interface CourseLecture {
  id: string;
  title: string;
  position: number;
  section_id: string;
  duration?: string;
  is_free?: boolean;
  requires_homework_completion?: boolean;
  created_at?: string;
  updated_at?: string;
}
