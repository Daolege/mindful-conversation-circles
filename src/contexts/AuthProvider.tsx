
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Session } from '@supabase/supabase-js';
import type { AuthContextType, User } from './authTypes';

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use provider with stability optimizations
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State for user information
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Create refs inside the component function body
  const userRef = React.useRef<User | null>(null);
  const sessionRef = React.useRef<Session | null>(null);
  const initializedRef = React.useRef(false);
  const authListenerRef = React.useRef<{ data: { subscription: { unsubscribe: () => void } } } | null>(null);
  const updatingStateRef = React.useRef(false);
  const sessionCheckInProgressRef = React.useRef(false);

  // Session recovery mechanism
  const recoverSession = useCallback(async () => {
    if (sessionCheckInProgressRef.current) return null;
    
    try {
      sessionCheckInProgressRef.current = true;
      console.log("[AuthProvider] Attempting to recover session...");
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("[AuthProvider] Session recovery error:", error);
        return null;
      }
      
      if (data?.session) {
        console.log("[AuthProvider] Session recovered successfully");
        return data.session;
      } else {
        console.log("[AuthProvider] No valid session to recover");
        return null;
      }
    } catch (err) {
      console.error("[AuthProvider] Session recovery exception:", err);
      return null;
    } finally {
      sessionCheckInProgressRef.current = false;
    }
  }, []);

  // High-performance session update function with stable reference to avoid closure issues
  const updateSessionState = useCallback(async (newSession: Session | null) => {
    // Avoid race conditions
    if (updatingStateRef.current) return;
    updatingStateRef.current = true;

    try {
      // User logout case
      if (!newSession || !newSession.user) {
        // Try to recover the session to avoid invalid logouts
        if (userRef.current !== null) {
          const recoveredSession = await recoverSession();
          if (recoveredSession) {
            console.log("[AuthProvider] Session recovered successfully, preventing invalid logout");
            updateSessionState(recoveredSession);
            return;
          }
        }
        
        if (userRef.current !== null || sessionRef.current !== null) {
          console.log("[AuthProvider] User logged out, clearing state");
          userRef.current = null;
          sessionRef.current = null;
          
          // Asynchronously update UI state to reduce renders
          setTimeout(() => {
            setUser(null);
            setSession(null);
          }, 0);
        }
        return;
      }
      
      // Extract user information
      const newUser = {
        id: newSession.user.id,
        email: newSession.user.email!,
        name: newSession.user.user_metadata?.name || newSession.user.email!.split('@')[0]
      };
      
      // Only update state when necessary
      const userChanged = !userRef.current || 
                          userRef.current.id !== newUser.id || 
                          userRef.current.email !== newUser.email || 
                          userRef.current.name !== newUser.name;
                          
      const sessionChanged = sessionRef.current !== newSession;
      
      // Check if user is disabled
      setTimeout(async () => {
        try {
          // Async query for user status
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_active')
            .eq('id', newUser.id)
            .single();
            
          if (!error && profile && profile.is_active === false) {
            console.log("[AuthProvider] User is disabled, signing out:", newUser.email);
            // User has been disabled, execute logout
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
        
        // Update reference state
        userRef.current = newUser;
        sessionRef.current = newSession;
        
        // Only update UI state when needed
        if (userChanged || sessionChanged) {
          setTimeout(() => {
            if (userChanged) setUser(newUser);
            if (sessionChanged) setSession(newSession);
          }, 0);
        }
      }, 0);
    } finally {
      // Delay unlocking state updates to prevent rapid consecutive updates
      setTimeout(() => {
        updatingStateRef.current = false;
      }, 0);
    }
  }, [recoverSession]);

  // Login method, stable reference to avoid unnecessary re-renders
  const signIn = useCallback(async (email: string, password: string) => {
    console.log("[AuthProvider] signIn called for:", email);
    try {
      // First try to login
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error("[AuthProvider] signIn error:", error);
        throw error;
      }
      
      // After successful login, check if user is disabled
      if (data?.session && data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_active')
          .eq('id', data.user.id)
          .single();
          
        if (profileError) {
          console.error("[AuthProvider] Error checking user profile:", profileError);
        }
        
        // If user is disabled, immediately log out and return an error
        if (profile && profile.is_active === false) {
          console.log("[AuthProvider] User is disabled, preventing login:", email);
          
          // Log out the user immediately
          await supabase.auth.signOut();
          
          return { 
            data: null, 
            error: new Error("账号已被禁用"),
            userStatus: { isActive: false }
          };
        }
        
        console.log("[AuthProvider] signIn successful:", data.user?.email);
        // Only show success toast when login is truly successful
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

  // Registration method, also optimizes reference stability
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

  // Logout method, optimizes state updates
  const signOut = useCallback(async () => {
    try {
      console.log("[AuthProvider] Executing logout process");
      // Update internal state first to avoid inconsistencies
      userRef.current = null;
      sessionRef.current = null;
      
      // Asynchronously update UI state to avoid state desync
      setTimeout(() => {
        setUser(null);
        setSession(null);
      }, 0);
      
      // Execute the actual logout operation, but don't depend on its completion
      await supabase.auth.signOut();
      
      toast.success('已退出登录');
      
      // Navigation to login page handled by caller
      return Promise.resolve(true);
    } catch (error: any) {
      console.error("[AuthProvider] Logout failed:", error);
      toast.error('退出登录失败', { description: error.message });
      return Promise.reject(error);
    }
  }, []);

  // Admin setting method, also ensures reference stability
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

  // Create memoized context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    setAdmin,
    recoverSession
  }), [user, session, loading, signIn, signUp, signOut, setAdmin, recoverSession]);

  // One-time auth state initialization
  useEffect(() => {
    // Prevent duplicate initialization
    if (initializedRef.current) return;
    
    console.log("[Auth] Starting auth state initialization...");
    
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // Use setTimeout to make this non-blocking
        setTimeout(async () => {
          try {
            // First get current session
            const { data: sessionData } = await supabase.auth.getSession();
            console.log("[Auth] Initial session state:", sessionData.session ? "logged in" : "not logged in");
            
            // Update initial state
            updateSessionState(sessionData.session);
            
            // Set auth state listener
            try {
              const authListener = supabase.auth.onAuthStateChange((event, newSession) => {
                console.log("[Auth] Auth state changed:", event);
                // Use setTimeout to make this non-blocking
                setTimeout(() => {
                  updateSessionState(newSession);
                }, 0);
              });
              
              // Store for cleanup
              authListenerRef.current = authListener;
            } catch (listenerError) {
              console.error("[Auth] Failed to set auth state listener:", listenerError);
            }
            
            // Mark as initialized
            initializedRef.current = true;
            console.log("[Auth] Auth state initialization complete");
            
            // Complete loading
            setLoading(false);
          } catch (error) {
            console.error("[Auth] Auth initialization error:", error);
            // End loading state even on error
            setLoading(false);
            initializedRef.current = true; // Mark as initialized to avoid retry
          }
        }, 0);
      } catch (error) {
        console.error("[Auth] External initialization error:", error);
        setLoading(false);
        initializedRef.current = true;
      }
    };
    
    // Start initialization
    initAuth();
    
    // Cleanup function
    return () => {
      console.log("[Auth] Cleaning up auth listener");
      if (authListenerRef.current) {
        try {
          authListenerRef.current.data.subscription.unsubscribe();
        } catch (error) {
          console.error("[Auth] Failed to clean up listener:", error);
        }
      }
    };
  }, [updateSessionState]);

  // Memoize children to prevent re-renders
  const memoizedChildren = React.useMemo(() => children, [children]);

  // Return the AuthContext.Provider with the memoized value
  return (
    <AuthContext.Provider value={contextValue}>
      {memoizedChildren}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
export { AuthContext };
