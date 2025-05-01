
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
    
    // Get order items manually using raw SQL approach to avoid type issues
    let orderItems = [];
    try {
      // Use SQL instead of direct table access
      const { data, error: itemsError } = await supabase
        .rpc('get_order_items', { order_id_param: orderId })
        .then(res => {
          if (res.error) {
            console.warn('[orderQueryService] RPC error getting order items:', res.error);
            return { data: null, error: res.error };
          }
          return { data: res.data || [], error: null };
        })
        .catch(err => {
          console.warn('[orderQueryService] Error getting order items:', err);
          return { data: null, error: err };
        });

      if (itemsError) {
        console.warn('[orderQueryService] Error fetching order items:', itemsError);
      } else if (data && Array.isArray(data)) {
        // Manually process each item to get course information
        for (const item of data) {
          try {
            // Use a safer approach to fetch course information
            if (item && typeof item === 'object' && 'course_id' in item) {
              const { data: course } = await supabase
                .from('courses_new')
                .select('id, title, description, price, thumbnail_url')
                .eq('id', item.course_id)
                .single();

              orderItems.push({
                ...item,
                courses: course || null
              });
            } else {
              orderItems.push(item);
            }
          } catch (courseError) {
            console.warn(`[orderQueryService] Error fetching course for item:`, courseError);
            orderItems.push(item);
          }
        }
      }
    } catch (itemsQueryError) {
      console.warn('[orderQueryService] Error with order items query:', itemsQueryError);
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
