
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';
import { User } from '@/contexts/authTypes';

export type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];
export type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row'] & {
  subscription_plans?: SubscriptionPlan;
};
export type SubscriptionHistory = Database['public']['Tables']['subscription_history']['Row'] & {
  previous_plan?: SubscriptionPlan;
  new_plan?: SubscriptionPlan;
};
export type SubscriptionTransaction = Database['public']['Tables']['subscription_transactions']['Row'];
export type SubscriptionNotifications = Database['public']['Tables']['subscription_notifications']['Row'];

export type SubscriptionPeriod = 'monthly' | 'quarterly' | 'yearly' | '2years' | '3years' | string;

// 订单详情接口
export interface OrderDetails {
  originalPrice: number;
  discount: number;
  total: number;
  orderNumber: string;
}

// 获取用户当前活跃的订阅
export async function getUserActiveSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans:plan_id(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching active subscription:', error);
      return null;
    }

    return data as unknown as UserSubscription;
  } catch (error) {
    console.error('Unexpected error fetching subscription:', error);
    return null;
  }
}

// 获取用户的所有订阅记录
export async function getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans:plan_id(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user subscriptions:', error);
      return [];
    }

    return data as unknown as UserSubscription[] || [];
  } catch (error) {
    console.error('Unexpected error fetching subscriptions:', error);
    return [];
  }
}

// 获取订阅计划列表
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching subscription plans:', error);
      toast.error("加载订阅计划失败", { description: error.message });
      return [];
    }

    return data as unknown as SubscriptionPlan[] || [];
  } catch (error) {
    console.error('Unexpected error fetching subscription plans:', error);
    toast.error("加载订阅计划失败", { description: "发生未知错误" });
    return [];
  }
}

// 获取用户的订阅历史记录
export async function getUserSubscriptionHistory(userId: string): Promise<SubscriptionHistory[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_history')
      .select(`
        *,
        previous_plan:previous_plan_id(*),
        new_plan:new_plan_id(*)
      `)
      .eq('user_id', userId)
      .order('effective_date', { ascending: false });

    if (error) {
      console.error('Error fetching subscription history:', error);
      return [];
    }

    return data as unknown as SubscriptionHistory[] || [];
  } catch (error) {
    console.error('Unexpected error fetching subscription history:', error);
    return [];
  }
}

// 获取订阅的交易记录
export async function getSubscriptionTransactions(subscriptionId: string): Promise<SubscriptionTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('subscription_transactions')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data as unknown as SubscriptionTransaction[] || [];
  } catch (error) {
    console.error('Unexpected error fetching transactions:', error);
    return [];
  }
}

