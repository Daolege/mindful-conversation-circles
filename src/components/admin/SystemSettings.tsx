
import React, { useState, useEffect } from "react";
import { getSiteSettings, updateSiteSettings } from "@/lib/services/siteSettingsService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SiteSetting } from "@/lib/types/course-new";

export interface SystemSettingsProps {
  activeTab?: string;
}

export const SystemSettings = ({ activeTab }: SystemSettingsProps) => {
  const [settings, setSettings] = useState<SiteSetting>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const siteSettings = await getSiteSettings();
        if (siteSettings) {
          setSettings(siteSettings);
        }
      } catch (error) {
        console.error("Error loading site settings:", error);
        toast.error("加载设置失败");
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSiteSettings(settings);
      toast.success("设置已保存");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("保存设置失败");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">加载设置...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">系统设置</CardTitle>
          <CardDescription>配置网站的基本设置和功能</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_name">网站名称</Label>
            <Input
              id="site_name"
              value={settings.site_name || ""}
              onChange={(e) => handleChange("site_name", e.target.value)}
              placeholder="输入网站名称"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="site_description">网站描述</Label>
            <Textarea
              id="site_description"
              value={settings.site_description || ""}
              onChange={(e) => handleChange("site_description", e.target.value)}
              placeholder="输入简短的网站描述"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">联系邮箱</Label>
            <Input
              id="contact_email"
              type="email"
              value={settings.contact_email || ""}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              placeholder="name@example.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="support_phone">支持电话</Label>
            <Input
              id="support_phone"
              value={settings.support_phone || ""}
              onChange={(e) => handleChange("support_phone", e.target.value)}
              placeholder="+86 123 4567 8901"
            />
          </div>

          <div className="flex items-center justify-between space-x-2 pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance">维护模式</Label>
              <div className="text-sm text-muted-foreground">
                启用后，网站将显示维护页面
              </div>
            </div>
            <Switch
              id="maintenance"
              checked={settings.maintenance_mode || false}
              onCheckedChange={(checked) => handleChange("maintenance_mode", checked)}
            />
          </div>

          <div className="flex items-center justify-between space-x-2 pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="registration">开放注册</Label>
              <div className="text-sm text-muted-foreground">
                允许新用户注册账号
              </div>
            </div>
            <Switch
              id="registration"
              checked={settings.enable_registration !== false}
              onCheckedChange={(checked) => handleChange("enable_registration", checked)}
            />
          </div>

          <div className="pt-4 text-right">
            <Button
              onClick={handleSave}
              className="w-24"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中
                </>
              ) : (
                "保存"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
