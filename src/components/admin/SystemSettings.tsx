import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Book, Bookmark, ShoppingCart, PanelLeft, FileText } from "lucide-react";

interface SystemSettingsProps {
  activeTab: string;
}

export function SystemSettings({ activeTab }: SystemSettingsProps) {
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeSettingTab, setActiveSettingTab] = useState(activeTab || "home");

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setActiveSettingTab(activeTab);
  }, [activeTab]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // Load site settings
      const { data, error } = await supabase
        .from('site_settings')
        .select('site_name, site_description')
        .single();

      if (error) throw error;

      if (data) {
        setSiteName(data.site_name);
        setSiteDescription(data.site_description);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
      toast.error('加载设置失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      // Save site settings
      const { error } = await supabase
        .from('site_settings')
        .update({ 
          site_name: siteName, 
          site_description: siteDescription 
        })
        .eq('id', '1');

      if (error) throw error;

      toast.success('设置已保存');
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  // Define the settings tabs
  const settingsTabs = [
    { id: "home", label: "首页设置", icon: Home },
    { id: "courses", label: "课程设置", icon: Book },
    { id: "subscription", label: "订阅设置", icon: Bookmark },
    { id: "orders", label: "订单设置", icon: ShoppingCart },
    { id: "features", label: "功能设置", icon: PanelLeft },
    { id: "other", label: "其他设置", icon: FileText },
  ];

  // Render content for each tab
  const renderContent = () => {
    switch (activeSettingTab) {
      case "home":
        return (
          <Card>
            <CardHeader>
              <CardTitle>站点信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="siteName">站点名称</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="siteDescription">站点描述</Label>
                  <Input
                    id="siteDescription"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      case "courses":
        return (
          <Card>
            <CardHeader>
              <CardTitle>课程设置</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">课程相关设置内容将在此显示</p>
            </CardContent>
          </Card>
        );
      case "subscription":
        return (
          <Card>
            <CardHeader>
              <CardTitle>订阅设置</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">订阅相关设置内容将在此显示</p>
            </CardContent>
          </Card>
        );
      case "orders":
        return (
          <Card>
            <CardHeader>
              <CardTitle>订单设置</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">订单相关设置内容将在此显示</p>
            </CardContent>
          </Card>
        );
      case "features":
        return (
          <Card>
            <CardHeader>
              <CardTitle>功能设置</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">功能相关设置内容将在此显示</p>
            </CardContent>
          </Card>
        );
      case "other":
        return (
          <Card>
            <CardHeader>
              <CardTitle>其他设置</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">其他相关设置内容将在此显示</p>
            </CardContent>
          </Card>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>站点信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="siteName">站点名称</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="siteDescription">站点描述</Label>
                  <Input
                    id="siteDescription"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4">
          <div className="grid grid-cols-6 gap-0">
            {settingsTabs.map((tab) => (
              <div 
                key={tab.id}
                onClick={() => setActiveSettingTab(tab.id)}
                className={`flex flex-col items-center justify-center p-4 cursor-pointer transition-all
                           ${activeSettingTab === tab.id ? 'text-gray-900' : 'text-gray-500'}`}
              >
                <tab.icon className={`h-5 w-5 mb-2 ${activeSettingTab === tab.id ? 'text-primary' : 'text-gray-400'}`} />
                <span className="text-sm font-medium">{tab.label}</span>
              </div>
            ))}
          </div>
        </div>
          
        <div className="mt-4 p-4">
          {renderContent()}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading}>
          保存设置
        </Button>
      </div>
    </div>
  );
}
