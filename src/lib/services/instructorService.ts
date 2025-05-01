import { supabase } from '@/integrations/supabase/client';
import type { Instructor } from '../types/instructor';
import { getCoursesByInstructorId } from './courseService';

export async function getAllInstructors() {
  try {
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .order('name');
    
    console.log('Fetched instructors data:', data);
    
    if (error) throw error;
    
    // For each instructor, get their course count
    const instructorsWithCounts = await Promise.all(
      (data as Instructor[]).map(async (instructor) => {
        // Convert string id to number if necessary
        const instructorId = typeof instructor.id === 'string' && !isNaN(Number(instructor.id)) 
          ? Number(instructor.id) 
          : typeof instructor.id === 'number' 
            ? instructor.id 
            : 0;
        
        const instructorIdStr = String(instructorId);
        const coursesResult = await getCoursesByInstructorId(instructorIdStr);
        const courseCount = coursesResult.data?.length || 0;
        
        return {
          ...instructor,
          courseCount
        };
      })
    );
    
    return {
      data: instructorsWithCounts,
      error: null
    };
  } catch (error) {
    console.error('Error fetching instructors:', error);
    return {
      data: null,
      error: error as Error
    };
  }
}

export async function getInstructorById(id: string) {
  try {
    const { data, error } = await supabase
      .from('instructors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Get instructor courses
    const coursesResult = await getCoursesByInstructorId(id);
    
    return {
      data: {
        ...data as Instructor,
        courses: coursesResult.data || [],
        courseCount: coursesResult.data?.length || 0
      },
      error: null
    };
  } catch (error) {
    console.error(`Error fetching instructor with ID ${id}:`, error);
    return {
      data: null,
      error: error as Error
    };
  }
}

export async function getFeaturedInstructors(limit: number = 4) {
  try {
    // Get all instructors first
    const { data: allInstructors, error } = await getAllInstructors();
    
    if (error) throw error;
    
    // Sort by course count and take the top 'limit' instructors
    const featured = allInstructors
      ?.sort((a, b) => (b.courseCount || 0) - (a.courseCount || 0))
      .slice(0, limit);
    
    return {
      data: featured,
      error: null
    };
  } catch (error) {
    console.error('Error fetching featured instructors:', error);
    return {
      data: null,
      error: error as Error
    };
  }
}
