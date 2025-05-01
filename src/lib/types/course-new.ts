
import { Course } from "./course";

export interface CourseSection {
  id: string;
  title: string;
  description?: string;
  position: number;
  lectures?: CourseLecture[];
}

export interface CourseLecture {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  position: number;
  video_url?: string;
  has_homework?: boolean;
  section_id?: string;
  is_free?: boolean;
  requires_homework_completion?: boolean;
}

export interface CourseWithDetails extends Course {
  sections?: CourseSection[];
  learning_objectives?: string[];
  requirements?: string[];
  target_audience?: string[];
  instructor_name?: string;
  instructor_bio?: string;
  instructor_avatar?: string;
  original_price?: number;
  materials?: CourseMaterial[];
  status?: 'published' | 'draft' | 'archived';
}

export interface CourseMaterial {
  id: string;
  name: string;
  url: string;
  position: number;
  is_visible?: boolean;
}

// Add the CourseNew interface for admin components
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
  sections?: CourseSection[];
  created_at?: string;
  updated_at?: string;
  student_count?: number;
  enrollment_count?: number;
  thumbnail_url?: string;
}

// For form handling
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

// Define ListItem interface for EditableListComponent
export interface ListItem {
  id: string;
  text: string;
  content?: string;
  position?: number;
  is_visible?: boolean;
}

// Subscription period type - properly exported
export type SubscriptionPeriod = 'monthly' | 'quarterly' | 'yearly' | '2years' | '3years';

// SubscriptionPlan interface for subscription management - properly exported
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  display_order: number;
  is_active: boolean;
  features?: string[];
  created_at?: string;
  updated_at?: string;
  discount_percentage?: number;
}
