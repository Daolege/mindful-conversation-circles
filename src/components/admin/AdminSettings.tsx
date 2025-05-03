
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
          <TabsTrigger value="company">公司信息</TabsTrigger>
          <TabsTrigger value="legal">法律文档</TabsTrigger>
          <TabsTrigger value="payment">支付图标</TabsTrigger>
          <TabsTrigger value="exchange">汇率设置</TabsTrigger>
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
