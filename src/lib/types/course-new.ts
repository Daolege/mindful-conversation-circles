

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
  video_url?: string;  // Added missing field
  requires_homework_completion?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Add missing CourseNew interface
export interface CourseNew {
  id: number;
  title: string;
  description?: string;
  price: number;
  original_price?: number | null;
  display_order: number;
  is_featured?: boolean;
  status: 'published' | 'draft' | 'archived';
  enrollment_count?: number;
  lecture_count?: number;
  language?: string;
  category?: string;
  currency?: string;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  allows_subscription?: boolean;
  allows_one_time_purchase?: boolean;
  thumbnail_url?: string;
  materials?: CourseMaterial[];
}

// Add CourseWithDetails interface
export interface CourseWithDetails extends CourseNew {
  sections?: CourseSection[];
  learning_objectives?: string[];
  requirements?: string[];
  target_audience?: string[];
  materials?: CourseMaterial[];
  syllabus?: any;
  instructor?: any;
  rating?: number;
  rating_count?: number;
}

// Add CourseMaterial interface
export interface CourseMaterial {
  id: string;
  course_id: number;
  name: string;
  url: string;
  position: number;
  is_visible?: boolean;
  created_at?: string;
}

// Add CourseFormValues interface
export interface CourseFormValues {
  title: string;
  description?: string;
  price: number;
  original_price?: number | null;
  currency: string;
  language: string;
  display_order: number;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
}

// Add subscription related interfaces
export type SubscriptionPeriod = 'monthly' | 'quarterly' | 'annual';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: SubscriptionPeriod;
  currency: string;
  discount_percentage: number;
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

// Add CourseData and CourseResponse for compatibility
export interface CourseData {
  id: number;
  title: string;
  description?: string;
  // Add other required fields as needed
}

export interface CourseResponse {
  data?: CourseData;
  error?: any;
}

// Add SiteSetting interface
export interface SiteSetting {
  id: string;
  site_name: string;
  site_description?: string;
  contact_email?: string;
  support_phone?: string;
  logo_url?: string;
  enable_registration?: boolean;
  maintenance_mode?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Add CourseWithSections for backward compatibility
export interface CourseWithSections extends CourseNew {
  sections?: CourseSection[];
}
