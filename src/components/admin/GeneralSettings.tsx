
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTranslations } from "@/hooks/useTranslations";
import { Loader2, Settings, Image } from "lucide-react";
import { getSiteSettings, updateSiteSettings } from '@/lib/services/siteSettingsService';
import { LogoUpload } from './LogoUpload';

const GeneralSettings = () => {
  const { t } = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [siteInfo, setSiteInfo] = useState({
    id: '',
    site_name: '',
    site_description: '',
    logo_url: ''
  });

  // Load site settings on component mount
  useEffect(() => {
    loadSiteSettings();
  }, []);

  // Function to load site settings from database
  const loadSiteSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await getSiteSettings();
      
      if (settings) {
        setSiteInfo({
          id: settings.id || '',
          site_name: settings.site_name || '',
          site_description: settings.site_description || '',
          logo_url: settings.logo_url || ''
        });
      }
    } catch (error) {
      console.error("Error loading site settings:", error);
      toast.error(t('errors:loadingFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleChange = (field: string, value: string) => {
    setSiteInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle logo update
  const handleLogoUpdate = (url: string) => {
    setSiteInfo(prev => ({
      ...prev,
      logo_url: url
    }));
  };

  // Save site settings
  const saveSiteSettings = async () => {
    setIsSaving(true);
    try {
      const success = await updateSiteSettings({
        id: siteInfo.id || 'default',
        site_name: siteInfo.site_name,
        site_description: siteInfo.site_description,
        logo_url: siteInfo.logo_url,
        updated_at: new Date().toISOString()
      });
      
      if (success) {
        toast.success(t('admin:settingsSaved'));
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving site settings:", error);
      toast.error(t('errors:savingFailed'));
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            {t('admin:generalSettings')}
          </CardTitle>
          <CardDescription>
            {t('admin:platformAppearance')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <Label htmlFor="site_name">{t('admin:platformName')}</Label>
            <Input
              id="site_name"
              value={siteInfo.site_name}
              onChange={(e) => handleChange('site_name', e.target.value)}
              placeholder={t('admin:platformNamePlaceholder')}
              className="max-w-md"
            />
          </div>
          
          <div className="space-y-4">
            <Label htmlFor="site_description">{t('admin:platformDescription')}</Label>
            <Input
              id="site_description"
              value={siteInfo.site_description}
              onChange={(e) => handleChange('site_description', e.target.value)}
              placeholder={t('admin:platformDescriptionPlaceholder')}
              className="max-w-md"
            />
          </div>
          
          <div className="space-y-4 pt-2">
            <Label>{t('admin:platformLogo')}</Label>
            <LogoUpload 
              currentLogoUrl={siteInfo.logo_url} 
              onLogoUpdate={handleLogoUpdate} 
            />
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={saveSiteSettings}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {isSaving ? t('admin:saving') : t('admin:saveSettings')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings;
