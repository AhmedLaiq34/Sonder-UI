import { CheckCircle2, LifeBuoy } from "lucide-react";
import { cn } from "@/lib/utils";

export type OutcomeType = "diagnosed" | "unsure";

/**
 * The large state indicator on session-end screens and the top of the evidence
 * panel. Design principle: "diagnosed" and "unsure" must read differently at a
 * glance — different shape, colour, and icon, not just different words.
 *
 *  - diagnosed → filled, solid left rule, confident green
 *  - unsure    → outlined, dashed border, calm blue, never a red error state
 */
export function OutcomeBanner({
  type,
  title,
  message,
  className,
}: {
  type: OutcomeType;
  title?: string;
  message: string;
  className?: string;
}) {
  if (type === "diagnosed") {
    return (
      <div
        className={cn(
          "flex gap-3 rounded-lg border border-ok/30 border-l-4 border-l-ok bg-ok/10 p-4",
          className,
        )}
        role="status"
      >
        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ok" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-ok">
            {title ?? "Misconception identified"}
          </p>
          <p className="mt-1 text-sm text-foreground/80">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border border-dashed border-info/50 bg-info/5 p-4",
        className,
      )}
      role="status"
    >
      <LifeBuoy className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
      <div>
        <p className="text-sm font-semibold text-info">
          {title ?? "Not sure yet — handing this to your teacher"}
        </p>
        <p className="mt-1 text-sm text-foreground/80">{message}</p>
      </div>
    </div>
  );
}
