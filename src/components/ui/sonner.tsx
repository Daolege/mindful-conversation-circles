
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-gray-800 dark:group-[.toaster]:text-gray-100",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group toast bg-green-50 text-green-800 border-green-200",
          error: "group toast bg-red-50 text-red-800 border-red-200",
          warning: "group toast bg-yellow-50 text-yellow-800 border-yellow-200",
          info: "group toast bg-blue-50 text-blue-800 border-blue-200",
          loading: "group toast bg-gray-50 text-gray-800 border-gray-200"
        },
        duration: 5000,
      }}
      {...props}
    />
  )
}

export { Toaster }
