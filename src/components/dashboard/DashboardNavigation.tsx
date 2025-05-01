
import { useLocation, useNavigate } from 'react-router-dom';
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
      <div className="bg-white/90 backdrop-blur-sm p-2 rounded-2xl border border-gray-100 shadow-sm">
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-4">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
