
import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreditCardForm() {
  return (
    <Card className="p-4">
      <h3 className="text-md font-medium mb-4">信用卡信息</h3>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="cardHolder">持卡人姓名</Label>
          <Input id="cardHolder" placeholder="John Doe" />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="cardNumber">卡号</Label>
          <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="expiryDate">有效期</Label>
            <Input id="expiryDate" placeholder="MM/YY" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cvv">安全码</Label>
            <Input id="cvv" placeholder="123" type="password" />
          </div>
        </div>
      </div>
    </Card>
  );
}
