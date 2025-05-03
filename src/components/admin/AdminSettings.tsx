
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "@/hooks/useTranslations";
import CompanyInfoSettings from "./CompanyInfoSettings";
import PaymentIconsManagement from "./PaymentIconsManagement";
import LegalDocumentsManagement from "./LegalDocumentsManagement";
import ExchangeRateSettings from "./ExchangeRateSettings";
import BannerManagement from "./BannerManagement";
import AdminBreadcrumb from "./AdminBreadcrumb";
import ContactMethodsManagement from "./ContactMethodsManagement";
import SocialMediaManagement from "./SocialMediaManagement";
import MultilangFAQManagement from "./MultilangFAQManagement";
import { LanguageManagement } from './LanguageManagement';
import { TranslationEditor } from './TranslationEditor';
import GeneralSettings from "./GeneralSettings";

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const { t } = useTranslations();

  return (
    <div className="space-y-6">
      <AdminBreadcrumb section="settings" subsection={t(`admin:${activeTab}Settings`)} />
      
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        {t('admin:systemSettings')}
      </h2>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 bg-gray-100/80 p-1.5 border border-gray-200 rounded-xl shadow-sm">
          <TabsTrigger className="px-4 py-2 text-sm" value="general">{t('admin:generalSettings')}</TabsTrigger>
          <TabsTrigger className="px-4 py-2 text-sm" value="company">{t('admin:companyInfo')}</TabsTrigger>
          <TabsTrigger className="px-4 py-2 text-sm" value="contact">{t('admin:contactMethods')}</TabsTrigger>
          <TabsTrigger className="px-4 py-2 text-sm" value="social">{t('admin:socialMedia')}</TabsTrigger>
          <TabsTrigger className="px-4 py-2 text-sm" value="payment">{t('admin:paymentIcons')}</TabsTrigger>
          <TabsTrigger className="px-4 py-2 text-sm" value="legal">{t('admin:legalDocuments')}</TabsTrigger>
          <TabsTrigger className="px-4 py-2 text-sm" value="faq">{t('admin:faq')}</TabsTrigger>
          <TabsTrigger className="px-4 py-2 text-sm" value="exchange">{t('admin:exchangeRates')}</TabsTrigger>
          <TabsTrigger className="px-4 py-2 text-sm" value="banners">{t('home:bannerManagement')}</TabsTrigger>
          <TabsTrigger className="px-4 py-2 text-sm" value="languages">{t('admin:languageManagement')}</TabsTrigger>
          <TabsTrigger className="px-4 py-2 text-sm" value="translations">{t('admin:translationEditor')}</TabsTrigger>
        </TabsList>
        
        <div className="p-6 border rounded-lg bg-white shadow-sm">
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
          
          <TabsContent value="banners">
            <BannerManagement />
          </TabsContent>
          
          <TabsContent value="languages">
            <LanguageManagement />
          </TabsContent>
          
          <TabsContent value="translations">
            <TranslationEditor />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default AdminSettings;
