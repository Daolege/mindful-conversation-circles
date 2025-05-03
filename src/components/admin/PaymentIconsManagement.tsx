
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslations } from "@/hooks/useTranslations";
import { Plus, Trash2, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const PaymentIconsManagement = () => {
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [paymentIcons, setPaymentIcons] = useState([]);

  // Load payment icons on component mount
  useEffect(() => {
    loadPaymentIcons();
  }, []);

  // Function to load payment icons from database
  const loadPaymentIcons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_icons')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setPaymentIcons(data || []);
    } catch (error) {
      console.error("Error loading payment icons:", error);
      toast.error("加载支付图标失败");
    } finally {
      setIsLoading(false);
    }
  };

  // Add new payment icon
  const addPaymentIcon = () => {
    setPaymentIcons([
      ...paymentIcons,
      {
        id: `temp-${Date.now()}`,
        name: '',
        icon_url: '',
        is_active: true,
        display_order: paymentIcons.length
      }
    ]);
  };

  // Remove payment icon
  const removePaymentIcon = (indexToRemove) => {
    setPaymentIcons(paymentIcons.filter((_, index) => index !== indexToRemove));
  };

  // Move icon up in order
  const moveIconUp = (index) => {
    if (index === 0) return;
    const newIcons = [...paymentIcons];
    [newIcons[index - 1], newIcons[index]] = [newIcons[index], newIcons[index - 1]];
    
    // Update display order
    newIcons.forEach((icon, idx) => {
      icon.display_order = idx;
    });
    
    setPaymentIcons(newIcons);
  };

  // Move icon down in order
  const moveIconDown = (index) => {
    if (index === paymentIcons.length - 1) return;
    const newIcons = [...paymentIcons];
    [newIcons[index], newIcons[index + 1]] = [newIcons[index + 1], newIcons[index]];
    
    // Update display order
    newIcons.forEach((icon, idx) => {
      icon.display_order = idx;
    });
    
    setPaymentIcons(newIcons);
  };

  // Handle input change
  const handleChange = (index, field, value) => {
    const newIcons = [...paymentIcons];
    newIcons[index][field] = value;
    setPaymentIcons(newIcons);
  };

  // Save all payment icons
  const savePaymentIcons = async () => {
    // Validate icons before saving
    for (const icon of paymentIcons) {
      if (!icon.name || !icon.icon_url) {
        toast.error("所有字段都需要填写");
        return;
      }
    }
    
    setIsSaving(true);
    try {
      // First delete all existing icons
      await supabase.from('payment_icons').delete().not('id', 'is', null);
      
      // Then insert the new ones
      const { error } = await supabase
        .from('payment_icons')
        .insert(
          paymentIcons.map((icon, index) => ({
            ...icon,
            display_order: index,
            id: icon.id && !icon.id.startsWith('temp-') ? icon.id : undefined
          }))
        );
      
      if (error) {
        throw error;
      }
      
      toast.success("支付图标已保存");
      loadPaymentIcons(); // Reload to get the real IDs
    } catch (error) {
      console.error("Error saving payment icons:", error);
      toast.error("保存支付图标失败");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>支付方式图标管理</CardTitle>
        <CardDescription>管理网站底部显示的支付方式图标</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentIcons.map((icon, index) => (
            <div key={icon.id} className="p-4 border rounded-md space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">支付图标 #{index + 1}</h3>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => moveIconUp(index)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => moveIconDown(index)}
                    disabled={index === paymentIcons.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => removePaymentIcon(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`}>支付方式名称</Label>
                  <Input
                    id={`name-${index}`}
                    value={icon.name}
                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                    placeholder="例如: Visa, MasterCard"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`icon-${index}`}>图标URL</Label>
                  <Input
                    id={`icon-${index}`}
                    value={icon.icon_url}
                    onChange={(e) => handleChange(index, 'icon_url', e.target.value)}
                    placeholder="图标图片URL地址"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id={`active-${index}`}
                  checked={icon.is_active}
                  onCheckedChange={(checked) => handleChange(index, 'is_active', checked)}
                />
                <Label htmlFor={`active-${index}`}>启用此支付图标</Label>
              </div>
              
              {icon.icon_url && (
                <div className="mt-2">
                  <Label>预览图标:</Label>
                  <div className="mt-1 p-2 border rounded bg-gray-50 flex items-center">
                    <img src={icon.icon_url} alt={icon.name} className="h-8 w-8 object-contain" />
                    <span className="ml-2 text-sm text-gray-500">
                      {icon.name} {icon.is_active ? '(已启用)' : '(已禁用)'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <Button 
            variant="outline" 
            onClick={addPaymentIcon}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" /> 添加支付图标
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button 
          onClick={savePaymentIcons}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {isSaving ? '保存中...' : '保存所有支付图标'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentIconsManagement;
