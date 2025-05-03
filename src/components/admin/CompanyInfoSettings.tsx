
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslations } from "@/hooks/useTranslations";
import { Loader2, Building, Globe, FileText } from "lucide-react";
import { Tables } from '@/lib/supabase/database.types';

type SiteSettings = Tables<'site_settings'>;

const CompanyInfoSettings = () => {
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [companyInfo, setCompanyInfo] = useState<Partial<SiteSettings>>({
    company_name: '',
    company_full_name: '',
    company_registration_number: '',
    company_address: '',
    copyright_text: '',
    site_name: '',
    site_description: '',
    contact_email: '',
    support_phone: '',
    logo_url: ''
  });

  // Load company info on component mount
  useEffect(() => {
    loadCompanyInfo();
  }, []);

  // Function to load company info from database
  const loadCompanyInfo = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') { // No rows returned is OK for new sites
        throw error;
      }
      
      if (data) {
        setCompanyInfo({
          company_name: data.company_name || '',
          company_full_name: data.company_full_name || '',
          company_registration_number: data.company_registration_number || '',
          company_address: data.company_address || '',
          copyright_text: data.copyright_text || '',
          site_name: data.site_name || '',
          site_description: data.site_description || '',
          contact_email: data.contact_email || '',
          support_phone: data.support_phone || '',
          logo_url: data.logo_url || ''
        });
      }
    } catch (error) {
      console.error("Error loading company info:", error);
      toast.error("加载公司信息失败");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleChange = (field: keyof SiteSettings, value: string) => {
    setCompanyInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save company info
  const saveCompanyInfo = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 'default',
          ...companyInfo,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      toast.success("公司信息已保存");
    } catch (error) {
      console.error("Error saving company info:", error);
      toast.error("保存公司信息失败");
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
    <div className="space-y-6">
      {/* 公司信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" />
            公司信息设置
          </CardTitle>
          <CardDescription>
            设置您的公司信息，将显示在网站底部
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">公司名称</Label>
              <Input
                id="company_name"
                value={companyInfo.company_name || ''}
                onChange={(e) => handleChange('company_name', e.target.value)}
                placeholder="例如: SecondRise"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company_full_name">公司全称</Label>
              <Input
                id="company_full_name"
                value={companyInfo.company_full_name || ''}
                onChange={(e) => handleChange('company_full_name', e.target.value)}
                placeholder="例如: Mandarin (Hong Kong) International Limited"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_registration_number">公司注册号</Label>
              <Input
                id="company_registration_number"
                value={companyInfo.company_registration_number || ''}
                onChange={(e) => handleChange('company_registration_number', e.target.value)}
                placeholder="公司注册编号"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo_url">LOGO链接</Label>
              <Input
                id="logo_url"
                value={companyInfo.logo_url || ''}
                onChange={(e) => handleChange('logo_url', e.target.value)}
                placeholder="LOGO图片URL"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company_address">公司地址</Label>
            <Textarea
              id="company_address"
              value={companyInfo.company_address || ''}
              onChange={(e) => handleChange('company_address', e.target.value)}
              placeholder="公司注册地址"
              rows={2}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="copyright_text">版权信息</Label>
            <Input
              id="copyright_text"
              value={companyInfo.copyright_text || ''}
              onChange={(e) => handleChange('copyright_text', e.target.value)}
              placeholder="例如: © 2025 SecondRise. 版权所有"
            />
            <p className="text-sm text-gray-500">如果留空，将使用"© {new Date().getFullYear()} [公司名称]. [公司全称]. 版权所有"</p>
          </div>
        </CardContent>
      </Card>

      {/* 网站信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            网站基本信息
          </CardTitle>
          <CardDescription>
            设置网站基本信息，将显示在网站标题、描述和联系方式中
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">网站名称</Label>
              <Input
                id="site_name"
                value={companyInfo.site_name || ''}
                onChange={(e) => handleChange('site_name', e.target.value)}
                placeholder="网站名称"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="site_description">网站描述</Label>
              <Input
                id="site_description"
                value={companyInfo.site_description || ''}
                onChange={(e) => handleChange('site_description', e.target.value)}
                placeholder="简短描述网站内容"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">联系邮箱</Label>
              <Input
                id="contact_email"
                value={companyInfo.contact_email || ''}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="联系邮箱"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="support_phone">客服电话</Label>
              <Input
                id="support_phone"
                value={companyInfo.support_phone || ''}
                onChange={(e) => handleChange('support_phone', e.target.value)}
                placeholder="客服电话"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button 
          onClick={saveCompanyInfo}
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
          {isSaving ? '保存中...' : '保存所有公司和网站信息'}
        </Button>
      </div>
    </div>
  );
};

export default CompanyInfoSettings;
