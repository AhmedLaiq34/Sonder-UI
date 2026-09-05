import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { PageShell } from "@/components/app/PageShell";
import { StatusBadge } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { getStudent } from "@/fixtures/students";
import { STUDENT_HISTORY } from "@/fixtures/insights/student-history";

export function generateStaticParams() {
  return Object.keys(STUDENT_HISTORY).map((studentId) => ({ studentId }));
}

const STATUS_BADGE = {
  resolved: "diagnosed",
  monitoring: "awaiting-review",
  "awaiting-review": "awaiting-review",
} as const;

export default async function StudentInsights({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const history = STUDENT_HISTORY[studentId];
  const student = getStudent(studentId);
  if (!history || !student) notFound();

  return (
    <PageShell
      title={student.name}
      description={`${cap(student.subject)} · ${student.className}. The same pace read the student sees, for the same oversight you apply to diagnoses.`}
      actions={
        <Link
          href="/teacher"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Back to dashboard
        </Link>
      }
    >
      <section className="rounded-xl border border-ai/25 bg-ai/5 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-ai">
          <Sparkles className="size-4" />
          Pace observation — a pattern, not a verdict
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/85">
          {history.paceNote.text}
        </p>
        <div className="mt-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Evidence
          </p>
          <ul className="mt-1 space-y-0.5 text-sm text-muted-foreground">
            {history.paceNote.evidence.map((e) => (
              <li key={e} className="flex gap-1.5">
                <span aria-hidden className="text-ai">
                  ·
                </span>
                {e}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <h2 className="mt-8 text-sm font-semibold">Misconception history</h2>
      <div className="mt-3 divide-y divide-border rounded-xl border border-border bg-card">
        {history.timeline.map((ev, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3 p-4">
            <span className="nums rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {ev.code}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{ev.name}</p>
              <p className="text-xs text-muted-foreground">
                {ev.subject} · diagnosed {ev.diagnosedOn}
                {ev.resolvedOn ? ` · resolved ${ev.resolvedOn}` : ""}
                {ev.verification ? ` · check ${ev.verification}` : ""}
              </p>
            </div>
            <StatusBadge status={STATUS_BADGE[ev.status]} />
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
