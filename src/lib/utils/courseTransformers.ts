
import { Course } from "@/lib/types/course";
import { CourseNew } from "@/lib/types/course-new";

/**
 * Transforms a CourseNew object to Course format for compatibility with existing components
 */
export const transformCourseNewToOld = (courseNew: CourseNew): Course => {
  // Get current date in ISO format for lastUpdated if not available
  const currentDateISO = new Date().toISOString();
  
  // Log the transformation input
  console.log("[transformCourseNewToOld] Input data:", courseNew);
  console.log("[transformCourseNewToOld] Input language:", courseNew.language);
  console.log("[transformCourseNewToOld] Input category:", courseNew.category);
  
  // Determine the language to use
  const languageToUse = courseNew.language || courseNew.category || 'zh';
  console.log("[transformCourseNewToOld] Using language:", languageToUse);
  
  const result = {
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
    language: languageToUse, // Ensure language is explicitly set
    published_at: courseNew.published_at || '',
    lectures: courseNew.lecture_count || 0,
    lastUpdated: courseNew.updated_at || currentDateISO,
    lastupdated: courseNew.updated_at || currentDateISO,
    // Set defaults for required fields that might not be present in CourseNew
    ratingCount: 0,
    rating: 4.5, // Default rating
    imageUrl: courseNew.thumbnail_url || null, // Will use default image in CourseCard if not available
    currency: courseNew.currency || 'cny',
    // Additional fields for better card display
    level: 'all', // Default level
    duration: '自定进度', // Self-paced by default
    whatYouWillLearn: [], // Default empty array
    whatyouwilllearn: [],
    requirements: [],
    instructor: '', // Add empty instructor for compatibility
    instructorId: 0,
  };
  
  // Log the transformation output
  console.log("[transformCourseNewToOld] Output data language:", result.language);
  console.log("[transformCourseNewToOld] Output data category:", result.category);
  
  return result;
};
