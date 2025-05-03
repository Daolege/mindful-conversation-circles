import { supabase } from "@/integrations/supabase/client";
import { CourseNew, CourseSection, CourseLecture } from '@/lib/types/course-new';

/**
 * Clear all local storage data for a course
 * @param courseId 
 */
export const clearCourseLocalStorageData = (courseId: number) => {
  try {
    // Clear section visibility
    localStorage.removeItem(`course_${courseId}_section_visibility`);
    
    // Clear saved sections state
    localStorage.removeItem(`course_${courseId}_saved_sections`);
    
    // Clear other course-specific data
    localStorage.removeItem(`course_${courseId}_course_learning_objectives_saved`);
    localStorage.removeItem(`course_${courseId}_course_requirements_saved`);
    localStorage.removeItem(`course_${courseId}_course_audiences_saved`);
  } catch (e) {
    console.warn('Failed to clear localStorage data:', e);
  }
};

/**
 * Get a course by its ID
 * @param courseId The ID of the course to retrieve
 * @returns The course data and any error
 */
export const getCourseNewById = async (courseId: number) => {
  try {
    // Get the course basic data
    const { data: courseData, error: courseError } = await supabase
      .from('courses_new')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (courseError) throw courseError;
    if (!courseData) throw new Error('Course not found');
    
    // Get course sections
    const { data: sectionsData, error: sectionsError } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('position');
    
    if (sectionsError) throw sectionsError;
    
    // Get course lectures for all sections
    let lectures: any[] = [];
    if (sectionsData && sectionsData.length > 0) {
      const sectionIds = sectionsData.map(section => section.id);
      
      const { data: lecturesData, error: lecturesError } = await supabase
        .from('course_lectures')
        .select('*')
        .in('section_id', sectionIds)
        .order('position');
      
      if (lecturesError) throw lecturesError;
      if (lecturesData) lectures = lecturesData;
    }
    
    // Get learning objectives
    const { data: objectivesData, error: objectivesError } = await supabase
      .from('course_learning_objectives')
      .select('*')
      .eq('course_id', courseId)
      .order('position');
    
    if (objectivesError) throw objectivesError;
    
    // Get requirements
    const { data: requirementsData, error: requirementsError } = await supabase
      .from('course_requirements')
      .select('*')
      .eq('course_id', courseId)
      .order('position');
    
    if (requirementsError) throw requirementsError;
    
    // Get target audience
    const { data: audienceData, error: audienceError } = await supabase
      .from('course_audiences')
      .select('*')
      .eq('course_id', courseId)
      .order('position');
    
    if (audienceError) throw audienceError;
    
    // Get course materials
    const { data: materialsData, error: materialsError } = await supabase
      .from('course_materials')
      .select('*')
      .eq('course_id', courseId)
      .order('position');
    
    if (materialsError) throw materialsError;
    
    // Check visibility settings from localStorage if available
    const visibilityKey = `course_${courseId}_section_visibility`;
    const visibilityData = localStorage.getItem(visibilityKey);
    let visibility = visibilityData ? JSON.parse(visibilityData) : null;
    
    // Use database values if available (determine visibility from is_visible flags)
    const showObjectives = objectivesData && objectivesData.length > 0 
      ? objectivesData.some(obj => obj.is_visible !== false)
      : true; // Default to true if no data
      
    const showRequirements = requirementsData && requirementsData.length > 0
      ? requirementsData.some(req => req.is_visible !== false)
      : true;
      
    const showTargetAudience = audienceData && audienceData.length > 0
      ? audienceData.some(aud => aud.is_visible !== false)
      : true;
    
    // Merge database visibility with localStorage visibility
    visibility = {
      objectives: visibility?.objectives !== undefined ? visibility.objectives : showObjectives,
      requirements: visibility?.requirements !== undefined ? visibility.requirements : showRequirements,
      audiences: visibility?.audiences !== undefined ? visibility.audiences : showTargetAudience,
      materials: visibility?.materials !== undefined ? visibility.materials : false
    };
    
    // Build sections with their lectures
    const sections: CourseSection[] = sectionsData ? sectionsData.map(section => {
      const sectionLectures = lectures.filter(lecture => lecture.section_id === section.id)
        .sort((a, b) => a.position - b.position);
        
      return {
        ...section,
        lectures: sectionLectures
      };
    }) : [];
    
    // Map the learning objectives to string array
    const learning_objectives = objectivesData ? objectivesData.map(obj => obj.content) : [];
    
    // Map the requirements to string array
    const requirements = requirementsData ? requirementsData.map(req => req.content) : [];
    
    // Map the target audience to string array
    const target_audience = audienceData ? audienceData.map(aud => aud.content) : [];
    
    // Build complete course data
    const completeData = {
      ...courseData,
      sections,
      learning_objectives,
      requirements,
      target_audience,
      materials: materialsData || [],
      // Add visibility flags to course data
      showObjectives: visibility.objectives,
      showRequirements: visibility.requirements,
      showTargetAudience: visibility.audiences,
      showMaterials: visibility.materials
    };
    
    return { data: completeData, error: null };
  } catch (error: any) {
    console.error("Error in getCourseNewById:", error);
    return { data: null, error };
  }
};

