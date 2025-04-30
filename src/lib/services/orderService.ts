
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderListResponse } from "@/lib/types/order";
import { normalizeOrderData } from "./orderDataTransformService";
import { getUserOrders, getOrderById, getAllOrders } from "./orderQueryService";
import { updateOrderStatus, insertSampleOrders } from "./orderUpdateService";

/**
 * 验证订单数据的完整性和正确性
 */
export const validateOrderData = (order: Partial<Order>): boolean => {
  // 验证必要字段
  if (!order.user_id || !order.amount || !order.payment_type) {
    console.error("Missing required order fields:", { order });
    return false;
  }

  // 验证金额是否为正数
  if (order.amount <= 0) {
    console.error("Invalid order amount:", order.amount);
    return false;
  }

  // 验证支付类型是否有效
  const validPaymentTypes = ['wechat', 'alipay', 'credit-card', 'paypal', 'stripe', 
    'subscription-monthly', 'subscription-quarterly', 'subscription-yearly'];
  if (!validPaymentTypes.includes(order.payment_type)) {
    console.error("Invalid payment type:", order.payment_type);
    return false;
  }

  // 验证货币类型和汇率（如果适用）
  if (order.currency) {
    const validCurrencies = ['usd', 'cny'];
    if (!validCurrencies.includes(order.currency.toLowerCase())) {
      console.error("Invalid currency:", order.currency);
      return false;
    }

    // 如果是CNY，确保有汇率
    if (order.currency.toLowerCase() === 'cny' && !order.exchange_rate) {
      console.error("Missing exchange rate for CNY order");
      return false;
    }
  }

  return true;
};

/**
 * 支付成功后更新订单状态
 */
export const completeOrder = async (
  orderId: string,
  options: {
    transactionId?: string;
    paymentMethod?: string;
    amount?: number;
  } = {}
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    console.log("Completing order:", orderId, "with options:", options);

    // 获取当前订单信息
    const order = await getOrderById(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // 验证订单数据
    if (!validateOrderData(order)) {
      throw new Error(`Invalid order data for order: ${orderId}`);
    }

    // 准备更新数据
    const updateData = {
      status: 'completed' as const,
      updated_at: new Date().toISOString(),
      ...options
    };

    // 更新订单状态
    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) throw error;

    // 如果存在课程ID，添加用户课程访问权限
    if (order.course_id) {
      const { error: accessError } = await supabase
        .from('user_courses')
        .insert({
          user_id: order.user_id,
          course_id: order.course_id,
          purchased_at: new Date().toISOString()
        })
        .single();

      if (accessError) {
        console.error("Error granting course access:", accessError);
        // 不要因为授权失败而回滚订单完成状态
        // 而是记录错误以便后续处理
      }
    }

    console.log("Order completed successfully:", orderId);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error completing order:", error);
    return { success: false, error: error as Error };
  }
};

// 重新导出所有服务函数
export { 
  getUserOrders,
  getOrderById, 
  updateOrderStatus,
  getAllOrders,
  insertSampleOrders
};
