
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const emailFormSchema = z.object({
  email: z.string()
    .min(1, "邮箱不能为空")
    .email("请输入有效的邮箱地址")
});

const codeFormSchema = z.object({
  code: z.string().length(4, "验证码必须是4位数字")
});

interface Props {
  onBack: () => void;
}

const ForgotPasswordForm = ({ onBack }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const codeForm = useForm<z.infer<typeof codeFormSchema>>({
    resolver: zodResolver(codeFormSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmitEmail = async (values: z.infer<typeof emailFormSchema>) => {
    setIsLoading(true);
    setTimeout(() => {
      setUserEmail(values.email);
      toast.success("验证码已发送", {
        description: "请检查您的邮箱获取验证码"
      });
      setIsLoading(false);
      setStep('code');
      startResendCountdown();
    }, 1500);
  };

  const startResendCountdown = () => {
    setResendDisabled(true);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendCode = async () => {
    if (resendDisabled) return;
    setIsLoading(true);
    setTimeout(() => {
      toast.success("新的验证码已发送", {
        description: "请检查您的邮箱获取新的验证码"
      });
      setIsLoading(false);
      startResendCountdown();
    }, 1500);
  };

  const onSubmitCode = async (values: z.infer<typeof codeFormSchema>) => {
    setIsLoading(true);
    setTimeout(() => {
      toast.success("验证成功", {
        description: "您的注册邮箱为" + userEmail
      });
      setIsLoading(false);
      onBack();
    }, 1500);
  };

  useEffect(() => {
    if (step === 'email') {
      setVerificationCode('');
      codeForm.reset();
    }
  }, [step, codeForm]);

  if (step === 'code') {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            输入验证码
          </h1>
          <p className="text-sm text-muted-foreground">
            我们已将验证码发送至 {userEmail}
          </p>
        </div>

        <Form {...codeForm}>
          <form onSubmit={codeForm.handleSubmit(onSubmitCode)} className="space-y-4">
            <FormField
              control={codeForm.control}
              name="code"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        setVerificationCode(value);
                      }}
                      render={({ slots }) => (
                        <InputOTPGroup className="gap-2">
                          {slots.map((slot, i) => (
                            <InputOTPSlot 
                              key={i} 
                              {...slot} 
                              index={i}
                              className="w-14 h-14 text-xl border-gray-300 focus:border-knowledge-primary focus:ring-knowledge-primary"
                            />
                          ))}
                        </InputOTPGroup>
                      )}
                    />
                  </div>
                  <FormMessage className="text-xs text-center" />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full h-11 bg-knowledge-primary hover:bg-knowledge-secondary text-white font-medium transition-colors rounded-lg"
                disabled={isLoading || verificationCode.length !== 4}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    验证中...
                  </span>
                ) : "验证"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendCode}
                disabled={isLoading || resendDisabled}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {resendDisabled ? `重新发送 (${countdown}s)` : "重新发送验证码"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('email')}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回邮箱验证
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          找回邮箱
        </h1>
        <p className="text-sm text-muted-foreground">
          输入您的手机号或常用邮箱，我们将帮您找回注册邮箱
        </p>
      </div>

      <Form {...emailForm}>
        <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
          <FormField
            control={emailForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-gray-700">邮箱或手机号</FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      className="pl-10 h-11 bg-gray-50/50 border-gray-200 focus:border-knowledge-primary focus:ring-knowledge-primary rounded-lg"
                      placeholder="输入邮箱或手机号"
                      disabled={isLoading}
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 bg-knowledge-primary hover:bg-knowledge-secondary text-white font-medium transition-colors rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                发送中...
              </span>
            ) : "获取验证码"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={onBack}
            disabled={isLoading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回登录
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ForgotPasswordForm;
