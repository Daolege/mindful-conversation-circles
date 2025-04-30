
import React, { memo, useEffect, useRef } from 'react';
import { useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/authHooks";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthForm from "@/components/auth/AuthForm";
import Logo from "@/components/Logo";

const Auth = memo(() => {
  const { loading, user } = useAuth();
  const location = useLocation();
  const from = location.state?.from || "/";
  const toastShownRef = useRef(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (location.state?.loginRequired && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.info("需要登录", { 
        description: "请登录后继续访问该页面",
        duration: 5000
      });
    }
    
    if (location.state?.loginError && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.error("登录失败", { 
        description: location.state.loginError,
        duration: 8000
      });
    }
  }, [location.state]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }
  
  if (user && !redirectedRef.current) {
    redirectedRef.current = true;
    return <Navigate to={from} replace />;
  }

  return (
    <div className="auth-page">
      <div className="auth-logo">
        <Logo variant="auth" />
      </div>
      <AuthForm />
    </div>
  );
});

Auth.displayName = 'Auth';

export default Auth;
