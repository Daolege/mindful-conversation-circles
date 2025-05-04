
import { CourseData, CourseWithDetails } from "@/lib/types/course-new";
import { Course } from "@/lib/types/course";

/**
 * Transform a CourseData or CourseWithDetails object into the legacy Course type
 */
export const transformCourseNewToOld = (courseNew: CourseData | CourseWithDetails): Course => {
  return {
    id: courseNew.id,
    title: courseNew.title,
    description: courseNew.description || '',
    instructor: courseNew.instructor_name || courseNew.instructor || '',
    instructorId: 0, // Default value as we don't have this in the new model
    category: courseNew.category || courseNew.language || '',
    price: courseNew.price || 0,
    originalprice: courseNew.original_price || null,
    imageUrl: courseNew.thumbnail_url || courseNew.imageurl || '',
    rating: courseNew.rating || 0,
    ratingCount: courseNew.rating_count || 0,
    studentCount: courseNew.enrollment_count || 0,
    duration: '', // Not directly mapped
    lectures: courseNew.lecture_count || courseNew.lectures || 0,
    level: 'all', // Default value
    lastUpdated: (courseNew.updated_at ? courseNew.updated_at : '') || '',
    featured: courseNew.is_featured || courseNew.featured || false,
    whatYouWillLearn: Array.isArray(courseNew.learning_objectives) ? courseNew.learning_objectives : [],
    requirements: Array.isArray(courseNew.requirements) ? courseNew.requirements : [],
    language: courseNew.language || 'zh',
    enrollment_count: courseNew.enrollment_count || 0,
    published_at: (courseNew.published_at ? courseNew.published_at : '') || '',
    display_order: courseNew.display_order || 0,
    currency: courseNew.currency || 'cny',
    syllabus: courseNew.syllabus || []
  };
};

/**
 * Check if the API response is a single course (CourseWithDetails) or an array of courses
 */
export const isSingleCourse = (data: CourseWithDetails | CourseData[]): data is CourseWithDetails => {
  return !Array.isArray(data) && typeof data === 'object' && 'id' in data;
};

/**
 * Check if the API response is an array of courses
 */
export const isCoursesArray = (data: CourseWithDetails | CourseData[]): data is CourseData[] => {
  return Array.isArray(data);
};
