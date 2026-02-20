import { cn } from "@/lib/utils";

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white",
        className,
      )}
    >
      {initials || "?"}
    </div>
  );
}
