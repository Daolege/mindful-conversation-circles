
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export function DashboardNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') || 'overview';
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab') || 'overview';
    setActiveTab(tab);
  }, [location.search]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', value);
    navigate(`/dashboard?${searchParams.toString()}`);
  };

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
            <TabsTrigger value="overview" className="flex-1">概览</TabsTrigger>
            <TabsTrigger value="courses" className="flex-1">我的课程</TabsTrigger>
            <TabsTrigger value="orders" className="flex-1">订单记录</TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex-1">订阅记录</TabsTrigger>
            <TabsTrigger value="profile" className="flex-1">个人信息</TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>
    </div>
  );
}
