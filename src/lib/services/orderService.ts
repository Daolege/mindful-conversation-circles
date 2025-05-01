
import { supabase } from '@/integrations/supabase/client';
import { OrderItem } from '@/types/dashboard';
import { Order, OrderListResponse } from "@/lib/types/order";
import { buildOrderObject } from "@/lib/services/orderDataTransformService";
import { toast } from 'sonner';

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

// 添加 OrderManagement.tsx 需要的函数
/**
 * 获取所有订单（管理员功能）
 */
export const getAllOrders = async (
  statusFilter: string = 'all',
  searchQuery: string = '',
  startDate?: Date,
  endDate?: Date
): Promise<OrderListResponse> => {
  try {
    console.log('Fetching all orders (admin function) with filters:', {
      statusFilter,
      searchQuery,
      startDate,
      endDate
    });
    
    // Step 1: Build the query with filters
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    
    // Apply search query if provided (search by order number, user email, or user id)
    if (searchQuery) {
      // 为了提高匹配率，尝试多种方式匹配
      query = query.or(`order_number.ilike.%${searchQuery}%,user_id.eq.${searchQuery}`);
    }
    
    // Apply date range filters if provided
    if (startDate) {
      const formattedStartDate = startDate.toISOString();
      query = query.gte('created_at', formattedStartDate);
    }
    
    if (endDate) {
      // Add one day to include the entire end date
      const nextDay = new Date(endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const formattedEndDate = nextDay.toISOString();
      query = query.lt('created_at', formattedEndDate);
    }
    
    // Step 2: Execute the query
    const { data: orders, error } = await query;
    
    if (error) {
      console.error('Error fetching all orders:', error);
      return { data: [], error };
    }

    if (!orders || orders.length === 0) {
      console.log('No orders found with the applied filters');
      return { data: [], error: null };
    }

    console.log(`Found ${orders.length} orders in the system with applied filters`);
    
    // 记录查询到的所有订单 ID 和用户 ID，用于调试
    orders.forEach(order => {
      console.log(`Admin Panel Order: ID: ${order.id}, User ID: ${order.user_id}, Amount: ${order.amount}, Currency: ${order.currency}, Payment Type: ${order.payment_type}, Status: ${order.status}`);
    });
    
    // Step 3: Process orders and fetch related data
    const processedOrders = await Promise.all(orders.map(async (order) => {
      try {
        // 确保每个订单都有货币字段，并且是小写的
        if (!order.currency) {
          console.log(`Order ${order.id} has no currency, setting default to 'usd'`);
          order.currency = 'usd';
        } else {
          // 标准化处理：确保货币总是小写
          order.currency = order.currency.toLowerCase();
        }
        
        // 获取课程数据
        let courseData = null;
        if (order.course_id) {
          const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('id, title, description, price, imageurl')
            .eq('id', order.course_id)
            .single();
          
          if (courseError) {
            console.error(`Error fetching course for order ${order.id}:`, courseError);
          }
          
          courseData = course || null;
        }
        
        // 获取用户资料
        let profileData = null;
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('id', order.user_id)
          .single();
        
        if (profileError) {
          console.error(`Error fetching profile for order ${order.id}:`, profileError);
        } else {
          console.log(`Successfully fetched profile for order ${order.id}, email: ${profile?.email}`);
        }
        
        profileData = profile || null;
        
        // 构建完整订单对象
        const orderWithRelations = {
          ...order,
          currency: order.currency,  // 已经在上面确保是小写了
          exchange_rate: order.exchange_rate || 1.0, // 确保有汇率值
          courses: courseData,
          profiles: profileData
        };
        
        return buildOrderObject(orderWithRelations);
      } catch (err) {
        console.error(`Error processing order ${order.id}:`, err);
        return null;
      }
    }));
    
    // Filter out any null orders and return valid ones
    const validOrders = processedOrders.filter(order => order !== null);
    console.log(`Returning ${validOrders.length} valid orders from getAllOrders`);
    
    return { 
      data: validOrders, 
      error: null 
    };
  } catch (error) {
    console.error('Unexpected error fetching all orders:', error);
    return { 
      data: [], 
      error: { 
        message: error instanceof Error ? error.message : "获取所有订单时发生未知错误",
        name: "OrderFetchError"
      } 
    };
  }
};

// 添加 生成示例订单的功能
export const insertSampleOrders = async (count: number = 10): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`Inserting ${count} sample orders...`);
    
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(10);
    
    if (usersError || !users || users.length === 0) {
      console.error("Failed to fetch users:", usersError);
      return { success: false, message: "Failed to fetch users for sample orders" };
    }
    
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, price')
      .limit(10);
    
    if (coursesError || !courses || courses.length === 0) {
      console.error("Failed to fetch courses:", coursesError);
      return { success: false, message: "Failed to fetch courses for sample orders" };
    }
    
    const orderStatuses = ['completed', 'pending', 'failed'];
    const paymentTypes = ['alipay', 'wechat', 'credit_card', 'bank_transfer'];
    
    const sampleOrders = Array.from({ length: count }).map((_, i) => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomCourse = courses[Math.floor(Math.random() * courses.length)];
      const randomStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const randomPaymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
      
      return {
        user_id: randomUser.id,
        course_id: randomCourse.id,
        amount: randomCourse.price,
        currency: 'cny',
        status: randomStatus,
        payment_type: randomPaymentType,
        order_number: `ORD-${Date.now().toString().slice(-8)}-${i}`,
        created_at: orderDate.toISOString(),
        updated_at: orderDate.toISOString()
      };
    });
    
    const { error: insertError } = await supabase
      .from('orders')
      .insert(sampleOrders);
    
    if (insertError) {
      console.error("Error inserting sample orders:", insertError);
      return { success: false, message: `Failed to insert sample orders: ${insertError.message}` };
    }
    
    return { success: true, message: `Successfully inserted ${count} sample orders` };
  } catch (error) {
    console.error("Error inserting sample orders:", error);
    return { success: false, message: `Error inserting sample orders: ${(error as Error).message}` };
  }
};