// 调用Edge Function创建新订阅
export async function createSubscription(
  user: User, 
  planInterval: SubscriptionPeriod, 
  paymentMethod: string,
  orderDetails?: OrderDetails
): Promise<{ success: boolean, data?: any, error?: string }> {
  try {
    console.log(`创建订阅开始 - 用户: ${user.id}, 计划周期: ${planInterval}, 支付方式: ${paymentMethod}`);

    // 先获取对应周期的计划
    const { data: plans, error: plansError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('interval', planInterval)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .limit(1);
    
    if (plansError) {
      console.error('Error finding subscription plan:', plansError);
      return { success: false, error: "查找订阅计划时出错: " + plansError.message };
    }
    
    if (!plans || plans.length === 0) {
      console.log(`未找到interval=${planInterval}的计划，尝试通过名称匹配`);
      
      // 如果找不到通过interval匹配的计划，尝试通过名称匹配
      const periodNameMap = {
        'monthly': ['月', '月付', '一个月'],
        'quarterly': ['季', '季付', '一个季度'],
        'yearly': ['年', '年付', '一年'],
        '2years': ['2年', '2年付', '两年'],
        '3years': ['3年', '3年付', '三年']
      };
      
      const matchTerms = periodNameMap[planInterval as keyof typeof periodNameMap] || [];
      if (matchTerms.length === 0) {
        return { success: false, error: `未找到有效的${planInterval}订阅计划` };
      }
      
      // 查询所有活跃计划
      const { data: allPlans, error: allPlansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true);
        
      if (allPlansError) {
        console.error('Error getting all plans:', allPlansError);
        return { success: false, error: "获取所有计划时出错" };
      }
      
      if (!allPlans || allPlans.length === 0) {
        return { success: false, error: "未找到任何可用的订阅计划" };
      }
      
      // 尝试通过名称匹配
      const matchedPlans = allPlans.filter(plan => 
        matchTerms.some(term => plan.name.includes(term))
      );
      
      if (matchedPlans.length === 0) {
        return { success: false, error: `未找到与${planInterval}匹配的订阅计划` };
      }
      
      // 使用第一个匹配的计划
      const plan = matchedPlans[0];
      console.log(`通过名称匹配到计划:`, plan);
      
      // 先检查用户是否已有活跃订阅
      const activeSubscription = await getUserActiveSubscription(user.id);
      if (activeSubscription) {
        console.log('用户已有活跃订阅:', activeSubscription);
        return { 
          success: false, 
          error: `您已经有一个到期日为 ${new Date(activeSubscription.end_date).toLocaleDateString()} 的${activeSubscription.subscription_plans?.name || ''}订阅` 
        };
      }
      
      // 调用Edge Function创建订阅
      const { data, error } = await supabase.functions.invoke('subscription-service/create', {
        body: { 
          plan_id: plan.id,
          payment_method: paymentMethod,
          order_details: orderDetails
        }
      });
      
      console.log('Edge function response:', data);

      if (error) {
        console.error('Error invoking edge function:', error);
        return { success: false, error: error.message };
      }
      
      // 检查响应中是否包含错误
      if (data && data.error) {
        console.error('Error from edge function:', data.error);
        
        // 处理不同类型的错误并提供友好的用户消息
        if (data.error.includes('already has an active subscription')) {
          return { success: false, error: "您已经有一个活跃的订阅，请前往订阅管理页面查看详情" };
        } else {
          return { success: false, error: data.error || "请稍后再试" };
        }
      }
      
      // 如果成功则返回成功信息
      if (data && data.success) {
        return { 
          success: true, 
          data: { 
            ...data,
            amount: plan.price 
          }
        };
      }
      
      // 如果没有明确的成功或错误状态，返回一个通用错误
      return { success: false, error: "订阅创建结果不明确" };
    }
    
    const planId = plans[0].id;
    
    console.log('Creating subscription with plan ID:', planId, 'Method:', paymentMethod);
    
    // 先检查用户是否已有活跃订阅
    const activeSubscription = await getUserActiveSubscription(user.id);
    if (activeSubscription) {
      console.log('用户已有活跃订阅:', activeSubscription);
      return { 
        success: false, 
        error: `您已经有一个到期日为 ${new Date(activeSubscription.end_date).toLocaleDateString()} 的${activeSubscription.subscription_plans?.name || ''}订阅` 
      };
    }
    
    // 调用Edge Function创建订阅
    const { data, error } = await supabase.functions.invoke('subscription-service/create', {
      body: { 
        plan_id: planId,
        payment_method: paymentMethod,
        order_details: orderDetails
      }
    });
    
    console.log('Edge function response:', data);

    if (error) {
      console.error('Error invoking edge function:', error);
      return { success: false, error: error.message };
    }
    
    // 检查响应中是否包含错误
    if (data && data.error) {
      console.error('Error from edge function:', data.error);
      
      // 处理不同类型的错误并提供友好的用户消息
      if (data.error.includes('already has an active subscription')) {
        return { success: false, error: "您已经有一个活跃的订阅，请前往订阅管理页面查看详情" };
      } else {
        return { success: false, error: data.error || "请稍后再试" };
      }
    }
    
    // 如果成功则返回成功信息
    if (data && data.success) {
      return { 
        success: true, 
        data: { 
          ...data,
          amount: plans[0].price 
        }
      };
    }
    
    // 如果没有明确的成功或错误状态，返回一个通用错误
    return { success: false, error: "订阅创建结果不明确" };
  } catch (error) {
    console.error('Unexpected error creating subscription:', error);
    return { success: false, error: error instanceof Error ? error.message : '发生未知错误，请稍后再试' };
  }
}

// 取消订阅
export async function cancelSubscription(user: User, subscriptionId: string): Promise<{ success: boolean, error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('subscription-service/cancel', {
      body: { 
        user_id: user.id,
        subscription_id: subscriptionId
      }
    });

    if (error) {
      console.error('Error cancelling subscription:', error);
      toast.error("取消订阅失败", {
        description: error.message
      });
      return { success: false, error: error.message };
    }

    toast.success("订阅已取消", {
      description: "您的订阅已成功取消"
    });
    return { success: true };
  } catch (error) {
    console.error('Unexpected error cancelling subscription:', error);
    toast.error("取消订阅失败", {
      description: "发生未知错误"
    });
    return { success: false, error: 'Unexpected error occurred' };
  }
}

// 续订订阅
export async function renewSubscription(user: User, subscriptionId: string): Promise<{ success: boolean, error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('subscription-service/renew', {
      body: { 
        user_id: user.id,
        subscription_id: subscriptionId
      }
    });

    if (error) {
      console.error('Error renewing subscription:', error);
      toast.error("续订失败", {
        description: error.message
      });
      return { success: false, error: error.message };
    }

    toast.success("续订成功", {
      description: "您的订阅已成功续订"
    });
    return { success: true };
  } catch (error) {
    console.error('Unexpected error renewing subscription:', error);
    toast.error("续订失败", {
      description: "发生未知错误"
    });
    return { success: false, error: 'Unexpected error occurred' };
  }
}

// 变更订阅计划
export async function changeSubscriptionPlan(user: User, subscriptionId: string, newPlanId: string): Promise<{ success: boolean, error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('subscription-service/change-plan', {
      body: { 
        user_id: user.id,
        subscription_id: subscriptionId,
        new_plan_id: newPlanId
      }
    });

    if (error) {
      console.error('Error changing subscription plan:', error);
      toast.error("变更计划失败", {
        description: error.message
      });
      return { success: false, error: error.message };
    }

    toast.success("计划变更成功", {
      description: "您的订阅计划已成功变更"
    });
    return { success: true };
  } catch (error) {
    console.error('Unexpected error changing plan:', error);
    toast.error("变更计划失败", {
      description: "发生未知错误"
    });
    return { success: false, error: 'Unexpected error occurred' };
  }
}

