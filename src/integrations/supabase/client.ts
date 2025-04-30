import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Try to get environment variables, or use default demo values if they're not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bwpvksvvcctthwnrurtr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cHZrc3Z2Y2N0dGh3bnJ1cnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNjg2NDcsImV4cCI6MjA2MDc0NDY0N30.wUq0cKIjnvXUJ5LejKqf31OuiovWe0-aaOTott1KV_I';

// For development purposes only - log a warning if using defaults
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    'Supabase credentials not found in environment variables. ' +
    'Using default project values. ' +
    'For production, please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

// Define our database function types - including only those that actually exist
type DbFunctionNames = 
  | 'create_test_subscription'
  | 'has_role'
  | 'update_exchange_rate'
  | 'update_site_settings'
  | 'user_has_course_access'
  | 'enroll_user_in_course'
  | 'update_course_progress'
  | 'admin_add_course_item'
  | 'get_dashboard_stats'
  | 'get_financial_stats'
  | 'get_payment_method_stats';

// 改进Supabase客户端配置以提高稳定性
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'supabase.auth.token',
      flowType: 'pkce'
    },
    global: {
      fetch: (...args) => {
        return fetch(args[0], args[1]).catch(err => {
          console.error('Supabase fetch error:', err);
          throw err;
        });
      }
    },
    db: {
      schema: 'public'
    }
  }
);

// Create the migrations table if it doesn't exist
export async function ensureMigrationsTable() {
  try {
    // Create migrations table using direct SQL - safely
    const result = await supabase.rpc('admin_add_course_item', {
      p_table_name: '_migrations',
      p_course_id: 0, // Use 0 for system-level operations
      p_content: `
        CREATE TABLE IF NOT EXISTS public._migrations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          sql TEXT,
          executed_at TIMESTAMPTZ DEFAULT NOW(),
          success BOOLEAN DEFAULT TRUE
        );
      `,
      p_position: 0,
      p_id: 'create_migrations_table',
      p_is_visible: true
    });

    if (result.error) {
      console.error('Error creating migrations table:', result.error);
    } else {
      console.log('Created or verified _migrations table');
    }
  } catch (err) {
    console.error('Error ensuring migrations table exists:', err);
  }
}

// Call this when app initializes
ensureMigrationsTable();

// Load mock courses data (only used in development)
export async function loadMockCourses() {
  if (import.meta.env.DEV) {
    console.log('Loading mock courses in development mode');
    
    // Get all existing courses
    const { data: existingCourses } = await supabase
      .from('courses')
      .select('id')
      .limit(1);
    
    // Only load mock data if no courses exist
    if (!existingCourses || existingCourses.length === 0) {
      const mockCourses = [
        {
          title: "人工智能基础：从入门到精通",
          description: "学习人工智能的基础知识和应用技巧",
          instructor: "李明教授",
          instructorid: 1,
          price: 299,
          originalprice: 499,
          rating: 4.8,
          studentcount: 1250,
          ratingcount: 320,
          lectures: 48,
          whatyouwilllearn: ["人工智能基础理论", "机器学习算���", "神经网络基础", "AI实际应用案例"],
          requirements: ["基础编程知���", "高中数学水平"],
          category: "技术",
          level: "初级到中级",
          duration: "24小时",
          language: "zh",
          syllabus: JSON.stringify([
            {
              title: "人工智能导论",
              lectures: [
                { title: "什么是人工智能", duration: "45分钟" },
                { title: "人工智能的历史发展", duration: "55分钟" }
              ]
            }
          ]),
          lastupdated: "2023-12-15",
          featured: true,
          enrollment_count: 1250,
          published_at: "2023-12-15T12:00:00Z",
          display_order: 1
        },
        {
          title: "现代设计方法与案例分析",
          description: "掌���现代设计方法，提升设计技巧",
          instructor: "王晓设计师",
          instructorid: 2,
          price: 199,
          originalprice: 299,
          rating: 4.7,
          studentcount: 890,
          ratingcount: 215,
          lectures: 36,
          whatyouwilllearn: ["设计思维", "用户体验设计", "视觉设计原则", "设计工具使用"],
          requirements: ["对设计有基本兴趣", "无需专业知识"],
          category: "设计",
          level: "所有级别",
          duration: "18小时",
          language: "zh",
          syllabus: JSON.stringify([
            {
              title: "设计基础",
              lectures: [
                { title: "设计原则介绍", duration: "50分钟" },
                { title: "色彩理论基础", duration: "45分钟" }
              ]
            }
          ]),
          lastupdated: "2023-11-20",
          featured: true,
          enrollment_count: 890,
          published_at: "2023-11-20T10:00:00Z",
          display_order: 2
        },
        {
          title: "高效商业战略：如何构建可扩展商业模式",
          description: "学习构建可扩展的商业模式和高效商业战略",
          instructor: "张企业家",
          instructorid: 3,
          price: 399,
          originalprice: 599,
          rating: 4.9,
          studentcount: 1560,
          ratingcount: 450,
          lectures: 60,
          whatyouwilllearn: ["商业模式设计", "市场分析方法", "竞争战略", "增长策略"],
          requirements: ["基础商业知识", "一定的工作经验"],
          category: "商业",
          level: "中级到高级",
          duration: "30小时",
          language: "zh",
          syllabus: JSON.stringify([
            {
              title: "商业模式基础",
              lectures: [
                { title: "商业模式画布", duration: "60分钟" },
                { title: "价值主张设计", duration: "55分钟" }
              ]
            }
          ]),
          lastupdated: "2023-12-05",
          featured: true,
          enrollment_count: 1560,
          published_at: "2023-12-05T15:30:00Z",
          display_order: 3
        }
      ];

      for (const course of mockCourses) {
        const { error } = await supabase
          .from('courses')
          .insert([course]);
        
        if (error) {
          console.error('Error inserting mock course:', error);
        }
      }
      
      console.log('Mock courses loaded successfully');
    } else {
      console.log('Courses already exist, skipping mock data load');
    }
  }
}

