# Overhaul Plan — `sonder-web`

## Fixing the three things the first implementation got wrong

**Target:** `D:\FYP\Sonder\brain-ui\sonder-web\` — the only writable folder. `brain-extract-anatomy\`
and `FYP_POC_UI\` stay READ ONLY, exactly as before.

**Supersedes:** `docs/IMPLEMENTATION-PLAN.md` sections **12** (the product sweep) and **10.4** (the
showcase) only. Everything else in that document still stands: the token layer, the ported landing
engine, the type system, the accent-discipline rule, the em-dash ban, the licensing notes. **Read
this document alongside it, not instead of it.** Where the two disagree, this one wins.

**State at the start of this plan:** `npm run build` is clean, all 27 routes prerender, the landing
hero / vine / brain all work. Nothing here is a bug fix. This is a design overhaul.

---

# PART 0 — What went wrong, with evidence

Three problems, in order of how much they cost.

## 0.1 The product was re-skinned, not designed

The previous plan's §12 was a token sweep. `git diff --stat` over the 44 product files shows 614
insertions and 428 deletions, and reading them shows almost every one is a class-string swap:

```
-className="group rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-foreground/25"
+className="notch surface-shadow group border border-border bg-card p-4 transition-colors hover:border-sonder-rim/30 hover:bg-sonder-rim/[0.04]"
```

The colours changed. The **layouts did not**. And the layouts were the problem, because:

> **All 26 product pages are the same page.** Every one is `<PageShell title description>` followed
> by a vertical stack of `<Surface>` cards, card grids and the occasional table. A class dashboard, a
> reading surface for a 13-year-old, an escalation worklist, a provenance audit log and a diagnostic
> question all render as the same object.

`taste-skill` bans re-using one layout family more than once across the eight sections of a single
page. This product re-uses one layout family across **twenty-six pages**. That is the single biggest
reason the build does not feel designed, and no amount of token work fixes it.

Concrete symptoms visible in the current code:

| Symptom | Where | Why it is wrong |
|---|---|---|
| Three boxed numbers in a row at the top | `/teacher`, `/admin` | The most generic dashboard opening on the web. At `VISUAL_DENSITY 7`, generic card containers around metrics are banned outright; numbers should breathe in plain layout separated by 1px rules. |
| Prose set inside a bordered card | `/student/remediation`, `/parent/summary/[id]` | Good typography (16.5px / 1.72, 68ch) inside the wrong container. An article in a box reads as a widget, not as something written for you. |
| Eight stacked mega-cards as a queue | `/teacher/escalations`, `/admin/coverage`, `/admin/provenance` | A worklist is a scan-then-inspect task. Stacking full detail for every item forces the reader to scroll past four screens of detail they did not ask for. |
| The step scrubber buried in a section heading | `/teacher/session/[scenario]` | The entire job of the evidence panel is stepping through time. Its primary control is currently two 28px chevron buttons in a heading row, below the fold on a laptop. |
| Full app chrome around a single question | `/student/session/...`, `/student/verify/...` | A student answering a diagnostic question sees a sidebar, a breadcrumb, a role switcher and a theme toggle. Every one of them is a way to fail the task. |
| Chat inside normal page flow | `/student/consultant`, `/teacher/consultant` | The composer scrolls away with the page. Chat needs a pinned composer and a scrolling transcript. |

## 0.2 The landing swallowed the product

`ShowcaseStage` is **400vh** of pinned, scrubbed parade that renders miniature live copies of all
four roles' screens. Combined with a roughly 15-viewport landing, the site reads as "the whole
project is page one" even though 27 real routes exist behind it. The showcase was also the second
four-up role grid on the page: `EnterSection` is the first. Two four-card role grids on one landing
is a layout repetition the previous plan's own audit should have caught and did not.

## 0.3 There are two unrelated navigation systems, and neither is the one that was asked for

`LandingNav` is a flat fixed bar that exists only on `/`. Every product route falls back to
`AppShell`'s flush, full-height, opaque left sidebar inherited unchanged from `FYP_POC_UI`. Nothing
floats. Nothing is glass. Walking from `/` into `/student` changes navigation systems entirely.

---

# PART 1 — Decisions locked for this overhaul

These were chosen explicitly. Do not revisit them.

| # | Decision | Consequence |
|---|---|---|
| **D-1** | **Floating glass rail on the left.** The flush sidebar becomes a detached, floating, glass rail with a margin on all four sides. It keeps grouped navigation, which teacher and admin need. | `AppShell` is rebuilt around `GlassRail` + `GlassTopBar` + a mobile `GlassBottomBar`. |
| **D-2** | **The pinned showcase is replaced by a compact link-out grid**, and that grid is **merged into `EnterSection`**. | `ShowcaseStage` and all four vignette files are deleted. The landing drops from 8 sections to 7 and from about 15 viewports to about 11. |
| **D-3** | **Delivered as a written plan.** | Nothing in `sonder-web` is edited by the author of this document. |

**Why D-2 merges rather than adds a section.** A separate showcase grid plus the existing
`EnterSection` would put two four-up role grids on one page, which is the exact repetition the
design rules forbid. Merging them produces one section that does both jobs: each card carries the
role's claim (what the showcase said), the person and context (what Enter said), a primary action
that signs you in and goes to that role's home, and a secondary link into the one screen that proves
the claim. The landing states its points and hands off; the product proves them.

---

# PART 2 — The glass system

## 2.1 Honesty note

There is **no official Apple Liquid Glass package for the web**. Apple documents Liquid Glass for
Apple platforms only. What follows is a **web glassmorphism approximation**: `backdrop-filter`,
translucent fill, a layered inner border and a top highlight. Say so in a comment at the top of the
CSS block. Do not name a class `liquid-glass` in a way that implies an Apple API; the class names
below are `sonder-glass*`.

Glassmorphism carries a **conditional accessibility risk**: text over a blurred, moving backdrop can
fall below contrast. Three mitigations are mandatory and are specified below: a dark enough fill, a
`@supports` fallback, and a `prefers-reduced-transparency` fallback.

## 2.2 Why glass works here and would not work on a flat page

Glass needs something behind it to refract, or it is just a grey box. In this build it has two real
backdrops:

- **On the landing**, the `AetherFlow` canvas: a moving 220-particle network over a 24px grid. Glass
  over that is genuinely alive.
- **In the product**, `.sonder-grid-soft`: a 24px lattice that scrolls under the fixed chrome, plus
  the page content itself passing beneath. The grid is what stops the product's glass reading flat.

This is why the rail and the top bar must be **`position: fixed` with content scrolling underneath
them**, not `sticky` inside a padded column. If content does not pass behind the glass, do not use
glass.

## 2.3 Tokens — append to `app/globals.css`

Add to the `:root` brand-primitive block from the original plan:

```css
  /* ---- glass (web approximation of a frosted-glass material, not an Apple API) ---- */
  --glass-blur: 20px;
  --glass-saturate: 140%;
  --glass-radius: 20px;
  --glass-gutter: 12px;
