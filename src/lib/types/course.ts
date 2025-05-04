
// Remove conflicting import
// import { Course } from "./course";

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  originalprice?: number | null;
  category: string; // Keep for backward compatibility, now represents language
  featured?: boolean;
  display_order?: number;
  imageUrl?: string | null;
  imageurl?: string | null; // For backward compatibility
  enrollment_count?: number;
  studentCount?: number;
  studentcount?: number; // For backward compatibility
  lastupdated?: string;
  lastUpdated?: string;
  language: string; // Primary language field
  level?: string;
  duration?: string;
  requirements?: string[];
  whatYouWillLearn?: string[];
  whatyouwilllearn?: string[];
  lectures?: number;
  rating?: number;
  ratingCount?: number;
  ratingcount?: number; // For backward compatibility
  currency: string;
  published_at?: string;
  
  // Add back fields that are still being referenced
  instructor?: string;
  instructorid?: number;
  instructorId?: number;
  syllabus?: any[];
  materials?: CourseMaterial[];
  materialsVisible?: boolean;
  
  // Additional fields for compatibility
  subscription_plans?: any;
  video_url?: string;
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
  thumbnail_url?: string;
}

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

export interface CourseMaterial {
  id: string;
  course_id?: number;
  name: string;
  url: string;
  position: number;
  is_visible?: boolean;
}

// Type for database operations - separate from main Course interface
export interface CourseDbData {
  title: string;
  description: string;
  instructor?: string | null;
  instructorid?: number | null;
  price: number;
  originalprice?: number | null;
  display_order: number;
  requirements: string[];
  whatyouwilllearn: string[];
  category: string;
  level: string;
  language: string;
  featured: boolean;
  syllabus: any[];
  imageurl?: string | null;
  duration: string;
  enrollment_count: number;
}

// Simple helper function to convert Course to CourseDbData
export const prepareCourseForDb = (course: Partial<Course>): CourseDbData => {
  return {
    title: course.title || '',
    description: course.description || '',
    instructor: course.instructor || null,
    instructorid: course.instructorid || null,
    price: course.price || 0,
    originalprice: course.originalprice || null,
    display_order: course.display_order || 0,
    requirements: course.requirements || [],
    whatyouwilllearn: course.whatyouwilllearn || [],
    category: course.category || '',
    level: course.level || 'beginner',
    language: course.language || 'zh',
    featured: course.featured || false,
    syllabus: course.syllabus || [],
    imageurl: course.imageurl || null,
    duration: course.duration || '',
    enrollment_count: course.enrollment_count || 0
  };
};

// Modified transformCourseData function to handle both old and new fields
export const transformCourseData = (courseData: any): Course => {
  // Safely handle materials
  let materials: CourseMaterial[] = [];
  if (courseData.materials) {
    if (Array.isArray(courseData.materials)) {
      materials = courseData.materials;
    } else if (typeof courseData.materials === 'string') {
      try {
        materials = JSON.parse(courseData.materials);
      } catch (e) {
        console.error('Error parsing course materials:', e);
      }
    } else if (typeof courseData.materials === 'object') {
      materials = Array.isArray(courseData.materials) ? 
        courseData.materials : Object.values(courseData.materials || {});
    }
  }

  // Create a new course object with normalized fields
  const transformed: Course = {
    id: courseData.id || 0,
    title: courseData.title || '',
    description: courseData.description || '',
    instructor: courseData.instructor || null,
    instructorid: courseData.instructorid || courseData.instructor_id || null,
    instructorId: courseData.instructorid || courseData.instructor_id || null,
    price: courseData.price || 0,
    originalprice: courseData.originalprice || courseData.original_price || null,
    rating: courseData.rating || 0,
    studentcount: courseData.studentcount || courseData.student_count || courseData.studentCount || 0,
    studentCount: courseData.studentcount || courseData.student_count || courseData.studentCount || 0,
    ratingcount: courseData.ratingcount || courseData.rating_count || 0,
    ratingCount: courseData.ratingcount || courseData.rating_count || 0,
    lectures: courseData.lectures || 0,
    whatyouwilllearn: courseData.whatyouwilllearn || courseData.what_you_will_learn || courseData.whatYouWillLearn || [],
    whatYouWillLearn: courseData.whatyouwilllearn || courseData.what_you_will_learn || courseData.whatYouWillLearn || [],
    requirements: courseData.requirements || [],
    category: courseData.category || courseData.language || 'zh',
    level: courseData.level || 'beginner',
    duration: courseData.duration || '',
    language: courseData.language || courseData.category || 'zh',
    featured: courseData.featured || false,
    display_order: courseData.display_order || 0,
    imageurl: courseData.imageurl || courseData.image_url || null,
    imageUrl: courseData.imageurl || courseData.image_url || null,
    lastupdated: courseData.lastupdated || courseData.lastUpdated || new Date().toISOString(),
    lastUpdated: courseData.lastupdated || courseData.lastUpdated || new Date().toISOString(),
    enrollment_count: courseData.enrollment_count || 0,
    materials: materials,
    syllabus: courseData.syllabus || [],
    currency: courseData.currency || 'cny',
    materialsVisible: courseData.materialsVisible !== false
  };

  return transformed;
};

// Adding other required types that seem to be referenced
export interface CourseSyllabusSection {
  id?: string;
  title: string;
  lectures?: {
    id?: string;
    title: string;
    duration?: string;
    videoUrl?: string;
  }[];
}

// JSON type for compatibility
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Update the defaultCourse with all required fields
export const defaultCourse: Course = {
  id: 0,
  title: '',
  description: '',
  price: 0,
  category: 'zh',
  language: 'zh',
  currency: 'cny',
  featured: false,
  ratingCount: 0,
  rating: 0,
  display_order: 0
};
