
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Generate mock orders for a user
export const generateMockOrders = async (userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Generating mock orders for user:', userId);
    
    // Check if user already has orders
    const { data: existingOrders, error: checkError } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
      
    if (checkError) {
      console.error('Error checking existing orders:', checkError);
      return { success: false, message: '检查现有订单失败' };
    }
    
    // If user already has orders, don't generate more
    if (existingOrders && existingOrders.length > 0) {
      console.log('User already has orders, skipping mock data generation');
      return { success: true, message: '已存在订单数据，未生成新数据' };
    }

    // Get up to 5 random courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title, price')
      .limit(5);

    if (coursesError || !courses || courses.length === 0) {
      console.error('Error fetching courses or no courses found:', coursesError);
      return { success: false, message: '无法获取课程数据' };
    }

    // Generate 3 random orders with different statuses
    const statuses = ['completed', 'processing', 'cancelled'];
    const now = new Date();
    
    for (let i = 0; i < 3; i++) {
      const randomCourse = courses[Math.floor(Math.random() * courses.length)];
      const orderDate = new Date(now.getTime() - (i * 30 * 24 * 60 * 60 * 1000)); // 30 days apart
      
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: statuses[i % statuses.length],
          total_amount: randomCourse.price,
          currency: 'CNY',
          payment_method: 'wechat',
          created_at: orderDate.toISOString()
        })
        .select('id')
        .single();
        
      if (orderError) {
        console.error('Error creating mock order:', orderError);
        continue;
      }
      
      // Add order items
      if (order) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            course_id: randomCourse.id,
            price: randomCourse.price,
            name: randomCourse.title
          });
          
        if (itemError) {
          console.error('Error creating order item:', itemError);
        }
      }
    }
    
    return { success: true, message: '已成功生成示例订单数据' };
  } catch (error) {
    console.error('Error generating mock orders:', error);
    return { success: false, message: '生成示例订单数据失败' };
  }
};

// Generate mock subscriptions for a user
export const generateMockSubscriptions = async (userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Generating mock subscriptions for user:', userId);
    
    // Check if user already has subscriptions
    const { data: existingSubscriptions, error: checkError } = await supabase
      .from('subscription_history')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
      
    if (checkError) {
      console.error('Error checking existing subscriptions:', checkError);
      return { success: false, message: '检查现有订阅记录失败' };
    }
    
    // If user already has subscriptions, don't generate more
    if (existingSubscriptions && existingSubscriptions.length > 0) {
      console.log('User already has subscription history, skipping mock data generation');
      return { success: true, message: '已存在订阅记录，未生成新数据' };
    }

    // Get subscription plan
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('id, name, price, currency')
      .limit(1);
      
    if (plansError || !plans || plans.length === 0) {
      console.error('Error fetching subscription plans:', plansError);
      
      // Create a default plan if none exists
      const { data: newPlan, error: newPlanError } = await supabase
        .from('subscription_plans')
        .insert({
          name: '月度会员',
          description: '畅享全部会员课程',
          interval: 'monthly',
          price: 49.99,
          currency: 'CNY',
          is_active: true,
          features: ['无限制访问所有课程', '专属会员社区', '学习路径规划'],
          display_order: 1
        })
        .select()
        .single();
        
      if (newPlanError) {
        console.error('Error creating subscription plan:', newPlanError);
        return { success: false, message: '无法创建订阅计划' };
      }
      
      var plan = newPlan;
    } else {
      var plan = plans[0];
    }
    
    // Generate subscription history records with different types
    const changeTypes = ['new', 'renew', 'upgrade', 'downgrade', 'cancel'];
    const now = new Date();
    
    for (let i = 0; i < 3; i++) {
      const recordDate = new Date(now.getTime() - (i * 30 * 24 * 60 * 60 * 1000)); // 30 days apart
      
      // Create subscription history record
      const { error: subError } = await supabase
        .from('subscription_history')
        .insert({
          user_id: userId,
          new_plan_id: plan.id,
          change_type: changeTypes[i % changeTypes.length],
          amount: plan.price,
          currency: plan.currency,
          effective_date: recordDate.toISOString()
        });
        
      if (subError) {
        console.error('Error creating subscription history:', subError);
      }
    }
    
    return { success: true, message: '已成功生成示例订阅记录' };
  } catch (error) {
    console.error('Error generating mock subscriptions:', error);
    return { success: false, message: '生成示例订阅记录失败' };
  }
};

