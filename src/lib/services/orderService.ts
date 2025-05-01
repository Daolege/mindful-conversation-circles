
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
