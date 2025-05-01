
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export function DashboardNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') || 'courses';
  });

  // Track hover state for each tab
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab') || 'courses';
    setActiveTab(tab);
  }, [location.search]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
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
        transition={{ duration: 0.3 }}
        className="bg-white/90 backdrop-blur-md shadow-sm rounded-xl p-2"
      >
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="w-full flex justify-between bg-gray-100/80 p-2 rounded-lg">
            {tabs.map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className={`
                  flex-1 relative transition-all duration-300
                  ${activeTab === tab.value ? 'font-medium' : 'font-normal'}
                  hover:font-medium
                  hover:text-gray-800
                  active:scale-95
                  focus:outline-none
                  focus:ring-0
                `}
                onMouseEnter={() => setHoveredTab(tab.value)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                {/* Active indicator - converging shadow effect */}
                {activeTab === tab.value && (
                  <motion.div
                    className="absolute inset-0 rounded-md pointer-events-none overflow-hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Left to center gradient */}
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-knowledge-primary/5 to-transparent opacity-70"
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 0.7 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                    
                    {/* Bottom indicator line with animation */}
                    <motion.div 
                      className="absolute bottom-0 left-[10%] right-[10%] h-[3px] bg-gradient-to-r from-knowledge-primary/30 via-knowledge-primary to-knowledge-primary/30 rounded-t-full"
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    />
                  </motion.div>
                )}
                
                {/* Hover indicator (only when not active) */}
                {hoveredTab === tab.value && activeTab !== tab.value && (
                  <motion.div
                    className="absolute inset-0 rounded-md bg-gray-200/50 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                
                {/* Text with subtle transition */}
                <motion.span
                  className="relative z-10"
                  initial={false}
                  animate={{ 
                    scale: activeTab === tab.value ? 1.05 : 1,
                    fontWeight: activeTab === tab.value ? 500 : hoveredTab === tab.value ? 500 : 400
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {tab.label}
                </motion.span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>
    </div>
  );
}
