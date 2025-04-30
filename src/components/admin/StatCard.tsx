
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { memo, useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: number | string;
  description: string;
  icon: React.ElementType;
  trend?: number;
  trendValue?: string;
  isLoading?: boolean;
  category?: "user" | "course" | "financial" | "payment"; 
}

export const StatCard = memo(({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  trendValue,
  isLoading = false,
  category = "user" 
}: StatCardProps) => {
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    // Simulate staggered content loading for a better UX
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 50);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isLoading]);

  // Unified styling for all categories
  const styles = {
    card: "hover:shadow-2xl hover:scale-[1.05] transition-all duration-300 bg-gradient-to-br from-white/70 to-white/50 border-gray-100/50 rounded-xl",
    iconBg: "bg-gray-50/80",
    iconColor: "text-knowledge-primary",
    valueGradient: "from-knowledge-primary to-knowledge-secondary",
    textColor: "text-gray-900",
    textHover: "hover:text-knowledge-primary",
    titleEffect: "text-hover-underline",
    descriptionEffect: "hover:text-gray-700"
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Card className={`transition-all duration-300 backdrop-blur-sm ${styles.card}`}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          {isLoading ? (
            <Skeleton className="h-4 w-24 bg-gradient-to-r from-gray-200/80 to-gray-200/40" />
          ) : (
            <CardTitle className={`text-sm font-medium text-muted-foreground group ${styles.textHover} ${styles.textColor}`}>
              <motion.span
                className={`inline-block relative ${styles.titleEffect}`}
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                {title}
              </motion.span>
            </CardTitle>
          )}
          <motion.div
            whileHover={{ rotate: 15, scale: 1.3 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className={`p-2 rounded-full ${isLoading ? 'bg-gray-100/40' : styles.iconBg} backdrop-blur-sm shadow-sm`}
          >
            {isLoading ? (
              <Skeleton className="h-4 w-4 rounded-full bg-gray-200/50" />
            ) : (
              <Icon className={`h-4 w-4 ${styles.iconColor}`} />
            )}
          </motion.div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="relative overflow-hidden">
                  <Skeleton className="h-7 w-20 bg-gradient-to-r from-gray-200/60 to-gray-100/50" />
                  <div className="absolute inset-0 bg-shimmer animate-shimmer via-white/60" />
                </div>
                <div className="relative overflow-hidden">
                  <Skeleton className="h-4 w-32 bg-gradient-to-r from-gray-200/40 to-gray-100/30" />
                  <div className="absolute inset-0 bg-shimmer animate-shimmer via-white/60" />
                </div>
                {trend !== undefined && (
                  <div className="relative overflow-hidden">
                    <Skeleton className="h-4 w-16 bg-gradient-to-r from-gray-200/30 to-gray-100/20 mt-1" />
                    <div className="absolute inset-0 bg-shimmer animate-shimmer via-white/60" />
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={value?.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
              >
                <motion.div 
                  className={`text-2xl font-bold bg-gradient-to-r ${styles.valueGradient} bg-clip-text text-transparent`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ 
                    scale: showContent ? 1 : 0.5, 
                    opacity: showContent ? 1 : 0,
                    transition: {
                      duration: 0.5,
                      ease: [0.34, 1.56, 0.64, 1]
                    }
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    textShadow: "0 0 10px rgba(100, 100, 100, 0.4)",
                    transition: { duration: 0.2 }
                  }}
                >
                  {value}
                </motion.div>
                <motion.p 
                  className={`text-xs text-muted-foreground flex items-center mt-2 ${styles.descriptionEffect} ${styles.textColor}`}
                  whileHover={{ 
                    x: 3,
                    transition: { duration: 0.2 }
                  }}
                >
                  {trend !== undefined && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.8 }}
                      whileHover={{ scale: 1.2 }}
                      className={`inline-flex items-center justify-center p-1 rounded-full ${trend >= 0 
                        ? "text-green-500 bg-green-50"
                        : "text-red-500 bg-red-50"} mr-2`}
                    >
                      {trend >= 0 ? "↑" : "↓"}
                    </motion.span>
                  )}
                  {description}
                </motion.p>
                {trendValue && (
                  <motion.p 
                    className={`text-xs text-muted-foreground mt-2 italic ${styles.textColor}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: showContent ? 1 : 0, x: showContent ? 0 : -10 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ 
                      x: 3,
                      color: "#666",
                      transition: { duration: 0.2 }
                    }}
                  >
                    {trendValue}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';
