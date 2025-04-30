
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { paymentType, amount, plan, paymentMethod, courseId, userId, orderNumber } = await req.json();
    console.log("支付请求数据:", { paymentType, amount, plan, paymentMethod, courseId, userId, orderNumber });
    
    // 模拟处理时间
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 生成订单号（如果没有提供）
    const generatedOrderNumber = orderNumber || `ORDER-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // 根据支付类型处理不同逻辑
    let responseData = {
      success: true,
      paymentId: `mock_payment_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      checkoutUrl: null,
      orderNumber: generatedOrderNumber,
      message: "模拟支付处理成功"
    };
    
    // 订阅支付处理
    if (paymentType === 'subscription') {
      console.log("处理订阅支付:", plan);
      responseData = {
        ...responseData,
        subscriptionId: `sub_${Date.now()}`,
        plan: plan,
        interval: plan,
        nextBillingDate: getNextBillingDate(plan),
        message: "订阅创建成功"
      };
    }
    
    // 根据不同支付方式提供不同的模拟响应
    if (["wechat", "alipay"].includes(paymentMethod)) {
      // 生成模拟二维码链接
      responseData.checkoutUrl = "https://example.com/qr-code";
    } else if (["apple_pay", "google_pay"].includes(paymentMethod)) {
      // 生成模拟钱包链接
      responseData.checkoutUrl = "https://example.com/wallet-redirect";
    }
    
    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("支付处理错误:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "支付处理失败",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// 根据订阅计划类型计算下一次扣款日期
function getNextBillingDate(planType: string): string {
  const now = new Date();
  
  switch(planType) {
    case 'monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'quarterly':
      now.setMonth(now.getMonth() + 3);
      break;
    case 'yearly':
      now.setFullYear(now.getFullYear() + 1);
      break;
    case '2years':
      now.setFullYear(now.getFullYear() + 2);
      break;
    case '3years':
      now.setFullYear(now.getFullYear() + 3);
      break;
    default:
      now.setMonth(now.getMonth() + 1); // 默认1个月
  }
  
  return now.toISOString().split('T')[0]; // 返回 YYYY-MM-DD 格式的日期
}
