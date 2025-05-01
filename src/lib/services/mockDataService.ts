
import { supabase } from '@/integrations/supabase/client';

export const generateMockData = async (userId: string): Promise<{ 
  success: boolean; 
  courses: boolean;
  orders: boolean;
  subscriptions: boolean;
  error: any;
}> => {
  try {
    console.log('[mockDataService] Generating mock data for user:', userId);
    
    const result = {
      success: false,
      courses: false,
      orders: false,
      subscriptions: false,
      error: null
    };
    
    // 1. Create mock course enrollments
    result.courses = await generateMockCourseEnrollments(userId);
    
    // 2. Create mock orders
    result.orders = await generateMockOrders(userId);
    
    // 3. Create mock subscription history
    result.subscriptions = await generateMockSubscriptions(userId);
    
    result.success = result.courses || result.orders || result.subscriptions;
    
    console.log('[mockDataService] Mock data generation complete:', result);
    return result;
  } catch (err) {
    console.error('[mockDataService] Error generating mock data:', err);
    return {
      success: false,
      courses: false,
      orders: false,
      subscriptions: false,
      error: err
    };
  }
};

export const generateMockCourseEnrollments = async (userId: string): Promise<boolean> => {
  try {
    console.log('[mockDataService] Generating mock course enrollments for user:', userId);
    
    // First check if we have any courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses_new')
      .select('id, title')
      .limit(3);
    
    if (coursesError || !courses?.length) {
      console.error('[mockDataService] Error fetching courses or no courses available:', coursesError);
      return false;
    }
    
    // Delete existing enrollments to avoid duplicates
    const { error: deleteError } = await supabase
      .from('user_courses')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.warn('[mockDataService] Error deleting existing enrollments:', deleteError);
      // Continue anyway
    }
    
    // Create new enrollments for each course
    for (const course of courses) {
      // Generate a random progress percentage between 0 and 100
      const progressPercent = Math.floor(Math.random() * 101);
      const completed = progressPercent === 100;
      
      // Create enrollment date (between 1 and 30 days ago)
      const daysAgo = Math.floor(Math.random() * 30) + 1;
      const enrollmentDate = new Date();
      enrollmentDate.setDate(enrollmentDate.getDate() - daysAgo);
      
      // Insert user_course record
      const { error: enrollError } = await supabase
        .from('user_courses')
        .insert({
          user_id: userId,
          course_id: course.id,
          purchased_at: enrollmentDate.toISOString(),
          is_active: true
        });
      
      if (enrollError) {
        console.error(`[mockDataService] Error enrolling user in course ${course.id}:`, enrollError);
        continue;
      }
      
      // Generate a random lecture_id for the last watched
      const lastLectureId = `lecture-${Math.floor(Math.random() * 1000)}`;
      
      // Insert course progress record
      const { error: progressError } = await supabase
        .from('course_progress')
        .insert({
          user_id: userId,
          course_id: course.id,
          progress_percent: progressPercent,
          completed: completed,
          last_watched_at: new Date().toISOString(),
          lecture_id: lastLectureId
        });
      
      if (progressError) {
        console.error(`[mockDataService] Error creating progress for course ${course.id}:`, progressError);
      }
      
      console.log(`[mockDataService] Enrolled user in course ${course.id} with ${progressPercent}% progress`);
    }
    
    console.log('[mockDataService] Mock course enrollments generated successfully');
    return true;
  } catch (err) {
    console.error('[mockDataService] Error generating mock course enrollments:', err);
    return false;
  }
};

export const generateMockOrders = async (userId: string): Promise<boolean> => {
  try {
    console.log('[mockDataService] Generating mock orders for user:', userId);
    
    // First check if we have any courses
    const { data: courses, error: coursesError } = await supabase
      .from('courses_new')
      .select('id, title, price')
      .limit(5);
    
    if (coursesError || !courses?.length) {
      console.error('[mockDataService] Error fetching courses or no courses available:', coursesError);
      return false;
    }
    
    // Delete existing orders to avoid duplicates
    const { error: deleteOrderError } = await supabase
      .from('orders')
      .delete()
      .eq('user_id', userId);
    
    if (deleteOrderError) {
      console.warn('[mockDataService] Error deleting existing orders:', deleteOrderError);
      // Continue anyway
    }
    
    // Create 5 orders with different statuses and dates
    const statuses = ['completed', 'processing', 'cancelled', 'failed', 'refunded'];
    const paymentMethods = ['wechat', 'alipay', 'creditcard'];
    
    for (let i = 0; i < 5; i++) {
      // Create order date (between 1 and 60 days ago)
      const daysAgo = Math.floor(Math.random() * 60) + 1;
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - daysAgo);
      
      // Select a random course
      const course = courses[i % courses.length];
      const price = course.price || 99;
      
      // Generate unique order ID
      const orderId = `order-${Date.now()}-${i}`;
      const status = statuses[i % statuses.length];
      const paymentType = paymentMethods[i % paymentMethods.length];
      
      // Insert the order - using amount instead of total_amount to match DB
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: userId,
          amount: price,
          currency: 'cny',
          payment_type: paymentType, // Using payment_type instead of payment_method
          status: status,
          created_at: orderDate.toISOString(),
          updated_at: orderDate.toISOString()
        });
      
      if (orderError) {
        console.error('[mockDataService] Error creating mock order:', orderError);
        continue;
      }
      
      // Check if order_items table exists and insert directly using REST API
      try {
        // Use direct REST API call to insert order item
        const orderItemData = {
          order_id: orderId,
          course_id: course.id,
          price: price,
          currency: 'cny',
          created_at: orderDate.toISOString()
        };
        
        // Use fetch for direct database access
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/order_items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
          },
          body: JSON.stringify(orderItemData)
        });
        
        if (!response.ok) {
          console.warn('[mockDataService] REST API call failed:', await response.text());
        } else {
          console.log(`[mockDataService] Created order item via REST API for ${orderId}`);
        }
      } catch (itemError) {
        console.warn('[mockDataService] Could not handle order_items operations:', itemError);
      }
      
      console.log(`[mockDataService] Created order ${orderId} for course ${course.id} with status ${status}`);
    }
    
    console.log('[mockDataService] Mock orders generated successfully');
    return true;
  } catch (err) {
    console.error('[mockDataService] Error generating mock orders:', err);
    return false;
  }
};

