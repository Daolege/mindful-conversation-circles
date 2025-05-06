
import { useToast } from "@/hooks/use-toast";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  // 使用 sonner 的 Toaster 组件
  return (
    <SonnerToaster 
      position="top-right"
      closeButton={true}
      richColors={true}
      expand={false}
      duration={3000}
      visibleToasts={3}
    />
  );
}
