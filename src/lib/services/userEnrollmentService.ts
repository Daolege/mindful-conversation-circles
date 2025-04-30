
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const enrollUserInSampleCourses = async (userId: string) => {
  console.log('Enrolling user in sample courses:', userId);
  
  try {
    // Check if user already has enrolled courses
    const { data: existingCourses, error: checkError } = await supabase
      .from('user_courses')
      .select('course_id')
      .eq('user_id', userId);
      
    if (checkError) {
      console.error('Error checking existing enrollments:', checkError);
      return;
    }
    
    // If user already has courses, don't generate more
    if (existingCourses && existingCourses.length > 0) {
      console.log('User already has courses, skipping sample data generation');
      return;
    }
    
    // Get up to 8 random courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .limit(8);

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return;
    }

    if (!courses || courses.length === 0) {
      console.log('No courses found to enroll in');
      toast.error('无法加载示例课程数据', {
        description: '请稍后再试'
      });
      return;
    }

    // Shuffle courses randomly
    const shuffledCourses = [...courses].sort(() => Math.random() - 0.5);
    const selectedCourses = shuffledCourses.slice(0, Math.min(4, shuffledCourses.length));
    
    console.log('Selected courses for enrollment:', selectedCourses);

    // Enroll user in courses with random purchase dates and progress data
    const now = new Date();
    
    // 使用服务端RPC函数来插入数据，绕过RLS限制
    for (const course of selectedCourses) {
      try {
        // 1. 添加用户课程关系
        const { error: enrollError } = await supabase.rpc('enroll_user_in_course', {
          p_user_id: userId,
          p_course_id: course.id,
          p_purchased_at: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
        });

        if (enrollError) {
          console.error('Error enrolling in course:', course.id, enrollError);
          continue;
        }

        // 2. 添加课程进度
        const progressType = Math.random();
        let progress;
        let isCompleted;

        if (progressType < 0.3) { // Completed
          progress = 100;
          isCompleted = true;
        } else if (progressType < 0.8) { // In progress
          progress = Math.floor(Math.random() * 65) + 25; // 25% to 90%
          isCompleted = false;
        } else { // Just started
          progress = Math.floor(Math.random() * 20) + 5; // 5% to 25%
          isCompleted = false;
        }

        const { error: progressError } = await supabase.rpc('update_course_progress', {
          p_user_id: userId,
          p_course_id: course.id,
          p_progress_percent: progress,
          p_completed: isCompleted,
          p_lecture_id: `lecture-${Math.floor(Math.random() * 5) + 1}`
        });

        if (progressError) {
          console.error('Error adding course progress:', progressError);
        }
      } catch (error) {
        console.error('Error processing course enrollment:', error);
      }
    }

    toast.success('示例课程数据已生成', {
      description: '您可以在"我报名的课程"中查看'
    });
    
    console.log('Sample course enrollments and progress created successfully');
  } catch (error) {
    console.error('Error in sample course enrollment process:', error);
    toast.error('无法生成示例课程数据');
  }
};
