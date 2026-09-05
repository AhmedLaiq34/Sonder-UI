import { cn } from "@/lib/utils";

/**
 * Standard page frame: a centered column, a header block (title / description /
 * actions), an optional tab strip, then the page body.
 */
export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  tabs,
  wide,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6 lg:px-8",
        wide ? "max-w-6xl" : "max-w-5xl",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 max-w-2xl">
          {eyebrow ? (
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-0.5 text-xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        ) : null}
      </div>

      {tabs ? <div className="mt-5">{tabs}</div> : null}

      <div className={tabs ? "mt-6" : "mt-6"}>{children}</div>
    </div>
  );
}
