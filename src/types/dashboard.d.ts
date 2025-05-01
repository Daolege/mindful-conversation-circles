
import { CourseNew } from "@/lib/types/course-new";

export interface OrderItem {
  id: string;
  user_id: string;
  amount: number;
  total_amount?: number;
  currency: string;
  payment_type: string;
  payment_method?: string;
  status: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItemDetails[];
  order_number?: string;
  original_amount?: number;
  original_currency?: string;
  exchange_rate?: number;
}

export interface OrderItemDetails {
  id: number;
  order_id: string;
  course_id: number;
  price: number;
  currency: string;
  courses?: CourseNew;
}

export interface DashboardStatsSummary {
  total_orders: number;
  total_revenue: number;
  currency: string;
  total_courses: number;
  total_users: number;
  completion_rate: number;
}

export interface PeriodStats {
  date: string;
  orders: number;
  revenue: number;
}
