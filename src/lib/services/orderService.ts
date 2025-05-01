
import { supabase } from '@/integrations/supabase/client';
import { OrderItem } from '@/types/dashboard';
import { Order, OrderListResponse } from "@/lib/types/order";
import { buildOrderObject } from "@/lib/services/orderDataTransformService";
import { toast } from 'sonner';

export async function getUserOrders(userId: string, status: string = 'all', timeRange: string = 'all'): Promise<{ data: OrderItem[], error: any }> {
  try {
    console.log(`[orderService] Getting orders for user: ${userId}, status: ${status}, timeRange: ${timeRange}`);
    
    let query = supabase
      .from('orders')
      .select('*'); // First just select all fields to avoid errors
    
    // Add status filter if not 'all'
    if (status !== 'all') {
      query = query.eq('status', status);
    }
    
    // Add time range filter
    const now = new Date();
    
    if (timeRange !== 'all') {
      let startDate = new Date();
      
      switch (timeRange) {
        case '3days':
          startDate.setDate(now.getDate() - 3);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'halfyear':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          // Default case, do nothing
          break;
      }
      
      if (timeRange !== 'all') {
        query = query.gte('created_at', startDate.toISOString());
      }
    }
    
    // Add user filter and ordering
    query = query.eq('user_id', userId).order('created_at', { ascending: false });
    
    const { data: ordersData, error: ordersError } = await query;
    
    if (ordersError) {
      console.error('[orderService] Error fetching orders:', ordersError);
      return { data: [], error: ordersError };
    }
    
    // Process the fetched data to match OrderItem interface
    const processedOrders: OrderItem[] = (ordersData || []).map(order => {
      // Convert database order to OrderItem interface
      const orderItem: OrderItem = {
        id: order.id,
        user_id: order.user_id,
        amount: order.amount || 0, // Use amount as primary field
        currency: order.currency || 'cny',
        payment_method: order.payment_method || order.payment_type || 'unknown', // Support both fields
        payment_type: order.payment_type,
        status: order.status || 'unknown',
        created_at: order.created_at,
        updated_at: order.updated_at,
        order_items: [] // Will be populated if we have order items data
      };
      
      return orderItem;
    });
    
    // Try to fetch order items for each order
    try {
      for (const order of processedOrders) {
        // Check if order_items table exists and contains entries for this order
        try {
          // Use RPC call to check if the table exists
          const { data: tableExists } = await supabase.rpc(
            'check_table_exists',
            { table_name: 'order_items' }
          );
          
          // If table exists, fetch items
          if (tableExists) {
            const { data: items } = await supabase
              .from('order_items')
              .select(`
                id,
                order_id,
                course_id,
                price,
                currency,
                courses:course_id (
                  id, title, description, thumbnail_url
                )
              `)
              .eq('order_id', order.id);
              
            if (items && items.length > 0) {
              order.order_items = items;
            }
          } else {
            console.warn(`[orderService] order_items table does not exist`);
          }
        } catch (itemError) {
          // Handle case where the RPC function doesn't exist
          console.warn(`[orderService] Could not check if order_items table exists:`, itemError);
          
          // Try to fetch items anyway, and catch error if table doesn't exist
          try {
            const { data: items } = await supabase
              .from('order_items')
              .select(`
                id,
                order_id,
                course_id,
                price,
                currency,
                courses:course_id (
                  id, title, description, thumbnail_url
                )
              `)
              .eq('order_id', order.id);
              
            if (items && items.length > 0) {
              order.order_items = items;
            }
          } catch (err) {
            console.warn(`[orderService] Could not fetch items for order ${order.id}:`, err);
          }
        }
      }
    } catch (itemsError) {
      console.warn('[orderService] Error fetching order items:', itemsError);
    }
    
    console.log(`[orderService] Found ${processedOrders.length || 0} orders`);
    return { data: processedOrders, error: null };
  } catch (err) {
    console.error('[orderService] getUserOrders error:', err);
    return { data: [], error: err };
  }
}

export async function getOrderById(orderId: string): Promise<{ data: OrderItem | null, error: any }> {
  try {
    console.log(`[orderService] Getting order: ${orderId}`);
    
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error('[orderService] Error fetching order:', error);
      return { data: null, error };
    }
    
    if (!order) {
      return { data: null, error: new Error('Order not found') };
    }
    
    // Convert to OrderItem format
    const orderItem: OrderItem = {
      id: order.id,
      user_id: order.user_id,
      amount: order.amount || 0,
      currency: order.currency || 'cny',
      payment_method: order.payment_method || order.payment_type || 'unknown',
      payment_type: order.payment_type,
      status: order.status || 'unknown',
      created_at: order.created_at,
      updated_at: order.updated_at,
      order_items: []
    };
    
    // Try to get order items
    try {
      // Try with RPC first to check if table exists
      try {
        const { data: tableExists } = await supabase.rpc(
          'check_table_exists',
          { table_name: 'order_items' }
        );
        
        if (tableExists) {
          const { data: items } = await supabase
            .from('order_items')
            .select(`
              id,
              order_id,
              course_id,
              price,
              currency,
              courses:course_id (
                id, title, description, thumbnail_url
              )
            `)
            .eq('order_id', orderId);
            
          if (items && items.length > 0) {
            orderItem.order_items = items;
          }
        }
      } catch (rpcError) {
        // If RPC fails, try direct query
        console.warn(`[orderService] RPC check failed:`, rpcError);
        
        // Try a direct query to fetch items
        const { data: items, error: itemsQueryError } = await supabase
          .from('order_items')
          .select(`
            id,
            order_id,
            course_id,
            price,
            currency,
            courses:course_id (
              id, title, description, thumbnail_url
            )
          `)
          .eq('order_id', orderId);
        
        if (!itemsQueryError && items && items.length > 0) {
          orderItem.order_items = items;
        } else if (itemsQueryError) {
          console.warn(`[orderService] Direct query failed:`, itemsQueryError);
        }
      }
    } catch (itemError) {
      console.warn(`[orderService] Could not fetch items for order ${orderId}:`, itemError);
    }
    
    return { data: orderItem, error: null };
  } catch (err) {
    console.error('[orderService] getOrderById error:', err);
    return { data: null, error: err };
  }
}

