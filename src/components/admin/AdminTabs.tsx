
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "./UserManagement";
import { OrderManagement } from "./OrderManagement";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/authHooks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const AdminTabs = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");
  const navigate = useNavigate();
  const redirectAttemptedRef = useRef(false);

  useEffect(() => {
    console.log("AdminTabs mounted - no automatic redirects here");
  }, []);

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['admin-tabs-role', user?.id],
    queryFn: async () => {
      if (!user) return false;
      try {
        const { data, error } = await supabase.rpc('has_role', { role: 'admin' });
        if (error) {
          console.error('AdminTabs: Error checking admin role:', error);
          return false;
        }
        return !!data;
      } catch (error) {
        console.error('AdminTabs: Error checking admin role:', error);
        return false;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (!isLoading && user && isAdmin === false && !redirectAttemptedRef.current) {
      redirectAttemptedRef.current = true;
      toast.error("权限不足", { description: "您没有管理员权限" });
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }
  
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
    <div className="container mx-auto px-4 py-6">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="mb-6 bg-gray-50/90 p-2 rounded-2xl border border-gray-200 shadow-sm">
          <TabsTrigger value="users" className="px-6 py-3">用户管理</TabsTrigger>
          <TabsTrigger value="orders" className="px-6 py-3">订单管理</TabsTrigger>
        </TabsList>
        
        <AnimatePresence mode="wait">
          {activeTab === "users" && (
            <motion.div
              key="users"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <TabsContent value="users">
                <UserManagement />
              </TabsContent>
            </motion.div>
          )}
          
          {activeTab === "orders" && (
            <motion.div
              key="orders"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <TabsContent value="orders">
                <OrderManagement />
              </TabsContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  );
};
