
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const updateOrderStatus = async (orderId: string, newStatus: string) => {
  try {
    console.log(`[orderUpdateService] Updating order ${orderId} to status: ${newStatus}`);
    
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: newStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId);
    
    if (error) {
      console.error('[orderUpdateService] Error updating order:', error);
      return { success: false, error };
    }
    
    console.log(`[orderUpdateService] Successfully updated order ${orderId} to status: ${newStatus}`);
    return { success: true, error: null };
  } catch (err) {
    console.error('[orderUpdateService] Error in updateOrderStatus:', err);
    return { success: false, error: err };
  }
};

export const deleteOrder = async (orderId: string) => {
  try {
    console.log(`[orderUpdateService] Deleting order ${orderId}`);

    // First try to delete related order items if they exist
    try {
      // Check if order_items table exists
      const { data: tableExists } = await supabase.rpc(
        'check_table_exists',
        { table_name: 'order_items' }
      );
      
      if (tableExists) {
        console.log(`[orderUpdateService] Deleting related order items for order ${orderId}`);
        const { error: itemsDeleteError } = await supabase
          .from('order_items')
          .delete()
          .eq('order_id', orderId);
        
        if (itemsDeleteError) {
          console.warn(`[orderUpdateService] Error deleting order items: ${itemsDeleteError.message}`);
          // Continue with order deletion even if items deletion fails
        }
      }
    } catch (itemsError) {
      console.warn(`[orderUpdateService] Could not check for or delete order items:`, itemsError);
      // Continue with order deletion even if we can't check for items
    }
    
    // Now delete the order itself
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    
    if (error) {
      console.error(`[orderUpdateService] Error deleting order: ${error.message}`);
      return { success: false, error };
    }
    
    console.log(`[orderUpdateService] Successfully deleted order ${orderId}`);
    return { success: true, error: null };
  } catch (err) {
    console.error('[orderUpdateService] Error in deleteOrder:', err);
    return { success: false, error: err };
  }
};

// Add function to check if user has permission to delete the order
export const canDeleteOrder = async (orderId: string, userId: string) => {
  try {
    // Check if user is the owner of the order or has admin role
    const { data: user } = await supabase.auth.getUser();
    
    // Check if user has admin role
    const isAdmin = user?.user?.app_metadata?.roles?.includes('admin') || 
                   user?.user?.user_metadata?.roles?.includes('admin') || 
                   false;
    
    if (isAdmin) {
      return { canDelete: true, error: null };
    }
    
    // Check if user is the owner of the order
    const { data: order, error } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single();
    
    if (error) {
      console.error('[orderUpdateService] Error checking order ownership:', error);
      return { canDelete: false, error };
    }
    
    const canDelete = order.user_id === userId;
    
    return { canDelete, error: null };
  } catch (err) {
    console.error('[orderUpdateService] Error checking delete permission:', err);
    return { canDelete: false, error: err };
  }
};
