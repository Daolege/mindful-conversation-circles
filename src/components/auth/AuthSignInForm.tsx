
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/authHooks";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';
import { SocialLoginButtons } from './SocialLoginButtons';
import ForgotPasswordForm from './ForgotPasswordForm';
import { LogIn, WifiOff } from "lucide-react";
import { Captcha } from './Captcha';
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱地址" }),
  password: z.string().min(6, { message: "密码长度至少为6个字符" }),
});

interface AuthSignInFormProps {
  onSwitch?: () => void;
}

const AuthSignInForm: React.FC<AuthSignInFormProps> = ({ onSwitch }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [captchaValue, setCaptchaValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState<'error' | 'warning' | 'system' | 'network'>('error');
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  
  // Track network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  useEffect(() => {
    console.log("Auth form state:", { 
      failedAttempts, 
      captchaValue, 
      isButtonDisabled: failedAttempts >= 3 ? !captchaValue : isSubmitting,
      isOnline
    });
    
    // Set network error when offline
    if (!isOnline) {
      setErrorMessage('您当前处于离线状态，请检查网络连接后重试。');
      setErrorType('network');
    } else if (errorType === 'network') {
      // Clear network error when back online
      setErrorMessage('');
      setErrorType('error');
    }
  }, [failedAttempts, captchaValue, isSubmitting, isOnline, errorType]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Prevent login attempt if offline
    if (!isOnline) {
      setErrorMessage('您当前处于离线状态，请检查网络连接后重试。');
      setErrorType('network');
      return;
    }
    
    console.log("Submit attempt with values:", { 
      email: values.email, 
      passwordLength: values.password.length, 
      captchaValue, 
      failedAttempts 
    });
    
    // 清除之前的错误消息
    setErrorMessage('');
    setErrorType('error');
    
    try {
      if (failedAttempts >= 3 && !captchaValue) {
        setErrorMessage("请输入验证码");
        setErrorType('warning');
        toast("验证失败", {
          description: "请输入验证码",
          duration: 5000
        });
        return;
      }

      setIsSubmitting(true);
      
      // 增加超时处理
      const loginPromise = signIn(values.email, values.password);
      
      // 设置5秒超时 (reduced from 10s)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("登录请求超时，请稍后再试")), 5000)
      );
      
      // 使用Promise.race以避免无限等待
      const { error, userStatus } = await Promise.race([
        loginPromise,
        timeoutPromise.then(() => ({ data: null, error: new Error("登录请求超时，请稍后再试"), userStatus: null }))
      ]) as { data: any, error: any, userStatus?: { isActive: boolean } };
      
      if (error) {
        setFailedAttempts(prev => prev + 1);
        console.log("Login error:", { 
          message: error.message, 
          failedAttempts: failedAttempts + 1,
          userStatus
        });
        
        // 新增：检查用户是否已被禁用
        if (userStatus && userStatus.isActive === false) {
          setErrorMessage("账号已被禁用，请联系管理员");
          setErrorType('error');
          toast("登录失败", {
            description: "账号已被禁用，请联系管理员",
            duration: 5000
          });
        }
        // 针对不同错误类型显示更友好的错误信息
        else if (error.message.includes('Database error granting user') || 
            error.message.includes('stack depth limit') ||
            error.message.includes('unexpected_failure') ||
            error.message.includes('登录请求超时')) {
          setErrorMessage("系统当前维护中，请稍后再试或使用下方的演示账户登录");
          setErrorType('system');
          toast("系统错误", {
            description: "系统当前维护中，请稍后再试或使用下方的演示账户登录",
            duration: 15000 // 增长显示时间
          });
        } else if (error.message.includes('Invalid login credentials')) {
          setErrorMessage("邮箱或密码不正确，请重试");
          setErrorType('error');
          toast("登录失败", {
            description: "邮箱或密码不正确，请重试",
            duration: 5000
          });
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage("请先验证您的邮箱");
          setErrorType('warning');
          toast("登录失败", {
            description: "请先验证您的邮箱",
            duration: 5000
          });
        } else {
          setErrorMessage(error.message);
          setErrorType('error');
          toast("登录失败", {
            description: error.message,
            duration: 5000
          });
        }
      } else {
        setFailedAttempts(0);
        setErrorMessage('');
        navigate('/');
      }
    } catch (error: any) {
      console.error("Login system error:", error);
      setFailedAttempts(prev => prev + 1);
      
      // Check if it's a network error
      if (!navigator.onLine || error.message?.includes('fetch') || error.message?.includes('network')) {
        setErrorMessage("网络连接错误，请检查您的网络后重试");
        setErrorType('network');
      } else {
        setErrorMessage("系统错误，请稍后再试或使用下方的演示账户登录");
        setErrorType('system');
      }
      
      toast("登录失败", {
        description: "系统错误，请稍后再试或使用下方的演示账户登录",
        duration: 15000 // 增长显示时间
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
  }

  const isLoginDisabled = () => {
    if (!isOnline) return true;
    if (failedAttempts >= 3) {
      return !captchaValue || isSubmitting;
    }
    return isSubmitting;
  };

  const handleCaptchaChange = (value: string) => {
    console.log("Captcha changed to:", value);
    setCaptchaValue(value);
  };

  const getErrorAlertStyle = () => {
    switch (errorType) {
      case 'warning':
        return "border-yellow-500 bg-yellow-50 text-yellow-700";
      case 'system':
        return "border-red-500 bg-red-50 text-red-700";
      case 'network':
        return "border-blue-500 bg-blue-50 text-blue-700";
      default:
        return "border-red-200 bg-red-50 text-red-700";
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {/* Network status indicator */}
        {!isOnline && (
          <div className="flex items-center justify-center p-2 bg-blue-50 text-blue-700 rounded-md mb-4">
            <WifiOff className="h-4 w-4 mr-2" />
            <span className="text-sm">您当前处于离线状态</span>
          </div>
        )}
      
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="auth-label">邮箱</FormLabel>
              <FormControl>
                <Input placeholder="请输入邮箱地址" className="auth-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="auth-label">密码</FormLabel>
              <FormControl>
                <Input type="password" placeholder="请输入密码" className="auth-input" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {failedAttempts >= 3 && (
          <FormItem>
            <FormLabel className="auth-label">验证码</FormLabel>
            <Captcha onChange={handleCaptchaChange} />
            {failedAttempts >= 3 && !captchaValue && (
              <p className="text-xs text-amber-500 mt-1">请输入验证码以继续登录</p>
            )}
          </FormItem>
        )}
        
        {/* 错误消息显示区域 - 使用醒目的视觉样式 */}
        {errorMessage && (
          <Alert className={getErrorAlertStyle()}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {errorType === 'system' ? "系统错误" : 
               errorType === 'warning' ? "注意" : 
               errorType === 'network' ? "网络错误" :
               "登录失败"}
            </AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end text-base text-gray-500">
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault(); 
              setShowForgotPassword(true);
            }} 
            className="hover:text-black transition-colors"
          >
            忘记密码？
          </a>
        </div>

        <Button 
          type="submit" 
          className="auth-button w-full" 
          disabled={isLoginDisabled()}
        >
          <LogIn className="mr-2 h-5 w-5" />
          {isSubmitting ? '登录中...' : '登录'}
        </Button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">或</span>
          </div>
        </div>

        <SocialLoginButtons />
        
        <div className="text-center text-sm text-gray-500">
          还没有账号？ <a href="#" onClick={(e) => {e.preventDefault(); onSwitch?.()}} className="text-black hover:underline">立即注册</a>
        </div>
      </form>
    </Form>
  );
};

export default AuthSignInForm;
