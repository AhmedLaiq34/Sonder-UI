"use client";

/** Dev-only gallery of the shared component library. Not a product screen. */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PosteriorBarSet,
  EvidenceStep,
  MisconceptionCard,
  StatusBadge,
  OutcomeBanner,
  MetricCard,
  VerificationTag,
  type Hypothesis,
} from "@/components/shared";

const POSTERIOR_STATES: { name: string; hyps: Hypothesis[] }[] = [
  {
    name: "Gathering",
    hyps: [
      { id: "M1", label: "Rounds to nearest 10", probability: 0.31 },
      { id: "M2", label: "Truncates instead of rounding", probability: 0.27 },
      { id: "M4", label: "Rounds the wrong digit", probability: 0.22 },
      { id: "NONE", label: "No misconception", probability: 0.2 },
    ],
  },
  {
    name: "Tie",
    hyps: [
      { id: "M4", label: "Rounds the wrong digit", probability: 0.44 },
      { id: "NONE", label: "No misconception", probability: 0.43 },
      { id: "M2", label: "Truncates instead of rounding", probability: 0.09 },
      { id: "M1", label: "Rounds to nearest 10", probability: 0.04 },
    ],
  },
  {
    name: "Resolved",
    hyps: [
      { id: "M4", label: "Rounds the wrong digit", probability: 0.82 },
      { id: "NONE", label: "No misconception", probability: 0.1 },
      { id: "M2", label: "Truncates instead of rounding", probability: 0.05 },
      { id: "M1", label: "Rounds to nearest 10", probability: 0.03 },
    ],
  },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 border-t border-border pt-6">
      <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ComponentGallery() {
  const [stateIdx, setStateIdx] = useState(0);
  const state = POSTERIOR_STATES[stateIdx];

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Dev · shared component library
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Seven components, one visual language
        </h1>
      </div>

      <Section title={`PosteriorBarSet — state: ${state.name}`}>
        <div className="rounded-lg border border-border bg-card p-5">
          <PosteriorBarSet hypotheses={state.hyps} />
        </div>
        <div className="flex gap-2">
          {POSTERIOR_STATES.map((s, i) => (
            <Button
              key={s.name}
              size="sm"
              variant={i === stateIdx ? "default" : "outline"}
              onClick={() => setStateIdx(i)}
            >
              {s.name}
            </Button>
          ))}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setStateIdx((i) => (i + 1) % POSTERIOR_STATES.length)}
          >
            Next →
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Bars animate their width between states. Cycle Gathering → Tie → Resolved
          to see the tie go striped and the caption change.
        </p>
      </Section>

      <Section title="OutcomeBanner — diagnosed vs unsure">
        <OutcomeBanner
          type="diagnosed"
          message="Zara is rounding from the wrong digit. Next: the study note on place value in rounding."
        />
        <OutcomeBanner
          type="unsure"
          message="The answers so far do not point to one clear misconception. Your teacher will look at this with you."
        />
      </Section>

      <Section title="StatusBadge">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status="diagnosed" />
          <StatusBadge status="escalated" />
          <StatusBadge status="awaiting-review" />
          <StatusBadge status="catalogued-only" />
        </div>
      </Section>

      <Section title="MisconceptionCard">
        <MisconceptionCard
          code="M4"
          name="Rounds from the wrong digit"
          description="Looks at the digit in the place being rounded to, rather than the digit immediately to its right, when deciding whether to round up."
          status="validated"
        />
        <MisconceptionCard
          code="M2"
          name="Truncates instead of rounding"
          description="Drops the trailing digits and keeps what remains, never rounding the last kept digit up."
          status="pending"
        />
      </Section>

      <Section title="EvidenceStep">
        <div className="divide-y divide-border rounded-lg border border-border bg-card px-4">
          <EvidenceStep
            index={1}
            questionText="Round 27.48 to one decimal place."
            answerGiven="27.4"
            reasoning="Opening item. 27.4 is consistent with both truncation and rounding from the wrong digit."
          />
          <EvidenceStep
            index={2}
            questionText="Round 3.867 to two decimal places."
            answerGiven="3.87"
            reasoning="Chosen to separate truncation from wrong-digit rounding. 3.87 rules truncation out."
            isCurrent
          />
        </div>
      </Section>

      <Section title="MetricCard">
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard
            label="Diagnostic accuracy"
            value="87.5%"
            comparisonValue="+19.2 pts"
            comparisonLabel="vs. single-question baseline"
            direction="up"
          />
          <MetricCard
            label="Questions to diagnosis"
            value="3.4"
            comparisonValue="-2.1"
            comparisonLabel="vs. fixed 6-item quiz"
            direction="down"
            goodWhen="down"
          />
          <MetricCard
            label="False-diagnosis rate"
            value="4.1%"
            comparisonValue="-8.7 pts"
            comparisonLabel="vs. keyword matching"
            direction="down"
            goodWhen="down"
          />
        </div>
      </Section>

      <Section title="VerificationTag">
        <div className="flex flex-wrap gap-2">
          <VerificationTag kind="computed" />
          <VerificationTag kind="ai-proposed" />
        </div>
      </Section>
    </main>
  );
}
