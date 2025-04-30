
import React from 'react';
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type PaymentPlan = "single" | "subscription";

interface PaymentPlanSelectProps {
  selectedPlan: PaymentPlan;
  onPlanChange: (plan: PaymentPlan) => void;
}

export function PaymentPlanSelect({ selectedPlan, onPlanChange }: PaymentPlanSelectProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">选择支付方案</h2>
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
            <div className="font-medium">单次购买</div>
            <p className={`
              text-sm 
              ${selectedPlan === "single" ? "text-gray-300" : "text-muted-foreground"}
            `}>
              一次性付款，永久访问内容
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
          `}
          onClick={() => onPlanChange("subscription")}
        >
          <RadioGroupItem 
            value="subscription" 
            id="subscription" 
            className={selectedPlan === "subscription" ? "border-white text-white" : ""}
          />
          <Label 
            htmlFor="subscription" 
            className={`
              cursor-pointer
              ${selectedPlan === "subscription" ? "text-white" : ""}
            `}
          >
            <div className="font-medium">订阅计划</div>
            <p className={`
              text-sm 
              ${selectedPlan === "subscription" ? "text-gray-300" : "text-muted-foreground"}
            `}>
              按月/季/年付费，更多优惠
            </p>
          </Label>
        </div>
      </RadioGroup>
    </Card>
  );
}
