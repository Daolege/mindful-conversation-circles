
import { Course } from "@/lib/types/course";

export interface UserCourse {
  course_id: number;
  purchased_at: string;
  user_id?: string;
  courses: Course;
  course_progress?: {
    progress_percent: number;
    completed: boolean;
    last_lecture_id: string;
  }[];
}

export interface OrderItem {
  id: string;
  user_id: string;
  amount: number; // Primary field from database
  total_amount?: number; // For backward compatibility
  currency: string;
  payment_method?: string;
  payment_type?: string;
  status: string;
  created_at: string;
  updated_at?: string;
  order_items?: {
    id?: number;
    order_id?: string;
    course_id: number;
    price: number;
    courses?: {
      id: number;
      title: string;
      description?: string;
      thumbnail_url?: string;
    };
  }[];
}

export interface SubscriptionItem {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date?: string;
  end_date?: string | null;
  current_period_start?: string;
  current_period_end?: string;
  canceled_at?: string | null;
  created_at?: string;
  payment_method?: string;
  amount?: number;
  currency?: string;
  auto_renew?: boolean;
  cancel_at_period_end?: boolean;
  subscription_plans?: {
    id: string;
    name: string;
    description?: string | null;
    features?: string[] | null;
    price?: number;
    interval?: string;
  };
}

export interface DashboardStatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
}
