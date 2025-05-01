
// Update this file to use the SubscriptionPeriod from course-new
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '@/contexts/authHooks'; 
import { createSubscription } from '@/lib/services/subscriptionService';
import { toast } from 'sonner';
import { SubscriptionPeriod } from '@/lib/types/course-new';

interface SubscriptionCheckoutProps {
  onSuccess: (subscriptionId: string) => void;
  onCancel: () => void;
  selectedPeriod: SubscriptionPeriod;
  paymentMethod: string;
}

export function SubscriptionCheckout({
  onSuccess,
  onCancel,
  selectedPeriod,
  paymentMethod,
}: SubscriptionCheckoutProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(false);
  
  useEffect(() => {
    // Reset error when payment method or period changes
    setError(null);
  }, [selectedPeriod, paymentMethod]);

  const handlePayment = async () => {
    if (!user) {
      setError('请先登录再进行订阅');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Process the subscription payment
      const result = await createSubscription(user, selectedPeriod, paymentMethod);
      
      if (result.success) {
        setProcessed(true);
        toast.success('订阅成功！', {
          description: '您的订阅已经生效'
        });
        
        setTimeout(() => {
          onSuccess('sub-123'); // Replace with actual subscription ID if available
        }, 1500);
      } else {
        setError(result.error || '订阅处理失败，请稍后再试');
      }
    } catch (err) {
      console.error('Subscription payment error:', err);
      setError('订阅过程中发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      {processed ? (
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium mb-2">订阅成功</h3>
          <p className="text-muted-foreground mb-6">您的订阅已经成功处理</p>
          <Button onClick={() => onSuccess('sub-123')} className="w-full">
            继续
          </Button>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">确认订阅</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span>订阅周期</span>
              <span className="font-medium">{selectedPeriod === 'monthly' ? '月付' : 
                selectedPeriod === 'quarterly' ? '季付' : 
                selectedPeriod === '2years' ? '两年' : 
                selectedPeriod === '3years' ? '三年' : '年付'}</span>
            </div>
            <div className="flex justify-between">
              <span>支付方式</span>
              <span className="font-medium">{
                paymentMethod === 'wechat' ? '微信支付' :
                paymentMethod === 'alipay' ? '支付宝' :
                paymentMethod === 'credit-card' ? '信用卡' :
                paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'
              }</span>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onCancel}
              disabled={loading}
            >
              取消
            </Button>
            <Button 
              className="flex-1"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  处理中
                </>
              ) : (
                '确认支付'
              )}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
