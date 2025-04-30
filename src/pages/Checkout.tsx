
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Loader2, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckoutContent } from '@/components/checkout/CheckoutContent';
import { getCourseNewById } from '@/lib/services/courseNewService';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from "@/contexts/authHooks";
import { toast } from 'sonner';
import { getDefaultExchangeRate } from '@/lib/services/currencyService';
import type { PaymentPlan } from "@/components/checkout/PaymentPlanSelector";
import type { PaymentMethod } from "@/components/checkout/PaymentMethodSelect";
import type { SubscriptionPeriod } from "@/components/checkout/SubscriptionPlans";

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  const courseIdNum = courseId ? parseInt(courseId, 10) : 0;
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for payment options
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan>("single");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit-card");
  const [subscriptionPeriod, setSubscriptionPeriod] = useState<SubscriptionPeriod>("monthly");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [subscriptionPlanName, setSubscriptionPlanName] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [exchangeRate] = useState(getDefaultExchangeRate());
  const [orderNumber] = useState(`ORD${Date.now().toString().slice(-9)}`);
  const [orderDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch course data
  const { data: courseResponse, isLoading: isLoadingCourse, error: courseError } = useQuery({
    queryKey: ['checkout-course', courseIdNum],
    queryFn: () => getCourseNewById(courseIdNum),
    enabled: !!courseIdNum && !isNaN(courseIdNum),
    staleTime: 1000 * 60,
  });

  const course = courseResponse?.data;

  // Set initial price when course loads
  useEffect(() => {
    if (course) {
      const coursePrice = course.price || 0;
      setOriginalPrice(coursePrice);
      setTotal(coursePrice);
      console.log("Course loaded with price:", coursePrice);
    }
  }, [course]);

  // Update price calculations when payment plan changes
  useEffect(() => {
    if (!course) return;
    
    // Reset discount if changing to single purchase
    if (paymentPlan === "single") {
      const singlePrice = course.price || 0;
      setOriginalPrice(singlePrice);
      setDiscount(0);
      setTotal(singlePrice);
      console.log("Switched to single purchase:", singlePrice);
    }
  }, [paymentPlan, course]);

  // Handle payment plan change
  const handlePaymentPlanChange = (plan: PaymentPlan) => {
    console.log("Payment plan changed to:", plan);
    setPaymentPlan(plan);
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    console.log("Payment method changed to:", method);
    setPaymentMethod(method);
  };

  // Handle subscription period change
  const handleSubscriptionPeriodChange = (
    period: SubscriptionPeriod, 
    price: number, 
    planName: string, 
    discountPct: number
  ) => {
    console.log("Subscription changed:", period, "price:", price, "discount:", discountPct);
    setSubscriptionPeriod(period);
    setOriginalPrice(course?.price || 0);
    setSubscriptionPlanName(planName);
    setDiscountPercentage(discountPct);
    
    // Calculate discount
    const originalCoursePrice = course?.price || 0;
    const discountAmount = (originalCoursePrice * discountPct) / 100;
    setDiscount(discountAmount);
    setTotal(price);
  };

  // Handle payment processing
  const handlePayment = async () => {
    if (!user && !confirm("您尚未登录，是否继续以游客身份结账？")) {
      navigate('/auth', { state: { from: `/checkout?courseId=${courseId}` } });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, PayPal always fails
      if (paymentMethod === 'paypal') {
        navigate('/payment-failed', {
          state: {
            errorDetails: {
              errorCode: 'PAYPAL_PROCESSING_ERROR',
              paymentMethod: paymentMethod,
              errorMessage: 'PayPal支付处理过程中出现错误，请重新尝试或选择其他支付方式。',
              courseId: courseId
            }
          }
        });
        return;
      }
      
      // Success for other payment methods
      navigate('/payment-success', {
        state: {
          orderDetails: {
            orderId: orderNumber,
            orderType: paymentPlan === 'subscription' ? `${subscriptionPlanName}` : '课程单次购买',
            userEmail: user?.email || 'guest@example.com',
            paymentDate: new Date().toISOString().split('T')[0],
            amount: paymentMethod === 'wechat' ? `¥${(total * exchangeRate).toFixed(2)}` : `$${total.toFixed(2)}`,
            paymentMethod: paymentMethod === 'wechat' ? '微信支付' : 
                           paymentMethod === 'alipay' ? '支付宝' : 
                           paymentMethod === 'credit-card' ? '信用卡' : 
                           paymentMethod === 'stripe' ? 'Stripe' : 'PayPal',
            paymentStatus: '已完成',
            courseId: courseId
          }
        }
      });
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error("支付处理失败", {
        description: "处理您的付款时出现错误，请重试",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingCourse) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="h-12 w-12 animate-spin text-knowledge-primary mb-6" />
              <p className="text-xl">加载课程信息...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (courseError || !course) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <Card className="w-full max-w-4xl p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <AlertTriangle className="h-16 w-16 text-red-500" />
              <h1 className="text-2xl font-bold">无法加载课程信息</h1>
              <p className="text-gray-600">
                {courseError instanceof Error ? courseError.message : '未找到课程或发生错误'}
              </p>
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => navigate('/courses')}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  返回课程列表
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  刷新页面
                </button>
              </div>
            </div>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  console.log("课程价格:", course.price, "币种:", course.currency || 'CNY');
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-16 mt-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-10">确认订单</h1>
        
        <CheckoutContent
          course={course}
          paymentPlan={paymentPlan}
          paymentMethod={paymentMethod}
          subscriptionPeriod={subscriptionPeriod}
          originalPrice={originalPrice}
          discount={discount}
          tax={tax}
          total={total}
          loading={loading}
          orderNumber={orderNumber}
          orderDate={orderDate}
          subscriptionPlanName={subscriptionPlanName}
          discountPercentage={discountPercentage}
          onPaymentPlanChange={handlePaymentPlanChange}
          onPaymentMethodChange={handlePaymentMethodChange}
          onSubscriptionPeriodChange={handleSubscriptionPeriodChange}
          onPayment={handlePayment}
          exchangeRate={exchangeRate}
          courseCurrency={course.currency || 'cny'}
        />
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
