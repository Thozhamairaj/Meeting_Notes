import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-cyan-400/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/40",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
