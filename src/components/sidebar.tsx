"use client";

import { useNavigate, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, History, Settings2, Sparkles, LogOut, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/toast";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/history", label: "Meeting history", icon: History },
  { href: "/export", label: "Exports", icon: ArrowUpRight, disabled: true },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSignOut = () => {
    navigate("/auth");
  };

  const handlePreferences = () => {
    toast("Preferences panel coming soon.", "info");
  };

  const handleUpgrade = () => {
    navigate("/auth");
  };

  return (
    <aside className="hidden min-h-screen w-64 flex-col justify-between border-r border-white/10 bg-white/5 px-5 py-6 lg:flex">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500 text-slate-950 font-bold">
            MM
          </div>
          <div>
            <p className="text-base font-semibold">MeetMind AI</p>
            <p className="text-xs text-slate-400">Notes &amp; Actions</p>
          </div>
        </div>

        <nav className="space-y-2">
          {links.map(({ href, label, icon: Icon, disabled }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                to={href}
                title={disabled ? "Coming soon" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-cyan-500/15 text-white border border-cyan-400/30"
                    : "text-slate-300 hover:bg-white/5",
                  disabled && "pointer-events-none opacity-40",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
                {disabled && (
                  <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-400">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <Sparkles className="h-4 w-4 text-cyan-300" /> Demo mode enabled
          </div>
          <p className="mt-1 text-xs text-slate-400">Using sample Claude output and mock API calls.</p>
          <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={handleUpgrade}>
            Upgrade workspace
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar name="Jesse Lin" />
          <div>
            <p className="text-sm font-semibold">Jesse Lin</p>
            <p className="text-xs text-slate-400">Product Lead</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-300" onClick={handlePreferences}>
          <Settings2 className="h-4 w-4" /> Preferences
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-300" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  );
}
