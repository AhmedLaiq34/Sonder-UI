"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Container,
  PageMasthead,
  Section,
  Split,
  ListRow,
  GroupHeading,
} from "@/components/layout";
import { FilterStrip } from "@/components/app/FilterStrip";
import { Mark } from "@/components/shared";
import { Label } from "@/components/type";
import { buttonVariants } from "@/components/ui/button";
import { COVERAGE_GAPS, type CoverageGap } from "@/fixtures/coverage";

const STATUS_LABEL: Record<CoverageGap["status"], string> = {
  open: "Open: no item yet",
  generating: "Generating",
  "in-review": "Item in review",
  closed: "Closed",
};

const STATUS_BUCKET: Record<
  CoverageGap["status"],
  "attention" | "pending" | "confirmed" | "inert"
> = {
  open: "attention",
  generating: "pending",
  "in-review": "pending",
  closed: "confirmed",
};

type Filter = "all" | CoverageGap["status"];

function gapKey(g: CoverageGap, i: number) {
  if (g.kind === "separator") return `${g.subject}-${g.pair.join("-")}-${i}`;
  return `${g.subject}-${g.misconception}-${i}`;
}

function gapTitle(g: CoverageGap) {
  if (g.kind === "separator") {
    return `${g.pair[0]} vs ${g.pair[1]}`;
  }
  return `${g.misconception} · ${g.label}`;
}

function gapMeta(g: CoverageGap) {
  if (g.kind === "separator") {
    return `${cap(g.subject)} · ${g.labels[0]} vs ${g.labels[1]}`;
  }
  return `${cap(g.subject)} · bank ${g.bankCount} / needs ≥ ${g.targetMin}`;
}

export default function CoverageReport() {
  const [filter, setFilter] = useState<Filter>("all");
  const open = COVERAGE_GAPS.filter((g) => g.status !== "closed").length;

  const filtered = useMemo(
    () =>
      filter === "all"
        ? COVERAGE_GAPS
        : COVERAGE_GAPS.filter((g) => g.status === filter),
    [filter],
  );

  const [selectedKey, setSelectedKey] = useState(gapKey(COVERAGE_GAPS[0], 0));

  const selectedEntry = useMemo(() => {
    const idx = COVERAGE_GAPS.findIndex((g, i) => gapKey(g, i) === selectedKey);
    if (idx >= 0) return { gap: COVERAGE_GAPS[idx], index: idx };
    return filtered[0]
      ? {
          gap: filtered[0],
          index: COVERAGE_GAPS.indexOf(filtered[0]),
        }
      : null;
  }, [selectedKey, filtered]);

  const counts = {
    all: COVERAGE_GAPS.length,
    open: COVERAGE_GAPS.filter((g) => g.status === "open").length,
    generating: COVERAGE_GAPS.filter((g) => g.status === "generating").length,
    "in-review": COVERAGE_GAPS.filter((g) => g.status === "in-review").length,
    closed: COVERAGE_GAPS.filter((g) => g.status === "closed").length,
  };

  return (
    <Container width="wide">
      <PageMasthead
        label="Coverage"
        title="Coverage report"
        lede={`${open} gap${open === 1 ? "" : "s"} currently need attention. ${COVERAGE_GAPS.length - open} closed.`}
      />

      <div className="sticky top-[var(--topbar-h)] z-20 border-b border-border bg-background">
        <FilterStrip
          label="Filter by status"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: counts.all },
            { value: "open", label: "Open", count: counts.open },
            { value: "generating", label: "Generating", count: counts.generating },
            { value: "in-review", label: "In review", count: counts["in-review"] },
            { value: "closed", label: "Closed", count: counts.closed },
          ]}
        />
      </div>

      <Section size="tight">
        <Split
          ratio="8/4"
          sticky
          primary={
            <div>
              <GroupHeading count={filtered.length}>Gaps</GroupHeading>
              <div className="border-t border-border">
                {filtered.map((g) => {
                  const i = COVERAGE_GAPS.indexOf(g);
                  const key = gapKey(g, i);
                  return (
                    <ListRow
                      key={key}
                      title={gapTitle(g)}
                      meta={gapMeta(g)}
                      trailing={STATUS_LABEL[g.status]}
                      selected={key === selectedKey}
                      onSelect={() => setSelectedKey(key)}
                    />
                  );
                })}
              </div>
            </div>
          }
          secondary={
            selectedEntry ? <CoverageDetail gap={selectedEntry.gap} /> : undefined
          }
        />
      </Section>
    </Container>
  );
}

function CoverageDetail({ gap: g }: { gap: CoverageGap }) {
  return (
    <div>
      <Label tone="muted">{cap(g.subject)}</Label>
      {g.kind === "separator" ? (
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">
          {g.pair[0]} {g.labels[0]} vs {g.pair[1]} {g.labels[1]}
        </h2>
      ) : (
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">
          {g.misconception} · {g.label}
        </h2>
      )}
      <div className="mt-6">
        <Mark bucket={STATUS_BUCKET[g.status]}>{STATUS_LABEL[g.status]}</Mark>
      </div>
      <p className="mt-8 text-base leading-relaxed text-muted-foreground">{g.note}</p>
      <p className="mt-4 text-sm text-muted-foreground">Detected {g.detectedOn}</p>
      {g.kind === "thin-coverage" ? (
        <p className="nums mt-4 text-sm text-muted-foreground">
          Bank {g.bankCount} / needs ≥ {g.targetMin}
        </p>
      ) : null}
      {g.kind === "separator" && g.itemHref ? (
        <Link
          href={g.itemHref}
          className={buttonVariants({ variant: "outline", className: "mt-10" })}
        >
          Open the generated item
        </Link>
      ) : null}
      {g.kind === "thin-coverage" && g.runHref ? (
        <Link
          href={g.runHref}
          className={buttonVariants({ variant: "outline", className: "mt-10" })}
        >
          View generation run
        </Link>
      ) : null}
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
