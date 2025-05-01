
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionItem } from '@/types/dashboard';

export const getUserSubscriptionHistory = async (userId: string): Promise<any[]> => {
  try {
    console.log(`[subscriptionService] Getting subscription history for user: ${userId}`);
    
    const { data, error } = await supabase
      .from('subscription_history')
      .select(`
        *,
        new_plan:new_plan_id (
          id, name, description, features
        )
      `)
      .eq('user_id', userId)
      .order('effective_date', { ascending: false });
    
    if (error) {
      console.error('[subscriptionService] Error fetching subscription history:', error);
      return [];
    }
    
    console.log(`[subscriptionService] Found ${data?.length || 0} subscription records`);
    return data || [];
  } catch (err) {
    console.error('[subscriptionService] getUserSubscriptionHistory error:', err);
    return [];
  }
};

export const getCurrentSubscription = async (userId: string): Promise<SubscriptionItem | null> => {
  try {
    console.log(`[subscriptionService] Getting current subscription for user: ${userId}`);
    
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plan:plan_id (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();
    
    if (error) {
      console.error('[subscriptionService] Error fetching current subscription:', error);
      return null;
    }
    
    return data as SubscriptionItem | null;
  } catch (err) {
    console.error('[subscriptionService] getCurrentSubscription error:', err);
    return null;
  }
};

export const createTestSubscription = async (userId: string, planInterval: string = 'monthly'): Promise<boolean> => {
  try {
    console.log(`[subscriptionService] Creating test subscription for user: ${userId}, interval: ${planInterval}`);
    
    const { data, error } = await supabase.rpc('create_test_subscription', {
      user_id: userId,
      plan_interval: planInterval
    });
    
    if (error) {
      console.error('[subscriptionService] Error creating test subscription:', error);
      return false;
    }
    
    console.log('[subscriptionService] Test subscription created successfully');
    return true;
  } catch (err) {
    console.error('[subscriptionService] createTestSubscription error:', err);
    return false;
  }
};