// Generate mock order with correct field names
export async function generateMockOrder(userId: string, status: string = 'completed'): Promise<{ success: boolean, error: any }> {
  try {
    console.log(`[orderService] Generating mock order for user: ${userId}, status: ${status}`);
    
    // 1. First get a random course
    const { data: courses, error: coursesError } = await supabase
      .from('courses_new')
      .select('id, title, price')
      .limit(5);
    
    if (coursesError || !courses?.length) {
      console.error('[orderService] Error fetching courses:', coursesError);
      return { success: false, error: coursesError || new Error('No courses available') };
    }
    
    // Select 1-3 random courses
    const selectedCourses = [];
    const courseCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < courseCount; i++) {
      const randomIndex = Math.floor(Math.random() * courses.length);
      selectedCourses.push(courses[randomIndex]);
    }
    
    // Generate unique order ID
    const orderId = `order-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    // Calculate total amount
    const totalAmount = selectedCourses.reduce((sum, course) => sum + (course.price || 99), 0);
    
    // Random payment method
    const paymentTypes = ['wechat', 'alipay', 'creditcard'];
    const randomPaymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
    
    // Create order date (1-30 days ago)
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - daysAgo);
    const orderDateString = orderDate.toISOString();
    
    // 2. Create order with correct field names
    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        user_id: userId,
        amount: totalAmount, // Use amount as the primary field
        currency: 'cny',
        payment_type: randomPaymentType, // Use payment_type to match DB schema
        status: status,
        created_at: orderDateString,
        updated_at: orderDateString
      });
    
    if (orderError) {
      console.error('[orderService] Error creating mock order:', orderError);
      return { success: false, error: orderError };
    }
    
    // 3. Create order items table if it doesn't exist
    try {
      // Check if table exists with RPC
      const { data: tableExists, error: rpcError } = await supabase.rpc(
        'check_table_exists', 
        { table_name: 'order_items' }
      );
      
      if (rpcError) {
        console.error('[orderService] Error checking if order_items table exists:', rpcError);
        
        // Try to create table using SQL directly
        const { error: createTableError } = await supabase.rpc(
          'execute_sql',
          {
            sql_statement: `
              CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id TEXT REFERENCES orders(id),
                course_id INTEGER REFERENCES courses_new(id),
                price NUMERIC,
                currency TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
              );
            `
          }
        );
        
        if (createTableError) {
          console.error('[orderService] Error creating order_items table:', createTableError);
        }
      }
      
      // If table exists or was created, insert items
      for (const course of selectedCourses) {
        try {
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
          }
        } catch (itemError) {
          console.warn('[orderService] Error inserting order item:', itemError);
        }
      }
    } catch (tableError) {
      console.warn('[orderService] Could not create or access order_items table:', tableError);
    }
    
    console.log(`[orderService] Successfully created mock order: ${orderId}`);
    return { success: true, error: null };
  } catch (err) {
    console.error('[orderService] generateMockOrder error:', err);
    return { success: false, error: err };
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, newStatus: string): Promise<{ success: boolean, error: any }> {
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
}

// Add OrderManagement.tsx needed functions
/**
 * Get all orders (admin function)
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
      // To improve matching rate, try multiple ways to match
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
    
    // Record the IDs and user IDs of all orders found for debugging
    orders.forEach(order => {
      console.log(`Admin Panel Order: ID: ${order.id}, User ID: ${order.user_id}, Amount: ${order.amount}, Currency: ${order.currency}, Payment Type: ${order.payment_type}, Status: ${order.status}`);
    });
    
    // Step 3: Process orders and fetch related data
    const processedOrders = await Promise.all(orders.map(async (order) => {
      try {
        // Ensure each order has a currency field, and it's lowercase
        if (!order.currency) {
          console.log(`Order ${order.id} has no currency, setting default to 'usd'`);
          order.currency = 'usd';
        } else {
          // Standardize processing: ensure currency is always lowercase
          order.currency = order.currency.toLowerCase();
        }
        
        // Fetch course data
        let courseData = null;
        if (order.course_id) {
          const { data: course, error: courseError } = await supabase
            .from('courses_new')  // Use courses_new instead of courses
            .select('id, title, description, price, thumbnail_url')
            .eq('id', order.course_id)
            .single();
          
          if (courseError) {
            console.error(`Error fetching course for order ${order.id}:`, courseError);
          }
          
          courseData = course || null;
        }
        
        // Fetch user profile
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
        
        // Build complete order object
        const orderWithRelations = {
          ...order,
          currency: order.currency,  // Already ensured to be lowercase
          exchange_rate: order.exchange_rate || 1.0, // Ensure there's a rate value
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
    const validOrders = processedOrders.filter(order => order !== null) as Order[];
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

// Add generate sample orders function
export async function insertSampleOrders(count: number = 10): Promise<{ success: boolean; message: string }> {
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
      .from('courses_new')  // Use courses_new instead of courses
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
}
