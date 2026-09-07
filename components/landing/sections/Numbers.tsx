"use client";

import { Container, Section } from "@/components/layout";
import { Label, StatRow } from "@/components/type";
import { PERF_METRICS, PERF_NOTES } from "@/fixtures/performance";
import { CATALOGUE } from "@/fixtures/catalogue";
import { GENERATION_RUN } from "@/fixtures/content/generation-run";
import { useReveal } from "../useReveal";

export function Numbers() {
  const ref = useReveal<HTMLElement>();
  return (
    <Section ref={ref} size="default" bordered>
      <Container>
        <Label tone="accent" data-reveal>
          Measured against simpler methods
        </Label>

        <div className="mt-12" data-reveal>
          <StatRow
            items={[
              {
                label: "Diagnostic accuracy",
                value: PERF_METRICS[0].value,
                tone: "accent",
                hint: `against ${PERF_METRICS[0].baselineValue} for a ${PERF_METRICS[0].baselineLabel}`,
              },
              {
                label: "Questions to a diagnosis",
                value: PERF_METRICS[1].value,
                hint: `against ${PERF_METRICS[1].baselineValue} for a ${PERF_METRICS[1].baselineLabel}`,
              },
              {
                label: "Misconceptions catalogued",
                value: CATALOGUE.length,
                hint: "across Maths, Physics and Chemistry",
              },
              {
                label: "Questions drafted and vetted",
                value: GENERATION_RUN.finalBatch.length,
                hint: `from ${GENERATION_RUN.rounds.length} generation rounds`,
              },
            ]}
          />
        </div>

        <p className="mt-12 max-w-2xl text-sm leading-relaxed text-muted-foreground" data-reveal>
          {PERF_NOTES.sampleSize}, {PERF_NOTES.window}. {PERF_NOTES.caveat} All
          figures are illustrative fixture data for this build.
        </p>
      </Container>
    </Section>
  );
}
