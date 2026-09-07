import {
  Container,
  PageMasthead,
  Section,
  Split,
} from "@/components/layout";
import { MetricCard } from "@/components/shared";
import { Label } from "@/components/type";
import { AdminTabs } from "../Tabs";
import {
  PERF_METRICS,
  ACCURACY_BY_METHOD,
  PERF_NOTES,
} from "@/fixtures/performance";
import { cn } from "@/lib/utils";

export default function PerformanceReport() {
  const max = Math.max(...ACCURACY_BY_METHOD.map((b) => b.value));

  return (
    <Container>
      <PageMasthead
        label="Performance"
        title="Performance reporting"
        lede="Accuracy, question efficiency and error rate: each measured against a simpler method, not reported on its own."
        tabs={<AdminTabs />}
      />

      <Section size="default">
        <Split
          ratio="8/4"
          sticky
          primary={
            <div>
              <div className="grid gap-8 sm:grid-cols-3">
                {PERF_METRICS.map((m) => (
                  <MetricCard
                    key={m.label}
                    label={m.label}
                    value={m.value}
                    comparisonValue={m.delta}
                    comparisonLabel={`vs ${m.baselineLabel} (${m.baselineValue})`}
                    direction={m.direction}
                    goodWhen={m.goodWhen}
                  />
                ))}
              </div>

              <h2 className="mt-20 text-2xl font-semibold tracking-tight">
                Diagnostic accuracy by method
              </h2>
              <div className="mt-8 border-t border-border">
                {ACCURACY_BY_METHOD.map((b) => (
                  <div key={b.method} className="border-b border-border py-6">
                    <div className="flex justify-between text-sm">
                      <span
                        className={cn(
                          b.isSonder
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {b.method}
                      </span>
                      <span className="nums font-medium">{b.value.toFixed(1)}%</span>
                    </div>
                    <div className="mt-4 h-0.5 w-full bg-border">
                      <div
                        className={cn(
                          "h-full transition-[width] duration-700 ease-[var(--ease)]",
                          b.isSonder ? "bg-accent" : "bg-muted-foreground",
                        )}
                        style={{ width: `${(b.value / max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
          secondary={
            <div>
              <Label tone="muted">Baseline</Label>
              <p className="mt-4 text-xl font-semibold leading-snug tracking-tight">
                Compared against simpler methods on the same sample
              </p>
              <p className="mt-6 text-sm text-muted-foreground">
                Sample: {PERF_NOTES.sampleSize}.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Window: {PERF_NOTES.window}.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">{PERF_NOTES.caveat}</p>
            </div>
          }
        />
      </Section>
    </Container>
  );
}
