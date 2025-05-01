
export interface OrderItem {
  id: string;
  user_id: string;
  total_amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at?: string;
  order_items?: OrderLineItem[];
}

export interface OrderLineItem {
  id: number;
  order_id: string;
  course_id: number;
  price: number;
  currency: string;
  courses?: {
    id: number;
    title: string;
    description?: string;
    thumbnail_url?: string;
  }
}

export interface SubscriptionItem {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  created_at?: string;
  updated_at?: string;
  cancel_at_period_end?: boolean;
  subscription_plan?: {
    id: string;
    name: string;
    description?: string;
    price?: number;
    interval?: string;
    features?: string[];
  }
}
