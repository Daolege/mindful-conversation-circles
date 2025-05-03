
import { supabase } from '@/integrations/supabase/client';
import { CourseLecture } from '@/lib/types/course-new';

export interface LectureServiceResponse<T = any> {
  data: T | null;
  error: Error | null;
  success: boolean;
}

export interface LectureData {
  id?: string;
  section_id: string;
  title: string;
  description?: string;
  position: number;
  duration?: string;
  video_url?: string;
  is_free?: boolean;
  has_homework?: boolean;
  requires_homework_completion?: boolean;
}

export async function saveLecture(lectureData: LectureData): Promise<LectureServiceResponse<CourseLecture[]>> {
  try {
    const { data, error } = await supabase
      .from('course_lectures')
      .insert({
        section_id: lectureData.section_id,
        title: lectureData.title,
        position: lectureData.position,
        description: lectureData.description || null,
        duration: lectureData.duration || null,
        video_url: lectureData.video_url || null,
        is_free: lectureData.is_free || false,
        has_homework: lectureData.has_homework || false,
        requires_homework_completion: lectureData.requires_homework_completion || false
      })
      .select();

    if (error) {
      console.error('Error saving lecture:', error);
      return { data: null, error: new Error(error.message), success: false };
    }

    return { data, error: null, success: true };
  } catch (error: any) {
    console.error('Error in saveLecture:', error);
    return { data: null, error, success: false };
  }
}

export async function updateLecture(id: string, updateData: Partial<LectureData>): Promise<LectureServiceResponse<CourseLecture[]>> {
  try {
    const { data, error } = await supabase
      .from('course_lectures')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error updating lecture:', error);
      return { data: null, error: new Error(error.message), success: false };
    }

    return { data, error: null, success: true };
  } catch (error: any) {
    console.error('Error in updateLecture:', error);
    return { data: null, error, success: false };
  }
}

export async function deleteLecture(id: string): Promise<LectureServiceResponse> {
  try {
    const { error } = await supabase
      .from('course_lectures')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting lecture:', error);
      return { data: null, error: new Error(error.message), success: false };
    }

    return { data: true, error: null, success: true };
  } catch (error: any) {
    console.error('Error in deleteLecture:', error);
    return { data: null, error, success: false };
  }
}

export async function getLectures(sectionId: string): Promise<LectureServiceResponse<CourseLecture[]>> {
  try {
    const { data, error } = await supabase
      .from('course_lectures')
      .select('*')
      .eq('section_id', sectionId)
      .order('position');

    if (error) {
      console.error('Error getting lectures:', error);
      return { data: null, error: new Error(error.message), success: false };
    }

    return { data, error: null, success: true };
  } catch (error: any) {
    console.error('Error in getLectures:', error);
    return { data: null, error, success: false };
  }
}
