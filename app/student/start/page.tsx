"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Layers } from "lucide-react";
import { PageShell } from "@/components/app/PageShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SUBJECTS, type Subject, type Topic } from "@/fixtures/subjects";

export default function StartDiagnostic() {
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);

  const launch = (scenario: string, mode: "topic" | "general") => {
    router.push(`/student/session/${scenario}/${mode}`);
  };

  return (
    <PageShell
      eyebrow={subject ? "Step 2 of 2 · Topic" : "Step 1 of 2 · Subject"}
      title={subject ? subject.name : "Start a diagnostic"}
      description={
        subject
          ? "Pick a topic, or run a broad check across the whole subject."
          : "Which subject is giving you trouble right now?"
      }
      actions={
        subject ? (
          <Button variant="ghost" size="sm" onClick={() => setSubject(null)}>
            <ArrowLeft className="size-4" />
            Change subject
          </Button>
        ) : null
      }
    >
      {!subject ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {SUBJECTS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSubject(s)}
                className={cn(
                  "group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-left transition-all duration-200",
                  "hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold">{s.name}</span>
                <span className="text-xs text-muted-foreground">
                  {s.topics.length} topics
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => launch(subject.generalScenario, "general")}
            className="group flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-foreground/30"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-foreground text-background">
              <Layers className="size-4" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold">
                Broad check across all of {subject.name}
              </span>
              <span className="block text-xs text-muted-foreground">
                Questions span every topic. Can surface a misconception anywhere in the subject.
              </span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </button>

          <div className="pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Or a single topic
          </div>

          {subject.topics.map((t: Topic) => {
            const wired = Boolean(t.scenario);
            return (
              <button
                key={t.id}
                type="button"
                disabled={!wired}
                onClick={() => wired && launch(t.scenario!, "topic")}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors",
                  wired
                    ? "border-border bg-card hover:border-foreground/30"
                    : "cursor-not-allowed border-dashed border-border bg-muted/30 opacity-70",
                )}
              >
                <span className="flex-1">
                  <span className="block text-sm font-semibold">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {t.blurb}
                  </span>
                </span>
                {wired ? (
                  <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                ) : (
                  <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Not in this build
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </PageShell>
  );
}
