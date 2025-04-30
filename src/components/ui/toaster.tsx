
import { useToast } from "@/hooks/use-toast";
import { Toaster as SonnerToaster } from "sonner";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();
  
  // 使用 sonner 的 Toaster 组件，而不是旧的 shadcn Toaster
  return <SonnerToaster />;
  
  // 注释掉旧的 shadcn Toaster 实现，因为我们现在直接使用 sonner
  /*
  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
  */
}
