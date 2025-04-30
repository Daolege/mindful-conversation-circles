
import { supabase } from '@/integrations/supabase/client';
import { OrderListResponse } from "@/lib/types/order";
import { buildOrderObject } from "@/lib/services/orderDataTransformService";
import { toast } from '@/components/ui/use-toast';

/**
 * 获取用户的所有订单
 */
export async function getUserOrders(userId: string): Promise<OrderListResponse> {
  try {
    console.log(`Fetching orders for user ${userId}`);
    
    // 重要：不针对货币类型进行任何过滤，获取所有订单
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user orders:', error);
      toast({
        title: "获取订单失败",
        description: error.message,
        variant: "destructive"
      });
      return { data: [], error };
    }

    // 详细记录找到的订单数量和状态
    console.log(`Found ${orders?.length || 0} orders for user ${userId}`);
    if (orders && orders.length > 0) {
      orders.forEach(order => {
        console.log(`Order ID: ${order.id}, Course ID: ${order.course_id}, User ID: ${order.user_id}, Currency: ${order.currency || 'usd'}, Status: ${order.status}, Amount: ${order.amount}, Payment Type: ${order.payment_type}`);
      });
    } else {
      console.log('No orders found for user');
      return { data: [], error: null };
    }
    
    // 处理订单并获取相关数据
    const processedOrders = await Promise.all((orders || []).map(async (order) => {
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
          console.log(`Fetching course data for order ${order.id}, course_id: ${order.course_id}`);
          const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('id, title, description, price, imageurl')
            .eq('id', order.course_id)
            .single();
          
          if (courseError) {
            console.error(`Error fetching course for order ${order.id}:`, courseError);
          } else {
            console.log(`Course data for order ${order.id}: Found`);
          }
          
          courseData = course || null;
        } else {
          console.log(`Order ${order.id} has no course_id`);
        }
        
        // 获取用户资料
        let profileData = null;
        if (order.user_id) {
          console.log(`Fetching profile data for order ${order.id}, user_id: ${order.user_id}`);
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .eq('id', order.user_id)
            .single();
          
          if (profileError) {
            console.error(`Error fetching profile for order ${order.id}:`, profileError);
          } else {
            console.log(`Profile data for order ${order.id}: Found`);
          }
          
          profileData = profile || null;
        }
        
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
    
    // 过滤掉无效订单并返回
    const validOrders = processedOrders.filter(order => order !== null);
    console.log(`Returning ${validOrders.length} valid orders`);
    
    return { 
      data: validOrders, 
      error: null 
    };
  } catch (error) {
    console.error('Unexpected error fetching user orders:', error);
    toast({
      title: "获取订单时发生错误",
      description: error instanceof Error ? error.message : "获取订单时发生未知错误",
      variant: "destructive"
    });
    return { 
      data: [], 
      error: { 
        message: error instanceof Error ? error.message : "获取订单时发生未知错误",
        name: "OrderFetchError"
      } 
    };
  }
}

/**
 * 根据订单ID获取详细信息
 */
export async function getOrderById(orderId: string, userId: string | null = null): Promise<any> {
  try {
    console.log(`Fetching order ${orderId}` + (userId ? ` for user ${userId}` : ''));
    
    let query = supabase
      .from('orders')
      .select('*')
      .eq('id', orderId);
      
    // 如果提供了用户ID，则只返回该用户的订单
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    const { data: order, error } = await query.single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log(`No order found with id ${orderId}`);
        return null;
      }
      console.error('Error fetching order:', error);
      throw new Error(error.message);
    }
    
    if (!order) {
      console.log(`No order data returned for id ${orderId}`);
      return null;
    }

    // 确保订单有货币字段，默认为usd，并标准化为小写
    if (!order.currency) {
      console.log(`Order ${order.id} has no currency, setting default to 'usd'`);
      order.currency = 'usd';
    } else {
      order.currency = order.currency.toLowerCase();
    }
    
    console.log(`Successfully fetched order: ${order.id}, status: ${order.status}, currency: ${order.currency}, user_id: ${order.user_id}`);
    
    // 获取课程信息
    let courseData = null;
    if (order.course_id) {
      console.log(`Fetching course for order ${order.id}, course_id: ${order.course_id}`);
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('id, title, description, price, imageurl')
        .eq('id', order.course_id)
        .single();
      
      if (courseError) {
        console.error(`Error fetching course for order ${order.id}:`, courseError);
      } else {
        console.log(`Successfully fetched course for order ${order.id}`);
      }
      
      courseData = course || null;
    }
    
    // 获取用户资料信息
    let profileData = null;
    console.log(`Fetching profile for order ${order.id}, user_id: ${order.user_id}`);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', order.user_id)
      .single();
    
    if (profileError) {
      console.error(`Error fetching profile for order ${order.id}:`, profileError);
    } else {
      console.log(`Successfully fetched profile for order ${order.id}`);
    }
    
    profileData = profile || null;
    
    // 构建完整的订单对象
    const orderWithRelations = {
      ...order,
      currency: order.currency, // 已经在上面确保是小写了
      exchange_rate: order.exchange_rate || 1.0, // 确保有汇率值
      courses: courseData,
      profiles: profileData
    };
    
    console.log('Found order data:', orderWithRelations);
    
    // 转换为标准订单对象
    return buildOrderObject(orderWithRelations);
  } catch (error) {
    console.error('Error in getOrderById:', error);
    throw error;
  }
}

/**
 * 获取所有订单（管理员功能）
 */
export async function getAllOrders(
  statusFilter: string = 'all',
  searchQuery: string = '',
  startDate?: Date,
  endDate?: Date
): Promise<OrderListResponse> {
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
}
