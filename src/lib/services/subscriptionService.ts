
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionItem } from '@/types/dashboard';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  currency: string;
  features?: string[];
  display_order: number;
  discount_percentage: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type SubscriptionPeriod = 'monthly' | 'quarterly' | 'yearly' | '2years' | '3years';

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

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  try {
    console.log('[subscriptionService] Getting subscription plans');
    
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('[subscriptionService] Error fetching subscription plans:', error);
      return [];
    }
    
    console.log(`[subscriptionService] Found ${data?.length || 0} subscription plans`);
    return data || [];
  } catch (err) {
    console.error('[subscriptionService] getSubscriptionPlans error:', err);
    return [];
  }
};

export const forceDeleteSubscriptionPlan = async (id: string): Promise<boolean> => {
  try {
    console.log(`[subscriptionService] Deleting subscription plan: ${id}`);
    
    const { error } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('[subscriptionService] Error deleting subscription plan:', error);
      return false;
    }
    
    console.log('[subscriptionService] Subscription plan deleted successfully');
    return true;
  } catch (err) {
    console.error('[subscriptionService] forceDeleteSubscriptionPlan error:', err);
    return false;
  }
};
