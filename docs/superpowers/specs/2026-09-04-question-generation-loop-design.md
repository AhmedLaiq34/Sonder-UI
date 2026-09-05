# Design — LLM + ML Question Generation Loop (scripted PoC extension)

**Date:** 2026-09-04
**Project:** `sonder-poc`
**Status:** Approved for planning
**Type:** Architectural — extends the Self-Improving Question Bank pipeline (Features 12–17, 19)

---

## 1. Problem

Sonder's diagnostic engine can reach a state where it cannot pinpoint a
misconception because the question bank does not hold enough items that target
that misconception. Today the engine escalates this to a teacher (Feature 3 /
Feature 10) and stops. The Self-Improving Question Bank (Features 13–17) already
covers a *related but different* case: a **pair** of misconceptions that no
single question can tell apart, found by a batch scan of the bank, closed by
generating **one** new question that a human then reviews.

What is missing is the case the user described: a **single, under-covered
misconception**, surfaced from a **live escalation**, closed by an **automated
generate → score → reject loop** that produces a **batch of 5–10** vetted
questions *before* a teacher sees anything. The distinguishing new capability is
an **ML scorer in the loop** — the current pipeline has no model that rates
candidate questions and discards the weak ones automatically.

## 2. Scope

Build this as a **scripted PoC flow**, consistent with `POC_Buildplan.md`:
fixtures + a step-driven player hook + CSS transitions. No real LLM, no real ML
model, no backend, no live web calls. Every score, every reject reason, every
generated question is fixture data written in advance.

The feature **extends** the existing `/admin/coverage → /teacher/content-review
→ /teacher/content-review/agreement` pipeline rather than running beside it or
replacing it.

### In scope

- A new coverage-gap type: `thin-coverage` (one under-covered misconception).
- A scripted generation run: rounds of LLM drafting + ML scoring + rejection,
  accumulating to a target of 5–10 accepted questions.
- A new screen that plays the run out, round by round.
- Batch mode in the content-review queue: per-item Approve / Edit / Reject.
- Light generalisation of the two-reviewer agreement screen to summarise a
  batch.
- Provenance, escalation-queue, and feature-list updates so the new path is
  traceable end to end.

### Out of scope (YAGNI)

- Real models or real web search of any kind.
- Per-criterion score breakdowns (clarity / difficulty / distractor
  plausibility / targeting). The scorer surfaces **one** 0–1 score plus a
  one-line reject reason.
- A working question editor. "Edit" is a toast placeholder, matching the
  existing `/teacher/content-review` behaviour.
- New shared components. Reuse `PageShell`, `Surface`, `VerificationTag`,
  `StatusBadge`, and the existing options-table markup.

## 3. Design decisions (locked during brainstorming)

| Decision | Choice |
|---|---|
| Build target | Scripted PoC flow, fixtures only |
| Pipeline relationship | Extend the existing Features 13–17 pipeline |
| Trigger | Auto-started on escalation; teacher is notified, not asked first |
| Loop visualisation | Simple progress + growing final list (not per-round score dashboards) |
| Score detail | One 0–1 score per candidate + a one-line reason for rejects |
| Teacher validation | Per-item Approve / Edit / Reject within a batch list, then Commit |

## 4. Architecture

### 4.1 Data flow

```
Live session escalates: engine cannot confirm/deny misconception M,
  bank holds too few items targeting M  (outcome: escalated_exhausted)
        │
        ▼
Auto-create:
  • a CoverageGap  { kind: "thin-coverage", misconception: M, bankCount, targetMin: 5 }  → status "generating"
  • a GenerationRun linked to that gap
        │
        ▼
GenerationRun plays out (scripted), per round:
  1. drafter model proposes `drafted` candidate questions
  2. scorer model assigns each a 0–1 score
  3. candidates with score < passMark are rejected, each with a one-line reason
  4. survivors are appended to the kept set; keptTotal updated
  repeat until keptTotal ∈ [5, 10]  (fixture guarantees this)
        │
        ▼
Engine pass: each kept question gets an `engineAnswer` and a `mapping[]`
  (option → misconception + rationale)  — Feature 16 output shape
        │
        ▼
Batch lands in /teacher/content-review as a review group
        │
        ▼
Teacher: per item → Approve / Edit / Reject.  Footer tally.  "Commit approved".
        │
        ▼
/teacher/content-review/agreement — two-reviewer check, batch summary
        │
        ▼
Approved items enter the bank.  Provenance logged.  Coverage gap → "closed".
```

