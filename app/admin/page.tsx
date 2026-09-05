import Link from "next/link";
import {
  BookMarked,
  Grid3x3,
  Gauge,
  ScrollText,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { PageShell } from "@/components/app/PageShell";
import { AreaCard } from "@/components/app/AreaCard";
import { StatTile } from "@/components/app/primitives";
import { AdminTabs } from "./Tabs";
import { CATALOGUE } from "@/fixtures/catalogue";
import { COVERAGE_GAPS } from "@/fixtures/coverage";
import { PROVENANCE_LOG } from "@/fixtures/provenance";
import { PERF_METRICS } from "@/fixtures/performance";

export default function AdminHome() {
  const openGaps = COVERAGE_GAPS.filter((g) => g.status !== "closed").length;
  const inReview = PROVENANCE_LOG.filter((p) => p.status === "in-review").length;

  return (
    <PageShell
      title="Content & curriculum"
      description="The catalogue of known misconceptions, the gaps between them, and how the engine performs against simpler methods."
      tabs={<AdminTabs />}
      wide
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <StatTile label="Catalogue" value={CATALOGUE.length} hint="validated + pending" />
        <StatTile
          label="Open gaps"
          value={openGaps}
          tone={openGaps ? "warn" : "ok"}
          hint={`${inReview} item in review`}
        />
        <StatTile
          label="Accuracy"
          value={PERF_METRICS[0].value}
          tone="ok"
          hint="vs 68.3% baseline"
        />
        <StatTile
          label="Provenance"
          value={PROVENANCE_LOG.length}
          hint="generated items logged"
        />
      </div>

      {openGaps > 0 ? (
        <Link
          href="/admin/coverage"
          className="group mt-4 flex items-center gap-3 rounded-xl border border-warn/40 bg-warn/10 p-4 shadow-xs transition-colors hover:border-warn/60"
        >
          <AlertTriangle className="size-5 shrink-0 text-warn-foreground dark:text-warn" />
          <div className="flex-1 text-sm">
            <p className="font-semibold">
              {openGaps} coverage gap{openGaps === 1 ? "" : "s"} need attention
            </p>
            <p className="text-muted-foreground">
              Misconception pairs no current question separates.
            </p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AreaCard
          href="/admin/catalogue"
          icon={BookMarked}
          title="Catalogue"
          description="Every validated misconception, per subject, with its status."
        />
        <AreaCard
          href="/admin/coverage"
          icon={Grid3x3}
          title="Coverage"
          description="Which pairs of misconceptions no current question can tell apart."
        />
        <AreaCard
          href="/admin/performance"
          icon={Gauge}
          title="Performance"
          description="Accuracy, question efficiency and error rate versus baselines."
        />
        <AreaCard
          href="/admin/provenance"
          icon={ScrollText}
          title="Provenance"
          description="When each generated item was created, by what, and who validated it."
        />
      </div>
    </PageShell>
  );
}
