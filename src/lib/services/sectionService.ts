
import { supabase } from '@/integrations/supabase/client';
import { CourseSection, CourseLecture } from '@/lib/types/course-new';
import { toast } from 'sonner';

export interface SectionServiceResponse<T = any> {
  data: T | null;
  error: Error | null;
  success: boolean;
}

export interface SectionData {
  id?: string;
  course_id: number;
  title: string;
  position: number;
}

export async function saveSection(sectionData: SectionData): Promise<SectionServiceResponse<CourseSection[]>> {
  try {
    const { data, error } = await supabase
      .from('course_sections')
      .insert({
        course_id: sectionData.course_id,
        title: sectionData.title,
        position: sectionData.position
      })
      .select();

    if (error) {
      console.error('Error saving section:', error);
      return { data: null, error: new Error(error.message), success: false };
    }

    return { data, error: null, success: true };
  } catch (error: any) {
    console.error('Error in saveSection:', error);
    return { data: null, error, success: false };
  }
}

export async function getSectionsByCourseId(courseId: number): Promise<SectionServiceResponse<CourseSection[]>> {
  try {
    if (!courseId) {
      return { data: null, error: new Error('Course ID is required'), success: false };
    }

    // First, get sections without lectures to avoid the description error
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('course_sections')
      .select(`
        id, 
        title,
        position,
        created_at,
        updated_at,
        course_id
      `)
      .eq('course_id', courseId)
      .order('position', { ascending: true });

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError);
      return { data: null, error: new Error(sectionsError.message), success: false };
    }

    // Now fetch lectures for each section separately
    const sectionsWithLectures: CourseSection[] = [];

    for (const section of sectionsData) {
      const { data: lecturesData, error: lecturesError } = await supabase
        .from('course_lectures')
        .select(`
          id, 
          title, 
          position,
          duration,
          video_url,
          has_homework,
          is_free,
          requires_homework_completion,
          section_id,
          description
        `)
        .eq('section_id', section.id)
        .order('position', { ascending: true });

      if (lecturesError) {
        console.error(`Error fetching lectures for section ${section.id}:`, lecturesError);
        // Continue with empty lectures array rather than failing the whole request
        sectionsWithLectures.push({
          ...section,
          lectures: []
        });
      } else {
        sectionsWithLectures.push({
          ...section,
          lectures: lecturesData || []
        });
      }
    }

    return { data: sectionsWithLectures, error: null, success: true };
  } catch (error: any) {
    console.error('Error in getSectionsByCourseId:', error);
    return { data: null, error, success: false };
  }
}

export async function saveCourseOutline(courseId: number, sections: CourseSection[]): Promise<SectionServiceResponse> {
  try {
    if (!courseId) {
      return { data: null, error: new Error('Course ID is required'), success: false };
    }

    // 1. First, update or insert the sections
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      section.position = i; // Update position based on array order
      
      // Upsert the section
      const { error: sectionError } = await supabase
        .from('course_sections')
        .upsert({
          id: section.id,
          title: section.title,
          description: section.description || null,
          position: section.position,
          course_id: courseId
        });

      if (sectionError) {
        console.error('Error updating section:', sectionError);
        return { data: null, error: new Error(`Error updating section: ${sectionError.message}`), success: false };
      }

      // 2. Update or insert the lectures for this section
      if (section.lectures && section.lectures.length > 0) {
        for (let j = 0; j < section.lectures.length; j++) {
          const lecture = section.lectures[j];
          lecture.position = j; // Update position based on array order
          
          // Upsert the lecture
          const { error: lectureError } = await supabase
            .from('course_lectures')
            .upsert({
              id: lecture.id,
              title: lecture.title,
              description: lecture.description || null,
              position: lecture.position,
              section_id: section.id,
              video_url: lecture.video_url || null,
              duration: lecture.duration || null,
              has_homework: lecture.has_homework || false,
              is_free: lecture.is_free || false,
              requires_homework_completion: lecture.requires_homework_completion || false
            });

          if (lectureError) {
            console.error('Error updating lecture:', lectureError);
            return { data: null, error: new Error(`Error updating lecture: ${lectureError.message}`), success: false };
          }
        }
      }
    }

    // 3. Delete sections and lectures that are no longer present
    // First, get current sections and lectures from DB
    const { data: currentSections, error: fetchError } = await supabase
      .from('course_sections')
      .select('id, lectures:course_lectures(id)')
      .eq('course_id', courseId);

    if (fetchError) {
      console.error('Error fetching current sections:', fetchError);
      return { data: null, error: new Error(`Error fetching current sections: ${fetchError.message}`), success: false };
    }

    // Build arrays of IDs from the updated sections/lectures
    const updatedSectionIds = sections.map(s => s.id);
    const updatedLectureIds: string[] = [];
    sections.forEach(section => {
      if (section.lectures) {
        section.lectures.forEach(lecture => {
          updatedLectureIds.push(lecture.id);
        });
      }
    });

    // For each section in DB, check if it still exists
    for (const dbSection of currentSections || []) {
      if (!updatedSectionIds.includes(dbSection.id)) {
        // Section doesn't exist in updated data, delete it
        const { error: deleteError } = await supabase
          .from('course_sections')
          .delete()
          .eq('id', dbSection.id);

        if (deleteError) {
          console.error(`Error deleting section ${dbSection.id}:`, deleteError);
          return { data: null, error: new Error(`Error deleting section: ${deleteError.message}`), success: false };
        }
      } else {
        // Section exists, check for lectures to delete
        if (dbSection.lectures) {
          for (const lecture of dbSection.lectures) {
            if (!updatedLectureIds.includes(lecture.id)) {
              // Lecture doesn't exist in updated data, delete it
              const { error: deleteLectureError } = await supabase
                .from('course_lectures')
                .delete()
                .eq('id', lecture.id);

              if (deleteLectureError) {
                console.error(`Error deleting lecture ${lecture.id}:`, deleteLectureError);
                return { data: null, error: new Error(`Error deleting lecture: ${deleteLectureError.message}`), success: false };
              }
            }
          }
        }
      }
    }

    // Update the course's lecture_count
    const totalLectures = sections.reduce((count, section) => {
      return count + (section.lectures?.length || 0);
    }, 0);

    const { error: countUpdateError } = await supabase
      .from('courses_new')
      .update({ lecture_count: totalLectures })
      .eq('id', courseId);

    if (countUpdateError) {
      console.warn('Error updating lecture count:', countUpdateError);
      // Not critical, just warn
    }

    return { data: true, error: null, success: true };
  } catch (error: any) {
    console.error('Error in saveCourseOutline:', error);
    return { data: null, error, success: false };
  }
}
