
import React from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function StripeForm() {
  return (
    <Card className="p-4">
      <h3 className="text-md font-medium mb-4">Stripe 账户</h3>
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="stripeUsername">Stripe 账户名</Label>
          <Input 
            id="stripeUsername" 
            placeholder="your_username" 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="stripePassword">Stripe 密码</Label>
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
