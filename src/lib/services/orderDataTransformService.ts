
/**
 * Order data transformation service
 * This service helps transform database order data into consistent order objects
 */

import { Order } from "@/lib/types/order";

export const buildOrderObject = (rawOrder: any): Order => {
  if (!rawOrder) {
    throw new Error('Cannot build order object from null or undefined value');
  }
  
  // Base order object with defaults for required fields
  const orderObject: Order = {
    id: rawOrder.id || '',
    user_id: rawOrder.user_id || '',
    total_amount: rawOrder.amount || 0, // Use amount as the source for total_amount
    amount: rawOrder.amount || 0,
    created_at: rawOrder.created_at || new Date().toISOString(),
    status: rawOrder.status || 'pending',
    currency: (rawOrder.currency || 'cny').toLowerCase(),
    payment_type: rawOrder.payment_type || rawOrder.payment_method || 'unknown',
  };
  
  // Add optional fields if they exist
  if (rawOrder.order_number) orderObject.order_number = rawOrder.order_number;
  if (rawOrder.updated_at) orderObject.updated_at = rawOrder.updated_at;
  if (rawOrder.payment_method) orderObject.payment_method = rawOrder.payment_method;
  if (rawOrder.course_id) orderObject.course_id = rawOrder.course_id;
  if (rawOrder.exchange_rate) orderObject.exchange_rate = rawOrder.exchange_rate;
  if (rawOrder.original_amount) orderObject.original_amount = rawOrder.original_amount;
  if (rawOrder.original_currency) orderObject.original_currency = rawOrder.original_currency;
  if (rawOrder.is_paid !== undefined) orderObject.is_paid = rawOrder.is_paid;
  if (rawOrder.refund_status) orderObject.refund_status = rawOrder.refund_status;
  if (rawOrder.refund_reason) orderObject.refund_reason = rawOrder.refund_reason;
  if (rawOrder.refund_applied_at) orderObject.refund_applied_at = rawOrder.refund_applied_at;
  if (rawOrder.refund_processed_at) orderObject.refund_processed_at = rawOrder.refund_processed_at;
  if (rawOrder.admin_notes) orderObject.admin_notes = rawOrder.admin_notes;
  if (rawOrder.is_refundable !== undefined) orderObject.is_refundable = rawOrder.is_refundable;
  
  // Handle enhanced status fields
  if (rawOrder.payment_status) orderObject.payment_status = rawOrder.payment_status;
  if (rawOrder.payment_confirmed !== undefined) orderObject.payment_confirmed = rawOrder.payment_confirmed;
  if (rawOrder.payment_failed !== undefined) orderObject.payment_failed = rawOrder.payment_failed;
  if (rawOrder.needs_review !== undefined) orderObject.needs_review = rawOrder.needs_review;
  if (rawOrder.last_status_update) orderObject.last_status_update = rawOrder.last_status_update;
  if (rawOrder.is_processing !== undefined) orderObject.is_processing = rawOrder.is_processing;
  if (rawOrder.can_be_cancelled !== undefined) orderObject.can_be_cancelled = rawOrder.can_be_cancelled;
  
  // Handle profiles data
  if (rawOrder.profiles) {
    orderObject.profiles = {
      id: rawOrder.profiles.id,
      email: rawOrder.profiles.email,
      full_name: rawOrder.profiles.full_name
    };
  }
  
  // Handle courses data
  if (rawOrder.courses) {
    if (Array.isArray(rawOrder.courses)) {
      orderObject.courses = rawOrder.courses.map(course => ({
        id: course.id,
        title: course.title || '未知课程',
        description: course.description,
        price: course.price,
        imageUrl: course.imageUrl || course.image_url || course.thumbnail_url
      }));
    } else {
      orderObject.courses = {
        id: rawOrder.courses.id,
        title: rawOrder.courses.title || '未知课程',
        description: rawOrder.courses.description,
        price: rawOrder.courses.price,
        imageUrl: rawOrder.courses.imageUrl || rawOrder.courses.image_url || rawOrder.courses.thumbnail_url
      };
    }
  }
  
  // Handle order_items and construct courses array from them
  if (rawOrder.order_items && Array.isArray(rawOrder.order_items) && rawOrder.order_items.length > 0) {
    const coursesFromItems = rawOrder.order_items.map(item => {
      if (item.courses) {
        return {
          id: item.courses.id,
          title: item.courses.title || '未知课程',
          description: item.courses.description,
          price: item.price,
          imageUrl: item.courses.thumbnail_url || item.courses.imageUrl
        };
      } else {
        return {
          id: item.course_id,
          title: '未知课程',
          price: item.price
        };
      }
    });
    
    if (!orderObject.courses) {
      orderObject.courses = coursesFromItems;
    }
  }
  
  return orderObject;
};

/**
 * Process order items to extract course data
 */
export const extractCoursesFromOrderItems = (orderItems: any[]): any[] => {
  if (!orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
    return [];
  }
  
  return orderItems
    .filter(item => item && item.courses)
    .map(item => ({
      id: item.courses.id,
      title: item.courses.title || '未知课程',
      description: item.courses.description,
      price: item.price,
      imageUrl: item.courses.thumbnail_url || item.courses.imageUrl
    }));
};
