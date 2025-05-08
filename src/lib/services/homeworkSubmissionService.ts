
import { supabase } from '@/integrations/supabase/client';
import { HomeworkSubmission } from '@/lib/types/homework';

export interface CourseSection {
  id: string;
  title: string;
  position: number;
  lectures: {
    id: string;
    title: string;
    position: number;
    requires_homework_completion: boolean;
  }[];
}

export interface HomeworkStats {
  enrolledStudents: number;
  totalSubmissions: number;
  homeworkLectures: number;
  recentSubmissions: number;
}

// Get a specific homework submission by ID
export const getHomeworkSubmissionById = async (id: string): Promise<HomeworkSubmission | null> => {
  try {
    // First get the submission data
    const { data: submissionData, error: submissionError } = await supabase
      .from('homework_submissions')
      .select(`
        id,
        homework_id,
        user_id,
        lecture_id,
        course_id,
        answer,
        file_url,
        status,
        submitted_at,
        created_at
      `)
      .eq('id', id)
      .single();

    if (submissionError) {
      console.error('Error fetching submission:', submissionError);
      return null;
    }
    
    // Then get the homework data
    const { data: homeworkData, error: homeworkError } = await supabase
      .from('homework')
      .select('id, title, description, type')
      .eq('id', submissionData.homework_id)
      .single();
      
    if (homeworkError) {
      console.error('Error fetching homework details:', homeworkError);
    }
      
    // Get user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', submissionData.user_id)
      .single();

    if (profileError) {
      console.error('Error fetching profile data:', profileError);
    }

    // Format the data to match our interface
    const submission: HomeworkSubmission = {
      id: submissionData.id,
      homework_id: submissionData.homework_id,
      user_id: submissionData.user_id,
      lecture_id: submissionData.lecture_id,
      course_id: submissionData.course_id,
      answer: submissionData.answer,
      file_url: submissionData.file_url,
      status: submissionData.status || 'pending',
      submitted_at: submissionData.submitted_at,
      created_at: submissionData.created_at,
      homework: homeworkError ? undefined : {
        id: homeworkData.id,
        title: homeworkData.title,
        type: homeworkData.type,
        description: homeworkData.description
      },
      user_name: profileError ? "用户名不详" : (profileData?.full_name || "用户名不详"),
      user_email: profileError ? "" : (profileData?.email || "")
    };

    return submission;
  } catch (error) {
    console.error('Error fetching homework submission:', error);
    return null;
  }
};

