import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/contexts/authHooks";
import { toast } from "sonner";
import { SocialLoginButtons } from './SocialLoginButtons';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  username: z.string().min(2, { message: "用户名至少需要2个字符" }),
  email: z.string().email({ message: "请输入有效的邮箱地址" }),
  password: z.string().min(6, { message: "密码至少需要6个字符" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
});

interface AuthSignUpFormProps {
  onSwitch?: () => void;
}

const AuthSignUpForm: React.FC<AuthSignUpFormProps> = ({ onSwitch }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      const { error } = await signUp(values.email, values.password, values.username);
      
      if (error) {
        toast.error("注册失败", { description: error.message });
      } else {
        toast.success("欢迎加入 Clique！");
        navigate('/');
      }
    } catch (error: any) {
      toast.error("注册失败", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="auth-label">用户名</FormLabel>
              <FormControl>
                <Input 
                  placeholder="请输入用户名" 
                  className="auth-input"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="auth-label">邮箱</FormLabel>
              <FormControl>
                <Input 
                  placeholder="请输入邮箱地址" 
                  className="auth-input"
                  {...field} 
                />
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
                <Input 
                  type="password" 
                  placeholder="请设置密码" 
                  className="auth-input"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="auth-label">确认密码</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="请再次输入密码" 
                  className="auth-input"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="auth-button" 
          disabled={isSubmitting}
        >
          {isSubmitting ? '注册中...' : '创建账号'}
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
          已有账号？ <a href="#" onClick={(e) => {e.preventDefault(); onSwitch?.()}} className="text-black hover:underline">立即登录</a>
        </div>
      </form>
    </Form>
  );
};

export default AuthSignUpForm;
