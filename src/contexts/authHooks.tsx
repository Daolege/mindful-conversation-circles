
import { useContext, useEffect } from 'react';
import { AuthContext } from './AuthProvider';
import type { AuthContextType } from './authTypes';

// 添加详细的错误日志和性能追踪
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  useEffect(() => {
    console.log('[useAuth] Hook initialized, context exists:', !!context);
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
  }, [context.loading, context.user]);
  
  return context;
};
