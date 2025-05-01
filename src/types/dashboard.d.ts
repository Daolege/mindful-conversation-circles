
// Add or update the OrderItem type to include courses property
import { Order } from "@/lib/types/order";

export interface OrderItem extends Order {
  // Additional fields specific to the dashboard
  order_number?: string;
  order_items?: Array<{
    id: number;
    order_id: string;
    course_id: number;
    price: number;
    currency?: string;
    courses?: {
      id: number | string;
      title: string;
      description?: string;
      price?: number;
    };
  }>;
}
