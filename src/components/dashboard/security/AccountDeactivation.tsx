
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
import { useTranslations } from "@/hooks/useTranslations";

export const AccountDeactivation = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslations();
  
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
        title: t("auth:enterCurrentPassword"),
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

      if (signInError) throw new Error(t("auth:passwordVerificationFailed"));

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
        title: t("auth:verificationCodeSent"),
        description: t("auth:checkEmailForCode"),
      });
    } catch (error: any) {
      toast({
        title: t("errors:operationFailed"),
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
        title: t("auth:enterVerificationCode"),
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
        title: t("auth:accountDeactivated"),
        description: t("auth:accountSuccessfullyDeactivated"),
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: t("auth:deactivationFailed"),
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
        {t("dashboard:deactivationWarning")}
      </p>

      <Button 
        variant="destructive"
        onClick={() => setIsDeleteDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <AlertTriangle className="h-4 w-4" />
        {t("dashboard:deactivateAccount")}
      </Button>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t("auth:confirmAccountDeactivation")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <p>
                  {t("auth:permanentDeletionWarning", { 
                    strong: (text) => <strong className="text-destructive">{text}</strong> 
                  })}
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>{t("auth:profileInformation")}</li>
                  <li>{t("auth:courseProgress")}</li>
                  <li>{t("auth:orderHistory")}</li>
                </ul>
                <p className="font-semibold">{t("auth:emailReregistrationWarning")}</p>
              
                {step === 1 ? (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">{t("auth:currentPassword")}</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t("auth:enterPasswordToVerify")}
                      />
                    </div>
                    
                    <Button 
                      onClick={handleRequestVerificationCode}
                      disabled={isLoading || !password}
                      variant="destructive"
                      className="w-full"
                    >
                      {isLoading ? t("common:processing") : t("auth:sendVerificationCode")}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="verification-code">{t("auth:emailVerificationCode")}</Label>
                      <Input
                        id="verification-code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder={t("auth:enterCodeSentToEmail")}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("auth:codeSentTo", { email: user?.email })}
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
              {t("common:cancel")}
            </Button>
            {step === 2 && (
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={isLoading || !verificationCode}
              >
                {isLoading ? t("common:processing") : t("auth:confirmDeactivation")}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
