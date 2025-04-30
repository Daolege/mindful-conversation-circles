import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const generateOrderNumber = () => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORDER-${timestamp}-${randomStr}`;
};

serve(async (req) => {
  // 增强日志：记录所有请求的基本信息
  console.log(`[${new Date().toISOString()}] 收到新请求 - 方法: ${req.method}, URL: ${req.url}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // 解析请求体
    const requestBody = await req.json();
    
    // 增强日志：记录完整请求内容
    console.log(`[${new Date().toISOString()}] 请求详情:`, JSON.stringify({
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries()),
      body: requestBody
    }, null, 2));
    
    const { 
      courseId, 
      amount, 
      userId, 
      orderNumber, 
      subscriptionDetails, 
      original_amount,
      paymentType,
      currency
    } = requestBody;
    
    // 修复：使用let而不是const定义可能会被修改的变量
    let finalCurrency = (currency || 'usd').toLowerCase();
    const isChinaPayment = ['wechat', 'alipay'].includes(paymentType);
    
    // 如果是中国支付方式，设置货币为CNY
    if (isChinaPayment) {
      finalCurrency = 'cny';
    }
    
    // 确定汇率
    const exchangeRate = isChinaPayment ? 7.23 : 1.0;
    const processedAmount = amount;
    
    // 确保original_amount有值，如果没有则使用processedAmount
    const originalAmount = original_amount || processedAmount;
    
    // 确保original_currency字段始终有值
    // 如果未明确指定，则使用输入的currency，如果也没有则使用finalCurrency
    const originalCurrency = currency ? currency.toLowerCase() : finalCurrency;

    // 创建基本订单数据 - 确保所有货币字段都有值
    const orderData = {
      course_id: courseId,
      user_id: userId,
      amount: processedAmount,
      original_amount: originalAmount,
      order_number: orderNumber || generateOrderNumber(),
      payment_type: paymentType,
      status: 'completed',
      currency: finalCurrency,
      exchange_rate: exchangeRate,
      original_currency: originalCurrency // 确保设置原始货币
    };
    
    console.log(`[${new Date().toISOString()}] 处理支付 - 用户ID: ${userId}, 课程ID: ${courseId}, 金额: ${amount}, 货币: ${currency}, 支付方式: ${paymentType}, 最终货币: ${finalCurrency}, 原始货���: ${originalCurrency}`);
    
    // 验证必要参数
    if (!amount || !userId || !paymentType) {
      const errorMsg = `缺少必要参数: amount=${amount}, userId=${userId}, paymentType=${paymentType}`;
      console.error(`[${new Date().toISOString()}] 错误: ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    // 记录Supabase连接尝试
    console.log(`[${new Date().toISOString()}] 尝试连接Supabase`);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 
                       req.headers.get('authorization')?.split('Bearer ')[1] || '';
    
    if (!supabaseKey) {
      console.error(`[${new Date().toISOString()}] 错误: 缺少API密钥`);
      throw new Error('缺少API密钥');
    }
    
    console.log(`[${new Date().toISOString()}] Supabase连接信息 - URL是否存在: ${!!supabaseUrl}, Key是否存在: ${!!supabaseKey}`);
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 验证用户ID
    console.log(`[${new Date().toISOString()}] 验证用户: ${userId}`);
    
    try {
      const { data: userExists, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error(`[${new Date().toISOString()}] 用户验证错误:`, userError);
      }
      
      console.log(`[${new Date().toISOString()}] 用户验证结果:`, userExists ? '用户存在' : '用户不存在');
        
      if (userError || !userExists) {
        console.error(`[${new Date().toISOString()}] 错误: 无效的用户ID ${userId}`);
        return new Response(
          JSON.stringify({ error: '无效的用户' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404 
          }
        );
      }
    } catch (userVerifyError) {
      console.error(`[${new Date().toISOString()}] 用户验证过程异常:`, userVerifyError);
      throw userVerifyError;
    }

    // 模拟支付处理延迟
    console.log(`[${new Date().toISOString()}] 模拟支付处理`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 详细记录即将创建的订单信息
    console.log(`[${new Date().toISOString()}] 准备创建订单:`, {
      course_id: courseId,
      user_id: userId,
      amount: processedAmount,
      original_amount: originalAmount,
      currency: finalCurrency,
      original_currency: originalCurrency,
      payment_type: paymentType,
      status: 'completed',
      exchange_rate: exchangeRate,
      order_number: orderNumber || generateOrderNumber()
    });
    
    // 处理订阅特定数据
    if (paymentType.startsWith('subscription-')) {
      console.log(`[${new Date().toISOString()}] 处理订阅订单:`, subscriptionDetails);
    }

    // 创建订单记录
    console.log(`[${new Date().toISOString()}] 尝试创建订单记录`);
    
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error(`[${new Date().toISOString()}] 数据库创建订单失败:`, orderError);
        
        // 尝试详细记录插入操作的完整SQL (仅用于调试)
        console.log(`[${new Date().toISOString()}] 订单数据:`, JSON.stringify(orderData, null, 2));
        
        return new Response(
          JSON.stringify({ error: `创建订单失败: ${orderError.message}`, details: orderError }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        );
      }
      
      // 验证订单是否成功创建
      console.log(`[${new Date().toISOString()}] 订单创建成功:`, order);
      
      // 验证订单状态和货币类型
      const { data: verifyOrder, error: verifyError } = await supabase
        .from('orders')
        .select('id, status, currency')
        .eq('id', order.id)
        .single();
        
      if (verifyError) {
        console.error(`[${new Date().toISOString()}] 订单验证失败:`, verifyError);
      } else {
        console.log(`[${new Date().toISOString()}] 订单验证成功:`, verifyOrder);
      }

      // 如果是课程购买，添加课程访问权限
      if (courseId) {
        console.log(`[${new Date().toISOString()}] 添加课程访问权限:`, { userId, courseId });
        
        try {
          const { error: accessError } = await supabase
            .from('user_courses')
            .insert({
              user_id: userId,
              course_id: courseId,
              purchased_at: new Date().toISOString()
            });

          if (accessError) {
            console.error(`[${new Date().toISOString()}] 授予课程访问权限失败:`, accessError);
            // 不要因为授权失败而影响订单完成
          } else {
            console.log(`[${new Date().toISOString()}] 课程访问权限添加成功`);
          }
        } catch (courseAccessError) {
          console.error(`[${new Date().toISOString()}] 添加课程访问权限时异常:`, courseAccessError);
        }
      }

      // 如果是订阅类型，创建用户订阅记录
      if (paymentType.startsWith('subscription-')) {
        try {
          // 检查是否已有相同计划的活跃订阅
          const subscriptionType = paymentType.replace('subscription-', '');
          
          console.log(`[${new Date().toISOString()}] 创建订阅记录:`, subscriptionType);
          
          // 查找对应的订阅计划
          const { data: planData, error: planError } = await supabase
            .from('subscription_plans')
            .select('id, price')
            .eq('interval', subscriptionType)
            .eq('is_active', true)
            .limit(1)
            .maybeSingle();
          
          if (planError) {
            console.error(`[${new Date().toISOString()}] 查找订阅计划失败:`, planError);
          } else if (planData) {
            console.log(`[${new Date().toISOString()}] 找到订阅计划:`, planData);
            
            // 计算订阅结束日期
            const now = new Date();
            const endDate = new Date(now);
            switch(subscriptionType) {
              case 'monthly':
                endDate.setMonth(now.getMonth() + 1);
                break;
              case 'quarterly':
                endDate.setMonth(now.getMonth() + 3);
                break;
              case 'yearly':
                endDate.setFullYear(now.getFullYear() + 1);
                break;
              case '2years':
                endDate.setFullYear(now.getFullYear() + 2);
                break;
              case '3years':
                endDate.setFullYear(now.getFullYear() + 3);
                break;
            }
            
            // 创建用户订阅记录
            try {
              const { data: subscription, error: subscriptionError } = await supabase
                .from('user_subscriptions')
                .insert({
                  user_id: userId,
                  plan_id: planData.id,
                  status: 'active',
                  start_date: now.toISOString(),
                  end_date: endDate.toISOString(),
                  auto_renew: true,
                  payment_method: paymentType.replace('subscription-', '')
                })
                .select()
                .single();
                
              if (subscriptionError) {
                console.error(`[${new Date().toISOString()}] 创建订阅记录失败:`, subscriptionError);
              } else {
                console.log(`[${new Date().toISOString()}] 创建订阅成功:`, subscription);
                
                // 创建订阅历史记录
                try {
                  await supabase
                    .from('subscription_history')
                    .insert({
                      user_id: userId,
                      subscription_id: subscription.id,
                      new_plan_id: planData.id,
                      change_type: 'new',
                      amount: amount,
                      currency: finalCurrency, // 使用标准化货币
                      effective_date: now.toISOString()
                    });
                  
                  console.log(`[${new Date().toISOString()}] 订阅历史记录创建成功`);
                } catch (historyError) {
                  console.error(`[${new Date().toISOString()}] 创建订阅历史记录失败:`, historyError);
                }
                
                // 创建订阅交易记录
                try {
                  await supabase
                    .from('subscription_transactions')
                    .insert({
                      subscription_id: subscription.id,
                      order_id: order.id,
                      amount: amount,
                      currency: finalCurrency, // 使用标准化货币
                      payment_method: paymentType.replace('subscription-', ''),
                      status: 'completed',
                      transaction_type: 'payment'
                    });
                  
                  console.log(`[${new Date().toISOString()}] 订阅交易记录创建成功`);
                } catch (transactionError) {
                  console.error(`[${new Date().toISOString()}] 创建订阅交易记录失败:`, transactionError);
                }
              }
            } catch (createSubError) {
              console.error(`[${new Date().toISOString()}] 创建用户订阅过程中异常:`, createSubError);
            }
          } else {
            console.log(`[${new Date().toISOString()}] 未找到匹配的订阅计划`);
          }
        } catch (subscriptionErr) {
          console.error(`[${new Date().toISOString()}] 处理订阅逻辑时出错:`, subscriptionErr);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          order,
          currency: finalCurrency, // 返回标准化货币
          original_currency: originalCurrency, // 添加原始货币到响应
          amount: processedAmount,
          originalAmount
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (orderInsertError) {
      console.error(`[${new Date().toISOString()}] 创建订单时异常:`, orderInsertError);
      throw orderInsertError;
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 处理支付错误:`, error);
    throw error;
  }
});

// 保留生成订单号的函数
function generateOrderNumber() {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORDER-${timestamp}-${randomStr}`;
}
