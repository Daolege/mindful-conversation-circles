
import { Course } from "@/lib/types/course";

// Update OrderItem to make it compatible with the orders table structure
export interface OrderItem {
  id: string;
  user_id: string;
  amount: number; // Changed from total_amount to amount based on DB structure
  total_amount?: number; // Keep for backward compatibility
  currency: string;
  payment_method?: string;
  payment_type?: string; // Added for compatibility with DB
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
    features?: string[] | null; // Make features nullable to match DB
  }
}

// Add UserCourse interface
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

// Add DashboardStatItem interface
export interface DashboardStatItem {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
}
