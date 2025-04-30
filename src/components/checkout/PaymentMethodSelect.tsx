
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCardForm } from './payment-forms/CreditCardForm';
import { PayPalForm } from './payment-forms/PayPalForm';
import { StripeForm } from './payment-forms/StripeForm';
import { WeChatPayForm } from './payment-forms/WeChatPayForm';
import { CreditCard, Wallet, CreditCardIcon } from "lucide-react";

export type PaymentMethod = "wechat" | "paypal" | "stripe" | "credit-card" | "apple_pay" | "google_pay" | "alipay";

interface PaymentMethodSelectProps {
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
}

export function PaymentMethodSelect({ selectedMethod, onMethodChange }: PaymentMethodSelectProps) {
  const paymentMethods = [
    {
      id: 'credit-card',
      name: '信用卡支付',
      currency: 'USD',
      icon: '/lovable-uploads/37420a04-9adf-4a1d-b4d7-b70977391c53.png',
      alt: 'Credit Card'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      currency: 'USD',
      icon: '/lovable-uploads/6452670c-8710-4177-8456-3936eea64c1d.png',
      alt: 'PayPal'
    },
    {
      id: 'stripe',
      name: 'Stripe',
      currency: 'USD',
      icon: '/lovable-uploads/c2529a3e-ae24-4a84-8d08-21731ee81c2e.png',
      alt: 'Stripe'
    },
    {
      id: 'wechat',
      name: '微信支付', 
      currency: 'CNY',
      icon: '/lovable-uploads/8793137a-dcfb-409f-a3de-f330a902b9d2.png',
      alt: 'WeChat Pay'
    },
    {
      id: 'alipay',
      name: '支付宝',
      currency: 'CNY',
      icon: '/lovable-uploads/a185f0d9-1675-40b6-8d74-c0901ba42ca4.png',
      alt: 'Alipay'
    },
    {
      id: 'apple_pay',
      name: 'Apple Pay',
      currency: 'USD',
      icon: '/lovable-uploads/37420a04-9adf-4a1d-b4d7-b70977391c53.png',
      alt: 'Apple Pay'
    },
    {
      id: 'google_pay',
      name: 'Google Pay',
      currency: 'USD',
      icon: '/lovable-uploads/37420a04-9adf-4a1d-b4d7-b70977391c53.png',
      alt: 'Google Pay'
    }
  ];

  return (
    <Card className="p-4">
      <h2 className="text-xl font-semibold mb-4">选择支付方式</h2>
      <RadioGroup 
        value={selectedMethod} 
        onValueChange={(value) => onMethodChange(value as PaymentMethod)} 
        className="grid grid-cols-4 gap-3"
      >
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`
              flex flex-col items-center p-2 border rounded-10 cursor-pointer transition-all duration-300
              ${selectedMethod === method.id 
                ? "bg-black border-black" 
                : "hover:bg-gray-50 border-gray-200"
              }
            `}
            onClick={() => onMethodChange(method.id as PaymentMethod)}
          >
            <RadioGroupItem 
              value={method.id} 
              id={method.id}
              className={selectedMethod === method.id ? "border-white text-white" : ""}
              checked={selectedMethod === method.id}
              onClick={(e) => e.stopPropagation()}
            />
            <img 
              src={method.icon}
              alt={method.alt}
              className={`h-4 w-auto my-2 ${selectedMethod === method.id ? 'brightness-0 invert' : ''}`}
            />
            <Label 
              htmlFor={method.id} 
              className={`
                cursor-pointer text-center text-xs
                ${selectedMethod === method.id ? "text-white" : ""}
              `}
            >
              {method.name}
              <div className={`
                text-xs
                ${selectedMethod === method.id ? "text-gray-300" : "text-muted-foreground"}
              `}>
                {method.currency}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="mt-6">
        {selectedMethod === "credit-card" && <CreditCardForm />}
        {selectedMethod === "paypal" && <PayPalForm />}
        {selectedMethod === "stripe" && <StripeForm />}
        {selectedMethod === "wechat" && <WeChatPayForm />}
        {/* 其他支付方式的表单可以根据需要添加 */}
      </div>
    </Card>
  );
}
