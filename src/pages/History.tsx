import { useMemo, useRef, useState, useEffect } from "react";
import { historyStore, Meeting } from "@/lib/historyStore";
import { useSearchParams } from "react-router-dom";
import { CalendarRange, Filter, Search, Sparkles, Tag, X, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const allTags = ["Launch", "Marketing", "Enterprise", "Feedback", "Product", "Engineering", "Sales", "Training", "AI Generated"];

export function HistoryPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [query, setQuery] = useState(initialQuery);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDateRange, setShowDateRange] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMeetings(historyStore.getMeetings());
  }, []);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleNotes = (title: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  const filtered = useMemo(() => {
    return meetings.filter((m) => {
      const q = query.toLowerCase();
      const matchesQuery = m.title.toLowerCase().includes(q) ||
        m.owner.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)) ||
        (m.summary && m.summary.toLowerCase().includes(q)) ||
        m.keyPoints.some((k) => k.toLowerCase().includes(q));

      const matchesTags = activeTags.length === 0 || activeTags.some((t) => m.tags.includes(t));

      let matchesDate = true;
      if (dateFrom || dateTo) {
        const mDate = new Date(m.date);
        if (dateFrom) {
          matchesDate = matchesDate && mDate >= new Date(dateFrom);
        }
        if (dateTo) {
          matchesDate = matchesDate && mDate <= new Date(dateTo);
        }
      }

      return matchesQuery && matchesTags && matchesDate;
    });
  }, [meetings, query, activeTags, dateFrom, dateTo]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-400">All past meetings</p>
          <h1 className="text-2xl font-semibold">Meeting history</h1>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => searchRef.current?.focus()}
        >
          <Sparkles className="h-4 w-4" /> Smart search
        </Button>
      </div>

      <Card className="border-white/5 bg-white/5 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <Input
              ref={searchRef}
              placeholder="Search meetings, decisions, owners"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`border text-slate-200 ${showFilters ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-200" : "border-white/10"}`}
              onClick={() => setShowFilters((v) => !v)}
            >
              <Filter className="h-4 w-4" /> Filters
              {activeTags.length > 0 && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950">
                  {activeTags.length}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`border text-slate-200 ${showDateRange ? "border-cyan-400/50 bg-cyan-500/10 text-cyan-200" : "border-white/10"}`}
              onClick={() => setShowDateRange((v) => !v)}
            >
              <CalendarRange className="h-4 w-4" /> Date range
            </Button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-slate-400">Filter by tag</p>
              {activeTags.length > 0 && (
                <button
                  className="text-xs text-cyan-300 hover:text-cyan-100"
                  onClick={() => setActiveTags([])}
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${activeTags.includes(tag)
                    ? "border-cyan-400/50 bg-cyan-500/15 text-cyan-200"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:text-white"
                    }`}
                >
                  <Tag className="h-3 w-3" /> {tag}
                  {activeTags.includes(tag) && <X className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date range panel */}
        {showDateRange && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">Date range</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark] focus:border-cyan-400/50 focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-400">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white [color-scheme:dark] focus:border-cyan-400/50 focus:outline-none"
                />
              </div>
              {(dateFrom || dateTo) && (
                <button
                  className="mt-4 text-xs text-cyan-300 hover:text-cyan-100"
                  onClick={() => { setDateFrom(""); setDateTo(""); }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </Card>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-white/5 p-8 text-center text-slate-400">
          No meetings match your search or filters.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((meeting) => {
            const isExpanded = expandedNotes.has(meeting.title);
            return (
              <Card key={meeting.title} className="border-white/5 bg-white/5 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">{meeting.date}</p>
                    <h3 className="text-lg font-semibold">{meeting.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-300">
                      <Badge className="bg-white/10 text-white">Owner: {meeting.owner}</Badge>
                      <Badge tone="success">{meeting.actions.length} action items</Badge>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="self-start"
                    onClick={() => toggleNotes(meeting.title)}
                  >
                    {isExpanded ? (
                      <><ChevronUp className="h-3 w-3" /> Hide</>
                    ) : (
                      <>View notes</>
                    )}
                  </Button>
                </div>

                {/* Expanded notes */}
                {isExpanded && (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-200 mb-3">Key Points</p>
                    <ul className="space-y-2">
                      {meeting.keyPoints.map((note) => (
                        <li key={note} className="flex items-start gap-2 text-sm text-slate-200">
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-400" />
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                  {meeting.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => { setActiveTags([tag]); setShowFilters(true); }}
                      className="inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1 hover:bg-white/10 transition"
                    >
                      <Tag className="h-3 w-3 text-cyan-300" /> {tag}
                    </button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
