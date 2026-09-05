"use client";

import Link from "next/link";
import { Check, X, Play, RotateCcw, ArrowRight, Sparkles } from "lucide-react";
import type { GenerationRun } from "@/fixtures/content/generation-run";
import { useRunPlayer } from "@/lib/useRunPlayer";
import { getStudent } from "@/fixtures/students";
import { PageShell } from "@/components/app/PageShell";
import { Surface, SectionHeading } from "@/components/app/primitives";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GenerationRunClient({ run }: { run: GenerationRun }) {
  const player = useRunPlayer(run);
  const student = getStudent(run.trigger.studentId);
  const [targetMin, targetMax] = player.target;

  const keptStubs = player.history.flatMap((r) =>
    r.scored.filter((c) => c.passed).map((c) => c.stub),
  );

  return (
    <PageShell
      eyebrow={`Generation run · ${run.id}`}
      title={run.trigger.label}
      description={`For ${student?.name ?? "a student"} · ${cap(run.trigger.subject)} · started ${run.startedAt}`}
      wide
    >
      {/* trigger banner */}
      <div className="flex gap-3 rounded-lg border border-ai/25 bg-ai/5 p-4 text-sm">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-ai" aria-hidden />
        <p className="text-foreground/85">
          Auto-started because the engine escalated {student?.name ?? "a student"}
          &apos;s {student?.topicName ?? "session"} — the bank held{" "}
          <span className="nums font-medium">{run.trigger.bankCount}</span> questions
          targeting &ldquo;{run.trigger.label}&rdquo;, not enough to confirm or rule it out.
        </p>
      </div>

      {/* config */}
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">Drafter:</span> {run.drafterModel}
        </span>
        <span>
          <span className="font-medium text-foreground">Scorer:</span> {run.scorerModel}
        </span>
        <span>
          <span className="font-medium text-foreground">Pass mark:</span>{" "}
          <span className="nums">{run.passMark}</span>
        </span>
        <span>
          <span className="font-medium text-foreground">Target:</span>{" "}
          <span className="nums">{targetMin}–{targetMax}</span> accepted
        </span>
      </div>

      {/* play control */}
      <div className="mt-5 flex items-center gap-2">
        <Button onClick={player.advance} disabled={player.isComplete}>
          <Play className="size-4" />
          {player.isFirst ? "Play round" : "Play next round"}
        </Button>
        <Button variant="ghost" onClick={player.reset} disabled={player.isFirst}>
          <RotateCcw className="size-4" />
          Reset
        </Button>
        <span className="nums ml-auto text-xs text-muted-foreground">
          Round {player.roundIndex + 1} / {player.totalRounds}
        </span>
      </div>

      {/* kept bar */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-medium">Kept</span>
          <span className="nums text-muted-foreground">
            {player.keptSoFar} / {targetMax}
          </span>
        </div>
        <div className="relative mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-ok transition-[width] duration-700 ease-out"
            style={{ width: `${Math.min((player.keptSoFar / targetMax) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* current round */}
      <SectionHeading className="mt-8">
        Round {player.current.round} of {player.totalRounds} · drafted{" "}
        {player.current.drafted} · scored {player.current.scored.length} ·{" "}
        {player.current.scored.filter((c) => c.passed).length} passed
      </SectionHeading>
      <Surface className="mt-2 divide-y divide-border px-4 py-0">
        {player.current.scored.map((c) => (
          <div key={c.stub} className="flex items-start gap-3 py-3">
            <span
              className={cn(
                "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full",
                c.passed ? "bg-ok/15 text-ok" : "bg-muted text-muted-foreground",
              )}
            >
              {c.passed ? <Check className="size-3" /> : <X className="size-3" />}
            </span>
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "text-sm",
                  c.passed ? "font-medium" : "text-muted-foreground line-through",
                )}
              >
                {c.stub}
              </p>
              {!c.passed && c.rejectReason ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{c.rejectReason}</p>
              ) : null}
            </div>
            <span
              className={cn(
                "nums shrink-0 rounded px-1.5 py-0.5 text-xs font-medium",
                c.passed ? "bg-ok/10 text-ok" : "bg-muted text-muted-foreground",
              )}
            >
              {c.score.toFixed(2)}
            </span>
          </div>
        ))}
      </Surface>

      {/* kept so far, growing list */}
      {keptStubs.length > 0 ? (
        <>
          <SectionHeading className="mt-8" count={keptStubs.length}>
            Kept so far
          </SectionHeading>
          <ul className="mt-2 space-y-1.5">
            {keptStubs.map((stub) => (
              <li
                key={stub}
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <Check className="size-3.5 shrink-0 text-ok" aria-hidden />
                {stub}
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {/* completion */}
      {player.isComplete ? (
        <div className="mt-6 rounded-xl border border-ok/25 bg-ok/5 p-4">
          <p className="text-sm font-medium text-ok">
            {player.keptSoFar} questions passed the scorer.
          </p>
          <p className="mt-1 text-sm text-foreground/80">
            Each was run through the engine to attach its answer and misconception
            mapping. The batch is ready for teacher review.
          </p>
          <Link
            href="/teacher/content-review"
            className={cn(buttonVariants(), "mt-3")}
          >
            Open the batch for review
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : null}
    </PageShell>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
