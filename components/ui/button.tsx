import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
      variants: {
        variant: {
          default: "bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary",
          secondary: "bg-white text-text border-2 border-primary hover:bg-primary/5 focus-visible:ring-primary",
          success: "bg-complementary-emerald text-white hover:bg-complementary-emerald-dark focus-visible:ring-complementary-emerald",
          destructive: "bg-accent-red text-white hover:bg-accent-red-dark focus-visible:ring-accent-red",
          outline: "border-2 border-primary/30 bg-transparent hover:bg-primary/5 focus-visible:ring-primary",
          ghost: "hover:bg-primary/10 hover:text-primary focus-visible:ring-primary",
          link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary",
        },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-12 px-8 py-4",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

