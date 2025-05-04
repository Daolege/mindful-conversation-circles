
// Define an interface for list items which will be reused across components
export interface ListItem {
  id: string;
  text: string;
  icon?: string;
  position: number;
  is_visible?: boolean;
}

// Define course highlight interface
export interface CourseHighlight {
  id: string;
  course_id: number;
  icon: string;
  content: string;
  position: number;
  is_visible: boolean;
  created_at?: string;
  updated_at?: string;
}

// Define enrollment guide interface
export interface EnrollmentGuide {
  id: string;
  course_id: number;
  guide_type: string;
  title: string;
  content?: string;
  link?: string;
  image_url?: string;
  position: number;
  created_at?: string;
  updated_at?: string;
}
