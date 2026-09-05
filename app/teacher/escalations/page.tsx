import Link from "next/link";
import { LifeBuoy, ChevronRight, Sparkles } from "lucide-react";
import { PageShell } from "@/components/app/PageShell";
import { Surface, SectionHeading } from "@/components/app/primitives";
import { StatusBadge } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { ESCALATIONS } from "@/fixtures/escalations";
import { getStudent } from "@/fixtures/students";

export default function EscalationQueue() {
  return (
    <PageShell
      title="Escalation queue"
      description="Cases where the engine ran out of separating questions or budget. It never guesses — these wait for you."
    >
      <SectionHeading count={ESCALATIONS.length}>Open cases</SectionHeading>
      <div className="mt-3 space-y-4">
        {ESCALATIONS.map((esc) => {
          const student = getStudent(esc.studentId);
          return (
            <Surface key={esc.studentId} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{student?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {student ? cap(student.subject) : ""} · {student?.topicName} ·
                    escalated {esc.escalatedOn}
                  </p>
                </div>
                <StatusBadge status="escalated" />
              </div>

              <p className="mt-3 text-sm">
                <span className="font-medium">Why it escalated: </span>
                {esc.reason}
              </p>
              {esc.tiedPair ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Level: {esc.tiedPair[0]} vs {esc.tiedPair[1]}
                </p>
              ) : null}

              <div className="mt-3 rounded-lg bg-muted/40 p-3">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ai">
                  <LifeBuoy className="size-3.5" />
                  AI Consultant suggestion — an idea to weigh, not a diagnosis
                </p>
                <p className="mt-1.5 text-sm text-foreground/85">
                  {esc.suggestion.text}
                </p>
                <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  {esc.suggestion.evidence.map((e) => (
                    <li key={e} className="flex gap-1.5">
                      <span aria-hidden>·</span>
                      {e}
                    </li>
                  ))}
                </ul>
              </div>

              {esc.generationRun ? (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-ai/25 bg-ai/5 p-3 text-sm">
                  <Sparkles className="size-3.5 shrink-0 text-ai" aria-hidden />
                  <span>
                    Generation run auto-started —{" "}
                    <span className="nums font-medium">{esc.generationRun.drafted}</span>{" "}
                    new questions{" "}
                    {esc.generationRun.status === "ready"
                      ? "scored and ready for review."
                      : "being scored."}
                  </span>
                  <Link
                    href={`/teacher/content-review/generation/${esc.generationRun.runId}`}
                    className="ml-auto shrink-0 text-xs font-medium text-ai underline-offset-2 hover:underline"
                  >
                    View run
                  </Link>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {esc.scenarioId ? (
                  <>
                    <Link
                      href={`/teacher/session/${esc.scenarioId}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Open evidence
                    </Link>
                    <Link
                      href={`/teacher/session/${esc.scenarioId}/review`}
                      className={buttonVariants({ size: "sm" })}
                    >
                      Resolve
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No session replay in this build — resolve from your own records.
                  </span>
                )}
              </div>
            </Surface>
          );
        })}
      </div>
    </PageShell>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
