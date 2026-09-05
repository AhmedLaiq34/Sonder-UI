# Design — Student Learning Hub (scripted PoC feature)

**Date:** 2026-09-04
**Project:** `sonder-poc`
**Status:** Approved for planning
**Type:** Architectural — new student-facing subsystem alongside Features 6–8

---

## 1. Problem

Today a student only gets notes and a video after being diagnosed, gated
behind teacher review (`app/student/remediation/[scenario]/page.tsx`, Feature
6/7), and the only chatbot (`app/student/consultant/page.tsx`, Feature 8) is
scoped to the student's own session history — its fallback explicitly refuses
general concept questions. There is no self-serve place for a student to learn
a concept, no multi-resource recommendation (today: one hardcoded video behind
a YouTube *search* URL), and no way to ask about a concept itself.

## 2. Scope

Scripted PoC, consistent with `POC_Buildplan.md`: fixtures + small client
components + CSS transitions. No real web search, no real chat, no backend.

### In scope

- A standalone `/student/learn` hub: an index (misconception catalogue) plus
  one page per misconception with notes, ranked resources, and a concept chat.
- A scripted "search the web, then rank results" resource finder.
- A new, purpose-built concept chat (distinct from the session-history
  consultant) with "explain simpler" / "harder example" affordances and inline
  worked examples.
- Nav entry + deep links from the remediation page and the "unsure" outcome.
- 2–3 misconceptions fully authored; the rest show a "coming soon" stub on the
  index.

### Out of scope (YAGNI)

Real web/chat calls; more than 3 built-out misconceptions; a teacher-approval
workflow for resources (plain ranked results, no badge); "mark as learned" /
progress tracking; free-text topic search (the hub is catalogue-keyed, not
open-topic).

## 3. Design decisions (locked during brainstorming)

| Decision | Choice |
|---|---|
| Structure | New standalone `/student/learn` hub, keyed to the misconception catalogue |
| Resource recommender | Scripted "Searching the web…" then ranked result cards with a relevance score and a one-line rationale per pick |
| Concept chat | A new, purpose-built component (not a reuse of `ChatConsultant`) |
| Entry points | Nav item + deep links from remediation and the "unsure" outcome; 2–3 misconceptions built out, rest stubbed |

## 4. Architecture

### 4.1 Routes

- **`app/student/learn/page.tsx`** — index. Groups `CATALOGUE` by subject
  (reuse `catalogueForSubject`). Each entry renders as a `MisconceptionCard`;
  built-out entries (present in `LEARN_PAGES`) link to their page, others show
  a disabled state with "Notes coming soon".