// Get all homework submissions for a course
export const getHomeworkSubmissionsByCourseId = async (courseId: number): Promise<HomeworkSubmission[]> => {
  try {
    // Get all submissions for the course
    const { data, error } = await supabase
      .from('homework_submissions')
      .select(`
        id,
        homework_id,
        user_id,
        lecture_id,
        course_id,
        created_at
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting submissions:', error);
      return [];
    }

    // Get user profiles for each submission
    const submissions: HomeworkSubmission[] = await Promise.all((data || []).map(async (item) => {
      try {
        // Get profile data for each user
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', item.user_id)
          .single();
          
        if (profileError) {
          console.error(`Error fetching profile for user ${item.user_id}:`, profileError);
          return {
            id: item.id,
            homework_id: item.homework_id,
            user_id: item.user_id,
            lecture_id: item.lecture_id,
            course_id: item.course_id,
            created_at: item.created_at,
            user_name: "用户名不详",
            user_email: ""
          };
        }
        
        return {
          id: item.id,
          homework_id: item.homework_id,
          user_id: item.user_id,
          lecture_id: item.lecture_id,
          course_id: item.course_id,
          created_at: item.created_at,
          user_name: profileData?.full_name || "用户名不详",
          user_email: profileData?.email || ""
        };
      } catch (error) {
        console.error(`Error processing submission ${item.id}:`, error);
        return {
          id: item.id,
          homework_id: item.homework_id,
          user_id: item.user_id,
          lecture_id: item.lecture_id,
          course_id: item.course_id,
          created_at: item.created_at,
          user_name: "用户名不详",
          user_email: ""
        };
      }
    }));

    return submissions;
  } catch (error) {
    console.error('Error getting course submissions:', error);
    return [];
  }
};

// Get all homework submissions for a specific lecture
export const getHomeworkSubmissionsByLectureId = async (lectureId: string): Promise<HomeworkSubmission[]> => {
  try {
    // Get all submissions for the lecture
    const { data, error } = await supabase
      .from('homework_submissions')
      .select(`
        id,
        homework_id,
        user_id,
        lecture_id,
        course_id,
        created_at
      `)
      .eq('lecture_id', lectureId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting lecture submissions:', error);
      return [];
    }

    // Get user profiles for each submission
    const submissions: HomeworkSubmission[] = await Promise.all((data || []).map(async (item) => {
      try {
        // Get profile data for each user
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', item.user_id)
          .single();
          
        if (profileError) {
          console.error(`Error fetching profile for user ${item.user_id}:`, profileError);
          return {
            id: item.id,
            homework_id: item.homework_id,
            user_id: item.user_id,
            lecture_id: item.lecture_id,
            course_id: item.course_id,
            created_at: item.created_at,
            user_name: "用户名不详",
            user_email: ""
          };
        }
        
        return {
          id: item.id,
          homework_id: item.homework_id,
          user_id: item.user_id,
          lecture_id: item.lecture_id,
          course_id: item.course_id,
          created_at: item.created_at,
          user_name: profileData?.full_name || "用户名不详",
          user_email: profileData?.email || ""
        };
      } catch (error) {
        console.error(`Error processing submission ${item.id}:`, error);
        return {
          id: item.id,
          homework_id: item.homework_id,
          user_id: item.user_id,
          lecture_id: item.lecture_id,
          course_id: item.course_id,
          created_at: item.created_at,
          user_name: "用户名不详",
          user_email: ""
        };
      }
    }));

    return submissions;
  } catch (error) {
    console.error('Error getting lecture submissions:', error);
    return [];
  }
};

// Get all homework submissions for a specific student in a course
export const getHomeworkSubmissionsByStudentId = async (
  studentId: string, 
  courseId: number
): Promise<HomeworkSubmission[]> => {
  try {
    // Get all submissions for the student and course
    const { data, error } = await supabase
      .from('homework_submissions')
      .select(`
        id,
        homework_id,
        user_id,
        lecture_id,
        course_id,
        answer,
        file_url,
        submitted_at,
        created_at
      `)
      .eq('user_id', studentId)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching student submissions:', error);
      return [];
    }
    
    // Get homework details for each submission
    const submissions: HomeworkSubmission[] = await Promise.all(data.map(async (item) => {
      const { data: homeworkData, error: homeworkError } = await supabase
        .from('homework')
        .select('id, title, description, type')
        .eq('id', item.homework_id)
        .single();
        
      return {
        id: item.id,
        homework_id: item.homework_id,
        user_id: item.user_id,
        lecture_id: item.lecture_id,
        course_id: item.course_id,
        answer: item.answer,
        file_url: item.file_url,
        submitted_at: item.submitted_at,
        created_at: item.created_at,
        homework: homeworkError ? undefined : {
          id: homeworkData.id,
          title: homeworkData.title,
          description: homeworkData.description,
          type: homeworkData.type
        }
      };
    }));
    
    return submissions;
  } catch (error) {
    console.error('Error in getHomeworkSubmissionsByStudentId:', error);
    return [];
  }
};

// Get students who have not submitted homework
export const getStudentsWithoutSubmission = async (
  courseId: number,
  lectureId?: string
): Promise<any[]> => {
  try {
    // Get all enrolled students for the course
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('user_courses')
      .select('user_id')
      .eq('course_id', courseId);
    
    if (enrollmentError) {
      console.error('Error getting enrolled students:', enrollmentError);
      return [];
    }
    
    // Extract user IDs
    const userIds = enrollments.map(enrollment => enrollment.user_id);
    
    // Get user profiles
    const studentsWithProfiles = [];
    for (const userId of userIds) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', userId)
        .single();
      
      if (profileData) {
        studentsWithProfiles.push({
          user_id: userId,
          full_name: profileData.full_name || 'Unknown',
          email: profileData.email || ''
        });
      }
    }
    
    // Get all homeworks for the lecture if lectureId is specified
    let homeworkIds: string[] = [];
    
    if (lectureId) {
      const { data: homeworks, error: homeworkError } = await supabase
        .from('homework')
        .select('id')
        .eq('lecture_id', lectureId);
      
      if (homeworkError) {
        console.error('Error getting homework IDs:', homeworkError);
        return [];
      }
      
      homeworkIds = homeworks.map(h => h.id);
      
      // If no homeworks found for this lecture, return all students as "not submitted"
      if (homeworkIds.length === 0) {
        return studentsWithProfiles;
      }
    }
    
    // Get all submissions for these homework IDs
    let submissionQuery = supabase
      .from('homework_submissions')
      .select('user_id')
      .eq('course_id', courseId);
    
    if (lectureId) {
      submissionQuery = submissionQuery.eq('lecture_id', lectureId);
    }
    
    const { data: submissions, error: submissionError } = await submissionQuery;
    
    if (submissionError) {
      console.error('Error getting submissions:', submissionError);
      return [];
    }
    
    // Create a set of users who have submitted
    const submittedUserIds = new Set(submissions.map(s => s.user_id));
    
    // Filter enrolled students who have not submitted
    const studentsWithoutSubmission = studentsWithProfiles
      .filter(student => !submittedUserIds.has(student.user_id));
    
    return studentsWithoutSubmission;
  } catch (error) {
    console.error('Error in getStudentsWithoutSubmission:', error);
    return [];
  }
};

// Get homework completion statistics for a course
export const getHomeworkCompletionStats = async (courseId: number): Promise<HomeworkStats> => {
  try {
    // Get enrolled student count
    const { count: enrolledCount, error: enrollmentError } = await supabase
      .from('user_courses')
      .select('user_id', { count: 'exact', head: true })
      .eq('course_id', courseId);
    
    if (enrollmentError) throw enrollmentError;
    
    // Get total submissions count
    const { count: submissionCount, error: submissionError } = await supabase
      .from('homework_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId);
    
    if (submissionError) throw submissionError;
    
    // Get count of lectures with homework
    const { data: lectures, error: lectureError } = await supabase
      .from('homework')
      .select('lecture_id')
      .eq('course_id', courseId)
      .order('lecture_id');
    
    if (lectureError) throw lectureError;
    
    // Count unique lecture IDs
    const uniqueLectureIds = new Set(lectures.map(l => l.lecture_id));
    
    // Get recent submissions count (past 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: recentCount, error: recentError } = await supabase
      .from('homework_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', courseId)
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    if (recentError) throw recentError;
    
    return {
      enrolledStudents: enrolledCount || 0,
      totalSubmissions: submissionCount || 0,
      homeworkLectures: uniqueLectureIds.size,
      recentSubmissions: recentCount || 0
    };
  } catch (error) {
    console.error('Error getting homework stats:', error);
    return {
      enrolledStudents: 0,
      totalSubmissions: 0,
      homeworkLectures: 0,
      recentSubmissions: 0
    };
  }
};

// Get course structure for homework navigation
export const getCourseStructureForHomework = async (courseId: number): Promise<CourseSection[]> => {
  try {
    // Get all sections for the course
    const { data: sections, error: sectionError } = await supabase
      .from('course_sections')
      .select('id, title, position')
      .eq('course_id', courseId)
      .order('position');
    
    if (sectionError) throw sectionError;
    
    // Get all lectures for these sections
    const result = await Promise.all(sections.map(async (section) => {
      const { data: lectures, error: lectureError } = await supabase
        .from('course_lectures')
        .select('id, title, position, requires_homework_completion')
        .eq('section_id', section.id)
        .order('position');
      
      if (lectureError) {
        console.error(`Error getting lectures for section ${section.id}:`, lectureError);
        return {
          ...section,
          lectures: []
        };
      }
      
      return {
        ...section,
        lectures: lectures || []
      };
    }));
    
    return result;
  } catch (error) {
    console.error('Error getting course structure:', error);
    return [];
  }
};

// Get homework assignments for a specific lecture
export const getHomeworkByLectureId = async (lectureId: string, courseId: number) => {
  try {
    const { data, error } = await supabase
      .from('homework')
      .select('*')
      .eq('lecture_id', lectureId)
      .eq('course_id', courseId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Error fetching homework:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching homework:', error);
    return [];
  }
};
