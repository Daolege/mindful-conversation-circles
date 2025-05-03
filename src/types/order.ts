
export enum PaymentStatus {
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  PENDING = 'pending',
  PROCESSING = 'processing',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  ALIPAY = 'alipay',
  WECHAT = 'wechat',
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  PAYPAL = 'paypal',
  OTHER = 'other'
}

export enum OrderStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  PROCESSING = 'processing',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export enum RefundStatus {
  NONE = 'none',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSED = 'processed'
}

export interface Payment {
  status: PaymentStatus;
  method: PaymentMethod;
  payment_id?: string;
  processed_at?: string;
  notes?: string;
}

export interface Order {
  id: string;
  order_number?: string;
  user_id: string;
  total_amount: number;
  amount?: number;
  created_at: string;
  updated_at?: string;
  payment_method?: string;
  payment_type?: string;
  status: OrderStatus;
  course_ids?: string[];
  course_id?: number;
  currency?: string;
  exchange_rate?: number;
  original_amount?: number;
  original_currency?: string;
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
  billing_address?: string;
  payment?: Payment;
  payment_status?: string;
  payment_confirmed?: boolean;
  payment_failed?: boolean;
  needs_review?: boolean;
  last_status_update?: string;
  is_processing?: boolean;
  can_be_cancelled?: boolean;
  price?: number;
  original_price?: number;
  invoice_url?: string;
  items?: Array<{
    id: string | number;
    title?: string;
    description?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    currency?: string;
    discount?: number;
    type?: string;
    course_id?: string | number;
  }>;
}

export interface OrderListResponse {
  data: Order[] | null;
  error: Error | null;
}
