# Sonder — Bold Typography Rebuild Plan

## The complete, executable specification for the design overhaul

**Target folder:** `D:\FYP\Sonder\brain-ui\sonder-web\` — the only folder you may write to.

**Supersedes:** `docs/IMPLEMENTATION-PLAN.md`, `docs/OVERHAUL-PLAN.md` and
`docs/LANDING-REDUCTION-PLAN.md` **in every respect that concerns visual design, tokens,
components, navigation and page layout.** Those three documents describe the *previous*
design language ("Sonder blueprint": serif display type, notched corners, frosted glass
navigation, a 24px construction grid, seven archetype shells). **That language is being
replaced.** Keep those documents on disk for provenance; do not follow them.

Two things from the old documents *do* survive and are restated here so you never need to
open them: the **functional behaviour of every screen** (which actually lives in
`BLUEPRINT.md`, the authority), and the **hero/vine/brain engine internals** (§9).

---

# PART 0 — READ THIS FIRST

## 0.1 What this document is

This is a build script. It tells you every file to create, every file to edit, every file to
delete, and the exact content or exact transformation for each. Where a decision was hard, the
decision has already been made and the reasoning is written down so you do not re-open it.

**You are not being asked to design anything.** Every colour, size, spacing value, class string
and component API in this document has been chosen, contrast-checked and cross-referenced
against the existing code. Follow it literally.

Three source documents feed this plan. You do not need to read them, because everything you
need has been extracted into this one, but here is what they are:

| Document | Role |
|---|---|
| `BLUEPRINT.md` (in repo root) | **The functional authority.** What every screen must *do*. Behaviour, data, navigation, states, business rules. Contains zero visual design. |
| The Bold Typography design system (given by the user) | **The visual authority.** Tokens, type scale, component styling, motion, accessibility. |
| This plan | **The reconciliation.** How the second is applied to this specific codebase to build the first. |

Where this plan and the design system appear to disagree, this plan wins, and §2 explains why
for every single divergence. There are exactly **six** documented divergences. Do not invent a
seventh.

## 0.2 Non-negotiables

Read this list twice. Every item is a thing that a well-meaning implementer breaks by accident.

1. **`border-radius` is `0` everywhere.** There is a global CSS lock in §3.3 that enforces this
   with `!important`. Do not remove it. Do not add `rounded-*` classes. If something looks like
   it needs a radius, it does not.

2. **No shadows. No blur. No glass. No glow.** `backdrop-filter` appears nowhere in the final
   codebase except inside the brain's WebGL canvas (which is a 3D render, not CSS). Grep for
   `backdrop-filter`, `shadow-`, `blur(` at the end and confirm zero hits outside
   `components/landing/styles/brain-viewer.css`.

3. **Dark only.** `next-themes` is removed. `<html>` keeps a literal `class="dark"` (see §3.1
   for why — it is a deliberate safety measure, not a leftover). There is no theme toggle.

4. **One accent, plus one attention colour.** `#39FF14` neon green and `#FFB020` amber. No
   third hue. No red, anywhere, including for "reject" and "destructive". §2.3 explains how the
   product's five status states are carried without five colours.

5. **Type is the design.** Every page opens with a poster-scale headline. If a page you build
   looks like it could be any dashboard, you have built it wrong. §6.2 gives you the component
   that makes this automatic; use it on every route.

6. **Underlines are the interactive affordance.** Buttons are text with an animated underline.
   There are no filled buttons in this build except one 3px accent bar used as a badge.

7. **Zero em-dashes (`—`) and zero en-dashes (`–`) in any string a user can see.** See §0.5.

8. **Do not install any new dependency.** In particular: **do not install `framer-motion` or
   `motion`.** The design system's animation section mentions Framer Motion; §2.6 reproduces
   its exact specification with the `IntersectionObserver` + CSS system already in the repo.
   GSAP stays, and only for the hero pin and the vine scrub.

9. **Do not touch `fixtures/`.** Not one byte. Every number, name, date and sentence a screen
   shows already exists there. If you find yourself writing product copy that states a fact
   (a count, a percentage, a student's name), you are doing it wrong — import it.

10. **Do not touch the WebGL engine.** `lib/landing/three/**` and `lib/landing/anatomy/**` are
    off limits. §9.4 lists the only two files that touch the brain and both changes are CSS.

11. **Every interactive element is at least 44x44px** and has a visible `:focus-visible` state.

12. **Build after every phase.** `npm run build` must exit 0 before you begin the next phase.
    If it does not, fix it before continuing. Do not accumulate breakage.

## 0.3 Definition of done

All four of these, honestly:

```bash
npm run lint     # exits 0
npm run build    # exits 0, 27 routes prerender
npm test         # exits 0, 3 suites pass
```

plus every box in **PART 12 (verification matrix)** and **PART 13 (pre-flight)** ticked after
actually checking it in a browser.

The baseline before you start is already green. It was verified: `npm run build` exits 0 and
prerenders all routes including `/student/learn/mathematics/M4`,
`/teacher/content-review/generation/gen-run-0912`, and `/teacher/students/bilal/insights`. So
**any build failure you see is one you caused.** Do not go hunting for pre-existing breakage.

## 0.4 Order of operations

Phases are ordered so that each one compiles on its own and so that the riskiest, most
load-bearing work happens while the tree is simplest.

| Phase | Part | What | Gate |
|---|---|---|---|
| 1 | PART 3 | Tokens, fonts, `globals.css`, delete `next-themes` | build 0 |
| 2 | PART 4 | `components/ui/*` primitives | build 0 |
| 3 | PART 5 | Typographic vocabulary (`components/type/*`) | build 0 |
| 4 | PART 6 | Layout primitives (`components/layout/*`) | build 0 |
| 5 | PART 7 | Navigation and app shell | build 0, every route reachable |
| 6 | PART 8 | Domain components (`components/shared/*`, chat, tables) | build 0 |
| 7 | PART 9 | The landing: wordmark, brain, vine | build 0, landing walked end to end |
| 8 | PART 10 | All 27 routes | build 0 |
| 9 | PART 11 | `/dev/components` gallery | build 0 |
| 10 | PART 12-13 | Verification and pre-flight | all green |

**Do not reorder.** In particular do not start PART 10 (routes) before PART 6 (layout
primitives) is finished, or you will hand-roll twenty-five inconsistent page headers.

**Commit at the end of each phase**, with the phase name in the message. Phase 5 (navigation)
and Phase 7 (landing) are the two most likely to need reverting independently.

## 0.5 The em-dash rule, and exactly how far it reaches

**Scope: copy you author in `app/` and `components/`.** Headings, labels, button text, chrome
body copy, `alt` text, `aria-label`, `metadata.title`, `metadata.description`, table captions,
empty-state text, `placeholder` text. Write zero `—` (em dash) and zero `–` (en dash) in any of
those.

**Explicitly out of scope, do not "fix":**

- **`fixtures/`.** It contains 107 em and en dashes across 19 files. That is *product content*
  written by the project's authors, not chrome you are designing, and §0.2 rule 9 forbids
  touching it. Editing 107 prose strings to satisfy a house-style rule is a large surface for
  typos with zero design benefit. Leave them.
- This document, and source-code comments.
- Test files, including the local fixture inside `components/learn/ConceptChat.test.ts`.

> This rule is inherited from the repository's superseded plans, not from the Bold Typography
> design system, which says nothing about dashes. It survives because a hyphen or colon reads
> cleaner in wide-tracked uppercase mono, which this build uses heavily for labels. It is a
> typesetting rule for *labels and chrome*, so that is where it applies.

Substitutions — use these exactly, do not invent a fifth:

| Instead of | Write |
|---|---|
| `A. — B.` parenthetical aside | Two sentences with a full stop, or a comma |
| `A — B` definition or expansion | A colon: `A: B` |
| `Name — Role` attribution | A line break, or a hyphen with spaces: `Name - Role` |
| `2018 — 2026` range | A hyphen: `2018-2026` |

The middle dot `·` **is permitted** and is used throughout as the metadata separator
(`Mathematics · Rounding to decimal places`). It is not a dash.

**Verification command**, run before you finish. Note it deliberately excludes `fixtures/`:

```bash
grep -rn "—\|–" app components lib --include=*.tsx --include=*.ts --include=*.css \
  | grep -v "\.test\." 
```

Any hit inside a string literal or JSX text node **that you wrote** is a defect. Hits inside
`/* comments */` are fine. A hit that is interpolating fixture data (for example
`{note.explanation}`) is not a hit at all, because the dash lives in the fixture.

## 0.6 Commands you will use

Run all of these from `D:\FYP\Sonder\brain-ui\sonder-web\`.

```bash
npm run dev      # local server
npm run build    # the gate
npm run lint
npm test
```

---

# PART 1 — VERIFIED CURRENT STATE

Everything in this part was read out of the repository. Trust it. It saves you the exploration.

## 1.1 Stack

| Thing | Value |
|---|---|
| Framework | Next.js **16.3.4**, App Router |
| React | 19.2.8 |
| TypeScript | 5.x, `strict` |
| CSS | Tailwind **v4** via `@tailwindcss/postcss`. **There is no `tailwind.config.js`.** All theme configuration lives in `app/globals.css` inside `@theme inline { }`. |
| Component base | shadcn style `base-nova` built on `@base-ui/react` (not Radix) |
| Icons | `lucide-react` |
| Toasts | `sonner` |
| Theming | `next-themes` — **being removed in Phase 1** |
| Animation | `gsap` 3.15.0 + ScrollTrigger, `lenis` 1.3.26 — landing only |
| 3D | `three` 0.185.1 |
| Tests | `vitest` + `jsdom` + `@testing-library/react` |
| Path alias | `@/*` maps to the repo root (`./*`) |

**Tailwind v4 notes that matter.** Utilities are generated from theme variables in namespaces:
`--color-*` produces `bg-*`/`text-*`/`border-*`, `--text-*` produces `text-{size}`,
`--font-*` produces `font-*`, `--radius-*` produces `rounded-*`, `--tracking-*` produces
`tracking-*`, `--leading-*` produces `leading-*`, `--shadow-*` produces `shadow-*`. Declaring a
variable inside `@theme` **overrides** the built-in default of the same name. Declaring a brand
new one **adds** a utility. `@theme inline` emits `var()` references rather than inlined values,
which is what lets `--color-background: var(--background)` work; keep using `inline`.

**An unknown utility class is silently dropped.** `class="font-display"` after `--font-display`
is deleted produces *no CSS and no error*. This is the single biggest hazard in this rebuild.
§3.4 is a mandatory grep sweep that exists entirely because of it.

## 1.2 Routes — all 27, verified from the build output

```
/                                                  landing
/student                                           console
/student/start                                     two-step picker
/student/session/[scenario]/[mode]                 6 static paths (A|B|C x topic|general)
/student/verify/[scenario]                         A, B
/student/remediation/[scenario]                    A, B
/student/learn                                     hub
/student/learn/[subject]/[code]                    mathematics/M4, physics/M1, chemistry/M2
/student/insights
/student/consultant
/teacher
/teacher/escalations
/teacher/session/[scenario]                        A, B, C
/teacher/session/[scenario]/review                 A, B, C
/teacher/content-review
/teacher/content-review/agreement
/teacher/content-review/generation/[runId]         gen-run-0912
/teacher/students/[studentId]/insights             zara, bilal
/teacher/consultant
/parent
/parent/summary/[id]                               3 summaries
/admin
/admin/catalogue
/admin/coverage
/admin/performance
/admin/provenance
/dev/components                                    dev gallery, no app chrome
not-found.tsx                                      404
```

## 1.3 The data layer — memorise this table

There is no backend. Every screen imports from `fixtures/`. This is the complete map. **You will
not need to invent a single value.**

| Module | Exports | Used by |
|---|---|---|
| `fixtures/subjects.ts` | `SUBJECTS` (3 subjects, each `{key,name,icon,generalScenario,topics[]}`), `getSubject()` | `/student/start` |
| `fixtures/scenarios/index.ts` | `SCENARIOS`, `getScenario(id)`, types | session, verify, remediation, teacher session/review |
| `fixtures/scenarios/types.ts` | `Scenario`, `SessionStep`, `StudyNote`, `VerificationCheck`, `StudentOutcome`, `PosteriorState`, `HypothesisId` | everywhere |
| `fixtures/students.ts` | `STUDENTS` (9), `getStudent()`, `studentForScenario()` | `/teacher`, evidence, review, teacher insights |
| `fixtures/catalogue.ts` | `CATALOGUE` (11 entries), `catalogueForSubject()`, `catalogueEntry()` | `/admin/catalogue`, `/student/learn`, review panel |
| `fixtures/escalations.ts` | `ESCALATIONS` (3), `escalationForScenario()` | `/teacher/escalations`, review panel |
| `fixtures/coverage.ts` | `COVERAGE_GAPS` (5, two kinds) | `/admin/coverage`, `/admin` |
| `fixtures/performance.ts` | `PERF_METRICS` (3), `ACCURACY_BY_METHOD` (4), `PERF_NOTES` | `/admin/performance`, `/admin` |
| `fixtures/provenance.ts` | `PROVENANCE_LOG` (5) | `/admin/provenance`, `/admin` |
| `fixtures/parent.ts` | `PARENT`, `PARENT_SUMMARIES` (3), `getParentSummary()` | `/parent`, `/parent/summary/[id]` |
| `fixtures/insights/student-pace.ts` | `STUDENT_PACE` (2 rows + suggestion) | `/student/insights` |
| `fixtures/insights/student-history.ts` | `STUDENT_HISTORY` (`zara`, `bilal`) | `/teacher/students/[id]/insights` |
| `fixtures/consultant/student-thread.ts` | student `ConsultantConfig` | `/student/consultant` |
| `fixtures/consultant/teacher-thread.ts` | teacher `ConsultantConfig` | `/teacher/consultant` |
| `fixtures/content/generated-item.ts` | `GENERATED_ITEM` (one question, 4 options, 2 reviewers, adjudication) | `/teacher/content-review`, `/teacher/content-review/agreement` |
| `fixtures/content/generation-run.ts` | `GENERATION_RUN` (4 rounds, 8 final questions), `getGenerationRun()` | `/teacher/content-review/generation/[runId]`, content review batch, agreement |
| `fixtures/learn/pages.ts` | `LEARN_PAGES` (3), `getLearnPage()`, `learnPageHref()` | `/student/learn`, `/student/learn/[subject]/[code]` |

**Supporting `lib/` modules — all keep working unchanged:**

| Module | What it does |
|---|---|
| `lib/session.tsx` | `SessionProvider`, `useSession()` → `{role, ready, signIn, signOut}`. Role in `localStorage` key `sonder.role`, read via `useSyncExternalStore` so SSR sees signed-out. |
| `lib/teacher-review.tsx` | `useTeacherReviews()` → `{decisions, decide, clearAll}`, `DECISION_LABEL`. `localStorage` key `sonder.teacher.reviews`. |
| `lib/roles.tsx` | `ROLES` (persona, context, blurb, home, icon), `ROLE_ORDER` |
| `lib/nav.tsx` | `NAV` per role, `isNavItemActive()`, `SEGMENT_LABELS` |
| `lib/local-flag.ts` | `useLocalFlag(key)` — used for sidebar collapse |
| `lib/useScenarioPlayer.ts` | `{current, stepIndex, isFirst, isLast, totalSteps, history, advance, goTo, reset}` |
| `lib/useRunPlayer.ts` | `{current, roundIndex, isFirst, isComplete, totalRounds, keptSoFar, target, history, advance, reset}` |
| `lib/hypotheses.ts` | `hypothesisRows(scenario, posterior)` → rows for the bar set |
| `lib/utils.ts` | `cn()` |
| `lib/useIsomorphicLayoutEffect.ts` | SSR-safe layout effect |

**Do not modify any file in this table** except `lib/nav.tsx` (§7.5 adds one optional field).

## 1.4 Disposition of every existing component

**DELETE (the old design language):**

```
components/app/AppShell.tsx            → rebuilt, PART 7
components/app/SiteNav.tsx             → deleted, replaced by TopBar
components/app/GlassRail.tsx           → deleted, replaced by WorkspaceNav
components/app/GlassBottomBar.tsx      → deleted, replaced by the mobile drawer
components/app/StudentDock.tsx         → deleted, one nav for all roles
components/app/ThemeToggle.tsx         → deleted, dark only
components/app/PageShell.tsx           → deleted, replaced by PageMasthead + Container
components/app/PageHeader.tsx          → deleted, replaced by PageMasthead
components/app/primitives.tsx          → deleted (Surface, SectionHeading, Th, Td)
components/app/AreaCard.tsx            → deleted
components/app/Placeholder.tsx         → deleted
components/app/LeadPanel.tsx           → deleted, replaced by Callout
components/app/MetricStrip.tsx         → deleted, replaced by StatRow
components/app/WorklistRow.tsx         → deleted, replaced by ListRow
components/app/shells/                 → whole directory deleted (7 shells + index)
components/landing/AetherFlow.tsx      → deleted (see §9.7)
components/landing/LandingNav.tsx      → deleted
lib/landing/anatomy/                   → KEEP (do not delete, brain data)
```

**KEEP AND REWRITE (same file path, new implementation):**

```
components/ui/button.tsx               PART 4.1
components/ui/input.tsx                PART 4.2
components/ui/textarea.tsx             PART 4.2
components/ui/card.tsx                 PART 4.3
components/ui/badge.tsx                PART 4.4
components/ui/tabs.tsx                 PART 4.4
components/ui/table.tsx                PART 4.4
components/app/Breadcrumb.tsx          PART 7.3
components/app/EmptyState.tsx          PART 6.5
components/app/RouteTabs.tsx           PART 6.6
components/app/DataTable.tsx           PART 8.9
components/app/FilterStrip.tsx         PART 8.10
components/app/StepTimeline.tsx        PART 8.8
components/app/ChatConsultant.tsx      PART 8.12
components/app/BrandMark.tsx           PART 7.2
components/shared/*.tsx  (all 7)       PART 8
components/learn/ConceptChat.tsx       PART 8.13
components/learn/ResourceFinder.tsx    PART 8.13
components/landing/HeroStage.tsx       PART 9.2
components/landing/SonderWordmark.tsx  PART 9.3
components/landing/BrainViewer.tsx     PART 9.4 (minimal)
components/landing/VineScroller.tsx    PART 9.5
components/landing/Landing.tsx         PART 9.1
components/landing/useReveal.ts        PART 2.6
```

**KEEP UNCHANGED:**

```
components/app/RoleGate.tsx            (already correct: adopts the deep-linked role)
components/ui/{accordion,avatar,checkbox,collapsible,dialog,dropdown-menu,label,
               progress,radio-group,scroll-area,select,separator,skeleton,
               sonner,switch,tooltip}.tsx     — audited in PART 4.5, mostly untouched
lib/landing/three/**                   the WebGL engine
lib/landing/anatomy/**                 brain geometry data
lib/landing/hero/wordmark-glyphs.ts    the SONDER letterforms
lib/landing/vine/geometry.ts           the vine maths engine
lib/landing/smooth-scroll.ts           Lenis wiring
public/models/brain.glb                the 3D asset
```

**NEW FILES** are listed in each phase.

---

# PART 2 — THE TARGET DESIGN SYSTEM, RESOLVED

The design system as handed to you is a general specification written for a marketing site. This
part resolves it against a 27-screen diagnostic product with real semantic requirements. Every
resolution is final.

## 2.1 The design read

> A four-role assessment product whose core artifacts are **a question, a piece of evidence, and
> a written explanation** — all of which are text. Rendered as a gallery exhibition: charcoal
> ground, warm-white type at poster scale, one electric accent, hairline rules instead of boxes,
> and a single 3D specimen (the brain) as the only image on the entire site.

The reason Bold Typography suits this product rather than fighting it: Sonder has **no
photographs, no illustrations, no charts beyond four bars, and no brand imagery**. Its content
is sentences. A design system that treats typography as the entire visual language is the only
honest fit. The one non-text asset — the brain — becomes dramatically more powerful for being
the only one.

## 2.2 Colour tokens — final

Every value below has been contrast-checked. The numbers in the right column are computed
WCAG 2.1 contrast ratios, not estimates.

### Dark ground (the whole site except the vine band)

| Token | Value | Purpose | Contrast on `#1A1A1A` |
|---|---|---|---|
| `--background` | `#1A1A1A` | Page ground. Charcoal, never pure black. | — |
| `--foreground` | `#FAFAFA` | Primary type. | **16.7:1** AAA |
| `--muted` | `#232323` | The one elevated surface. **Deliberately lightened from the design system's `#1A1A1A`**, which was identical to the background and therefore invisible. The design system's own note recommends exactly this. | — |
| `--muted-foreground` | `#8A8A8A` | Secondary type at body size. **Deliberately lightened from `#737373`**, which computes to 3.67:1 and fails AA for normal text. The design system's own accessibility note recommends exactly this value. | **5.04:1** AA |
| `--faint` | `#4A4A4A` | Decorative oversized numerals and layered-type shadows **only**. Never a string a user must read. | 1.9:1, non-text |
| `--accent` | `#39FF14` | The one accent. Confirmed / resolved / active / focus / progress. | **12.8:1** AAA |
| `--accent-foreground` | `#1A1A1A` | Type on an accent fill. | — |
| `--attention` | `#FFB020` | The second accent. Escalated / needs attention / AI-proposed-unvalidated. **Nothing else.** | **9.5:1** AAA |
| `--attention-foreground` | `#1A1A1A` | Type on an attention fill. | — |
| `--border` | `#262626` | Decorative hairline dividers: section rules, table row dividers, list separators. | 1.42:1, non-text |
| `--border-strong` | `#666666` | **Every interactive control boundary**: inputs, outline buttons, selectable rows, focusable panels. | **3.0:1**, meets WCAG 1.4.11 |
| `--border-hover` | `#404040` | Card/panel border on hover. | non-text |
| `--card` | `#0F0F0F` | The rare bounded container. | `#FAFAFA` on it = **18.4:1** |
| `--card-foreground` | `#FAFAFA` | | |
| `--input` | `#1A1A1A` | Input fill. | |
| `--ring` | `#39FF14` | Focus outline. | |

> **Divergence 1 of 6 — `--border-strong` is new.** The design system specifies `border: #262626`
> for inputs. `#262626` on `#1A1A1A` is **1.42:1**, which fails WCAG 2.1 SC 1.4.11 (Non-text
> Contrast, 3:1 required for the boundary of a user interface component). An input whose only
> boundary is invisible is not an input. `#262626` is kept for genuinely decorative dividers,
> where 1.4.11 does not apply. Use `--border-strong` for anything a user operates.

### Paper ground (the vine band only, §9.5)

| Token | Value | Purpose | Contrast on `#FAFAFA` |
|---|---|---|---|
| `--paper` | `#FAFAFA` | Inverted band ground. |  |
| `--paper-ink` | `#1A1A1A` | Type and the vine's line work. | **16.7:1** |
| `--paper-muted` | `#5F5F5F` | Secondary type on paper. | **6.1:1** AA |
| `--paper-accent` | `#1B7A00` | Accent moments on paper: node knots, the growing tip. | **5.3:1** AA |
| `--paper-border` | `#D4D4D4` | Hairlines on paper. | non-text |

> **Critical fact you must not forget: `#39FF14` on `#FAFAFA` is 1.30:1. Neon green is
> effectively invisible on white.** This is why `--paper-accent` exists as a darkened variant.
> It is not a third brand colour; it is the same accent role rendered for a light ground. Never
> put `--accent` on `--paper`.

## 2.3 The status-colour problem, resolved

The product must visually distinguish, at minimum:

`diagnosed` · `escalated` · `awaiting-review` · `catalogued-only` · `in-review` · `rejected` ·
`closed` · `computed` · `ai-proposed` · `resolved` · `monitoring` · `passed` · `failed`

Thirteen states. The design system permits two accents. These cannot both be satisfied with
colour, and the design system's own accessibility rule already says **"Color is never the only
indicator."** So:

> **Status is carried by three non-chromatic channels — a glyph, a word, and a rule — with
> colour as reinforcement across only four buckets.**

The four colour buckets, and the complete mapping:

| Bucket | Colour | Glyph (lucide, `strokeWidth={1.5}`) | States that map here |
|---|---|---|---|
| **Confirmed** | `--accent` | `Check` | `diagnosed`, `resolved`, `closed`, `in-bank`, `computed`, `passed`, `validated`, `approved` |
| **Attention** | `--attention` | `AlertTriangle` | `escalated`, `open` (coverage gap), `ai-proposed`, `failed`, `generating` |
| **Pending** | `--foreground` | `Clock` | `awaiting-review`, `in-review`, `pending`, `monitoring`, `surfaced` |
| **Inert** | `--muted-foreground` | `Minus` | `catalogued-only`, `rejected`, `unmapped`, `not-in-build` |

Every status indicator renders **glyph + word**, both in the bucket colour, with wide-tracked
mono type. There are no pill badges, no filled chips, no coloured backgrounds.

> **Divergence 2 of 6 — `rejected` is Inert, not red.** There is no red in this build. A
> rejection is a decision that has already been recorded; it is finished business, so it reads
> as inert. The *act* of rejecting is gated by a required free-text reason (BLUEPRINT §4.2),
> which is a far stronger safeguard than a red button. The `destructive` button variant is
> deleted.

## 2.4 Typography — final

### Families

| Role | Family | CSS var | Tailwind class | Used for |
|---|---|---|---|---|
| Primary | **Inter Tight** | `--font-sans` | `font-sans` (default on `<html>`) | Everything: headlines, subheads, body, buttons, nav |
| Quote | **Playfair Display** | `--font-quote` | `font-quote` | Pull quotes only. See the budget below. |
| Mono | **JetBrains Mono** | `--font-mono` | `font-mono` | Labels, stats, codes, dates, route paths, technical detail |

All three are available in `next/font/google` under the exact identifiers `Inter_Tight`,
`Playfair_Display`, `JetBrains_Mono`. This was verified against the installed Next.js font data.

> **The Playfair budget.** The design system says Playfair is "for pull quotes and testimonials
> only". This product has no testimonials. Playfair is therefore permitted in exactly **four**
> places in the entire codebase, and nowhere else:
> 1. The landing's thesis pull quote (§9.6).
> 2. `OutcomeBanner`'s headline — the sentence that tells a student what was found (§8.2).
> 3. The lede paragraph of a study note and of a parent summary (§10) — the two genuinely
>    editorial reading surfaces.
> 4. The `Quote` component itself (§5.3), which is what implements the three above.
>
> Grep at the end: `grep -rn "font-quote" app components` must return **4 files or fewer**.

### Scale — override Tailwind's defaults

Tailwind v4's built-in `text-3xl` through `text-9xl` do **not** match the design system. You will
override all of them in `@theme`. Final values:

| Class | rem | px | Line height | Use |
|---|---|---|---|---|
| `text-xs` | 0.75 | 12 | 1.6 | Fine print, mono micro-labels |
| `text-sm` | 0.875 | 14 | 1.6 | Captions, dense table cells |
| `text-base` | 1 | 16 | 1.6 | **Body. The floor. Never smaller for prose.** |
| `text-lg` | 1.125 | 18 | 1.75 | Lead paragraphs |
| `text-xl` | 1.25 | 20 | 1.25 | Subheads |
| `text-2xl` | 1.5 | 24 | 1.25 | Section intros |
| `text-3xl` | 2 | 32 | 1.1 | H3 |
| `text-4xl` | 2.5 | 40 | 1.1 | H2, page H1 mobile |
| `text-5xl` | 3.5 | 56 | 1.1 | H1 mobile / page H1 tablet |
| `text-6xl` | 4.5 | 72 | 1.1 | H1 tablet / page H1 desktop |
| `text-7xl` | 6 | 96 | 1 | H1 desktop |
| `text-8xl` | 8 | 128 | 1 | Hero statement |
| `text-9xl` | 10 | 160 | 1 | Decorative numerals only |

### The scale-contrast rule

The design system demands "6:1 or greater ratio between H1 and paragraph text". Body is 16px, so
a 6:1 H1 is 96px (`text-7xl`). That is not appropriate on an evidence-review screen. The
resolution is **two masthead scales**, which also creates hierarchy *between* pages:

| Scale | Responsive classes | Desktop px | Ratio to 16px body | Used on |
|---|---|---|---|---|
| `hero` | `text-5xl sm:text-6xl lg:text-7xl` | 96 | **6.0:1** | The landing, and the four role home pages (`/student`, `/teacher`, `/parent`, `/admin`) |
| `page` | `text-4xl sm:text-5xl lg:text-6xl` | 72 | **4.5:1** | Every interior route |

The landing hero statement goes further, to `text-8xl` (128px, **8:1**), because it is the one
page whose only job is to make a claim.

### Tracking and leading

```
tracking-tighter  -0.06em   Display headlines (text-6xl and up)
tracking-tight    -0.04em   Large headings (text-3xl to text-5xl)
tracking-normal   -0.01em   Body
tracking-wide      0.05em   Small labels
tracking-wider     0.1em    All-caps labels, buttons
tracking-widest    0.2em    Mono micro-labels, the wordmark

leading-none       1        Single-line headlines
leading-tight      1.1      Multi-line headlines
leading-snug       1.25     Subheads
leading-normal     1.6      Body
leading-relaxed    1.75     Long-form reading
```

**Rule: tracking is a function of size, always.** `text-7xl` is always `tracking-tighter`.
`text-4xl` is always `tracking-tight`. A mono uppercase label is always `tracking-widest`. Never
mix.

### Weights

Inter Tight at 400 (body), 500 (emphasis), 600 (headlines and buttons), 700 (the landing hero
statement only). **No weight below 400 anywhere** — the design system forbids it and thin white
type on charcoal is genuinely hard to read.

### The one micro-type class

Replaces the old `.eyebrow`. Defined once in `globals.css`, used everywhere a label is not a
sentence:

```css
.label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;      /* 11px */
  line-height: 1.4;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 500;
}
```

11px, not the design system's 12px, because 0.2em tracking on uppercase mono at 11px reads at
the same optical size as 12px untracked and matches the density of the rest of the system. It is
never used for prose, only for labels, so the 16px body-text floor does not apply.

## 2.5 Shape, border, shadow

```
radius        0px    everywhere, enforced by a global !important lock
border        1px    --border for dividers, --border-strong for controls
borderThick   2px    accent underlines, active markers, the accent bar
shadow        none
text-shadow   none
```

Depth comes from exactly four techniques and no others:

1. **Full-width hairline rules** (`border-t border-border`) separating sections.
2. **Accent bars**: `h-0.5 w-16 bg-accent` (2px x 64px) placed under a masthead headline and
   above a highlighted panel. This is the system's signature anchor.
3. **Layered type**: an oversized numeral in `--faint` positioned behind content with
   `-z-10`, e.g. a `text-9xl` `01` behind a step heading.
4. **Offset duplicate text**: the same string rendered twice, the lower copy translated 2px in
   `--border`, at `-z-10`. Used on the landing only, at most twice.

## 2.6 Motion — final

```
--ease: cubic-bezier(0.25, 0, 0, 1)     fast out, crisp stop. The only easing curve.
150ms   micro-interactions: button underlines, colour transitions, hover states
200ms   standard: disclosure open/close, tab switches, sidebar collapse
500ms   scroll reveals, image scale
```

**No bounce. No overshoot. No `back.out`. No spring. No delay longer than 100ms.**

### Scroll reveals — reproduced without Framer Motion

The design system specifies: *fade in + slide up (opacity 0→1, translateY 20px→0) over 500ms;
stagger children by 80ms with 100ms delay before the first; viewport trigger once only, 15%
threshold, -50px margin.*

You will reproduce this **exactly** using the existing `components/landing/useReveal.ts`
IntersectionObserver hook plus CSS. Edit `useReveal.ts` to change only the observer options:

```ts
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-revealed");
      io.unobserve(e.target);
    });
  },
  { rootMargin: "0px 0px -50px 0px", threshold: 0.15 },
);
```

and the CSS in `globals.css` (full block given in §3.3) sets 500ms, 20px, and
`transition-delay: calc(100ms + var(--reveal-i, 0) * 80ms)`.

Everything else in `useReveal.ts` stays: the `data-reveal-scope="ready"` contract (so a no-JS
render shows all copy), the `--reveal-i` index write, and the reduced-motion bail.

### Where scroll reveals are allowed

**Landing only.** Product routes get no scroll-linked animation of any kind. A teacher reviewing
an escalation does not want choreography. Product motion budget is: the route-enter fade
(retimed to 200ms), CSS `transition` on hover and state, and nothing else.

### GSAP

Stays, used in exactly two places, both on the landing: the hero pin (`HeroStage`) and the vine
growth scrub (`VineScroller`). Do not add a third. Do not use GSAP on any product route.

## 2.7 Texture — the grain overlay

A fractal-noise layer at 1.5% opacity over the entire viewport. Implementation in §3.3. It is a
`body::after` at `z-index: 9999` with `pointer-events: none`, which means it can never intercept
a click and never breaks stacking. At 1.5% it is imperceptible as a pattern and perceptible as
tactility.

**The 24px construction grid from the old design (`.sonder-grid`, `.sonder-grid-soft`) is
deleted.** Grain replaces it. A ruled grid and a poster are different aesthetics; running both
produces neither.

## 2.8 Iconography

```
Library      lucide-react (already installed, do not add another)
strokeWidth  1.5   ALWAYS. Never the 2 default. Set it explicitly on every icon.
Sizes        14px  inline with mono labels
             16px  inline with body text, inside buttons
             18px  status glyphs, nav items
             20px  top-bar controls
             24px  the rare section-leading icon