```

Add a new block immediately after the `.dark { ... }` block:

```css
/* Light-mode glass. Defined on :root so it is the default. */
:root {
  --glass-bg: rgba(255, 255, 255, 0.66);
  --glass-bg-solid: #ffffff;              /* the no-backdrop-filter fallback */
  --glass-border: rgba(18, 20, 15, 0.1);
  --glass-highlight: rgba(255, 255, 255, 0.9);
  --glass-shadow: 0 18px 44px -22px rgba(18, 20, 15, 0.34);
}

/* Dark-mode glass. Deliberately DARK, not the rgba(255,255,255,0.15) that most
   glassmorphism snippets use: a light film over a charcoal ground drops body text
   under 4.5:1 the moment anything bright scrolls behind it. */
.dark {
  --glass-bg: rgba(20, 22, 18, 0.62);
  --glass-bg-solid: #161814;
  --glass-border: rgba(232, 255, 224, 0.1);
  --glass-highlight: rgba(232, 255, 224, 0.1);
  --glass-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
}
```

## 2.4 The `.sonder-glass` utility — append to the utilities block

```css
/* ---------------------------------------------------------------------- glass
 * Web glassmorphism approximation. NOT Apple Liquid Glass, which is an Apple
 * platform material with no public web implementation.
 *
 * Three layers make it read as a physical edge rather than a blurred rectangle:
 *   1. the translucent fill + backdrop blur          (the pane)
 *   2. a 1px border                                   (the cut edge)
 *   3. an inset top highlight                         (light catching that edge)
 * Remove any one of them and it flattens.
 */
.sonder-glass {
  position: relative;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  border: 1px solid var(--glass-border);
  border-radius: var(--glass-radius);
  box-shadow:
    inset 0 1px 0 var(--glass-highlight),
    var(--glass-shadow);
}

/* A brighter sliver along the top edge only. This is the difference between
   "blurred div" and "pane of glass". Keep it subtle; at more than 0.14 alpha in
   dark mode it starts to look like a border, not a highlight. */
.sonder-glass::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--glass-highlight) 60%, transparent) 0,
    transparent 42%
  );
  opacity: 0.55;
}

/* Fallback 1: browsers without backdrop-filter get an opaque pane. Without this
   the nav is a semi-transparent hole and the text behind it shows through. */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .sonder-glass {
    background: var(--glass-bg-solid);
  }
}

/* Fallback 2: a user who has asked for less transparency gets none. Support for
   this query is uneven, which is exactly why fallback 1 exists as well. */