/**
 * Create a new course
 * @param courseData The data for the new course
 * @returns The new course data and any error
 */
export const createCourseNew = async (courseData: Partial<CourseNew> & { title: string }) => {
  try {
    const { data, error } = await supabase
      .from('courses_new')
      .insert([courseData])
      .select()
      .single();

    if (error) {
      console.error("Error creating course:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error("Error creating course:", error);
    return { data: null, error };
  }
};

/**
 * Update an existing course
 * @param courseId The ID of the course to update
 * @param courseData The new data for the course
 * @returns The updated course data and any error
 */
export const updateCourseNew = async (courseId: number, courseData: Partial<CourseNew>) => {
  try {
    const { data, error } = await supabase
      .from('courses_new')
      .update(courseData)
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      console.error("Error updating course:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error("Error updating course:", error);
    return { data: null, error };
  }
};

/**
 * Get all sections for a course
 * @param courseId The ID of the course
 * @returns An array of sections and any error
 */
export const getSections = async (courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('position');

    if (error) {
      console.error("Error fetching sections:", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching sections:", error);
    return { data: null, error };
  }
};

/**
 * Save full course data including basic info, sections, and lectures
 * @param courseId The ID of the course to save (0 for new course)
 * @param courseData The basic course data
 * @param sections The array of sections with their lectures
 * @returns Success status, saved course data, and any error
 */
export const saveFullCourse = async (
  courseId: number,
  courseData: Partial<CourseNew> & { title: string },
  sections: CourseSection[]
) => {
  try {
    // Start by creating or updating the basic course information
    let savedCourse;
    if (courseId === 0) {
      // Create a new course
      const createResult = await createCourseNew(courseData);
      if (createResult.error) {
        console.error("Error creating course:", createResult.error);
        return { success: false, data: null, error: createResult.error };
      }
      savedCourse = createResult.data;
    } else {
      // Update an existing course
      const updateResult = await updateCourseNew(courseId, courseData);
      if (updateResult.error) {
        console.error("Error updating course:", updateResult.error);
        return { success: false, data: null, error: updateResult.error };
      }
      savedCourse = updateResult.data;
    }

    if (!savedCourse) {
      console.error("Failed to save course basic information.");
      return {
        success: false,
        data: null,
        error: new Error("Failed to save course basic information."),
      };
    }

    // Now handle the sections and lectures
    // First, delete existing sections for the course
    if (courseId !== 0) {
      const { error: deleteSectionsError } = await supabase
        .from('course_sections')
        .delete()
        .eq('course_id', courseId);

      if (deleteSectionsError) {
        console.error("Error deleting existing sections:", deleteSectionsError);
        return {
          success: false,
          data: null,
          error: deleteSectionsError,
        };
      }
    }

    // Next, insert or update sections and their lectures
    for (const section of sections) {
      // Prepare section data for insertion
      const sectionData = {
        course_id: savedCourse.id,
        title: section.title,
        position: section.position,
      };

      // Insert the section
      const { data: savedSection, error: insertSectionError } = await supabase
        .from('course_sections')
        .insert([sectionData])
        .select()
        .single();

      if (insertSectionError) {
        console.error("Error inserting section:", insertSectionError);
        return {
          success: false,
          data: null,
          error: insertSectionError,
        };
      }

      // Handle lectures for the section
      if (section.lectures && section.lectures.length > 0) {
        // First, delete existing lectures for the section
        if (courseId !== 0) {
          const { error: deleteLecturesError } = await supabase
            .from('course_lectures')
            .delete()
            .eq('section_id', savedSection.id);

          if (deleteLecturesError) {
            console.error("Error deleting existing lectures:", deleteLecturesError);
            return {
              success: false,
              data: null,
              error: deleteLecturesError,
            };
          }
        }

        // Then, insert the new lectures
        for (const lecture of section.lectures) {
          const lectureData = {
            section_id: savedSection.id,
            title: lecture.title,
            position: lecture.position,
            video_url: lecture.video_url || null,
            duration: lecture.duration || null,
            description: lecture.description || null,
            has_homework: lecture.has_homework || false,
            requires_homework_completion: lecture.requires_homework_completion || false,
            is_free: lecture.is_free || false
          };

          const { data: savedLecture, error: insertLectureError } = await supabase
            .from('course_lectures')
            .insert([lectureData])
            .select()
            .single();

          if (insertLectureError) {
            console.error("Error inserting lecture:", insertLectureError);
            return {
              success: false,
              data: null,
              error: insertLectureError,
            };
          }
        }
      }
    }

    // If everything went well, return success with the saved course data
    return { success: true, data: savedCourse, error: null };
  } catch (error: any) {
    console.error("Error in saveFullCourse:", error);
    return { success: false, data: null, error };
  }
};
