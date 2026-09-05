import { cn } from "@/lib/utils";
import { StatusBadge, type SessionStatus } from "./StatusBadge";

export type MisconceptionStatus = "validated" | "pending" | "catalogued-only";

const STATUS_TO_BADGE: Record<MisconceptionStatus, SessionStatus | null> = {
  validated: "diagnosed",
  pending: "awaiting-review",
  "catalogued-only": "catalogued-only",
};

/**
 * One misconception, shown the same way everywhere it appears (review queue,
 * escalation, catalogue). Optional `code` is the engine's short id (M1, M2...).
 * `children` is for actions (approve / select buttons) the caller supplies.
 */
export function MisconceptionCard({
  name,
  description,
  code,
  status,
  selected,
  className,
  children,
}: {
  name: string;
  description: string;
  code?: string;
  status?: MisconceptionStatus;
  selected?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const badge = status ? STATUS_TO_BADGE[status] : null;
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 transition-colors",
        selected ? "border-foreground ring-1 ring-foreground" : "border-border",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {code ? (
              <span className="nums rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                {code}
              </span>
            ) : null}
            <h3 className="truncate text-sm font-semibold">{name}</h3>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {badge ? <StatusBadge status={badge} className="shrink-0" /> : null}
      </div>
      {children ? <div className="mt-3 flex flex-wrap gap-2">{children}</div> : null}
    </div>
  );
}
