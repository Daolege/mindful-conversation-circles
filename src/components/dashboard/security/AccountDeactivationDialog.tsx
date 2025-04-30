import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/authHooks";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const deactivationSchema = z.object({
  currentPassword: z.string().min(1, "密码不能为空"),
  verificationCode: z.string().length(4, "验证码必须是4位数字").regex(/^\d{4}$/, "验证码必须是4位数字"),
  confirmEmail: z.string().email("请输入有效邮箱"),
  confirmText: z.literal("DELETE", {
    invalid_type_error: "请输入 DELETE 以确认注销，必须区分大小写",
  }),
  confirmUnderstand: z.boolean().refine(val => val === true, {
    message: "您必须确认理解账户注销的后果",
  }),
});

type DeactivationFormValues = z.infer<typeof deactivationSchema>;

interface AccountDeactivationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AccountDeactivationDialog = ({ open, onOpenChange }: AccountDeactivationDialogProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const form = useForm<DeactivationFormValues>({
    resolver: zodResolver(deactivationSchema),
    defaultValues: {
      currentPassword: "",
      verificationCode: "",
      confirmEmail: "",
      confirmText: "" as any,
      confirmUnderstand: false,
    },
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      const isComplete = Boolean(
        value.currentPassword &&
        value.verificationCode?.length === 4 &&
        value.confirmEmail &&
        value.confirmText === "DELETE" &&
        value.confirmUnderstand
      );
      setIsFormComplete(isComplete);
      
      if (passwordError && value.currentPassword) setPasswordError(null);
      if (emailError && value.confirmEmail) setEmailError(null);
      if (verificationError && value.verificationCode) setVerificationError(null);
    });
    return () => subscription.unsubscribe();
  }, [form.watch, passwordError, emailError, verificationError]);

  const handleSendVerification = async () => {
    const currentPassword = form.getValues("currentPassword");
    if (!currentPassword) {
      form.setError("currentPassword", { message: "请先输入当前密码" });
      return;
    }
    
    if (!user?.email) {
      toast.error("无法获取用户邮箱信息");
      return;
    }

    setPasswordError(null);
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordError("当前密码不正确，请重新输入");
        form.setError("currentPassword", { message: "当前密码不正确，请重新输入" });
        toast.error("当前密码不正确，请重新输入");
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;
      
      setVerificationSent(true);
      toast.success("验证码已发送到您的邮箱");
    } catch (error) {
      toast.error("发送验证码失败，请重试");
    }
  };

  const handleDeactivation = async (values: DeactivationFormValues) => {
    if (!user) {
      toast.error("请先登录");
      return;
    }

    setIsSubmitting(true);
    setPasswordError(null);
    setEmailError(null);
    setVerificationError(null);
    form.clearErrors();

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: values.currentPassword,
      });

      if (signInError) {
        setPasswordError("当前密码不正确，请重新输入");
        form.setError("currentPassword", { message: "当前密码不正确，请重新输入" });
        toast.error("当前密码不正确，请重新输入");
        setIsSubmitting(false);
        return;
      }
      
      if (values.confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
        setEmailError("邮箱地址不匹配，请输入当前账号的邮箱地址");
        form.setError("confirmEmail", { message: "邮箱地址不匹配，请输入当前账号的邮箱地址" });
        toast.error("邮箱地址不匹配，请输入当前账号的邮箱地址");
        setIsSubmitting(false);
        return;
      }

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: user.email,
        token: values.verificationCode,
        type: 'email',
      });

      if (verifyError) {
        // IMPORTANT: Only set the error ONCE - via form error
        form.setError("verificationCode", { message: "验证码无效或已过期，请重新获取" });
        setIsSubmitting(false);
        return;
      }

      // 所有验证通过后，调用删除账户的edge function
      const { error } = await supabase.functions.invoke("delete-account", {
        body: { verification_code: values.verificationCode }
      });

      if (error) {
        console.error("Error deleting account:", error);
        toast.error("账户注销失败: " + error.message);
        setIsSubmitting(false);
        return;
      }

      // 成功删除账户后，登出并导航到首页
      await signOut();
      toast.success("账户已成功注销");
      navigate("/");
    } catch (error) {
      console.error("Account deactivation error:", error);
      toast.error("账户注销时发生错误，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
      setPasswordError(null);
      setEmailError(null);
      setVerificationError(null);
      setVerificationSent(false);
      setIsFormComplete(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleDialogOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            注销账户
          </AlertDialogTitle>
          <AlertDialogDescription className="text-red-500">
            此操作将<span className="font-bold">永久删除</span>您的账户和所有相关数据，且无法恢复。
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleDeactivation)} className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              <p className="font-medium mb-2">注销账户将导致：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>所有个人资料将被删除</li>
                <li>您将失去对已购课程的访问权限</li>
                <li>所有学习进度将被清除</li>
                <li>订单和交易记录将被匿名化</li>
              </ul>
            </div>

            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>当前密码</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="请输入当前密码"
                      {...field}
                      className={`${passwordError ? "border-red-300 focus-visible:ring-red-500" : ""}`}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>确认您的邮箱地址</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={`请输入您的邮箱地址: ${user?.email}`}
                      {...field}
                      autoComplete="off"
                      className={`${emailError ? "border-red-300 focus-visible:ring-red-500" : ""}`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col space-y-2">
              <FormField
                control={form.control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>邮箱验证码</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input 
                          placeholder="请输入4位数字验证码"
                          maxLength={4}
                          {...field}
                          autoComplete="off"
                          className={`${verificationError ? "border-red-300 focus-visible:ring-red-500" : ""}`}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSendVerification}
                        disabled={verificationSent || !form.getValues("currentPassword")}
                      >
                        {verificationSent ? "已发送" : "获取验证码"}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="confirmText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>请输入 "DELETE" 确认注销</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder='请输入 "DELETE"'
                      {...field}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmUnderstand"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-red-200 p-4 bg-red-50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      我理解账户注销是永久性的，且所有数据将无法恢复
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            <AlertDialogFooter className="mt-6 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => handleDialogOpenChange(false)}
              >
                取消
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                disabled={!isFormComplete || isSubmitting}
                className={`transition-all ${isFormComplete ? 'bg-red-600 hover:bg-red-700' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在处理...
                  </>
                ) : (
                  "确认注销账户"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
