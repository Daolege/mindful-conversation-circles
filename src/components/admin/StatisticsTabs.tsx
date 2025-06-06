
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { memo } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "@/hooks/useTranslations";

interface StatisticsTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const StatisticsTabs = memo(({ activeTab, onTabChange }: StatisticsTabsProps) => {
  const { t } = useTranslations();
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="bg-transparent border-b border-gray-200 w-full flex justify-start space-x-6 pb-2">
        <TabsTrigger 
          value="kpi" 
          className="text-base font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary pb-2 -mb-2 rounded-none bg-transparent hover:text-primary/80 transition-all duration-500 group"
        >
          <motion.span 
            className="relative group-hover:scale-105 transition-all duration-300 inline-block"
            whileHover={{ scale: 1.05 }}
          >
            {t('admin:kpiDashboard')}
          </motion.span>
        </TabsTrigger>
        <TabsTrigger 
          value="details" 
          className="text-base font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary pb-2 -mb-2 rounded-none bg-transparent hover:text-primary/80 transition-all duration-500 group"
        >
          <motion.span 
            className="relative group-hover:scale-105 transition-all duration-300 inline-block"
            whileHover={{ scale: 1.05 }}
          >
            {t('admin:detailedStatistics')}
          </motion.span>
        </TabsTrigger>
        <TabsTrigger 
          value="comparison" 
          className="text-base font-medium data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary pb-2 -mb-2 rounded-none bg-transparent hover:text-primary/80 transition-all duration-500 group"
        >
          <motion.span 
            className="relative group-hover:scale-105 transition-all duration-300 inline-block"
            whileHover={{ scale: 1.05 }}
          >
            {t('admin:quarterlyYearlyComparison')}
          </motion.span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
});

StatisticsTabs.displayName = "StatisticsTabs";
