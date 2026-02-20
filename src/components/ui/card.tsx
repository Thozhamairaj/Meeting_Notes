import { cn } from "@/lib/utils";

export function Card({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("glass rounded-2xl border border-white/10 shadow-xl", className)}>{children}</div>;
}