### 4.2 New units

**`fixtures/content/generation-run.ts`** — one scripted `GenerationRun`.

```ts
import type { GeneratedOption } from "./generated-item";

export type ScoredCandidate = {
  /** Short identifying stub of the drafted question, e.g. its stem. */
  stub: string;
  /** 0–1, from the scorer model. */
  score: number;
  passed: boolean;
  /** One line, present only when passed === false. */
  rejectReason?: string;
};

export type GenerationRound = {
  round: number;               // 1-based
  drafted: number;             // how many candidates the drafter proposed
  scored: ScoredCandidate[];   // length === drafted
  /** Cumulative accepted count after this round. Monotonic non-decreasing. */
  keptTotal: number;
};

export type BatchQuestion = {
  id: string;
  questionText: string;
  options: GeneratedOption[];   // reuse existing shape (text, correct, maps, rationale)
  /** The scorer's score for the item that survived. >= passMark. */
  score: number;
  /** Engine output. */
  engineAnswer: string;
  /** Engine output — option text → misconception + why. */
  mapping: { option: string; maps: GeneratedOption["maps"]; rationale: string }[];
};

export type GenerationRun = {
  id: string;                  // e.g. "gen-run-0912"
  gapKey: string;              // links to the CoverageGap
  trigger: {
    studentId: string;
    misconception: string;     // e.g. "M4"
    label: string;             // e.g. "Reads a digit one place too far right when rounding"
    subject: "physics" | "mathematics" | "chemistry";
    escalatedOn: string;
    bankCount: number;         // how many items targeted M at escalation time
  };
  drafterModel: string;        // "Question drafter v0.5"
  scorerModel: string;         // "Item-quality scorer v0.2"
  passMark: number;            // 0.72
  target: [number, number];    // [5, 10]
  startedAt: string;
  rounds: GenerationRound[];
  finalBatch: BatchQuestion[]; // the accepted items, 5–10 of them
};

export const GENERATION_RUN: GenerationRun = { /* … */ };
```

**Dev-time assertion** (own module or co-located, mirroring `lib/assertPosterior.ts`):

- `finalBatch.length` is within `target` (5–10 inclusive).
- No `ScoredCandidate` with `passed === true && score < passMark`.
- No `ScoredCandidate` with `passed === false` lacking a `rejectReason`.
- `rounds[i].scored.length === rounds[i].drafted` for every round.
- `keptTotal` is monotonic non-decreasing across rounds and the last round's
  `keptTotal === finalBatch.length`.
- Every `finalBatch` item has a non-empty `engineAnswer` and a `mapping` entry
  for every option.

Runs at module load in dev, like `assertPosterior`.

**`lib/useRunPlayer.ts`** — round-stepper hook, same shape/spirit as
`lib/useScenarioPlayer.ts`.

```ts
export function useRunPlayer(run: GenerationRun) {
  const [roundIndex, setRoundIndex] = useState(0);
  const current = run.rounds[roundIndex];
  const isComplete = roundIndex >= run.rounds.length - 1;
  const keptSoFar = current.keptTotal;
  const advance = () =>
    setRoundIndex((i) => Math.min(i + 1, run.rounds.length - 1));
  const reset = () => setRoundIndex(0);
  return { current, roundIndex, isComplete, keptSoFar, advance, reset,
           totalRounds: run.rounds.length };
}
```

**`lib/useRunPlayer.test.ts`** (vitest, alongside `useScenarioPlayer.test.ts`):

- starts at round 0;
- `advance()` moves forward and clamps at the last round;
- `keptSoFar` is non-decreasing as rounds advance;
- `reset()` returns to round 0;
- final round's `keptSoFar` equals `finalBatch.length` and is within target.

