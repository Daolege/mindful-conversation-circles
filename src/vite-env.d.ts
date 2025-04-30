
/// <reference types="vite/client" />

// 扩展Window接口，添加自定义属性
interface Window {
  __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
    supportsFiber: boolean;
    inject: () => void;
    onCommitFiberRoot: () => void;
    onCommitFiberUnmount: () => void;
  };
  __DISABLE_DEV_TOOLS?: boolean;
  __DISABLE_HMR?: boolean;
}

// 扩展Vite的热更新上下文
interface ImportMeta {
  readonly hot?: {
    readonly data: any;
    accept(): void;
    accept(cb: (mod: any) => void): void;
    accept(dep: string, cb: (mod: any) => void): void;
    accept(deps: string[], cb: (mods: any[]) => void): void;
    dispose(cb: (data: any) => void): void;
    decline(): void;
    invalidate(): void;
    on(event: string, cb: (...args: any[]) => void): void;
  };
}
