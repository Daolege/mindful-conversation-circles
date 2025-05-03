
import React from 'react';
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/hooks/useTranslations";

export type PaymentPlan = "single" | "subscription";

interface PaymentPlanSelectProps {
  selectedPlan: PaymentPlan;
  onPlanChange: (plan: PaymentPlan) => void;
  disableSubscription?: boolean;
}

export function InternationalizedPaymentPlanSelect({ 
  selectedPlan, 
  onPlanChange,
  disableSubscription 
}: PaymentPlanSelectProps) {
  const { t } = useTranslations();
  
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">{t('checkout:selectPaymentPlan')}</h2>
      <RadioGroup
        value={selectedPlan}
        onValueChange={(value) => onPlanChange(value as PaymentPlan)}
        className="space-y-4"
      >
        <div 
          className={`
            flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all duration-300
            ${selectedPlan === "single" 
              ? "bg-black border-black" 
              : "hover:bg-gray-50 border-gray-200"
            }
          `}
          onClick={() => onPlanChange("single")}
        >
          <RadioGroupItem 
            value="single" 
            id="single" 
            className={selectedPlan === "single" ? "border-white text-white" : ""}
          />
          <Label 
            htmlFor="single" 
            className={`
              cursor-pointer
              ${selectedPlan === "single" ? "text-white" : ""}
            `}
          >
            <div className="font-medium">{t('checkout:singlePurchase')}</div>
            <p className={`
              text-sm 
              ${selectedPlan === "single" ? "text-gray-300" : "text-muted-foreground"}
            `}>
              {t('checkout:singlePurchaseDesc')}
            </p>
          </Label>
        </div>
        <div 
          className={`
            flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all duration-300
            ${selectedPlan === "subscription" 
              ? "bg-black border-black" 
              : "hover:bg-gray-50 border-gray-200"
            }
            ${disableSubscription ? "opacity-60 cursor-not-allowed" : ""}
          `}
          onClick={() => !disableSubscription && onPlanChange("subscription")}
        >
          <RadioGroupItem 
            value="subscription" 
            id="subscription" 
            className={selectedPlan === "subscription" ? "border-white text-white" : ""}
            disabled={disableSubscription}
          />
          <Label 
            htmlFor="subscription" 
            className={`
              cursor-pointer
              ${selectedPlan === "subscription" ? "text-white" : ""}
              ${disableSubscription ? "opacity-50" : ""}
            `}
          >
            <div className="font-medium">{t('checkout:subscription')}</div>
            <p className={`
              text-sm 
              ${selectedPlan === "subscription" ? "text-gray-300" : "text-muted-foreground"}
            `}>
              {t('checkout:subscriptionDesc')}
            </p>
            {disableSubscription && (
              <span className="text-xs text-gray-400 block">{t('checkout:subscriptionNotAvailable')}</span>
            )}
          </Label>
        </div>
      </RadioGroup>
    </Card>
  );
}
