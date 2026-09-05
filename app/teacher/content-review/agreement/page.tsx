"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Check, GitCompareArrows } from "lucide-react";
import { PageShell } from "@/components/app/PageShell";
import { Button } from "@/components/ui/button";
import { GENERATED_ITEM } from "@/fixtures/content/generated-item";
import { GENERATION_RUN, type GenerationRun } from "@/fixtures/content/generation-run";
import { cn } from "@/lib/utils";

const VERDICT_LABEL: Record<string, string> = {
  approve: "Approve",
  "approve-with-edit": "Approve with edit",
  reject: "Reject",
};

/**
 * Two reviewers for a generated batch (Feature 16a) — same shape as the
 * single item's reviewers, scripted for the gen-run-0912 batch.
 */
const BATCH_REVIEWERS = [
  {
    name: "Imran Shah",
    verdict: "approve" as const,
    note: "Ran every item by hand. The M4 distractor is correctly the un-rounded value in each case — arithmetic checks out.",
  },
  {
    name: "Ayesha Siddiqui",
    verdict: "approve" as const,
    note: "Agree. Good spread of rounding places (whole number, one dp, two dp). No changes needed.",
  },
];

export default function AgreementView() {
  return (
    <Suspense fallback={null}>
      <AgreementContent />
    </Suspense>
  );
}

function AgreementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchRunId = searchParams.get("batch");
  const isBatch = batchRunId === GENERATION_RUN.id;

  if (isBatch) {
    return <BatchAgreement run={GENERATION_RUN} />;
  }

  const item = GENERATED_ITEM;
  const [a, b] = item.reviewers;
  const agree = a.verdict === b.verdict;

  return (
    <PageShell
      title="Two-reviewer agreement"
      description="A generated item enters the bank only after two reviewers have seen it. Where they differ, you adjudicate."
    >
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border p-3 text-sm",
          agree
            ? "border-ok/30 bg-ok/10 text-ok"
            : "border-warn/30 bg-warn/10 text-warn-foreground dark:text-warn",
        )}
      >
        <GitCompareArrows className="size-4" />
        {agree
          ? "Both reviewers agree."
          : "Both approve the question. They disagree on one distractor's label."}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {item.reviewers.map((r) => (
          <div key={r.name} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{r.name}</p>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-xs font-medium",
                  r.verdict === "approve"
                    ? "border-ok/30 bg-ok/10 text-ok"
                    : "border-warn/40 bg-warn/15 text-warn-foreground dark:text-warn",
                )}
              >
                {VERDICT_LABEL[r.verdict]}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{r.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Disputed
        </p>
        <p className="mt-1 text-sm">
          Option <strong>&ldquo;6 mol&rdquo;</strong> — Reviewer A left it mapped to a
          misconception; Reviewer B wants it marked unmapped because halving the
          amount is not a modelled error.
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-info/25 bg-info/5 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-info">
          Adjudication
        </p>
        <p className="mt-1 text-sm text-foreground/85">{item.adjudication}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          onClick={() => {
            toast.success("Added to the question bank", {
              description:
                "Provenance logged: generated 28 Aug, approved by two reviewers, adjudicated today.",
            });
            router.push("/teacher/content-review");
          }}
        >
          <Check className="size-4" />
          Confirm adjudication and add to bank
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push("/teacher/content-review")}
        >
          Back
        </Button>
      </div>
    </PageShell>
  );
}

function BatchAgreement({ run }: { run: GenerationRun }) {
  const router = useRouter();

  return (
    <PageShell
      title="Two-reviewer agreement"
      description={`Batch ${run.id} · ${run.finalBatch.length} items · second reviewer`}
    >
      <div className="flex items-center gap-2 rounded-lg border border-ok/30 bg-ok/10 p-3 text-sm text-ok">
        <GitCompareArrows className="size-4" />
        Both reviewers agree on the batch.
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {BATCH_REVIEWERS.map((r) => (
          <div key={r.name} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{r.name}</p>
              <span className="rounded-full border border-ok/30 bg-ok/10 px-2 py-0.5 text-xs font-medium text-ok">
                {VERDICT_LABEL[r.verdict]}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{r.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Batch contents
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {run.finalBatch.map((q, i) => (
            <li key={q.id} className="flex items-center gap-2">
              <span className="nums text-xs text-muted-foreground">{i + 1}.</span>
              {q.questionText}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button
          onClick={() => {
            toast.success(`${run.finalBatch.length} items added to the question bank`, {
              description: `Batch ${run.id} — generated ${run.startedAt}, approved by two reviewers.`,
            });
            router.push("/teacher/content-review");
          }}
        >
          <Check className="size-4" />
          Confirm and add {run.finalBatch.length} items to the bank
        </Button>
        <Button variant="ghost" onClick={() => router.push("/teacher/content-review")}>
          Back
        </Button>
      </div>
    </PageShell>
  );
}
