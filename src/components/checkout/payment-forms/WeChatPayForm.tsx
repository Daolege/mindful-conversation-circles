
import React from 'react';
import { Card } from "@/components/ui/card";
import { useTranslations } from "@/hooks/useTranslations";

export function WeChatPayForm() {
  const { t } = useTranslations();
  
  return (
    <Card className="p-4">
      <h3 className="text-md font-medium mb-4">{t('checkout:wechatPay')}</h3>
      <div className="flex flex-col items-center">
        <p className="text-sm text-muted-foreground mb-4">{t('checkout:scanQRCode')}</p>
        <div className="h-64 w-64 bg-gray-100 flex items-center justify-center border">
          {/* Placeholder for QR code */}
          <img 
            src="/lovable-uploads/148b1149-2643-4e8c-b18a-658de84ead30.png" 
            alt={t('checkout:wechatPayQRCode')} 
            className="w-48 h-48 object-contain"
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {t('checkout:openWechatScan')}
        </p>
      </div>
    </Card>
  );
}
