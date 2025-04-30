
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function PayPalForm() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // For demonstration purposes, we'll simulate a PayPal failure
    // In a real application, you would handle the actual PayPal integration
    navigate('/payment-failed', {
      state: {
        errorDetails: {
          errorCode: 'PAYPAL_PROCESSING_ERROR',
          paymentMethod: 'paypal',
          errorMessage: 'PayPal支付处理过程中出现错误，请重新尝试或选择其他支付方式。',
          courseId: new URLSearchParams(window.location.search).get('courseId')
        }
      }
    });
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit}>
        <h3 className="text-md font-medium mb-4">PayPal 账户</h3>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="paypalEmail">PayPal 邮箱</Label>
            <Input 
              id="paypalEmail" 
              type="email" 
              placeholder="your-email@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full mt-2"
          >
            通过 PayPal 支付
          </Button>
        </div>
      </form>
    </Card>
  );
}
