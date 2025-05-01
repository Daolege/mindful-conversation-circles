
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getSiteSettings, updateSiteSettings } from "@/lib/services/siteSettingsService";
import { SiteSetting } from "@/lib/types/course-new";
import { useTranslations } from '@/hooks/useTranslations';
import { LanguageManagement } from './LanguageManagement';
import { TranslationEditor } from './TranslationEditor';

const ExchangeRateSettings = () => {
  const { t } = useTranslations();
  const [exchangeRate, setExchangeRate] = useState<number>(7.23);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load exchange rate from local storage or default value
    const storedRate = localStorage.getItem('exchangeRate');
    if (storedRate) {
      setExchangeRate(parseFloat(storedRate));
    }
  }, []);

  const handleExchangeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    if (!isNaN(newRate)) {
      setExchangeRate(newRate);
    }
  };

  const handleSaveExchangeRate = () => {
    localStorage.setItem('exchangeRate', exchangeRate.toString());
    toast.success(t('admin:settings') + ': ' + t('actions:save'));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>汇率设置</CardTitle>
        <CardDescription>设置人民币兑美元的汇率</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="exchangeRate">人民币/美元</Label>
          <Input
            type="number"
            id="exchangeRate"
            value={exchangeRate}
            onChange={handleExchangeRateChange}
          />
        </div>
        <Button onClick={handleSaveExchangeRate} disabled={isSaving}>
          {isSaving ? t('actions:loading') : t('actions:save')}
        </Button>
      </CardContent>
    </Card>
  );
};

const ContactMethodsSettings = () => {
  const { t } = useTranslations();
  const [siteSettings, setSiteSettings] = useState<SiteSetting>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getSiteSettings();
      setSiteSettings(settings);
    };

    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSiteSettings(prevSettings => ({
      ...prevSettings,
      [name]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const success = await updateSiteSettings(siteSettings);
      if (success) {
        toast.success(t('admin:settings') + ': ' + t('actions:save'));
      } else {
        toast.error(t('errors:general'));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>联系方式设置</CardTitle>
        <CardDescription>设置网站的联系方式</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="supportPhone">客服电话</Label>
          <Input
            type="text"
            id="supportPhone"
            name="support_phone"
            value={siteSettings.support_phone || ''}
            onChange={handleInputChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactEmail">联系邮箱</Label>
          <Input
            type="email"
            id="contactEmail"
            name="contact_email"
            value={siteSettings.contact_email || ''}
            onChange={handleInputChange}
          />
        </div>
        <Button onClick={handleSaveSettings} disabled={isSaving}>
          {isSaving ? t('actions:loading') : t('actions:save')}
        </Button>
      </CardContent>
    </Card>
  );
};

export const SystemSettings = () => {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('admin:systemSettings')}</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">{t('admin:general')}</TabsTrigger>
          <TabsTrigger value="languages">{t('admin:languages')}</TabsTrigger>
          <TabsTrigger value="translations">{t('admin:translations')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExchangeRateSettings />
            <ContactMethodsSettings />
          </div>
        </TabsContent>
        
        <TabsContent value="languages">
          <LanguageManagement />
        </TabsContent>
        
        <TabsContent value="translations">
          <TranslationEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
};
