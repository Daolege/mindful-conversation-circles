
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/authHooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { PasswordStrengthIndicator } from "@/components/auth/PasswordStrengthIndicator";
import { useTranslations } from "@/hooks/useTranslations";

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, "Please enter your current password"),
  newPassword: z.string().min(6, "Please enter a new password"),
  confirmPassword: z.string().min(6, "Please confirm your new password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

interface PasswordChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PasswordChangeDialog = ({ open, onOpenChange }: PasswordChangeDialogProps) => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handlePasswordChange = async (values: PasswordChangeFormValues) => {
    if (!user) {
      toast.error(t("auth:pleaseLoginFirst"));
      return;
    }

    // Clear previous error messages
    setCurrentPasswordError(null);
    setIsSubmitting(true);
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: values.currentPassword,
      });

      if (signInError) {
        // Show current password error message
        setCurrentPasswordError(t("auth:incorrectCurrentPassword"));
        setIsSubmitting(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: values.newPassword,
      });

      if (updateError) {
        toast.error(t("auth:passwordUpdateFailed") + ": " + updateError.message);
      } else {
        toast.success(t("auth:passwordUpdatedSuccessfully"));
        form.reset(); // Reset form
        onOpenChange(false); // Close dialog
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(t("auth:errorChangingPassword"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    // Reset form and error states when dialog closes
    if (!newOpen) {
      form.reset();
      setCurrentPasswordError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{t("dashboard:changePassword")}</DialogTitle>
          <DialogDescription>
            {t("auth:enterCurrentAndNewPassword")}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handlePasswordChange)} className="space-y-4">
            <FormItem>
              <FormLabel>{t("auth:currentPassword")}</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder={t("auth:enterCurrentPassword")}
                    {...form.register("currentPassword")}
                    className={`pr-10 ${currentPasswordError ? "border-red-500 focus:ring-red-300" : ""}`}
                  />
                </FormControl>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {currentPasswordError && (
                <p className="text-sm font-medium text-red-500 mt-1">{currentPasswordError}</p>
              )}
              {form.formState.errors.currentPassword && (
                <p className="text-sm font-medium text-red-500">
                  {form.formState.errors.currentPassword.message}
                </p>
              )}
            </FormItem>
            
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth:newPassword")}</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder={t("auth:enterNewPassword")}
                        {...field}
                        className="pr-10"
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FormMessage />
                  <PasswordStrengthIndicator password={field.value} />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth:confirmNewPassword")}</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t("auth:reenterNewPassword")}
                        {...field}
                        className="pr-10"
                      />
                    </FormControl>
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">{t("common:cancel")}</Button>
              </DialogClose>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="transition-all hover:scale-105 hover:shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common:processing")}
                  </>
                ) : (
                  t("common:confirm")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
