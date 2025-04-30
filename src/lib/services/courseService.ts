
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { CourseNew } from "../types/course-new";
import { v4 as uuidv4 } from 'uuid';

// Interface to prevent deep type instantiation
interface CourseData {
  id?: number;
  title: string;
  description?: string;
  price: number;
  originalprice?: number;
  display_order: number;
  [key: string]: any;
}

// Get all courses
export const getAllCourses = async () => {
  console.log('Fetching all courses');
  const { data, error } = await supabase
    .from('courses_new')
    .select('*')
    .order('display_order', { ascending: true });
  
  return { data, error };
};

// Get featured courses
export const getFeaturedCourses = async () => {
  console.log('Fetching featured courses');
  const { data, error } = await supabase
    .from('courses_new')
    .select('*')
    .eq('is_featured', true)
    .eq('status', 'published')
    .order('display_order', { ascending: true });
  
  return { data, error };
};

// Get published courses
export const getPublishedCourses = async () => {
  console.log('Fetching published courses');
  const { data, error } = await supabase
    .from('courses_new')
    .select('*')
    .eq('status', 'published')
    .order('display_order', { ascending: true });
  
  return { data, error };
};

// Get a specific course by ID
export const getCourseById = async (id: number) => {
  console.log('Fetching course with id:', id);
  
  try {
    // First get the course basic info
    const { data, error } = await supabase
      .from('courses_new')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    if (!data) throw new Error('Course not found');
    
    // Then get the course materials
    const { data: materials, error: materialsError } = await supabase
      .from('course_materials')
      .select('*')
      .eq('course_id', id)
      .order('position', { ascending: true });
      
    if (materialsError) {
      console.error('Error fetching course materials:', materialsError);
    }
    
    return { 
      data: { 
        ...data, 
        materials: materials || [] 
      } 
    };
  } catch (error: any) {
    console.error('Error fetching course:', error);
    return { error };
  }
};

// Get a course by ID with sections and lectures
export const getCourseWithSectionsAndLectures = async (id: number) => {
  console.log('Fetching course with id, sections, and lectures:', id);
  
  try {
    // Get course basic info
    const { data: course, error: courseError } = await supabase
      .from('courses_new')
      .select('*')
      .eq('id', id)
      .single();
      
    if (courseError) throw courseError;
    if (!course) throw new Error('Course not found');
    
    // Get sections
    const { data: sections, error: sectionsError } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', id)
      .order('position', { ascending: true });
      
    if (sectionsError) {
      console.error('Error fetching course sections:', sectionsError);
      throw sectionsError;
    }
    
    // Get lectures for each section
    if (sections && sections.length > 0) {
      const sectionsWithLectures = await Promise.all(
        sections.map(async (section) => {
          const { data: lectures, error: lecturesError } = await supabase
            .from('course_lectures')
            .select('*')
            .eq('section_id', section.id)
            .order('position', { ascending: true });
            
          if (lecturesError) {
            console.error(`Error fetching lectures for section ${section.id}:`, lecturesError);
            return { ...section, lectures: [] };
          }
          
          return { ...section, lectures: lectures || [] };
        })
      );
      
      return { data: { ...course, sections: sectionsWithLectures } };
    }
    
    return { data: { ...course, sections: [] } };
  } catch (error: any) {
    console.error('Error fetching course with sections and lectures:', error);
    return { error };
  }
};

// Save or update a course
export const saveCourse = async (courseData: CourseData) => {
  console.log('Saving course:', courseData);
  
  try {
    const { id, ...courseToSave } = courseData;
    
    // Update an existing course
    if (id) {
      const { data, error } = await supabase
        .from('courses_new')
        .update(courseToSave)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return { data };
    } 
    // Create a new course
    else {
      const { data, error } = await supabase
        .from('courses_new')
        .insert([courseToSave])
        .select();
        
      if (error) throw error;
      return { data };
    }
  } catch (error: any) {
    console.error('Error saving course:', error);
    return { error };
  }
};

// Create a new section for a course
export const createSection = async (courseId: number, title: string, position: number) => {
  console.log(`Creating section "${title}" for course ${courseId} at position ${position}`);
  const sectionId = uuidv4();
  
  try {
    const { data, error } = await supabase
      .from('course_sections')
      .insert([{
        id: sectionId,
        course_id: courseId,
        title,
        position
      }])
      .select();
      
    if (error) throw error;
    return { data };
  } catch (error: any) {
    console.error('Error creating section:', error);
    return { error };
  }
};

// Update a section
export const updateSection = async (sectionId: string, updates: { title?: string; position?: number }) => {
  console.log(`Updating section ${sectionId}:`, updates);
  
  try {
    const { data, error } = await supabase
      .from('course_sections')
      .update(updates)
      .eq('id', sectionId)
      .select();
      
    if (error) throw error;
    return { data };
  } catch (error: any) {
    console.error('Error updating section:', error);
    return { error };
  }
};

