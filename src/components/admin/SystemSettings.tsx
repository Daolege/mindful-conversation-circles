
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
          <TabsTrigger value="general">{t('admin:generalSettings')}</TabsTrigger>
          <TabsTrigger value="company">{t('admin:companyInfo')}</TabsTrigger>
          <TabsTrigger value="contact">{t('admin:contactMethods')}</TabsTrigger>
          <TabsTrigger value="social">{t('admin:socialMedia')}</TabsTrigger>
          <TabsTrigger value="payment">{t('admin:paymentIcons')}</TabsTrigger>
          <TabsTrigger value="legal">{t('admin:legalDocuments')}</TabsTrigger>
          <TabsTrigger value="faq">{t('admin:faq')}</TabsTrigger>
          <TabsTrigger value="languages">{t('admin:languageManagement')}</TabsTrigger>
          <TabsTrigger value="translations">{t('admin:translationEditor')}</TabsTrigger>
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
