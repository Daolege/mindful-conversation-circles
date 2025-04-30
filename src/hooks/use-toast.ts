
// 正确从 sonner 导入 toast
import { toast as sonnerToast } from "sonner";

// 重新导出这些函数，保持与 UI 组件库兼容的 API
export const toast = sonnerToast;

// 为了兼容性保留 useToast hook
export function useToast() {
  return {
    toast: sonnerToast
  };
}
