"use client";

import { Bell, Download, Search, Share2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Topbar() {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/5 bg-slate-950/80 px-4 py-4 backdrop-blur-xl">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input className="pl-10" placeholder="Search meetings, owners, tasks..." />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" className="hidden sm:inline-flex">
          <Download className="h-4 w-4" /> Export all
        </Button>
        <Button variant="ghost" size="sm" className="text-slate-300">
          <Share2 className="h-4 w-4" /> Share
        </Button>
        <Button variant="ghost" size="sm" className="text-slate-300">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="primary" size="sm" className="hidden md:inline-flex">
          <Sparkles className="h-4 w-4" /> New summary
        </Button>
      </div>
    </div>
  );
}
