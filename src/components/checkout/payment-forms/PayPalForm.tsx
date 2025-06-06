
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslations } from "@/hooks/useTranslations";

export function PayPalForm() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslations();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For demonstration purposes, we'll simulate a PayPal failure
    // In a real application, you would handle the actual PayPal integration
    navigate('/payment-failed', {
      state: {
        errorDetails: {
          errorCode: 'PAYPAL_PROCESSING_ERROR',
          paymentMethod: 'paypal',
          errorMessage: t('checkout:paymentProcessingFailed'),
          courseId: new URLSearchParams(window.location.search).get('courseId')
        }
      }
    });
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit}>
        <h3 className="text-md font-medium mb-4">{t('checkout:paypalAccount')}</h3>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="paypalEmail">{t('checkout:paypalEmail')}</Label>
            <Input 
              id="paypalEmail" 
              type="email" 
              placeholder={t('checkout:enterPaypalEmail')} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full mt-2"
          >
            {t('checkout:payWithPaypal')}
          </Button>
        </div>
      </form>
    </Card>
  );
}