**`app/teacher/content-review/generation/[runId]/page.tsx`** — client component,
"Question generation run".

- **Header** — run id (mono chip), `startedAt`, `drafterModel`, `scorerModel`,
  `passMark`, `target`. A one-paragraph trigger note:
  *"Auto-started because the engine escalated {student}'s {topic} session — the
  bank held {bankCount} questions targeting '{label}', not enough to confirm or
  rule it out."*
- **Play control** — a single "Play round" button (and a "Reset"). Advances via
  `useRunPlayer`.
- **Per round** — one status line: `Round {n} of {total} · drafted {drafted} ·
  scored {drafted} · {passedThisRound} passed`. Below it, the round's candidates:
  - passed → check icon, question stub, score chip (green), "kept";
  - failed → dim row, struck stub, score chip (grey), one-line `rejectReason`.
- **Kept bar** — `keptSoFar / target[1]` as a `Surface` bar with a CSS width
  transition (same mechanism as `PosteriorBarSet`). Label: `{keptSoFar} / {N}`.
- **On completion** (`isComplete` and `keptSoFar` in range) — a closing panel:
  *"{n} questions passed the scorer. Each was run through the engine to attach
  its answer and misconception mapping."* + primary button **Open the batch for
  review** → `/teacher/content-review`.
- Route registered via `generateStaticParams` returning the single known run id,
  matching how `remediation/[scenario]` does it.

### 4.3 Refactors to existing units

**`app/teacher/content-review/page.tsx`** — currently renders a single
hardcoded `GENERATED_ITEM`. Change to a **list of review entries**:

1. The existing separator item (unchanged content, now one entry in a list).
2. The generated **batch** as a collapsible group:
   - Group header: *"{n} generated questions · from {student}'s exhausted
     {topic} session"* + a `StatusBadge status="awaiting-review"`.
   - Each item: a collapsible row showing the question, the options table
     (`Option | Maps to | Why`, correct row tinted — reuse current markup),
     and two provenance chips — `VerificationTag`-style `Scorer {score}` and
     `Answer: computed` (engine).
   - Per-item action row: **Approve** / **Edit** (toast placeholder) /
     **Reject**. Local component state tracks each item's verdict.
   - Group footer: running tally *"{a} approved · {e} edited · {r} rejected —
     {committable} to commit"* and a primary **Commit approved items to bank**
     button → `router.push("/teacher/content-review/agreement")`.
- The existing "rejected → empty queue" behaviour becomes per-entry; the page
  shows an `EmptyState` only when *no* entries remain.

**`app/teacher/content-review/agreement/page.tsx`** — today it is bound to
`GENERATED_ITEM`. Generalise so it can render **either**:

- the single separator item (current behaviour), or
- a **batch summary**: *"Batch {runId} · {n} items · second reviewer"* with the
  same two-reviewer card layout, reviewer notes pulled from a `reviewers` field
  on the run fixture (or a small dedicated batch-review fixture). Confirm →
  toast *"{n} items added to the question bank"* + provenance note → back to
  `/teacher/content-review`.
- Which mode to show is decided by a query param or a small shared selection
  store; simplest is a `?batch={runId}` query param set by the Commit button.

**`fixtures/coverage.ts`** — turn `CoverageGap` into a discriminated union:

```ts
type CoverageGapBase = {
  subject: Subject;
  status: "open" | "generating" | "in-review" | "closed";
  detectedOn: string;
  note: string;
  itemHref?: string;
};

export type SeparatorGap = CoverageGapBase & {
  kind: "separator";
  pair: [string, string];
  labels: [string, string];
};

export type ThinCoverageGap = CoverageGapBase & {
  kind: "thin-coverage";
  misconception: string;   // "M4"
  label: string;           // "Reads a digit one place too far right when rounding"
  bankCount: number;       // 2
  targetMin: number;       // 5
  runHref?: string;        // → /teacher/content-review/generation/[runId]
};

export type CoverageGap = SeparatorGap | ThinCoverageGap;
```