Colour       currentColor. Never a hardcoded hex.
Fill         never. Outline/stroke style only.
```

**Use icons sparingly. A text label beats an icon in this system.** The nav has icons because
`lib/nav.tsx` supplies them and a collapsed sidebar needs them. Status indicators have icons
because colour must never be the only channel. Almost nothing else should.

## 2.9 The nine visual signatures — your self-check

After building any screen, confirm it exhibits at least six of these. If it exhibits fewer than
four, you have built a generic dashboard and must redo it.

1. A poster-scale headline (40px+) that dominates the top of the page.
2. A mono, uppercase, `0.2em`-tracked label above that headline.
3. A 2px x 64px accent bar as a visual anchor.
4. Full-width hairline rules doing the work that boxes used to do.
5. Generous vertical rhythm: `py-20` minimum between major blocks.
6. An asymmetric grid (7/5 or 8/4), never 6/6.
7. Text-only actions with animated underlines.
8. Sharp corners, no shadow, no fill.
9. Numbers set in mono at large size with a wide-tracked label beneath.

---

# PART 3 — PHASE 1: FOUNDATION

This phase touches four files and nothing else. When it is done the site will look broken in
places (because components still carry old class names) but **it must still build**.

## 3.1 Remove `next-themes`

### 3.1.1 `app/providers.tsx` — replace the whole file

```tsx
"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/lib/session";

/**
 * There is no theme provider. This build is dark only: `globals.css` defines one
 * palette on :root and `app/layout.tsx` hardcodes class="dark" on <html>.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TooltipProvider delay={200}>{children}</TooltipProvider>
      <Toaster />
    </SessionProvider>
  );
}
```

### 3.1.2 Delete the toggle

```bash
rm components/app/ThemeToggle.tsx
```

Then remove its import and usage from `components/app/SiteNav.tsx` — or simply skip this,
because `SiteNav.tsx` is deleted wholesale in Phase 5. If you are keeping the build green
between phases (you must), the fastest correct move is: delete `ThemeToggle.tsx` **and** delete
the two lines in `SiteNav.tsx` that import and render it. Do not delete `SiteNav.tsx` yet.

### 3.1.3 Fix `components/ui/sonner.tsx` FIRST — it imports `next-themes`

**This will break your build if you uninstall the package before fixing it.**
`components/ui/sonner.tsx` currently calls `useTheme()`. Replace the whole file:

```tsx
"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { Check, AlertTriangle, Minus } from "lucide-react";

/**
 * Dark only, so the theme is hardcoded. Icons follow the plan's four status
 * buckets: confirmed, attention, inert. There is no error/red state anywhere
 * in this build, so `error` reuses the attention glyph.
 */
const Toaster = (props: ToasterProps) => (
  <Sonner
    theme="dark"
    className="toaster group"
    icons={{
      success: <Check className="size-4" strokeWidth={1.5} />,
      info: <Minus className="size-4" strokeWidth={1.5} />,
      warning: <AlertTriangle className="size-4" strokeWidth={1.5} />,
      error: <AlertTriangle className="size-4" strokeWidth={1.5} />,
      loading: <Minus className="size-4" strokeWidth={1.5} />,
    }}
    style={
      {
        "--normal-bg": "var(--card)",
        "--normal-text": "var(--foreground)",
        "--normal-border": "var(--border-strong)",
        "--border-radius": "0px",
        "--font-family": "var(--stack-sans)",
      } as React.CSSProperties
    }
    toastOptions={{ classNames: { toast: "cn-toast" } }}
    {...props}
  />
);

export { Toaster };
```

### 3.1.4 Remove the dependency

```bash
npm uninstall next-themes
```

Then grep to be certain nothing else imports it:

```bash
grep -rn "next-themes" app components lib
```

Must return zero hits.

### 3.1.5 Why `class="dark"` stays on `<html>`

`app/globals.css` declares `@custom-variant dark (&:is(.dark *));`, and roughly two dozen
files in `components/ui/` carry `dark:` variants baked in by shadcn (for example
`dark:border-input dark:bg-input/30` on the old button). If the `.dark` class disappears, every
one of those variants silently stops applying — **with no error and no build failure** — and
several primitives you are not rewriting would render with light-mode styling on a charcoal
page.

Keeping the literal class costs nothing, keeps every `dark:` variant working exactly as it does
today, and removes an entire class of invisible regression. The tokens are declared once on
`:root`, so `:root` and `.dark` resolve identically. This is deliberate. Do not "clean it up".

## 3.2 `app/layout.tsx` — replace the whole file

```tsx
import type { Metadata } from "next";
import { Inter_Tight, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppShell } from "@/components/app/AppShell";

