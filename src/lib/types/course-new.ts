
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

// Define and export CourseMaterial interface
export interface CourseMaterial {
  id: string;
  course_id: number;
  name: string;
  url: string;
  position: number;
  is_visible: boolean;
}

export interface CourseWithDetails extends Omit<Course, 'language'> {
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
  thumbnail_url?: string;
  language?: string; // Make language optional in CourseWithDetails
  showObjectives?: boolean; // Add visibility flag for objectives
  showRequirements?: boolean; // Add visibility flag for requirements
  showTargetAudience?: boolean; // Add visibility flag for target audience
  showMaterials?: boolean; // Add visibility flag for materials
}

// Add the CourseNew interface for admin components
export interface CourseNew {
  id: number;
  title: string;
  description?: string;
  price: number;
  original_price?: number | null;
  currency: string;
  language: string;
  display_order: number;
  status: 'published' | 'draft' | 'archived';
  is_featured: boolean;
  sections?: CourseSection[];
  created_at?: string;
  updated_at?: string;
  student_count?: number;
  enrollment_count?: number;
  thumbnail_url?: string;
  published_at?: string;
  lecture_count?: number;
  // Add for backwards compatibility
  category?: string;
}

// For form handling
export interface CourseFormValues {
  title: string;
  description?: string;
  price: number;
  original_price?: number | null;
  currency: string;
  language: string;
  display_order: number;
  status: 'published' | 'draft' | 'archived';
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

// Properly export SubscriptionPeriod type
export type SubscriptionPeriod = 'monthly' | 'quarterly' | 'yearly' | '2years' | '3years';

// Update SubscriptionPlan interface to ensure features is correctly typed
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  display_order: number;
  is_active: boolean;
  features?: string[] | null;
  created_at?: string;
  updated_at?: string;
  discount_percentage?: number;
}

// Add CourseData and CourseResponse types for courseService.ts
export interface CourseData {
  id?: number;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  display_order?: number;
  status?: 'published' | 'draft' | 'archived';
  is_featured?: boolean;
  language?: string;
  created_at?: string;
  updated_at?: string;
  enrollment_count?: number;
  student_count?: number;
  thumbnail_url?: string;
  original_price?: number | null;
  [key: string]: any;
}

export interface CourseResponse<T> {
  data: T | null;
  error: Error | null;
}

// Updated SiteSetting interface to include both database structure and compatibility with migration functions
export interface SiteSetting {
  // Database fields
  id?: string;
  site_name?: string;
  site_description?: string;
  logo_url?: string;
  support_phone?: string;
  contact_email?: string;
  maintenance_mode?: boolean;
  enable_registration?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Compatibility fields for migration function
  key?: string;
  value?: string;
}

// Define OrderLineItem interface with required properties
export interface OrderLineItem {
  order_id: string;
  course_id: number;
  price: number;
  currency: string;
  id?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

// Update DatabaseFunctions to include all functions needed in the application
export interface DatabaseFunctions {
  create_test_subscription: any;
  has_role: any;
  update_exchange_rate: any;
  update_site_settings: any;
  user_has_course_access: any;
  enroll_user_in_course: any;
  update_course_progress: any;
  admin_add_course_item: any;
  get_dashboard_stats: any;
  get_financial_stats: any;
  get_payment_method_stats: any;
  check_table_exists: any;
  execute_sql: any;
  insert_order_item: any;
  get_order_items: any;
  delete_order: any;
}

// Define the CourseWithSections interface that was missing
export interface CourseWithSections {
  id: number;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  category?: string;
  sections?: {
    id: string;
    title: string;
    position: number;
    lectures?: {
      id: string;
      title: string;
      position: number;
      video_url?: string;
      duration?: string;
      description?: string;
    }[];
  }[];
  [key: string]: any; // Allow other properties
}
