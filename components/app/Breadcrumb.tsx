"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { SEGMENT_LABELS } from "@/lib/nav";

/**
 * Breadcrumb derived from the pathname. Every segment except the last is a link
 * to its own path; the last is the current page.
 */
export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const label =
      SEGMENT_LABELS[seg] ??
      seg.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
    return { href, label, last: i === segments.length - 1 };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
      {crumbs.map((c) => (
        <span key={c.href} className="flex min-w-0 items-center gap-1">
          {c.last ? (
            <span className="truncate font-medium text-foreground">{c.label}</span>
          ) : (
            <>
              <Link
                href={c.href}
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              >
                {c.label}
              </Link>
              <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />
            </>
          )}
        </span>
      ))}
    </nav>
  );
}
