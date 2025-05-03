
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { CreditCard, Lock } from "lucide-react";

export function StripeForm() {
  const { t } = useTranslations();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  return (
    <Card className="p-4">
      <h3 className="text-md font-medium mb-4">{t('checkout:stripeAccount')}</h3>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="stripeUsername">{t('checkout:stripeUsername')}</Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              id="stripeUsername" 
              placeholder={t('checkout:enterStripeUsername')}
              className="pl-10"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stripePassword">{t('checkout:stripePassword')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              id="stripePassword" 
              type="password" 
              placeholder={t('checkout:enterStripePassword')} 
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <Button type="button" className="w-full mt-2">
          {t('checkout:continueWithStripe')}
        </Button>
      </div>
    </Card>
  );
}
