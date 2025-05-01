
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemSettings } from "./SystemSettings";
import ContactMethodsSettings from "./ContactMethodsSettings";
import { useTranslations } from "@/hooks/useTranslations";

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState("system");
  const { t } = useTranslations();

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="system">{t('admin:systemSettings')}</TabsTrigger>
          <TabsTrigger value="contact">{t('admin:contactMethods')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system">
          <div className="space-y-6">
            <SystemSettings />
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <ContactMethodsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
