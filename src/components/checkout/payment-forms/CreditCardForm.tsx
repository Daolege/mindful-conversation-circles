
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, ShieldAlert } from "lucide-react";

export function CreditCardForm() {
  const { t } = useTranslations();
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  return (
    <Card className="p-4">
      <h3 className="text-md font-medium mb-4">{t('checkout:creditCardInfo')}</h3>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="cardHolder">{t('checkout:cardholderName')}</Label>
          <Input 
            id="cardHolder" 
            placeholder={t('checkout:enterCardholderName')} 
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value)}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="cardNumber">{t('checkout:cardNumber')}</Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              id="cardNumber" 
              placeholder={t('checkout:enterCardNumber')} 
              className="pl-10"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="expiryDate">{t('checkout:expiryDate')}</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                id="expiryDate" 
                placeholder={t('checkout:enterExpiryDate')} 
                className="pl-10"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cvv">{t('checkout:securityCode')}</Label>
            <div className="relative">
              <ShieldAlert className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                id="cvv" 
                placeholder={t('checkout:enterSecurityCode')} 
                type="password"
                className="pl-10" 
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <Button type="button" className="w-full mt-2">
          {t('checkout:payNow')}
        </Button>
      </div>
    </Card>
  );
}
