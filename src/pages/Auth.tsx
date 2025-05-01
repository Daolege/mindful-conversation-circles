
import React, { memo, useEffect, useRef, useState } from 'react';
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/authHooks";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import AuthForm from "@/components/auth/AuthForm";
import Logo from "@/components/Logo";

const Auth = memo(() => {
  const { loading, user, recoverSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isRecoveringSession, setIsRecoveringSession] = useState(false);
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

  // 会话恢复尝试
  useEffect(() => {
    // 如果没有用户会话，且未处于加载状态，则尝试恢复会话
    if (!user && !loading && !isRecoveringSession) {
      const attemptSessionRecovery = async () => {
        setIsRecoveringSession(true);
        try {
          const recoveredSession = await recoverSession();
          if (recoveredSession && location.state?.from) {
            // 如果成功恢复会话且有重定向路径，则导航到该路径
            setTimeout(() => {
              toast.success("已恢复会话", { duration: 3000 });
              navigate(location.state.from, { replace: true });
            }, 500);
          }
        } catch (error) {
          console.error("Session recovery failed:", error);
        } finally {
          setIsRecoveringSession(false);
        }
      };
      
      attemptSessionRecovery();
    }
  }, [user, loading, recoverSession, location.state, navigate, isRecoveringSession]);

  if (loading || isRecoveringSession) {
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