// Generate all mock data for a user
export const generateAllMockData = async (userId: string): Promise<{ success: boolean; message: string }> => {
  if (!userId) {
    return { success: false, message: '用户ID不能为空' };
  }
  
  try {
    // Generate courses, orders and subscriptions
    const ordersPromise = generateMockOrders(userId);
    const subscriptionsPromise = generateMockSubscriptions(userId);
    const coursesPromise = generateMockCourses(userId);
    
    const [ordersResult, subscriptionsResult, coursesResult] = await Promise.all([
      ordersPromise, subscriptionsPromise, coursesPromise
    ]);
    
    // Check results
    if (!ordersResult.success && !subscriptionsResult.success && !coursesResult.success) {
      return { 
        success: false, 
        message: '示例数据生成失败' 
      };
    }
    
    let successCount = 0;
    if (ordersResult.success) successCount++;
    if (subscriptionsResult.success) successCount++;
    if (coursesResult.success) successCount++;
    
    return { 
      success: true, 
      message: `已成功生成${successCount}种示例数据` 
    };
  } catch (error) {
    console.error('Error generating all mock data:', error);
    return { success: false, message: '生成示例数据失败' };
  }
};

// Generate mock courses for a user
export const generateMockCourses = async (userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('Generating mock courses for user:', userId);
    
    // Check if user already has enrolled courses
    const { data: existingCourses, error: checkError } = await supabase
      .from('user_courses')
      .select('course_id')
      .eq('user_id', userId)
      .limit(1);
      
    if (checkError) {
      console.error('Error checking existing enrollments:', checkError);
      return { success: false, message: '检查已报名课程失败' };
    }
    
    // If user already has courses, don't generate more
    if (existingCourses && existingCourses.length > 0) {
      console.log('User already has courses, skipping sample data generation');
      return { success: true, message: '已存在课程数据，未生成新数据' };
    }
    
    // Get up to 8 random courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .limit(8);

    if (coursesError || !courses || courses.length === 0) {
      console.error('Error fetching courses:', coursesError);
      return { success: false, message: '无法获取课程数据' };
    }

    // Shuffle courses randomly
    const shuffledCourses = [...courses].sort(() => Math.random() - 0.5);
    const selectedCourses = shuffledCourses.slice(0, Math.min(4, shuffledCourses.length));
    
    console.log('Selected courses for enrollment:', selectedCourses);

    // Enroll user in courses with random purchase dates and progress data
    const now = new Date();
    
    for (const course of selectedCourses) {
      try {
        // Direct SQL insert instead of RPC function
        const purchaseDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();
        
        // 1. Add user-course relationship
        const { error: enrollError } = await supabase
          .from('user_courses')
          .insert({
            user_id: userId,
            course_id: course.id,
            purchased_at: purchaseDate
          });

        if (enrollError) {
          console.error('Error enrolling in course:', course.id, enrollError);
          continue;
        }

        // 2. Add course progress
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

        const { error: progressError } = await supabase
          .from('course_progress')
          .insert({
            user_id: userId,
            course_id: course.id,
            progress_percent: progress,
            completed: isCompleted,
            last_lecture_id: `lecture-${Math.floor(Math.random() * 5) + 1}`
          });

        if (progressError) {
          console.error('Error adding course progress:', progressError);
        }
      } catch (error) {
        console.error('Error processing course enrollment:', error);
      }
    }
    
    return { success: true, message: '已成功生成课程数据' };
  } catch (error) {
    console.error('Error in sample course enrollment process:', error);
    return { success: false, message: '生成课程数据失败' };
  }
};
