
/**
 * Order query service
 * This service provides methods to query order data from the database
 */

import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/lib/types/order';
import { buildOrderObject } from './orderDataTransformService';

export const getOrderById = async (
  orderId: string,
  userId?: string | null
): Promise<Order | null> => {
  try {
    console.log(`[orderQueryService] Getting order: ${orderId}${userId ? ' for user: ' + userId : ''}`);
    
    // Build query for order
    let query = supabase
      .from('orders')
      .select(`
        *
      `)
      .eq('id', orderId);
    
    // If userId is provided, restrict to that user (unless it's null, indicating admin access)
    if (userId) {
      query = query.eq('user_id', userId);
    }
    
    // Execute the query
    const { data: order, error } = await query.single();
    
    if (error) {
      console.error('[orderQueryService] Error fetching order:', error);
      return null;
    }
    
    if (!order) {
      console.log('[orderQueryService] No order found with ID:', orderId);
      return null;
    }
    
    // Get order items if they exist
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        courses:course_id (
          id, title, description, price, thumbnail_url
        )
      `)
      .eq('order_id', orderId);
    
    if (itemsError) {
      console.warn('[orderQueryService] Error fetching order items:', itemsError);
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', order.user_id)
      .single();
    
    if (profileError) {
      console.warn('[orderQueryService] Error fetching user profile:', profileError);
    }
    
    // Build complete order object
    const orderWithRelations = {
      ...order,
      order_items: orderItems || [],
      profiles: profile || null
    };
    
    return buildOrderObject(orderWithRelations);
  } catch (err) {
    console.error('[orderQueryService] Error in getOrderById:', err);
    return null;
  }
};
