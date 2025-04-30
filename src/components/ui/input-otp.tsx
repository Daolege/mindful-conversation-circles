
import * as React from "react"
import { OTPInput, OTPInputContext, SlotProps } from "input-otp"
import { Dot } from "lucide-react"
import { cn } from "@/lib/utils"

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-[:disabled]:opacity-50",
      containerClassName
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
))
InputOTP.displayName = "InputOTP"

const InputOTPGroup = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
))
InputOTPGroup.displayName = "InputOTPGroup"

const InputOTPSlot = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div"> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const slots = inputOTPContext?.slots || []
  const slot = slots[index]
  const char = slot?.char || ''
  const hasFakeCaret = !!slot?.hasFakeCaret
  const isActive = slot?.hasFakeCaret || false

  // 添加更多调试信息来查看可用的方法和属性
  React.useEffect(() => {
    if (inputOTPContext) {
      console.log("OTPInputContext available methods:", Object.keys(inputOTPContext));
      console.log("Complete OTPInputContext object:", inputOTPContext);
    }
  }, [inputOTPContext]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-14 w-14 items-center justify-center rounded-md border border-input text-xl transition-all cursor-text",
        isActive && "z-10 ring-2 ring-ring ring-offset-background",
        className
      )}
      onClick={() => {
        // 使用正确的方法聚焦OTP输入框
        if (inputOTPContext) {
          console.log("InputOTPSlot onClick: 尝试聚焦到输入框", index);
          // 由于 setActiveInput 不存在，我们尝试使用 focus 方法
          try {
            // 尝试使用内置的focus方法
            const inputElement = document.querySelector('input[aria-label="Please enter your OTP character"]');
            if (inputElement) {
              (inputElement as HTMLInputElement).focus();
              console.log("通过DOM选择器成功聚焦到输入框");
            } else {
              console.log("无法找到OTP输入框元素");
            }
          } catch (error) {
            console.error("聚焦OTP输入框时出错:", error);
          }
        } else {
          console.log("InputOTPSlot onClick: 无法找到OTP上下文");
        }
      }}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = "InputOTPSlot"

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
))
InputOTPSeparator.displayName = "InputOTPSeparator"

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
