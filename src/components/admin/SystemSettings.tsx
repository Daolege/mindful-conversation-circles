
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "@/hooks/useTranslations";
import { LanguageManagement } from './LanguageManagement';
import { TranslationEditor } from './TranslationEditor';
import ExchangeRateSettings from './ExchangeRateSettings';
import CompanyInfoSettings from './CompanyInfoSettings';
import ContactMethodsManagement from './ContactMethodsManagement';
import SocialMediaManagement from './SocialMediaManagement';
import PaymentIconsManagement from './PaymentIconsManagement';
import LegalDocumentsManagement from './LegalDocumentsManagement';
import MultilangFAQManagement from './MultilangFAQManagement';

export const SystemSettings = () => {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('admin:systemSettings')}</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="general">基本设置</TabsTrigger>
          <TabsTrigger value="company">公司信息</TabsTrigger>
          <TabsTrigger value="contact">联系方式</TabsTrigger>
          <TabsTrigger value="social">社交媒体</TabsTrigger>
          <TabsTrigger value="payment">支付图标</TabsTrigger>
          <TabsTrigger value="legal">法律文档</TabsTrigger>
          <TabsTrigger value="faq">常见问题</TabsTrigger>
          <TabsTrigger value="languages">语言设置</TabsTrigger>
          <TabsTrigger value="translations">翻译管理</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <ExchangeRateSettings />
        </TabsContent>

        <TabsContent value="company">
          <CompanyInfoSettings />
        </TabsContent>
        
        <TabsContent value="contact">
          <ContactMethodsManagement />
        </TabsContent>

        <TabsContent value="social">
          <SocialMediaManagement />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentIconsManagement />
        </TabsContent>

        <TabsContent value="legal">
          <LegalDocumentsManagement />
        </TabsContent>

        <TabsContent value="faq">
          <MultilangFAQManagement />
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

export default SystemSettings;
