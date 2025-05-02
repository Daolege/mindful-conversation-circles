
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslations } from "@/hooks/useTranslations";
import { Plus, Trash2, ArrowUp, ArrowDown, Loader2, Mail, Phone, MapPin } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ContactMethodsManagement = () => {
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contactMethods, setContactMethods] = useState([]);

  // Contact method types with icons
  const contactTypes = [
    { value: "email", label: "电子邮箱", icon: Mail },
    { value: "phone", label: "电话号码", icon: Phone },
    { value: "whatsapp", label: "WhatsApp", icon: Phone },
    { value: "address", label: "地址", icon: MapPin },
  ];

  // Load contact methods on component mount
  useEffect(() => {
    loadContactMethods();
  }, []);

  // Function to load contact methods from database
  const loadContactMethods = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_methods')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        throw error;
      }
      
      setContactMethods(data || []);
    } catch (error) {
      console.error("Error loading contact methods:", error);
      toast.error("加载联系方式失败");
    } finally {
      setIsLoading(false);
    }
  };

  // Add new contact method
  const addContactMethod = () => {
    setContactMethods([
      ...contactMethods,
      {
        id: `temp-${Date.now()}`,
        type: "email",
        label: "联系邮箱",
        value: "",
        is_active: true,
        display_order: contactMethods.length
      }
    ]);
  };

  // Remove contact method
  const removeContactMethod = (indexToRemove) => {
    setContactMethods(contactMethods.filter((_, index) => index !== indexToRemove));
  };

  // Move method up in order
  const moveMethodUp = (index) => {
    if (index === 0) return;
    const newMethods = [...contactMethods];
    [newMethods[index - 1], newMethods[index]] = [newMethods[index], newMethods[index - 1]];
    
    // Update display order
    newMethods.forEach((method, idx) => {
      method.display_order = idx;
    });
    
    setContactMethods(newMethods);
  };

  // Move method down in order
  const moveMethodDown = (index) => {
    if (index === contactMethods.length - 1) return;
    const newMethods = [...contactMethods];
    [newMethods[index], newMethods[index + 1]] = [newMethods[index + 1], newMethods[index]];
    
    // Update display order
    newMethods.forEach((method, idx) => {
      method.display_order = idx;
    });
    
    setContactMethods(newMethods);
  };

  // Handle input change
  const handleChange = (index, field, value) => {
    const newMethods = [...contactMethods];
    newMethods[index][field] = value;
    
    // Update label based on type if not explicitly set
    if (field === 'type' && (!newMethods[index].label || newMethods[index].label === '')) {
      const typeObj = contactTypes.find(t => t.value === value);
      if (typeObj) {
        newMethods[index].label = typeObj.label;
      }
    }
    
    setContactMethods(newMethods);
  };

  // Get icon component based on contact type
  const getIconForType = (type) => {
    const typeObj = contactTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : Mail;
  };

  // Save all contact methods
  const saveContactMethods = async () => {
    // Validate methods before saving
    for (const method of contactMethods) {
      if (!method.type || !method.value) {
        toast.error("所有字段都需要填写");
        return;
      }
    }
    
    setIsSaving(true);
    try {
      // First delete all existing methods
      await supabase.from('contact_methods').delete().not('id', 'is', null);
      
      // Then insert the new ones
      const { error } = await supabase
        .from('contact_methods')
        .upsert(
          contactMethods.map((method, index) => ({
            ...method,
            display_order: index,
            id: method.id && !method.id.startsWith('temp-') ? method.id : undefined
          }))
        );
      
      if (error) {
        throw error;
      }
      
      toast.success("联系方式已保存");
      loadContactMethods(); // Reload to get the real IDs
    } catch (error) {
      console.error("Error saving contact methods:", error);
      toast.error("保存联系方式失败");
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
        <CardTitle>联系方式管理</CardTitle>
        <CardDescription>管理网站底部显示的联系方式</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contactMethods.map((method, index) => {
            const IconComponent = getIconForType(method.type);
            
            return (
              <div key={method.id} className="p-4 border rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">联系方式 #{index + 1}</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => moveMethodUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => moveMethodDown(index)}
                      disabled={index === contactMethods.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => removeContactMethod(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`type-${index}`}>联系方式类型</Label>
                    <Select
                      value={method.type}
                      onValueChange={(value) => handleChange(index, 'type', value)}
                    >
                      <SelectTrigger id={`type-${index}`}>
                        <SelectValue placeholder="选择联系方式类型" />
                      </SelectTrigger>
                      <SelectContent>
                        {contactTypes.map((type) => {
                          const TypeIcon = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center">
                                <TypeIcon className="h-4 w-4 mr-2" />
                                {type.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`label-${index}`}>显示名称</Label>
                    <Input
                      id={`label-${index}`}
                      value={method.label}
                      onChange={(e) => handleChange(index, 'label', e.target.value)}
                      placeholder="例如: 联系邮箱, 客服电话"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`value-${index}`}>联系方式值</Label>
                  <div className="flex items-center space-x-2">
                    <IconComponent className="h-4 w-4 text-gray-400" />
                    <Input
                      id={`value-${index}`}
                      value={method.value}
                      onChange={(e) => handleChange(index, 'value', e.target.value)}
                      placeholder={method.type === 'email' ? 'example@domain.com' : method.type === 'phone' ? '+1234567890' : '联系方式值'}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {method.type === 'email' ? '邮箱地址将自动添加mailto:链接' : 
                     method.type === 'phone' ? '电话号码将自动添加tel:链接' : 
                     method.type === 'whatsapp' ? 'WhatsApp号码将自动添加WhatsApp链接' : 
                     '地址将显示为文本'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`active-${index}`}
                    checked={method.is_active}
                    onCheckedChange={(checked) => handleChange(index, 'is_active', checked)}
                  />
                  <Label htmlFor={`active-${index}`}>启用此联系方式</Label>
                </div>
              </div>
            );
          })}
          
          <Button 
            variant="outline" 
            onClick={addContactMethod}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" /> 添加联系方式
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button 
          onClick={saveContactMethods}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          {isSaving ? '保存中...' : '保存所有联系方式'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ContactMethodsManagement;