// Delete a section
export const deleteSection = async (sectionId: string) => {
  console.log(`Deleting section ${sectionId}`);
  
  try {
    // Delete lectures first (cascading delete not always reliable)
    const { error: lectureDeleteError } = await supabase
      .from('course_lectures')
      .delete()
      .eq('section_id', sectionId);
      
    if (lectureDeleteError) {
      console.error('Error deleting lectures for section:', lectureDeleteError);
    }
    
    // Delete the section
    const { data, error } = await supabase
      .from('course_sections')
      .delete()
      .eq('id', sectionId)
      .select();
      
    if (error) throw error;
    return { data };
  } catch (error: any) {
    console.error('Error deleting section:', error);
    return { error };
  }
};

// Create a new lecture
export const createLecture = async (sectionId: string, lectureData: {
  title: string;
  position: number;
  is_free?: boolean;
  duration?: string;
  video_url?: string;
}) => {
  console.log(`Creating lecture in section ${sectionId}:`, lectureData);
  const lectureId = uuidv4();
  
  try {
    const { data, error } = await supabase
      .from('course_lectures')
      .insert([{
        id: lectureId,
        section_id: sectionId,
        ...lectureData
      }])
      .select();
      
    if (error) throw error;
    return { data };
  } catch (error: any) {
    console.error('Error creating lecture:', error);
    return { error };
  }
};

// Update a lecture
export const updateLecture = async (lectureId: string, updates: {
  title?: string;
  position?: number;
  is_free?: boolean;
  duration?: string;
  video_url?: string;
}) => {
  console.log(`Updating lecture ${lectureId}:`, updates);
  
  try {
    const { data, error } = await supabase
      .from('course_lectures')
      .update(updates)
      .eq('id', lectureId)
      .select();
      
    if (error) throw error;
    return { data };
  } catch (error: any) {
    console.error('Error updating lecture:', error);
    return { error };
  }
};

// Delete a lecture
export const deleteLecture = async (lectureId: string) => {
  console.log(`Deleting lecture ${lectureId}`);
  
  try {
    const { data, error } = await supabase
      .from('course_lectures')
      .delete()
      .eq('id', lectureId)
      .select();
      
    if (error) throw error;
    return { data };
  } catch (error: any) {
    console.error('Error deleting lecture:', error);
    return { error };
  }
};

// Save course materials
export const saveMaterials = async (courseId: number, materials: any[]) => {
  console.log(`Saving ${materials.length} materials for course ${courseId}`);
  
  try {
    // Delete existing materials first
    const { error: deleteError } = await supabase
      .from('course_materials')
      .delete()
      .eq('course_id', courseId);
      
    if (deleteError) {
      console.error('Error deleting existing materials:', deleteError);
    }
    
    // Insert new materials if available
    if (materials && materials.length > 0) {
      // Generate UUIDs for any materials without IDs
      const materialsWithIds = materials.map((material, index) => ({
        ...material,
        id: material.id?.toString().startsWith('temp-') ? uuidv4() : material.id,
        course_id: courseId,
        position: material.position || index
      }));
      
      const { data, error } = await supabase
        .from('course_materials')
        .insert(materialsWithIds)
        .select();
        
      if (error) throw error;
      return { data };
    }
    
    return { data: [] };
  } catch (error: any) {
    console.error('Error saving materials:', error);
    return { error };
  }
};

// Update course status
export const updateCourseStatus = async (courseId: number, status: 'draft' | 'published' | 'archived') => {
  console.log(`Updating course ${courseId} status to ${status}`);
  
  try {
    const updates: any = { status };
    
    // If publishing, record the published_at timestamp
    if (status === 'published') {
      updates.published_at = new Date().toISOString();
    }
    
    const { data, error } = await supabase
      .from('courses_new')
      .update(updates)
      .eq('id', courseId)
      .select();
      
    if (error) throw error;
    return { data };
  } catch (error: any) {
    console.error('Error updating course status:', error);
    return { error };
  }
};

// Add the missing updateCourseOrder function
export const updateCourseOrder = async (courses: { id: number; display_order: number }[]) => {
  console.log('Updating course order:', courses);
  
  try {
    // Create an array of updates to perform
    const updates = courses.map(({ id, display_order }) => ({
      id,
      display_order
    }));
    
    // Using upsert to update multiple records
    const { error } = await supabase
      .from('courses')
      .upsert(updates, { onConflict: 'id' });
    
    if (error) {
      console.error('Error updating course order:', error);
      return false;
    }
    
    return true;
  } catch (error: any) {
    console.error('Unexpected error in updateCourseOrder:', error);
    return false;
  }
};
