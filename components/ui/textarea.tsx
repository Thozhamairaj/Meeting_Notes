import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-slate-400 focus:border-cyan-400/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/40",
          className,
        )}
        {...props}
      />
    );
  },
);

Textarea.displayName = "Textarea";
