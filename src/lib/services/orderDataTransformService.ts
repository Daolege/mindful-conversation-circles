import { Order } from "@/lib/types/order";

/**
 * 从数据库原始订单数据构建标准订单对象，增强状态处理
 */
export const buildOrderObject = (orderData: any): Order => {
  if (!orderData) return null;

  // 统一处理货币代码，确保总是有值
  const currency = (orderData.currency || 'usd').toLowerCase();
  const originalCurrency = (orderData.original_currency || currency).toLowerCase();
  
  // 确保所有金额都是数值型
  const amount = parseFloat(orderData.amount || 0);
  const originalAmount = parseFloat(orderData.original_amount || amount);
  const exchangeRate = parseFloat(orderData.exchange_rate || 1);

  // 处理课程数据
  let courseData = null;
  if (orderData.courses) {
    courseData = {
      id: orderData.courses.id,
      title: orderData.courses.title,
      description: orderData.courses.description,
      price: parseFloat(orderData.courses.price || 0),
      imageUrl: orderData.courses.imageurl
    };
  }

  // 处理用户资料数据
  let profileData = null;
  if (orderData.profiles) {
    profileData = {
      id: orderData.profiles.id,
      email: orderData.profiles.email,
      full_name: orderData.profiles.full_name
    };
  }

  // 增强状态处理逻辑
  const status = orderData.status || 'pending';
  const isCompleted = status === 'completed';
  const isProcessing = ['pending', 'processing'].includes(status);
  
  return {
    id: orderData.id,
    order_number: orderData.order_number,
    user_id: orderData.user_id,
    total_amount: amount,
    amount: amount,
    created_at: orderData.created_at,
    updated_at: orderData.updated_at,
    payment_method: orderData.payment_method,
    payment_type: orderData.payment_type,
    status: status,
    course_id: orderData.course_id,
    currency: currency,
    exchange_rate: exchangeRate,
    original_amount: originalAmount,
    original_currency: originalCurrency,
    is_paid: isCompleted,
    profiles: profileData,
    courses: courseData,
    refund_status: orderData.refund_status || 'none',
    refund_reason: orderData.refund_reason,
    refund_applied_at: orderData.refund_applied_at,
    refund_processed_at: orderData.refund_processed_at,
    admin_notes: orderData.admin_notes,
    is_refundable: orderData.is_refundable !== false,
    payment_status: status,
    payment_confirmed: isCompleted,
    payment_failed: status === 'failed',
    needs_review: status === 'processing' && amount > 10000,
    last_status_update: orderData.updated_at,
    is_processing: isProcessing,
    can_be_cancelled: isProcessing
  };
};

// 添加规范化订单数据函数
export const normalizeOrderData = (rawOrder: any): Order => {
  return buildOrderObject(rawOrder);
};
