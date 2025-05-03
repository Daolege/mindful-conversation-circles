
import { Course } from "@/lib/types/course";
import { CourseNew } from "@/lib/types/course-new";

/**
 * Transforms a CourseNew object to Course format for compatibility with existing components
 */
export const transformCourseNewToOld = (courseNew: CourseNew): Course => {
  // Get current date in ISO format for lastUpdated if not available
  const currentDateISO = new Date().toISOString();
  
  return {
    id: courseNew.id,
    title: courseNew.title,
    description: courseNew.description || '',
    price: courseNew.price,
    originalprice: courseNew.original_price || null,
    category: courseNew.language || 'zh', // Map language to category for backward compatibility
    featured: courseNew.is_featured || false,
    display_order: courseNew.display_order || 0,
    enrollment_count: courseNew.enrollment_count || 0,
    studentCount: courseNew.enrollment_count || 0,
    language: courseNew.language || 'zh',
    published_at: courseNew.published_at || '',
    lectures: courseNew.lecture_count || 0,
    lastUpdated: courseNew.updated_at || currentDateISO,
    lastupdated: courseNew.updated_at || currentDateISO,
    // Set defaults for required fields that might not be present in CourseNew
    ratingCount: 0,
    rating: 4.5, // Default rating
    imageUrl: null, // Will use default image in CourseCard if not available
    currency: courseNew.currency || 'cny',
    // Additional fields for better card display
    level: 'all', // Default level
    duration: '自定进度', // Self-paced by default
    whatYouWillLearn: [], // Default empty array
    whatyouwilllearn: [],
    requirements: [],
  };
};
