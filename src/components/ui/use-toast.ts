
// 正确从hooks目录导入toast函数
import { useToast as originalUseToast, toast as originalToast } from "@/hooks/use-toast";

// 重新导出这些函数，保持一致性
export const useToast = originalUseToast;
export const toast = originalToast;
