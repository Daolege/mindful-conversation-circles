
export interface Course {
  id: number;
  title: string;
  description?: string;
  instructor?: string;
  instructorid?: number;
  instructorId?: number; // Alternative name
  price: number;
  originalprice?: number | null;
  rating?: number;
  studentcount?: number;
  ratingcount?: number;
  lectures?: number;
  whatyouwilllearn?: string[];
  requirements?: string[];
  target_audience?: string[];
  category?: string;
  level?: string;
  duration?: string;
  language?: string;
  highlights?: string[];
  materialsVisible?: boolean;
  materials?: CourseMaterial[];
  enrollment_count?: number;
  display_order?: number;
  featured?: boolean;
  published_at?: string;
  imageurl?: string;
  imageUrl?: string; // Alternative name
  lastUpdated?: string;
  lastupdated?: string; // Both versions are used in different files
  studentCount?: number; // Alternative name for studentcount
  ratingCount?: number; // Alternative name for ratingcount
  whatYouWillLearn?: string[]; // Alternative name for whatyouwilllearn
  subscription_plans?: any; // Used in Checkout.tsx
  
  // Additional fields for database compatibility
  currency?: string;
  video_url?: string;
  syllabus?: any;
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

// Helper function to transform course data 
// This is where the circular reference was happening
// We'll simplify it to avoid excessive type recursion
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
    category: courseData.category || '',
    level: courseData.level || 'beginner',
    duration: courseData.duration || '',
    language: courseData.language || 'zh',
    featured: courseData.featured || false,
    display_order: courseData.display_order || 0,
    imageurl: courseData.imageurl || courseData.image_url || null,
    imageUrl: courseData.imageurl || courseData.image_url || null,
    lastupdated: courseData.lastupdated || courseData.lastUpdated || new Date().toISOString(),
    lastUpdated: courseData.lastupdated || courseData.lastUpdated || new Date().toISOString(),
    enrollment_count: courseData.enrollment_count || 0,
    materials: materials,
    syllabus: courseData.syllabus || []
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
