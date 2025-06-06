
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from '@/hooks/useTranslations';

export function DashboardNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [activeTab, setActiveTab] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') || 'courses';
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab') || 'courses';
    setActiveTab(tab);
  }, [location.search]);

  const handleTabChange = (value: string) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', value);
    navigate(`/dashboard?${searchParams.toString()}`);
  };

  // Tabs data for easier management
  const tabs = [
    { value: 'courses', label: t('navigation:allCourses') },
    { value: 'orders', label: t('checkout:orderDetails') },
    { value: 'subscriptions', label: t('admin:subscriptionsManagement') },
    { value: 'profile', label: t('navigation:accountManagement') }
  ];

  // Match the same animation variants from Admin.tsx
  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeInOut" 
      }
    },
    exit: { 
      opacity: 0,
      y: -10,
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="mb-8">
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="w-full flex flex-wrap justify-start gap-2 bg-gray-50/90 p-3 border border-gray-200 rounded-2xl shadow-sm">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex-1 px-6 py-3.5 text-sm font-medium min-w-[120px] relative overflow-hidden"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
