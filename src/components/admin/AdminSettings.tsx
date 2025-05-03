
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemSettings } from "./SystemSettings";
import { useTranslations } from "@/hooks/useTranslations";
import CompanyInfoSettings from "./CompanyInfoSettings";
import PaymentIconsManagement from "./PaymentIconsManagement";
import LegalDocumentsManagement from "./LegalDocumentsManagement";
import ExchangeRateSettings from "./ExchangeRateSettings";

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState("system");
  const { t } = useTranslations();

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="system">{t('admin:systemSettings')}</TabsTrigger>
          <TabsTrigger value="company">{t('admin:companyInfo')}</TabsTrigger>
          <TabsTrigger value="legal">{t('admin:legalDocuments')}</TabsTrigger>
          <TabsTrigger value="payment">{t('admin:paymentIcons')}</TabsTrigger>
          <TabsTrigger value="exchange">{t('admin:exchangeRates')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system">
          <div className="space-y-6">
            <SystemSettings />
          </div>
        </TabsContent>

        <TabsContent value="company">
          <div className="space-y-6">
            <CompanyInfoSettings />
          </div>
        </TabsContent>
        
        <TabsContent value="legal">
          <div className="space-y-6">
            <LegalDocumentsManagement />
          </div>
        </TabsContent>
        
        <TabsContent value="payment">
          <div className="space-y-6">
            <PaymentIconsManagement />
          </div>
        </TabsContent>
        
        <TabsContent value="exchange">
          <div className="space-y-6">
            <ExchangeRateSettings />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminSettings;
