
import { supabase } from '@/integrations/supabase/client';
import { CourseWithDetails, CourseMaterial } from '@/lib/types/course-new';
import { CourseSyllabusSection } from '@/lib/types/course';
import { toast } from 'sonner';

/**
 * Fetch course from courses_new table by ID
 */
export const getCourseNewById = async (id: number | string): Promise<{ data: CourseWithDetails | null; error?: any }> => {
  try {
    console.log(`[getCourseNewById] Fetching course with ID: ${id}`);
    
    // First get the basic course information
    const { data: courseData, error: courseError } = await supabase
      .from('courses_new')
      .select(`
        *,
        course_sections (
          *,
          course_lectures (*)
        ),
        course_materials (*)
      `)
      .eq('id', typeof id === 'string' ? parseInt(id, 10) : id)
      .single();
    
    if (courseError) {
      console.error('Error fetching course:', courseError);
      return { data: null, error: courseError };
    }
    
    if (!courseData) {
      console.error(`Course with ID ${id} not found`);
      return { data: null, error: 'Course not found' };
    }

    console.log(`[getCourseNewById] Successfully fetched course: ${courseData.title} (ID: ${courseData.id})`);
    console.log(`[getCourseNewById] Sections count: ${courseData.course_sections?.length || 0}`);
    
    // Handle the response structure - map the database field names to our CourseWithDetails structure
    const transformedData: CourseWithDetails = {
      ...courseData,
      // Cast status to match the required type
      status: courseData.status as 'published' | 'draft' | 'archived',
      language: courseData.language || courseData.category || 'zh',
      category: courseData.category || 'zh', // Ensure backward compatibility
      sections: courseData.course_sections?.map(section => ({
        ...section,
        lectures: section.course_lectures?.map(lecture => ({
          ...lecture,
          // Handle the video_url field - might not exist in all lecture objects
          video_url: (lecture as any).video_url || null,
          // Ensure has_homework is correctly identified by checking if there are any associated homework items
          has_homework: lecture.requires_homework_completion || false
        })) || []
      })) || [],
      materials: courseData.course_materials || []
    };

    // Ensure we're returning a proper CourseWithDetails object
    return { 
      data: transformedData
    };
  } catch (error) {
    console.error(`Error fetching new course with ID ${id}:`, error);
    return { data: null, error };
  }
};

/**
 * Transform new course format to syllabus format for the learning page
 */
export const convertNewCourseToSyllabusFormat = (course: CourseWithDetails): CourseSyllabusSection[] => {
  if (!course.sections || !Array.isArray(course.sections)) {
    console.warn('[convertNewCourseToSyllabusFormat] Course has no sections or sections is not an array');
    return [];
  }

  return course.sections.map(section => ({
    id: section.id,
    title: section.title,
    lectures: section.lectures?.map(lecture => ({
      id: lecture.id,
      title: lecture.title,
      duration: lecture.duration || '未知时长',
      videoUrl: lecture.video_url || undefined,
      has_homework: lecture.has_homework, 
      is_free: lecture.is_free,
      requires_homework_completion: lecture.requires_homework_completion
    })) || []
  }));
};

/**
 * Track progress for a lecture in a course
 */
export const trackCourseProgress = async (
  courseId: string | number,
  lectureId: string,
  userId: string,
  completed: boolean = false
): Promise<boolean> => {
  try {
    console.log(`[trackCourseProgress] Updating progress - Course: ${courseId}, Lecture: ${lectureId}, User: ${userId}, Completed: ${completed}`);
    
    const { error } = await supabase
      .from('course_progress')
      .upsert([{
        course_id: typeof courseId === 'string' ? parseInt(courseId, 10) : courseId,
        lecture_id: lectureId,
        user_id: userId,
        completed,
        last_watched_at: new Date().toISOString()
      }], {
        onConflict: 'course_id,user_id,lecture_id'
      });

    if (error) {
      console.error('Error tracking course progress:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking course progress:', error);
    return false;
  }
};

/**
 * Get course progress for a user
 */
export const getCourseProgress = async (
  courseId: string | number,
  userId: string
): Promise<Record<string, boolean>> => {
  try {
    console.log(`[getCourseProgress] Fetching progress - Course: ${courseId}, User: ${userId}`);
    
    const { data, error } = await supabase
      .from('course_progress')
      .select('lecture_id, completed')
      .eq('course_id', typeof courseId === 'string' ? parseInt(courseId, 10) : courseId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error getting course progress:', error);
      return {};
    }
    
    if (!data || !Array.isArray(data)) {
      return {};
    }

    return data.reduce((acc: Record<string, boolean>, curr) => {
      acc[curr.lecture_id] = curr.completed;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error getting course progress:', error);
    return {};
  }
};

/**
 * Check if user has completed a prerequisite lecture
 * This helps implement sequential learning requirement
 */
export const hasCompletedPrerequisites = async (
  courseId: string | number,
  userId: string,
  currentLectureIndex: number,
  sectionId: string
): Promise<boolean> => {
  try {
    // If this is the first lecture in a section, no prerequisites
    if (currentLectureIndex === 0) {
      return true;
    }
    
    // Get the course to find the previous lecture
    const { data: course } = await getCourseNewById(courseId);
    if (!course || !course.sections) {
      return false;
    }
    
    // Find the current section
    const section = course.sections.find(s => s.id === sectionId);
    if (!section || !section.lectures || section.lectures.length <= 1) {
      return true; // No previous lectures to check
    }
    
    // Get the previous lecture in this section
    const previousLecture = section.lectures[currentLectureIndex - 1];
    if (!previousLecture) {
      return true;
    }
    
    // Check if previous lecture requires homework completion
    if (!previousLecture.requires_homework_completion) {
      return true;
    }
    
    // Get user progress
    const progress = await getCourseProgress(courseId, userId);
    
    // Check if previous lecture is marked as completed
    return !!progress[previousLecture.id];
  } catch (error) {
    console.error('Error checking lecture prerequisites:', error);
    return false;
  }
};

/**
 * Get course materials with proper error handling
 */
export const getCourseMaterials = async (courseId: number | string): Promise<CourseMaterial[]> => {
  try {
    const { data, error } = await supabase
      .from('course_materials')
      .select('*')
      .eq('course_id', typeof courseId === 'string' ? parseInt(courseId, 10) : courseId)
      .order('position', { ascending: true });
      
    if (error) {
      console.error('Error fetching course materials:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getCourseMaterials:', error);
    return [];
  }
};
