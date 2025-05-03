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

export interface VideoUploadResponse {
  url: string;
  path: string;
}

export async function uploadLectureVideo(
  lectureId: string, 
  file: File,
  onProgress?: (progress: number) => void
): Promise<LectureServiceResponse<VideoUploadResponse>> {
  try {
    if (!lectureId || !file) {
      return { 
        data: null, 
        error: new Error('Lecture ID and file are required'), 
        success: false 
      };
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `lectures/${lectureId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('course_videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        onUploadProgress: (progress) => {
          if (onProgress) {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            onProgress(percent);
          }
        }
      });

    if (uploadError) {
      console.error('Video upload error:', uploadError);
      return { 
        data: null, 
        error: new Error(uploadError.message), 
        success: false 
      };
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('course_videos')
      .getPublicUrl(filePath);

    // Update the lecture with the video URL
    const { error: updateError } = await supabase
      .from('course_lectures')
      .update({ video_url: publicUrl })
      .eq('id', lectureId);

    if (updateError) {
      console.error('Error updating lecture with video URL:', updateError);
      // We still return success since the file was uploaded
    }

    return { 
      data: { 
        url: publicUrl, 
        path: filePath 
      }, 
      error: null, 
      success: true 
    };
  } catch (error: any) {
    console.error('Error in uploadLectureVideo:', error);
    return { 
      data: null, 
      error, 
      success: false 
    };
  }
}
