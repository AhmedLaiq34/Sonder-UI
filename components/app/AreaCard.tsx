import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function AreaCard({
  href,
  icon: Icon,
  title,
  description,
  meta,
  className,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  meta?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-foreground/30 hover:shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
          <Icon className="size-5" />
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      {meta ? (
        <p className="nums mt-1 text-xs font-medium text-muted-foreground">{meta}</p>
      ) : null}
    </Link>
  );
}
