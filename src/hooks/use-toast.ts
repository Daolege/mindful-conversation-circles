
// 从 sonner 导入基础 toast 函数
import { toast as sonnerToast, ToastT, ExternalToast } from "sonner";

// 定义我们期望的 shadcn 风格的 toast 参数类型
export interface ToastProps {
  title?: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  duration?: number; // 添加 duration 属性到接口
}

// 创建一个 toasts 存储数组，用于兼容 shadcn 风格的 toaster
export const toasts: { id: string | number; title?: string; description?: React.ReactNode; action?: React.ReactNode }[] = [];

// 添加活跃的toast跟踪
const activeToastIds = new Set<string | number>();

// 创建适配器函数，将 shadcn 风格的参数转换为 sonner 格式
export function toast(props: ToastProps | string) {
  // 处理字符串参数情况
  if (typeof props === 'string') {
    const id = sonnerToast(props);
    // 先转换为unknown，再转换为目标类型
    activeToastIds.add(id as unknown as string | number);
    return id;
  }

  const { title, description, variant, action, duration, ...rest } = props;
  
  // 将 shadcn variant 映射到 sonner 类型
  let type: "success" | "info" | "warning" | "error" | "default" = "default";
  if (variant === 'destructive') type = "error";
  else if (variant === 'success') type = "success"; 
  else if (variant === 'warning') type = "warning";
  else if (variant === 'info') type = "info";
  
  // 组合消息内容
  const message = title || "";
  const options: ExternalToast = {
    description: description,
    action: action,
    // 设置更短的默认持续时间，避免toast持续时间过长
    duration: duration || 3000,
    onDismiss: (id) => {
      // 当 toast 被关闭时，从活跃列表中移除
      // 使用两步类型转换: 先转换为unknown，再转换为目标类型
      if (activeToastIds.has(id as unknown as string | number)) {
        activeToastIds.delete(id as unknown as string | number);
      }
    },
    ...rest
  };
  
  // 调用 sonner 的 toast
  const id = sonnerToast[type](message, options);
  // 先转换为unknown，再转换为目标类型
  activeToastIds.add(id as unknown as string | number);
  return id;
}

// 为了兼容性保留 useToast hook
export function useToast() {
  return {
    toast,
    toasts, // 保留这个数组，以便 shadcn Toaster 组件可以使用它
    dismiss: (id?: string | number) => {
      if (id) {
        sonnerToast.dismiss(id);
        if (activeToastIds.has(id)) {
          activeToastIds.delete(id);
        }
      } else {
        // 清除所有活跃的 toasts
        sonnerToast.dismiss();
        activeToastIds.clear();
      }
    },
    // 添加清除所有toasts的方法
    dismissAll: () => {
      sonnerToast.dismiss();
      activeToastIds.clear();
    }
  };
}

// 改进的全局函数用于在路由变化或页面卸载时清除所有toasts
export const dismissAllToasts = () => {
  try {
    // 记录当前活跃的toast数量，用于调试
    console.log('[dismissAllToasts] Dismissing all toasts, active count:', activeToastIds.size);
    
    // 先使用sonner的dismiss方法清除所有视觉toast
    sonnerToast.dismiss();
    
    // 再清除内部跟踪的活跃ID集合
    activeToastIds.clear();
    
    // 兜底强制清理所有可能挂起的toast
    for (let i = 0; i < 100; i++) {
      try {
        sonnerToast.dismiss(i);
      } catch (e) {
        // 忽略可能的错误
      }
    }
    
    console.log('[dismissAllToasts] All toasts dismissed, remaining count:', activeToastIds.size);
  } catch (error) {
    console.error('[dismissAllToasts] Error dismissing toasts:', error);
    // 如果出错，尝试更彻底的清理方式
    try {
      // 尝试通过直接操作DOM方式清除toast元素(兜底方案，通常不应该这样做)
      const toastElements = document.querySelectorAll('[role="status"]');
      toastElements.forEach(el => {
        try {
          if (el.parentElement) {
            el.parentElement.removeChild(el);
          }
        } catch (e) {
          // 忽略错误
        }
      });
    } catch (e) {
      // 完全忽略
    }
  }
};

// 导出活跃的toast IDs集合，便于调试和管理
export const getActiveToastIds = () => [...activeToastIds];
