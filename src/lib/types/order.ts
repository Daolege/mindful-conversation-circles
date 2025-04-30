export interface Order {
  id: string;
  order_number?: string;
  user_id: string;
  total_amount: number;
  amount?: number; // Adding this field for backward compatibility
  created_at: string;
  updated_at?: string;
  payment_method?: string;
  payment_type?: string; // 'wechat', 'alipay', 'credit-card', 'paypal', 'stripe', 'subscription-monthly', etc.
  status: OrderStatus;
  course_ids?: string[];
  course_id?: number; // For single course orders
  currency?: string;
  exchange_rate?: number;
  original_amount?: number;
  original_currency?: string; // Added this field to match usage
  is_paid?: boolean;
  profiles?: {
    id: string;
    email: string;
    full_name?: string;
  };
  courses?: {
    id: string | number;
    title: string;
    description?: string;
    price?: number;
    imageUrl?: string;
  } | Array<{
    id: string | number;
    title: string;
    description?: string;
    price?: number;
    imageUrl?: string;
  }>;
  refund_status?: RefundStatus;
  refund_reason?: string;
  refund_applied_at?: string;
  refund_processed_at?: string;
  admin_notes?: string;
  is_refundable?: boolean;
  
  // Add these new fields for enhanced status handling
  payment_status?: string;
  payment_confirmed?: boolean;
  payment_failed?: boolean;
  needs_review?: boolean;
  last_status_update?: string;
  is_processing?: boolean;
  can_be_cancelled?: boolean;
}

// Order status type
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Add RefundStatus type
export type RefundStatus = 'none' | 'pending' | 'approved' | 'rejected' | 'processed';

export interface OrderWithCourses extends Order {
  courses: { id: string; title: string }[];
}

// Interface for API response with orders
export interface OrderListResponse {
  data: Order[] | null;
  error: Error | null;
}

// Helper function to get status label
export const getOrderStatusLabel = (status: string): string => {
  switch (status) {
    case 'completed':
      return '已完成';
    case 'pending':
      return '处理中';
    case 'processing':
      return '处理中';
    case 'failed':
      return '失败';
    case 'cancelled':
      return '已取消';
    default:
      return status;
  }
};

// Helper function to get status variant for display
export const getOrderStatusVariant = (status: string): "default" | "destructive" | "outline" | "secondary" | "success" | "warning" => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'pending':
    case 'processing':
      return 'warning';
    case 'failed':
    case 'cancelled':
      return 'destructive';
    default:
      return 'default';
  }
};

// Helper function to get course title from order
export const getOrderCourseTitle = (order: Order): string => {
  if (!order) return '未知课程';
  
  if (order.courses) {
    // Handle array of courses
    if (Array.isArray(order.courses)) {
      return order.courses.length > 0 ? order.courses[0].title : '未知课程';
    }
    // Handle single course object
    return order.courses.title || '未知课程';
  }
  
  // If no courses found
  return `订单 ${order.order_number || order.id.substring(0, 8)}`;
};
