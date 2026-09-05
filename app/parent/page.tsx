"use client";

import Link from "next/link";
import { Clock, ChevronRight, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/app/PageShell";
import { PARENT, PARENT_SUMMARIES } from "@/fixtures/parent";
import { useTeacherReviews } from "@/lib/teacher-review";

export default function ParentHome() {
  const { decisions } = useTeacherReviews();

  const visible = (s: (typeof PARENT_SUMMARIES)[number]) => {
    if (s.approvedByDefault) return true;
    if (!s.gatedOnScenario) return false;
    const d = decisions[s.gatedOnScenario];
    return d === "approved" || d === "corrected";
  };

  return (
    <PageShell
      title={`${PARENT.children[0].split(" ")[0]}’s progress`}
      description="Plain-language summaries, and only after a teacher has approved them. No scores, no raw results."
    >
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-semibold">{PARENT.children[0]}</p>
        <p className="text-xs text-muted-foreground">Class 9-B · guardian: {PARENT.guardian}</p>
      </div>

      <h2 className="mt-8 text-sm font-semibold">Summaries</h2>
      <div className="mt-3 space-y-3">
        {PARENT_SUMMARIES.map((s) => {
          if (visible(s)) {
            return (
              <Link
                key={s.id}
                href={`/parent/summary/${s.id}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/30"
              >
                <ShieldCheck className="size-5 shrink-0 text-ok" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">
                    {s.subject} · {s.topicName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.date}
                    {s.approvedOn ? ` · approved ${s.approvedOn}` : ""}
                  </p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          }
          return (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-4"
            >
              <Clock className="size-5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">
                  {s.subject} · {s.topicName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {s.date} · awaiting your teacher’s review — nothing to show yet
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        The most recent summary appears once the teacher approves the diagnosis on
        their dashboard.
      </p>
    </PageShell>
  );
}