/** Primary. Headlines and body both. Inter Tight ships tighter default sidebearings
 *  than Inter, which is what lets display sizes sit at -0.06em without collapsing. */
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/** Labels, stats, codes, dates. Never prose. */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/** Pull quotes only. Four permitted call sites in the whole build. */
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sonder: it finds the idea underneath the answer",
    template: "%s · Sonder",
  },
  description:
    "Sonder diagnoses the specific misconception behind a wrong answer, shows a teacher its evidence, and never reaches a student or parent unreviewed. Interactive proof of concept.",
  openGraph: {
    title: "Sonder: it finds the idea underneath the answer",
    description:
      "Adaptive misconception diagnosis across Maths, Physics and Chemistry. Every result passes a teacher first.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${interTight.variable} ${jetbrainsMono.variable} ${playfair.variable}`}
    >
      <body className="bg-background text-foreground antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
```

Three deliberate changes beyond the fonts:

- `suppressHydrationWarning` is gone. It existed only because `next-themes` mutated the class
  before hydration. Nothing mutates it now.
- `h-full` is gone from both `<html>` and `<body>`. The old shell was a fixed-height box with an
  inner scroller. The new shell lets **the document scroll**, which is required for `position:
  sticky` on the top bar and the workspace nav.
- `antialiased` moves to `<body>`.

## 3.3 `app/globals.css` — replace the whole file

This is the single most important file in the rebuild. Type it exactly.

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

/* ==========================================================================
   RAW TOKENS
   One palette. Dark only. Every value contrast-checked; see the plan, part 2.2.
   ========================================================================== */

:root {
  color-scheme: dark;

  /* ---- font stacks. The --font-*-* vars come from next/font on <html>. ---- */
  --stack-sans: var(--font-inter-tight), "Inter Tight", "Inter", system-ui,
    -apple-system, "Segoe UI", sans-serif;
  --stack-mono: var(--font-jetbrains-mono), "JetBrains Mono", ui-monospace,
    SFMono-Regular, Menlo, Consolas, monospace;
  --stack-quote: var(--font-playfair), "Playfair Display", Georgia,
    "Times New Roman", serif;

  /* ---- dark ground ---- */
  --background: #1a1a1a;          /* charcoal, never pure black */
  --foreground: #fafafa;          /* warm white. 16.7:1 */
  --muted: #232323;               /* the one elevated surface */
  --muted-foreground: #8a8a8a;    /* 5.04:1, passes AA at body size */
  --faint: #4a4a4a;               /* DECORATIVE TYPE ONLY. Never readable copy. */

  --accent: #39ff14;              /* the one accent. 12.8:1 */
  --accent-foreground: #1a1a1a;
  --attention: #ffb020;           /* the second accent. 9.5:1 */
  --attention-foreground: #1a1a1a;

  --border: #262626;              /* decorative hairlines only */
  --border-strong: #666666;       /* every control boundary. 3.0:1, WCAG 1.4.11 */
  --border-hover: #404040;

  --card: #0f0f0f;
  --card-foreground: #fafafa;
  --input: #1a1a1a;
  --ring: #39ff14;

  /* ---- paper ground: the vine band only (plan 9.5).
          NEVER put --accent on --paper. #39FF14 on #FAFAFA is 1.30:1. ---- */
  --paper: #fafafa;
  --paper-ink: #1a1a1a;
  --paper-muted: #5f5f5f;         /* 6.1:1 on paper */
  --paper-accent: #1b7a00;        /* 5.3:1 on paper */
  --paper-border: #d4d4d4;

  /* ---- shadcn compatibility aliases. Several components/ui primitives read
          these names. Mapping them here means those files need no edits. ---- */
  --primary: #fafafa;
  --primary-foreground: #1a1a1a;
  --secondary: #232323;
  --secondary-foreground: #fafafa;
  --popover: #0f0f0f;
  --popover-foreground: #fafafa;
  --destructive: #fafafa;         /* no red in this build. See plan 2.3. */

  /* ---- motion ---- */
  --ease: cubic-bezier(0.25, 0, 0, 1);

  /* ---- layout ---- */
  --topbar-h: 64px;
  --nav-w: 240px;
  --nav-w-collapsed: 72px;
}

@media (min-width: 768px) {
  :root { --topbar-h: 80px; }
}

/* ==========================================================================
   THEME MAPPING
   `inline` means utilities emit the referenced value rather than another var().
   ========================================================================== */

@theme inline {
  /* ---- colour ---- */
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-faint: var(--faint);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-attention: var(--attention);
  --color-attention-foreground: var(--attention-foreground);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-border-hover: var(--border-hover);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-paper: var(--paper);
  --color-paper-ink: var(--paper-ink);
  --color-paper-muted: var(--paper-muted);
  --color-paper-accent: var(--paper-accent);
  --color-paper-border: var(--paper-border);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-destructive: var(--destructive);

  /* ---- families ---- */
  --font-sans: var(--stack-sans);
  --font-mono: var(--stack-mono);
  --font-quote: var(--stack-quote);

  /* ---- type scale. Overrides Tailwind's defaults. See plan 2.4. ---- */
  --text-xs: 0.75rem;
  --text-xs--line-height: 1.6;
  --text-sm: 0.875rem;
  --text-sm--line-height: 1.6;
  --text-base: 1rem;
  --text-base--line-height: 1.6;
  --text-lg: 1.125rem;
  --text-lg--line-height: 1.75;
  --text-xl: 1.25rem;
  --text-xl--line-height: 1.25;
  --text-2xl: 1.5rem;
  --text-2xl--line-height: 1.25;
  --text-3xl: 2rem;
  --text-3xl--line-height: 1.1;
  --text-4xl: 2.5rem;
  --text-4xl--line-height: 1.1;
  --text-5xl: 3.5rem;
  --text-5xl--line-height: 1.1;
  --text-6xl: 4.5rem;
  --text-6xl--line-height: 1.1;
  --text-7xl: 6rem;
  --text-7xl--line-height: 1;
  --text-8xl: 8rem;
  --text-8xl--line-height: 1;
  --text-9xl: 10rem;
  --text-9xl--line-height: 1;

  /* ---- tracking ---- */
  --tracking-tighter: -0.06em;
  --tracking-tight: -0.04em;
  --tracking-normal: -0.01em;
  --tracking-wide: 0.05em;
  --tracking-wider: 0.1em;
  --tracking-widest: 0.2em;

  /* ---- leading ---- */
  --leading-none: 1;
  --leading-tight: 1.1;
  --leading-snug: 1.25;
  --leading-normal: 1.6;
  --leading-relaxed: 1.75;

  /* ---- radius: zero, at every key, so a stray rounded-* renders sharp ---- */
  --radius: 0px;
  --radius-none: 0px;
  --radius-xs: 0px;
  --radius-sm: 0px;
  --radius-md: 0px;
  --radius-lg: 0px;
  --radius-xl: 0px;
  --radius-2xl: 0px;
  --radius-3xl: 0px;
  --radius-4xl: 0px;

  /* ---- shadow: none, at every key, so a stray shadow-* renders nothing ---- */
  --shadow-2xs: 0 0 #0000;
  --shadow-xs: 0 0 #0000;
  --shadow-sm: 0 0 #0000;
  --shadow-md: 0 0 #0000;
  --shadow-lg: 0 0 #0000;
  --shadow-xl: 0 0 #0000;
  --shadow-2xl: 0 0 #0000;
}

/* ==========================================================================
   BASE
   ========================================================================== */

@layer base {
  /* ---------------------------------------------------------- THE RADIUS LOCK
   * Sharp edges are the single most-violated rule of this design system and a
   * missed `rounded-lg` is invisible in a diff. This makes the rule structural.
   * Do not remove it. Do not add an exception. SVG shapes are unaffected.
   */
  *,
  *::before,
  *::after {
    border-radius: 0 !important;
  }

  /* ----------------------------------------------------------- THE FOCUS LOCK
   * Several components/ui primitives carry `outline-none` in their class
   * strings; a utility layer beats a base layer on a specificity tie, so
   * without !important they would win and the element would have no visible
   * focus state. This guarantees every focusable element has one.
   */
  *:focus-visible {
    outline: 2px solid var(--accent) !important;
    outline-offset: 2px !important;
  }

  * {
    border-color: var(--border);
  }

  html {
    font-family: var(--stack-sans);
    -webkit-text-size-adjust: 100%;
    scrollbar-color: var(--border-strong) transparent;
  }

  body {
    background: var(--background);
    color: var(--foreground);
    font-size: 1rem;
    line-height: 1.6;
    letter-spacing: -0.01em;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    /* Nothing may cause a horizontal scrollbar. Wide tables scroll inside
       their own container; see DataTable. */
    overflow-x: hidden;
  }

  /* Headings carry no default size: every heading in this build states its own
     responsive size, weight and tracking explicitly. This block only removes
     the browser defaults so an unstyled heading is obviously wrong. */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--stack-sans);
    font-weight: 600;
    font-size: inherit;
    line-height: 1.1;
  }

  ::selection {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  /* --------------------------------------------------------------- THE GRAIN
   * Fractal noise at 1.5% over the whole viewport. pointer-events:none means it
   * can never intercept a click, so the very high z-index is safe.
   */
  body::after {
    content: "";
    position: fixed;
    inset: 0;
    z-index: 9999;
    pointer-events: none;
    opacity: 0.015;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E");
    background-repeat: repeat;
  }
}

/* ==========================================================================
   COMPONENT CLASSES
   Five classes only. Everything else is Tailwind utilities at the call site.
   ========================================================================== */

/* The one micro-type class. Labels, never sentences. Replaces the old .eyebrow. */
.label {
  font-family: var(--stack-mono);
  font-size: 0.6875rem;
  line-height: 1.4;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 500;
}

/* Tabular figures wherever a number carries meaning and columns must align. */
.nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}

/* Editorial reading surface: study notes, parent summaries, learn concept notes.
   The lede is the one place Playfair appears inside the product. */
.prose-editorial {
  max-width: 68ch;
}
.prose-editorial > p {
  font-size: 1.125rem;
  line-height: 1.75;
  letter-spacing: -0.01em;
  color: var(--foreground);
}
.prose-editorial > p + p {
  margin-top: 1.5rem;
}
.prose-editorial > p:first-of-type {
  font-family: var(--stack-quote);
  font-size: 1.5rem;
  line-height: 1.6;
  letter-spacing: 0;
}
.prose-editorial > h2 {
  margin-top: 4rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  font-size: 0.6875rem;
  font-family: var(--stack-mono);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}
.prose-editorial > h2 + p {
  margin-top: 1.5rem;
}

/* Quiet scrollbars on any element that scrolls inside the page. */
.app-scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--border-strong) transparent;
}
.app-scroll::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.app-scroll::-webkit-scrollbar-thumb {
  background: var(--border-strong);
}

/* The paper band. Re-points every token so children written against the dark
   palette keep working, inverted, with no per-child overrides. */
.paper-band {
  background: var(--paper);
  color: var(--paper-ink);
  --background: var(--paper);
  --foreground: var(--paper-ink);
  --muted-foreground: var(--paper-muted);
  --faint: #c8c8c8;
  --accent: var(--paper-accent);
  --accent-foreground: var(--paper);
  --border: var(--paper-border);
  --border-strong: #8f8f8f;
  --border-hover: #a3a3a3;
  --card: var(--paper);
  --muted: #f0f0f0;
}

/* ==========================================================================
   MOTION
   ========================================================================== */

/* Route enter. The entire product motion budget, alongside CSS hover states. */
@keyframes page-enter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
}
.page-enter {
  animation: page-enter 200ms var(--ease);
}

/* Scroll reveal, landing only. Exactly the design system's specification:
   opacity 0 to 1, translateY 20px to 0, 500ms, 80ms stagger, 100ms lead-in.
   Elements start hidden ONLY once JS marks the scope ready, so a no-JS render
   shows every word and every crawler sees the copy. */
[data-reveal-scope="ready"] [data-reveal] {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 500ms var(--ease),
    transform 500ms var(--ease);
  transition-delay: calc(100ms + var(--reveal-i, 0) * 80ms);
}
[data-reveal-scope="ready"] [data-reveal].is-revealed {
  opacity: 1;
  transform: none;
}

/* Route view transitions. Chrome is frozen so only page content swaps. */
::view-transition { pointer-events: none; }
::view-transition-group(topbar),
::view-transition-group(worknav) {
  animation: none;
}
::view-transition-old(.page-swap) {
  animation: 200ms var(--ease) both page-swap-out;
}
::view-transition-new(.page-swap) {
  animation: 200ms var(--ease) both page-swap-in;
}
@keyframes page-swap-out {
  from { opacity: 1; transform: none; }
  to   { opacity: 0; transform: translateY(-6px); }
}
@keyframes page-swap-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  [data-reveal-scope="ready"] [data-reveal],
  [data-reveal-scope="ready"] [data-reveal].is-revealed {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}
```

### What was deleted from the old `globals.css`, and why

| Deleted | Reason |
|---|---|
| All `--sonder-*` brand primitives | The old design language. Replaced by the tokens above. |
| Both light-mode and `.dark` token blocks | Dark only, one palette on `:root`. |
| `--ok`, `--warn`, `--info`, `--ai` and their foregrounds | Five status hues become two. See §2.3. |
| All `--chart-*` and `--sidebar-*` | Nothing reads them after Phase 5. |
| `.sonder-glass` and both fallbacks | No glass anywhere. |
| `--glass-*`, `--rail-w*`, `--site-nav-h`, `--dock-*`, `--chrome-*` | Old chrome geometry. |
| `.site-nav*`, `.glass-rail`, `.glass-bottombar`, `.student-dock*` | Old chrome. |
| `.sonder-grid`, `.sonder-grid-soft` | The 24px construction grid. Replaced by grain. |
| `.notch` | Asymmetric corners. Radius is 0 now. |
| `.surface-shadow` | No shadows. |
| `.sonder-draw-rule` | Replaced by a static hairline; see §8.14. |
| `.eyebrow` | Renamed `.label` with new metrics. **This is a breaking rename; §3.4 handles it.** |
| `.article-body` | Renamed `.prose-editorial` with new metrics. |
| `--ease-sonder` | Renamed `--ease` with a new curve. **Breaking; §3.4 handles it.** |
| `--font-display`, `--font-heading` | Newsreader is gone. **Breaking; §3.4 handles it.** |

## 3.4 The sweep — MANDATORY, do not skip

Phase 1 renamed or deleted class names and variables that are referenced in roughly 60 files. In
Tailwind v4 **an unknown utility produces no CSS and no error.** If you skip this sweep the site
will build cleanly and look wrong in ways that are very hard to trace.

Run each command. Fix every hit. Then re-run until it returns nothing.

### Sweep 1 — `.eyebrow` becomes `.label`

```bash
grep -rln "eyebrow" app components
```

In every file, replace the class name `eyebrow` with `label`. It is always used as a bare class
(`className="eyebrow ..."` or inside `cn("eyebrow", ...)`), so a plain find-and-replace of the
word `eyebrow` is safe **except** for the `eyebrow` *prop* on the old `PageHeader`/`PageShell`
components. Those two components are deleted in Phase 4, and their prop is renamed `label` on
`PageMasthead`. Handle the prop rename when you rewrite each route in PART 10.

### Sweep 2 — `--ease-sonder` becomes `--ease`

```bash
grep -rn "ease-sonder" app components lib
```

Replace `var(--ease-sonder)` with `var(--ease)` and the Tailwind form
`ease-[var(--ease-sonder)]` with `ease-[var(--ease)]`.

### Sweep 3 — the deleted font families

```bash
grep -rn "font-display\|font-heading" app components
```

Every hit is a heading that must now state its own size, weight and tracking. Replace
`font-display text-[26px] font-normal leading-[1.12] tracking-[-0.01em]` and its variants with
the appropriate entry from the §2.4 scale. Most of these live in components you are rewriting
anyway; fix the rest in place. **`components/ui/card.tsx` line 41 has `font-heading` — it is
rewritten in §4.3.**

### Sweep 4 — the deleted status colours

```bash
grep -rn "text-ok\|bg-ok\|border-ok\|text-warn\|bg-warn\|border-warn\|text-info\|bg-info\|border-info\|text-ai\|bg-ai\|ring-ai\|warn-foreground\|ok-foreground\|info-foreground\|ai-foreground" app components
```

Map every hit through the §2.3 bucket table:
`ok` → `accent`, `warn` → `attention`, `info` → `foreground`, `ai` → `attention`.
Note that `--color-ok` etc. no longer exist, so these classes currently emit nothing.

### Sweep 5 — the deleted brand colours

```bash
grep -rn "sonder-rim\|sonder-hot\|sonder-paper\|sonder-muted\|sonder-ink\|sonder-line\|sonder-glass\|sonder-grid\|sonder-notch\|sonder-draw\|surface-shadow\|notch" app components
```

`sonder-rim` → `accent`. `sonder-hot` → `accent`. `sonder-paper` → `foreground`.
`sonder-muted` → `muted-foreground`. Delete `notch`, `surface-shadow`, `sonder-glass`,
`sonder-grid*` classes entirely. Replace `color-mix(in srgb, var(--sonder-rim) N%, transparent)`
with `var(--accent)` at an explicit Tailwind opacity, e.g. `bg-accent/10`.

### Sweep 6 — radius and shadow classes

```bash
grep -rn "rounded-full\|rounded-\[" app components
```

`rounded-full` is **not** controlled by a theme variable in Tailwind v4 (it compiles to
`calc(infinity * 1px)`), so the radius lock in §3.3 handles it at runtime but the class is still
noise. Delete every `rounded-*` and `shadow-*` class you encounter while rewriting a file. You
do not need a separate pass; the locks make a missed one harmless.

### Sweep 7 — the deleted `.article-body`

```bash
grep -rn "article-body" app components
```

Replace with `prose-editorial`.

### Sweep 8 — em dashes in authored chrome copy

```bash
grep -rn "—\|–" app components lib --include=*.tsx --include=*.ts --include=*.css \
  | grep -v "\.test\."
```

Every hit in a string **you author** is a defect; see §0.5 for substitutions. **Do not run this
against `fixtures/` and do not edit fixture prose.** A line that merely interpolates fixture
data is not a hit.

## 3.5 Phase 1 gate

```bash
npm run build
```

Must exit 0. The site will look wrong — that is expected and correct at this point. What must be
true:

- [ ] `npm run build` exits 0.
- [ ] `grep -rn "next-themes" app components lib` returns nothing.
- [ ] `grep -rn "eyebrow" app components` returns nothing except `PageHeader`/`PageShell` props.
- [ ] `grep -rn "ease-sonder\|font-display\|font-heading\|article-body" app components` returns nothing.
- [ ] Opening `/` shows a charcoal page in Inter Tight, not Geist.
- [ ] Tabbing anywhere shows a 2px neon outline with a 2px offset.
- [ ] Nothing on screen has a rounded corner.

---

# PART 4 — PHASE 2: PRIMITIVES

## 4.0 A finding that saves you most of this phase

`components/ui/` contains 23 shadcn primitives. **Only four are imported by any application
code.** This was verified by grepping every `from "@/components/ui/..."` in `app/` and
`components/`:

| Primitive | Import sites |
|---|---|
| `button` | 26 files |
| `tooltip` | 2 files (`providers.tsx`, `GlassRail.tsx` — the latter is being deleted) |
| `textarea` | 1 file (`ReviewPanel.tsx`) |
| `sonner` | 1 file (`providers.tsx`) |

The other nineteen are unwired scaffolding. Only `dialog.tsx` has an internal dependency (on
`button`); every other file is standalone, so deleting them is safe.

### 4.0.1 Delete the dead primitives

```bash
rm components/ui/accordion.tsx components/ui/avatar.tsx components/ui/badge.tsx \
   components/ui/card.tsx components/ui/checkbox.tsx components/ui/collapsible.tsx \
   components/ui/dialog.tsx components/ui/dropdown-menu.tsx components/ui/label.tsx \
   components/ui/progress.tsx components/ui/radio-group.tsx components/ui/scroll-area.tsx \
   components/ui/select.tsx components/ui/separator.tsx components/ui/skeleton.tsx \
   components/ui/switch.tsx components/ui/table.tsx components/ui/tabs.tsx
```

That leaves exactly five files: `button.tsx`, `input.tsx`, `sonner.tsx`, `textarea.tsx`,
`tooltip.tsx`. `input.tsx` is currently unused but you **will** need it (the admin catalogue
search and both chat composers), so keep and rewrite it.

Run `npm run build` immediately after the deletion. It must exit 0. If it does not, something
imported one of those files and you must restore just that file.

> **Why delete rather than restyle.** Nineteen unused files, each carrying `rounded-lg`,
> `shadow-sm`, `dark:` variants and references to the deleted `--destructive`/`--ok` tokens, are
> nineteen chances for a future edit to reintroduce the old design language. The design system's
> instruction is to leave the codebase cleaner than you found it. If a dialog or a select is ever
> genuinely needed, `npx shadcn add` can bring one back and it will inherit the new tokens.

## 4.1 `components/ui/button.tsx` — replace the whole file

This is the most-used component in the build (26 files) and the clearest expression of the
design system. Read the design notes under the code before you type it.

```tsx
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Text-first buttons. There are no filled buttons in this build.
 *
 * The underline is a ::after pseudo-element, NOT a child <span>. That is
 * deliberate: `buttonVariants()` is applied as a className to <Link> in about
 * fifteen places, and a pseudo-element travels with the class string while a
 * child element would not. Do not "improve" this into a span.
 */
const buttonVariants = cva(
  [
    "group relative inline-flex shrink-0 items-center justify-center",
    "whitespace-nowrap font-semibold uppercase tracking-wider",
    "transition-all duration-150 ease-[var(--ease)]",
    "active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-50",
    "aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Primary: accent text over a 2px accent rule that widens on hover. */
        primary: [
          "px-0 text-accent",
          "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0",
          "after:h-0.5 after:bg-accent after:origin-center after:scale-x-100",
          "after:transition-transform after:duration-150 after:ease-[var(--ease)]",
          "hover:after:scale-x-110",
        ].join(" "),

        /* Secondary: 1px outline that fully inverts on hover. */
        outline: [
          "border border-foreground px-6 text-foreground",
          "hover:bg-foreground hover:text-background",
        ].join(" "),

        /* Ghost: muted text, hairline underline drawn in from the left on hover. */
        ghost: [
          "px-4 text-muted-foreground hover:text-foreground",
          "after:pointer-events-none after:absolute after:inset-x-4 after:bottom-0",
          "after:h-px after:bg-current after:origin-left after:scale-x-0",
          "after:transition-transform after:duration-150 after:ease-[var(--ease)]",
          "hover:after:scale-x-100",
        ].join(" "),
      },
      size: {
        sm: "min-h-11 gap-2 py-3 text-xs",
        default: "min-h-11 gap-2.5 py-3 text-sm",
        lg: "min-h-14 gap-3 py-4 text-base",
        /* Icon buttons carry no underline and must always have an aria-label. */
        icon: "size-11 gap-0 px-0 after:hidden",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
```

### Design notes you must not undo

- **`variant` names changed.** `default` → `primary`, `secondary`/`destructive`/`link` are gone.
  `outline` and `ghost` keep their names. Twenty-six files call this; every call site with
  `variant="default"`, `variant="secondary"` or `variant="destructive"` must be updated. You will
  do that as you rewrite each route in PART 10. Until then those call sites fall back to
  `primary`, which is harmless (TypeScript will flag the invalid literal, so `npm run build`
  catches every one for you — use it as your worklist).
- **`size` values changed.** `xs`, `icon-xs`, `icon-sm`, `icon-lg` are gone. Only
  `sm | default | lg | icon` remain. Same TypeScript-as-worklist trick applies.
- **Touch targets.** `min-h-11` is 44px, `min-h-14` is 56px, `size-11` is 44x44. Every button in
  the build clears the minimum without you thinking about it.
- **The underline overflows on hover by design.** `scale-x-110` with a centre origin grows the
  rule 5% past each end of the text. Adjacent primary buttons therefore need real separation:
  **use `gap-8` (32px) between two primary buttons**, never `gap-2`. This is why button rows in
  PART 10 are always specified with `gap-8`.
- **No focus classes.** The global focus lock in §3.3 provides the 2px accent outline. Do not add
  `focus-visible:ring-*`; it would produce a second, conflicting indicator.
- **No `rounded-*`, no `shadow-*`.** The locks make a stray one harmless, but do not write one.

> **Divergence 3 of 6 — inputs and buttons keep the global focus outline.** The design system
> says an input's focus state is `border-accent` with "no ring, no glow, outline-none". This build
> gives inputs *both* the accent border and the standard 2px outline. Reason: one consistent focus
> indicator across every interactive element is worth more than matching that one line, and
> `outline-none` on a form control is the single most common accessibility regression in
> redesigns. The lock in §3.3 makes it structurally impossible.

## 4.2 `components/ui/input.tsx` and `textarea.tsx` — replace both

```tsx
// components/ui/input.tsx
import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // text-base (16px) is load-bearing: anything smaller makes iOS Safari
        // zoom the viewport on focus. Do not drop it to text-sm.
        "h-12 w-full min-w-0 border border-border-strong bg-input px-4",
        "text-base text-foreground placeholder:text-muted-foreground",
        "transition-colors duration-150 ease-[var(--ease)]",
        "focus:border-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "md:h-14",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
```

```tsx
// components/ui/textarea.tsx
import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content min-h-28 w-full border border-border-strong bg-input px-4 py-3",
        "text-base leading-normal text-foreground placeholder:text-muted-foreground",
        "transition-colors duration-150 ease-[var(--ease)]",
        "focus:border-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
```

Every label paired with one of these is a `<label className="label text-muted-foreground">` with
an explicit `htmlFor`, sitting 12px above the field. Never rely on a placeholder as the label.

## 4.3 `components/ui/tooltip.tsx` — one edit

Tooltips are `bg-foreground text-background`, which inverts correctly and needs no change. Make
exactly two edits to the existing file:

1. In `TooltipContent`'s class string, delete `rounded-md`.
2. In `TooltipPrimitive.Arrow`'s class string, delete `rounded-[2px]`.

Both are already neutralised by the radius lock; removing them keeps the source honest.

Tooltips are used in exactly one place after Phase 5: the collapsed workspace nav (§7.5).

## 4.4 Phase 2 gate

- [ ] `npm run build` exits 0. **Expect a long list of TypeScript errors on the first attempt**
      from `variant="default"` / `variant="secondary"` / `variant="destructive"` and
      `size="xs"` / `size="icon-sm"`. That list is your PART 10 worklist. To keep the build green
      *now*, do a mechanical pass: `default` → `primary`, `secondary` → `outline`,
      `destructive` → `outline`, `xs`/`icon-xs`/`icon-sm`/`icon-lg` → `sm`/`icon`. Each of those
      files is rewritten properly later.
- [ ] `ls components/ui` shows exactly five files.
- [ ] A button anywhere on the site is text with a 2px accent rule under it, and the rule widens
      on hover.

---

# PART 5 — PHASE 3: THE TYPOGRAPHIC VOCABULARY

New directory: `components/type/`. Six small components. These exist so that the type system is
applied by *composition* rather than by remembering class strings, which is the only way
twenty-seven routes stay consistent.

Create `components/type/index.ts` exporting all six.

## 5.1 `components/type/Label.tsx`

```tsx
import { cn } from "@/lib/utils";

/**
 * The micro-type signature: mono, uppercase, 0.2em tracking, 11px.
 * Used wherever a label is not a sentence. Never for prose.
 *
 * `tone` maps to the four status buckets in the plan, part 2.3.
 */
export function Label({
  children,
  tone = "muted",
  as: Tag = "p",
  className,
}: {
  children: React.ReactNode;
  tone?: "muted" | "accent" | "attention" | "foreground" | "faint";
  as?: "p" | "span" | "div" | "h2" | "h3" | "dt";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "label",
        tone === "muted" && "text-muted-foreground",
        tone === "accent" && "text-accent",
        tone === "attention" && "text-attention",
        tone === "foreground" && "text-foreground",
        tone === "faint" && "text-faint",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
```

## 5.2 `components/type/Heading.tsx`

```tsx
import { cn } from "@/lib/utils";

/**
 * The type scale, applied by name instead of by remembering four classes.
 * Tracking is a function of size and is never chosen independently:
 * display sizes get -0.06em, large headings -0.04em.
 */
const SCALE = {
  /** The landing statement only. 8:1 against body. */
  statement:
    "text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-none",
  /** Role home pages and the landing sections. 6:1 against body. */
  hero: "text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tighter leading-tight",
  /** Every interior route's h1. 4.5:1 against body. */
  page: "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight",
  /** Major block inside a page. */
  section: "text-3xl sm:text-4xl font-semibold tracking-tight leading-tight",
  /** A named thing inside a block: a student, a misconception, a question. */
  item: "text-xl sm:text-2xl font-semibold tracking-tight leading-snug",
  /** The smallest real heading. */
  minor: "text-lg font-semibold tracking-normal leading-snug",
} as const;

export function Heading({
  level = 2,
  scale = "section",
  children,
  className,
}: {
  level?: 1 | 2 | 3 | 4;
  scale?: keyof typeof SCALE;
  children: React.ReactNode;
  className?: string;
}) {
  const Tag = `h${level}` as const;
  return <Tag className={cn(SCALE[scale], className)}>{children}</Tag>;
}

export { SCALE as HEADING_SCALE };
```

**One `<h1>` per page, always.** It is produced by `PageMasthead` (§6.2). No other component may
render an `<h1>`.

## 5.3 `components/type/Quote.tsx`

```tsx
import { cn } from "@/lib/utils";

/**
 * Playfair Display. One of only four permitted call sites in the build; see
 * the plan, part 2.4. If you are reaching for this and the content is not a
 * pull quote or an editorial lede, use Heading instead.
 */
export function Quote({
  children,
  cite,
  className,
}: {
  children: React.ReactNode;
  cite?: string;
  className?: string;
}) {
  return (
    <figure className={cn("max-w-3xl", className)}>
      <blockquote className="font-quote text-2xl leading-relaxed tracking-normal text-foreground sm:text-3xl">
        {children}
      </blockquote>
      {cite ? (
        <figcaption className="label mt-6 text-muted-foreground">{cite}</figcaption>
      ) : null}
    </figure>
  );
}
```

## 5.4 `components/type/AccentBar.tsx`

```tsx
import { cn } from "@/lib/utils";

/**
 * The system's signature anchor: a 2px x 64px accent rule. Sits under a
 * masthead headline and above a highlighted block. Purely decorative, so it is
 * aria-hidden.
 */
export function AccentBar({ className }: { className?: string }) {
  return <div aria-hidden className={cn("h-0.5 w-16 bg-accent", className)} />;
}
```

## 5.5 `components/type/Stat.tsx`

```tsx
import { cn } from "@/lib/utils";

/**
 * A number that carries meaning: mono, tabular, large, with a wide-tracked
 * label underneath. Replaces every boxed metric tile in the old build. There is
 * no border, no background and no shadow: a 1px rule does the separating.
 */
export function Stat({
  value,
  label,
  hint,
  tone = "foreground",
  size = "default",
  className,
}: {
  value: React.ReactNode;
  label: string;
  hint?: string;
  tone?: "foreground" | "accent" | "attention" | "muted";
  size?: "default" | "large";
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <p
        className={cn(
          "nums font-mono leading-none tracking-tight",
          size === "large" ? "text-5xl sm:text-6xl" : "text-3xl sm:text-4xl",
          tone === "foreground" && "text-foreground",
          tone === "accent" && "text-accent",
          tone === "attention" && "text-attention",
          tone === "muted" && "text-muted-foreground",
        )}
      >
        {value}
      </p>
      <p className="label mt-4 text-muted-foreground">{label}</p>
      {hint ? (
        <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
```

## 5.6 `components/type/StatRow.tsx`

```tsx
import Link from "next/link";
import { Stat } from "./Stat";
import { cn } from "@/lib/utils";

export type StatItem = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  href?: string;
  tone?: "foreground" | "accent" | "attention" | "muted";
};

/**
 * A row of stats separated by vertical hairlines. Stacks to one column below
 * `sm`, where the hairlines become horizontal. This replaces the deleted
 * MetricStrip and, before it, StatTile.
 */
export function StatRow({
  items,
  className,
}: {
  items: StatItem[];
  className?: string;
}) {
  if (!items.length) return null;

  return (
    <div
      className={cn(
        "grid grid-cols-1 border-t border-border sm:grid-cols-2",
        items.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item, i) => {
        const cell = (
          <Stat
            value={item.value}
            label={item.label}
            hint={item.hint}
            tone={item.tone}
          />
        );
        const shape = cn(
          "border-b border-border py-8 sm:py-10",
          // First cell in each row sits flush; the rest carry the vertical rule.
          "sm:border-b-0 sm:border-l sm:border-border sm:px-8",
          "sm:[&:nth-child(2n+1)]:border-l-0 sm:[&:nth-child(2n+1)]:pl-0",
          items.length >= 4
            ? "lg:[&:nth-child(2n+1)]:border-l lg:[&:nth-child(2n+1)]:pl-8 lg:[&:nth-child(4n+1)]:border-l-0 lg:[&:nth-child(4n+1)]:pl-0"
            : "lg:[&:nth-child(2n+1)]:border-l lg:[&:nth-child(2n+1)]:pl-8 lg:[&:nth-child(3n+1)]:border-l-0 lg:[&:nth-child(3n+1)]:pl-0",
        );

        return item.href ? (
          <Link
            key={item.label}
            href={item.href}
            className={cn(shape, "group block transition-colors hover:bg-muted")}
          >
            {cell}
          </Link>
        ) : (
          <div key={item.label} className={shape}>
            {cell}
          </div>
        );
      })}
    </div>
  );
}
```

## 5.7 `components/type/LayeredNumber.tsx`

```tsx
import { cn } from "@/lib/utils";

/**
 * Depth without shadows: an oversized numeral in --faint sitting behind
 * content. Hidden below `md` because a 160px glyph forces horizontal scroll on
 * a phone, which the design system calls out explicitly.
 */
export function LayeredNumber({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute -z-10 hidden select-none",
        "font-mono text-8xl leading-none tracking-tighter text-faint md:block lg:text-9xl",
        className,
      )}
    >
      {value}
    </span>
  );
}
```

Its parent must be `relative` and must not have `overflow-hidden` on any ancestor that would clip
it. Used at most **six times** in the whole build: the landing's four workspace entries and the
404. Do not sprinkle it.

## 5.8 `components/type/index.ts`

```ts
export { Label } from "./Label";
export { Heading, HEADING_SCALE } from "./Heading";
export { Quote } from "./Quote";
export { AccentBar } from "./AccentBar";
export { Stat } from "./Stat";
export { StatRow, type StatItem } from "./StatRow";
export { LayeredNumber } from "./LayeredNumber";
```

## 5.9 Phase 3 gate

- [ ] `npm run build` exits 0.
- [ ] `components/type/` contains 8 files.
- [ ] Nothing imports these yet. That is expected.

---

# PART 6 — PHASE 4: LAYOUT PRIMITIVES

New directory: `components/layout/`. These replace the seven archetype shells. The old shells
each hard-coded a whole page skeleton; these are small, composable pieces that PART 10 assembles
differently for every route. That is the point: **twenty-seven routes must not look like one
route rendered twenty-seven times.**

## 6.0 What replaced what

| Deleted | Replacement | Note |
|---|---|---|
| `shells/ConsoleShell` | `Container` + `PageMasthead` + `StatRow` + `Callout` | |
| `shells/WorklistShell` | `Container` + `PageMasthead` + `Split` + `ListRow` | Detail is a real sticky column composed at the call site |
| `shells/InspectorShell` | `Container` + `PageMasthead` + `Split` + `StepTimeline` | |
| `shells/FocusShell` | `FocusFrame` (§6.7) | Genuinely needs its own frame: it suppresses chrome |
| `shells/ArticleShell` | `Container` + `PageMasthead` + `.prose-editorial` + `Split` | |
| `shells/DirectoryShell` | `Container` + `PageMasthead` + `FilterStrip` + `GroupHeading` | |
| `shells/ConversationShell` | `ChatFrame` (§6.8) | Genuinely needs its own frame: a pinned composer |
| `PageShell`, `PageHeader` | `PageMasthead` | |
| `primitives.Surface` | `Panel` | Usage drops by about three quarters |
| `primitives.SectionHeading` | `GroupHeading` | |
| `primitives.Th`, `Td` | `DataTable` column config (§8.9) | |
| `LeadPanel` | `Callout` | |
| `MetricStrip` | `StatRow` (§5.6) | |
| `AreaCard` | `LinkRow` | |
| `WorklistRow` | `ListRow` | |
| `Placeholder` | `EmptyState` | |

Only **two** frames survive as page-level wrappers (`FocusFrame`, `ChatFrame`), because those two
page types genuinely change the shape of the viewport. Everything else is composed.

## 6.1 `components/layout/Container.tsx`

```tsx
import { cn } from "@/lib/utils";

/**
 * 1200px measure with the design system's responsive gutters:
 * 24px mobile, 48px tablet, 64px desktop.
 *
 * `width="wide"` (1440px) is for the two genuinely wide screens: the teacher
 * dashboard roster and the provenance log. Nothing else may use it.
 * `width="narrow"` (720px) is for reading and task surfaces.
 */
export function Container({
  width = "default",
  children,
  className,
}: {
  width?: "narrow" | "default" | "wide";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 md:px-12 lg:px-16",
        width === "narrow" && "max-w-[720px]",
        width === "default" && "max-w-[1200px]",
        width === "wide" && "max-w-[1440px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
```

## 6.2 `components/layout/PageMasthead.tsx` — THE SIGNATURE COMPONENT

Every product route opens with this. It is what makes the build read as poster design rather
than as a dashboard. Do not skip it on any route. Do not write a bespoke page header.

```tsx
import { Label, Heading, AccentBar } from "@/components/type";
import { cn } from "@/lib/utils";

/**
 * The poster opening. Asymmetric 8/4 by construction: the title block never
 * spans the full grid, which is what keeps every page off a centred axis.
 *
 * Renders the page's ONE <h1>. No other component may render one.
 */
export function PageMasthead({
  label,
  title,
  lede,
  meta,
  actions,
  tabs,
  scale = "page",
  className,
}: {
  /** Mono, uppercase, accent. Two to four words. Always present. */
  label: string;
  title: React.ReactNode;
  /** One or two sentences. Capped at max-w-2xl for measure. */
  lede?: string;
  /** Right-hand column at lg: a MetaList, a StatusMark, a date. Optional. */
  meta?: React.ReactNode;
  /** Buttons. Always separated by gap-8; see the button underline note. */
  actions?: React.ReactNode;
  /** A RouteTabs strip. Renders below the rule. */
  tabs?: React.ReactNode;
  scale?: "hero" | "page";
  className?: string;
}) {
  return (
    <header className={cn("relative pt-12 md:pt-16", className)}>
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-8">
          <Label tone="accent">{label}</Label>
          <Heading level={1} scale={scale} className="mt-6">
            {title}
          </Heading>
          <AccentBar className="mt-8" />
          {lede ? (
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {lede}
            </p>
          ) : null}
        </div>

        {meta ? (
          <div className="mt-10 lg:col-span-4 lg:mt-0 lg:pt-2">{meta}</div>
        ) : null}
      </div>

      {actions ? (
        <div className="mt-10 flex flex-wrap items-center gap-8">{actions}</div>
      ) : null}

      <hr className="mt-16 border-0 border-t border-border md:mt-20" />

      {tabs ? <div className="mt-8">{tabs}</div> : null}
    </header>
  );
}
```

**Rules for `label`.** It is the mono kicker above the headline. It must be a *category*, not a
repeat of the title. Good: `CLASS DASHBOARD`, `EVIDENCE TRAIL`, `COVERAGE`, `STUDY NOTE`. Bad:
`WELCOME`, `PAGE`, `OVERVIEW OF THE OVERVIEW`. PART 10 gives you the exact string for all 27
routes; use it verbatim.

## 6.3 `components/layout/Section.tsx`

```tsx
import { cn } from "@/lib/utils";

/**
 * Vertical rhythm. Content is separated by space and hairline rules, never by
 * boxes. `bordered` draws the rule; `muted` alternates the ground.
 */
export function Section({
  size = "default",
  bordered = false,
  muted = false,
  children,
  className,
  ...rest
}: {
  size?: "tight" | "default" | "hero";
  bordered?: boolean;
  muted?: boolean;
  children: React.ReactNode;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLElement>, "children" | "className">) {
  return (
    <section
      className={cn(
        size === "tight" && "py-16 md:py-20",
        size === "default" && "py-20 md:py-28",
        size === "hero" && "py-28 md:py-40",
        bordered && "border-t border-border",
        muted && "bg-muted",
        className,
      )}
      {...rest}
    >
      {children}
    </section>
  );
}
```

## 6.4 `components/layout/Split.tsx`

```tsx
import { cn } from "@/lib/utils";

/**
 * Asymmetric two-column layout. 7/5 and 8/4 only. Never 6/6: a symmetric split
 * is the one thing the design system explicitly rules out.
 *
 * `sticky` pins the secondary column with its own scroller and an explicit
 * max-height. A sticky column taller than the viewport is unreachable content,
 * so the max-height is mandatory, not optional.
 */
export function Split({
  ratio = "8/4",
  primary,
  secondary,
  sticky = false,
  secondaryFirstOnMobile = false,
  className,
}: {
  ratio?: "7/5" | "8/4" | "5/7" | "4/8";
  primary: React.ReactNode;
  secondary: React.ReactNode;
  sticky?: boolean;
  /** Put the secondary column above the primary on small screens. */
  secondaryFirstOnMobile?: boolean;
  className?: string;
}) {
  const [a, b] = ratio.split("/").map(Number);
  const primaryLeads = ratio === "7/5" || ratio === "8/4";

  return (
    <div className={cn("lg:grid lg:grid-cols-12 lg:gap-12", className)}>
      <div
        className={cn(
          "min-w-0",
          primaryLeads ? "lg:order-1" : "lg:order-2",
          a === 8 && "lg:col-span-8",
          a === 7 && "lg:col-span-7",
          a === 5 && "lg:col-span-5",
          a === 4 && "lg:col-span-4",
          !secondaryFirstOnMobile ? "order-1" : "order-2 mt-12 lg:mt-0",
        )}
      >
        {primary}
      </div>

      <aside
        className={cn(
          "min-w-0",
          primaryLeads ? "lg:order-2" : "lg:order-1",
          b === 5 && "lg:col-span-5",
          b === 4 && "lg:col-span-4",
          b === 7 && "lg:col-span-7",
          b === 8 && "lg:col-span-8",
          !secondaryFirstOnMobile ? "order-2 mt-12 lg:mt-0" : "order-1",
          sticky &&
            "app-scroll lg:sticky lg:top-[calc(var(--topbar-h)+2rem)] lg:max-h-[calc(100dvh-var(--topbar-h)-4rem)] lg:overflow-y-auto",
        )}
      >
        {secondary}
      </aside>
    </div>
  );
}
```

> **`position: sticky` fails silently if any ancestor has `overflow: hidden`.** The new
> `AppShell` (§7.6) is deliberately free of `overflow-hidden`, and `body` uses `overflow-x:
> hidden` which does **not** break sticky in modern browsers because the block-axis stays
> `visible`. If a sticky column ever refuses to stick, this is the first thing to check.

## 6.5 `components/layout/Panel.tsx`

```tsx
import { cn } from "@/lib/utils";

/**
 * The rare bounded container. Transparent fill, 1px border, sharp corners, no
 * shadow. Reach for a hairline rule and space before you reach for this.
 *
 * `highlighted` is the featured treatment: a 2px accent border and, by
 * convention at the call site, a small accent badge above it.
 */
export function Panel({
  highlighted = false,
  interactive = false,
  children,
  className,
  ...rest
}: {
  highlighted?: boolean;
  /** Adds the hover border-lightening transition. Use on links and buttons. */
  interactive?: boolean;
  children: React.ReactNode;
  className?: string;
} & Omit<React.HTMLAttributes<HTMLDivElement>, "children" | "className">) {
  return (
    <div
      className={cn(
        "bg-transparent p-6 md:p-8",
        highlighted ? "border-2 border-accent" : "border border-border",
        interactive &&
          "transition-colors duration-150 ease-[var(--ease)] hover:border-border-hover",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
```

## 6.6 `components/layout/Callout.tsx`

```tsx
import { Label, Heading } from "@/components/type";
import { cn } from "@/lib/utils";

/**
 * The one urgent thing on a page. A full-width 2px rule above it does the work
 * a coloured box used to do. One Callout per page, maximum: if everything is
 * urgent, nothing is.
 */
export function Callout({
  kicker,
  title,
  body,
  action,
  tone = "accent",
  className,
}: {
  kicker: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  action?: React.ReactNode;
  tone?: "accent" | "attention" | "neutral";
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border-t-2 pt-8",
        tone === "accent" && "border-t-accent",
        tone === "attention" && "border-t-attention",
        tone === "neutral" && "border-t-foreground",
        className,
      )}
    >
      <Label tone={tone === "neutral" ? "muted" : tone}>{kicker}</Label>
      <Heading scale="item" className="mt-4">
        {title}
      </Heading>
      {body ? (
        <div className="mt-4 max-w-2xl text-base leading-normal text-muted-foreground">
          {body}
        </div>
      ) : null}
      {action ? (
        <div className="mt-8 flex flex-wrap items-center gap-8">{action}</div>
      ) : null}
    </section>
  );
}
```

## 6.7 `components/layout/FocusFrame.tsx`

Replaces `FocusShell`. Used by the diagnostic session, the verification check, the subject
picker and the 404.

```tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Do one thing." Sets data-focus on <html>, which CSS in the app shell uses to
 * hide the workspace nav and the breadcrumb, leaving the top bar's wordmark and
 * one explicit exit link. Navigation is suppressed, never removed: a student
 * who wants out must not need the browser back button.
 *
 * The cleanup is mandatory. Without it every later route renders with its nav
 * hidden.
 */
export function FocusFrame({
  progress,
  exitHref,
  exitLabel = "Leave this screen",
  children,
  className,
}: {
  progress?: { current: number; total: number };
  exitHref: string;
  exitLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.focus = "true";
    return () => {
      delete root.dataset.focus;
    };
  }, []);

  const pct = progress
    ? Math.min(100, Math.max(0, (progress.current / progress.total) * 100))
    : 0;

  return (
    <>
      {progress ? (
        <div
          role="progressbar"
          aria-label="Progress through this task"
          aria-valuenow={progress.current}
          aria-valuemin={0}
          aria-valuemax={progress.total}
          className="fixed inset-x-0 top-0 z-50 h-0.5 bg-border"
        >
          <div
            className="h-full bg-accent transition-[width] duration-500 ease-[var(--ease)] motion-reduce:transition-none"
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}

      <div className={cn("mx-auto w-full max-w-[720px] px-6 py-20 md:py-28", className)}>
        <Link
          href={exitHref}
          className="label group relative inline-flex min-h-11 items-center gap-3 text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
          {exitLabel}
        </Link>

        <div className="mt-12">{children}</div>
      </div>
    </>
  );
}
```

## 6.8 `components/layout/ChatFrame.tsx`

Replaces `ConversationShell`. Three grid rows; the transcript is the only scrolling region so the
composer never leaves the viewport.

```tsx
import { cn } from "@/lib/utils";

export function ChatFrame({
  header,
  chips,
  composer,
  children,
  className,
}: {
  header?: React.ReactNode;
  /** Suggestion chips, in their own horizontal scroller above the composer, so
   *  a long prompt list can never push the input off screen. */
  chips?: React.ReactNode;
  composer: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("mx-auto grid w-full max-w-[840px] px-6 md:px-12", className)}
      style={{
        height: "calc(100dvh - var(--topbar-h))",
        gridTemplateRows: "auto minmax(0,1fr) auto",
      }}
    >
      {header ? <div className="min-h-0">{header}</div> : <div />}

      <div className="app-scroll min-h-0 overflow-y-auto py-8">{children}</div>

      <div className="border-t border-border pb-8 pt-6">
        {chips ? (
          <div className="app-scroll mb-4 flex snap-x gap-3 overflow-x-auto pb-1">
            {chips}
          </div>
        ) : null}
        {composer}
      </div>
    </div>
  );
}
```

## 6.9 `components/layout/ListRow.tsx`

Replaces `WorklistRow`. A row is a row: no card, no fill, no shadow.

```tsx
"use client";

import { cn } from "@/lib/utils";

/**
 * A dense selectable row. Selection is a 2px accent rule on the left edge plus
 * a muted ground, never a colour wash alone.
 */
export function ListRow({
  leading,
  title,
  meta,
  trailing,
  selected = false,
  onSelect,
  className,
}: {
  /** A StatusMark glyph, an index, or a mono code. Optional. */
  leading?: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
  /** Right-aligned: a date, a score, a chevron. */
  trailing?: React.ReactNode;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
}) {
  const inner = (
    <>
      {selected ? (
        <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-accent" />
      ) : null}
      <span className="flex min-w-0 flex-1 items-start gap-4">
        {leading ? <span className="mt-0.5 shrink-0">{leading}</span> : null}
        <span className="min-w-0 flex-1">
          <span className="block text-base font-medium leading-snug">{title}</span>
          {meta ? (
            <span className="mt-2 block text-sm text-muted-foreground">{meta}</span>
          ) : null}
        </span>
      </span>
      {trailing ? (
        <span className="label shrink-0 pt-1 text-muted-foreground">{trailing}</span>
      ) : null}
    </>
  );

  const shape = cn(
    "relative flex w-full min-h-16 items-start justify-between gap-6",
    "border-b border-border py-5 pl-5 pr-2 text-left",
    "transition-colors duration-150 ease-[var(--ease)]",
    selected ? "bg-muted" : "hover:bg-muted",
    className,
  );

  if (!onSelect) return <div className={shape}>{inner}</div>;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected ? "true" : undefined}
      className={shape}
    >
      {inner}
    </button>
  );
}
```

## 6.10 `components/layout/LinkRow.tsx`

Replaces `AreaCard`. A navigational destination as a typographic row, not a card.

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function LinkRow({
  href,
  title,
  description,
  className,
}: {
  href: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-h-16 items-baseline justify-between gap-6 border-b border-border py-5",
        "transition-colors duration-150 ease-[var(--ease)] hover:border-border-hover",
        className,
      )}
    >
      <span className="min-w-0">
        <span className="relative inline-block text-lg font-medium tracking-normal">
          {title}
          <span
            aria-hidden
            className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-accent transition-transform duration-150 ease-[var(--ease)] group-hover:scale-x-100"
          />
        </span>
        {description ? (
          <span className="mt-2 block text-sm text-muted-foreground">
            {description}
          </span>
        ) : null}
      </span>
      <ArrowRight
        className="size-4 shrink-0 translate-x-0 text-muted-foreground transition-transform duration-150 ease-[var(--ease)] group-hover:translate-x-1 group-hover:text-accent"
        strokeWidth={1.5}
        aria-hidden
      />
    </Link>
  );
}
```

## 6.11 `components/layout/GroupHeading.tsx`

Replaces `primitives.SectionHeading`.

```tsx
import { Label } from "@/components/type";
import { cn } from "@/lib/utils";

