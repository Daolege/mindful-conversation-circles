
import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/hooks/useTranslations";

export function StripeForm() {
  const { t } = useTranslations();
  
  return (
    <Card className="p-4">
      <h3 className="text-md font-medium mb-4">{t('checkout:stripeAccount')}</h3>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="stripeUsername">{t('checkout:stripeUsername')}</Label>
          <Input 
            id="stripeUsername" 
            placeholder="your_username" 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stripePassword">{t('checkout:stripePassword')}</Label>
          <Input 
            id="stripePassword" 
            type="password" 
            placeholder="******" 
          />
        </div>
      </div>
    </Card>
  );
}
