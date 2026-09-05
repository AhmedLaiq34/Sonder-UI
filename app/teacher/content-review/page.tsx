"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Check,
  PencilLine,
  X,
  ArrowRight,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  Inbox,
} from "lucide-react";
import { PageShell } from "@/components/app/PageShell";
import { Surface, SectionHeading } from "@/components/app/primitives";
import { EmptyState } from "@/components/app/EmptyState";
import { StatusBadge, VerificationTag } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { GENERATED_ITEM } from "@/fixtures/content/generated-item";
import { GENERATION_RUN, type BatchQuestion } from "@/fixtures/content/generation-run";
import { getStudent } from "@/fixtures/students";
import { cn } from "@/lib/utils";

const MAP_LABEL: Record<string, string> = {
  NONE: "Correct answer",
  M1: "M1 · grams as moles",
  M2: "M2 · ignores coefficients",
  M3: "M3 · inverts the ratio",
  unmapped: "Unmapped",
};

const BATCH_MAP_LABEL: Record<string, string> = {
  NONE: "Correct answer",
  M4: "M4 · reads one place too far right",
  unmapped: "Unmapped",
};

type Verdict = "approve" | "edit" | "reject";

export default function ContentReviewQueue() {
  const router = useRouter();
  const item = GENERATED_ITEM;
  const run = GENERATION_RUN;

  const [separatorRejected, setSeparatorRejected] = useState(false);
  const [verdicts, setVerdicts] = useState<Record<string, Verdict>>({});
  const [openId, setOpenId] = useState<string | null>(run.finalBatch[0]?.id ?? null);

  const tally = useMemo(() => {
    const values = Object.values(verdicts);
    return {
      approved: values.filter((v) => v === "approve").length,
      edited: values.filter((v) => v === "edit").length,
      rejected: values.filter((v) => v === "reject").length,
    };
  }, [verdicts]);
  const committable = tally.approved + tally.edited;

  function setVerdict(id: string, v: Verdict) {
    setVerdicts((s) => ({ ...s, [id]: v }));
  }

  function commit() {
    toast.success(`${committable} items sent for a second reviewer`, {
      description: `Batch ${run.id} — ${tally.approved} approved, ${tally.edited} approved with an edit, ${tally.rejected} rejected.`,
    });
    router.push(`/teacher/content-review/agreement?batch=${run.id}`);
  }

  return (
    <PageShell
      title="Content review queue"
      description="Nothing here goes live on its own. Approve, and it moves to a second reviewer before entering the bank."
    >
      {/* --- the single separator item (Features 13-15) --- */}
      {!separatorRejected ? (
        <>
          <SectionHeading>Separator item</SectionHeading>
          <Surface className="mt-2 p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono">{item.id}</span>
              <span>Created {item.createdAt}</span>
              <span>·</span>
              <span>{item.generatedBy}</span>
            </div>

            <div className="mt-3 rounded-lg bg-muted/40 p-3 text-sm">
              <span className="font-medium">Generated to close a gap: </span>
              no question separated <strong>{item.gap.labels[0]}</strong> from{" "}
              <strong>{item.gap.labels[1]}</strong>. Detected {item.gap.detectedAt} from{" "}
              {item.gap.detectedFrom}.
            </div>

            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Generated question
            </p>
            <p className="mt-1.5 text-sm font-medium">{item.question}</p>

            <div className="mt-3 overflow-hidden rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Option</th>
                    <th className="px-3 py-2 font-medium">Maps to</th>
                    <th className="px-3 py-2 font-medium">Why</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {item.options.map((o) => (
                    <tr key={o.text} className={cn(o.correct && "bg-ok/5")}>
                      <td className="px-3 py-2 font-medium">
                        {o.text}
                        {o.correct ? <Check className="ml-1 inline size-3.5 text-ok" /> : null}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{MAP_LABEL[o.maps]}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{o.rationale}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                Distractor values: <VerificationTag kind={item.distractorSource} />
              </span>
              <span className="flex items-center gap-1.5">
                Misconception mapping: <VerificationTag kind={item.mappingSource} />
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={() => router.push("/teacher/content-review/agreement")}
              >
                <Check className="size-4" />
                Approve — send to second reviewer
                <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  toast("Editor not in this build", {
                    description: "You'd adjust the question text or a mapping here.",
                  })
                }
              >
                <PencilLine className="size-4" />
                Edit
              </Button>
              <Button variant="ghost" onClick={() => setSeparatorRejected(true)}>
                <X className="size-4" />
                Reject
              </Button>
            </div>
          </Surface>
        </>
      ) : (
        <>
          <SectionHeading>Separator item</SectionHeading>
          <EmptyState
            icon={Inbox}
            title="Returned to the generator"
            body="The item was rejected. Nothing else is waiting in this section."
          />
        </>
      )}

      {/* --- the generated batch (Feature 16a) --- */}
      <SectionHeading className="mt-8" count={run.finalBatch.length}>
        Generated batch
      </SectionHeading>
      <p className="mt-1 text-sm text-muted-foreground">
        {run.finalBatch.length} generated questions · from{" "}
        {getStudent(run.trigger.studentId)?.name ?? "a student"}&apos;s exhausted{" "}
        {run.trigger.subject} session.{" "}
        <StatusBadge status="awaiting-review" className="ml-1 align-middle" />
      </p>

      <div className="mt-2 space-y-2">
        {run.finalBatch.map((q, i) => (
          <BatchItemRow
            key={q.id}
            index={i + 1}
            question={q}
            open={openId === q.id}
            onToggle={() => setOpenId((id) => (id === q.id ? null : q.id))}
            verdict={verdicts[q.id]}
            onVerdict={(v) => setVerdict(q.id, v)}
          />
        ))}
      </div>

      <Surface className="mt-3 flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-sm text-muted-foreground">
          <span className="nums font-medium text-foreground">{tally.approved}</span> approved ·{" "}
          <span className="nums font-medium text-foreground">{tally.edited}</span> approved with an edit ·{" "}
          <span className="nums font-medium text-foreground">{tally.rejected}</span> rejected —{" "}
          <span className="nums font-medium text-foreground">{committable}</span> to commit
        </p>
        <Button onClick={commit} disabled={committable === 0}>
          <Check className="size-4" />
          Commit approved items to bank
          <ArrowRight className="size-4" />
        </Button>
      </Surface>

      <p className="mt-3 text-xs text-muted-foreground">
        Approving does not publish. It routes to the two-reviewer agreement check.
      </p>
    </PageShell>
  );
}

function BatchItemRow({
  index,
  question,
  open,
  onToggle,
  verdict,
  onVerdict,
}: {
  index: number;
  question: BatchQuestion;
  open: boolean;
  onToggle: () => void;
  verdict: Verdict | undefined;
  onVerdict: (v: Verdict) => void;
}) {
  return (
    <Surface className="overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
      >
        {open ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="nums shrink-0 text-xs text-muted-foreground">{index}.</span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {question.questionText}
        </span>
        <span className="nums shrink-0 rounded bg-ok/10 px-1.5 py-0.5 text-xs font-medium text-ok">
          Scorer {question.score.toFixed(2)}
        </span>
        {verdict ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
              verdict === "reject"
                ? "bg-warn/15 text-warn-foreground dark:text-warn"
                : "bg-ok/10 text-ok",
            )}
          >
            {verdict === "approve" ? "Approved" : verdict === "edit" ? "Approved (edited)" : "Rejected"}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="border-t border-border px-4 py-4">
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Option</th>
                  <th className="px-3 py-2 font-medium">Maps to</th>
                  <th className="px-3 py-2 font-medium">Why</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {question.options.map((o) => (
                  <tr key={o.text} className={cn(o.correct && "bg-ok/5")}>
                    <td className="px-3 py-2 font-medium">
                      {o.text}
                      {o.correct ? <Check className="ml-1 inline size-3.5 text-ok" /> : null}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {BATCH_MAP_LABEL[o.maps] ?? o.maps}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{o.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              Scorer rating: <span className="nums font-medium">{question.score.toFixed(2)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              Answer: <VerificationTag kind="computed" />
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => onVerdict("approve")}>
              <Check className="size-3.5" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onVerdict("edit");
                toast("Editor not in this build", {
                  description: "You'd adjust the question text or a mapping here.",
                });
              }}
            >
              <PencilLine className="size-3.5" />
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onVerdict("reject")}>
              <X className="size-3.5" />
              Reject
            </Button>
          </div>
        </div>
      ) : null}
    </Surface>
  );
}