export function GroupHeading({
  children,
  count,
  action,
  className,
}: {
  children: React.ReactNode;
  count?: number | string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-6 border-b border-border pb-4",
        className,
      )}
    >
      <h2 className="flex items-baseline gap-3">
        <span className="text-2xl font-semibold tracking-tight">{children}</span>
        {count !== undefined ? (
          <span className="label nums text-muted-foreground">{count}</span>
        ) : null}
      </h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
```

## 6.12 `components/layout/MetaList.tsx`

A definition list of mono label / value pairs. Used in every masthead `meta` slot and every
detail panel.

```tsx
import { cn } from "@/lib/utils";

export type MetaItem = { label: string; value: React.ReactNode };

export function MetaList({
  items,
  className,
}: {
  items: MetaItem[];
  className?: string;
}) {
  return (
    <dl className={cn("border-t border-border", className)}>
      {items.map((item) => (
        <div
          key={item.label}
          className="flex items-baseline justify-between gap-6 border-b border-border py-4"
        >
          <dt className="label shrink-0 text-muted-foreground">{item.label}</dt>
          <dd className="min-w-0 text-right text-sm leading-snug">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
```

## 6.13 `components/app/EmptyState.tsx` — rewrite

```tsx
import { Label, Heading } from "@/components/type";
import { cn } from "@/lib/utils";

/**
 * An empty state is a poster too. Left aligned, no icon, no illustration, no
 * box: a label, a headline, one sentence, at most one action.
 */
export function EmptyState({
  label = "Nothing here",
  title,
  body,
  action,
  className,
}: {
  label?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-border py-20 md:py-28", className)}>
      <Label tone="muted">{label}</Label>
      <Heading scale="section" className="mt-6 max-w-2xl">
        {title}
      </Heading>
      {body ? (
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
          {body}
        </p>
      ) : null}
      {action ? <div className="mt-10">{action}</div> : null}
    </div>
  );
}
```

## 6.14 `components/app/RouteTabs.tsx` — rewrite

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type RouteTab = {
  label: string;
  href: string;
  startsWith?: boolean;
  disabled?: boolean;
};

/**
 * Tabs as underlined mono labels on a hairline. The active tab carries a 2px
 * accent rule; inactive tabs draw a hairline in on hover. No pills, no fills.
 */
export function RouteTabs({ tabs }: { tabs: RouteTab[] }) {
  const pathname = usePathname();

  return (
    <nav className="app-scroll -mb-px flex gap-8 overflow-x-auto border-b border-border">
      {tabs.map((t) => {
        const active = t.startsWith
          ? pathname === t.href || pathname.startsWith(t.href + "/")
          : pathname === t.href;

        if (t.disabled) {
          return (
            <span
              key={t.href}
              aria-disabled="true"
              className="label shrink-0 cursor-not-allowed py-4 text-faint"
            >
              {t.label}
            </span>
          );
        }

        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "label group relative shrink-0 py-4 transition-colors duration-150 ease-[var(--ease)]",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-0 bottom-0 h-0.5 origin-left transition-transform duration-150 ease-[var(--ease)]",
                active
                  ? "scale-x-100 bg-accent"
                  : "scale-x-0 bg-border-hover group-hover:scale-x-100",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
```

## 6.15 `components/layout/index.ts`

```ts
export { Container } from "./Container";
export { PageMasthead } from "./PageMasthead";
export { Section } from "./Section";
export { Split } from "./Split";
export { Panel } from "./Panel";
export { Callout } from "./Callout";
export { FocusFrame } from "./FocusFrame";
export { ChatFrame } from "./ChatFrame";
export { ListRow } from "./ListRow";
export { LinkRow } from "./LinkRow";
export { GroupHeading } from "./GroupHeading";
export { MetaList, type MetaItem } from "./MetaList";
```

## 6.16 Delete the old layout components

```bash
rm -r components/app/shells
rm components/app/PageShell.tsx components/app/PageHeader.tsx \
   components/app/primitives.tsx components/app/AreaCard.tsx \
   components/app/Placeholder.tsx components/app/LeadPanel.tsx \
   components/app/MetricStrip.tsx components/app/WorklistRow.tsx
```

The build will now fail with a long list of unresolved imports across `app/`. **That is
expected.** Every one of those files is rewritten in PART 10. To keep the tree buildable between
phases, work through PART 10 route by route rather than pausing here. If you must have a green
build before PART 10, temporarily comment out the bodies of the failing route files; do not
re-create the deleted components.

## 6.17 Phase 4 gate

- [ ] `components/layout/` contains 13 files.
- [ ] `components/app/shells/` no longer exists.
- [ ] `grep -rn "Surface\|StatTile\|PageShell\|LeadPanel\|MetricStrip" components/` returns nothing.

---

# PART 7 — PHASE 5: NAVIGATION AND APP SHELL

The old chrome was four floating, blurred, rounded panes (`SiteNav`, `GlassRail`, `StudentDock`,
`GlassBottomBar`). All four are deleted. The replacement is a **flush editorial frame**: a
full-bleed top bar on a hairline, and a flush left column on a hairline. Nothing floats. Nothing
blurs. Nothing has a corner.

## 7.1 Geometry

```
┌───────────────────────────────────────────────────────────────────────┐
│  ◜S  SONDER   │  TEACHER / SESSION / B            IMRAN SHAH  ▾       │ 64/80px
├───────────────┼───────────────────────────────────────────────────────┤ 1px hairline
│               │                                                       │
│  WORKSPACE    │      EVIDENCE TRAIL                    ← .label       │
│               │                                                       │
│ ▌Dashboard    │      Zara Qureshi                      ← h1, 72px     │
│  Escalations  │      ▬▬▬▬                              ← accent bar   │
│  Content rev. │                                                       │
│               │      Mathematics · Rounding to decimal places         │
│  ─────────    │      ──────────────────────────────────────────────   │
│  ASSIST       │                                                       │
│  AI consult.  │      content scrolls with the document                │
│               │                                                       │
│  ─────────    │                                                       │
│  ⟨ Collapse   │                                                       │
└───────────────┴───────────────────────────────────────────────────────┘
   240px          the rest
```

- Top bar: `sticky top-0 z-40`, full width, `h-[var(--topbar-h)]`, `bg-background`,
  `border-b border-border`. **Opaque, never translucent.**
- Workspace nav: `sticky top-[var(--topbar-h)]`, `h-[calc(100dvh-var(--topbar-h))]`,
  `w-[var(--nav-w)]`, `border-r border-border`, `shrink-0`. Hidden below `lg`.
- Main: `flex-1 min-w-0`.
- **The document scrolls.** There is no inner scroll container. This is required for the two
  sticky elements above and for `Split sticky`.

Add the layout tokens (already in §3.3) plus this block to the end of `app/globals.css`:

```css
/* ==========================================================================
   FOCUS MODE
   FocusFrame sets data-focus on <html>. Chrome is suppressed, not removed: the
   wordmark stays, so there is always a way home that is not the back button.
   ========================================================================== */

html[data-focus="true"] .workspace-nav,
html[data-focus="true"] .topbar-breadcrumb,
html[data-focus="true"] .topbar-menu {
  display: none;
}

/* Chrome is frozen across route transitions; only page content swaps. */
.topbar { view-transition-name: topbar; }
.workspace-nav { view-transition-name: worknav; }

/* Off-screen until focused, then parked over the top bar. */
.skip-link {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 60;
  padding: 0.75rem 1rem;
  border: 1px solid var(--accent);
  background: var(--background);
  color: var(--foreground);
  font-family: var(--stack-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  text-decoration: none;
  transform: translateY(-200%);
  transition: transform 150ms var(--ease);
}
.skip-link:focus-visible {
  transform: none;
}
```

## 7.2 `components/app/BrandMark.tsx` — rewrite

```tsx
import { SONDER_GLYPHS } from "@/lib/landing/hero/wordmark-glyphs";
import { cn } from "@/lib/utils";

/**
 * The one Sonder mark. The glyph is the wordmark's own S, imported from the
 * hero's glyph data rather than redrawn, which is why a raw SVG path is
 * permitted here and nowhere else: the path is the brand, not a decoration
 * invented at the call site.
 *
 * Colour comes from currentColor.
 */
const S_PATH = SONDER_GLYPHS[0].strokes[0];

export function BrandMark({
  size = 20,
  withWordmark = true,
  className,
}: {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 64 92"
        height={size}
        width={Math.round((size * 64) / 92)}
        fill="none"
        aria-hidden="true"
        focusable="false"
        className="shrink-0 overflow-visible"
      >
        <path
          d={S_PATH}
          stroke="currentColor"
          strokeWidth={5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {withWordmark ? (
        <span className="font-mono text-[0.6875rem] font-medium uppercase leading-none tracking-[0.34em]">
          Sonder
        </span>
      ) : null}
    </span>
  );
}
```

The `0.34em` tracking is deliberate and larger than `.label`'s `0.2em`: the wordmark is the one
place in the build permitted "sparse emphasis" beyond the scale.

## 7.3 `components/app/Breadcrumb.tsx` — rewrite

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SEGMENT_LABELS } from "@/lib/nav";

/**
 * Mono, uppercase, slash-separated. Every segment except the last links to its
 * own path; the last is the current page and is not a link.
 * Labels come from SEGMENT_LABELS where a mapping exists, else the raw segment
 * is de-hyphenated and capitalised.
 */
export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => ({
    href: "/" + segments.slice(0, i + 1).join("/"),
    label:
      SEGMENT_LABELS[seg] ??
      seg.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
    last: i === segments.length - 1,
  }));

  return (
    <nav
      aria-label="Breadcrumb"
      className="topbar-breadcrumb label hidden min-w-0 items-center gap-3 md:flex"
    >
      {crumbs.map((c) => (
        <span key={c.href} className="flex min-w-0 items-center gap-3">
          {c.last ? (
            <span className="truncate text-foreground" aria-current="page">
              {c.label}
            </span>
          ) : (
            <>
              <Link
                href={c.href}
                className="shrink-0 text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                {c.label}
              </Link>
              <span aria-hidden className="shrink-0 text-faint">
                /
              </span>
            </>
          )}
        </span>
      ))}
    </nav>
  );
}
```

## 7.4 `components/app/RoleMenu.tsx` — NEW

BLUEPRINT §3 requires a role menu carrying the persona strip, a four-way workspace switcher and
sign out. `components/ui/dropdown-menu.tsx` was deleted in Phase 2, so this is a plain popover.
That is better here anyway: it needs bespoke rows, and a hand-built panel cannot drift back
toward rounded corners.

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useSession, type Role } from "@/lib/session";
import { ROLES, ROLE_ORDER } from "@/lib/roles";
import { cn } from "@/lib/utils";

export function RoleMenu() {
  const { role, signIn, signOut } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Outside click and Escape. Both listeners are added on open and removed on
  // close, never left mounted.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const current = role ? ROLES[role] : null;

  const enter = (next: Role) => {
    signIn(next);
    setOpen(false);
    router.push(ROLES[next].home);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="label flex min-h-11 items-center gap-3 px-2 text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <span className="max-w-[14ch] truncate">
          {current ? current.person : "Choose a workspace"}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform duration-150",
            open && "rotate-180",
          )}
          strokeWidth={1.5}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Workspace"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(360px,calc(100vw-2rem))] border border-border-strong bg-card"
        >
          {current ? (
            <div className="border-b border-border p-6">
              <p className="label text-accent">{current.label}</p>
              <p className="mt-3 text-lg font-medium leading-snug">
                {current.person}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {current.context}
              </p>
            </div>
          ) : null}

          <p className="label px-6 pb-3 pt-6 text-muted-foreground">
            Switch workspace
          </p>

          {ROLE_ORDER.map((r) => {
            const meta = ROLES[r];
            const active = r === role;
            return (
              <button
                key={r}
                type="button"
                role="menuitem"
                onClick={() => enter(r)}
                className={cn(
                  "relative flex min-h-14 w-full items-center justify-between gap-4 px-6 text-left",
                  "transition-colors duration-150 hover:bg-muted",
                  active && "bg-muted",
                )}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute inset-y-2 left-0 w-0.5 bg-accent"
                  />
                ) : null}
                <span className="min-w-0">
                  <span className="block text-base font-medium">{meta.label}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {meta.person}
                  </span>
                </span>
                <span className="label shrink-0 text-faint">{meta.home}</span>
              </button>
            );
          })}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              signOut();
              setOpen(false);
              router.push("/");
            }}
            className="label flex min-h-14 w-full items-center border-t border-border px-6 text-left text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
```

## 7.5 `components/app/WorkspaceNav.tsx` — NEW

Replaces `GlassRail`, `StudentDock` and `GlassBottomBar` with **one nav for all four roles**,
which is also what BLUEPRINT §3 actually specifies.

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";
import { ROLES } from "@/lib/roles";
import { NAV, isNavItemActive, type NavItem } from "@/lib/nav";
import { useLocalFlag } from "@/lib/local-flag";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * The flush left column. Sticky under the top bar, its own hairline, no fill.
 * Hidden below lg, where MobileNav takes over.
 *
 * Collapse state persists in localStorage. Note that useLocalFlag's server
 * snapshot is always the fallback (expanded), so a collapsed nav expands for one
 * frame on first paint. That is the existing, accepted behaviour.
 */
export function WorkspaceNav() {
  const [collapsed, setCollapsed] = useLocalFlag("sonder.sidebar.collapsed");
  const { role } = useSession();
  if (!role) return null;

  const groups = NAV[role];
  const meta = ROLES[role];

  return (
    <div
      className={cn(
        "workspace-nav sticky top-[var(--topbar-h)] hidden shrink-0 flex-col",
        "h-[calc(100dvh-var(--topbar-h))] border-r border-border lg:flex",
        "transition-[width] duration-200 ease-[var(--ease)]",
        collapsed ? "w-[var(--nav-w-collapsed)]" : "w-[var(--nav-w)]",
      )}
    >
      {!collapsed ? (
        <p className="label shrink-0 px-6 pb-6 pt-8 text-muted-foreground">
          {meta.label} workspace
        </p>
      ) : (
        <div className="h-8 shrink-0" aria-hidden />
      )}

      <nav
        aria-label={`${meta.label} workspace`}
        className="app-scroll min-h-0 flex-1 overflow-y-auto pb-4"
      >
        {groups.map((group, gi) => (
          <div key={gi} className={cn(gi > 0 && "mt-6 border-t border-border pt-6")}>
            {group.label && !collapsed ? (
              <p className="label px-6 pb-3 text-muted-foreground">{group.label}</p>
            ) : null}
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                collapsed={collapsed}
                home={meta.home}
              />
            ))}
          </div>
        ))}
      </nav>

      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? "Expand the workspace navigation" : "Collapse the workspace navigation"}
        className={cn(
          "label flex min-h-12 shrink-0 items-center gap-4 border-t border-border",
          "text-muted-foreground transition-colors duration-150 hover:text-foreground",
          collapsed ? "justify-center px-0" : "px-6",
        )}
      >
        {collapsed ? (
          <PanelLeft className="size-[18px] shrink-0" strokeWidth={1.5} aria-hidden />
        ) : (
          <>
            <PanelLeftClose className="size-[18px] shrink-0" strokeWidth={1.5} aria-hidden />
            <span>Collapse</span>
          </>
        )}
      </button>
    </div>
  );
}

