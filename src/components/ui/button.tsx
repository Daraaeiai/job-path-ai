import * as React from "react";
import { cn } from "@/lib/utils";

const variantStyles = {
  default:
    "bg-gradient-to-l from-neutral-500 to-stone-500 text-white hover:opacity-90",
  secondary: "bg-neutral-500 text-white hover:opacity-90",
  outline:
    "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
} as const;

const sizeStyles = {
  default: "h-14 px-8 py-3 rounded-[46px]",
  sm: "h-9 rounded-lg px-4",
  lg: "h-11 rounded-lg px-8",
  icon: "h-10 w-10 rounded-xl",
} as const;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex justify-center items-center gap-3 whitespace-nowrap text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button };
