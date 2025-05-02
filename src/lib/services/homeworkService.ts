
/**
 * Homework System Services
 * This file contains safe utilities for interacting with the homework system
 * that bypass TypeScript strict checking while maintaining runtime safety.
 */

import { supabase } from '@/integrations/supabase/client';
import { selectFromTable, insertIntoTable, deleteFromTable, updateTable } from './typeSafeSupabase';

/**
 * Interface for homework data
 */
export interface HomeworkData {
  id?: string;
  title: string;
  description?: string;
  course_id: number;
  lecture_id: string;
  type: string;
  options?: any;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface for homework submission data
 */
export interface HomeworkSubmissionData {
  id?: string;
  user_id: string;
  homework_id: string;
  course_id: number;
  lecture_id: string;
  answers: any;
  score?: number;
  feedback?: string;
  submitted_at: string;
}

/**
 * Debug the homework table structure and content
 */
export async function debugHomeworkTable() {
  try {
    const { data, error } = await selectFromTable('homework', '*', {});
      
    if (error) {
      console.error('Error querying homework table:', error);
      return { success: false, error, count: 0 };
    }
    
    return { 
      success: true, 
      count: data?.length || 0,
      sample: data && data.length > 0 ? data[0] : null
    };
  } catch (error) {
    console.error('Unexpected error in debugHomeworkTable:', error);
    return { success: false, error, count: 0 };
  }
}

/**
 * Get homework by course ID and lecture ID
 */
export async function getHomeworkByCourseAndLecture(courseId: number, lectureId: string) {
  try {
    // Validate course ID
    if (isNaN(courseId) || courseId <= 0) {
      throw new Error(`Invalid course ID: ${courseId}`);
    }
    
    console.log(`[homeworkService] Fetching homework for course ${courseId}, lecture ${lectureId}`);
    
    const { data, error } = await selectFromTable<HomeworkData>(
      'homework',
      '*',
      { course_id: courseId, lecture_id: lectureId }
    );
    
    if (error) {
      console.error('Error fetching homework:', error);
      throw error;
    }
    
    return { success: true, homework: data || [] };
  } catch (error) {
    console.error('Error in getHomeworkByCourseAndLecture:', error);
    return { 
      success: false, 
      error,
      homework: []
    };
  }
}

/**
 * Get homework submissions by user, course, and lecture
 */
export async function getHomeworkSubmissions(userId: string, courseId: number, lectureId: string) {
  try {
    const { data, error } = await selectFromTable(
      'homework_submissions',
      'homework_id, submitted_at',
      {
        course_id: courseId,
        lecture_id: lectureId,
        user_id: userId
      }
    );
    
    if (error) {
      console.error('Error fetching homework submissions:', error);
      throw error;
    }
    
    // Convert to map of homework_id -> true for easy lookup
    const submissions = (data || []).reduce((acc: Record<string, boolean>, curr: any) => {
      acc[curr.homework_id] = true;
      return acc;
    }, {});
    
    return { success: true, submissions };
  } catch (error) {
    console.error('Error in getHomeworkSubmissions:', error);
    return { 
      success: false, 
      error,
      submissions: {}
    };
  }
}

/**
 * Create default homework for a lecture
 */
export async function createDefaultHomework(courseId: number, lectureId: string, title: string = 'Default Homework') {
  try {
    // Validate course ID
    if (isNaN(courseId) || courseId <= 0) {
      throw new Error(`Invalid course ID: ${courseId}`);
    }
    
    // Check if course exists
    const { data: courseExists, error: courseError } = await selectFromTable(
      'courses_new',
      'id',
      { id: courseId }
    );
    
    if (courseError || !courseExists || courseExists.length === 0) {
      throw new Error(`Course ID ${courseId} does not exist in the new course system`);
    }
    
    // Create homework
    const { data, error } = await insertIntoTable<HomeworkData>(
      'homework',
      {
        title,
        course_id: courseId,
        lecture_id: lectureId,
        type: 'quiz',
        options: {
          questions: [
            {
              id: 1,
              text: 'Sample question',
              type: 'multiple_choice',
              choices: [
                { id: 1, text: 'Option A' },
                { id: 2, text: 'Option B' },
                { id: 3, text: 'Option C' }
              ],
              correctAnswer: 1
            }
          ]
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    );
    
    if (error) {
      throw error;
    }
    
    return { success: true, homework: data?.[0] };
  } catch (error) {
    console.error('Error in createDefaultHomework:', error);
    return { success: false, error };
  }
}

/**
 * Get homework by lecture ID
 * This function is used for the HomeworkPanel component
 */
export async function getHomeworksByLectureId(lectureId: string) {
  try {
    console.log(`[homeworkService] Fetching homework for lecture ${lectureId}`);
    
    const { data, error } = await selectFromTable<HomeworkData>(
      'homework',
      '*',
      { lecture_id: lectureId }
    );
    
    if (error) {
      console.error('Error fetching homework by lecture ID:', error);
      return { error, data: [] };
    }
    
    return { data: data || [], error: null };
  } catch (error) {
    console.error('Error in getHomeworksByLectureId:', error);
    return { 
      error,
      data: []
    };
  }
}

/**
 * Save homework (create or update)
 */
export async function saveHomework(homeworkData: HomeworkData) {
  try {
    // Validate course ID
    if (isNaN(homeworkData.course_id) || homeworkData.course_id <= 0) {
      throw new Error(`Invalid course ID: ${homeworkData.course_id}`);
    }
    
    // Check if homework exists
    let existingHomework = null;
    
    if (homeworkData.id) {
      const { data, error } = await selectFromTable(
        'homework',
        'id',
        { id: homeworkData.id }
      );
      
      if (error) {
        console.error('Error checking homework existence:', error);
        throw error;
      }
      
      existingHomework = data && data.length > 0 ? data[0] : null;
    }
    
    // Add timestamps
    const now = new Date().toISOString();
    const updatedData = {
      ...homeworkData,
      updated_at: now
    };
    
    if (!existingHomework) {
      updatedData.created_at = now;
    }
    
    let result;
    
    if (existingHomework) {
      // Update existing homework
      result = await updateTable(
        'homework',
        updatedData,
        { id: homeworkData.id }
      );
    } else {
      // Create new homework
      result = await insertIntoTable(
        'homework',
        updatedData
      );
    }
    
    if (result.error) {
      console.error('Error saving homework:', result.error);
      return { error: result.error, data: null };
    }
    
    const savedData = result.data?.[0] || null;
    return { data: savedData, error: null };
  } catch (error) {
    console.error('Error in saveHomework:', error);
    return { error, data: null };
  }
}

/**
 * Delete homework by ID
 */
export async function deleteHomework(homeworkId: string) {
  try {
    const { error } = await deleteFromTable(
      'homework',
      { id: homeworkId }
    );
    
    if (error) {
      console.error('Error deleting homework:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in deleteHomework:', error);
    return { success: false, error };
  }
}
