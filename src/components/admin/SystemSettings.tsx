
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
import { ScrollArea } from "@/components/ui/scroll-area";
import GeneralSettings from './GeneralSettings';

export const SystemSettings = () => {
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">{t('admin:systemSettings')}</h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="relative">
          <ScrollArea className="pb-4 w-full">
            <div className="flex overflow-x-auto">
              <TabsList className="mb-6 inline-flex space-x-1 p-1 bg-gray-100/80 rounded-xl">
                <TabsTrigger className="px-3 py-1.5" value="general">{t('admin:generalSettings')}</TabsTrigger>
                <TabsTrigger className="px-3 py-1.5" value="company">{t('admin:companyInfo')}</TabsTrigger>
                <TabsTrigger className="px-3 py-1.5" value="contact">{t('admin:contactMethods')}</TabsTrigger>
                <TabsTrigger className="px-3 py-1.5" value="social">{t('admin:socialMedia')}</TabsTrigger>
                <TabsTrigger className="px-3 py-1.5" value="payment">{t('admin:paymentIcons')}</TabsTrigger>
                <TabsTrigger className="px-3 py-1.5" value="legal">{t('admin:legalDocuments')}</TabsTrigger>
                <TabsTrigger className="px-3 py-1.5" value="faq">{t('admin:faq')}</TabsTrigger>
                <TabsTrigger className="px-3 py-1.5" value="exchange">{t('admin:exchangeRates')}</TabsTrigger>
                <TabsTrigger className="px-3 py-1.5" value="languages">{t('admin:languageManagement')}</TabsTrigger>
                <TabsTrigger className="px-3 py-1.5" value="translations">{t('admin:translationEditor')}</TabsTrigger>
              </TabsList>
            </div>
          </ScrollArea>
        </div>
        
        <TabsContent value="general">
          <GeneralSettings />
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
        
        <TabsContent value="exchange">
          <ExchangeRateSettings />
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
