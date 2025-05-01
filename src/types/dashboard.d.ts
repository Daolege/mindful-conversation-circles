
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
  total_amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: string;
  order_items: {
    course_id: number;
    price: number;
    courses: {
      id: number;
      title: string;
      [key: string]: any;
    };
  }[];
  [key: string]: any;
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
  subscription_plan?: {
    id: string;
    name: string;
    description?: string | null;
    features?: string[] | null;
    price?: number;
    interval?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface DashboardStatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
}
