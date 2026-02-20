import { forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-shadow shadow-[0_10px_30px_rgba(34,211,238,0.25)]",
  secondary:
    "bg-white/10 text-white border border-white/10 hover:bg-white/15",
  ghost: "text-white hover:bg-white/5",
  outline: "border border-white/15 text-white hover:bg-white/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl font-medium tracking-tight focus:outline-none focus:ring-2 focus:ring-cyan-400/70 disabled:opacity-60 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
