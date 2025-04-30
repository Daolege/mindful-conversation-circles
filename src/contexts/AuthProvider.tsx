
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Session } from '@supabase/supabase-js';
import type { AuthContextType, User } from './authTypes';

// 创建稳定的上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 使用带有稳定性优化的提供者
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 避免状态冲突的ref
  const userRef = React.useRef<User | null>(null);
  const sessionRef = React.useRef<Session | null>(null);
  const initializedRef = React.useRef(false);
  const authListenerRef = React.useRef<{ data: { subscription: { unsubscribe: () => void } } } | null>(null);
  const updatingStateRef = React.useRef(false);
  
  // 最小化UI状态，仅用于必要渲染
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 高性能的会话更新函数，使用稳定的引用避免闭包问题
  const updateSessionState = useCallback((newSession: Session | null) => {
    // 避免状态竞争
    if (updatingStateRef.current) return;
    updatingStateRef.current = true;

    try {
      // 用户登出情况
      if (!newSession || !newSession.user) {
        if (userRef.current !== null || sessionRef.current !== null) {
          userRef.current = null;
          sessionRef.current = null;
          // 异步更新UI状态减少渲染次数
          setTimeout(() => {
            setUser(null);
            setSession(null);
          }, 0);
        }
        return;
      }
      
      // 提取用户信息
      const newUser = {
        id: newSession.user.id,
        email: newSession.user.email!,
        name: newSession.user.user_metadata?.name || newSession.user.email!.split('@')[0]
      };
      
      // 仅在必要时更新状态
      const userChanged = !userRef.current || 
                          userRef.current.id !== newUser.id || 
                          userRef.current.email !== newUser.email || 
                          userRef.current.name !== newUser.name;
                          
      const sessionChanged = sessionRef.current !== newSession;
      
      // 新增：检查用户是否已被禁用
      setTimeout(async () => {
        try {
          // 异步查询用户状态
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_active')
            .eq('id', newUser.id)
            .single();
            
          if (!error && profile && profile.is_active === false) {
            console.log("[AuthProvider] User is disabled, signing out:", newUser.email);
            // 用户已被禁用，执行登出
            await supabase.auth.signOut();
            userRef.current = null;
            sessionRef.current = null;
            setUser(null);
            setSession(null);
            toast.error("账号已被禁用", { description: "您的账号已被管理员禁用，请联系管理员" });
            return;
          }
        } catch (error) {
          console.error("[AuthProvider] Error checking user status:", error);
        }
        
        // 更新引用状态
        userRef.current = newUser;
        sessionRef.current = newSession;
        
        // 仅在需要时异步更新UI状态
        if (userChanged || sessionChanged) {
          setTimeout(() => {
            if (userChanged) setUser(newUser);
            if (sessionChanged) setSession(newSession);
          }, 0);
        }
      }, 0);
    } finally {
      // 延迟解锁状态更新，避免快速连续更新导致问题
      setTimeout(() => {
        updatingStateRef.current = false;
      }, 0);
    }
  }, []);

  // 登录方法，稳定的引用以避免不必要的重渲染
  const signIn = useCallback(async (email: string, password: string) => {
    console.log("[AuthProvider] signIn called for:", email);
    try {
      // 先尝试登录
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("[AuthProvider] signIn error:", error);
        throw error;
      }
      
      // 登录成功后检查用户是否被禁用
      if (data?.session && data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_active')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error("[AuthProvider] Error checking user profile:", profileError);
        }
        
        // 如果用户被禁用，立即登出并返回错误
        if (profile && profile.is_active === false) {
          console.log("[AuthProvider] User is disabled, preventing login:", email);
          
          // 立即登出用户
          await supabase.auth.signOut();
          
          return { 
            data: null, 
            error: new Error("账号已被禁用"),
            userStatus: { isActive: false }
          };
        }
        
        console.log("[AuthProvider] signIn successful:", data.user?.email);
        // 只在真正成功登录时才显示成功提示
        setTimeout(() => {
          toast.success('登录成功！');
        }, 0);
      }
      
      return { data, error: null, userStatus: { isActive: true } };
    } catch (error: any) {
      console.error("[AuthProvider] signIn exception:", error);
      return { data: null, error };
    }
  }, []);

  // 注册方法，同样优化引用稳定性
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) throw error;
      
      setTimeout(() => {
        if (data.session) {
          toast.success('注册并登录成功！', { description: '您已成功注册并登录' });
        } else if (data.user) {
          toast.success('注册成功', { description: '由于邮箱验证已禁用，您现在可以登录' });
        }
      }, 0);
      
      return { data, error: null };
    } catch (error: any) {
      setTimeout(() => {
        if (error.message?.includes('User already registered')) {
          toast.error('注册失败', { description: '该邮箱已注册' });
        } else if (
          error.message?.includes('Invalid URL') ||
          error.message?.includes('fetch failed') ||
          error.message?.includes('Failed to fetch')
        ) {
          toast.error('系统配置错误', {
            description: '认证服务暂时不可用，请联系管理员或完成Supabase配置'
          });
        } else {
          toast.error('注册失败', { description: error.message });
        }
      }, 0);
      
      return { data: null, error };
    }
  }, []);

  // 登出方法，优化状态更新
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      // 立即更新内部状态
      userRef.current = null;
      sessionRef.current = null;
      // 异步更新UI状态
      setTimeout(() => {
        setUser(null);
        setSession(null);
        toast.success('已退出登录');
      }, 0);
      return Promise.resolve();
    } catch (error: any) {
      setTimeout(() => {
        toast.error('退出登录失败', { description: error.message });
      }, 0);
      return Promise.reject(error);
    }
  }, []);

  // 设置管理员方法，同样确保引用稳定性
  const setAdmin = useCallback(async () => {
    if (!userRef.current) {
      setTimeout(() => {
        toast.error('请先登录');
      }, 0);
      return { error: new Error('请先登录'), data: null };
    }
    
    try {
      const { error, data } = await supabase.functions.invoke('set_admin_role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {},
      });
      
      if (error) throw new Error(error.message || '设置管理员失败');
      if (!data || !data.success) {
        throw new Error(data?.error || '设置管理员失败');
      }
      
      setTimeout(() => {
        toast.success('已设置为管理员', {
          description: '请前往"全部课程"页面查看管理面板'
        });
      }, 0);
      
      return { data, error: null };
    } catch (error: any) {
      setTimeout(() => {
        toast.error('设置管理员失败', { description: error.message });
      }, 0);
      return { data: null, error };
    }
  }, []);

  // 创建记忆化的上下文值
  const contextValue = React.useMemo<AuthContextType>(() => ({
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    setAdmin
  }), [user, session, loading, signIn, signUp, signOut, setAdmin]);

  // 一次性初始化认证状态，特别优化为异步模式避免阻塞
  useEffect(() => {
    // 防止重复初始化
    if (initializedRef.current) return;
    
    console.log("[Auth] 开始初始化认证状态...");
    
    // 异步初始化流程
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // 使用宏任务延迟执行避免阻塞UI
        setTimeout(async () => {
          try {
            // 首先获取当前会话以减少闪烁
            const { data: sessionData } = await supabase.auth.getSession();
            console.log("[Auth] 初始会话状态:", sessionData.session ? "已登录" : "未登录");
            
            // 更新初始状态
            updateSessionState(sessionData.session);
            
            // 然后设置认证状态监听器
            const authListener = supabase.auth.onAuthStateChange((event, newSession) => {
              console.log("[Auth] 认证状态变化:", event);
              // 异步更新以避免引起渲染问题
              setTimeout(() => {
                updateSessionState(newSession);
              }, 0);
            });
            
            // 存储订阅引用用于清理
            authListenerRef.current = authListener;
            
            // 标记为已初始化
            initializedRef.current = true;
            console.log("[Auth] 认证状态初始化完成");
            
            // 完成加载
            setLoading(false);
          } catch (error) {
            console.error("[Auth] 认证初始化错误:", error);
            setLoading(false);
          }
        }, 0);
      } catch (error) {
        console.error("[Auth] 外部初始化错误:", error);
        setLoading(false);
      }
    };
    
    // 启动初始化流程
    initAuth();
    
    // 组件卸载时的清理函数
    return () => {
      console.log("[Auth] 清理认证监听器");
      if (authListenerRef.current) {
        authListenerRef.current.data.subscription.unsubscribe();
      }
    };
  }, [updateSessionState]);

  // 防止子组件频繁重新渲染
  const memoizedChildren = React.useMemo(() => children, [children]);

  // 确保渲染不会带来副作用
  return (
    <AuthContext.Provider value={contextValue}>
      {memoizedChildren}
    </AuthContext.Provider>
  );
}

export { AuthContext };
