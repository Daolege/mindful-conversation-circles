
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
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="w-full bg-white/80 backdrop-blur-md shadow-sm p-2 rounded-xl border border-gray-100">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-1 relative data-[state=active]:text-gray-900 data-[state=active]:shadow-none py-3"
              >
                {/* Static background for inactive states */}
                <div className="absolute inset-0 rounded-lg bg-gray-50/70"></div>
                
                {/* Active pill background */}
                {activeTab === tab.value && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-white rounded-lg shadow-[0_2px_10px_-2px_rgba(0,0,0,0.1)]"
                    initial={{ borderRadius: 12 }}
                    animate={{ borderRadius: 12 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 30,
                      layout: { duration: 0.3 }
                    }}
                  />
                )}

                {/* Text content with hover effects */}
                <motion.span
                  className="relative z-10 font-medium"
                  initial={false}
                  animate={{ 
                    scale: activeTab === tab.value ? 1.05 : 1,
                    fontWeight: activeTab === tab.value ? 600 : 400,
                  }}
                  whileHover={{ 
                    scale: activeTab === tab.value ? 1.05 : 1.02,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {tab.label}
                </motion.span>

                {/* Bottom highlight indicator for active tab */}
                {activeTab === tab.value && (
                  <motion.div
                    layoutId="activeBottomIndicator"
                    className="absolute bottom-1 left-0 right-0 mx-auto w-10 h-0.5 bg-gray-900/30"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 40 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      delay: 0.1 
                    }}
                  />
                )}

                {/* Subtle shine effect */}
                {activeTab === tab.value && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-lg pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 0.6, 0.3],
                      transition: { 
                        duration: 1.5, 
                        repeat: Infinity, 
                        repeatType: "reverse" 
                      }
                    }}
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
