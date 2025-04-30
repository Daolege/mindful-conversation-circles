
import React from 'react';
import { Card } from "@/components/ui/card";

export function WeChatPayForm() {
  return (
    <Card className="p-4">
      <h3 className="text-md font-medium mb-4">微信支付</h3>
      <div className="flex flex-col items-center">
        <p className="text-sm text-muted-foreground mb-4">请扫描二维码完成支付</p>
        <div className="h-64 w-64 bg-gray-100 flex items-center justify-center border">
          {/* Placeholder for QR code */}
          <img 
            src="/lovable-uploads/148b1149-2643-4e8c-b18a-658de84ead30.png" 
            alt="微信支付二维码" 
            className="w-48 h-48 object-contain"
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          打开微信扫一扫，扫描二维码完成支付
        </p>
      </div>
    </Card>
  );
}
