
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/contexts/authTypes';
import { SubscriptionPeriod } from '@/lib/types/course-new';

// Get subscription plans
export const getSubscriptionPlans = async () => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
      
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }
};

// Get user's active subscription
export const getUserActiveSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .single();
      
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return data || null;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }
};

// Create a new subscription
export const createSubscription = async (user: User, period: SubscriptionPeriod, paymentMethod: string) => {
  try {
    // First, get the plan details
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('interval', period)
      .eq('is_active', true)
      .single();
      
    if (plansError || !plans) {
      console.error('Error fetching subscription plan:', plansError);
      return { success: false, error: '无法找到对应的订阅计划' };
    }
    
    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    
    // Set end date based on period
    if (period === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (period === 'quarterly') {
      endDate.setMonth(endDate.getMonth() + 3);
    } else if (period === 'yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    // Create subscription
    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const { error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert({
        id: subscriptionId,
        user_id: user.id,
        plan_id: plans.id,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: true,
        payment_method: paymentMethod,
        last_payment_date: startDate.toISOString(),
        next_payment_date: endDate.toISOString()
      });
      
    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      return { success: false, error: '创建订阅失败' };
    }
    
    // Create subscription history record
    const { error: historyError } = await supabase
      .from('subscription_history')
      .insert({
        user_id: user.id,
        subscription_id: subscriptionId,
        new_plan_id: plans.id,
        change_type: 'new',
        amount: plans.price,
        currency: plans.currency,
        effective_date: startDate.toISOString()
      });
      
    if (historyError) {
      console.error('Error creating subscription history:', historyError);
      // Non-critical, continue
    }
    
    // Create transaction
    const { error: transactionError } = await supabase
      .from('subscription_transactions')
      .insert({
        subscription_id: subscriptionId,
        transaction_type: 'payment',
        amount: plans.price,
        currency: plans.currency,
        payment_method: paymentMethod,
        status: 'completed'
      });
      
    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      // Non-critical, continue
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in createSubscription:', error);
    return { success: false, error: '处理订阅请求时出错' };
  }
};

// Create a test subscription for the current user
export const createTestSubscription = async (userId: string) => {
  try {
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('interval', 'monthly')
      .eq('is_active', true)
      .single();
      
    if (plansError || !plans) {
      return { success: false, error: 'No active monthly plan found' };
    }
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    
    const subscriptionId = `test-${Date.now()}`;
    const { error } = await supabase
      .from('user_subscriptions')
      .insert({
        id: subscriptionId,
        user_id: userId,
        plan_id: plans.id,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: false,
        payment_method: 'test',
        last_payment_date: startDate.toISOString()
      });
      
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, subscriptionId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
