
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, AlertTriangle, Check } from 'lucide-react';
import { useAuth } from '@/contexts/authHooks'; 
import { createSubscription } from '@/lib/services/subscriptionService';
import { toast } from 'sonner';
import { SubscriptionPeriod } from '@/lib/types/course-new';
import { useTranslations } from "@/hooks/useTranslations";

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
  const { t } = useTranslations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(false);
  
  useEffect(() => {
    // Reset error when payment method or period changes
    setError(null);
  }, [selectedPeriod, paymentMethod]);

  const handlePayment = async () => {
    if (!user) {
      setError(t('errors:pleaseLoginFirst'));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Process the subscription payment
      const result = await createSubscription(user, selectedPeriod, paymentMethod);
      
      if (result.success) {
        setProcessed(true);
        toast.success(t('checkout:subscriptionSuccess'), {
          description: t('checkout:subscriptionActivated')
        });
        
        setTimeout(() => {
          onSuccess('sub-123'); // Replace with actual subscription ID if available
        }, 1500);
      } else {
        setError(result.error || t('checkout:subscriptionProcessingFailed'));
      }
    } catch (err) {
      console.error('Subscription payment error:', err);
      setError(t('errors:paymentProcessingError'));
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = (period: SubscriptionPeriod): string => {
    switch (period) {
      case 'monthly': return t('checkout:monthly');
      case 'quarterly': return t('checkout:quarterly'); 
      case '2years': return t('checkout:twoYears');
      case '3years': return t('checkout:threeYears');
      default: return t('checkout:yearly');
    }
  };
  
  const getPaymentMethodLabel = (method: string): string => {
    switch (method) {
      case 'wechat': return t('checkout:wechatPay');
      case 'alipay': return t('checkout:alipay');
      case 'credit-card': return t('checkout:creditCard');
      case 'stripe': return 'Stripe';
      default: return 'PayPal';
    }
  };

  return (
    <Card className="p-6">
      {processed ? (
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-medium mb-2">{t('checkout:subscriptionSuccess')}</h3>
          <p className="text-muted-foreground mb-6">{t('checkout:subscriptionActivated')}</p>
          <Button onClick={() => onSuccess('sub-123')} className="w-full">
            {t('common:continue')}
          </Button>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">{t('checkout:confirmSubscription')}</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span>{t('checkout:subscriptionPeriod')}</span>
              <span className="font-medium">{getPeriodLabel(selectedPeriod)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t('checkout:paymentMethod')}</span>
              <span className="font-medium">{getPaymentMethodLabel(paymentMethod)}</span>
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
              {t('common:cancel')}
            </Button>
            <Button 
              className="flex-1"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('checkout:processing')}
                </>
              ) : (
                t('checkout:confirmPayment')
              )}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
