
import React from 'react';
import { useAuth } from "@/contexts/authHooks";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HomeworkSubmissionsView from "@/components/admin/homework/HomeworkSubmissionsView";
import { useTranslations } from "@/hooks/useTranslations";

const HomeworkSubmissionsPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { t } = useTranslations();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['admin-role', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      try {
        const { data, error } = await supabase.rpc('has_role', { role: 'admin' });
        if (error) {
          console.error(t('errors:checkingAdminRoleError'), error);
          return false;
        }
        return !!data;
      } catch (err) {
        console.error(t('errors:adminRoleCheckError'), err);
        return false;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: 10 * 60 * 1000,
  });

  // 如果不是管理员，重定向到首页
  React.useEffect(() => {
    if (!loading && !isLoading && !isAdmin) {
      toast.error(t('errors:insufficientPermissions'), { description: t('errors:adminAccessRequired') });
      navigate('/');
    }
  }, [isAdmin, isLoading, loading, navigate, t]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl text-gray-600">{t('errors:adminOnlyPage')}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <HomeworkSubmissionsView />
      </main>
      <Footer />
    </div>
  );
};

export default HomeworkSubmissionsPage;
