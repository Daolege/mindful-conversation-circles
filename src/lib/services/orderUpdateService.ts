
import { supabase } from "@/integrations/supabase/client";

export const updateOrderStatus = async (orderId: string, status: string): Promise<{ success: boolean; error: Error | null }> => {
  try {
    if (!orderId || !status) {
      return { success: false, error: new Error("Missing orderId or status") };
    }
    
    console.log("Updating order status:", orderId, "to", status);
    
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order status:", error);
      return { success: false, error };
    }

    console.log("Order status updated successfully");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: error as Error };
  }
};

export const insertSampleOrders = async (count: number = 10): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`Inserting ${count} sample orders...`);
    
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .limit(10);
    
    if (usersError || !users || users.length === 0) {
      console.error("Failed to fetch users:", usersError);
      return { success: false, message: "Failed to fetch users for sample orders" };
    }
    
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, price')
      .limit(10);
    
    if (coursesError || !courses || courses.length === 0) {
      console.error("Failed to fetch courses:", coursesError);
      return { success: false, message: "Failed to fetch courses for sample orders" };
    }
    
    const orderStatuses = ['completed', 'pending', 'failed'];
    const paymentTypes = ['alipay', 'wechat', 'credit_card', 'bank_transfer'];
    
    const sampleOrders = Array.from({ length: count }).map((_, i) => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomCourse = courses[Math.floor(Math.random() * courses.length)];
      const randomStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];
      const randomPaymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
      
      return {
        user_id: randomUser.id,
        course_id: randomCourse.id,
        amount: randomCourse.price,
        currency: 'cny',
        status: randomStatus,
        payment_type: randomPaymentType,
        order_number: `ORD-${Date.now().toString().slice(-8)}-${i}`,
        created_at: orderDate.toISOString(),
        updated_at: orderDate.toISOString()
      };
    });
    
    const { error: insertError } = await supabase
      .from('orders')
      .insert(sampleOrders);
    
    if (insertError) {
      console.error("Error inserting sample orders:", insertError);
      return { success: false, message: `Failed to insert sample orders: ${insertError.message}` };
    }
    
    return { success: true, message: `Successfully inserted ${count} sample orders` };
  } catch (error) {
    console.error("Error inserting sample orders:", error);
    return { success: false, message: `Error inserting sample orders: ${(error as Error).message}` };
  }
};
