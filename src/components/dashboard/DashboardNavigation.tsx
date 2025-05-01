
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from 'react';

export function DashboardNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
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
    { value: 'courses', label: '我的课程' },
    { value: 'orders', label: '订单记录' },
    { value: 'subscriptions', label: '订阅记录' },
    { value: 'profile', label: '个人信息' }
  ];

  return (
    <div className="mb-8">
      <motion.div 
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-4 bg-white/80 backdrop-blur-xl shadow-sm p-1.5 rounded-2xl border border-gray-100">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="relative data-[state=active]:text-gray-900 data-[state=active]:shadow-none py-2.5"
                aria-label={tab.label}
              >
                {/* Active background with subtle gradient */}
                {activeTab === tab.value && (
                  <motion.div
                    layoutId="activeTabBackground"
                    className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-white/80"
                    initial={{ borderRadius: 12 }}
                    animate={{ borderRadius: 12 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Text content */}
                <span className="relative z-10 font-medium">
                  {tab.label}
                </span>

                {/* Bottom indicator for active tab */}
                {activeTab === tab.value && (
                  <motion.div
                    layoutId="activeBottomIndicator"
                    className="absolute bottom-1 left-0 right-0 mx-auto w-10 h-0.5 bg-gray-700 rounded-full"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 40 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>
    </div>
  );
}
