import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-stone-300 bg-transparent px-3 py-2.5 text-sm text-right outline-none placeholder:text-neutral-400 disabled:cursor-not-allowed disabled:opacity-50 text-zinc-800",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
