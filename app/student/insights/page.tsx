import Link from "next/link";
import { Sparkles, MessageCircleQuestion } from "lucide-react";
import { PageShell } from "@/components/app/PageShell";
import { MetricCard } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { STUDENT_PACE } from "@/fixtures/insights/student-pace";

export default function StudentInsights() {
  const { rows, suggestion } = STUDENT_PACE;

  return (
    <PageShell
      title="My learning-pace insights"
      description="How quickly a fix lands once a misconception is found. Every number below is shown with the case it came from. This is not a grade."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="space-y-2">
            <MetricCard
              label={row.label}
              value={`${row.daysToResolve} ${row.daysToResolve === 1 ? "day" : "days"}`}
              comparisonValue={`median ${row.classMedianDays}`}
              comparisonLabel={`· ${row.subject}`}
              direction={row.daysToResolve < row.classMedianDays ? "down" : "flat"}
              goodWhen="down"
            />
            <p className="px-1 text-xs leading-relaxed text-muted-foreground">
              {row.evidence}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-8 rounded-xl border border-ai/25 bg-ai/5 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-ai">
          <Sparkles className="size-4" />
          Pattern-based suggestion
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground/85">
          {suggestion.text}
        </p>
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Evidence
          </p>
          <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
            {suggestion.evidence.map((e) => (
              <li key={e} className="flex gap-2">
                <span aria-hidden className="text-ai">
                  ·
                </span>
                {e}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{suggestion.sharedWith}</p>
      </section>

      <Link
        href="/student/consultant"
        className={buttonVariants({ variant: "outline", className: "mt-6" })}
      >
        <MessageCircleQuestion className="size-4" />
        Ask the consultant about this
      </Link>
    </PageShell>
  );
}
