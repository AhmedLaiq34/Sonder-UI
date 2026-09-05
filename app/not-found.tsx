"use client";

import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { useSession } from "@/lib/session";
import { ROLES } from "@/lib/roles";
import { PageShell } from "@/components/app/PageShell";
import { EmptyState } from "@/components/app/EmptyState";
import { buttonVariants } from "@/components/ui/button";

/**
 * Catches any URL that doesn't match a route — a typo, a stale link, a
 * feature that was never built (like an "account" page). Without this,
 * Next falls back to its bare, unstyled default 404, outside this app's
 * shell and with no way back in.
 */
export default function NotFound() {
  const { role, ready } = useSession();
  const home = ready && role ? ROLES[role].home : "/";
  const homeLabel = ready && role ? `Back to ${ROLES[role].label.toLowerCase()} home` : "Back to home";

  return (
    <PageShell
      title="Page not found"
      description="Nothing lives at this address — it may be a typo, an old link, or a page that isn't built in this prototype yet."
    >
      <EmptyState
        icon={Compass}
        title="Nothing here"
        body="Every screen in this build is reachable from its own navigation — there's no page hiding behind a guessed URL."
        action={
          <Link href={home} className={buttonVariants()}>
            {homeLabel}
            <ArrowRight className="size-4" />
          </Link>
        }
      />
    </PageShell>
  );
}
