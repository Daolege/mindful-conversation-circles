
import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/lib/types/course';

// Simplified interface to avoid excessive depth in types
interface CourseDbFields {
  id?: number;
  title: string;
  description: string;
  price: number;
  originalprice?: number;
  imageurl?: string;
  instructor?: string;
  instructor_id?: number;
  category?: string;
  status?: string;
  rating?: number;
  ratingcount?: number;
  studentcount?: number;
  duration?: string;
  lectures?: number;
  language?: string;
  level?: string;
  lastUpdated?: string;
  featured?: boolean;
  enrollment_count?: number;
  published_at?: string;
  display_order: number;
  requirements?: string[];
  whatyouwilllearn?: string[];
  highlights?: string[];
  curriculum?: string[];
  syllabus?: any;
  currency?: string;
}

export type CourseFetchOptions = {
  includeUnpublished?: boolean;
  featured?: boolean;
  category?: string;
  search?: string;
  sortBy?: 'newest' | 'popularity' | 'rating' | 'price-low' | 'price-high';
  page?: number;
  limit?: number;
};

// Utility to convert database fields to Course object
const convertDbToCourse = (dbCourse: any): Course => {
  return {
    id: dbCourse.id,
    title: dbCourse.title,
    description: dbCourse.description,
    price: dbCourse.price,
    originalprice: dbCourse.originalprice,
    imageUrl: dbCourse.imageurl,
    instructor: dbCourse.instructor,
    instructorId: dbCourse.instructor_id,
    category: dbCourse.category,
    rating: dbCourse.rating,
    ratingCount: dbCourse.ratingcount,
    studentCount: dbCourse.studentcount || dbCourse.enrollment_count,
    duration: dbCourse.duration,
    lectures: dbCourse.lectures,
    level: dbCourse.level,
    language: dbCourse.language,
    lastUpdated: dbCourse.lastupdated,
    featured: dbCourse.featured,
    enrollment_count: dbCourse.enrollment_count,
    published_at: dbCourse.published_at,
    display_order: dbCourse.display_order,
    requirements: dbCourse.requirements,
    whatYouWillLearn: dbCourse.whatyouwilllearn,
    syllabus: dbCourse.syllabus,
    currency: dbCourse.currency,
  };
};

// Get all courses
export const getAllCourses = async (options?: CourseFetchOptions) => {
  try {
    let query = supabase
      .from('courses')
      .select('*');
    
    // Add filters based on options
    if (options) {
      if (options.includeUnpublished === false) {
        query = query.eq('status', 'published');
      }
      
      if (options.featured) {
        query = query.eq('featured', true);
      }
      
      if (options.category) {
        query = query.eq('category', options.category);
      }
      
      if (options.search) {
        query = query.ilike('title', `%${options.search}%`);
      }
      
      // Apply sorting
      if (options.sortBy) {
        switch (options.sortBy) {
          case 'newest':
            query = query.order('published_at', { ascending: false });
            break;
          case 'popularity':
            query = query.order('enrollment_count', { ascending: false });
            break;
          case 'rating':
            query = query.order('rating', { ascending: false });
            break;
          case 'price-low':
            query = query.order('price', { ascending: true });
            break;
          case 'price-high':
            query = query.order('price', { ascending: false });
            break;
          default:
            query = query.order('display_order', { ascending: true });
        }
      } else {
        query = query.order('display_order', { ascending: true });
      }
      
      // Pagination
      if (options.page && options.limit) {
        const from = (options.page - 1) * options.limit;
        const to = from + options.limit - 1;
        query = query.range(from, to);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return {
      data: data.map(convertDbToCourse),
      count: data.length,
    };
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Get course by ID
export const getCourseById = async (id: number) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return {
      data: convertDbToCourse(data),
    };
  } catch (error) {
    console.error(`Error fetching course with ID ${id}:`, error);
    throw error;
  }
};

// Fixed saveCourse function to correctly handle course updates
export const saveCourse = async (course: CourseDbFields) => {
  try {
    // Make a copy of the course object to avoid modifying the original
    const courseToSave = { ...course };
    
    // Determine if it's an update or insert
    const isUpdate = !!courseToSave.id;
    
    if (isUpdate) {
      // Update existing course
      const { data, error } = await supabase
        .from('courses')
        .update(courseToSave)
        .eq('id', courseToSave.id)
        .select();
      
      if (error) {
        throw error;
      }
      
      return {
        data: data[0] ? convertDbToCourse(data[0]) : null,
      };
    } else {
      // Create new course
      const { data, error } = await supabase
        .from('courses')
        .insert(courseToSave)
        .select();
      
      if (error) {
        throw error;
      }
      
      return {
        data: data[0] ? convertDbToCourse(data[0]) : null,
      };
    }
  } catch (error) {
    console.error('Error saving course:', error);
    throw error;
  }
};

// Delete course
export const deleteCourse = async (id: number) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error deleting course with ID ${id}:`, error);
    throw error;
  }
};

// Get featured courses
export const getFeaturedCourses = async () => {
  return getAllCourses({
    featured: true,
    includeUnpublished: false,
  });
};

// Get courses by category
export const getCoursesByCategory = async (category: string) => {
  return getAllCourses({
    category,
    includeUnpublished: false,
  });
};
