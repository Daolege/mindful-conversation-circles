
// 从 hooks 目录导入 toast 函数及类型
import { useToast as originalUseToast, toast as originalToast, ToastProps } from "@/hooks/use-toast";

// 重新导出这些函数和类型，保持一致性
export const useToast = originalUseToast;
export const toast = originalToast;
export type { ToastProps };
