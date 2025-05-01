
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
          <TabsList className="w-full bg-white/80 backdrop-blur-xl shadow-md p-1.5 rounded-2xl border border-gray-100">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-1 relative data-[state=active]:text-gray-900 data-[state=active]:shadow-none py-3.5"
              >
                {/* Inactive background with gradient */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gray-50/90 to-gray-100/60"></div>
                
                {/* Active pill background with subtle gradient and glow */}
                {activeTab === tab.value && (
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 bg-gradient-to-b from-white to-gray-50 rounded-xl shadow-[0_3px_15px_rgba(0,0,0,0.08)] border border-white/80"
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

                {/* Text content with enhanced hover effects */}
                <motion.span
                  className="relative z-10 font-medium"
                  initial={false}
                  animate={{ 
                    scale: activeTab === tab.value ? 1.05 : 1,
                    fontWeight: activeTab === tab.value ? 600 : 400,
                  }}
                  whileHover={{ 
                    scale: activeTab === tab.value ? 1.05 : 1.03,
                    transition: { duration: 0.2 }
                  }}
                >
                  {tab.label}
                </motion.span>

                {/* Bottom highlight indicator for active tab with gradient */}
                {activeTab === tab.value && (
                  <motion.div
                    layoutId="activeBottomIndicator"
                    className="absolute bottom-1.5 left-0 right-0 mx-auto w-12 h-0.5 bg-gradient-to-r from-gray-400/30 via-gray-700/40 to-gray-400/30 rounded-full"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 48 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      delay: 0.05 
                    }}
                  />
                )}

                {/* Enhanced shine effect */}
                {activeTab === tab.value && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent rounded-xl pointer-events-none overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div 
                      className="absolute inset-0 w-full h-full"
                      initial={{ 
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                        left: '-100%' 
                      }}
                      animate={{ 
                        left: '100%'
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        repeatDelay: 5,
                        duration: 1.5, 
                        ease: "easeInOut" 
                      }}
                    />
                  </motion.div>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>
    </div>
  );
}
