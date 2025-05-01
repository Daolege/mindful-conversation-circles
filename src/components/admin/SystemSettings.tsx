
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SystemSettingsProps {
  activeTab: string;
}

export function SystemSettings({ activeTab }: SystemSettingsProps) {
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState("home");

  useEffect(() => {
    loadSettings();
  }, []);

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

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardContent className="px-0 pt-4 pb-0">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="w-full grid grid-cols-6 mb-4">
              <TabsTrigger value="home">首页设置</TabsTrigger>
              <TabsTrigger value="courses">课程设置</TabsTrigger>
              <TabsTrigger value="subscriptions">订阅设置</TabsTrigger>
              <TabsTrigger value="orders">订单设置</TabsTrigger>
              <TabsTrigger value="features">功能设置</TabsTrigger>
              <TabsTrigger value="others">其他设置</TabsTrigger>
            </TabsList>

            <TabsContent value="home">
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

              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveSettings} disabled={loading}>
                  保存设置
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="courses">
              <Card>
                <CardHeader>
                  <CardTitle>课程设置</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">课程相关设置内容将显示在此处</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscriptions">
              <Card>
                <CardHeader>
                  <CardTitle>订阅设置</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">订阅相关设置内容将显示在此处</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>订单设置</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">订单相关设置内容将显示在此处</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features">
              <Card>
                <CardHeader>
                  <CardTitle>功能设置</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">功能相关设置内容将显示在此处</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="others">
              <Card>
                <CardHeader>
                  <CardTitle>其他设置</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">其他系统设置内容将显示在此处</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
