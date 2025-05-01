
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthProvider';
import type { AuthContextType } from './authTypes';
import { checkSupabaseConnection } from '@/integrations/supabase/client';

// 添加详细的错误日志和性能追踪
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  const [connectionVerified, setConnectionVerified] = useState(false);
  
  // Verify Supabase connection when the hook is first used
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const isConnected = await checkSupabaseConnection();
        setConnectionVerified(isConnected);
        console.log('[useAuth] Supabase connection verified:', isConnected);
      } catch (error) {
        console.error('[useAuth] Error verifying Supabase connection:', error);
        setConnectionVerified(false);
      }
    };
    
    if (!connectionVerified) {
      verifyConnection();
    }
  }, [connectionVerified]);
  
  useEffect(() => {
    console.log('[useAuth] Hook initialized, context exists:', !!context);
    
    // Performance mark for debugging
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark('auth-hook-initialized');
    }
  }, [context]);
  
  if (!context) {
    console.error('[useAuth] Error: Hook used outside of AuthProvider');
    throw Object.freeze(new Error('useAuth必须在AuthProvider内部使用'));
  }
  
  // 记录认证状态变化
  useEffect(() => {
    console.log('[useAuth] Auth state updated:', { 
      loading: context.loading,
      userAuthenticated: !!context.user,
      userName: context.user?.name
    });
    
    // Performance measure for debugging
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure('auth-state-update', 'auth-hook-initialized');
      } catch (e) {
        // Ignore errors if the mark doesn't exist
      }
    }
  }, [context.loading, context.user]);
  
  return context;
};
