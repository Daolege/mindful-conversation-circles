
import React, { memo, useEffect, useRef, useState } from 'react';
import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/authHooks";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import AuthForm from "@/components/auth/AuthForm";
import Logo from "@/components/Logo";
import { useTranslation } from 'react-i18next';

const Auth = memo(() => {
  const { t } = useTranslation(['common', 'auth']);
  const { loading, user, recoverSession } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isRecoveringSession, setIsRecoveringSession] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const from = location.state?.from || "/";
  const toastShownRef = useRef(false);
  const redirectedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (location.state?.loginRequired && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.info(t('auth:loginRequired.title'), { 
        description: t('auth:loginRequired.message'),
        duration: 5000
      });
    }
    
    if (location.state?.loginError && !toastShownRef.current) {
      toastShownRef.current = true;
      toast.error(t('auth:loginFailed.title'), { 
        description: location.state.loginError,
        duration: 8000
      });
    }
  }, [location.state, t]);

  // Set a timeout to avoid infinite loading state
  useEffect(() => {
    if ((loading || isRecoveringSession) && !loadingTimeout) {
      timeoutRef.current = window.setTimeout(() => {
        setLoadingTimeout(true);
        setAuthError(t('auth:errors.timeout'));
        setIsRecoveringSession(false);
        console.error("Auth loading timeout reached - possible connection issue");
      }, 10000); // 10 seconds timeout
    } else if (!loading && !isRecoveringSession) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [loading, isRecoveringSession, loadingTimeout, t]);

  // 会话恢复尝试
  useEffect(() => {
    // 如果没有用户会话，且未处于加载状态，则尝试恢复会话，但要避免无限循环
    const attemptSessionRecovery = async () => {
      if (!user && !loading && !isRecoveringSession && !loadingTimeout) {
        console.log("[Auth] Attempting to recover session...");
        setIsRecoveringSession(true);
        try {
          const recoveredSession = await recoverSession();
          if (recoveredSession && location.state?.from) {
            // 如果成功恢复会话且有重定向路径，则导航到该路径
            setTimeout(() => {
              toast.success(t('auth:sessionRestored'), { duration: 3000 });
              navigate(location.state.from, { replace: true });
            }, 500);
          } else if (!recoveredSession) {
            console.log("[Auth] No session to recover, proceeding to login form");
          }
        } catch (error) {
          console.error("[Auth] Session recovery failed:", error);
          setAuthError(t('auth:errors.recovery'));
        } finally {
          setIsRecoveringSession(false);
        }
      }
    };
    
    attemptSessionRecovery();
  }, [user, loading, recoverSession, location.state, navigate, isRecoveringSession, loadingTimeout, t]);

  if (loadingTimeout && authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t('auth:errors.connectionIssue')}</h2>
        <p className="text-gray-600 mb-4 text-center">{authError}</p>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          onClick={() => window.location.reload()}
        >
          {t('common:refresh')}
        </button>
      </div>
    );
  }

  if (loading || isRecoveringSession) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-4" />
        <p className="text-gray-500">{t('common:loading')}</p>
      </div>
    );
  }
  
  if (user && !redirectedRef.current) {
    redirectedRef.current = true;
    return <Navigate to={from} replace />;
  }

  return (
    <div className="auth-page min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="auth-logo mb-8">
        <Logo variant="auth" />
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <AuthForm />
      </div>
    </div>
  );
});

Auth.displayName = 'Auth';

export default Auth;
