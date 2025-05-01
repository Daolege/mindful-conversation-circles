
import { supabase } from '@/integrations/supabase/client';
import { OrderItem } from '@/types/dashboard';

export const getUserOrders = async (userId: string, status?: string): Promise<{ data: OrderItem[], error: any }> => {
  try {
    console.log(`[orderService] Getting orders for user ${userId}${status ? `, status filter: ${status}` : ''}`);
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          courses (
            id, title
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('[orderService] Error fetching orders:', error);
      return { data: [], error };
    }
    
    console.log(`[orderService] Found ${data?.length || 0} orders for user`);
    return { data: data || [], error: null };
  } catch (err) {
    console.error('[orderService] getUserOrders error:', err);
    return { data: [], error: err };
  }
};

export const getOrderDetails = async (orderId: string): Promise<{ data: OrderItem | null, error: any }> => {
  try {
    console.log(`[orderService] Getting order details for order ${orderId}`);
    
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
      console.error('[orderService] Error fetching order details:', error);
      return { data: null, error };
    }
    
    console.log('[orderService] Order details fetched successfully');
    return { data, error: null };
  } catch (err) {
    console.error('[orderService] getOrderDetails error:', err);
    return { data: null, error: err };
  }
};

// New functions for admin management
export const getAllOrders = async (status?: string, limit: number = 100, page: number = 0): Promise<{ data: OrderItem[], count: number, error: any }> => {
  try {
    console.log(`[orderService] Getting all orders${status ? ` with status: ${status}` : ''}, limit: ${limit}, page: ${page}`);
    
    // Calculate offset
    const offset = page * limit;
    
    // Build query
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          courses (
            id, title
          )
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('[orderService] Error fetching all orders:', error);
      return { data: [], count: 0, error };
    }
    
    console.log(`[orderService] Found ${data?.length || 0} orders, total count: ${count}`);
    return { data: data || [], count: count || 0, error: null };
  } catch (err) {
    console.error('[orderService] getAllOrders error:', err);
    return { data: [], count: 0, error: err };
  }
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<{ success: boolean, error: any }> => {
  try {
    console.log(`[orderService] Updating order ${orderId} status to ${status}`);
    
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);
    
    if (error) {
      console.error('[orderService] Error updating order status:', error);
      return { success: false, error };
    }
    
    console.log('[orderService] Order status updated successfully');
    return { success: true, error: null };
  } catch (err) {
    console.error('[orderService] updateOrderStatus error:', err);
    return { success: false, error: err };
  }
};

export const insertSampleOrders = async (userId: string): Promise<{ success: boolean, error: any }> => {
  try {
    console.log(`[orderService] Creating sample orders for user ${userId}`);
    
    // We're going to insert 5 sample orders with different statuses
    const statuses = ['completed', 'processing', 'cancelled', 'failed', 'refunded'];
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
      const orderDate = new Date();
      orderDate.setDate(today.getDate() - i * 5); // Each order is 5 days apart
      
      const orderId = `order-${Date.now()}-${i}`;
      const status = statuses[i % statuses.length];
      
      // Insert the order
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: userId,
          total_amount: 100 + (i * 20),
          currency: 'cny',
          payment_method: i % 2 === 0 ? 'wechat' : 'alipay',
          status: status,
          created_at: orderDate.toISOString(),
          updated_at: orderDate.toISOString()
        });
      
      if (orderError) {
        console.error('[orderService] Error creating sample order:', orderError);
        continue;
      }
      
      // Insert an order item for this order
      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: orderId,
          course_id: 80 + (i % 2), // Use course IDs 80 and 81 alternately
          price: 100 + (i * 20),
          currency: 'cny',
          created_at: orderDate.toISOString()
        });
      
      if (itemError) {
        console.error('[orderService] Error creating sample order item:', itemError);
      }
    }
    
    console.log('[orderService] Sample orders created successfully');
    return { success: true, error: null };
  } catch (err) {
    console.error('[orderService] insertSampleOrders error:', err);
    return { success: false, error: err };
  }
};
