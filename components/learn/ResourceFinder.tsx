"use client";

import { useEffect, useState } from "react";
import { PlayCircle, FileText, MousePointerClick, Search } from "lucide-react";
import type { LearnResource } from "@/fixtures/learn/types";
import { Surface } from "@/components/app/primitives";
import { cn } from "@/lib/utils";

const SEARCH_MS = 800;

const KIND_ICON = {
  video: PlayCircle,
  article: FileText,
  interactive: MousePointerClick,
} as const;

/**
 * Scripted "search the web, then rank results" (Feature 8b). No real search
 * runs — the query and every result are fixture data — but the sequence
 * (searching → ranked cards) sells the story honestly, labelled "scripted".
 */
export function ResourceFinder({
  query,
  resources,
}: {
  query: string;
  resources: LearnResource[];
}) {
  const [phase, setPhase] = useState<"searching" | "done">("searching");

  useEffect(() => {
    const timer = setTimeout(() => setPhase("done"), SEARCH_MS);
    return () => clearTimeout(timer);
  }, []);

  if (phase === "searching") {
    return (
      <Surface className="flex items-center gap-2.5 p-4 text-sm text-muted-foreground">
        <Search className="size-4 shrink-0 animate-pulse" aria-hidden />
        Searching the web for &ldquo;{query}&rdquo;…
        <span className="flex gap-1">
          <Dot />
          <Dot delay="150ms" />
          <Dot delay="300ms" />
        </span>
      </Surface>
    );
  }

  return (
    <div>
      <p className="text-xs text-muted-foreground">
        Picked by Sonder from a search of the web · ranked by fit to this
        misconception · <span className="italic">scripted</span>
      </p>
      <div className="mt-2.5 space-y-2.5">
        {resources.map((r, i) => {
          const Icon = KIND_ICON[r.kind];
          return (
            <a
              key={r.url}
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group flex items-start gap-3 rounded-xl border border-border bg-card p-4 opacity-0 transition-all duration-500 ease-out",
                "animate-in fade-in slide-in-from-bottom-1",
                "hover:border-foreground/30",
              )}
              style={{ animationDelay: `${i * 120}ms`, animationFillMode: "forwards" }}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-4.5 text-foreground" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="min-w-0 truncate text-sm font-semibold">{r.title}</span>
                  <span className="nums shrink-0 rounded bg-ok/10 px-1.5 py-0.5 text-[11px] font-medium text-ok">
                    {r.relevance.toFixed(2)}
                  </span>
                </span>
                <span className="block text-xs text-muted-foreground">{r.source}</span>
                <span className="mt-1 block text-xs leading-relaxed text-foreground/75">
                  {r.rationale}
                </span>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
      style={{ animationDelay: delay }}
    />
  );
}
