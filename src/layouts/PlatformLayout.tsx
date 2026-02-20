import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function PlatformLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-950 text-white lg:flex">
      <Sidebar />
      <div className="flex-1 min-h-screen">
        <Topbar />
        <div className="px-4 py-6 lg:px-8">{children}</div>
      </div>
    </div>
  );
}
