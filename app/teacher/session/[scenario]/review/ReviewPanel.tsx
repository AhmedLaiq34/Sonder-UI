"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Check, PencilLine, X, LifeBuoy } from "lucide-react";
import type { Scenario } from "@/fixtures/scenarios/types";
import { studentForScenario } from "@/fixtures/students";
import { catalogueForSubject, catalogueEntry } from "@/fixtures/catalogue";
import { escalationForScenario } from "@/fixtures/escalations";
import {
  MisconceptionCard,
  EvidenceStep,
  StatusBadge,
} from "@/components/shared";
import { PageShell } from "@/components/app/PageShell";
import { SectionHeading, Surface } from "@/components/app/primitives";
import { SessionTabs } from "../Tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useTeacherReviews,
  DECISION_LABEL,
  type ReviewDecision,
} from "@/lib/teacher-review";
import { cn } from "@/lib/utils";

export function ReviewPanel({ scenario }: { scenario: Scenario }) {
  const router = useRouter();
  const { decisions, decide } = useTeacherReviews();
  const existing = decisions[scenario.id];

  const student = studentForScenario(scenario.id);
  const finalStep = scenario.steps[scenario.steps.length - 1];
  const isEscalated = finalStep.outcome !== "diagnosed";
  const questionSteps = scenario.steps.filter((s) => s.questionText !== null);

  const diagnosed =
    scenario.studyNote &&
    catalogueEntry(scenario.subject, scenario.studyNote.code);
  const otherEntries = catalogueForSubject(scenario.subject).filter(
    (c) => c.code !== scenario.studyNote?.code,
  );

  const [mode, setMode] = useState<
    "idle" | "correct" | "reject" | "resolve"
  >("idle");
  const [pickedCode, setPickedCode] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  function commit(decision: ReviewDecision) {
    decide(scenario.id, decision);
    toast.success(`${DECISION_LABEL[decision]}`, {
      description: student
        ? `Recorded for ${student.name}. Dashboard counts updated.`
        : undefined,
    });
    router.push("/teacher");
  }

  if (existing) {
    return (
      <PageShell
        title={student?.name ?? "Review"}
        description={`${cap(scenario.subject)} · ${scenario.topicName}`}
        tabs={<SessionTabs scenarioId={scenario.id} />}
        wide
      >
        <div className="flex items-center gap-2 rounded-lg border border-ok/30 bg-ok/10 p-4 text-sm">
          <Check className="size-4 text-ok" />
          Decision recorded: <strong>{DECISION_LABEL[existing]}</strong>
        </div>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" onClick={() => decide(scenario.id, existing)}>
            Keep as is
          </Button>
          <Link href="/teacher" className={buttonVariants()}>
            Back to dashboard
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          To try a different decision, sign out and back in, or clear it from the
          dashboard.
        </p>
      </PageShell>
    );
  }

  const esc = escalationForScenario(scenario.id);

  return (
    <PageShell
      title={student?.name ?? "Review"}
      description={isEscalated ? "Resolve escalation" : "Approve, correct or reject the diagnosis"}
      actions={<StatusBadge status={isEscalated ? "escalated" : "awaiting-review"} />}
      tabs={<SessionTabs scenarioId={scenario.id} />}
      wide
    >
      {/* what the engine says */}
      <div>
        {isEscalated ? (
          <div className="rounded-xl border border-warn/40 bg-warn/10 p-4">
            <div className="flex items-center gap-2">
              <StatusBadge status="escalated" />
            </div>
            <p className="mt-2 text-sm">{finalStep.explanation}</p>
            {esc ? (
              <div className="mt-3 rounded-lg bg-background/60 p-3">
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
            ) : null}
          </div>
        ) : diagnosed ? (
          <MisconceptionCard
            code={diagnosed.code}
            name={diagnosed.name}
            description={diagnosed.description}
          />
        ) : null}
      </div>

      {/* evidence recap */}
      <SectionHeading className="mt-6" count={questionSteps.length}>
        Evidence
      </SectionHeading>
      <Surface className="mt-2 divide-y divide-border px-4 py-0">
        {questionSteps.map((s) => (
          <EvidenceStep
            key={s.stepIndex}
            index={s.stepIndex + 1}
            questionText={s.questionText ?? ""}
            answerGiven={s.answerGiven ?? ""}
            reasoning={s.explanation}
          />
        ))}
      </Surface>

      {/* actions */}
      <div className="mt-8">
        {isEscalated ? (
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={mode === "resolve" ? "default" : "outline"}
                onClick={() => setMode("resolve")}
              >
                <PencilLine className="size-4" />
                Resolve manually
              </Button>
              <Button variant="ghost" onClick={() => router.push("/teacher/escalations")}>
                Keep in queue
              </Button>
            </div>
            {mode === "resolve" ? (
              <ManualResolve
                entries={catalogueForSubject(scenario.subject)}
                pickedCode={pickedCode}
                setPickedCode={setPickedCode}
                reason={reason}
                setReason={setReason}
                onSubmit={() => commit("resolved")}
              />
            ) : null}
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => commit("approved")}>
                <Check className="size-4" />
                Approve
              </Button>
              <Button
                variant={mode === "correct" ? "default" : "outline"}
                onClick={() => setMode(mode === "correct" ? "idle" : "correct")}
              >
                <PencilLine className="size-4" />
                Correct
              </Button>
              <Button
                variant={mode === "reject" ? "default" : "outline"}
                onClick={() => setMode(mode === "reject" ? "idle" : "reject")}
              >
                <X className="size-4" />
                Reject
              </Button>
            </div>

            {mode === "correct" ? (
              <ManualResolve
                heading="Pick the correct misconception"
                entries={otherEntries}
                pickedCode={pickedCode}
                setPickedCode={setPickedCode}
                reason={reason}
                setReason={setReason}
                onSubmit={() => commit("corrected")}
              />
            ) : null}

            {mode === "reject" ? (
              <div className="mt-4 rounded-xl border border-border bg-card p-4">
                <label className="text-sm font-medium">Why are you rejecting this?</label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. the answers look like a careless slip, not a misconception"
                  className="mt-2"
                />
                <Button
                  className="mt-3"
                  disabled={!reason.trim()}
                  onClick={() => commit("rejected")}
                >
                  Submit rejection
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </PageShell>
  );
}

function ManualResolve({
  heading = "Pick the misconception",
  entries,
  pickedCode,
  setPickedCode,
  reason,
  setReason,
  onSubmit,
}: {
  heading?: string;
  entries: { code: string; name: string; description: string }[];
  pickedCode: string | null;
  setPickedCode: (c: string) => void;
  reason: string;
  setReason: (r: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="mt-4 rounded-xl border border-border bg-card p-4">
      <p className="text-sm font-medium">{heading}</p>
      <div className="mt-3 space-y-2">
        {entries.map((c) => (
          <button
            key={c.code}
            type="button"
            onClick={() => setPickedCode(c.code)}
            className={cn(
              "flex w-full gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
              pickedCode === c.code
                ? "border-foreground ring-1 ring-foreground"
                : "border-border hover:border-foreground/40",
            )}
          >
            <span className="nums mt-0.5 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {c.code}
            </span>
            <span>
              <span className="block font-medium">{c.name}</span>
              <span className="block text-xs text-muted-foreground">
                {c.description}
              </span>
            </span>
          </button>
        ))}
      </div>
      <label className="mt-4 block text-sm font-medium">Reason</label>
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="A short note for the record"
        className="mt-2"
      />
      <Button
        className="mt-3"
        disabled={!pickedCode || !reason.trim()}
        onClick={onSubmit}
      >
        Submit
      </Button>
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
