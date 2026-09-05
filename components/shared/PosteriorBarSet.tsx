import { cn } from "@/lib/utils";

export type Hypothesis = { id: string; label: string; probability: number };

const STRIPES =
  "repeating-linear-gradient(45deg, transparent, transparent 5px, color-mix(in oklch, white 30%, transparent) 5px, color-mix(in oklch, white 30%, transparent) 10px)";

/**
 * The competing-hypotheses view — teacher-facing only (§8: the student never
 * sees this). Bars animate their width on every posterior update, so a value
 * that was decided in a fixture still *looks* computed.
 *
 * Three states are visually distinct:
 *  - gathering  → leader in neutral ink
 *  - diagnosis  → leader crosses the threshold, turns green
 *  - tie        → top two within `tieEpsilon`, both go striped blue with a caption
 */
export function PosteriorBarSet({
  hypotheses,
  diagnosisThreshold = 0.75,
  tieEpsilon = 0.03,
  caption,
  className,
}: {
  hypotheses: Hypothesis[];
  diagnosisThreshold?: number;
  tieEpsilon?: number;
  caption?: string;
  className?: string;
}) {
  const sorted = [...hypotheses].sort((a, b) => b.probability - a.probability);
  const leader = sorted[0];
  const runnerUp = sorted[1];

  const isTie =
    !!runnerUp &&
    leader.probability >= 0.25 &&
    leader.probability - runnerUp.probability <= tieEpsilon;
  const isDiagnosis = !isTie && leader.probability >= diagnosisThreshold;

  const tiedIds = isTie ? new Set([leader.id, runnerUp.id]) : new Set<string>();

  const resolvedCaption =
    caption ??
    (isTie
      ? `${leader.label} and ${runnerUp.label} are level. The engine needs a question that separates them before it can resolve.`
      : isDiagnosis
        ? `${leader.label} is above the ${Math.round(diagnosisThreshold * 100)}% confidence threshold.`
        : "Still gathering evidence.");

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2.5">
        {sorted.map((h) => {
          const pct = Math.round(h.probability * 100);
          const tied = tiedIds.has(h.id);
          const isLeader = h.id === leader.id;

          const fill = tied
            ? "bg-info"
            : isLeader && isDiagnosis
              ? "bg-ok"
              : isLeader
                ? "bg-foreground"
                : "bg-muted-foreground/40";

          return (
            <div key={h.id} className="space-y-1">
              <div className="flex items-baseline justify-between gap-3 text-xs">
                <span
                  className={cn(
                    "truncate",
                    isLeader ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {h.label}
                  {tied ? (
                    <span className="ml-1.5 rounded bg-info/15 px-1 py-0.5 text-[10px] font-medium uppercase tracking-wide text-info">
                      tied
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    "nums shrink-0 font-medium",
                    isLeader ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {pct}%
                </span>
              </div>

              <div
                className="relative h-6 w-full overflow-hidden rounded-md bg-muted"
                role="meter"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={h.label}
              >
                {/* diagnosis threshold tick */}
                <div
                  className="absolute inset-y-0 z-10 w-px bg-border"
                  style={{ left: `${diagnosisThreshold * 100}%` }}
                  aria-hidden
                />
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-md transition-[width] duration-700 ease-out",
                    fill,
                  )}
                  style={{ width: `${Math.max(h.probability * 100, 1.5)}%` }}
                >
                  {tied ? (
                    <span
                      className="absolute inset-0 rounded-md"
                      style={{ backgroundImage: STRIPES }}
                      aria-hidden
                    />
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p
        className={cn(
          "text-xs leading-relaxed",
          isTie
            ? "font-medium text-info"
            : isDiagnosis
              ? "font-medium text-ok"
              : "text-muted-foreground",
        )}
      >
        {resolvedCaption}
      </p>
    </div>
  );
}