function NavLink({
  item,
  collapsed,
  home,
}: {
  item: NavItem;
  collapsed: boolean;
  home: string;
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const active = isNavItemActive(pathname, item, home);

  const link = (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-12 items-center gap-4 text-sm",
        "transition-colors duration-150 ease-[var(--ease)]",
        collapsed ? "justify-center px-0" : "px-6",
        active
          ? "font-medium text-foreground"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active ? (
        <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 bg-accent" />
      ) : null}
      <Icon className="size-[18px] shrink-0" strokeWidth={1.5} aria-hidden />
      {!collapsed ? <span className="truncate">{item.label}</span> : null}
    </Link>
  );

  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

/** The flattened item list, for the mobile drawer. */
export { NavLink };
```

## 7.6 `components/app/MobileNav.tsx` — NEW

BLUEPRINT §3: *"On small screens the sidebar instead becomes an off-canvas drawer opened via a
menu button and closed by tapping outside it or an explicit close control."*

```tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/session";
import { ROLES } from "@/lib/roles";
import { NAV, isNavItemActive } from "@/lib/nav";
import { BrandMark } from "./BrandMark";

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { role } = useSession();

  // Close on navigation.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Escape closes; body scroll is locked while open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || !role) return null;

  const groups = NAV[role];
  const meta = ROLES[role];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute inset-0 bg-background/90"
      />

      <div className="absolute inset-y-0 left-0 flex w-[min(320px,85vw)] flex-col border-r border-border bg-background">
        <div className="flex h-[var(--topbar-h)] shrink-0 items-center justify-between border-b border-border px-6">
          <BrandMark size={18} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="grid size-11 place-items-center text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <X className="size-5" strokeWidth={1.5} aria-hidden />
          </button>
        </div>

        <p className="label shrink-0 px-6 pb-6 pt-8 text-muted-foreground">
          {meta.label} workspace
        </p>

        <nav
          aria-label={`${meta.label} workspace`}
          className="app-scroll min-h-0 flex-1 overflow-y-auto pb-8"
        >
          {groups.map((group, gi) => (
            <div key={gi} className={cn(gi > 0 && "mt-6 border-t border-border pt-6")}>
              {group.label ? (
                <p className="label px-6 pb-3 text-muted-foreground">{group.label}</p>
              ) : null}
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isNavItemActive(pathname, item, meta.home);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex min-h-14 items-center gap-4 px-6 text-base",
                      "transition-colors duration-150",
                      active
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {active ? (
                      <span aria-hidden className="absolute inset-y-3 left-0 w-0.5 bg-accent" />
                    ) : null}
                    <Icon className="size-5 shrink-0" strokeWidth={1.5} aria-hidden />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
```

## 7.7 `components/app/TopBar.tsx` — NEW

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { Breadcrumb } from "./Breadcrumb";
import { RoleMenu } from "./RoleMenu";
import { MobileNav } from "./MobileNav";

/**
 * Flush, full-bleed, opaque, on a hairline. Sticky so it survives the document
 * scroll. No blur, no pill, no shadow.
 */
export function TopBar() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      <header
        role="banner"
        className="topbar sticky top-0 z-40 h-[var(--topbar-h)] border-b border-border bg-background"
      >
        <div className="flex h-full items-center gap-4 pl-6 pr-4 md:gap-8 md:pl-8 md:pr-6">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label="Open navigation"
            aria-expanded={navOpen}
            className="topbar-menu -ml-2 grid size-11 shrink-0 place-items-center text-muted-foreground transition-colors duration-150 hover:text-foreground lg:hidden"
          >
            <Menu className="size-5" strokeWidth={1.5} aria-hidden />
          </button>

          <Link
            href="/"
            aria-label="Sonder, back to the landing page"
            className="shrink-0 text-foreground transition-colors duration-150 hover:text-accent"
          >
            <BrandMark size={18} />
          </Link>

          <span aria-hidden className="hidden h-6 w-px shrink-0 bg-border md:block" />

          <Breadcrumb />

          <div className="ml-auto shrink-0">
            <RoleMenu />
          </div>
        </div>
      </header>

      <MobileNav open={navOpen} onClose={() => setNavOpen(false)} />
    </>
  );
}
```

## 7.8 `components/app/AppShell.tsx` — replace the whole file

```tsx
"use client";

import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";
import { WorkspaceNav } from "./WorkspaceNav";

/**
 * Product chrome. The landing and the dev gallery carry none.
 *
 * The DOCUMENT is the scroll container. There is deliberately no
 * `overflow-hidden` and no inner scroller anywhere in this tree: the top bar,
 * the workspace nav and every Split secondary column are `position: sticky`,
 * and a single `overflow-hidden` ancestor would silently disable all of them.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = pathname === "/" || pathname.startsWith("/dev");

  if (bare) return <>{children}</>;

  return (
    <div className="min-h-dvh bg-background">
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <TopBar />

      <div className="flex">
        <WorkspaceNav />
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 pb-28">
          {children}
        </main>
      </div>
    </div>
  );
}
```

## 7.9 Delete the old chrome

```bash
rm components/app/SiteNav.tsx components/app/GlassRail.tsx \
   components/app/GlassBottomBar.tsx components/app/StudentDock.tsx
rm components/landing/LandingNav.tsx
```

`components/landing/Landing.tsx` imports `LandingNav`; PART 9 rewrites it. If you need a green
build first, temporarily remove the `<LandingNav />` line and its import.

## 7.10 Phase 5 gate

Check every one of these in a real browser.

- [ ] `npm run build` exits 0.
- [ ] `grep -rn "sonder-glass\|GlassRail\|StudentDock\|GlassBottomBar\|SiteNav\|backdrop-filter" app components` returns nothing.
- [ ] Top bar is flush to the viewport edges with a 1px bottom hairline. It does not float.
- [ ] Scrolling any product page moves content **under** the sticky top bar and the workspace nav
      stays put.
- [ ] At `>=1024px` the workspace nav is a flush left column with a right hairline. Below that it
      is gone and a hamburger appears in the top bar.
- [ ] The active nav item has a 2px accent rule on its left edge and white text.
- [ ] Collapsing the nav narrows it to 72px, shows icons only, tooltips work on hover, and the
      state survives a reload.
- [ ] The mobile drawer opens, closes on outside tap, closes on Escape, closes on navigation, and
      locks body scroll while open.
- [ ] The role menu shows the persona, lists four workspaces, signs in and navigates on click,
      closes on Escape with focus returning to the trigger, and signs out to `/`.
- [ ] Tabbing from the very top of any product page hits "Skip to content" first.
- [ ] Every nav item, menu row and control is at least 44px tall.
- [ ] Nothing in the chrome has a rounded corner, a shadow or a blur.

---

# PART 8 — PHASE 6: DOMAIN COMPONENTS

## 8.0 A trap you must not fall into

**Two fixture files import types from `components/shared`:**

```ts
// fixtures/students.ts
import type { SessionStatus } from "@/components/shared";

// fixtures/catalogue.ts
import type { MisconceptionStatus } from "@/components/shared";
```

You are forbidden from editing `fixtures/`. Therefore `components/shared/index.ts` **must keep
exporting both type names, with exactly these unions:**

```ts
export type SessionStatus =
  | "diagnosed" | "escalated" | "awaiting-review" | "catalogued-only";

export type MisconceptionStatus =
  | "validated" | "pending" | "catalogued-only";
```

If you rename or narrow either one, `npm run build` fails inside `fixtures/`, and it will look
like the fixtures are broken when in fact you broke their contract. Keep the names.

## 8.1 `components/shared/StatusMark.tsx` — NEW, replaces `StatusBadge.tsx`

The four-bucket system from §2.3, implemented once.

```tsx
import { Check, AlertTriangle, Clock, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Kept for fixtures/students.ts. Do not rename or narrow. */
export type SessionStatus =
  | "diagnosed"
  | "escalated"
  | "awaiting-review"
  | "catalogued-only";

/** The only four visual states in the build. See the plan, part 2.3. */
export type MarkBucket = "confirmed" | "attention" | "pending" | "inert";

const BUCKET: Record<MarkBucket, { icon: LucideIcon; className: string }> = {
  confirmed: { icon: Check, className: "text-accent" },
  attention: { icon: AlertTriangle, className: "text-attention" },
  pending: { icon: Clock, className: "text-foreground" },
  inert: { icon: Minus, className: "text-muted-foreground" },
};

/**
 * Glyph plus word, both in the bucket colour, in wide-tracked mono.
 * There is no pill, no fill and no border: colour is reinforcement, and the
 * glyph and the word carry the meaning on their own.
 */
export function Mark({
  bucket,
  children,
  glyph = true,
  className,
}: {
  bucket: MarkBucket;
  children: React.ReactNode;
  /** Set false only where a glyph is already shown alongside. */
  glyph?: boolean;
  className?: string;
}) {
  const { icon: Icon, className: tone } = BUCKET[bucket];
  return (
    <span className={cn("label inline-flex items-center gap-2", tone, className)}>
      {glyph ? <Icon className="size-3.5 shrink-0" strokeWidth={1.5} aria-hidden /> : null}
      {children}
    </span>
  );
}

const SESSION: Record<SessionStatus, { bucket: MarkBucket; label: string }> = {
  diagnosed: { bucket: "confirmed", label: "Diagnosed" },
  escalated: { bucket: "attention", label: "Escalated" },
  "awaiting-review": { bucket: "pending", label: "Awaiting review" },
  "catalogued-only": { bucket: "inert", label: "Catalogued only" },
};

export function StatusMark({
  status,
  className,
}: {
  status: SessionStatus;
  className?: string;
}) {
  const { bucket, label } = SESSION[status];
  return (
    <Mark bucket={bucket} className={className}>
      {label}
    </Mark>
  );
}

/** The bucket alone, for a dense row that has no space for the word.
 *  Always paired with an sr-only label at the call site. */
export function statusBucket(status: SessionStatus): MarkBucket {
  return SESSION[status].bucket;
}

export { BUCKET as MARK_BUCKET };
```

### The complete state-to-bucket map

Use this for every status string in every fixture. Do not improvise a mapping.

| Fixture field | Value | Bucket | Word shown |
|---|---|---|---|
| `Student.status` | `diagnosed` | confirmed | Diagnosed |
| | `escalated` | attention | Escalated |
| | `awaiting-review` | pending | Awaiting review |
| `CatalogueEntry.status` | `validated` | confirmed | Validated |
| | `pending` | pending | Pending |
| | `catalogued-only` | inert | Catalogued only |
| `CoverageGap.status` | `closed` | confirmed | Closed |
| | `open` | attention | Open, no item yet |
| | `generating` | attention | Generating |
| | `in-review` | pending | Item in review |
| `ProvenanceEntry.status` | `in-bank` | confirmed | In bank |
| | `in-review` | pending | In review |
| | `rejected` | inert | Rejected |
| | `surfaced` | pending | Surfaced |
| `MisconceptionEvent.status` | `resolved` | confirmed | Resolved |
| | `monitoring` | pending | Monitoring |
| | `awaiting-review` | pending | Awaiting review |
| `MisconceptionEvent.verification` | `passed` | confirmed | Check passed |
| | `pending` | pending | Check pending |
| | `failed` | attention | Check failed |
| `GeneratedOption.maps` | `NONE` | confirmed | Correct |
| | `M1`..`M4` | attention | Maps to {code} |
| | `unmapped` | inert | Unmapped |
| `ScoredCandidate.passed` | `true` | confirmed | Passed {score} |
| | `false` | inert | Rejected {score} |
| Review decision | `approved` / `corrected` / `resolved` | confirmed | {DECISION_LABEL} |
| | `rejected` | inert | Rejected |

## 8.2 `components/shared/OutcomeBanner.tsx` — rewrite

The large state indicator at the end of a diagnostic session and at the top of the evidence
panel. Permitted Playfair call site 2 of 4.

```tsx
import { Label } from "@/components/type";
import { cn } from "@/lib/utils";

export type OutcomeType = "diagnosed" | "unsure";

/**
 * Diagnosed and unsure must read differently at a glance without relying on
 * colour: different rule weight, different label, different type treatment.
 *  - diagnosed: a 2px accent rule, accent label, the message in Playfair
 *  - unsure:    a 1px muted rule, muted label, the message in the sans stack
 */
export function OutcomeBanner({
  type,
  title,
  message,
  className,
}: {
  type: OutcomeType;
  title?: string;
  message: string;
  className?: string;
}) {
  const diagnosed = type === "diagnosed";
  return (
    <section
      role="status"
      className={cn(
        "pt-8",
        diagnosed ? "border-t-2 border-t-accent" : "border-t border-t-border-strong",
        className,
      )}
    >
      <Label tone={diagnosed ? "accent" : "muted"}>
        {title ?? (diagnosed ? "Misconception identified" : "Not sure yet")}
      </Label>
      <p
        className={cn(
          "mt-6 max-w-2xl",
          diagnosed
            ? "font-quote text-2xl leading-relaxed text-foreground sm:text-3xl"
            : "text-lg leading-relaxed text-muted-foreground",
        )}
      >
        {message}
      </p>
    </section>
  );
}
```

## 8.3 `components/shared/PosteriorBarSet.tsx` — rewrite

Teacher-facing only. BLUEPRINT §7: a student never sees this.

```tsx
import { cn } from "@/lib/utils";

export type Hypothesis = { id: string; label: string; probability: number };

/**
 * Competing hypotheses as hairline bars. Three states must be distinguishable
 * without colour:
 *  - gathering: leader in foreground, others muted
 *  - diagnosis: leader crosses the threshold, turns accent, gains a bold %
 *  - tie:       top two get a dashed overlay AND a "TIED" word. Never colour alone.
 */
export function PosteriorBarSet({
  hypotheses,
  diagnosisThreshold = 0.75,
  tieEpsilon = 0.03,
  caption,
  className,
}: {
  hypotheses: Hypothesis[];
  diagnosisThreshold?: number;
  tieEpsilon?: number;
  caption?: string;
  className?: string;
}) {
  const sorted = [...hypotheses].sort((a, b) => b.probability - a.probability);
  const leader = sorted[0];
  const runnerUp = sorted[1];

  const isTie =
    !!runnerUp &&
    leader.probability >= 0.25 &&
    leader.probability - runnerUp.probability <= tieEpsilon;
  const isDiagnosis = !isTie && leader.probability >= diagnosisThreshold;
  const tied = isTie ? new Set([leader.id, runnerUp.id]) : new Set<string>();

  const resolvedCaption =
    caption ??
    (isTie
      ? `${leader.label} and ${runnerUp.label} are level. The engine needs a question that separates them before it can resolve.`
      : isDiagnosis
        ? `${leader.label} is above the ${Math.round(diagnosisThreshold * 100)}% confidence threshold.`
        : "Still gathering evidence.");

  return (
    <div className={cn("border-t border-border", className)}>
      {sorted.map((h) => {
        const pct = Math.round(h.probability * 100);
        const isTied = tied.has(h.id);
        const isLeader = h.id === leader.id;
        const fill = isTied
          ? "bg-attention"
          : isLeader && isDiagnosis
            ? "bg-accent"
            : isLeader
              ? "bg-foreground"
              : "bg-muted-foreground";

        return (
          <div key={h.id} className="border-b border-border py-5">
            <div className="flex items-baseline justify-between gap-4">
              <span
                className={cn(
                  "min-w-0 truncate text-sm",
                  isLeader ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {h.label}
                {isTied ? (
                  <span className="label ml-3 text-attention">Tied</span>
                ) : null}
              </span>
              <span
                className={cn(
                  "nums shrink-0 font-mono text-lg leading-none",
                  isTied
                    ? "text-attention"
                    : isLeader && isDiagnosis
                      ? "text-accent"
                      : isLeader
                        ? "text-foreground"
                        : "text-muted-foreground",
                )}
              >
                {pct}%
              </span>
            </div>

            <div
              className="relative mt-3 h-1 w-full bg-border"
              role="meter"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={h.label}
            >
              {/* the diagnosis threshold, as a tick that overshoots the track */}
              <span
                aria-hidden
                className="absolute -top-1 h-3 w-px bg-border-strong"
                style={{ left: `${diagnosisThreshold * 100}%` }}
              />
              <span
                className={cn(
                  "absolute inset-y-0 left-0 transition-[width] duration-500 ease-[var(--ease)] motion-reduce:transition-none",
                  fill,
                )}
                style={{ width: `${Math.max(pct, 1)}%` }}
              >
                {isTied ? (
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, transparent 0 3px, rgba(26,26,26,0.55) 3px 6px)",
                    }}
                  />
                ) : null}
              </span>
            </div>
          </div>
        );
      })}

      <p
        className={cn(
          "pt-5 text-sm leading-relaxed",
          isTie
            ? "text-attention"
            : isDiagnosis
              ? "text-accent"
              : "text-muted-foreground",
        )}
      >
        {resolvedCaption}
      </p>
    </div>
  );
}
```

## 8.4 `components/shared/EvidenceStep.tsx` — rewrite

```tsx
import { cn } from "@/lib/utils";
import { Label } from "@/components/type";

/**
 * One row of the answer trace: the question asked, the answer given, and the
 * engine's one-line reason for choosing it. The current step is marked by a 2px
 * accent rule on the left plus a muted ground, never by colour alone.
 */
export function EvidenceStep({
  index,
  questionText,
  answerGiven,
  reasoning,
  isCurrent,
  className,
}: {
  index: number;
  questionText: string;
  answerGiven: string;
  reasoning: string;
  isCurrent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative border-b border-border py-8 pl-8",
        isCurrent && "bg-muted",
        className,
      )}
    >
      {isCurrent ? (
        <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-accent" />
      ) : null}

      <span
        aria-hidden
        className={cn(
          "nums absolute left-0 top-8 font-mono text-sm",
          isCurrent ? "text-accent" : "text-faint",
          isCurrent && "pl-3",
        )}
      >
        {String(index).padStart(2, "0")}
      </span>

      <p className="text-lg font-medium leading-snug">{questionText}</p>

      <p className="mt-4 text-base">
        <span className="text-muted-foreground">Answered </span>
        <span className="font-medium text-foreground">{answerGiven}</span>
      </p>

      <Label tone="muted" className="mt-6">
        Why this question
      </Label>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {reasoning}
      </p>
    </div>
  );
}
```

## 8.5 `components/shared/MisconceptionCard.tsx` — rewrite as a row

Keep the filename and the export name (`MisconceptionCard`) so call sites need no import
changes, but the thing it renders is now a row, not a card.

```tsx
import { cn } from "@/lib/utils";
import { Mark } from "./StatusMark";

/** Kept for fixtures/catalogue.ts. Do not rename or narrow. */
export type MisconceptionStatus = "validated" | "pending" | "catalogued-only";

const STATUS: Record<
  MisconceptionStatus,
  { bucket: "confirmed" | "pending" | "inert"; label: string }
> = {
  validated: { bucket: "confirmed", label: "Validated" },
  pending: { bucket: "pending", label: "Pending" },
  "catalogued-only": { bucket: "inert", label: "Catalogued only" },
};

export function MisconceptionCard({
  name,
  description,
  code,
  status,
  selected,
  className,
  children,
}: {
  name: string;
  description: string;
  code?: string;
  status?: MisconceptionStatus;
  selected?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const s = status ? STATUS[status] : null;
  return (
    <div
      className={cn(
        "relative border-b border-border py-6 pl-6 transition-colors duration-150",
        selected && "bg-muted",
        className,
      )}
    >
      {selected ? (
        <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 bg-accent" />
      ) : null}

      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <div className="flex min-w-0 items-baseline gap-4">
          {code ? (
            <span className="label nums shrink-0 text-faint">{code}</span>
          ) : null}
          <h3 className="min-w-0 text-lg font-medium leading-snug">{name}</h3>
        </div>
        {s ? <Mark bucket={s.bucket}>{s.label}</Mark> : null}
      </div>

      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      {children ? <div className="mt-6 flex flex-wrap gap-8">{children}</div> : null}
    </div>
  );
}
```

## 8.6 `components/shared/MetricCard.tsx` — rewrite as a block

```tsx
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/type";

type Direction = "up" | "down" | "flat";

/**
 * One headline number with the comparison that gives it meaning. BLUEPRINT
 * feature 20: performance is always reported against a baseline, never alone.
 * `goodWhen` is per metric: fewer questions is good, higher accuracy is good.
 */
export function MetricCard({
  label,
  value,
  comparisonLabel,
  comparisonValue,
  direction,
  goodWhen = "up",
  className,
}: {
  label: string;
  value: string;
  comparisonLabel: string;
  comparisonValue?: string;
  direction?: Direction;
  goodWhen?: "up" | "down";
  className?: string;
}) {
  const Icon =
    direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  const favourable = direction && direction !== "flat" && direction === goodWhen;
  const tone = !direction || direction === "flat"
    ? "text-muted-foreground"
    : favourable
      ? "text-accent"
      : "text-attention";

  return (
    <div className={cn("border-t border-border pt-8", className)}>
      <Label tone="muted">{label}</Label>
      <p className="nums mt-6 font-mono text-5xl leading-none tracking-tight">
        {value}
      </p>
      <p className="mt-6 flex items-baseline gap-2 text-sm">
        {direction ? (
          <Icon className={cn("size-4 shrink-0 self-center", tone)} strokeWidth={1.5} aria-hidden />
        ) : null}
        <span className={cn("nums font-medium", tone)}>{comparisonValue}</span>
        <span className="text-muted-foreground">{comparisonLabel}</span>
      </p>
      <span className="sr-only">
        {favourable ? "Favourable against the baseline." : "Not favourable against the baseline."}
      </span>
    </div>
  );
}
```

## 8.7 `components/shared/VerificationTag.tsx` — rewrite

```tsx
import { cn } from "@/lib/utils";

export type VerificationKind = "computed" | "ai-proposed";

/**
 * Where a value came from. "Computed" is a deterministic rule and is
 * trustworthy on its own. "AI-proposed" is a model suggestion that still needs
 * a human to validate it. BLUEPRINT section 7 requires the two never look the
 * same, so they take the two different accents plus different words.
 */
export function VerificationTag({
  kind,
  className,
}: {
  kind: VerificationKind;
  className?: string;
}) {
  const computed = kind === "computed";
  return (
    <span
      className={cn(
        "label inline-flex items-center gap-2.5",
        computed ? "text-accent" : "text-attention",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn("h-0.5 w-4 shrink-0", computed ? "bg-accent" : "bg-attention")}
      />
      {computed ? "Computed" : "AI proposed"}
    </span>
  );
}
```

## 8.8 `components/app/StepTimeline.tsx` — rewrite

```tsx
"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The stepper for the evidence panel and the generation run. Every node is its
 * own button, so a reader jumps straight to the step they want; the chevrons
 * stay for fine stepping and for keyboards.
 *
 * Sticky under the top bar, on the page ground with a hairline. Not glass:
 * there is no glass in this build.
 */
export function StepTimeline({
  total,
  current,
  onStepChange,
  label = "Steps",
  stepNoun = "Step",
  className,
}: {
  total: number;
  current: number;
  onStepChange: (index: number) => void;
  label?: string;
  stepNoun?: string;
  className?: string;
}) {
  const nodes = useRef<(HTMLButtonElement | null)[]>([]);

  function go(next: number) {
    const clamped = Math.min(total - 1, Math.max(0, next));
    if (clamped === current) return;
    onStepChange(clamped);
    nodes.current[clamped]?.focus();
  }

  return (
    <div
      className={cn(
        "sticky top-[var(--topbar-h)] z-20 border-b border-border bg-background",
        className,
      )}
    >
      <div className="flex items-center gap-6 py-4">
        <span className="label hidden shrink-0 text-muted-foreground sm:block">
          {stepNoun}
        </span>

        <div
          role="tablist"
          aria-label={label}
          aria-orientation="horizontal"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") { e.preventDefault(); go(current + 1); }
            else if (e.key === "ArrowLeft") { e.preventDefault(); go(current - 1); }
            else if (e.key === "Home") { e.preventDefault(); go(0); }
            else if (e.key === "End") { e.preventDefault(); go(total - 1); }
          }}
          className="app-scroll flex min-w-0 flex-1 items-center overflow-x-auto"
        >
          {Array.from({ length: total }, (_, i) => (
            <div key={i} className="flex min-w-0 flex-1 items-center last:flex-none">
              <button
                ref={(el) => { nodes.current[i] = el; }}
                type="button"
                role="tab"
                aria-label={`${stepNoun} ${i + 1} of ${total}`}
                aria-selected={i === current}
                aria-current={i === current ? "step" : undefined}
                tabIndex={i === current ? 0 : -1}
                onClick={() => go(i)}
                className="grid h-11 shrink-0 place-items-center px-2"
              >
                <span
                  aria-hidden
                  className={cn(
                    "block transition-all duration-150 ease-[var(--ease)] motion-reduce:transition-none",
                    i === current && "h-1 w-8 bg-accent",
                    i < current && "size-1.5 bg-accent",
                    i > current && "size-1.5 border border-border-strong",
                  )}
                />
              </button>
              {i < total - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "h-px min-w-3 flex-1",
                    i < current ? "bg-accent" : "bg-border",
                  )}
                />
              ) : null}
            </div>
          ))}
        </div>

        <span className="label nums shrink-0 text-muted-foreground">
          {current + 1} / {total}
        </span>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => go(current - 1)}
            disabled={current === 0}
            aria-label={`Previous ${stepNoun.toLowerCase()}`}
            className="grid size-11 place-items-center text-muted-foreground transition-colors duration-150 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => go(current + 1)}
            disabled={current === total - 1}
            aria-label={`Next ${stepNoun.toLowerCase()}`}
            className="grid size-11 place-items-center text-muted-foreground transition-colors duration-150 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
          >
            <ChevronRight className="size-4" strokeWidth={1.5} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 8.9 `components/app/DataTable.tsx` — rewrite

```tsx
"use client";

import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  className?: string;
  align?: "left" | "right";
};

/**
 * Editorial table: mono uppercase headers on a rule, hairline rows, one divider
 * direction, generous row height. The wrapper is the horizontal scroller so a
 * wide table scrolls inside itself at 390px and the page never does.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  isRowSelected,
  caption,
  empty,
  className,
}: {
  columns: Column<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  isRowSelected?: (row: T) => boolean;
  caption?: string;
  empty?: React.ReactNode;
  className?: string;
}) {
  if (!rows.length && empty) return <>{empty}</>;

  return (
    <div className={cn("app-scroll w-full overflow-x-auto", className)}>
      <table className="w-full min-w-[44rem] border-collapse text-left">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-y border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={cn(
                  "label whitespace-nowrap py-4 pr-8 font-medium text-muted-foreground",
                  col.align === "right" && "pr-0 text-right",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const selected = isRowSelected?.(row) ?? false;
            return (
              <tr
                key={getRowKey(row, i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
                aria-current={selected ? "true" : undefined}
                className={cn(
                  "border-b border-border transition-colors duration-150",
                  onRowClick && "cursor-pointer hover:bg-muted",
                  selected && "bg-muted",
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "py-5 pr-8 align-middle text-base",
                      col.align === "right" && "pr-0 text-right",
                      col.className,
                    )}
                  >
                    {col.cell(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

## 8.10 `components/app/FilterStrip.tsx` — rewrite

```tsx
"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

export type FilterOption<V extends string> = {
  value: V;
  label: string;
  count?: number;
};

/**
 * Radio-group semantics, not tabs: it changes the contents of one list rather
 * than which panel is shown. No pills, no segmented box: mono labels, with a
 * 2px accent rule under the selected one.
 */
export function FilterStrip<V extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: FilterOption<V>[];
  value: V;
  onChange: (next: V) => void;
  label: string;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, options.findIndex((o) => o.value === value));

  function move(delta: number) {
    const next = (index + delta + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); move(1); }
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); move(-1); }
        else if (e.key === "Home") { e.preventDefault(); onChange(options[0].value); refs.current[0]?.focus(); }
        else if (e.key === "End") {
          e.preventDefault();
          const last = options.length - 1;
          onChange(options[last].value);
          refs.current[last]?.focus();
        }
      }}
      className={cn("app-scroll flex gap-8 overflow-x-auto", className)}
    >
      {options.map((option, i) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={i === index ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "label relative shrink-0 py-4 transition-colors duration-150 ease-[var(--ease)]",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="inline-flex items-baseline gap-2">
              {option.label}
              {option.count !== undefined ? (
                <span className="nums text-faint">{option.count}</span>
              ) : null}
            </span>
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-0 bottom-0 h-0.5 origin-left transition-transform duration-150 ease-[var(--ease)]",
                active ? "scale-x-100 bg-accent" : "scale-x-0 bg-border-hover",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
```

## 8.11 The loading idiom

Append to `app/globals.css`:

```css
/* The only loading indicator in the build. A hairline that draws itself,
   left to right and back. Replaces every spinner. */
@keyframes rule-sweep {
  0%    { transform: scaleX(0); transform-origin: left center; }
  50%   { transform: scaleX(1); transform-origin: left center; }
  50.1% { transform: scaleX(1); transform-origin: right center; }
  100%  { transform: scaleX(0); transform-origin: right center; }
}
.rule-sweep {
  height: 2px;
  background: var(--accent);
  animation: rule-sweep 1.2s var(--ease) infinite;
}
@media (prefers-reduced-motion: reduce) {
  .rule-sweep { animation: none; transform: none; opacity: 0.5; }
}
```

Used in exactly three places: the session "thinking" pause, the Learn page's "searching" pause,
and both chats' "typing" pause. Always paired with a `role="status"` live region carrying a
sentence, so a screen-reader user is told what is happening.

## 8.12 `components/app/ChatConsultant.tsx` — rewrite

Bubbles are gone. A scripted transcript is an editorial exchange, so it is set as one: a mono
speaker label, then the text, with the assistant's turn carrying a 2px accent rule.

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/type";
import { ChatFrame } from "@/components/layout";
import { PageMasthead } from "@/components/layout";
import type { ConsultantConfig } from "@/fixtures/consultant/types";

type Msg = { id: string; from: "user" | "assistant"; text: string; evidence?: string[] };

const REPLY_MS = 750;
let uid = 0;
const nextId = () => `m${uid++}`;

function Evidence({ items, messageId }: { items: string[]; messageId: string }) {
  const [open, setOpen] = useState(false);
  const panelId = `evidence-${messageId}`;
  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="label inline-flex min-h-11 items-center gap-2 text-muted-foreground transition-colors duration-150 hover:text-foreground"
      >
        <ChevronRight
          className={cn("size-3.5 transition-transform duration-150", open && "rotate-90")}
          strokeWidth={1.5}
          aria-hidden
        />
        {open ? "Hide evidence" : "Show evidence"}
        <span className="nums">({items.length})</span>
      </button>
      {open ? (
        <ul id={panelId} className="mt-4 border-t border-border">
          {items.map((e) => (
            <li key={e} className="border-b border-border py-3 text-sm text-muted-foreground">
              {e}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ChatConsultant({
  config,
  label,
}: {
  config: ConsultantConfig;
  /** The masthead kicker, for example "ASK THE CONSULTANT". */
  label: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    { id: nextId(), from: "assistant", ...config.greeting },
  ]);
  const [usedPromptIds, setUsedPromptIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState(false);
  const [input, setInput] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, pending]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  function ask(question: string, promptId?: string) {
    if (pending) return;
    const q = question.trim();
    if (!q) return;

    const matched =
      config.prompts.find((p) => p.id === promptId) ??
      config.prompts.find((p) => p.question.toLowerCase().trim() === q.toLowerCase());

    setMessages((m) => [...m, { id: nextId(), from: "user", text: q }]);
    setInput("");
    if (matched) setUsedPromptIds((s) => new Set(s).add(matched.id));
    setPending(true);

    timer.current = setTimeout(() => {
      const reply = matched?.reply ?? config.fallback;
      setMessages((m) => [
        ...m,
        { id: nextId(), from: "assistant", text: reply.text, evidence: reply.evidence },
      ]);
      setPending(false);
    }, REPLY_MS);
  }

  const openPrompts = config.prompts.filter((p) => !usedPromptIds.has(p.id));

  return (
    <ChatFrame
      header={
        <PageMasthead
          label={label}
          title={config.personaLabel}
          lede="Scripted suggestions, not decisions. This assistant does not set marks and does not diagnose."
        />
      }
      chips={
        openPrompts.length
          ? openPrompts.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={pending}
                onClick={() => ask(p.question, p.id)}
                className="label min-h-11 shrink-0 whitespace-nowrap border border-border-strong px-4 text-muted-foreground transition-colors duration-150 hover:border-accent hover:text-foreground disabled:opacity-50"
              >
                {p.label}
              </button>
            ))
          : undefined
      }
      composer={
        <form
          className="flex items-stretch gap-4"
          onSubmit={(e) => { e.preventDefault(); ask(input); }}
        >
          <label htmlFor="consultant-input" className="sr-only">
            Ask the consultant a question
          </label>
          <Input
            id="consultant-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={pending}
            placeholder="Ask about a session or a topic"
            className="flex-1"
          />
          <Button type="submit" variant="outline" disabled={pending || !input.trim()}>
            Send
            <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
          </Button>
        </form>
      }
    >
      <div>
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "border-b border-border py-8",
              m.from === "assistant" && "relative pl-6",
            )}
          >
            {m.from === "assistant" ? (
              <span aria-hidden className="absolute inset-y-8 left-0 w-0.5 bg-accent" />
            ) : null}
            <Label tone={m.from === "assistant" ? "accent" : "muted"}>
              {m.from === "assistant" ? config.personaLabel : "You"}
            </Label>
            <p
              className={cn(
                "mt-4 max-w-2xl leading-relaxed",
                m.from === "assistant"
                  ? "text-lg text-foreground"
                  : "text-base text-muted-foreground",
              )}
            >
              {m.text}
            </p>
            {m.evidence?.length ? <Evidence items={m.evidence} messageId={m.id} /> : null}
          </div>
        ))}

        {pending ? (
          <div className="relative border-b border-border py-8 pl-6" role="status">
            <span aria-hidden className="absolute inset-y-8 left-0 w-0.5 bg-accent" />
            <Label tone="accent">{config.personaLabel}</Label>
            <div className="mt-4 w-24">
              <div className="rule-sweep" aria-hidden />
            </div>
            <span className="sr-only">The consultant is typing a reply.</span>
          </div>
        ) : null}

        <div ref={endRef} />
      </div>
    </ChatFrame>
  );
}
```

## 8.13 `components/learn/ConceptChat.tsx` — RESTYLE ONLY, DO NOT CHANGE BEHAVIOUR

`components/learn/ConceptChat.test.ts` asserts on this component. **Seven tests will fail if you
change any of the following.** Change the visual layer only.

| Must not change | Exact requirement |
|---|---|
| Props | `{ chat: LearnConceptChat }` |
| Chip buttons | `<button>` whose accessible name is exactly `entry.label` |
| Free-text input | `placeholder` is exactly `Ask about this concept…` (with the U+2026 ellipsis) |
| Follow-up buttons | accessible name is exactly `Next: {entry.label}` |
| Persistent chips | `simpler` and `harder` always resolve to their entries, whatever has been asked |
| Matching | Exact question text, case-insensitive, trimmed |
| Fallback | Unmatched free text renders `chat.fallback` verbatim |
| Worked example | Renders `prompt`, `wrongMove`, `rightMove` and `answer` as separate text nodes |
| Reply delay | Must resolve within 1000ms of fake timers |
| The form | The input must be inside a `<form>` whose submit triggers the ask |

Restyle to match `ChatConsultant`: speaker labels in mono, no bubbles, a 2px accent rule on the
assistant's turn, chips as bordered mono labels, the worked example as a `MetaList` of four rows
(`Prompt` / `The slip` / `The fix` / `Answer`).

**Run `npm test` immediately after restyling this file.** All seven tests must still pass.

## 8.14 `components/learn/ResourceFinder.tsx` — rewrite

```tsx
"use client";

import { useEffect, useState } from "react";
import type { LearnResource } from "@/fixtures/learn/types";
import { Label } from "@/components/type";

const SEARCH_MS = 800;

const KIND_LABEL = {
  video: "Video",
  article: "Article",
  interactive: "Interactive",
} as const;

/**
 * Scripted "search the web, then rank results". No real search runs: the query
 * and every result are fixture data. The sequence is honest because it is
 * labelled scripted, per BLUEPRINT section 5.
 */
export function ResourceFinder({
  query,
  resources,
}: {
  query: string;
  resources: LearnResource[];
}) {
  const [phase, setPhase] = useState<"searching" | "done">("searching");

  useEffect(() => {
    const timer = setTimeout(() => setPhase("done"), SEARCH_MS);
    return () => clearTimeout(timer);
  }, []);

  if (phase === "searching") {
    return (
      <div role="status" className="border-t border-border py-8">
        <p className="text-base text-muted-foreground">
          Searching the web for &ldquo;{query}&rdquo;
        </p>
        <div className="mt-6 w-40">
          <div className="rule-sweep" aria-hidden />
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Picked by Sonder from a search of the web, ranked by fit to this
        misconception. Scripted.
      </p>

      <div className="mt-8 border-t border-border">
        {resources.map((r) => (
          <a
            key={r.url}
            href={r.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-baseline justify-between gap-8 border-b border-border py-6 transition-colors duration-150 hover:border-border-hover"
          >
            <span className="min-w-0">
              <span className="flex items-baseline gap-4">
                <Label tone="faint" as="span">
                  {KIND_LABEL[r.kind]}
                </Label>
                <span className="relative min-w-0 text-lg font-medium leading-snug">
                  {r.title}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-accent transition-transform duration-150 ease-[var(--ease)] group-hover:scale-x-100"
                  />
                </span>
              </span>
              <span className="mt-2 block text-sm text-muted-foreground">{r.source}</span>
              <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {r.rationale}
              </span>
            </span>
            <span className="nums shrink-0 font-mono text-sm text-accent">
              {r.relevance.toFixed(2)}
              <span className="sr-only"> relevance score</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
```

## 8.15 `components/shared/index.ts` — rewrite

```ts
export { PosteriorBarSet, type Hypothesis } from "./PosteriorBarSet";
export { EvidenceStep } from "./EvidenceStep";
export {
  MisconceptionCard,
  type MisconceptionStatus,
} from "./MisconceptionCard";
export {
  StatusMark,
  Mark,
  statusBucket,
  MARK_BUCKET,
  type SessionStatus,
  type MarkBucket,
} from "./StatusMark";
export { OutcomeBanner, type OutcomeType } from "./OutcomeBanner";
export { MetricCard } from "./MetricCard";
export { VerificationTag, type VerificationKind } from "./VerificationTag";
```

Then `rm components/shared/StatusBadge.tsx`.

**Verify immediately:** `npm run build`. If `fixtures/students.ts` or `fixtures/catalogue.ts`
errors, you broke the type contract described in §8.0.

## 8.16 Phase 6 gate

- [ ] `npm run build` exits 0.
- [ ] `npm test` exits 0 with all three suites passing. **`ConceptChat.test.ts` is the one that
      catches a careless restyle; do not skip it.**
- [ ] `grep -rn "StatusBadge" app components` returns nothing.
- [ ] No component renders a pill, a filled chip or a coloured background for status.
- [ ] The only spinner-equivalent anywhere is `.rule-sweep`.

---

# PART 9 — PHASE 7: THE LANDING

The user's instruction: **keep the SONDER wordmark, the rotating brain and the vine, with
touch-ups to fit the new style, and integrate them tastefully.** That is exactly what this part
does. The engines are not rewritten. The material they are rendered in changes.

## 9.1 Composition

```
┌──────────────────────────────────────────────────────────────┐
│ ◜S SONDER          How it works        CHOOSE A WORKSPACE →  │  nav, transparent
├──────────────────────────────────────────────────────────────┤
│                                                              │
│              S  O  N  D  E  R                                │  1. HERO, pinned 200dvh
│                  (brain rises)                               │     wordmark draws, exits
│                                                              │     brain arrives
│  It does not mark                       SCRIPTED PROTOTYPE   │     statement enters
│  the answer.                            NO BACKEND           │     bottom-left / bottom-right
│  It finds the idea underneath.          NO LIVE MODEL        │
├──────────────────────────────────────────────────────────────┤
│  THE PREMISE                                                 │  2. THESIS, charcoal
│                                                              │     the 128px poster moment
│  A wrong answer                     "The same wrong answer   │     + one Playfair pull quote
│  is not a diagnosis.                 can come from four      │
│                                      broken ideas."          │
├══════════════════════════════════════════════════════════════┤  ← hard edge, the design statement
│                                                              │
│  ●  01 THE PROBLEM                                           │  3. THE VINE, PAPER (inverted)
│  │     A wrong answer is not a diagnosis                     │     flat ink line drawing
│  ●──┐  Marking tells a teacher...                            │     ~570vh, scroll-grown
│  │  └────────────────                                        │     six nodes, pure type
│  │           02 THE ENGINE                                   │
│  ●───────────  It asks until it can tell two ideas apart     │
│                 ... six nodes ...                            │
├══════════════════════════════════════════════════════════════┤  ← hard edge back to charcoal
│  87.5%        3.4          11            8                   │  4. NUMBERS, charcoal
│  ACCURACY     QUESTIONS    CATALOGUED    DRAFTED             │     all real fixture data
├──────────────────────────────────────────────────────────────┤
│  01 STUDENT   A question chosen to tell two ideas apart      │  5. WORKSPACES, charcoal
│  02 TEACHER   Every diagnosis arrives with its evidence      │     four typographic entries
│  03 PARENT    Nothing is shown before a teacher approves it  │
│  04 ADMIN     When the bank falls short, it writes questions │
├──────────────────────────────────────────────────────────────┤
│  ◜S SONDER    Walk the build    Notes                        │  6. FOOTER
└──────────────────────────────────────────────────────────────┘
```

Roughly **9 viewport heights**, of which the vine is 6. Six sections, six distinct layout
families. The single hard charcoal-to-paper edge at the vine is the loudest design decision on
the page and it is deliberate: it is what makes the vine read as a printed diagram rather than a
hologram.

## 9.2 `components/landing/HeroStage.tsx` — rewrite the render, keep the timeline

**Do not touch:** `HERO_PIN_VH`, `HERO_SCRUB`, `HERO_ENTRY_END`, `HERO_WORDMARK_EXIT_END`,
`HERO_WORDMARK_RISE_PCT`, `HERO_VEIL_OPACITY`, `refreshPriority: 1`, `anticipatePin: 1`,
`invalidateOnRefresh: true`, the `pushEntry` plumbing, the `onViewerReady` late-arrival handling,
or the reduced-motion early return. Those constants are derived from the camera frustum and the
model bounds; changing one silently breaks the composition.

**Change only the JSX inside `<section>` and the `leadRef` tween's target markup.**

Replace the `hero-lead` block (currently a centred column with an eyebrow, an h1 and a CTA) with
this asymmetric bottom band:

```tsx
      <div
        ref={leadRef}
        className="hero-lead pointer-events-none absolute inset-x-0 bottom-0 z-[8]"
      >
        {/* Legibility scrim. The brain sits behind the type, so the bottom of
            the frame is darkened before any text is drawn over it. This is not
            decoration; it is what keeps the statement above 4.5:1. */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[60vh] bg-gradient-to-t from-background via-background/85 to-transparent"
        />

        <div className="relative mx-auto flex max-w-[1440px] flex-col gap-10 px-6 pb-[10vh] md:px-12 lg:flex-row lg:items-end lg:justify-between lg:px-16">
          <div className="max-w-[15ch]">
            <p className="label text-accent">
              Final-year project. Adaptive misconception diagnosis.
            </p>
            <h1 className="mt-8 text-4xl font-semibold leading-tight tracking-tighter sm:text-5xl lg:text-6xl">
              It does not mark the answer.
              <br />
              <span className="text-accent">It finds the idea underneath.</span>
            </h1>
          </div>

          <div className="pointer-events-auto shrink-0 lg:pb-2 lg:text-right">
            <p className="label text-muted-foreground">Scripted prototype</p>
            <p className="label mt-3 text-muted-foreground">No backend</p>
            <p className="label mt-3 text-muted-foreground">No live model</p>
            <a
              href="#narrative"
              className="label group relative mt-8 inline-flex min-h-11 items-center text-accent"
            >
              How it works
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-2 h-0.5 origin-center scale-x-100 bg-accent transition-transform duration-150 ease-[var(--ease)] group-hover:scale-x-110"
              />
            </a>
          </div>
        </div>
      </div>
```

**Why the statement caps at `text-6xl` (72px) and not `text-8xl`.** A 128px multi-line statement
over a 3D specimen either covers the specimen or overflows a 700px-tall laptop viewport. The
128px poster moment is moved to the thesis section (§9.6), which is a normal scrolling section
with a whole screen of charcoal to itself. That is better composition and it removes the entire
class of "hero collides with brain" bugs.

**Hero text-element count: 3** (label, headline, meta block). Within the design system's cap of
4. There is no scroll cue, no sub-tagline and no trust strip.

Also change the section's own classes to remove the old grid ground:

```tsx
<section ref={sectionRef} className="hero-stage relative h-[100dvh] min-h-[100dvh] w-full bg-background">
```

### Mandatory contrast check

After building this, open the hero at the pin's end state and sample the statement text against
the pixels directly behind it. `#FAFAFA` must clear **4.5:1**. If the brain's rim glow is bright
enough anywhere behind the type to fail, raise the scrim from `via-background/85` to
`via-background/92`. Do not lower the scrim below 85%.

## 9.3 `components/landing/SonderWordmark.tsx` — the touch-up

The wordmark currently draws in neon with a wide, faint bloom copy behind each stroke. The bloom
is what makes it read as a hologram. Remove it and set the letterforms in warm white, leaving the
construction geometry in accent. It becomes a technical pen drawing on charcoal: the same
drawing, in the new material.

**Two changes only.**

1. In the JSX, delete the glow path so each stroke group has a single layer:

```tsx
              <g key={s} className="wm-stroke" data-draw="glyph">
                <path className="wm-core" d={d} />
              </g>
```

   This is safe: the draw-on measures `g.querySelector("path")`, every layer in a group shared
   the same `d`, and the remaining path has that same `d` and therefore the same length.

2. In `components/landing/styles/hero-stage.css`, replace the three stroke rules:

```css
/* The letterforms: warm white hairline. The neon is spent on the construction
   geometry and on the specimen, not on the word. */
.hero-stage .wm-core {
  stroke: var(--foreground);
  stroke-width: 1.5;
  opacity: 1;
}

/* Construction guides: crosshair, cap-height and baseline rules, part rectangles. */
.hero-stage .wm-guide-line {
  stroke: var(--accent);
  stroke-width: 1;
  opacity: 0.4;
}
```

   and **delete the `.hero-stage .wm-glow` rule entirely**.

Everything else in `SonderWordmark.tsx` stays: the glyph data, the tracking breakpoints, the
hydration-safe `WM_TRACKING_LG` initial state, the `gsap.context` draw-on, the `clearDash`
cleanup, the reduced-motion bail.

## 9.4 `components/landing/BrainViewer.tsx` and the brain — the touch-up

The brain is the only image on the entire site and the only place a saturated neon surface
appears at scale. That is exactly the design system's "color exists to create contrast" applied
at full strength. It needs almost nothing.

**Do not touch `lib/landing/three/**` or `lib/landing/anatomy/**`.** Not one line.

**Two CSS changes, both in `components/landing/styles/hero-stage.css`:**

```css
/* The DOM-side radial behind the specimen. Halved from 0.75: this design system
   has no glows, and the only reason any remains is that a specimen with zero
   ambient light reads as pasted on rather than lit. Tied to entry progress so
   there is never a glow with nothing inside it. */
.hero-stage .brain-viewer .viewer-glow {
  opacity: calc(0.38 * var(--brain-entry, 1));
}

/* The veil is a no-op tuning hook (HERO_VEIL_OPACITY is 0). Keep it on the new
   ground so a future non-zero value does not reintroduce the old charcoal. */
.hero-stage .hero-veil {
  background: var(--background);
  opacity: 0;
}
```

`HeroStage` already renders the viewer with every piece of chrome disabled
(`showToolRail={false} showTip={false} showCaption={false} showAutoRotateToggle={false}
showLoader={false}`), so `brain-viewer.css`'s tool rail, caption and sticky-note styles never
render on the landing. **Leave `brain-viewer.css` alone** except for one optional pass: if you
render the viewer anywhere else later, its chrome will need the same treatment. You do not
render it anywhere else.

`BrainViewer.tsx` itself needs **no changes**.

## 9.5 The vine: flattened, on paper

This is the largest single change on the landing and the one the user asked for by name.

### 9.5.1 What changes and what must not

| Change | Detail |
|---|---|
| **Ground** | The whole vine section sits on `--paper` (`#FAFAFA`) with `--paper-ink` type. A hard charcoal-to-white edge above and below. |
| **The spine** | Five stacked strokes (two blooms, an edge, a dark fill, a hot core) collapse to **one** 2px ink line. |
| **Tendrils, branches** | Glow copies deleted. One 1.5px ink stroke each. |
| **Leaves** | Outline in ink at 1.5px with an 8% ink tint. No neon. |
| **Knots** | Breathing halo deleted. A 2px `--paper-accent` ring with a filled dot. |
| **Pulses** | Deleted entirely. Travelling charge dots are the hologram idiom. |
| **Node cards** | Border, glass fill, blur and shadow all deleted. The node becomes **pure type**: a mono index, a mono kicker, a large title, body copy, a meta line, separated by rules. |
| **DO NOT CHANGE** | `lib/landing/vine/geometry.ts` (the maths engine). |
| **DO NOT CHANGE** | `--v-card-w: min(400px, 34%)`. It is constrained by `VINE_AMP_FRAC`; widening it collapses the branch to a stub. The worked constraint is in `vine-theme.ts`. |
| **DO NOT CHANGE** | `.vine-node { position: static }`. `measure()` reads `offsetTop`/`offsetLeft` and needs the section to stay the `offsetParent`. |
| **DO NOT CHANGE** | `VINE_OVERHANG`, `VINE_ANCHOR_INSET`, `VINE_AMP_FRAC`, `VINE_SCRUB`, `refreshPriority: 0`, or any other constant in `vine-theme.ts`. |

> **The overhang trap, and how this plan avoids it.** `VINE_OVERHANG = 150` positions the SVG at
> `top: -150px` relative to `.vine-scroller`, so the vine "sprouts" from above its own section.
> On a paper band that would draw ink onto the charcoal section above it, where it is invisible.
> **Do not set `VINE_OVERHANG` to 0 to fix this.** Instead give the paper band `padding-top:
> 10rem` (160px), so the overhanging 150px still lands on white. Zero engine edits, and the vine
> now visibly enters from the top edge of the paper, which reads as intentional.

### 9.5.2 `components/landing/VineScroller.tsx` — the edits

**Edit 1 — delete the pulses.** Remove, in this order:

- the entire `/* ------- pulses ------- */` `useEffect` block,
- the `frontYRef` declaration and the `frontYRef.current = frontY;` line at the top of
  `applyFront`,
- the `<g className="vine-pulses">…</g>` JSX block,
- the now-unused imports `VINE_PULSE_COUNT`, `VINE_PULSE_RESPAWN`, `VINE_PULSE_SPEED`,
  `VINE_PULSE_SPEED_JITTER`.

**Edit 2 — one spine stroke.** Replace the five paths inside each segment group with one:

```tsx
          <g className="vine-spine">
            {geom.segments.map((seg, i) => (
              <g key={`s${i}`} data-seg={i} className="vine-seg">
                <path className="vine-spine-line" d={seg.d} />
              </g>
            ))}
          </g>
```

**Edit 3 — one tendril and one branch stroke.** Delete `<path className="vine-tendril-glow">` and
`<path className="vine-branch-glow">`, and delete `<circle className="vine-knot-halo">`.

**Edit 4 — the node becomes type.** Replace the `<article>` body:

```tsx
            <article
              ref={(el) => { cardRefs.current[i] = el; }}
              id={`vine-node-${node.id}`}
              className="vine-node"
            >
              <p className="vine-node-index">{String(i + 1).padStart(2, "0")}</p>
              <p className="vine-node-eyebrow">{node.eyebrow}</p>
              <h2 className="vine-node-title">{node.title}</h2>
              <p className="vine-node-body">{node.body}</p>
              {node.meta ? <p className="vine-node-meta">{node.meta}</p> : null}
            </article>
```

Nothing else in the component changes: not `measure()`, not the `ResizeObserver`, not the
ScrollTrigger growth, not the `data-ready` progressive-enhancement contract.

### 9.5.3 `components/landing/styles/vine.css` — replace the whole file

```css
/*
 * The vine, flattened to a 2D line drawing on paper.
 *
 * The five stacked spine strokes that made this read as an emissive 3D tube are
 * gone: one 2px ink line replaces them. Colours come from the paper tokens, not
 * from the brain's palette, because the vine no longer shares a material with
 * the brain. It is a printed diagram now.
 *
 * The SVG viewBox is 1:1 with CSS pixels, so every stroke-width here is already
 * in px and needs no scaling.
 */

.vine-scroller {
  --v-ink: var(--paper-ink);
  --v-accent: var(--paper-accent);
  --v-muted: var(--paper-muted);
  --v-line: var(--paper-border);

  /* CONSTRAINED. The centred spine swings within the gutter this leaves. If you
     widen it you MUST lower VINE_AMP_FRAC in vine-theme.ts to match; the worked
     constraint is in that file's comment. Do not change it. */
  --v-card-w: min(400px, 34%);

  --v-ease: cubic-bezier(0.25, 0, 0, 1);

  position: relative;
  z-index: 1;
  width: 100%;
  overflow: visible;
  color: var(--v-ink);
}

/* ----------------------------------------------------------------- the svg */

.vine-scroller .vine-svg {
  position: absolute;
  left: 0;
  width: 100%;
  pointer-events: none;
  /* Do NOT add will-change / translateZ(0): this element is about 5000px tall
     and promoting it forces a roughly 30MB composited layer. */
}

/* --------------------------------------------------------------- the spine */

/* NOTE: stroke-dasharray / stroke-dashoffset are set inline on the parent <g>
   and inherit down to these. Never declare stroke-dasharray here. */

.vine-scroller .vine-seg path {
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.vine-scroller .vine-spine-line {
  stroke: var(--v-ink);
  stroke-width: 2;
  opacity: 1;
}

/* --------------------------------------------------------------- tendrils */

.vine-scroller .vine-tendril path {
  fill: none;
  stroke-linecap: round;
  stroke-dasharray: var(--vine-len);
  stroke-dashoffset: var(--vine-len);
  transition: stroke-dashoffset 500ms var(--v-ease);
}
.vine-scroller .vine-tendril.is-open path {
  stroke-dashoffset: 0;
}
.vine-scroller .vine-tendril-core {
  stroke: var(--v-ink);
  stroke-width: 1.25;
  opacity: 0.55;
}

/* ----------------------------------------------------------------- leaves */

.vine-scroller .vine-leaf-body {
  fill: var(--v-ink);
  fill-opacity: 0;
  stroke: var(--v-ink);
  stroke-width: 1.5;
  stroke-linejoin: round;
  opacity: 0.75;
  stroke-dasharray: var(--vine-len);
  stroke-dashoffset: var(--vine-len);
  transition:
    stroke-dashoffset 500ms var(--v-ease),
    fill-opacity 500ms var(--v-ease) 120ms;
}
.vine-scroller .vine-leaf.is-open .vine-leaf-body {
  stroke-dashoffset: 0;
  fill-opacity: 0.08;
}

.vine-scroller .vine-leaf-rib {
  fill: none;
  stroke: var(--v-accent);
  stroke-width: 0.9;
  opacity: 0;
  transition: opacity 500ms var(--v-ease) 150ms;
}
.vine-scroller .vine-leaf.is-open .vine-leaf-rib {
  opacity: 0.7;
}

/* --------------------------------------------------- branches + node knots */

.vine-scroller .vine-branch-core {
  fill: none;
  stroke: var(--v-ink);
  stroke-width: 1.5;
  stroke-linecap: round;
  opacity: 0.85;
  stroke-dasharray: var(--vine-len);
  stroke-dashoffset: var(--vine-len);
  transition: stroke-dashoffset 500ms var(--v-ease);
}
.vine-scroller .vine-branch.is-open .vine-branch-core {
  stroke-dashoffset: 0;
}

.vine-scroller .vine-knot-ring,
.vine-scroller .vine-knot-dot,
.vine-scroller .vine-tip {
  opacity: 0;
  transition: opacity 500ms var(--v-ease) 120ms;
}
.vine-scroller .vine-branch.is-open .vine-knot-ring,
.vine-scroller .vine-branch.is-open .vine-knot-dot,
.vine-scroller .vine-branch.is-open .vine-tip {
  opacity: 1;
}

.vine-scroller .vine-knot-ring {
  fill: var(--paper);
  stroke: var(--v-accent);
  stroke-width: 2;
}
.vine-scroller .vine-knot-dot {
  fill: var(--v-accent);
}
.vine-scroller .vine-tip {
  fill: var(--v-accent);
  stroke: none;
}

/* ------------------------------------------------------------------ layout */

.vine-scroller .vine-rows {
  position: relative;
  z-index: 2;
  width: 100%;
}

.vine-scroller .vine-row {
  /* Deliberately NOT positioned: the cards' offsetParent must stay the section,
     because measure() reads offsetTop/offsetLeft relative to it. */
  display: flex;
  width: 100%;
  min-height: 84vh;
  align-items: center;
  padding: 0 clamp(20px, 5vw, 72px);
}
.vine-scroller .vine-row:first-child {
  padding-top: 22vh;
}
.vine-scroller .vine-row[data-side="left"] {
  justify-content: flex-start;
  --v-node-dx: -22px;
}
.vine-scroller .vine-row[data-side="right"] {
  justify-content: flex-end;
  --v-node-dx: 22px;
}

.vine-scroller .vine-tail {
  height: 42vh;
}

/* ------------------------------------------------------------------- nodes */

/*
 * PURE TYPE. No border, no fill, no blur, no shadow. The two declarations that
 * are load-bearing and must never be removed:
 *   position: static  -> keeps offsetParent = the section, which measure() needs
 *   width             -> the branch geometry is computed from the card's edge
 */
.vine-scroller .vine-node {
  position: static;
  width: var(--v-card-w);
  padding: 0;
  border: 0;
  background: none;
  box-shadow: none;
}

.vine-scroller .vine-node-index {
  margin: 0;
  font-family: var(--stack-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  color: var(--v-accent);
}

.vine-scroller .vine-node-eyebrow {
  margin: 10px 0 0;
  font-family: var(--stack-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--v-muted);
}

.vine-scroller .vine-node-title {
  margin: 20px 0 0;
  font-family: var(--stack-sans);
  font-weight: 600;
  font-size: clamp(1.75rem, 2.6vw, 2.5rem);
  line-height: 1.1;
  letter-spacing: -0.04em;
  color: var(--v-ink);
}

.vine-scroller .vine-node-body {
  margin: 20px 0 0;
  font-size: 1rem;
  line-height: 1.6;
  letter-spacing: -0.01em;
  color: var(--v-muted);
}

.vine-scroller .vine-node-meta {
  margin: 24px 0 0;
  padding-top: 16px;
  border-top: 1px solid var(--v-line);
  font-family: var(--stack-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--v-accent);
}

/* ------------------------------------------------------------------ reveal */

/*
 * Cards are visible by default. Only once the component has mounted and
 * measured (data-ready="true") do they start hidden, so with JS disabled or
 * broken the copy is still fully readable and crawlers always see it.
 *
 * Timings match the design system's reveal spec: 500ms, 20px, 80ms stagger.
 */
.vine-scroller[data-ready="true"] .vine-node {
  opacity: 0;
  transform: translate3d(var(--v-node-dx, 0), 20px, 0);
  transition:
    opacity 500ms var(--v-ease),
    transform 500ms var(--v-ease);
}
.vine-scroller[data-ready="true"] .vine-node.is-visible {
  opacity: 1;
  transform: none;
}

.vine-scroller[data-ready="true"] .vine-node-index,
.vine-scroller[data-ready="true"] .vine-node-eyebrow,
.vine-scroller[data-ready="true"] .vine-node-title,
.vine-scroller[data-ready="true"] .vine-node-body,
.vine-scroller[data-ready="true"] .vine-node-meta {
  opacity: 0;
  transform: translate3d(0, 20px, 0);
  transition:
    opacity 500ms var(--v-ease),
    transform 500ms var(--v-ease);
}
.vine-scroller[data-ready="true"] .vine-node.is-visible .vine-node-index { opacity: 1; transform: none; transition-delay: 0ms; }
.vine-scroller[data-ready="true"] .vine-node.is-visible .vine-node-eyebrow { opacity: 1; transform: none; transition-delay: 80ms; }
.vine-scroller[data-ready="true"] .vine-node.is-visible .vine-node-title { opacity: 1; transform: none; transition-delay: 160ms; }
.vine-scroller[data-ready="true"] .vine-node.is-visible .vine-node-body { opacity: 1; transform: none; transition-delay: 240ms; }
.vine-scroller[data-ready="true"] .vine-node.is-visible .vine-node-meta { opacity: 1; transform: none; transition-delay: 320ms; }

/* ------------------------------------------------------------------- rail */

@media (max-width: 859px) {
  .vine-scroller .vine-row,
  .vine-scroller .vine-row[data-side="left"],
  .vine-scroller .vine-row[data-side="right"] {
    justify-content: flex-end;
    min-height: 68vh;
    /* 92px reserves the rail. It must exceed VINE_RAIL_X_MAX + VINE_RAIL_AMP
       (= 56) by at least VINE_BRANCH_GAP (16) or the branch points backwards. */
    padding-left: 92px;
    padding-right: clamp(16px, 5vw, 32px);
    --v-node-dx: 18px;
  }
  .vine-scroller .vine-node {
    width: 100%;
  }
}

/* --------------------------------------------------------- reduced motion */

@media (prefers-reduced-motion: reduce) {
  .vine-scroller .vine-tendril path,
  .vine-scroller .vine-leaf-body,
  .vine-scroller .vine-leaf-rib,
  .vine-scroller .vine-branch-core,
  .vine-scroller .vine-knot-ring,
  .vine-scroller .vine-knot-dot,
  .vine-scroller .vine-tip,
  .vine-scroller[data-ready="true"] .vine-node {
    transition: none !important;
    animation: none !important;
  }
  .vine-scroller[data-ready="true"] .vine-node,
  .vine-scroller[data-ready="true"] .vine-node-index,
  .vine-scroller[data-ready="true"] .vine-node-eyebrow,
  .vine-scroller[data-ready="true"] .vine-node-title,
  .vine-scroller[data-ready="true"] .vine-node-body,
  .vine-scroller[data-ready="true"] .vine-node-meta {
    opacity: 1;
    transform: none;
    transition: none !important;
  }
}
```

### 9.5.4 The band wrapper

In `Landing.tsx` the vine is wrapped like this. The `pt-40` is load-bearing; see the overhang
trap above.

```tsx
<section
  id="narrative"
  aria-label="How Sonder works"
  className="paper-band relative pt-40"
>
  <Container>
    <p className="label text-paper-muted">The mechanism</p>
    <h2 className="mt-8 max-w-[20ch] text-4xl font-semibold leading-tight tracking-tighter text-paper-ink sm:text-5xl lg:text-6xl">
      Six things it does that marking cannot.
    </h2>
  </Container>
  <VineScroller />
</section>
```

## 9.6 The four charcoal sections

### 9.6.1 `components/landing/sections/Thesis.tsx` — NEW

The 128px poster moment. Permitted Playfair call site 1 of 4.

```tsx
"use client";

import { Container, Section } from "@/components/layout";
import { Label, Quote } from "@/components/type";
import { useReveal } from "../useReveal";

export function Thesis() {
  const ref = useReveal<HTMLElement>();
  return (
    <Section ref={ref} id="premise" size="hero" bordered>
      <Container>
        <Label tone="accent" data-reveal>
          The premise
        </Label>

        <h2
          data-reveal
          className="mt-12 max-w-[14ch] text-5xl font-bold leading-none tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl"
        >
          A wrong answer is not a diagnosis.
        </h2>

        <div className="mt-20 lg:grid lg:grid-cols-12 lg:gap-12">
          <div data-reveal className="lg:col-span-5 lg:col-start-8">
            <Quote cite="The problem Sonder exists to solve">
              The same wrong answer can come from four different broken ideas, and
              each one needs a different fix.
            </Quote>
          </div>
        </div>
      </Container>
    </Section>
  );
}
```

`Section` must accept and forward a `ref` and arbitrary props for this to work; the definition in
§6.3 already spreads `...rest`, but you must also wrap it so it forwards refs. In React 19 a
function component can take `ref` as a normal prop, so add `ref?: React.Ref<HTMLElement>` to
`Section`'s props and put it on the `<section>`.

### 9.6.2 `components/landing/sections/Numbers.tsx` — NEW

**Every number is imported.** Do not type a figure by hand.

```tsx
"use client";

import { Container, Section } from "@/components/layout";
import { Label, StatRow } from "@/components/type";
import { PERF_METRICS, PERF_NOTES } from "@/fixtures/performance";
import { CATALOGUE } from "@/fixtures/catalogue";
import { GENERATION_RUN } from "@/fixtures/content/generation-run";
import { useReveal } from "../useReveal";

export function Numbers() {
  const ref = useReveal<HTMLElement>();
  return (
    <Section ref={ref} size="default" bordered>
      <Container>
        <Label tone="accent" data-reveal>
          Measured against simpler methods
        </Label>

        <div className="mt-12" data-reveal>
          <StatRow
            items={[
              {
                label: "Diagnostic accuracy",
                value: PERF_METRICS[0].value,
                tone: "accent",
                hint: `against ${PERF_METRICS[0].baselineValue} for a ${PERF_METRICS[0].baselineLabel}`,
              },
              {
                label: "Questions to a diagnosis",
                value: PERF_METRICS[1].value,
                hint: `against ${PERF_METRICS[1].baselineValue} for a ${PERF_METRICS[1].baselineLabel}`,
              },
              {
                label: "Misconceptions catalogued",
                value: CATALOGUE.length,
                hint: "across Maths, Physics and Chemistry",
              },
              {
                label: "Questions drafted and vetted",
                value: GENERATION_RUN.finalBatch.length,
                hint: `from ${GENERATION_RUN.rounds.length} generation rounds`,
              },
            ]}
          />
        </div>

        <p className="mt-12 max-w-2xl text-sm leading-relaxed text-muted-foreground" data-reveal>
          {PERF_NOTES.sampleSize}, {PERF_NOTES.window}. {PERF_NOTES.caveat} All
          figures are illustrative fixture data for this build.
        </p>
      </Container>
    </Section>
  );
}
```

### 9.6.3 `components/landing/sections/Workspaces.tsx` — NEW

The role picker. BLUEPRINT §4.0: clicking a role signs in and navigates to that role's home.

```tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, Section } from "@/components/layout";
import { Label, LayeredNumber } from "@/components/type";
import { useSession, type Role } from "@/lib/session";
import { ROLES, ROLE_ORDER } from "@/lib/roles";
import { useReveal } from "../useReveal";

/** The claim each workspace proves. Chrome copy, not fixture data. */
const CLAIM: Record<Role, string> = {
  student: "A question chosen to tell two ideas apart.",
  teacher: "Every diagnosis arrives with its evidence.",
  parent: "Nothing is shown before a teacher approves it.",
  admin: "When the bank falls short, it writes new questions.",
};

export function Workspaces() {
  const ref = useReveal<HTMLElement>();
  const { signIn } = useSession();
  const router = useRouter();

  return (
    <Section ref={ref} id="workspaces" size="hero" bordered>
      <Container>
        <Label tone="accent" data-reveal>
          Enter
        </Label>
        <h2
          data-reveal
          className="mt-8 max-w-[18ch] text-4xl font-semibold leading-tight tracking-tighter sm:text-5xl lg:text-6xl"
        >
          Four workspaces. One engine.
        </h2>
        <p
          data-reveal
          className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground"
        >
          This build runs entirely on scripted fixture data. There is no backend,
          no authentication and no live model. Pick a workspace and walk the flow
          end to end.
        </p>

        <div className="mt-20 border-t border-border">
          {ROLE_ORDER.map((role, i) => {
            const meta = ROLES[role];
            return (
              <Link
                key={role}
                href={meta.home}
                onClick={() => signIn(role)}
                data-reveal
                className="group relative flex flex-col gap-6 border-b border-border py-10 transition-colors duration-150 ease-[var(--ease)] hover:border-border-hover lg:grid lg:grid-cols-12 lg:items-baseline lg:gap-12"
              >
                <LayeredNumber
                  value={String(i + 1).padStart(2, "0")}
                  className="-top-6 right-0 opacity-60"
                />

                <div className="lg:col-span-3">
                  <Label tone="accent" as="span">
                    {meta.label}
                  </Label>
                  <span className="mt-3 block text-sm text-muted-foreground">
                    {meta.person}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {meta.context}
                  </span>
                </div>

                <div className="lg:col-span-6">
                  <span className="relative inline-block text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
                    {CLAIM[role]}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 -bottom-2 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-150 ease-[var(--ease)] group-hover:scale-x-100"
                    />
                  </span>
                  <span className="mt-4 block max-w-xl text-base text-muted-foreground">
                    {meta.blurb}
                  </span>
                </div>

                <span className="label flex items-center gap-3 text-accent lg:col-span-3 lg:justify-end">
                  {meta.home}
                  <ArrowRight
                    className="size-4 shrink-0 transition-transform duration-150 ease-[var(--ease)] group-hover:translate-x-1"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
```

> **`router` is imported but unused above.** Delete the `useRouter` import and the `router`
> line: the `<Link>` handles navigation and `onClick` handles sign-in, in that order, which is
> exactly what BLUEPRINT §4.0 requires. A `router.push` alongside a `<Link>` would double-navigate.
> This is called out because it is a very easy thing to leave in.

**Do not nest a second interactive element inside these rows.** One `<Link>` per row. No "see it"
sub-link, no button inside an anchor. That is invalid HTML and a keyboard trap.

### 9.6.4 `components/landing/sections/LandingFooter.tsx` — rewrite

```tsx
"use client";

import Link from "next/link";
import { Container, Section } from "@/components/layout";
import { Label } from "@/components/type";
import { BrandMark } from "@/components/app/BrandMark";
import { useReveal } from "../useReveal";

const WALK = [
  { href: "/student", label: "Student" },
  { href: "/teacher", label: "Teacher" },
  { href: "/parent", label: "Parent" },
  { href: "/admin", label: "Admin" },
  { href: "/dev/components", label: "Component gallery" },
];

export function LandingFooter() {
  const ref = useReveal<HTMLElement>();
  return (
    <footer ref={ref} role="contentinfo" className="border-t border-border">
      <Section size="tight">
        <Container>
          <div className="grid gap-16 md:grid-cols-12 md:gap-12">
            <div data-reveal className="md:col-span-5">
              <span className="inline-flex text-accent">
                <BrandMark size={20} />
              </span>
              <p className="mt-8 max-w-[34ch] text-base leading-relaxed text-muted-foreground">
                Final-year project. Adaptive misconception diagnosis across Maths,
                Physics and Chemistry.
              </p>
            </div>

            <div data-reveal className="md:col-span-3">
              <Label tone="muted">Walk the build</Label>
              <div className="mt-6 flex flex-col">
                {WALK.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative w-fit py-2 text-base text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  >
                    {item.label}
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-1 h-px origin-left scale-x-0 bg-accent transition-transform duration-150 ease-[var(--ease)] group-hover:scale-x-100"
                    />
                  </Link>
                ))}
              </div>
            </div>

            <div data-reveal className="md:col-span-4">
              <Label tone="muted">Notes</Label>
              <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
                <p>Scripted data. No backend, no authentication, no live model.</p>
                <p>3D model generated with Tripo AI. See the licence notes in the README.</p>
                <p>Built with Next.js, three.js and GSAP.</p>
              </div>
            </div>
          </div>

          <p className="label mt-20 border-t border-border pt-8 text-faint">
            Sonder · Proof of concept {new Date().getFullYear()}
          </p>
        </Container>
      </Section>
    </footer>
  );
}
```

`text-faint` on that last line is `#4A4A4A` at 1.9:1, which is below AA. That is acceptable
**only** because the line is a decorative colophon carrying no information a user needs. If you
want it readable, use `tone="muted"`. Do not use `text-faint` for anything else.

## 9.7 Delete `AetherFlow`

```bash
rm components/landing/AetherFlow.tsx
```

The particle network over a 24px grid belongs to the previous design language. Bold Typography's
texture is grain, which is already applied globally in §3.3, and its negative space is meant to
be *empty*. A 220-particle animated network is the opposite of "deliberate negative space".

Removing it also removes a full-viewport `requestAnimationFrame` canvas from every frame of the
landing, which the brain's WebGL context will happily spend instead.

## 9.8 `components/landing/LandingNav.tsx` — NEW (replaces the deleted one)

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/app/BrandMark";

/**
 * Transparent over the hero so the poster is uninterrupted, then opaque with a
 * hairline once the sentinel clears. An IntersectionObserver on a 1px sentinel
 * replaces a scroll listener entirely; there is no scroll listener anywhere in
 * this build.
 */
export function LandingNav() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-[90vh] h-px w-px"
      />

      <header
        role="banner"
        className={cn(
          "sticky top-0 z-40 h-[var(--topbar-h)] transition-colors duration-200 ease-[var(--ease)]",
          scrolled ? "border-b border-border bg-background" : "border-b border-transparent",
        )}
      >
        <a href="#narrative" className="skip-link">
          Skip to how it works
        </a>

        <nav
          aria-label="Landing"
          className="mx-auto flex h-full max-w-[1440px] items-center gap-8 px-6 md:px-12 lg:px-16"
        >
          <a
            href="#top"
            aria-label="Sonder, back to top"
            className="shrink-0 text-foreground transition-colors duration-150 hover:text-accent"
          >
            <BrandMark size={18} />
          </a>

          <a
            href="#narrative"
            className="label group relative ml-auto hidden py-2 text-muted-foreground transition-colors duration-150 hover:text-foreground sm:block"
          >
            How it works
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-150 ease-[var(--ease)] group-hover:scale-x-100"
            />
          </a>

          <a
            href="#workspaces"
            className="label group relative ml-auto flex min-h-11 items-center gap-3 text-accent sm:ml-8"
          >
            Choose a workspace
            <ArrowRight className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-2 h-0.5 origin-center scale-x-100 bg-accent transition-transform duration-150 ease-[var(--ease)] group-hover:scale-x-110"
            />
          </a>
        </nav>
      </header>
    </>
  );
}
```

## 9.9 `components/landing/Landing.tsx` — replace the whole file

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { LandingNav } from "./LandingNav";
import { Thesis } from "./sections/Thesis";
import { Numbers } from "./sections/Numbers";
import { Workspaces } from "./sections/Workspaces";
import { LandingFooter } from "./sections/LandingFooter";
import VineScroller from "./VineScroller";
import { Container } from "@/components/layout";
import { initSmoothScroll, destroySmoothScroll } from "@/lib/landing/smooth-scroll";
import "./styles/landing.css";

/**
 * The hero owns a WebGL context and a 2.5MB model, so it is a client-only
 * dynamic import and never blocks first paint. Everything else, including the
 * vine whose copy must be in the server HTML, renders normally.
 */
const HeroStage = dynamic(() => import("./HeroStage"), {
  ssr: false,
  // Exactly one dynamic viewport tall, on the page ground, so nothing shifts
  // when the real hero swaps in. This is the CLS defence.
  loading: () => <div className="h-[100dvh] w-full bg-background" aria-hidden />,
});

export function Landing() {
  useEffect(() => {
    initSmoothScroll();

    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        void import("gsap/ScrollTrigger").then((m) => m.ScrollTrigger.refresh());
      });
    }

    return () => destroySmoothScroll();
  }, []);

  return (
    <div className="sonder-landing relative" id="top">
      <LandingNav />

      <main>
        <HeroStage />

        <Thesis />

        <section
          id="narrative"
          aria-label="How Sonder works"
          className="paper-band relative pt-40"
        >
          <Container>
            <p className="label text-paper-muted">The mechanism</p>
            <h2 className="mt-8 max-w-[20ch] text-4xl font-semibold leading-tight tracking-tighter text-paper-ink sm:text-5xl lg:text-6xl">
              Six things it does that marking cannot.
            </h2>
          </Container>
          <VineScroller />
        </section>

        <Numbers />
        <Workspaces />
      </main>

      <LandingFooter />
    </div>
  );
}
```

## 9.10 `components/landing/styles/landing.css` — replace the whole file

Almost everything in the old file described chrome that no longer exists.

```css
/*
 * The landing's only stylesheet. Everything else is Tailwind utilities or the
 * two engine stylesheets (vine.css, brain-viewer.css).
 */

.sonder-landing {
  position: relative;
  min-height: 100dvh;
  background: var(--background);
  color: var(--foreground);
}

/* Anchor jumps must clear the sticky nav. */
.sonder-landing [id] {
  scroll-margin-top: calc(var(--topbar-h) + 1rem);
}

/*
 * The vine is a very tall subtree whose internal changes (a dash offset) must
 * never invalidate whole-document layout. It already establishes a containing
 * block, so `layout` containment is free here.
 */
.sonder-landing .vine-scroller {
  contain: layout style;
}

/* The 3D canvas must not be captured by a view transition. */
.sonder-landing canvas {
  view-transition-name: none;
}

@media (prefers-reduced-motion: reduce) {
  .sonder-landing *,
  .sonder-landing *::before,
  .sonder-landing *::after {
    transition: none !important;
  }
}
```

## 9.11 Phase 7 gate

Walk the whole landing at 390px, 860px, 1280px and 1920px, and again with reduced motion on.

- [ ] `npm run build` exits 0.
- [ ] `grep -rn "AetherFlow\|sonder-grid\|sonder-glass" app components` returns nothing.
- [ ] The wordmark still draws stroke by stroke, now in **warm white** with **accent**
      construction guides, and no bloom.
- [ ] The brain still rises from below the frame and settles during the pin, and still
      auto-rotates afterwards.
- [ ] The hero statement is legible over the brain. Sample it: `#FAFAFA` clears 4.5:1.
- [ ] The wordmark has fully exited before the statement enters. They never overlap.
- [ ] The thesis headline is the largest type on the site.
- [ ] The vine band is **white**, the spine is a **single flat ink line**, and there is no glow,
      no bloom, no travelling pulse anywhere in it.
- [ ] All six vine nodes still open in sequence, with the index, kicker, title, body and meta
      staggering in that order.
- [ ] The vine's overhang lands **on the white**, not on the charcoal above it.
- [ ] Below 860px the vine switches to the left rail and every card goes full width.
- [ ] Every number in the Numbers section matches its fixture. Change a fixture value locally and
      confirm the page changes, then revert.
- [ ] Clicking a workspace row signs in and lands on that role's home.
- [ ] The nav is transparent over the hero and gains a ground plus a hairline after it.
- [ ] With reduced motion on: no pin, the brain is already in place, the wordmark is already
      drawn and lifted clear of it, and the whole vine is drawn.
- [ ] Navigating landing → product → landing twice leaves no duplicated ScrollTriggers, no leaked
      WebGL context, and **no Lenis instance still bound to the document.** The last one is
      load-bearing: the product scrolls the document, so a leaked Lenis would hijack it.

---

# PART 10 — PHASE 8: ALL 27 ROUTES

## 10.0 How to read this part

Each route gets a block with the same six fields. Follow them literally.

- **File / kind** — the path, and whether it is a server or client component. **Never add
  `"use client"` to a route that does not need it.** A route needs it only if it uses state,
  effects, a store hook (`useSession`, `useTeacherReviews`, `useLocalFlag`), or an event handler.
- **Masthead** — the exact `label`, `title` and `lede` strings, and the scale. `label` is a
  category and is written here in the case you should type it (the CSS uppercases it).
- **Data** — every fixture import. Nothing is invented.
- **Composition** — the ordered structure.
- **Behaviour** — the BLUEPRINT rules this route must satisfy.
- **States** — empty, loading, not-found.

**Recommended order.** Build one route per archetype first so the pattern is proven before it is
repeated: `/teacher` → `/teacher/session/[scenario]` → `/teacher/escalations` →
`/student/session/...` → `/student/remediation/...` → `/student/learn` → `/student/consultant`.
Then everything else in any order.

**Two rules that apply to every single route:**

1. It opens with `<PageMasthead>` inside a `<Container>`. Exceptions: `FocusFrame` routes
   (`/student/start`, `/student/session/...`, `/student/verify/...`, `not-found`) which are
   task screens, and `ChatFrame` routes which pass the masthead into the frame's `header` slot.
2. Every button row uses `gap-8`. See the underline-overflow note in §4.1.

---

## 10.1 `not-found.tsx`

- **File / kind:** `app/not-found.tsx`, **client** (reads the session for the return link).
- **Masthead:** none. This is a poster, not a page.
- **Data:** `useSession`, `ROLES`.
- **Composition:**

```tsx
"use client";

import Link from "next/link";
import { useSession } from "@/lib/session";
import { ROLES } from "@/lib/roles";
import { Container } from "@/components/layout";
import { Label, LayeredNumber, AccentBar } from "@/components/type";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  const { role } = useSession();
  const home = role ? ROLES[role].home : "/";
  const label = role ? `Back to ${ROLES[role].label.toLowerCase()} home` : "Back to home";

  return (
    <Container className="relative py-28 md:py-40">
      <LayeredNumber value="404" className="right-0 top-10" />
      <Label tone="accent">Not found</Label>
      <h1 className="mt-8 max-w-[16ch] text-5xl font-bold leading-none tracking-tighter sm:text-6xl lg:text-7xl">
        Nothing here.
      </h1>
      <AccentBar className="mt-10" />
      <p className="mt-10 max-w-xl text-lg leading-relaxed text-muted-foreground">
        Every real screen is reachable from its own navigation. There is no page
        hiding behind a guessed URL.
      </p>
      <div className="mt-12">
        <Link href={home} className={buttonVariants()}>
          {label}
          <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden />
        </Link>
      </div>
    </Container>
  );
}
```

- **Behaviour:** BLUEPRINT §4.0. The destination and label adapt to whether a role is stored.
  Before hydration `role` is `null`, so the signed-out label renders first and corrects itself.
  That is the documented, accepted behaviour of `lib/session.tsx`.
- **States:** this page *is* the error state.

---

## 10.2 `/student` — student home

- **File / kind:** `app/student/page.tsx`, **server**.
- **Masthead:** scale `hero`. label `Student`. title `` `Welcome back, ${ROLES.student.person.split(" ")[0]}` ``. lede
  `Start a diagnostic when a topic feels shaky. Your teacher reviews everything before it goes anywhere.`
- **Data:** `ROLES` from `@/lib/roles`.
- **Composition:**
  1. `<Container>` + `<PageMasthead scale="hero" ... actions={<Link href="/student/start" className={buttonVariants()}>Start a diagnostic <ArrowRight/></Link>} />`
  2. `<Section size="default">` containing a `<Callout tone="attention" kicker="Due now"
     title="Follow-up check due" body="Rounding to decimal places. One quick question."
     action={<Link href="/student/verify/B" className={buttonVariants()}>Take the check</Link>} />`
  3. `<Section size="tight" bordered>` with `<GroupHeading>Last session</GroupHeading>` then one
     `<ListRow>` whose `leading` is `<StatusMark status="diagnosed" />`, title
     `Rounding to decimal places`, meta `Study note ready to read`, wrapped in a
     `<Link href="/student/remediation/B">`.
  4. `<Section size="tight" bordered>` with `<GroupHeading>Where to go next</GroupHeading>` then
     three `<LinkRow>`:
     - `/student/start` · `New diagnostic` · `Pick a subject and a topic, then answer one question at a time.`
     - `/student/insights` · `My learning pace` · `How quickly your past misconceptions were resolved.`
     - `/student/consultant` · `Ask the consultant` · `A scripted assistant for your own sessions.`
- **Behaviour:** BLUEPRINT §4.1. Both shortcut cards are hardcoded to scenario `B`; that is
  intentional in this build. Do not compute them.
- **States:** none. Identical every visit.

---

## 10.3 `/student/start` — pick a subject, then a topic

- **File / kind:** `app/student/start/page.tsx`, **client** (two-step state).
- **Frame:** `<FocusFrame progress={{ current: subject ? 2 : 1, total: 2 }} exitHref="/student"
  exitLabel="Leave the picker">`
- **Data:** `SUBJECTS` from `@/fixtures/subjects`.
- **Composition:**
  - **Step 1** (no subject chosen):
    - `<Label tone="accent">Step one of two</Label>`
    - `<h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">Which subject?</h1>`
    - `<AccentBar className="mt-8" />`
    - A `border-t border-border` list, one row per subject. Each row is a `<button>` at
      `min-h-24`, `border-b border-border`, `text-left`, containing: the subject icon at 24px
      `strokeWidth={1.5}` in `text-muted-foreground`, the subject name at
      `text-3xl font-semibold tracking-tight`, and a mono count
      `` `${s.topics.length} topics` `` right-aligned in `.label text-faint`. Hover lightens the
      border and slides an `ArrowRight` 4px.
  - **Step 2** (subject chosen):
    - `<Button variant="ghost" onClick={() => setSubject(null)}>Change subject</Button>` above the
      heading.
    - `<Label tone="accent">Step two of two</Label>`, `<h1>{subject.name}</h1>`, `<AccentBar/>`
    - First row: **`Broad check across all of {subject.name}`**, always enabled, links to
      `/student/session/${subject.generalScenario}/general`. Give it a
      `<Label tone="accent">Whole subject</Label>` kicker so it reads as distinct from the topics.
    - Then one row per topic. If `topic.scenario` exists, it is a `<Link>` to
      `/student/session/${topic.scenario}/topic`. If not, it is a `<div>` with
      `opacity-50 cursor-not-allowed`, no hover, and a trailing
      `<Mark bucket="inert">Not in this build</Mark>`.
    - Each topic row shows `topic.name` at `text-2xl font-semibold tracking-tight` and
      `topic.blurb` at `text-base text-muted-foreground` beneath.
- **Behaviour:** BLUEPRINT §4.1. Exactly one topic per subject is wired: Mathematics → rounding
  (B), Physics → energy (A), Chemistry → moles (C). Everything else is a visibly disabled stub.
  **Read this from the fixture (`topic.scenario`), never hardcode it.**
- **States:** none.

---

## 10.4 `/student/session/[scenario]/[mode]` — the diagnostic

- **File / kind:** `app/student/session/[scenario]/[mode]/page.tsx` **server** (keep
  `generateStaticParams` exactly as it is), `SessionClient.tsx` **client**.
- **Frame:** `<FocusFrame progress={...} exitHref="/student" exitLabel="Leave this check">`
- **Data:** the `Scenario` passed in as a prop; `useScenarioPlayer`.
- **Composition, by phase.** Keep the existing four-phase state machine (`intro`, `question`,
  `thinking`, `done`), the `THINKING_MS = 950` pause, the `nextIsEnd` lookahead and the timer
  cleanup exactly as they are. Only the render changes.
  - **intro:** `<Label tone="accent">{mode === "general" ? "Broad subject check" : "Topic diagnostic"}</Label>`,
    then `<h1 className="mt-8 text-4xl font-semibold tracking-tight sm:text-5xl">{modeLabel}</h1>`,
    `<AccentBar className="mt-8"/>`, then a paragraph at `text-lg text-muted-foreground` stating
    the question budget, no time limit and no score, then a full-width
    `<Button size="lg" className="mt-12 w-full">Begin</Button>`.
  - **question:** `<Label tone="muted">{modeLabel}</Label>`, then the question at
    **`text-3xl font-semibold leading-snug tracking-tight sm:text-4xl`** with `mt-10`. Then the
    options, `mt-12`, as a `border-t border-border` list. Each option is a `<button>`:

    ```
    "group relative flex min-h-16 w-full items-center gap-6 border-b border-border
     px-2 py-5 text-left text-lg transition-colors duration-150 ease-[var(--ease)]"
    unselected: "hover:bg-muted"
    selected:   "bg-muted" + a 2px accent left rule via an absolute span
    ```

    The letter (`A`, `B`, `C`…) is a `<span className="label nums w-6 shrink-0">` in
    `text-faint`, becoming `text-accent` when selected.
    Below the options, `mt-12`, a `text-sm text-muted-foreground` footnote:
    `Sonder picks each next question from your answers so far. You will not see the reasoning. Your teacher does.`
  - **thinking:** a `role="status"` block: `<div className="rule-sweep w-40" aria-hidden />` plus
    `<p className="mt-6 text-base text-muted-foreground">Working through your answer</p>`.
  - **done:** `<Label tone="muted">{`Session complete · ${modeLabel}`}</Label>`, the
    `studentOutcome.headline` as an `<h1>` at `text-4xl sm:text-5xl font-semibold tracking-tight`,
    then `<OutcomeBanner type={o.type} message={o.message} />` at `mt-12`.
    Actions at `mt-12` in a `flex flex-wrap gap-8`:
    - diagnosed → `<Link href={`/student/remediation/${scenario.id}`} className={buttonVariants()}>See your study note</Link>`
    - unsure → `<Link href="/student" className={buttonVariants()}>Back to home</Link>`
    - always → `<Button variant="ghost" onClick={restart}>Run again</Button>`
    - unsure only, below at `mt-10`: a `<Link href="/student/learn">` styled as a ghost
      text link with an accent underline, reading `Learn about a related concept`, plus a
      `text-sm text-muted-foreground` line:
      `Nothing is shared with your parent until a teacher has reviewed it.`
- **Behaviour:** BLUEPRINT §4.1 and §7. **The student never sees the posterior, the engine's
  reasoning, or the correct answer.** Do not render `step.posterior`, `step.explanation` or
  `step.correctAnswer` on this route. What the student clicks does not change the sequence; that
  is intentional.
- **States:** an unrecognised scenario or mode 404s before any content renders, via
  `generateStaticParams`. Do not add a runtime guard.

---

## 10.5 `/student/verify/[scenario]` — the follow-up check

- **File / kind:** `page.tsx` **server** (keep `generateStaticParams`), `VerifyClient.tsx`
  **client**.
- **Frame:** `<FocusFrame progress={{ current: answered ? 1 : 0, total: 1 }} exitHref="/student"
  exitLabel="Back to home">`
- **Data:** `scenario.verification` (`context`, `questionText`, `optionsShown`, `correctAnswer`).
- **Composition:**
  - `<Label tone="accent">Follow-up check</Label>`
  - The `verification.context` sentence at `text-lg text-muted-foreground`, `mt-8`.
  - The question as `<h1>` at `text-3xl sm:text-4xl font-semibold leading-snug tracking-tight`,
    `mt-10`.
  - **Unanswered:** the same option-row treatment as §10.4.
  - **Answered:** replace the options with an `<OutcomeBanner>`:
    - match → `type="diagnosed"`, `title="The fix held"`, message
      `Nothing more to do on this misconception for now.`
    - mismatch → `type="unsure"`, `title="This one slipped back"`, message
      `Your teacher has been notified and will revisit it with you.`
  - A single `<Link href="/student" className={buttonVariants()}>Back to home</Link>` at `mt-12`.
- **Behaviour:** BLUEPRINT §4.1. **This is the one screen where the student's click genuinely
  decides the outcome**: compare the chosen option to `verification.correctAnswer`. Any wrong
  option produces the same "slipped back" result; `relapseAnswer` exists in the fixture but is
  deliberately unused. One attempt only, no change-my-answer control.
- **States:** a scenario with no `verification` 404s.

---

## 10.6 `/student/remediation/[scenario]` — the study note

- **File / kind:** `app/student/remediation/[scenario]/page.tsx`, **server**. Keep
  `generateStaticParams` returning `A` and `B`. `MarkReadButton.tsx` stays **client**.
- **Masthead:** label `Study note`. title `{note.name}`. lede
  `` `For ${scenario.topicName}. Read this in your own time. It is yours to come back to.` ``
- **Data:** `getScenario`, `learnPageHref`.
- **Composition:** `<Container>` + `<PageMasthead>` + `<Section size="default">` containing a
  `<Split ratio="8/4" sticky secondary={...}>`:
  - **primary:** a `<div className="prose-editorial">` with
    `<h2>What was going on</h2><p>{note.explanation}</p><h2>How to think about it</h2><p>{note.correction}</p>`.
    The `.prose-editorial` class (§3.3) sets the first paragraph as a Playfair lede and the `h2`s
    as mono rules automatically. **Do not add classes to the paragraphs.**
    Below the article, outside `.prose-editorial`, the video link as a `<LinkRow>`-shaped anchor
    with `target="_blank" rel="noopener noreferrer"`, title `{note.videoTitle}`, description
    `Opens on YouTube`.
  - **secondary:** a `<Mark bucket="confirmed">Teacher approved</Mark>` with the sentence
    `Shared with you after your teacher reviewed the diagnosis.` beneath at
    `text-sm text-muted-foreground`; then a `<MetaList>` of `Subject` / `Topic` / `Code`; then a
    vertical stack (`flex flex-col items-start gap-6`) of: `<MarkReadButton />`, a
    `Preview the follow-up check` link (only if `scenario.verification`), and a
    `Learn more about this` link (only if `learnHref`).
- **Behaviour:** BLUEPRINT §4.1. Mark-as-read shows a toast and returns to `/student`. It
  persists nothing; the toast wording claims it can be found again from My insights, which is not
  implemented. **Keep the existing copy and behaviour verbatim** rather than inventing a fix.
- **States:** a scenario with no `studyNote` 404s.

---

## 10.7 `/student/learn` — the Learn hub

- **File / kind:** `app/student/learn/page.tsx`, **client** (filter state).
- **Masthead:** label `Learn`. title `Every misconception we know about.` lede
  `Browse the full catalogue across all three subjects, whether or not you have ever been diagnosed with one.`
- **Data:** `CATALOGUE`, `SUBJECTS`, `learnPageHref`.
- **Composition:**
  1. Masthead.
  2. A sticky filter bar: `<div className="sticky top-[var(--topbar-h)] z-20 border-b border-border bg-background">`
     containing a `<FilterStrip>` with `All` / `Mathematics` / `Physics` / `Chemistry` (counts
     from `CATALOGUE`), and beside it a plain toggle button
     `<button className="label ...">Only built out</button>` with `aria-pressed`, whose active
     state adds a 2px accent underline.
  3. Grouped output. Subjects in the fixed order Mathematics, Physics, Chemistry; **omit a
     subject with zero matches entirely.** For each: `<GroupHeading count={n}>{subject.name}</GroupHeading>`
     then a `border-t border-border` list of rows, one per catalogue entry:
     - mono code in `text-faint`, name at `text-xl font-semibold tracking-tight`, description at
       `text-base text-muted-foreground`.
     - If `learnPageHref(subject, code)` exists → the whole row is a `<Link>` with the hover
       underline and a trailing `<Label tone="accent">Open</Label>`.
     - If not → a plain `<div>` at `opacity-55`, no hover, trailing
       `<Mark bucket="inert">Notes coming soon</Mark>`.
- **Behaviour:** BLUEPRINT §4.1 and §7. **The hub does not gate on validation status** — a
  `pending` or `catalogued-only` misconception is listed identically to a `validated` one. Only
  page availability changes the trailing state. Three pages exist: `mathematics/M4`,
  `physics/M1`, `chemistry/M2`.
- **States:** if the filters produce nothing, render an `<EmptyState title="Nothing matches those filters." />`.

---

## 10.8 `/student/learn/[subject]/[code]` — a concept page

- **File / kind:** `app/student/learn/[subject]/[code]/page.tsx`, **server**. Keep
  `generateStaticParams`.
- **Masthead:** label `Concept`. title `{page.title}`. meta slot: a `<MetaList>` of
  `Subject` / `Code`, plus a `Start a diagnostic` link to `/student/start`.
- **Data:** `getLearnPage(subject, code)`.
- **Composition:** three stacked sections, each `bordered`:
  1. **Notes.** `<div className="prose-editorial">` with `<h2>What this is</h2><p>{whatItIs}</p>
     <h2>How to think about it</h2><p>{howToThink}</p>`. Then the worked example as a
     `<MetaList>` of four rows: `Prompt` / `The usual slip` / `The fix` / `Answer`, from
     `page.example.{prompt,wrongMove,rightMove,answer}`. Give the `Answer` row's value
     `className="text-accent font-mono"`.
  2. **Resources.** `<GroupHeading>Recommended resources</GroupHeading>` then
     `<ResourceFinder query={page.searchQuery} resources={page.resources} />`.
  3. **Ask about this concept.** `<GroupHeading>Ask about this concept</GroupHeading>` then
     `<ConceptChat chat={page.chat} />`.
  Give sections 1 and 2 `id="notes"` and `id="resources"` so the chat's footer shortcuts still
  jump to them.
- **Behaviour:** BLUEPRINT §4.1. The resource list shows a scripted "searching" pause then a
  fixed, pre-ranked list; there is no search box, filter or sort. The chat is concept-scoped and
  separate from the general consultant.
- **States:** an unknown subject/code pair 404s.

---

## 10.9 `/student/insights` — learning pace

- **File / kind:** `app/student/insights/page.tsx`, **server**.
- **Masthead:** label `My insights`. title `How quickly things get fixed.` lede
  `This is not a grade. It is how long your resolved misconceptions took, next to the class median for the same subject.`
- **Data:** `STUDENT_PACE` from `@/fixtures/insights/student-pace`.
- **Composition:** `<Split ratio="8/4" sticky>`:
  - **primary:** one block per `STUDENT_PACE.rows` entry, separated by `border-b border-border`,
    each containing:
    - `<Label tone="muted">{row.subject}</Label>`
    - the `row.label` at `text-2xl font-semibold tracking-tight`
    - a `<MetricCard>` -style pair: `{row.daysToResolve}` days in mono `text-5xl`, and beneath
      it the comparison `` `Class median ${row.classMedianDays} days` `` with an
      `ArrowDownRight` in `text-accent` when `daysToResolve < classMedianDays`, a
      `Minus` in `text-muted-foreground` when equal, and `ArrowUpRight` in `text-attention`
      when slower. **Fewer days is always the favourable direction.**
    - the `row.evidence` sentence at `text-sm text-muted-foreground`.
  - **secondary:** a `<Callout kicker="Pattern-based suggestion" title={STUDENT_PACE.suggestion.text} />`
    wait, `suggestion.text` is a paragraph, not a title. Instead: a `border-t-2 border-t-accent pt-8`
    block with `<Label tone="accent">Pattern-based suggestion</Label>`, the `suggestion.text` at
    `text-base leading-relaxed`, the `suggestion.evidence` array as a `border-t border-border`
    list of `text-sm text-muted-foreground` rows, then `suggestion.sharedWith` at
    `text-sm text-muted-foreground`, then a `Ask the consultant about this` link to
    `/student/consultant`.
- **Behaviour:** BLUEPRINT §4.1. The only computed thing is the faster/same/slower comparison of
  two fixed numbers.
- **States:** the fixture always has two rows. Still, if `rows.length === 0`, render
  `<EmptyState title="No resolved cases yet." body="Once a misconception has been diagnosed and checked, its pace shows up here." />`.

---

## 10.10 `/student/consultant`

- **File / kind:** `app/student/consultant/page.tsx`, **server** wrapper that renders the client
  `<ChatConsultant>`.
- **Composition:** `<ChatConsultant config={STUDENT_THREAD} label="Ask the consultant" />`.
- **Data:** `@/fixtures/consultant/student-thread`.
- **Behaviour:** BLUEPRINT §5. Greeting, chips that disappear once asked, exact-match
  case-insensitive free text, a persona fallback, a fixed typing delay, input disabled while
  pending, nothing persists between visits.
- **States:** shared chat states only.

---

<!-- APPEND-MARKER -->

