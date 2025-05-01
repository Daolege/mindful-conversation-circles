
import { supabase } from '@/integrations/supabase/client';
import { OrderItem } from '@/types/dashboard';

export const getUserOrders = async (userId: string, status: string = 'all'): Promise<{ data: OrderItem[], error: any }> => {
  try {
    console.log(`[orderService] Getting orders for user: ${userId}, status: ${status}`);
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          courses (
            id, title, description, thumbnail_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    // 添加状态筛选
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('[orderService] Error fetching orders:', error);
      return { data: [], error };
    }
    
    console.log(`[orderService] Found ${data?.length || 0} orders`);
    return { data: data || [], error: null };
  } catch (err) {
    console.error('[orderService] getUserOrders error:', err);
    return { data: [], error: err };
  }
};

export const getOrderById = async (orderId: string): Promise<{ data: OrderItem | null, error: any }> => {
  try {
    console.log(`[orderService] Getting order: ${orderId}`);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          courses (
            id, title, description, thumbnail_url
          )
        )
      `)
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error('[orderService] Error fetching order:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('[orderService] getOrderById error:', err);
    return { data: null, error: err };
  }
};

// 添加生成示例订单的功能
export const generateMockOrder = async (userId: string, status: string = 'completed'): Promise<{ success: boolean, error: any }> => {
  try {
    console.log(`[orderService] Generating mock order for user: ${userId}, status: ${status}`);
    
    // 1. 首先获取一个随机课程
    const { data: courses, error: coursesError } = await supabase
      .from('courses_new')
      .select('id, title, price')
      .limit(5);
    
    if (coursesError || !courses?.length) {
      console.error('[orderService] Error fetching courses:', coursesError);
      return { success: false, error: coursesError || new Error('No courses available') };
    }
    
    // 从可用课程中随机选择1-3个
    const selectedCourses = [];
    const courseCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < courseCount; i++) {
      const randomIndex = Math.floor(Math.random() * courses.length);
      selectedCourses.push(courses[randomIndex]);
    }
    
    // 生成唯一订单号
    const orderId = `order-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // 计算总金额
    const totalAmount = selectedCourses.reduce((sum, course) => sum + (course.price || 99), 0);
    
    // 随机支付方式
    const paymentMethods = ['wechat', 'alipay', 'creditcard'];
    const randomPaymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    // 创建订单日期 (在过去1-30天之间)
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - daysAgo);
    const orderDateString = orderDate.toISOString();
    
    // 2. 创建订单
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: userId,
        total_amount: totalAmount,
        currency: 'cny',
        payment_method: randomPaymentMethod,
        status: status,
        created_at: orderDateString,
        updated_at: orderDateString
      });
    
    if (orderError) {
      console.error('[orderService] Error creating mock order:', orderError);
      return { success: false, error: orderError };
    }
    
    // 3. 为每个选中的课程创建订单项
    for (const course of selectedCourses) {
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: orderId,
          course_id: course.id,
          price: course.price || 99,
          currency: 'cny',
          created_at: orderDateString
        });
      
      if (itemError) {
        console.error('[orderService] Error creating mock order item:', itemError);
        // 继续添加其他项，不中断整个流程
      }
    }
    
    console.log(`[orderService] Successfully created mock order: ${orderId}`);
    return { success: true, error: null };
  } catch (err) {
    console.error('[orderService] generateMockOrder error:', err);
    return { success: false, error: err };
  }
};

// 更新订单状态
export const updateOrderStatus = async (orderId: string, newStatus: string): Promise<{ success: boolean, error: any }> => {
  try {
    console.log(`[orderService] Updating order ${orderId} to status: ${newStatus}`);
    
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);
    
    if (error) {
      console.error('[orderService] Error updating order status:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (err) {
    console.error('[orderService] updateOrderStatus error:', err);
    return { success: false, error: err };
  }
};
