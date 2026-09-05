import { cn } from "@/lib/utils";

/** The one card surface used across the app. */
export function Surface({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-xs",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Section heading with an optional trailing count and action. */
export function SectionHeading({
  children,
  count,
  action,
  className,
}: {
  children: React.ReactNode;
  count?: number | string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        {children}
        {count !== undefined ? (
          <span className="nums rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        ) : null}
      </h2>
      {action ? <div className="text-sm">{action}</div> : null}
    </div>
  );
}

const TONE: Record<string, string> = {
  neutral: "",
  ok: "text-ok",
  warn: "text-warn-foreground dark:text-warn",
  info: "text-info",
};

/** A headline number on the dashboards. */
export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "neutral" | "ok" | "warn" | "info";
}) {
  return (
    <Surface className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "nums mt-1.5 text-2xl font-semibold tracking-tight",
          TONE[tone],
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </Surface>
  );
}

/** Styled table cells for the app's data tables. */
export function Th({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <th
      className={cn(
        "px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return <td className={cn("px-4 py-2.5 align-middle", className)}>{children}</td>;
}
