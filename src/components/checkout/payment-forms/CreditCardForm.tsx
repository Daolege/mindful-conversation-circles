
import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/hooks/useTranslations";

export function CreditCardForm() {
  const { t } = useTranslations();
  
  return (
    <Card className="p-4">
      <h3 className="text-md font-medium mb-4">{t('checkout:creditCardInfo')}</h3>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="cardHolder">{t('checkout:cardholderName')}</Label>
          <Input id="cardHolder" placeholder={t('checkout:enterCardholderName')} />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="cardNumber">{t('checkout:cardNumber')}</Label>
          <Input id="cardNumber" placeholder={t('checkout:enterCardNumber')} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="expiryDate">{t('checkout:expiryDate')}</Label>
            <Input id="expiryDate" placeholder={t('checkout:enterExpiryDate')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cvv">{t('checkout:securityCode')}</Label>
            <Input id="cvv" placeholder={t('checkout:enterSecurityCode')} type="password" />
          </div>
        </div>
      </div>
    </Card>
  );
}
