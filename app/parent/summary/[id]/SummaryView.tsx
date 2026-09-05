"use client";

import Link from "next/link";
import { Clock, ShieldCheck } from "lucide-react";
import type { ParentSummary } from "@/fixtures/parent";
import { PageShell } from "@/components/app/PageShell";
import { buttonVariants } from "@/components/ui/button";
import { useTeacherReviews } from "@/lib/teacher-review";

export function SummaryView({ summary: s }: { summary: ParentSummary }) {
  const { decisions } = useTeacherReviews();

  const approved =
    s.approvedByDefault ||
    (s.gatedOnScenario &&
      ["approved", "corrected"].includes(decisions[s.gatedOnScenario] ?? ""));

  if (!approved) {
    return (
      <PageShell
        title={`${s.subject} · ${s.topicName}`}
        description={s.date}
      >
        <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/20 p-5">
          <Clock className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <div className="text-sm">
            <p className="font-medium">Not approved yet</p>
            <p className="mt-1 text-muted-foreground">
              Zara’s teacher hasn’t finished reviewing this. Parents only see a
              summary once it has been checked and approved.
            </p>
          </div>
        </div>
        <Link
          href="/parent"
          className={buttonVariants({ variant: "outline", className: "mt-6" })}
        >
          Back
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Teacher-approved summary"
      title={`${s.subject} · ${s.topicName}`}
      description={s.date}
    >
      <div className="space-y-5">
        <Section title="What we found" body={s.whatWeFound} />
        <Section title="What to work on" body={s.whatToWorkOn} />
        <Section title="How it’s going" body={s.howItsGoing} />
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-md bg-ok/10 px-3 py-2 text-xs text-ok">
        <ShieldCheck className="size-3.5" />
        {s.approvedBy
          ? `Approved by ${s.approvedBy}${s.approvedOn ? ` on ${s.approvedOn}` : ""}.`
          : "Approved by Zara’s teacher."}
      </div>

      <Link
        href="/parent"
        className={buttonVariants({ variant: "outline", className: "mt-6" })}
      >
        Back to all summaries
      </Link>
    </PageShell>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">{body}</p>
    </section>
  );
}
