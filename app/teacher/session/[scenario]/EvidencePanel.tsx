"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import type { Scenario } from "@/fixtures/scenarios/types";
import { useScenarioPlayer } from "@/lib/useScenarioPlayer";
import { hypothesisRows } from "@/lib/hypotheses";
import { studentForScenario } from "@/fixtures/students";
import { PageShell } from "@/components/app/PageShell";
import { SectionHeading, Surface } from "@/components/app/primitives";
import { SessionTabs } from "./Tabs";
import {
  PosteriorBarSet,
  EvidenceStep,
  StatusBadge,
  type SessionStatus,
} from "@/components/shared";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OUTCOME_STATUS: Record<string, SessionStatus> = {
  diagnosed: "diagnosed",
  escalated_no_separator: "escalated",
  escalated_exhausted: "escalated",
  escalated_unmodelled: "escalated",
};

export function EvidencePanel({ scenario }: { scenario: Scenario }) {
  const player = useScenarioPlayer(scenario);
  const { current, stepIndex, totalSteps } = player;
  const student = studentForScenario(scenario.id);
  const finalStep = scenario.steps[scenario.steps.length - 1];
  const status = OUTCOME_STATUS[finalStep.outcome] ?? "awaiting-review";
  const questionSteps = scenario.steps.filter((s) => s.questionText !== null);

  return (
    <PageShell
      title={student?.name ?? "Student"}
      description={`${cap(scenario.subject)} · ${scenario.topicName}`}
      actions={<StatusBadge status={status} />}
      tabs={<SessionTabs scenarioId={scenario.id} />}
      wide
    >
      {/* outcome line */}
      <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
        <span className="font-medium">Engine outcome: </span>
        {finalStep.outcome === "diagnosed" ? (
          <span>
            diagnosed —{" "}
            {scenario.hypothesisLabels[scenario.studyNote?.code ?? "M1"] ??
              scenario.studyNote?.name}
          </span>
        ) : (
          <span>{finalStep.explanation}</span>
        )}
      </div>

      {/* step scrubber */}
      <SectionHeading
        className="mt-8"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous step"
              disabled={player.isFirst}
              onClick={() => player.goTo(stepIndex - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="nums text-xs text-muted-foreground">
              {stepIndex + 1} / {totalSteps}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next step"
              disabled={player.isLast}
              onClick={() => player.goTo(stepIndex + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      >
        Step-by-step
      </SectionHeading>

      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <Surface className="p-4">
          {current.questionText ? (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Question asked
              </p>
              <p className="mt-1.5 text-sm font-medium leading-snug">
                {current.questionText}
              </p>
              <ul className="mt-3 space-y-1.5">
                {current.optionsShown?.map((opt) => {
                  const isAnswer = opt === current.answerGiven;
                  const isCorrect = opt === current.correctAnswer;
                  return (
                    <li
                      key={opt}
                      className={cn(
                        "flex items-center justify-between rounded-md border px-2.5 py-1.5 text-sm",
                        isAnswer
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      <span>{opt}</span>
                      <span className="flex items-center gap-1.5 text-xs">
                        {isCorrect ? (
                          <span
                            className={cn(
                              "inline-flex items-center gap-0.5",
                              isAnswer ? "text-background" : "text-ok",
                            )}
                          >
                            <Check className="size-3" /> correct
                          </span>
                        ) : null}
                        {isAnswer ? <span>answered</span> : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Why this question
              </p>
              <p className="mt-1 text-xs italic leading-relaxed text-muted-foreground">
                {current.explanation}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Session end
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">
                {current.explanation}
              </p>
            </>
          )}
        </Surface>

        <Surface className="p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Posterior after this step
          </p>
          <div className="mt-3">
            <PosteriorBarSet
              hypotheses={hypothesisRows(scenario, current.posterior)}
            />
          </div>
        </Surface>
      </div>

      <SectionHeading className="mt-8" count={questionSteps.length}>
        Full answer trace
      </SectionHeading>
      <Surface className="mt-2 divide-y divide-border px-4 py-0">
        {questionSteps.map((s) => (
          <EvidenceStep
            key={s.stepIndex}
            index={s.stepIndex + 1}
            questionText={s.questionText ?? ""}
            answerGiven={s.answerGiven ?? ""}
            reasoning={s.explanation}
            isCurrent={s.stepIndex === stepIndex}
          />
        ))}
      </Surface>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href={`/teacher/session/${scenario.id}/review`}
          className={buttonVariants()}
        >
          {status === "escalated" ? "Resolve this case" : "Go to review"}
          <ChevronRight className="size-4" />
        </Link>
        <Link href="/teacher" className={buttonVariants({ variant: "ghost" })}>
          Back to dashboard
        </Link>
      </div>
    </PageShell>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
