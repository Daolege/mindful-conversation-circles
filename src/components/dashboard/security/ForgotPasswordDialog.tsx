
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/authHooks";
import { useTranslations } from "@/hooks/useTranslations";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ForgotPasswordDialog = ({ open, onOpenChange }: ForgotPasswordDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslations();

  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast({
        title: t("errors:general"),
        description: t("auth:cannotRetrieveEmail"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + "/dashboard",
      });

      if (error) throw error;

      toast({
        title: t("auth:resetEmailSent"),
        description: t("auth:checkEmailToContinue"),
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: t("auth:sendFailed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 shadow-lg rounded-lg">
        <DialogHeader>
          <DialogTitle>{t("dashboard:forgotPassword")}</DialogTitle>
          <DialogDescription>
            {t("auth:resetEmailInstructions", { email: user?.email })}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t("common:cancel")}
          </Button>
          <Button onClick={handlePasswordReset} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("common:sending")}
              </>
            ) : (
              t("auth:sendResetEmail")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
