import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/app/PageShell";
import { buttonVariants } from "@/components/ui/button";
import { AdminTabs } from "../Tabs";
import { COVERAGE_GAPS, type CoverageGap } from "@/fixtures/coverage";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<CoverageGap["status"], string> = {
  open: "border-warn/40 bg-warn/10 text-warn-foreground dark:text-warn",
  generating: "border-info/30 bg-info/10 text-info",
  "in-review": "border-info/30 bg-info/10 text-info",
  closed: "border-ok/30 bg-ok/10 text-ok",
};

const STATUS_LABEL: Record<CoverageGap["status"], string> = {
  open: "Open — no item yet",
  generating: "Generating",
  "in-review": "Item in review",
  closed: "Closed",
};

export default function CoverageReport() {
  const open = COVERAGE_GAPS.filter((g) => g.status !== "closed").length;

  return (
    <PageShell
      title="Coverage report"
      description="Pairs of misconceptions that no current question can tell apart. Sonder is never allowed to leave one of these sitting — each is detected and closed."
      tabs={<AdminTabs />}
      wide
    >
      <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
        <span className="nums font-semibold">{open}</span> gap
        {open === 1 ? "" : "s"} currently need attention.{" "}
        {COVERAGE_GAPS.length - open} closed.
      </div>

      <div className="mt-4 space-y-3">
        {COVERAGE_GAPS.map((g, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {g.subject}
                </p>
                {g.kind === "separator" ? (
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-medium">
                    <span className="nums rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      {g.pair[0]}
                    </span>
                    {g.labels[0]}
                    <span className="text-muted-foreground">vs</span>
                    <span className="nums rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      {g.pair[1]}
                    </span>
                    {g.labels[1]}
                  </p>
                ) : (
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm font-medium">
                    <span className="nums rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                      {g.misconception}
                    </span>
                    {g.label}
                    <span className="nums rounded-full bg-warn/10 px-2 py-0.5 text-xs font-medium text-warn-foreground dark:text-warn">
                      bank {g.bankCount} / needs ≥ {g.targetMin}
                    </span>
                  </p>
                )}
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                  STATUS_STYLE[g.status],
                )}
              >
                {STATUS_LABEL[g.status]}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{g.note}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Detected {g.detectedOn}
            </p>
            {g.kind === "separator" && g.itemHref ? (
              <Link
                href={g.itemHref}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "mt-3",
                })}
              >
                Open the generated item
                <ArrowRight className="size-3.5" />
              </Link>
            ) : null}
            {g.kind === "thin-coverage" && g.runHref ? (
              <Link
                href={g.runHref}
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "mt-3",
                })}
              >
                View generation run
                <ArrowRight className="size-3.5" />
              </Link>
            ) : null}
          </div>
        ))}
      </div>
    </PageShell>
  );
}