// 切换自动续订状态
export async function toggleAutoRenew(user: User, subscriptionId: string): Promise<{ success: boolean, newStatus?: boolean, error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('subscription-service/toggle-auto-renew', {
      body: { 
        user_id: user.id,
        subscription_id: subscriptionId
      }
    });

    if (error) {
      console.error('Error toggling auto-renew:', error);
      toast.error("更改自动续订设置失败", {
        description: error.message
      });
      return { success: false, error: error.message };
    }

    const autoRenewEnabled = data?.auto_renew || false;
    toast.success(autoRenewEnabled ? "已开启自动续订" : "已关闭自动续订", {
      description: autoRenewEnabled 
        ? "您的订阅将在到期时自动续订" 
        : "您的订阅到期后将不会自动续订"
    });
    return { success: true, newStatus: autoRenewEnabled };
  } catch (error) {
    console.error('Unexpected error toggling auto-renew:', error);
    toast.error("更改自动续订设置失败", {
      description: "发生未知错误"
    });
    return { success: false, error: 'Unexpected error occurred' };
  }
}

// 为了测试，创建示例订阅数据
export async function createTestSubscription(userId: string, interval: SubscriptionPeriod = 'monthly'): Promise<void> {
  try {
    // 检查是否已有活跃订阅
    const activeSubscription = await getUserActiveSubscription(userId);
    if (activeSubscription) {
      console.log('User already has active subscription:', activeSubscription);
      return;
    }
    
    // 调用服务端函数创建测试订阅
    await supabase.rpc('create_test_subscription', { 
      user_id: userId,
      plan_interval: interval
    });
    
    toast.success("测试订阅已创建", {
      description: `已为您创建${interval === 'monthly' ? '月度' : interval === 'quarterly' ? '季度' : '年度'}测试订阅`
    });
  } catch (error) {
    console.error('Error creating test subscription:', error);
    toast.error("创建测试订阅失败", {
      description: "发生错误，请稍后再试"
    });
  }
}

// 强制删除订阅计划及其所有关联数据（管理员功能）
export async function forceDeleteSubscriptionPlan(planId: string): Promise<{ success: boolean, error?: string }> {
  try {
    console.log('Starting force delete for plan:', planId);
    
    // 1. 先获取所有关联的订阅
    const { data: subscriptions, error: subError } = await supabase
      .from('user_subscriptions')
      .select('id')
      .eq('plan_id', planId);
      
    if (subError) {
      console.error('Error fetching related subscriptions:', subError);
      return { success: false, error: subError.message };
    }
    
    // 如果有关联的订阅，先删除它们
    if (subscriptions && subscriptions.length > 0) {
      const subscriptionIds = subscriptions.map(sub => sub.id);
      console.log('Found subscription IDs to delete:', subscriptionIds);
      
      // 2. 删除关联的交易记录
      const { error: transError } = await supabase
        .from('subscription_transactions')
        .delete()
        .in('subscription_id', subscriptionIds);
        
      if (transError) {
        console.error('Error deleting related transactions:', transError);
        return { success: false, error: transError.message };
      }
    }
    
    // 3. 删除相关的订阅历史记录 (与指定计划相关的所有历史记录)
    const { error: historyPlanError } = await supabase
      .from('subscription_history')
      .delete()
      .or(`previous_plan_id.eq.${planId},new_plan_id.eq.${planId}`);
      
    if (historyPlanError) {
      console.error('Error deleting history records related to plan:', historyPlanError);
      return { success: false, error: historyPlanError.message };
    }
      
    // 4. 删除订阅的历史记录 (基于订阅ID)
    if (subscriptions && subscriptions.length > 0) {
      const subscriptionIds = subscriptions.map(sub => sub.id);
      
      const { error: historySubError } = await supabase
        .from('subscription_history')
        .delete()
        .in('subscription_id', subscriptionIds);
        
      if (historySubError) {
        console.error('Error deleting subscription history:', historySubError);
        return { success: false, error: historySubError.message };
      }
      
      // 5. 删除用户订阅
      const { error: deleteSubError } = await supabase
        .from('user_subscriptions')
        .delete()
        .in('id', subscriptionIds);
        
      if (deleteSubError) {
        console.error('Error deleting subscriptions:', deleteSubError);
        return { success: false, error: deleteSubError.message };
      }
    }
    
    // 6. 最后删除计划本身
    const { error: planError } = await supabase
      .from('subscription_plans')
      .delete()
      .eq('id', planId);
      
    if (planError) {
      console.error('Error deleting plan:', planError);
      return { success: false, error: planError.message };
    }
    
    console.log('Successfully deleted plan and all associated data');
    toast.success("成功删除", {
      description: "订阅计划及其所有关联数据已删除"
    });
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in force delete:', error);
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
}
