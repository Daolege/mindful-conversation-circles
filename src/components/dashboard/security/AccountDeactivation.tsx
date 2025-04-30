
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/authHooks";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Shield, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AccountDeactivation = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRequestedCode, setHasRequestedCode] = useState(false);

  const resetState = () => {
    setPassword("");
    setVerificationCode("");
    setStep(1);
    setIsLoading(false);
    setHasRequestedCode(false);
    setIsDeleteDialogOpen(false);
  };

  const handleRequestVerificationCode = async () => {
    if (!password) {
      toast({
        title: "请输入当前密码",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // 验证当前密码
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password,
      });

      if (signInError) throw new Error("密码验证失败，请检查密码是否正确");

      // 发送验证邮件
      const { error: mailError } = await supabase.auth.resetPasswordForEmail(
        user?.email || "",
        {
          redirectTo: window.location.origin + "/dashboard",
        }
      );

      if (mailError) throw mailError;

      setHasRequestedCode(true);
      setStep(2);
      toast({
        title: "验证码已发送",
        description: "请检查您的邮箱收取验证码",
      });
    } catch (error: any) {
      toast({
        title: "操作失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!verificationCode) {
      toast({
        title: "请输入验证码",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.functions.invoke("delete-account", {
        body: { 
          verification_code: verificationCode 
        }
      });

      if (error) throw error;

      await signOut();
      
      toast({
        title: "账户已注销",
        description: "您的账户已成功注销，感谢您的使用",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "注销失败",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        注销账户将永久删除您的所有数据，此操作不可撤销。
      </p>

      <Button 
        variant="destructive"
        onClick={() => setIsDeleteDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <AlertTriangle className="h-4 w-4" />
        注销账户
      </Button>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              确认注销账户？
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <p>
                  此操作将<strong className="text-destructive">永久删除</strong>您的账户和所有相关数据，包括：
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>个人资料信息</li>
                  <li>课程学习进度</li>
                  <li>订单和购买记录</li>
                </ul>
                <p className="font-semibold">注销后，该邮箱将无法再次用于注册。</p>
              
                {step === 1 ? (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">当前密码</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="输入当前密码以验证身份"
                      />
                    </div>
                    
                    <Button 
                      onClick={handleRequestVerificationCode}
                      disabled={isLoading || !password}
                      variant="destructive"
                      className="w-full"
                    >
                      {isLoading ? "处理中..." : "发送验证码"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">邮箱验证码</Label>
                      <Input
                        id="verification-code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="输入发送到您邮箱的验证码"
                      />
                      <p className="text-xs text-muted-foreground">
                        验证码已发送至 {user?.email}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={resetState}
            >
              取消
            </Button>
            {step === 2 && (
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isLoading || !verificationCode}
              >
                {isLoading ? "处理中..." : "确认注销"}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