// 创建演示用户功能
export async function createDemoUser() {
  try {
    // First check if demo user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'demo@example.com')
      .maybeSingle();
    
    if (checkError) throw checkError;
    
    // If demo user already exists, just return success
    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }
    
    // Create a demo user through signup
    const { error } = await supabase.auth.signUp({
      email: 'demo@example.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Demo User',
        }
      }
    });
    
    if (error) throw error;
    
    console.log('Demo user created successfully');
  } catch (error) {
    console.error('Error creating demo user:', error);
    throw error;
  }
}

// 新增：使用演示账户登录功能
export async function loginWithDemoAccount() {
  try {
    // 创建演示账户（如果不存在）
    try {
      await createDemoUser();
    } catch (createError) {
      console.warn('Failed to create demo user, attempting to log in anyway:', createError);
    }
    
    // 使用演示账户登录
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'demo@example.com',
      password: 'password123'
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Demo login error:', error);
    return { success: false, error };
  }
}

// 新增：创建模拟作业提交数据
export async function createMockHomeworkSubmissions() {
  try {
    // 检查用户登录
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      console.error('用户未登录，无法创建模拟作业数据');
      return { success: false, message: '用户未登录' };
    }
    
    const userId = authData.session.user.id;
    
    // 1. 检查是否已存在作业提交
    const { data: existingSubmissions, error: checkError } = await supabase
      .from('homework_submissions')
      .select('id')
      .limit(1);
      
    if (checkError) {
      console.error('检查作业提交失败:', checkError);
      return { success: false, error: checkError };
    }
    
    // 如果已有提交，跳过创建
    if (existingSubmissions && existingSubmissions.length > 0) {
      return { success: true, message: '已有作业提交数据，无需创建' };
    }
    
    // 2. 查询课程
    const { data: courses, error: courseError } = await supabase
      .from('courses_new')
      .select('id')
      .limit(3);
      
    if (courseError || !courses || courses.length === 0) {
      console.error('获取课程失败或无课程:', courseError);
      return { success: false, message: '无可用课程' };
    }
    
    // 为每个课程创建章节、课时和作业
    for (const course of courses) {
      // 3. 创建章节
      const { data: section, error: sectionError } = await supabase
        .from('course_sections')
        .insert({
          course_id: course.id,
          title: '模拟章节' + Math.floor(Math.random() * 100),
          position: 1
        })
        .select()
        .single();
        
      if (sectionError || !section) {
        console.error('创建章节失败:', sectionError);
        continue;
      }
      
      // 4. 创建课时
      const { data: lectures, error: lectureError } = await supabase
        .from('course_lectures')
        .insert([
          {
            section_id: section.id,
            title: 'HTML基础知识',
            position: 1,
            is_free: true,
            duration: '45分钟',
            submission_count: 2
          },
          {
            section_id: section.id,
            title: 'CSS样式入门',
            position: 2,
            is_free: false,
            duration: '30分钟',
            submission_count: 1
          }
        ])
        .select();
        
      if (lectureError || !lectures || lectures.length === 0) {
        console.error('创建课时失败:', lectureError);
        continue;
      }
      
      // 5. 为每个课时创建作业
      for (const lecture of lectures) {
        const { data: homework, error: homeworkError } = await supabase
          .from('homework')
          .insert({
            course_id: course.id,
            lecture_id: lecture.id,
            title: lecture.title + '相关作业',
            type: 'fill_blank',
            description: '请完成以下' + lecture.title + '相关练习',
            options: { question: '请根据课程内容完成相关练习' }
          })
          .select()
          .single();
          
        if (homeworkError || !homework) {
          console.error('创建作业失败:', homeworkError);
          continue;
        }
        
        // 6. 创建作业提交 (一个已批阅，一个待批阅)
        const { error: submissionError } = await supabase
          .from('homework_submissions')
          .insert([
            {
              homework_id: homework.id,
              user_id: userId,
              course_id: course.id,
              lecture_id: lecture.id,
              answer: '这是我的作业提交内容，希望老师能给予���导。' + Math.random().toString(36).substring(7),
              submitted_at: new Date().toISOString(),
              score: 90,
              teacher_comment: '做得不错，继续加油！',
              status: 'reviewed',
              reviewed_at: new Date().toISOString()
            },
            {
              homework_id: homework.id,
              user_id: userId,
              course_id: course.id,
              lecture_id: lecture.id,
              answer: '这是我的另一份作业提交。' + Math.random().toString(36).substring(7),
              submitted_at: new Date().toISOString()
            }
          ]);
          
        if (submissionError) {
          console.error('创建作业提交失败:', submissionError);
        }
      }
    }
    
    return { success: true, message: '模拟作业数据创建成功' };
  } catch (error) {
    console.error('创建模拟作业数据出错:', error);
    return { success: false, error };
  }
}
