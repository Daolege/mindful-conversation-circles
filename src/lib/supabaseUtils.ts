
// User role types
export type UserRole = 'admin' | 'user' | 'instructor';

// About page settings
export interface AboutPageSettings {
  id: string;
  title: string;
  subtitle?: string;
  vision?: string;
  mission?: string;
  story?: string;
  team_members?: any[];
  stats?: any[];
  is_visible?: boolean;
  updated_at?: string;
  updated_by?: string;
}

// Contact method types
export interface ContactMethod {
  id: string;
  type: string;
  value: string;
  label?: string;
  is_active?: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

// FAQ types
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

// Course progress types
export interface CourseProgressData {
  id: string;
  user_id: string;
  course_id: number;
  lecture_id: string;
  progress_percent: number;
  completed: boolean;
  last_watched_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Homework types
export interface HomeworkData {
  id: string;
  title: string;
  description?: string;
  course_id: number;
  lecture_id: string;
  type: string;
  options?: any;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Site settings type - consistent across the application
export interface SiteSetting {
  id?: string;
  key: string;
  value: string;
  updated_at?: string;
  created_at?: string;
}

// Instructor types
export interface Instructor {
  id: string;
  name: string;
  email: string;
  bio?: string;
  expertise?: string;
  avatar_url?: string;
  status: string;
  created_at?: string;
}

export interface InstructorFormData {
  name: string;
  email: string;
  bio?: string;
  expertise?: string;
  avatar_url?: string;
  status: 'active' | 'inactive';
}

// User profile types
export interface UserProfile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string;
  registration_date?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

// Order stats types
export interface OrderStats {
  period: string;
  count: number;
  revenue: number;
}

/**
 * Helper function to handle query errors for user roles
 */
export function handleUserRolesQueryError(data: any, error: any) {
  if (error) {
    console.error("Error fetching user roles:", error);
    return null;
  }
  return data;
}

/**
 * Helper function to handle query errors for about page settings
 */
export function handleAboutPageQueryError(data: any, error: any) {
  if (error) {
    console.error("Error fetching about page settings:", error);
    return null;
  }
  return data;
}

/**
 * Helper function to handle query errors for contact methods
 */
export function handleContactMethodsQueryError(data: any, error: any) {
  if (error) {
    console.error("Error fetching contact methods:", error);
    return null;
  }
  return data;
}

/**
 * Helper function to handle query errors for FAQs
 */
export function handleFaqsQueryError(data: any, error: any) {
  if (error) {
    console.error("Error fetching FAQs:", error);
    return null;
  }
  return data;
}

/**
 * Helper function to handle query errors for course progress
 */
export function handleCourseProgressQueryError(data: any, error: any) {
  if (error) {
    console.error("Error fetching course progress:", error);
    return null;
  }
  return data;
}

/**
 * Helper function to handle query errors for homework
 */
export function handleHomeworkQueryError(data: any, error: any) {
  if (error) {
    console.error("Error fetching homework:", error);
    return null;
  }
  return data;
}

/**
 * Helper function to handle query errors for homework submissions
 */
export function handleHomeworkSubmissionsQueryError(data: any, error: any) {
  if (error) {
    console.error("Error fetching homework submissions:", error);
    return null;
  }
  return data;
}

/**
 * Helper function to handle query errors for courses
 */
export function handleCoursesQueryError(data: any, error: any) {
  if (error) {
    console.error("Error fetching courses:", error);
    return null;
  }
  return data;
}

/**
 * Helper function to handle query errors for instructors
 */
export function handleInstructorsQueryError(data: any, error: any) {
  if (error) {
    console.error("Error fetching instructors:", error);
    return null;
  }
  return data;
}

/**
 * Helper function to handle query errors for exchange rates
 */
export function handleExchangeRateQueryError(data: any, error: any) {
  if (error) {
    console.error("Error fetching exchange rates:", error);
    return null;
  }
  return data;
}

/**
 * Helper function to handle query errors for order stats
 */
export function handleOrderStatsQueryError(data: any, error: any) {
  if (error) {
    console.error("Error fetching order stats:", error);
    return null;
  }
  return data;
}

/**
 * Helper function to handle query errors for system settings
 */
export function handleSystemSettingsQueryError(data: any, error: any) {
  if (error) {
    console.error("Error fetching system settings:", error);
    return null;
  }
  return data;
}

/**
 * Helper function to handle query errors for Supabase queries with a default return value
 */
export function handleSupabaseQueryError<T>(data: T, error: any, defaultValue: T = null as unknown as T) {
  if (error) {
    console.error("Supabase query error:", error);
    return defaultValue;
  }
  return data;
}

// Add more utility functions as needed
