"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageShell } from "@/components/app/PageShell";
import { MisconceptionCard } from "@/components/shared";
import { EmptyState } from "@/components/app/EmptyState";
import { AdminTabs } from "../Tabs";
import { CATALOGUE } from "@/fixtures/catalogue";
import { cn } from "@/lib/utils";

const SUBJECTS = ["all", "mathematics", "physics", "chemistry"] as const;

export default function CatalogueBrowser() {
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState<(typeof SUBJECTS)[number]>("all");

  const results = useMemo(() => {
    const needle = q.toLowerCase().trim();
    return CATALOGUE.filter((c) => {
      if (subject !== "all" && c.subject !== subject) return false;
      if (!needle) return true;
      return (
        c.name.toLowerCase().includes(needle) ||
        c.description.toLowerCase().includes(needle) ||
        c.code.toLowerCase().includes(needle)
      );
    });
  }, [q, subject]);

  return (
    <PageShell
      title="Misconception catalogue"
      description="The validated set of misconceptions the engine can diagnose, per subject."
      tabs={<AdminTabs />}
      wide
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, description or code"
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>
        <div className="flex gap-1">
          {SUBJECTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubject(s)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-medium capitalize transition-colors",
                subject === s
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        {results.length} {results.length === 1 ? "entry" : "entries"}
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {results.map((c) => (
          <MisconceptionCard
            key={`${c.subject}-${c.code}`}
            code={c.code}
            name={c.name}
            description={c.description}
            status={c.status}
          />
        ))}
      </div>

      {results.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={Search}
            title="Nothing matches that search"
            body="Try a broader term, or clear the subject filter."
          />
        </div>
      ) : null}
    </PageShell>
  );
}
