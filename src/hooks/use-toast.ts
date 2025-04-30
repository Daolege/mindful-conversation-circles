
// 从 sonner 导入基础 toast 函数
import { toast as sonnerToast, ToastT, ExternalToast } from "sonner";

// 定义我们期望的 shadcn 风格的 toast 参数类型
export interface ToastProps {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
}

// 创建一个 toasts 存储数组，用于兼容 shadcn 风格的 toaster
export const toasts: { id: string | number; title?: string; description?: React.ReactNode; action?: React.ReactNode }[] = [];

// 创建适配器函数，将 shadcn 风格的参数转换为 sonner 格式
export function toast(props: ToastProps | string) {
  // 处理字符串参数情况
  if (typeof props === 'string') {
    return sonnerToast(props);
  }

  const { title, description, variant, action, ...rest } = props;
  
  // 将 shadcn variant 映射到 sonner 类型
  let type: ToastT = 'default';
  if (variant === 'destructive') type = 'error';
  else if (variant === 'success') type = 'success'; 
  else if (variant === 'warning') type = 'warning';
  else if (variant === 'info') type = 'info';
  
  // 组合消息内容
  const message = title;
  const options: ExternalToast = {
    description: description,
    action: action,
    ...rest
  };
  
  // 调用 sonner 的 toast
  return sonnerToast[type](message, options);
}

// 为了兼容性保留 useToast hook
export function useToast() {
  return {
    toast,
    toasts, // 保留这个数组，以便 shadcn Toaster 组件可以使用它
    dismiss: sonnerToast.dismiss,
    // 其他可能需要的 sonner 方法
  };
}