@media (prefers-reduced-transparency: reduce) {
  .sonder-glass {
    background: var(--glass-bg-solid);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .sonder-glass::before { display: none; }
}
```

**Contrast rule for anything placed on glass.** Body and label text on `.sonder-glass` must use
`--foreground` or `--muted-foreground`, never a further-reduced alpha. In dark mode the fill is
`rgba(20,22,18,0.62)` over a `#121212` ground, whose worst realistic composite is about `#2A2C26`;
`--sonder-paper` on that is roughly 11:1 and `--sonder-muted` is roughly 4.9:1. Both pass AA. Any
value dimmer than `--muted-foreground` does not, so **do not put `text-muted-foreground/60` on
glass.**

---

# PART 3 — Navigation: `GlassRail`, `GlassTopBar`, `GlassBottomBar`

`AppShell` is rebuilt. `lib/nav.tsx`, `lib/roles.tsx` and `lib/session.tsx` are **not touched**.

## 3.1 Geometry

```
:root {
  --rail-w: 232px;              /* expanded */
  --rail-w-collapsed: 64px;
  --topbar-h: 52px;
}
```

Both `--sidebar-width` and `--sidebar-width-collapsed` from the original tokens are now unused;
delete them and their two references.

```
┌──────────────────────────────────────────────────────────────┐
│  12px gutter on every side, all round                        │
│   ╭──────────╮   ╭──────────────────────────────────────╮    │
│   │          │   │  Teacher / Session / B      ☾  ⟨IS⟩ │    │  ← GlassTopBar, fixed
│   │  ◜S      │   ╰──────────────────────────────────────╯    │
│   │          │                                               │
│   │  ▸ Home  │     Class dashboard                           │
│   │  ▸ Esc.  │     ─────────────────────────────────────     │
│   │  ▸ Rev.  │     content scrolls UNDER both glass panes    │
│   │  ▸ Ask   │                                               │
│   │          │                                               │
│   │  ⟨ ⟩     │   ← collapse toggle, pinned to rail bottom    │
│   ╰──────────╯                                               │
└──────────────────────────────────────────────────────────────┘
```

- Rail: `position: fixed; top: 12px; bottom: 12px; left: 12px; width: var(--rail-w);` plus
  `.sonder-glass`, `border-radius: var(--glass-radius)`, `z-index: 40`.
- Top bar: `position: fixed; top: 12px; right: 12px; left: calc(var(--rail-w) + 24px); height: var(--topbar-h);`
  plus `.sonder-glass`, `z-index: 40`.
- Main: `margin-left: var(--rail-w); padding-top: calc(var(--topbar-h) + 24px); padding-bottom: 48px;`
- The width transition is `width 260ms var(--ease-sonder)` on the rail and `left 260ms var(--ease-sonder)`
  on the top bar, driven by a `data-collapsed` attribute on `<html>` so both animate in lockstep from
  one class write. **Do not animate them independently**; they will visibly desynchronise.

## 3.2 `components/app/GlassRail.tsx`

Replaces `SidebarBody` and `SidebarLink`.

- **Top:** `<Link href="/">` wrapping `<BrandMark size={20} withWordmark={!collapsed} />`, 16px padding.
- **Under it, when expanded:** the role label in `.eyebrow text-muted-foreground/70`
  (`{ROLES[role].label} workspace`). Hidden when collapsed.
- **Groups:** unchanged data from `NAV[role]`. Group label in `.eyebrow` at 11px, hidden when
  collapsed; when collapsed, a 1px `--glass-border` rule separates groups instead, so grouping
  survives the icon-only state.
- **Items:** 40px tall, `border-radius: 10px`, icon 16px, label 13px.
  - Inactive: `text-muted-foreground`, hover `bg-[color-mix(in_srgb,var(--sonder-rim)_8%,transparent)] text-foreground`.
  - **Active:** `text-foreground`, `bg-[color-mix(in_srgb,var(--sonder-rim)_10%,transparent)]`, plus
    a 2px neon rule pinned to the item's left edge via `::before` with `inset-block: 8px; left: 0; width: 2px; background: var(--sonder-rim)`. This is accent job 2 and it is the same growing-line idea as the vine.
  - Collapsed items keep the existing `Tooltip` on the right.
- **Bottom:** the collapse toggle, 36px tall, `.eyebrow` label when expanded, icon only when
  collapsed, separated by a 1px `--glass-border` rule. Keeps `useLocalFlag("sonder.sidebar.collapsed")`
  exactly as it is.
- **Scroll:** the group list is `overflow-y-auto` with `.app-scroll`; brand and toggle do not scroll.

**Accessibility:** `<nav aria-label="{role} workspace">`; the active item carries `aria-current="page"`.
Every item is at least 40px tall and the rail's 12px gutter guarantees 8px+ separation from the
viewport edge.

## 3.3 `components/app/GlassTopBar.tsx`

Contents, left to right: the existing `<Breadcrumb />`, then a spacer, then `<ThemeToggle />`, then
the existing `RoleMenu`. Height 52px, horizontal padding 14px, `gap: 10px`.

Move `RoleMenu` out of `AppShell.tsx` into this file unchanged. Its dropdown must render above the
glass: give `DropdownMenuContent` no special treatment, but set the top bar's `z-index: 40` and
confirm the Base UI portal lands at a higher layer (it portals to the body, so it will).

On mobile (`< 768px`) the top bar keeps breadcrumb + theme + role menu but drops to
`left: 12px` since there is no rail.

## 3.4 `components/app/GlassBottomBar.tsx` — mobile navigation

**The hamburger drawer is deleted.** Below 768px the rail is replaced by a floating glass bar pinned
to the bottom: `position: fixed; bottom: 12px; left: 12px; right: 12px; height: 60px;` plus
`.sonder-glass`.

- It renders the **flattened** item list for the current role (groups collapse away).
- Every role fits the 5-item bottom-navigation limit exactly: student 5, teacher 4, parent 1,
  admin 5. Verify against `lib/nav.tsx` before building; if a role ever exceeds 5, the fifth slot
  becomes a "More" sheet rather than a sixth icon.
- **If a role has fewer than 2 items, render nothing.** Parent has one; a one-item bottom bar is
  furniture, not navigation. Parent navigates from the top bar and from in-page links.
- Each item is a vertical icon-over-label stack, at least 44x44px, label at 10px. Active gets
  `text-sonder-rim` plus a 2px neon rule **above** the icon (mirroring the rail's left rule, rotated
  to match the bar's orientation).
- Main gets `padding-bottom: 84px` below 768px so content clears it.
- `env(safe-area-inset-bottom)` is added to the `bottom` offset so it clears an iPhone home
  indicator: `bottom: calc(12px + env(safe-area-inset-bottom, 0px))`.

## 3.5 `components/app/AppShell.tsx` — the rebuild

```tsx
// The bare check is unchanged: the landing and the dev gallery carry no chrome.
const bare = pathname === "/" || pathname.startsWith("/dev");
if (bare) return <>{children}</>;
```

Then:

```
<div className="sonder-grid-soft min-h-dvh bg-background">
  <GlassRail />                                     {/* fixed, hidden below md */}
  <GlassTopBar />                                   {/* fixed */}
  <main id="main" className="app-main">
    <div key={pathname} className="page-enter">{children}</div>
  </main>
  <GlassBottomBar />                                {/* fixed, md:hidden */}
</div>
```

**Four things that change from the current implementation and matter:**

1. **The scroll container moves from `main` to the document.** The current shell is
   `h-dvh overflow-hidden` with an inner `main.app-scroll.overflow-y-auto`. Fixed glass chrome plus
   an inner scroller means content scrolls *inside* a box while the chrome floats *outside* it, and
   the blur then has nothing moving behind its edges. Let the document scroll. Move `.app-scroll`'s
   scrollbar styling onto `html` for product routes via a `[data-shell="product"]` attribute set by
   `AppShell`, so the landing keeps its own scrollbar treatment.
2. **Lenis must stay off here.** `Landing`'s effect already calls `destroySmoothScroll()` on unmount.
   Because the product now scrolls the document, a Lenis instance that survived would hijack it for
   real. Re-verify item 14 of the verification matrix after this change; it is no longer a
   theoretical leak.
3. **A skip link is added** as the first focusable element in `AppShell`: "Skip to content",
   targeting `#main`. The rail has up to 8 tab stops before content; without this a keyboard user
   pays them on every navigation.
4. `--header-height` is replaced by `--topbar-h`. Grep for `--header-height` and remove the two
   remaining uses.

## 3.6 The landing nav is aligned, not replaced

`LandingNav` keeps its structure, its `IntersectionObserver` sentinel and its skip link. Two changes:

- Its `[data-scrolled]` state now applies `.sonder-glass` instead of the ad-hoc
  `background: rgba(18,18,18,0.72); backdrop-filter: blur(14px)` currently in `landing.css`. One
  glass definition for the whole site.
- It becomes a **floating pill** rather than a full-width bar, to match the product chrome:
  `top: 12px; left: 12px; right: 12px; border-radius: var(--glass-radius);` and `max-width: 1180px;
  margin-inline: auto;`. Before it acquires `data-scrolled` it is fully transparent with no border,
  no shadow and no blur, so the hero is untouched.
- Its centre links become **two**, not three: `The premise` and `The guarantee`. `The product` is
  removed because the showcase section it pointed at no longer exists. Two links plus brand plus CTA
  keeps the pill on one line down to 900px.

---

# PART 4 — The page-archetype system

This is the part that was missing. It is the actual design work.

## 4.1 The rule

> **Seven archetypes. Every product route is assigned exactly one. A route may not invent an eighth.**

An archetype is not a skin. It is a different information architecture chosen because the page has a
different job. The test for whether the overhaul succeeded is simple: **screenshot any four routes,
and a stranger should be able to tell which is a worklist, which is a reading surface, which is an
inspector and which is a task.** Today all four look identical.

## 4.2 The seven archetypes

| Key | Archetype | The job | Signature |
|---|---|---|---|
| **A** | **Console** | "What needs me right now?" | A lead panel carrying the single most urgent thing, a hairline metric strip (no boxes), and a full-bleed table below. |
| **B** | **Worklist** | "Scan many, inspect one." | Master-detail split: dense list left, sticky detail panel right. |
| **C** | **Inspector** | "Walk through what happened." | A pinned horizontal timeline, a sticky subject column, a scrolling trace. |
| **D** | **Focus** | "Do one thing." | Chrome suppressed, one 660px column, progress as a hairline. |
| **E** | **Reading** | "Read this properly." | No card. A 68ch measure, a lede, hairline section rules, a metadata rail. |
| **F** | **Directory** | "Find the one I want." | Sticky filter strip, grouped grid, per-entry state. |
| **G** | **Conversation** | "Ask and be answered." | Full-height transcript, pinned composer, suggestion chips above it. |

## 4.3 Route assignment — all 26 routes

| Route | Archetype | Note |
|---|---|---|
| `/student` | **A** Console | Lead panel = the follow-up check that is due. |
| `/teacher` | **A** Console | Lead panel = "needs your attention". |
| `/admin` | **A** Console | Lead panel = open coverage gaps. |
| `/parent` | **F** Directory | It is a list of summaries, not a dashboard. Only one has a real body. |
| `/student/start` | **D** Focus | Two-step chooser. Nothing else should be on screen. |
| `/student/session/[scenario]/[mode]` | **D** Focus | The diagnostic itself. |
| `/student/verify/[scenario]` | **D** Focus | One question. |
| `/student/remediation/[scenario]` | **E** Reading | The study note. |
| `/student/learn` | **F** Directory | Catalogue browse. |
| `/student/learn/[subject]/[code]` | **E** Reading | Notes plus resources plus concept chat. |
| `/student/insights` | **C** Inspector | Numbers that must be read next to their evidence. |
| `/student/consultant` | **G** Conversation | |
| `/teacher/escalations` | **B** Worklist | |
| `/teacher/content-review` | **B** Worklist | Batch triage. |
| `/teacher/content-review/agreement` | **C** Inspector | Two reviewers compared. |
| `/teacher/content-review/generation/[runId]` | **C** Inspector | Round-by-round replay. |
| `/teacher/session/[scenario]` | **C** Inspector | The flagship. |
| `/teacher/session/[scenario]/review` | **C** Inspector | Same subject, decision instead of trace. |
| `/teacher/students/[studentId]/insights` | **C** Inspector | |
| `/teacher/consultant` | **G** Conversation | |
| `/parent/summary/[id]` | **E** Reading | |
| `/admin/catalogue` | **F** Directory | |
| `/admin/coverage` | **B** Worklist | |
| `/admin/performance` | **C** Inspector | Metrics against a baseline. |
| `/admin/provenance` | **B** Worklist | An audit log. Table-first, not cards. |
| `/dev/components` | (none) | Gallery. Bare route, no shell. |
| `not-found.tsx` | **D** Focus | One message, one way out. |

Distribution: A×3, B×4, C×7, D×4, E×4, F×3. Every archetype earns its existence, and no archetype
carries more than a quarter of the product.

---

# PART 5 — The archetype shells, specified

All seven share one header. Build `PageHeader` first.

## 5.1 `components/app/PageHeader.tsx`

Extracted from today's `PageShell`, unchanged in content:

```tsx
{ eyebrow?: string; title: string; description?: string; actions?: ReactNode; tabs?: ReactNode }
```

Renders: eyebrow (`.eyebrow text-muted-foreground`), `<h1>` at
`font-display text-[26px] font-normal leading-[1.12] tracking-[-0.01em]`, description at
`text-sm text-muted-foreground` capped at `max-w-[58ch]`, actions right-aligned, then a
`h-px bg-border` rule, then optional tabs.

**`PageShell` is kept** as a thin wrapper (`PageHeader` + a centred column) because six routes are
genuinely plain, and deleting it would churn files for no gain. It is no longer the default answer.

## 5.2 Archetype A — `ConsoleShell`

```tsx
<ConsoleShell
  header={<PageHeader .../>}
  metrics={<MetricStrip .../>}      // optional
  lead={<LeadPanel .../>}           // the one urgent thing
  aside={<ReactNode/>}              // optional secondary column
>
  {children}                        // full-bleed body: table, card grid
</ConsoleShell>
```

Layout:

```
max-width 1200px, centred, px-4 sm:px-6 lg:px-8

┌ header ──────────────────────────────────────────────┐
├ metric strip (hairline separated, NO boxes) ─────────┤
│  12  Awaiting review  │  3  Escalated  │  9  Resolved│
├──────────────────────────────────────────────────────┤
│ ┌ lead panel ─────────────────────┐ ┌ aside ───────┐ │   lg:grid-cols-[minmax(0,1fr)_300px]
│ │ the single most urgent thing    │ │ where to go  │ │
│ │ .notch, glass-free, bg-card     │ │ next         │ │
│ └─────────────────────────────────┘ └──────────────┘ │
├──────────────────────────────────────────────────────┤
│  full-bleed table, no card wrapper, sticky header    │
└──────────────────────────────────────────────────────┘
```

**`MetricStrip` replaces `StatTile` everywhere. Delete `StatTile`.** Three boxed numbers in a row is
the pattern the density rule exists to prevent.

`components/app/MetricStrip.tsx`:

```tsx
<MetricStrip items={[{ label, value, tone?, hint?, href? }]} />
```

Renders a flex row that wraps, items separated by a 1px `bg-border` vertical rule
(`divide-x divide-border` on a grid at `>=640px`, stacked with `divide-y` below). Each item:
value first at `nums font-mono text-[30px] leading-none` in the tone colour, then the label under it
at `.eyebrow text-muted-foreground`. No border, no background, no shadow. `py-5`, first item has no
left padding. If `href` is given the whole item is a link with a hover underline on the label only.

`components/app/LeadPanel.tsx`: a `.notch border border-border bg-card p-5` block with
`icon`, `kicker` (`.eyebrow`), `title` (`font-display text-[18px]`), `body`, and `action`. It is
allowed a tone: `tone="info" | "warn" | "ok"` swaps the border and a 4px left rule. **One lead panel
per console, maximum.** If everything is urgent, nothing is.

**Per-route work under archetype A:**

- **`/teacher`** — Metric strip: Awaiting review / Escalated / Resolved. Lead panel: the single
  highest-priority student from `attention` (escalated beats awaiting), linking to their evidence.
  The remaining `attention` items move **into the table** as a pinned group at the top with a
  `Needs you` row-group label, instead of duplicating the table as a card grid. The three `AreaCard`s
  at the bottom stay but move into the `aside` column as a compact link list, not cards. Net effect:
  one screen instead of four.
- **`/admin`** — Metric strip: Catalogue / Open gaps / Accuracy / Provenance. Lead panel: the open
  coverage-gap warning that currently sits in an ad-hoc bordered div. `AdminTabs` stays in
  `PageHeader`'s `tabs` slot. Body: the four area links as an `aside` list.
- **`/student`** — No metric strip; a 13-year-old does not need a KPI row. Lead panel: the follow-up
  check due. Aside: "Last session" plus the three destinations as a plain link list. Body: empty.
  This makes the student home a **two-item screen**, which is what it should be.

## 5.3 Archetype B — `WorklistShell`

```tsx
<WorklistShell
  header={<PageHeader .../>}
  items={rows}                       // pre-rendered <WorklistRow/> children
  detail={<ReactNode/>}              // the selected item, rendered by the caller
  emptyState={<EmptyState .../>}
/>
```

Layout at `>= 1100px`: `grid-cols-[380px_minmax(0,1fr)] gap-6`, list column scrolls with the page,
**detail column is `sticky top-[calc(var(--topbar-h)+24px)]` with `max-height: calc(100dvh - var(--topbar-h) - 48px)` and its own `overflow-y-auto`.**

Below 1100px: the list is full width and selecting a row expands it inline as a disclosure
(`<details>`-like, but a controlled `useState` so only one is open). **Do not use a modal on
mobile** for this; these detail panels are long and a full-screen dialog with a long scroll is worse
than an inline expansion.

`components/app/WorklistRow.tsx`: a `<button>`, 1px bottom border, `py-3.5 px-3`, three lines:
1. status glyph (16px, from `StatusBadge`'s icon map) + title at `text-sm font-medium`
2. one meta line at `text-xs text-muted-foreground`, truncated to one line
3. optional right-aligned timestamp at `.eyebrow`

Selected: `bg-[color-mix(in_srgb,var(--sonder-rim)_7%,transparent)]` plus the 2px left neon rule.
**No card, no shadow, no notch.** A worklist row is a row.

**Per-route work under archetype B:**

- **`/teacher/escalations`** — Today each escalation is a 200px-tall `Surface` with the reason, the
  tied pair, an AI-suggestion box, a generation-run strip and two buttons. Split it: the row shows
  student, subject, topic, and "escalated {date}". The detail panel shows everything else. The
  AI-suggestion box keeps its `ai` violet ring and its "an idea to weigh, not a diagnosis" label
  verbatim; that disclaimer is the most important sentence on the page and must not be shortened.
- **`/teacher/content-review`** — The single separator item and the batch become **two tabs** in the
  header's `tabs` slot ("Separator item" / "Batch of {n}"), not two stacked sections. The batch tab
  is the worklist: one row per candidate question with its verdict state; the detail panel is the
  question, its options table and the three verdict buttons. The commit bar (`{n} items ready`
  + Send) becomes a **sticky footer strip** on the list column, `.sonder-glass`, so it is reachable
  without scrolling to the bottom.
- **`/admin/coverage`** — Row: subject, the pair or the misconception code, and the status chip.
  Detail: the note, the detection date, the bank counts, and the link to the generated item.
  Add a **filter strip** (`All / Open / Generating / In review / Closed`) as a segmented control
  above the list, since the page's own opening sentence is a count of open gaps.
- **`/admin/provenance`** — This is an audit log and should be a **table, not a worklist of cards**.
  Use `DataTable` (§5.9) with columns: ID (mono), Kind, Subject, Created, Generated by, Status.
  Clicking a row opens the detail panel with the purpose, the validators and the note. Add the same
  filter strip keyed on `status`. **Remove the per-row `border-t` plus `border-b` pattern**; the
  table has one divider direction.

## 5.4 Archetype C — `InspectorShell`

The most important archetype: seven routes, including the product's flagship screen.

```tsx
<InspectorShell
  header={<PageHeader .../>}
  timeline={<StepTimeline .../>}     // optional, pinned under the header
  subject={<ReactNode/>}             // sticky right column: who/what this is about
  footer={<ReactNode/>}              // decision or navigation bar
>
  {children}                         // the scrolling trace
</InspectorShell>
```

Layout at `>= 1024px`: `grid-cols-[minmax(0,1fr)_340px] gap-8`. The `subject` column is
`sticky top-[calc(var(--topbar-h)+24px)]`. Below 1024px, `subject` renders **first**, unsticky.

`components/app/StepTimeline.tsx` — the single biggest UX win in this overhaul:

```
Step  ●━━━━━●━━━━━◉━━━━━○━━━━━○      3 / 5      ‹  ›
      1     2     3     4     5
```

- A horizontal row of `totalSteps` nodes joined by a 1px rule. Past = filled `--sonder-rim` at 0.5
  alpha; current = a 9px filled dot with a 3px neon ring; future = a hollow 6px ring in
  `--border`.
- **Every node is a button** with `aria-label="Step {n} of {total}"` and `aria-current` on the
  current one. Clicking jumps. This replaces the two chevrons entirely, though the chevrons stay at
  the right as `‹ ›` for keyboard and for fine stepping.
- Left/Right arrow keys move between steps when focus is inside the timeline (`role="tablist"`,
  items `role="tab"`), which is the expected keyboard model for a stepper.
- It sits directly under `PageHeader`'s rule, inside a `sticky top-[calc(var(--topbar-h)+12px)] z-20`
  strip with `.sonder-glass` and a reduced radius (`border-radius: 12px`). It is the third and last
  glass surface in the product; do not add a fourth.
- Under reduced motion no transition is applied to the node states.

**Per-route work under archetype C:**

- **`/teacher/session/[scenario]`** — `subject` column: the student, the status badge, the engine
  outcome line, and the posterior bar set, all sticky. `timeline`: the step scrubber. Body: the
  current step's question and options at the top, then the full answer trace. `footer`: the two
  buttons, in a `.sonder-glass` sticky bar at the bottom of the content column.
  **The critical change:** the posterior currently sits in a side-by-side card with the question and
  scrolls away. Making it sticky means the reader watches the bars move as they step, which is the
  entire point of the screen and is currently impossible without scrolling back up.
- **`/teacher/session/[scenario]/review`** — Same `subject` column so the two tabs feel like one
  screen. Body: the decision options. `footer`: the Approve / Correct / Reject bar. Approve is
  `default` (paper), Correct is `outline`, Reject is `destructive`. Not neon.
- **`/teacher/content-review/generation/[runId]`** — `timeline` = the rounds. `subject` = the gap
  being closed, the target count and the running accepted total. Body = the current round's
  candidates with their scores and reject reasons. Accepted use `ok`; rejected go
  `text-muted-foreground` and dimmed, with the reason in `.eyebrow`. No strikethrough.
- **`/teacher/content-review/agreement`** — `subject` = the batch identity. Body = a **two-column
  comparison**, reviewer A against reviewer B, with rows that agree collapsed to one line and rows
  that disagree expanded and marked `warn`. Today it is a flat list that does not show agreement at
  a glance, which is the page's only job.
- **`/student/insights` and `/teacher/students/[id]/insights`** — `subject` = the pattern-based
  suggestion panel (currently an `ai`-toned section buried below the fold), sticky. Body = the
  metric rows, each with its evidence sentence directly beneath. Keep `MetricCard` here: this is the
  one place where a comparison against a baseline genuinely needs a bounded container.
- **`/admin/performance`** — `subject` = the baseline being compared against. Body = the metric
  grid. Same reasoning.

## 5.5 Archetype D — `FocusShell`

```tsx
<FocusShell
  progress={{ current: 2, total: 5 }}   // optional; renders a hairline
  exitHref="/student"                    // required; the one way out
  exitLabel="Leave this check"
>
  {children}
</FocusShell>
```

- Sets `data-focus="true"` on `<html>`. CSS on that attribute **collapses the rail to its icon-only
  width and hides the top bar's breadcrumb and role menu**, leaving only the brand mark, the theme
  toggle and a single explicit exit link. The rail is not removed: removing navigation entirely
  traps the user, and a student who wants out must not have to use the browser back button.
- One column, `max-width: 660px`, centred, `padding-block: 8vh`.
- `progress` renders a 2px full-width rule at the very top of the viewport, `--sonder-rim`, width
  `calc(current / total * 100%)`, with `role="progressbar"` and the correct `aria-valuenow`/`min`/`max`.
  **Not a numbered "Step 1 of 2" eyebrow**; the rule says it without words and the label is announced
  to screen readers.
- Cleanup is mandatory: the effect that sets `data-focus` must remove it on unmount, or every
  subsequent route renders with a collapsed rail.

**Per-route work under archetype D:**

- **`/student/start`** — Currently `eyebrow="Step 1 of 2 · Subject"`. Drop the eyebrow, use the
  progress rule. Subject cards become three large tiles in a row with the subject icon at 28px; topic
  rows keep their current list form. The "Change subject" action moves next to the title.
- **`/student/session/[scenario]/[mode]`** — The question at
  `font-display text-[22px] leading-[1.35]`, options as 56px-tall selectable rows with the neon ring
  on selection, one primary action. Nothing else on the page.
- **`/student/verify/[scenario]`** — Identical treatment, `total: 1`.
- **`not-found.tsx`** — `FocusShell` with no progress: the message and one button home.

## 5.6 Archetype E — `ArticleShell`

```tsx
<ArticleShell
  header={<PageHeader .../>}
  meta={<ReactNode/>}        // right rail at >=1280px, above the article below that
>
  {children}
</ArticleShell>
```

- Article column `max-width: 68ch`. **No `Surface`, no card, no border around prose.**
- First paragraph gets a lede treatment: `font-display text-[19px] leading-[1.66] text-foreground`,
  subsequent paragraphs `text-[16.5px] leading-[1.72] text-foreground/85`. Add a `.article-body`
  class in `globals.css` doing this with `:first-of-type`, so callers do not hand-tag paragraphs.
- Section headings inside the article: `font-display text-[17px]` preceded by a full-measure
  `h-px bg-border` rule with `margin-top: 2.5rem`. The rule is the container; the box is gone.
- `meta` rail at `>= 1280px`: `280px`, sticky, hairline left border, holding provenance (approved by,
  date), related links, and the "mark as read" action.

**Per-route work under archetype E:**

- **`/student/remediation/[scenario]`** — "What was going on" and "How to think about it" become
  article sections, not two halves of one `Surface`. The video link stays a `.notch` card: it is a
  link out, not prose. `meta` rail: the "shared with you after your teacher reviewed" provenance
  chip, `MarkReadButton`, the follow-up-check link and the learn-more link. This removes four
  buttons from the bottom of the reading flow.
- **`/parent/summary/[id]`** — The three `Section` blocks become article sections. `meta` rail: the
  approval chip and the back link. The **not-approved state stays exactly as it is** (a dashed
  `.notch` panel); it is a gate, not an article.
- **`/student/learn/[subject]/[code]`** — Notes as the article, `ResourceFinder` and `ConceptChat`
  below the article at full width under their own rules. `meta` rail: the misconception code, the
  subject, and a link to start a diagnostic on it.

## 5.7 Archetype F — `DirectoryShell`

```tsx
<DirectoryShell header={...} filters={<ReactNode/>}>{children}</DirectoryShell>
```

- `filters` renders in a `sticky top-[calc(var(--topbar-h)+12px)] z-20` strip with a
  `bg-background/85 backdrop-blur` (not full glass; three glass surfaces is the cap).
- Body is a grid the caller controls, with a `<h2>` group header per group that is itself
  `sticky top-[...]` so the subject stays visible while scrolling its section.

**Per-route work:**

- **`/student/learn`** — Add a filter strip: `All / Mathematics / Physics / Chemistry`, plus an
  `Only built out` toggle. Today a student must scroll past nine "Notes coming soon" cards to find
  the three that work. Built-out cards get a subtle `--sonder-rim` left rule; stubs go to
  `opacity: 0.55` and lose their hover.
- **`/admin/catalogue`** — Same filter strip, keyed on subject and validation status.
- **`/parent`** — Not a grid. A vertical list of summary rows, each with the approval state as the
  leading glyph. Locked rows stay visibly locked with the reason inline. `filters` is omitted: with
  three summaries a filter is furniture.

## 5.8 Archetype G — `ConversationShell`

```tsx
<ConversationShell header={...} composer={<ReactNode/>}>{transcript}</ConversationShell>
```

- `height: calc(100dvh - var(--topbar-h) - 48px)`, `display: grid`,
  `grid-template-rows: auto minmax(0,1fr) auto`.
- The transcript is the only scrolling region; the composer never leaves the viewport.
- Composer is a `.sonder-glass` block with `border-radius: 14px`, the textarea, the send button, and
  the suggestion chips **above** it in a horizontally scrollable row (`overflow-x-auto`, scroll-snap),
  so a long prompt list never pushes the input off screen.

`ChatConsultant` changes: assistant bubbles get
`bg-[color-mix(in_srgb,var(--sonder-rim)_6%,transparent)] ring-1 ring-inset ring-sonder-rim/15`,
user bubbles stay `bg-secondary`, and evidence lists under an assistant message go behind a
`Show evidence` disclosure rather than always-open, so the transcript stays scannable. The existing
`REPLY_MS` typing delay stays, but the pending indicator becomes `.sonder-draw-rule` rather than
any dot animation.

## 5.9 Shared components this overhaul adds

| File | Purpose |
|---|---|
| `components/app/PageHeader.tsx` | Extracted header, used by all shells |
| `components/app/MetricStrip.tsx` | Hairline metric row, replaces `StatTile` |
| `components/app/LeadPanel.tsx` | The one urgent thing on a console |
| `components/app/WorklistRow.tsx` | Dense selectable row |
| `components/app/StepTimeline.tsx` | Clickable stepper with keyboard support |
| `components/app/DataTable.tsx` | Sticky-header table with `overflow-x-auto`, hairline rows, one divider direction |
| `components/app/FilterStrip.tsx` | Segmented control for directory and worklist filters |
| `components/app/shells/{Console,Worklist,Inspector,Focus,Article,Directory,Conversation}Shell.tsx` | The seven archetypes |

**Deleted:** `StatTile` from `primitives.tsx` (and its `TONE` map moves to `MetricStrip`).

`Surface` survives but its role narrows: it is for **bounded objects that are genuinely cards**
(a lead panel, a video link, a metric card, a vignette). It is no longer the default wrapper for
"a chunk of page". Roughly half of today's `Surface` uses disappear.

---

# PART 6 — The landing trim

## 6.1 Delete

```
components/landing/sections/ShowcaseStage.tsx
components/landing/sections/vignettes/StudentVignette.tsx
components/landing/sections/vignettes/TeacherVignette.tsx
components/landing/sections/vignettes/ParentVignette.tsx
components/landing/sections/vignettes/AdminVignette.tsx
components/landing/sections/vignettes/fixture-copy.ts
```

The whole `vignettes/` directory goes. It is recoverable from git if the decision is ever revisited.

In `landing.css`, delete every `.showcase*` rule (roughly lines 250 to 480 in the current file,
including the `@media (max-height: 760px)` block and the reduced-motion override). In
`AetherFlow.tsx`, delete the `data-showcase-active` guard from `animate()`; nothing sets that
attribute any more and a dead attribute read every frame is a lie in the code.

In `LandingNav.tsx`, remove the `#showcase` link (§3.6).

## 6.2 Rewrite `EnterSection` as the merged workspace grid

New `id="enter"`, about 90vh, **one** eyebrow (`Enter`), which keeps the landing's eyebrow budget at
3 across 7 sections.

Header block, unchanged from today except the body:

- `.eyebrow` `text-sonder-rim/85`: **Enter**
- `font-display clamp(26px, 3vw, 40px)`: **Four workspaces. One engine.**
- Body, `max-width: 58ch`: *This build runs entirely on scripted fixture data. There is no backend,
  no authentication and no live model. Pick a workspace to walk the flow end to end, or jump
  straight to the screen that makes each point.*

Four cards, 2x2 at `>= 760px`, one column below. Each is `.notch`, `border: 1px solid var(--sonder-line-quiet)`,
`background: rgba(10, 38, 12, 0.34)`, `backdrop-filter: blur(9px)`, `padding: 22px 24px 24px`.

**Card contents, in this order** (this is what merges the showcase into Enter):

1. `.eyebrow` `text-sonder-rim/85` — the role label, uppercased
2. `font-display` 20px — **the claim**, carried over verbatim from the deleted showcase:
   - Student: *A question chosen to tell two ideas apart.*
   - Teacher: *Every diagnosis arrives with its evidence.*
   - Parent: *Nothing is shown before a teacher approves it.*
   - Admin: *When the bank falls short, it writes new questions.*
3. Body 13.5px `rgba(232,255,224,0.66)` — `ROLES[role].person` and `ROLES[role].context` on one line,
   then `ROLES[role].blurb`
4. A hairline rule
5. **Two actions**, side by side:
   - Primary, the whole card is the button: signs in and pushes to `ROLES[role].home`. Its visible
     label is the destination route in mono (`/student`) plus an arrow, per the no-duplicate-CTA rule.
   - Secondary, a nested `<Link>` in `.eyebrow` that stops propagation and goes to the **proving
     screen**: `/student/start`, `/teacher/session/B`, `/parent`, `/admin/coverage` respectively.
     Label: `See it →`.

> **Nesting an interactive element inside a button is invalid HTML.** So the card is a
> `<div role="group">`, not a `<button>`. The primary action is its own `<button>` filling the
> card's footer row, and the secondary is a sibling `<Link>`. Do not wrap the card in a button and
> put a link inside it.

Parent's proving screen is `/parent` which is also its home, so for Parent render only the primary
action. Do not ship a "See it" that goes where the card already goes.

## 6.3 Resulting landing

| # | Section | Scroll | Eyebrow |
|---|---|---|---|
| 1 | Hero | 200dvh, pinned | yes (1) |
| 2 | Premise | 70vh | yes (2) |
| 3 | Narrative (the vine) | about 570vh | node kickers, exempt |
| 4 | Mechanism | 90vh | no |
| 5 | Guarantee | 60vh | no |
| 6 | Enter | 90vh | yes (3) |
| 7 | Footer | 40vh | no |

About **11 viewports**, down from 15. Seven distinct layout families across seven sections. Eyebrow
count still 3.

The vine keeps all 570vh. It is the part the user asked to keep: the page "grows to show all the
points", each node already deep-links into the product, and it is the design that was approved.

---

# PART 7 — Execution order

Do not start a phase before the previous one builds clean.

### Phase A — Glass foundation
- [ ] A1 Glass tokens in `:root`, `.dark` (§2.3)
- [ ] A2 `.sonder-glass` utility plus both fallbacks (§2.4)
- [ ] A3 `--rail-w`, `--rail-w-collapsed`, `--topbar-h`; delete `--sidebar-width*`
- [ ] A4 `npm run build` clean

### Phase B — Navigation
- [ ] B1 `GlassRail.tsx`
- [ ] B2 `GlassTopBar.tsx` (move `RoleMenu` into it)
- [ ] B3 `GlassBottomBar.tsx`
- [ ] B4 Rebuild `AppShell.tsx`; delete the hamburger drawer; add the skip link
- [ ] B5 Move the scroll container to the document; add `[data-shell="product"]` scrollbar styling
- [ ] B6 `LandingNav` becomes a floating pill using `.sonder-glass`; drop `#showcase`
- [ ] B7 Verify every route still renders and the rail collapse state persists

### Phase C — Landing trim
- [ ] C1 Delete `ShowcaseStage` and the whole `vignettes/` directory
- [ ] C2 Strip `.showcase*` from `landing.css`; remove the `data-showcase-active` guard from `AetherFlow`
- [ ] C3 Rewrite `EnterSection` as the merged workspace grid (§6.2)
- [ ] C4 Remove `ShowcaseStage` from `Landing.tsx`
- [ ] C5 `npm run build` clean; walk the landing end to end

### Phase D — Shells and shared components
- [ ] D1 `PageHeader`
- [ ] D2 `MetricStrip` and `LeadPanel`; delete `StatTile` and fix its call sites
- [ ] D3 `WorklistRow`, `DataTable`, `FilterStrip`
- [ ] D4 `StepTimeline`
- [ ] D5 The seven shells under `components/app/shells/`
- [ ] D6 Add every new component to `/dev/components` as you build it, not afterwards

### Phase E — Route migration, in this order
Ordered so the highest-traffic and highest-risk screens are done while attention is freshest, and so
each archetype is proven on one route before being applied to the rest.

- [ ] E1 **C** `/teacher/session/[scenario]` — proves `InspectorShell` and `StepTimeline`
- [ ] E2 **A** `/teacher` — proves `ConsoleShell` and `MetricStrip`
- [ ] E3 **B** `/teacher/escalations` — proves `WorklistShell`
- [ ] E4 **D** `/student/session/[scenario]/[mode]` — proves `FocusShell`
- [ ] E5 **E** `/student/remediation/[scenario]` — proves `ArticleShell`
- [ ] E6 **F** `/student/learn` — proves `DirectoryShell`
- [ ] E7 **G** `/student/consultant` — proves `ConversationShell`
- [ ] E8 Remaining A: `/admin`, `/student`
- [ ] E9 Remaining B: `/teacher/content-review`, `/admin/coverage`, `/admin/provenance`
- [ ] E10 Remaining C: `/teacher/session/[scenario]/review`, `/teacher/content-review/agreement`, `/teacher/content-review/generation/[runId]`, `/student/insights`, `/teacher/students/[studentId]/insights`, `/admin/performance`
- [ ] E11 Remaining D: `/student/start`, `/student/verify/[scenario]`, `not-found.tsx`
- [ ] E12 Remaining E: `/parent/summary/[id]`, `/student/learn/[subject]/[code]`
- [ ] E13 Remaining F: `/admin/catalogue`, `/parent`
- [ ] E14 Remaining G: `/teacher/consultant`

### Phase F — Close out
- [ ] F1 `npm run lint`, `npm run build`, `npm test` clean
- [ ] F2 The verification matrix (§8)
- [ ] F3 The pre-flight check (§9)
- [ ] F4 Update `docs/PORT-NOTES.md` with everything this overhaul changed

---

# PART 8 — Verification

Run at 390px, 860px, 1280px and 1920px, in both themes, with reduced motion off and on.

**Navigation**
1. The rail floats with a visible 12px gutter on all four sides, and page content is visibly blurred
   where it passes behind it.
2. Collapsing the rail animates the rail width and the top bar's left edge **in lockstep**, with no
   visible desynchronisation.
3. The collapse state survives a reload.
4. Below 768px the rail is gone, the bottom bar is present for student, teacher and admin, and
   absent for parent.
5. The bottom bar clears an iPhone home indicator.
6. Tabbing from the top of any product page hits "Skip to content" first.
7. With `prefers-reduced-transparency: reduce` set, every glass surface is opaque and still legible.
8. In a browser without `backdrop-filter`, every glass surface is opaque, not see-through.

**Archetypes**
9. Screenshot `/teacher`, `/teacher/escalations`, `/teacher/session/B` and `/student/remediation/B`.
   A stranger can tell which is a console, which is a worklist, which is an inspector and which is a
   reading surface. **If any two look like the same page, the overhaul has failed its main goal.**
10. No page has a row of three boxed numbers.
11. No prose is inside a bordered card.
12. On `/teacher/session/B` the posterior bars stay visible while stepping through the trace.
13. `StepTimeline` responds to Left and Right arrow keys and every node is individually clickable.
14. On `/student/session/B/topic` the rail is collapsed, the breadcrumb and role menu are hidden,
    and exactly one exit link is present.
15. Leaving a Focus route restores the rail to its previous state.
16. On `/student/consultant` the composer never scrolls out of view.
17. Every table scrolls horizontally inside its own container at 390px, and the page does not.

**Landing**
18. The landing is about 11 viewports and contains no pinned showcase.
19. `EnterSection`'s four cards each carry a claim, and three of them carry a working "See it" link
    to the proving screen.
20. Clicking a card's primary action signs in and lands on the right role home.
21. The landing nav is a floating glass pill once past the hero, and fully transparent over it.

**Regression**
22. `git diff` still shows zero changes under `fixtures/` and to the ten product `lib/` modules.
23. All existing tests pass.
24. Navigating landing → product → landing twice leaves no duplicated ScrollTriggers, no leaked
    WebGL context, and **no Lenis instance still bound to the document** (now load-bearing, since the
    product scrolls the document).

---

# PART 9 — Pre-flight check

Additions and changes to the original plan's §17. Everything in that list still applies.

- [ ] **Seven archetypes, no eighth.** Every route maps to one row of the §4.3 table.
- [ ] **No archetype carries more than a quarter of the routes.**
- [ ] `StatTile` is deleted and no call site remains.
- [ ] Exactly **three** glass surfaces exist in the product: rail, top bar, step timeline. Plus the
      bottom bar on mobile, where the rail is absent, so the count still holds.
- [ ] Glass is never used where nothing scrolls behind it.
- [ ] No text dimmer than `--muted-foreground` sits on a glass surface.
- [ ] Both glass fallbacks present and tested.
- [ ] Zero em-dashes and en-dashes in any rendered string, verified by grep, including all new copy.
- [ ] Landing eyebrow count is still 3; product `.eyebrow` uses are labels, never section headers.
- [ ] No `window.addEventListener("scroll")` anywhere, including the new sticky panels.
- [ ] Every sticky panel has an explicit `max-height` and its own `overflow-y-auto`. A sticky column
      taller than the viewport is unreachable content.
- [ ] Every new interactive element is at least 44x44px with 8px separation.
- [ ] `FocusShell` removes its `data-focus` attribute on unmount.
- [ ] No nested interactive elements: no `<button>` inside `<button>`, no `<a>` inside `<button>`.
- [ ] The AI-suggestion disclaimer on `/teacher/escalations` is present and unshortened.
- [ ] No new dependency was installed. Still one animation library, still one icon family.

---

# PART 10 — Risks

**R1 — Moving the scroll container to the document is the riskiest change here.** It touches every
route at once. If sticky panels misbehave, check that no ancestor of a sticky element has
`overflow: hidden`, which silently disables `position: sticky` and is the single most common cause.
Do Phase B in its own commit so it can be reverted independently of Phase E.

**R2 — Glass over glass.** If the step timeline's glass strip ever scrolls under the top bar's glass,
the two blurs compound into mud. The timeline is `sticky` at `--topbar-h + 12px`, which parks it
exactly below the top bar rather than under it. Verify at 390px, where the top bar is widest.

**R3 — Seven shells is a lot of surface to get subtly wrong.** This is why Phase E is ordered so
each archetype is proven on one real route before the rest are migrated onto it. Do not batch-migrate
an archetype's remaining routes before its proving route is reviewed.

**R4 — The showcase deletion is not reversible from the plan alone.** It is reversible from git.
Note the commit hash in `PORT-NOTES.md` before deleting.
