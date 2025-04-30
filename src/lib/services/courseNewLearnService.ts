
import { supabase } from '@/integrations/supabase/client';
import { CourseWithDetails } from '@/lib/types/course-new';
import { CourseSyllabusSection } from '@/lib/types/course';
import { toast } from 'sonner';

/**
 * Fetch course from courses_new table by ID
 */
export const getCourseNewById = async (id: number | string): Promise<{ data: CourseWithDetails | null; error?: any }> => {
  try {
    // First get the basic course information
    const { data: courseData, error: courseError } = await supabase
      .from('courses_new')
      .select(`
        *,
        sections (
          *,
          lectures (*)
        ),
        materials (*)
      `)
      .eq('id', typeof id === 'string' ? parseInt(id, 10) : id)
      .single();
    
    if (courseError) {
      console.error('Error fetching course:', courseError);
      return { data: null, error: courseError };
    }
    
    if (!courseData) {
      return { data: null, error: 'Course not found' };
    }

    // Ensure we're returning a proper CourseWithDetails object
    return { 
      data: courseData as unknown as CourseWithDetails
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
    return [];
  }

  return course.sections.map(section => ({
    id: section.id,
    title: section.title,
    lectures: section.lectures?.map(lecture => ({
      id: lecture.id,
      title: lecture.title,
      duration: lecture.duration || '未知时长',
      videoUrl: lecture.video_url
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
