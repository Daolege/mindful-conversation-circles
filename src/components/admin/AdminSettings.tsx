
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemSettings } from "./SystemSettings";
import ContactMethodsSettings from "./ContactMethodsSettings";

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState("system");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="system">系统设置</TabsTrigger>
          <TabsTrigger value="contact">联系方式</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system">
          <div className="space-y-6">
            <SystemSettings activeTab="home" />
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <ContactMethodsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
