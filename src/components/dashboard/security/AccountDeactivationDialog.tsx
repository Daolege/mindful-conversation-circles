
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
import { useTranslations } from "@/hooks/useTranslations";

const deactivationSchema = z.object({
  currentPassword: z.string().min(1, "Password is required"),
  verificationCode: z.string().length(4, "Verification code must be 4 digits").regex(/^\d{4}$/, "Verification code must be 4 digits"),
  confirmEmail: z.string().email("Please enter a valid email"),
  confirmText: z.literal("DELETE", {
    invalid_type_error: "Please type DELETE to confirm deactivation, case sensitive",
  }),
  confirmUnderstand: z.boolean().refine(val => val === true, {
    message: "You must confirm you understand the consequences",
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
  const { t } = useTranslations();
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
      form.setError("currentPassword", { message: t("auth:enterCurrentPasswordFirst") });
      return;
    }
    
    if (!user?.email) {
      toast.error(t("auth:cannotRetrieveEmail"));
      return;
    }

    setPasswordError(null);
    
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setPasswordError(t("auth:incorrectPassword"));
        form.setError("currentPassword", { message: t("auth:incorrectPassword") });
        toast.error(t("auth:incorrectPassword"));
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;
      
      setVerificationSent(true);
      toast.success(t("auth:verificationCodeSent"));
    } catch (error) {
      toast.error(t("auth:failedToSendVerificationCode"));
    }
  };

  const handleDeactivation = async (values: DeactivationFormValues) => {
    if (!user) {
      toast.error(t("auth:pleaseLoginFirst"));
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
        setPasswordError(t("auth:incorrectPassword"));
        form.setError("currentPassword", { message: t("auth:incorrectPassword") });
        toast.error(t("auth:incorrectPassword"));
        setIsSubmitting(false);
        return;
      }
      
      if (values.confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
        setEmailError(t("auth:emailAddressDoesNotMatch"));
        form.setError("confirmEmail", { message: t("auth:emailAddressDoesNotMatch") });
        toast.error(t("auth:emailAddressDoesNotMatch"));
        setIsSubmitting(false);
        return;
      }

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: user.email,
        token: values.verificationCode,
        type: 'email',
      });

      if (verifyError) {
        form.setError("verificationCode", { message: t("auth:invalidOrExpiredVerificationCode") });
        setIsSubmitting(false);
        return;
      }

      // Call the delete account edge function after all validations pass
      const { error } = await supabase.functions.invoke("delete-account", {
        body: { verification_code: values.verificationCode }
      });

      if (error) {
        console.error("Error deleting account:", error);
        toast.error(t("auth:accountDeactivationFailed") + ": " + error.message);
        setIsSubmitting(false);
        return;
      }

      // After successful account deletion, sign out and navigate to home page
      await signOut();
      toast.success(t("auth:accountSuccessfullyDeactivated"));
      navigate("/");
    } catch (error) {
      console.error("Account deactivation error:", error);
      toast.error(t("auth:errorDeactivatingAccount"));
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
            {t("dashboard:accountDeactivation")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-red-500">
            {t("auth:accountDeactivationDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleDeactivation)} className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              <p className="font-medium mb-2">{t("auth:deactivationConsequences")}:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>{t("auth:profileDeleted")}</li>
                <li>{t("auth:courseAccessLost")}</li>
                <li>{t("auth:progressCleared")}</li>
                <li>{t("auth:ordersAnonymized")}</li>
              </ul>
            </div>

            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("auth:currentPassword")}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder={t("auth:enterCurrentPassword")}
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
                  <FormLabel>{t("auth:confirmYourEmailAddress")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t("auth:enterEmailAddress", { email: user?.email })}
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
                    <FormLabel>{t("auth:emailVerificationCode")}</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input 
                          placeholder={t("auth:enter4DigitCode")}
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
                        {verificationSent ? t("auth:sent") : t("auth:getVerificationCode")}
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
                  <FormLabel>{t("auth:typeDeleteToConfirm")}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={t("auth:typeDELETE")}
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
                      {t("auth:understandDeactivationPermanent")}
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
                {t("common:cancel")}
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
                    {t("common:processing")}
                  </>
                ) : (
                  t("auth:confirmAccountDeactivation")
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
};
