
-- Function to create a test subscription for a user
CREATE OR REPLACE FUNCTION public.create_test_subscription(user_id UUID, plan_interval TEXT DEFAULT 'monthly')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_id UUID;
  v_start_date TIMESTAMP WITH TIME ZONE := now();
  v_end_date TIMESTAMP WITH TIME ZONE;
  v_subscription_id UUID;
BEGIN
  -- Get the plan ID for the requested interval
  SELECT id INTO v_plan_id FROM public.subscription_plans
  WHERE interval = plan_interval AND is_active = true
  ORDER BY display_order
  LIMIT 1;
  
  IF v_plan_id IS NULL THEN
    RAISE EXCEPTION 'No active subscription plan found for interval %', plan_interval;
  END IF;
  
  -- Calculate end date based on the plan interval
  CASE plan_interval
    WHEN 'monthly' THEN
      v_end_date := v_start_date + INTERVAL '1 month';
    WHEN 'quarterly' THEN
      v_end_date := v_start_date + INTERVAL '3 months';
    WHEN 'yearly' THEN
      v_end_date := v_start_date + INTERVAL '1 year';
    ELSE
      v_end_date := v_start_date + INTERVAL '1 month';
  END CASE;
  
  -- Create the subscription
  INSERT INTO public.user_subscriptions (
    user_id,
    plan_id,
    status,
    start_date,
    end_date,
    auto_renew,
    payment_method
  ) VALUES (
    user_id,
    v_plan_id,
    'active',
    v_start_date,
    v_end_date,
    true,
    'test'
  ) RETURNING id INTO v_subscription_id;
  
  -- Record subscription history
  INSERT INTO public.subscription_history (
    user_id,
    subscription_id,
    new_plan_id,
    change_type,
    amount,
    currency,
    effective_date
  ) 
  SELECT 
    user_id,
    v_subscription_id,
    v_plan_id,
    'new',
    price,
    currency,
    v_start_date
  FROM public.subscription_plans
  WHERE id = v_plan_id;
  
  -- Create transaction record
  INSERT INTO public.subscription_transactions (
    subscription_id,
    transaction_type,
    amount,
    currency,
    payment_method,
    status
  )
  SELECT 
    v_subscription_id,
    'payment',
    price,
    currency,
    'test',
    'completed'
  FROM public.subscription_plans
  WHERE id = v_plan_id;
  
END;
$$;
