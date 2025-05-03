
import { supabase } from "@/integrations/supabase/client";
import { CourseEnrollmentGuide } from "@/components/admin/course/settings/EditableCourseEnrollmentGuideComponent";

/**
 * Get enrollment guides for a specific course
 * @param courseId The ID of the course
 * @returns A promise with the enrollment guides data and any error
 */
export const getEnrollmentGuides = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_enrollment_guides')
      .select('*')
      .eq('course_id', courseId)
      .order('position');

    return { data, error };
  } catch (error) {
    console.error('Error fetching enrollment guides:', error);
    return { data: null, error };
  }
};

/**
 * Save enrollment guides for a course
 * @param courseId The ID of the course
 * @param guides Array of enrollment guide objects to save
 * @returns A promise with the operation result
 */
export const saveEnrollmentGuides = async (courseId: number, guides: CourseEnrollmentGuide[]) => {
  try {
    // First delete all existing guides
    const { error: deleteError } = await supabase
      .from('course_enrollment_guides')
      .delete()
      .eq('course_id', courseId);

    if (deleteError) {
      throw deleteError;
    }

    // Then insert the new guides with updated positions
    const guidesToInsert = guides.map((guide, index) => ({
      course_id: courseId,
      guide_type: guide.guide_type,
      title: guide.title,
      content: guide.content || null,
      link: guide.link || null,
      image_url: guide.image_url || null,
      position: index
    }));

    // Only insert if we have guides to insert
    if (guidesToInsert.length > 0) {
      const { data, error: insertError } = await supabase
        .from('course_enrollment_guides')
        .insert(guidesToInsert)
        .select();

      if (insertError) {
        throw insertError;
      }

      return { data, error: null };
    }

    return { data: [], error: null };
  } catch (error) {
    console.error('Error saving enrollment guides:', error);
    return { data: null, error };
  }
};