export const generateMockSubscriptions = async (userId: string): Promise<boolean> => {
  try {
    console.log('[mockDataService] Generating mock subscriptions for user:', userId);
    
    // First check if we have any subscription plans
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('id, name, price, interval')
      .limit(3);
    
    if (plansError) {
      console.error('[mockDataService] Error fetching subscription plans:', plansError);
      
      // Create some subscription plans if none exist
      const mockPlans = [
        {
          name: '月度订阅',
          description: '每月订阅，随时可取消',
          price: 39.99,
          interval: 'monthly',
          currency: 'cny',
          features: ['所有课程访问', '每月新课程', '优先客服支持'],
          display_order: 1,
          discount_percentage: 0,
          is_active: true
        },
        {
          name: '年度订阅',
          description: '年度订阅，比月度订阅更划算',
          price: 399.99,
          interval: 'yearly',
          currency: 'cny',
          features: ['所有课程访问', '每月新课程', '优先客服支持', '下载课程资料'],
          display_order: 2,
          discount_percentage: 17,
          is_active: true
        }
      ];
      
      for (const plan of mockPlans) {
        const { error } = await supabase
          .from('subscription_plans')
          .insert(plan);
          
        if (error) {
          console.error('[mockDataService] Error creating mock subscription plan:', error);
        }
      }
      
      // Try fetching plans again
      const { data: newPlans, error: newPlansError } = await supabase
        .from('subscription_plans')
        .select('id, name, price, interval')
        .limit(3);
        
      if (newPlansError || !newPlans?.length) {
        console.error('[mockDataService] Still cannot fetch subscription plans:', newPlansError);
        return false;
      }
    }
    
    // Delete existing subscription records to avoid duplicates
    const { error: deleteSubError } = await supabase
      .from('subscription_history')
      .delete()
      .eq('user_id', userId);
    
    if (deleteSubError) {
      console.warn('[mockDataService] Error deleting existing subscriptions:', deleteSubError);
      // Continue anyway
    }
    
    // Use plans if they exist, otherwise use default plans
    const subscriptionPlans = plans || [
      { id: 'mock-monthly', name: '月度订阅', price: 39.99, interval: 'monthly' },
      { id: 'mock-yearly', name: '年度订阅', price: 399.99, interval: 'yearly' }
    ];
    
    // Create 3 subscription history records with different dates
    for (let i = 0; i < 3; i++) {
      // Create effect date (between 30 and 360 days ago)
      const daysAgo = 30 + (i * 150);
      const effectiveDate = new Date();
      effectiveDate.setDate(effectiveDate.getDate() - daysAgo);
      
      // Select a plan
      const plan = subscriptionPlans[i % subscriptionPlans.length];
      
      // Determine event type
      const changeType = i === 0 ? 'subscription_created' : 
                       i === 1 ? 'plan_changed' : 'subscription_cancelled';
      
      // Generate subscription ID for reference
      const subscriptionId = `sub-mock-${Date.now()}-${i}`;
      
      // Insert subscription history record - use previous_plan_id instead of old_plan_id
      const { error: historyError } = await supabase
        .from('subscription_history')
        .insert({
          user_id: userId,
          change_type: changeType,
          previous_plan_id: i === 1 ? subscriptionPlans[0].id : null, // Use previous_plan_id
          new_plan_id: changeType !== 'subscription_cancelled' ? plan.id : null,
          subscription_id: subscriptionId, // Add required subscription_id field
          amount: plan.price,
          currency: 'cny',
          effective_date: effectiveDate.toISOString()
        });
      
      if (historyError) {
        console.error('[mockDataService] Error creating mock subscription history:', historyError);
      }
      
      console.log(`[mockDataService] Created subscription history record for event ${changeType}`);
    }
    
    // Create current subscription if it's not cancelled
    const { error: activeSubError } = await supabase
      .from('user_subscriptions')
      .delete()
      .eq('user_id', userId);
      
    if (activeSubError) {
      console.warn('[mockDataService] Error deleting existing user subscription:', activeSubError);
    }
    
    // Insert current active subscription
    const { error: currentSubError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: subscriptionPlans[0].id,
        status: 'active',
        start_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
    if (currentSubError) {
      console.error('[mockDataService] Error creating current subscription:', currentSubError);
    }
    
    console.log('[mockDataService] Mock subscription data generated successfully');
    return true;
  } catch (err) {
    console.error('[mockDataService] Error generating mock subscriptions:', err);
    return false;
  }
};
