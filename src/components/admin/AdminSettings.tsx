
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemSettings } from "./SystemSettings";
import ContactMethodsSettings from "./ContactMethodsSettings";
import { Home, Book, FileText, ShoppingCart, Settings as SettingsIcon, Bookmark, PanelLeft } from "lucide-react";

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState("system");
  const [activeSettingsTab, setActiveSettingsTab] = useState("home");

  const settingsTabs = [
    { id: "home", label: "首页设置", icon: Home },
    { id: "courses", label: "课程设置", icon: Book },
    { id: "subscription", label: "订阅设置", icon: Bookmark },
    { id: "orders", label: "订单设置", icon: ShoppingCart },
    { id: "features", label: "功能设置", icon: PanelLeft },
    { id: "other", label: "其他设置", icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="system">系统设置</TabsTrigger>
          <TabsTrigger value="contact">联系方式</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system">
          <div className="space-y-6">
            <div className="bg-white p-1 rounded-xl shadow-sm border">
              <Tabs 
                value={activeSettingsTab} 
                onValueChange={setActiveSettingsTab}
                className="w-full"
              >
                <TabsList className="w-full flex flex-wrap justify-start gap-1 bg-muted/20 p-1 rounded-lg">
                  {settingsTabs.map((tab) => (
                    <TabsTrigger 
                      key={tab.id}
                      value={tab.id} 
                      className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-white"
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <div className="mt-4">
                  <SystemSettings activeTab={activeSettingsTab} />
                </div>
              </Tabs>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact">
          <ContactMethodsSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
