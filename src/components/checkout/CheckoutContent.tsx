
import { PaymentPlanSelector, type PaymentPlan } from './PaymentPlanSelector';
import { PaymentMethodSelect, type PaymentMethod } from './PaymentMethodSelect';
import { SubscriptionPlans, type SubscriptionPeriod } from './SubscriptionPlans';
import { PurchaseOptions } from './PurchaseOptions';
import OrderSummary from './OrderSummary';
import { CourseCard } from './CourseCard';

interface CheckoutContentProps {
  course: any;
  paymentPlan: PaymentPlan;
  paymentMethod: PaymentMethod;
  subscriptionPeriod: SubscriptionPeriod;
  originalPrice: number;
  discount: number;
  tax: number;
  total: number;
  loading: boolean;
  orderNumber: string;
  orderDate: string;
  subscriptionPlanName: string;
  discountPercentage: number;
  onPaymentPlanChange: (plan: PaymentPlan) => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onSubscriptionPeriodChange: (
    period: SubscriptionPeriod,
    price: number,
    planName: string,
    discountPct: number
  ) => void;
  onPayment: () => void;
  exchangeRate: number;
  courseCurrency: string;
}

export const CheckoutContent = ({
  course,
  paymentPlan,
  paymentMethod,
  subscriptionPeriod,
  originalPrice,
  discount,
  tax,
  total,
  loading,
  orderNumber,
  orderDate,
  subscriptionPlanName,
  discountPercentage,
  onPaymentPlanChange,
  onPaymentMethodChange,
  onSubscriptionPeriodChange,
  onPayment,
  exchangeRate,
  courseCurrency = 'usd',
}: CheckoutContentProps) => {
  // Check if course has subscription plans
  const hasSubscriptionPlans = course?.subscription_plans && course.subscription_plans.length > 0;
  
  console.log("CheckoutContent 收到课程价格:", course?.price, "当前设置的价格:", originalPrice, "课程币种:", courseCurrency);
  
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {course && (
          <CourseCard 
            title={course.title} 
            description={course.description} 
          />
        )}

        <PurchaseOptions 
          selectedOption={paymentPlan}
          onOptionChange={(value) => {
            console.log("支付方式变更为:", value);
            onPaymentPlanChange(value);
          }}
          selectedPlan={subscriptionPeriod}
          onPlanChange={(period, price, name, discountPct) => {
            console.log("订阅计划变更为:", period, "价格:", price, "折扣:", discountPct);
            onSubscriptionPeriodChange(period, price, name, discountPct);
          }}
          paymentMethod={paymentMethod}
          exchangeRate={exchangeRate}
          course={{
            ...course,
            currency: courseCurrency
          }}
        />

        {(paymentPlan === "single" || (paymentPlan === "subscription" && subscriptionPeriod)) && (
          <PaymentMethodSelect
            selectedMethod={paymentMethod}
            onMethodChange={onPaymentMethodChange}
          />
        )}
      </div>
      
      <div className="lg:col-span-1">
        <OrderSummary
          orderNumber={orderNumber}
          orderDate={orderDate}
          originalPrice={originalPrice}
          discount={discount}
          tax={tax}
          total={total}
          onPayClick={onPayment}
          loading={loading}
          isSubscription={paymentPlan === "subscription" && hasSubscriptionPlans}
          paymentMethod={paymentMethod}
          exchangeRate={exchangeRate}
          subscriptionPlanName={subscriptionPlanName}
          currency={courseCurrency}
        />
      </div>
    </div>
  );
}
