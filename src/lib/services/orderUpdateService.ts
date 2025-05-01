
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/lib/types/order';

/**
 * Updates an order in the database
 * @param order Order data to update
 * @returns Promise<{success: boolean, error?: any}>
 */
export const updateOrder = async (order: Partial<Order>): Promise<{success: boolean, error?: any}> => {
  try {
    if (!order.id) {
      console.error('Order ID is required for update');
      return {success: false, error: 'Order ID is required'};
    }

    const { error } = await supabase
      .from('orders')
      .update(order)
      .eq('id', order.id);

    if (error) {
      console.error('Error updating order:', error);
      return {success: false, error};
    }

    return {success: true};
  } catch (err) {
    console.error('Error in updateOrder:', err);
    return {success: false, error: err};
  }
};

/**
 * Updates a specific order's status
 * @param orderId The order ID
 * @param status The new status
 * @returns Promise<{success: boolean, error?: any}>
 */
export const updateOrderStatus = async (orderId: string, status: string): Promise<{success: boolean, error?: any}> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      return {success: false, error};
    }

    return {success: true};
  } catch (err) {
    console.error('Error in updateOrderStatus:', err);
    return {success: false, error: err};
  }
};

/**
 * Deletes an order and its related items
 * @param orderId The ID of the order to delete
 * @returns Promise<{success: boolean, error?: any}>
 */
export const deleteOrder = async (orderId: string): Promise<{success: boolean, error?: any}> => {
  try {
    // Using direct REST API fetch to avoid type issues
    const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/order_items?order_id=eq.${orderId}`;
    
    // Delete order items first
    const deleteItemsResponse = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
        'Prefer': 'return=minimal'
      }
    });
    
    if (!deleteItemsResponse.ok) {
      console.error('Failed to delete order items:', deleteItemsResponse.statusText);
      return {success: false, error: `Failed to delete order items: ${deleteItemsResponse.statusText}`};
    }
    
    // Then delete the order
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Error deleting order:', error);
      return {success: false, error};
    }

    return {success: true};
  } catch (err) {
    console.error('Error in deleteOrder:', err);
    return {success: false, error: err};
  }
};

/**
 * Sets an order status
 * @param orderId The order ID
 * @param status The new status
 * @returns Promise<{success: boolean, error?: any}>
 */
export const setOrderStatus = async (orderId: string, status: string): Promise<{success: boolean, error?: any}> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      return {success: false, error};
    }

    return {success: true};
  } catch (err) {
    console.error('Error in setOrderStatus:', err);
    return {success: false, error: err};
  }
};