- Existing rows get `kind: "separator"`.
- Add one `thin-coverage` row: mathematics, `M4`, `bankCount: 2`,
  `targetMin: 5`, `status: "generating"`, `runHref` to the run screen.

**`app/admin/coverage/page.tsx`** — render both `kind`s. For `thin-coverage`:
show the single misconception chip + label, `"bank {bankCount} / needs ≥
{targetMin}"`, the status pill, and a "View generation run" link when
`runHref` is set (mirrors the existing "Open the generated item" link).

**`fixtures/provenance.ts`** + **`app/admin/provenance/page.tsx`** — add one
entry for the run:

```ts
{
  id: "gen-run-0912",
  kind: "generation-run",           // new kind
  subject: "Mathematics",
  createdOn: "4 Sep 2026",
  generatedBy: "Question drafter v0.5 + Item-quality scorer v0.2 (pass mark 0.72)",
  purpose: "Add coverage for M4 'reads a digit one place too far right' — bank held only 2 items.",
  status: "in-review",
  validators: ["—"],
  note: "4 rounds · 12 drafted · 8 passed the scorer · batch sent to content review.",
}
```

- `KIND_LABEL` gains `"generation-run": "Generation run"`. `STATUS_STYLE` is
  unchanged (`in-review` already covered).

**`fixtures/escalations.ts`** + **`app/teacher/escalations/page.tsx`** — add a
new escalation entry for the maths rounding case so the example is coherent
across every fixture (same student, subject `mathematics`, misconception `M4`).
Its `reason` states the bank held too few items targeting M4 to confirm or rule
it out. Add an optional follow-up field to the `Escalation` type:

```ts
generationRun?: { runId: string; drafted: number; status: "generating" | "ready" };
```

Set it on the new entry. Rendered as a line under the AI-Consultant block:
*"Generation run auto-started — {drafted} new questions being scored."* + a
"View run" link to `/teacher/content-review/generation/{runId}`. This makes the
"teacher is notified" path visible from where the escalation already lives. The
existing `hina` and `usman` entries are untouched.

**`featurelist.md`** — add an entry under **Self-Improving Question Bank**,
after Feature 16, describing: a live escalation caused by too few questions for
one misconception auto-starts a drafter + scorer loop; the scorer rates each
drafted question and discards those below a pass mark; the loop repeats until
5–10 vetted questions exist; the engine attaches answers and misconception
mappings; the batch goes to the Teacher Validation Queue (Feature 17) for
per-item approval. Renumber later features or use "16a" — match whatever
numbering convention the file already tolerates.

## 5. Error / edge handling

This is a scripted PoC; the only "errors" are fixture-authoring mistakes,
caught by the §4.2 dev-time assertion. No runtime error states, no loading
skeletons, no handling of unscripted input (per `POC_Buildplan.md` §7). The
Play control simply clamps at the final round.

## 6. Testing

- **`lib/useRunPlayer.test.ts`** — the hook behaviours listed in §4.2.
- **Dev-time assertion** on `GENERATION_RUN` — the invariants in §4.2.
- **Manual QA pass** — from `/admin/coverage`: open the `thin-coverage` row →
  play the run to completion → open the batch → approve some / reject some →
  commit → agreement screen → confirm → provenance log shows the run and the
  coverage row reads "closed". Cross-check against `featurelist.md` and
  `POC_Buildplan.md` §5 phase style.

## 7. Files touched

**New**
- `fixtures/content/generation-run.ts`
- `lib/useRunPlayer.ts`
- `lib/useRunPlayer.test.ts`
- `app/teacher/content-review/generation/[runId]/page.tsx`
- (optional) `fixtures/content/generation-run.assert.ts` if the assertion is
  not co-located

**Modified**
- `app/teacher/content-review/page.tsx`
- `app/teacher/content-review/agreement/page.tsx`
- `fixtures/coverage.ts`
- `app/admin/coverage/page.tsx`
- `fixtures/provenance.ts`
- `app/admin/provenance/page.tsx`
- `fixtures/escalations.ts`
- `app/teacher/escalations/page.tsx`
- `featurelist.md`

## 8. Open questions

None outstanding. All brainstorming decisions are recorded in §3.
