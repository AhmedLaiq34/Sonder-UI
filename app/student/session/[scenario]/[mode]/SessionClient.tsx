"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";
import type { Scenario } from "@/fixtures/scenarios/types";
import { useScenarioPlayer } from "@/lib/useScenarioPlayer";
import { OutcomeBanner } from "@/components/shared";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const THINKING_MS = 950;

export function SessionClient({
  scenario,
  mode,
}: {
  scenario: Scenario;
  mode: "general" | "topic";
}) {
  const player = useScenarioPlayer(scenario);
  const [phase, setPhase] = useState<"intro" | "question" | "thinking" | "done">(
    "intro",
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const modeLabel =
    mode === "general"
      ? `Broad check · ${subjectName(scenario)}`
      : scenario.topicName;

  const answeredSoFar = player.stepIndex;
  const nextIsEnd = useMemo(
    () => (scenario.steps[player.stepIndex + 1]?.questionText ?? null) === null,
    [scenario, player.stepIndex],
  );

  function answer(option: string) {
    if (phase !== "question") return;
    setChosen(option);
    setPhase("thinking");
    timer.current = setTimeout(() => {
      player.advance();
      setChosen(null);
      setPhase(nextIsEnd ? "done" : "question");
    }, THINKING_MS);
  }

  function restart() {
    if (timer.current) clearTimeout(timer.current);
    player.reset();
    setChosen(null);
    setPhase("intro");
  }

  // ---- intro (S1) ---------------------------------------------------------
  if (phase === "intro") {
    return (
      <Centered>
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-xs">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {mode === "general" ? "Broad subject check" : "Topic diagnostic"}
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight">
            {modeLabel}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            You’ll get one question at a time, up to {scenario.questionBudget}.
            Answer as best you can. There’s no time limit and no score at the end.
          </p>
          <Button className="mt-6 w-full" onClick={() => setPhase("question")}>
            Begin
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </Centered>
    );
  }

  // ---- thinking (S3) ----------------------------------------------------
  if (phase === "thinking") {
    return (
      <Centered>
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">
          Working through your answer…
        </p>
      </Centered>
    );
  }

  // ---- done (S4 / S5) --------------------------------------------------
  if (phase === "done") {
    const o = scenario.studentOutcome;
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Session complete · {modeLabel}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {o.headline}
        </h1>
        <div className="mt-4">
          <OutcomeBanner type={o.type} message={o.message} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {o.type === "diagnosed" ? (
            <Link
              href={`/student/remediation/${scenario.id}`}
              className={buttonVariants()}
            >
              See your study note
              <ArrowRight className="size-4" />
            </Link>
          ) : (
            <Link href="/student" className={buttonVariants()}>
              Back to home
            </Link>
          )}
          <Button variant="ghost" onClick={restart}>
            <RotateCcw className="size-4" />
            Run again
          </Button>
        </div>

        {o.type === "unsure" ? (
          <>
            <p className="mt-4 text-sm">
              <Link href="/student/learn" className="font-medium underline-offset-2 hover:underline">
                Learn about a related concept
              </Link>{" "}
              while this is with your teacher.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Nothing is shared with your parent until a teacher has reviewed it.
            </p>
          </>
        ) : null}
      </div>
    );
  }

  // ---- question (S2) -------------------------------------------------
  const step = player.current;
  const qNumber = answeredSoFar + 1;
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{modeLabel}</span>
        <span className="nums">
          Question {qNumber} of up to {scenario.questionBudget}
        </span>
      </div>
      <Progress
        value={(qNumber / scenario.questionBudget) * 100}
        className="mt-2 h-1.5"
      />

      <h1 className="mt-10 text-xl font-medium leading-snug tracking-tight">
        {step.questionText}
      </h1>

      <div className="mt-6 grid gap-2.5">
        {step.optionsShown?.map((opt, i) => (
          <button
            key={opt}
            type="button"
            onClick={() => answer(opt)}
            className={cn(
              "group flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              chosen === opt
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card shadow-xs hover:-translate-y-px hover:border-foreground/40 hover:shadow-sm",
            )}
          >
            <span
              className={cn(
                "nums grid size-6 shrink-0 place-items-center rounded-md border text-xs font-medium",
                chosen === opt
                  ? "border-background/30 text-background"
                  : "border-border text-muted-foreground group-hover:border-foreground/40",
              )}
            >
              {String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Sonder picks each next question from your answers so far. You won’t see
        the reasoning — your teacher does.
      </p>
    </div>
  );
}

function subjectName(s: Scenario) {
  return s.subject.charAt(0).toUpperCase() + s.subject.slice(1);
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
      {children}
    </div>
  );
}
