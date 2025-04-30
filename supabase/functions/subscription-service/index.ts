
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  // Get the request path
  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the JWT from the request headers
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Verify the JWT token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("Invalid token:", userError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    // Parse the request body
    const requestData = await req.json();
    console.log(`Processing ${path} request:`, requestData);

    // Process different API endpoints
    let responseData;

    switch (path) {
      case "create":
        try {
          responseData = await createSubscription(supabase, user.id, requestData);
          return new Response(
            JSON.stringify(responseData),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
          );
        } catch (error) {
          console.error("Subscription create error:", error.message);
          // Handle specific error cases with appropriate status codes but still return a valid response
          if (error.message.includes("already has an active subscription")) {
            return new Response(
              JSON.stringify({ 
                error: "User already has an active subscription",
                status: "error",
                code: "SUBSCRIPTION_EXISTS"
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
          } else if (error.message.includes("Plan not found")) {
            return new Response(
              JSON.stringify({ 
                error: "Plan not found",
                status: "error",
                code: "PLAN_NOT_FOUND"
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
          } else {
            return new Response(
              JSON.stringify({ 
                error: error.message || "Failed to create subscription",
                status: "error",
                code: "SUBSCRIPTION_CREATION_FAILED"
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
            );
          }
        }
        break;
      case "cancel":
        responseData = await cancelSubscription(supabase, user.id, requestData);
        break;
      case "renew":
        responseData = await renewSubscription(supabase, user.id, requestData);
        break;
      case "change-plan":
        responseData = await changePlan(supabase, user.id, requestData);
        break;
      case "toggle-auto-renew":
        responseData = await toggleAutoRenew(supabase, user.id, requestData);
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Endpoint not found" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
        );
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error(`Error processing ${path} request:`, error);
    
    // Ensure we always return a 200 OK with error details in the body
    // This prevents the "Edge Function returned a non-2xx status code" error
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        status: "error",
        code: "SERVER_ERROR"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});

// Helper function to create a new subscription
async function createSubscription(supabase, userId, { plan_id, payment_method, order_details }) {
  console.log("Creating subscription with params:", { userId, plan_id, payment_method, order_details });
  
  try {
    // Check if profiles table exists and if the user has a profile
    try {
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      // If there's a specific error about the table not existing, we'll skip profile validation
      if (profileError && !profileError.message.includes("relation") && !profileError.message.includes("does not exist")) {
        console.error("Profile error:", profileError);
        throw new Error("Error checking user profile");
      }
    } catch (profileErr) {
      // Just log the error but don't fail - profiles table might not exist in all implementations
      console.log("Profile check error (non-critical):", profileErr);
    }

    // Check for existing active subscription with clear error handling
    const { data: existingSubscription, error: existingSubError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (existingSubError && !existingSubError.message.includes("JSON object")) {
      console.error("Error checking existing subscription:", existingSubError);
      throw new Error("Error checking existing subscription");
    }

    if (existingSubscription) {
      console.log("User already has active subscription:", existingSubscription);
      throw new Error("User already has an active subscription");
    }

    // Validate plan exists
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError) {
      console.error("Plan error:", planError);
      throw new Error("Plan not found");
    }

    if (!plan) {
      console.error("No plan found with ID:", plan_id);
      throw new Error("Plan not found");
    }

    console.log("Found plan:", plan);

    // Calculate end date based on interval
    const startDate = new Date();
    let endDate = new Date(startDate);
    
    // 增强对不同计划周期的支持
    const planInterval = plan.interval ? plan.interval.toLowerCase().trim() : '';
    const planName = plan.name ? plan.name.toLowerCase() : '';
    
    if (planInterval === 'monthly' || planName.includes("月")) {
      endDate.setMonth(endDate.getMonth() + 1);
      console.log("设置monthly计划：一个月后到期");
    } 
    else if (planInterval === 'quarterly' || planName.includes("季度") || planName.includes("季")) {
      endDate.setMonth(endDate.getMonth() + 3);
      console.log("设置quarterly计划：三个月后到期");
    }
    else if (planInterval === 'yearly' || planName.includes("年") && !planName.includes("2年") && !planName.includes("3年")) {
      endDate.setFullYear(endDate.getFullYear() + 1);
      console.log("设置yearly计划：一年后到期");
    }
    else if (planInterval === '2years' || planName.includes("2年")) {
      endDate.setFullYear(endDate.getFullYear() + 2);
      console.log("设置2years计划：两年后到期");
    }
    else if (planInterval === '3years' || planName.includes("3年")) {
      endDate.setFullYear(endDate.getFullYear() + 3);
      console.log("设置3years计划：三年后到期");
    }
    else {
      // 默认为monthly
      endDate.setMonth(endDate.getMonth() + 1);
      console.log("未知计划周期，默认设置为一个月");
    }

    console.log("Creating subscription with dates:", { 
      start: startDate.toISOString(), 
      end: endDate.toISOString(),
      interval: plan.interval || "default"
    });

    // Create subscription
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: plan_id,
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        auto_renew: true,
        payment_method: payment_method || 'unknown'
      })
      .select('*')
      .single();

    if (subscriptionError) {
      console.error("Error creating subscription:", subscriptionError);
      throw new Error("Failed to create subscription: " + subscriptionError.message);
    }

    if (!subscription) {
      console.error("No subscription returned after insert");
      throw new Error("Failed to create subscription - no data returned");
    }

    console.log("Successfully created subscription:", subscription);

    // Record subscription history
    try {
      const currencyCode = plan.currency || 'USD';
      const { error: historyError } = await supabase
        .from('subscription_history')
        .insert({
          user_id: userId,
          subscription_id: subscription.id,
          new_plan_id: plan_id,
          change_type: 'new',
          amount: plan.price,
          currency: currencyCode,
          effective_date: startDate.toISOString()
        });

      if (historyError) {
        console.error("Error recording subscription history:", historyError);
      }
    } catch (histErr) {
      console.error("Failed to record subscription history:", histErr);
      // Don't fail the whole operation if just the history recording fails
    }

    // 记录订单数据（如果有）
    if (order_details) {
      try {
        // 更新订单状态为已完成
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({ 
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('order_number', order_details.orderNumber);
          
        if (orderUpdateError) {
          console.error("Error updating order status:", orderUpdateError);
        } else {
          console.log("Order status updated to completed");
        }
      } catch (orderErr) {
        console.error("Failed to update order:", orderErr);
        // Don't fail if order update fails
      }
    }

    // Record transaction
    try {
      const currencyCode = plan.currency || 'USD';
      const transactionData = {
        subscription_id: subscription.id,
        transaction_type: 'payment',
        amount: order_details?.total || plan.price,
        currency: currencyCode,
        payment_method: payment_method || 'unknown',
        status: 'completed'
      };
      
      // 如果有订单编号，关联订单信息
      if (order_details?.orderNumber) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('id')
          .eq('order_number', order_details.orderNumber)
          .maybeSingle();
          
        if (orderData?.id) {
          transactionData.order_id = orderData.id;
        }
      }
      
      const { error: transactionError } = await supabase
        .from('subscription_transactions')
        .insert(transactionData);

      if (transactionError) {
        console.error("Error recording transaction:", transactionError);
      }
    } catch (transErr) {
      console.error("Failed to record transaction:", transErr);
      // Don't fail the whole operation if just the transaction recording fails
    }

    return { 
      success: true, 
      subscription,
      amount: order_details?.total || plan.price
    };
  } catch (error) {
    console.error("Subscription creation error:", error);
    throw error;
  }
}

// Helper function to cancel a subscription
async function cancelSubscription(supabase, userId, { subscription_id }) {
  // Verify subscription exists and belongs to user
  const { data: subscription, error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('id', subscription_id)
    .eq('user_id', userId)
    .single();

  if (subscriptionError || !subscription) {
    throw new Error("Subscription not found or not authorized");
  }

  if (subscription.status !== 'active') {
    throw new Error("Subscription is not active");
  }

  // Update subscription status
  const { data: updatedSubscription, error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      auto_renew: false
    })
    .eq('id', subscription_id)
    .select('*')
    .single();

  if (updateError) {
    throw new Error("Failed to cancel subscription");
  }

  // Record in history
  const { error: historyError } = await supabase
    .from('subscription_history')
    .insert({
      user_id: userId,
      subscription_id: subscription_id,
      previous_plan_id: subscription.plan_id,
      change_type: 'cancel',
      amount: 0,
      currency: 'usd',  // Default currency
      effective_date: new Date().toISOString()
    });

  if (historyError) {
    console.error("Error recording cancellation history:", historyError);
  }

  return { success: true, subscription: updatedSubscription };
}

// Helper function to renew a subscription
async function renewSubscription(supabase, userId, { subscription_id }) {
  // Verify subscription exists and belongs to user
  const { data: subscription, error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .select('*, subscription_plans:plan_id(*)')
    .eq('id', subscription_id)
    .eq('user_id', userId)
    .single();

  if (subscriptionError || !subscription) {
    throw new Error("Subscription not found or not authorized");
  }

  const plan = subscription.subscription_plans;
  if (!plan) {
    throw new Error("Associated plan not found");
  }

  // Calculate new end date
  const startDate = new Date();
  let endDate = new Date(startDate);
  
  switch (plan.interval) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    case '2years':
      endDate.setFullYear(endDate.getFullYear() + 2);
      break;
    case '3years':
      endDate.setFullYear(endDate.getFullYear() + 3);
      break;
    default:
      throw new Error(`Invalid subscription interval: ${plan.interval}`);
  }

  // Update subscription
  const { data: updatedSubscription, error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      status: 'active',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      auto_renew: true,
      last_payment_date: startDate.toISOString()
    })
    .eq('id', subscription_id)
    .select('*')
    .single();

  if (updateError) {
    throw new Error("Failed to renew subscription");
  }

  // Record in history
  const { error: historyError } = await supabase
    .from('subscription_history')
    .insert({
      user_id: userId,
      subscription_id: subscription_id,
      new_plan_id: plan.id,
      change_type: 'renew',
      amount: plan.price,
      currency: plan.currency,
      effective_date: startDate.toISOString()
    });

  if (historyError) {
    console.error("Error recording renewal history:", historyError);
  }

  // Record transaction
  const { error: transactionError } = await supabase
    .from('subscription_transactions')
    .insert({
      subscription_id: subscription_id,
      transaction_type: 'payment',
      amount: plan.price,
      currency: plan.currency,
      payment_method: subscription.payment_method || 'unknown',
      status: 'completed'
    });

  if (transactionError) {
    console.error("Error recording transaction:", transactionError);
  }

  return { success: true, subscription: updatedSubscription };
}

// Helper function to change subscription plan
async function changePlan(supabase, userId, { subscription_id, new_plan_id }) {
  // Verify subscription exists and belongs to user
  const { data: subscription, error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .select('*, subscription_plans:plan_id(*)')
    .eq('id', subscription_id)
    .eq('user_id', userId)
    .single();

  if (subscriptionError || !subscription) {
    throw new Error("Subscription not found or not authorized");
  }

  if (subscription.status !== 'active') {
    throw new Error("Cannot change plan on inactive subscription");
  }

  const currentPlan = subscription.subscription_plans;
  
  // Verify new plan exists
  const { data: newPlan, error: newPlanError } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', new_plan_id)
    .single();

  if (newPlanError || !newPlan) {
    throw new Error("New plan not found");
  }

  // Calculate new end date
  const startDate = new Date();
  let endDate = new Date(startDate);
  
  switch (newPlan.interval) {
    case 'monthly':
      endDate.setMonth(endDate.getMonth() + 1);
      break;
    case 'quarterly':
      endDate.setMonth(endDate.getMonth() + 3);
      break;
    case 'yearly':
      endDate.setFullYear(endDate.getFullYear() + 1);
      break;
    case '2years':
      endDate.setFullYear(endDate.getFullYear() + 2);
      break;
    case '3years':
      endDate.setFullYear(endDate.getFullYear() + 3);
      break;
    default:
      throw new Error(`Invalid subscription interval: ${newPlan.interval}`);
  }

  // Update subscription
  const { data: updatedSubscription, error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      plan_id: new_plan_id,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      last_payment_date: startDate.toISOString()
    })
    .eq('id', subscription_id)
    .select('*')
    .single();

  if (updateError) {
    throw new Error("Failed to change subscription plan");
  }

  // Determine upgrade/downgrade
  let changeType = 'upgrade';
  if (newPlan.price < currentPlan.price) {
    changeType = 'downgrade';
  }

  // Record in history
  const { error: historyError } = await supabase
    .from('subscription_history')
    .insert({
      user_id: userId,
      subscription_id: subscription_id,
      previous_plan_id: currentPlan.id,
      new_plan_id: new_plan_id,
      change_type: changeType,
      amount: newPlan.price,
      currency: newPlan.currency,
      effective_date: startDate.toISOString()
    });

  if (historyError) {
    console.error("Error recording plan change history:", historyError);
  }

  // Record transaction
  const { error: transactionError } = await supabase
    .from('subscription_transactions')
    .insert({
      subscription_id: subscription_id,
      transaction_type: 'payment',
      amount: newPlan.price,
      currency: newPlan.currency,
      payment_method: subscription.payment_method || 'unknown',
      status: 'completed'
    });

  if (transactionError) {
    console.error("Error recording transaction:", transactionError);
  }

  return { success: true, subscription: updatedSubscription };
}

// Helper function to toggle auto-renew setting
async function toggleAutoRenew(supabase, userId, { subscription_id }) {
  // Verify subscription exists and belongs to user
  const { data: subscription, error: subscriptionError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('id', subscription_id)
    .eq('user_id', userId)
    .single();

  if (subscriptionError || !subscription) {
    throw new Error("Subscription not found or not authorized");
  }

  if (subscription.status !== 'active') {
    throw new Error("Cannot modify inactive subscription");
  }

  // Toggle auto_renew value
  const newAutoRenewValue = !subscription.auto_renew;

  // Update subscription
  const { data: updatedSubscription, error: updateError } = await supabase
    .from('user_subscriptions')
    .update({
      auto_renew: newAutoRenewValue
    })
    .eq('id', subscription_id)
    .select('*')
    .single();

  if (updateError) {
    throw new Error("Failed to update auto-renew setting");
  }

  return { success: true, subscription: updatedSubscription, auto_renew: newAutoRenewValue };
}
