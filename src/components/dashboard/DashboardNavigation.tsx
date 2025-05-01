
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";

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
        className="bg-white/90 backdrop-blur-md shadow-sm rounded-xl p-1"
      >
        <nav className="flex overflow-x-auto hide-scrollbar">
          <div className="flex w-full bg-gray-50/80 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`
                  relative flex-1 py-3 px-4 text-sm md:text-base rounded-md transition-all duration-300
                  ${activeTab === tab.value 
                    ? 'text-gray-800' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                  focus:outline-none group
                `}
              >
                {/* Active background with elegant gradient */}
                {activeTab === tab.value && (
                  <motion.div 
                    layoutId="activeTabBackground"
                    className="absolute inset-0 rounded-md bg-white shadow-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Hover effect for inactive tabs */}
                {activeTab !== tab.value && (
                  <motion.div
                    initial={false}
                    animate={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/40 rounded-md"
                    transition={{ duration: 0.2 }}
                  />
                )}

                {/* Text with elevation effect when active */}
                <motion.span
                  className="relative z-10 font-medium"
                  initial={false}
                  animate={{ 
                    scale: activeTab === tab.value ? 1.05 : 1,
                    fontWeight: activeTab === tab.value ? "600" : "400"
                  }}
                  whileHover={{ 
                    scale: activeTab === tab.value ? 1.05 : 1.03,
                    fontWeight: "500" 
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {tab.label}
                </motion.span>

                {/* Elegant underline indicator */}
                {activeTab === tab.value && (
                  <motion.div
                    className="absolute bottom-1.5 left-0 right-0 mx-auto w-12 h-0.5 bg-gradient-to-r from-transparent via-knowledge-primary to-transparent"
                    layoutId="activeTabIndicator"
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                  />
                )}

                {/* Subtle shine effect on active tab */}
                {activeTab === tab.value && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-md pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ 
                      opacity: [0, 0.5, 0.3],
                      transition: { 
                        duration: 1.5, 
                        repeat: Infinity, 
                        repeatType: "reverse" 
                      }
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        </nav>
      </motion.div>
    </div>
  );
}