- **`app/student/learn/[subject]/[code]/page.tsx`** — one misconception's
  page. `generateStaticParams` returns the built-out set (mirrors
  `remediation/[scenario]`'s pattern). 404s via `notFound()` for anything not
  authored, same as remediation does when `studyNote` is missing.
  - **Notes** section: `whatItIs`, `howToThink`, and an inline `WorkedExample`
    panel (prompt → wrong move → right move → answer).
  - **Recommended resources**: `<ResourceFinder resources={page.resources}
    query={page.searchQuery} />`.
  - **Ask about this concept**: `<ConceptChat chat={page.chat} />`.

### 4.2 Fixtures — `fixtures/learn/`

**`types.ts`**

```ts
import type { Subject } from "@/fixtures/scenarios/types";

export type WorkedExample = {
  prompt: string;
  wrongMove: string;
  rightMove: string;
  answer: string;
};

export type LearnResource = {
  title: string;
  source: string;                    // "YouTube · Khan Academy", "BBC Bitesize"
  kind: "video" | "article" | "interactive";
  url: string;                       // real, working URL
  rationale: string;                 // one line: why this one was picked
  relevance: number;                 // 0–1, drives the chip + the sort order
};

export type ChatEntry = {
  id: string;                        // "simpler" and "harder" are reserved ids
  label: string;                     // chip label
  question: string;                  // full text added to the transcript
  answer: string;
  example?: WorkedExample;
  followups?: string[];              // ids of suggested next entries
};

export type LearnConceptChat = {
  greeting: string;
  entries: ChatEntry[];              // must include ids "simpler" and "harder"
  fallback: string;
};

export type LearnPage = {
  subject: Subject;
  code: string;                      // catalogue code, e.g. "M4"
  title: string;
  whatItIs: string;
  howToThink: string;
  example: WorkedExample;
  searchQuery: string;               // shown in "Searching the web for '…'"
  resources: LearnResource[];        // 3–4, pre-sorted by relevance desc
  chat: LearnConceptChat;
};
```

**`pages.ts`** — three `LearnPage` entries:

- `mathematics` / `M4` — rounding (ties directly to Scenario B, the headline
  scenario; reuses its framing of "the digit immediately to the right").
- `physics` / `M1` — kinetic energy linear in speed.
- `chemistry` / `M2` — ignores the balancing coefficients.

Each `chat.entries` includes at minimum: one "why does this happen" entry, one
"give me an example" entry, and the reserved `simpler` / `harder` entries (the
persistent buttons resolve to these ids).

**`fixtures/learn/assert.ts`** — dev-time assertion, same style as
`assertScenarioPosteriors` (throws in dev, no-op in production):

- every `LearnPage.resources` is non-empty and sorted by `relevance`
  descending;
- every `relevance` is within `[0, 1]`;
- every `chat.entries` includes an entry with id `"simpler"` and one with id
  `"harder"`;
- every id listed in a `followups` array resolves to a real entry in the same
  `entries` list.

Called once per page instance from a small `useLearnPage`-style guard, or
directly at module load — match whichever pattern `assertScenarioPosteriors`
callers use elsewhere (currently called from the player hook; here there is no
player, so call it directly in the page component via `useMemo`, matching the
one-guard-per-render-instance spirit).

### 4.3 Components

**`components/learn/ResourceFinder.tsx`** (client)

- Local state: `"idle" | "searching" | "done"`. Starts `"searching"` on mount
  (auto-plays, no button — the point is to *show* the search happening once).
- `"searching"`: *"Searching the web for '{query}'…"* + the three-bounce `Dot`
  pattern (reuse `ChatConsultant`'s dots, factored into a tiny shared
  component if that's cheap, else duplicate — it's four lines).
- After ~800ms → `"done"`: header *"Picked by Sonder from a search of the web
  · ranked by fit to this misconception · scripted"* (the "scripted" tag
  matches `ChatConsultant`'s self-labelling), then each resource renders as a
  card, appearing in sequence with a staggered CSS transition (opacity +
  translate-y, matching the existing transition idiom). Card: `kind` icon,
  `title`, `source`, a relevance chip (green scale by value), `rationale`,
  wrapped in an `<a target="_blank" rel="noopener noreferrer">` (same pattern
  as the remediation video card).

**`components/learn/ConceptChat.tsx`** (client, purpose-built — not a
`ChatConsultant` reuse)

- Same visual language as `ChatConsultant` (message bubbles, pending dots,
  auto-scroll) for consistency, but its own component because of the extra
  affordances below.
- Seeded with `chat.greeting`. Suggested-question chips render from
  `chat.entries` minus `simpler`/`harder` minus already-used ids (mirrors
  `ChatConsultant`'s `openPrompts` pattern).
- **Two persistent buttons**, always visible above the input, not tied to
  "used" state: **Explain it simpler** → asks the `simpler` entry;
  **Give me a harder example** → asks the `harder` entry. Re-askable (unlike
  the one-shot suggestion chips).
- Reply rendering: text, then — if the matched entry has an `example` — an
  inline stepped panel (Prompt / The slip / The fix / Answer, four short
  labelled lines in a bordered block) directly under the reply bubble.
  Then — if the entry has `followups` — a row of "Next: …" chips that `ask()`
  the referenced entry.
- Unmatched free text (no id/question match) → `chat.fallback`.
- Footer: two plain anchor links, "Back to the notes" and "See resources",
  scrolling to the corresponding section id on the learn page (`#notes`,
  `#resources`).
- Match logic mirrors `ChatConsultant.ask()`: prompt id, or exact question
  text (case-insensitive, trimmed); no handling of arbitrary open input beyond
  the fallback, consistent with `POC_Buildplan.md` §7.

### 4.4 Smaller touches

- **`lib/nav.tsx`** — add `{ label: "Learn", href: "/student/learn", icon:
  GraduationCap }` to `NAV.student`'s first group (alongside Home / New
  diagnostic — it's a primary destination, not tucked under "Progress"). Add
  `learn: "Learn"` to `SEGMENT_LABELS`, plus `[subject]`/`[code]` segments
  (`mathematics`, `physics`, `chemistry` are already implicitly named by
  their own words; add explicit labels only if the breadcrumb reads oddly for
  a code like `M4` — otherwise the existing fallback title-casing is enough).
- **`app/student/remediation/[scenario]/page.tsx`** — add a "Learn more about
  this" link (outline button, next to the existing verification-preview link)
  to `/student/learn/{scenario.subject}/{note.code}`, only rendered when that
  page exists in `LEARN_PAGES` (a small `learnPageExists` lookup — otherwise
  omit the link rather than dead-end at a 404).
- **`app/student/session/[scenario]/[mode]/SessionClient.tsx`** — in the
  `"done"` phase's `unsure` branch, add a secondary link "Learn about a
  related concept" → `/student/learn` (the index — no single misconception is
  confirmed when the outcome is "unsure", so link to the browsable hub, not a
  specific page).
- **`featurelist.md`** — three new entries under **Student Features**: a
  **Learning Hub** (self-serve, not diagnosis-gated, per-misconception notes
  and a worked example); an **AI Resource Finder** (searches and ranks
  external resources with a stated reason per pick); a **Concept Tutor chat**
  (about the concept itself, distinct from the session-history AI Consultant;
  "explain simpler" / "harder example" controls; inline worked examples).

## 5. Error / edge handling

Scripted PoC — the only failure mode is a fixture-authoring mistake, caught by
`fixtures/learn/assert.ts`. `[subject]/[code]` routes not in `LEARN_PAGES`
`notFound()`; the index never links to one. No loading skeletons, no handling
of unscripted input beyond each chat's fallback, per `POC_Buildplan.md` §7.

## 6. Testing

- **`fixtures/learn/assert.test.ts`** (or inline dev-assertion, matching
  `assertScenarioPosteriors`'s house style) — the four invariants in §4.2.
- **`components/learn/ConceptChat.test.ts`** (vitest + testing-library, same
  toolchain as `useScenarioPlayer.test.ts`) — chip click asks the right entry;
  exact-text submit matches a question case-insensitively; "Explain it
  simpler" / "Give me a harder example" always resolve to `simpler` / `harder`
  regardless of prior state; an entry with `example` renders the stepped
  panel; unmatched text falls back; `followups` chips ask the right next
  entry.
- **Manual QA** — nav "Learn" → index (built-out cards active, others
  stubbed) → open `mathematics/M4` → notes render → resource finder plays
  the search animation then lists cards sorted by relevance → concept chat:
  a suggested chip, "explain simpler", "harder example", a followup chip, and
  gibberish input (fallback) → footer anchors scroll correctly → deep link
  from the Scenario B remediation page lands on `mathematics/M4` → deep link
  from an "unsure" outcome lands on the index.

## 7. Files touched

**New**
- `fixtures/learn/types.ts`
- `fixtures/learn/pages.ts`
- `fixtures/learn/assert.ts`
- `components/learn/ResourceFinder.tsx`
- `components/learn/ConceptChat.tsx`
- `components/learn/ConceptChat.test.ts`
- `app/student/learn/page.tsx`
- `app/student/learn/[subject]/[code]/page.tsx`

**Modified**
- `lib/nav.tsx`
- `app/student/remediation/[scenario]/page.tsx`
- `app/student/session/[scenario]/[mode]/SessionClient.tsx`
- `featurelist.md`

## 8. Open questions

None outstanding. All brainstorming decisions are recorded in §3.
