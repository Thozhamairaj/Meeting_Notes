import { cn } from "@/lib/utils";

export function Label({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <label className={cn("text-sm font-medium text-slate-200", className)}>{children}</label>;
}
