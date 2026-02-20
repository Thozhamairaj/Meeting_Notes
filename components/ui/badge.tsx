import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "default",
  className,
}: React.PropsWithChildren<{ tone?: "default" | "success" | "warning" | "danger"; className?: string }>) {
  const tones = {
    default: "bg-white/10 text-white",
    success: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-200 border border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-200 border border-rose-500/30",
  } as const;

  return (
    <span className={cn("rounded-full px-3 py-1 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}
