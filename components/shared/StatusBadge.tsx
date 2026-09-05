import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookMarked,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SessionStatus =
  | "diagnosed"
  | "escalated"
  | "awaiting-review"
  | "catalogued-only";

const MAP: Record<
  SessionStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  diagnosed: {
    label: "Diagnosed",
    icon: CheckCircle2,
    className: "border-ok/30 bg-ok/10 text-ok",
  },
  escalated: {
    label: "Escalated",
    icon: AlertTriangle,
    className: "border-warn/40 bg-warn/15 text-warn-foreground dark:text-warn",
  },
  "awaiting-review": {
    label: "Awaiting review",
    icon: Clock,
    className: "border-info/30 bg-info/10 text-info",
  },
  "catalogued-only": {
    label: "Catalogued only",
    icon: BookMarked,
    className: "border-border bg-muted text-muted-foreground",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: SessionStatus;
  className?: string;
}) {
  const { label, icon: Icon, className: tone } = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}
