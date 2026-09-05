"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type RouteTab = {
  label: string;
  href: string;
  /** Match when the pathname starts with href (not just exact). */
  startsWith?: boolean;
  disabled?: boolean;
};

/**
 * A tab bar whose tabs are links to real routes. Active tab is derived from the
 * current pathname.
 */
export function RouteTabs({ tabs }: { tabs: RouteTab[] }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((t) => {
        const active = t.startsWith
          ? pathname === t.href || pathname.startsWith(t.href + "/")
          : pathname === t.href;
        if (t.disabled) {
          return (
            <span
              key={t.href}
              className="shrink-0 cursor-not-allowed px-3 py-2 text-sm text-muted-foreground/50"
            >
              {t.label}
            </span>
          );
        }
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "-mb-px shrink-0 border-b-2 px-3 py-2 text-sm transition-colors",
              active
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
