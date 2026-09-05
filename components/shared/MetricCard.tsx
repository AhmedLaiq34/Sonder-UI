import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "flat";

/**
 * A single headline number with the comparison that gives it meaning
 * (Feature 20 — performance is reported *against* a baseline, not in isolation).
 */
export function MetricCard({
  label,
  value,
  comparisonLabel,
  comparisonValue,
  direction,
  goodWhen = "up",
  className,
}: {
  label: string;
  value: string;
  comparisonLabel: string;
  comparisonValue?: string;
  direction?: Direction;
  goodWhen?: "up" | "down";
  className?: string;
}) {
  const Icon =
    direction === "up"
      ? ArrowUpRight
      : direction === "down"
        ? ArrowDownRight
        : Minus;

  const tone =
    !direction || direction === "flat"
      ? "text-muted-foreground"
      : direction === goodWhen
        ? "text-ok"
        : "text-warn-foreground dark:text-warn";

  return (
    <div className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="nums mt-2 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        {direction ? (
          <Icon className={cn("size-3.5", tone)} aria-hidden />
        ) : null}
        <span className={cn("nums font-medium", tone)}>{comparisonValue}</span>
        <span>{comparisonLabel}</span>
      </p>
    </div>
  );
}
