
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/lib/types/order';

/**
 * Updates an order in the database
 * @param order Order data to update
 * @returns Promise<boolean>
 */
export const updateOrder = async (order: Partial<Order>): Promise<boolean> => {
  try {
    if (!order.id) {
      console.error('Order ID is required for update');
      return false;
    }

    const { error } = await supabase
      .from('orders')
      .update(order)
      .eq('id', order.id);

    if (error) {
      console.error('Error updating order:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in updateOrder:', err);
    return false;
  }
};

/**
 * Deletes an order and its related items
 * @param orderId The ID of the order to delete
 * @returns Promise<boolean>
 */
export const deleteOrder = async (orderId: string): Promise<boolean> => {
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
      return false;
    }
    
    // Then delete the order
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Error deleting order:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in deleteOrder:', err);
    return false;
  }
};

/**
 * Sets an order status
 * @param orderId The order ID
 * @param status The new status
 * @returns Promise<boolean>
 */
export const setOrderStatus = async (orderId: string, status: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in setOrderStatus:', err);
    return false;
  }
};
