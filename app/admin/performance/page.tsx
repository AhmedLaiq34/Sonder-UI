import { PageShell } from "@/components/app/PageShell";
import { MetricCard } from "@/components/shared";
import { Surface, SectionHeading } from "@/components/app/primitives";
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
    <PageShell
      title="Performance reporting"
      description="Accuracy, question efficiency and error rate — each measured against a simpler method, not reported on its own."
      tabs={<AdminTabs />}
      wide
    >
      <div className="grid gap-3 sm:grid-cols-3">
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

      <SectionHeading className="mt-8">Diagnostic accuracy by method</SectionHeading>
      <Surface className="mt-3 space-y-2.5 p-5">
        {ACCURACY_BY_METHOD.map((b) => (
          <div key={b.method} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span
                className={cn(
                  b.isSonder ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {b.method}
              </span>
              <span className="nums font-medium">{b.value.toFixed(1)}%</span>
            </div>
            <div className="h-5 w-full overflow-hidden rounded-md bg-muted">
              <div
                className={cn(
                  "h-full rounded-md transition-[width] duration-700 ease-out",
                  b.isSonder ? "bg-foreground" : "bg-muted-foreground/40",
                )}
                style={{ width: `${(b.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </Surface>

      <div className="mt-4 space-y-1 text-xs text-muted-foreground">
        <p>Sample: {PERF_NOTES.sampleSize}.</p>
        <p>Window: {PERF_NOTES.window}.</p>
        <p>{PERF_NOTES.caveat}</p>
      </div>
    </PageShell>
  );
}
