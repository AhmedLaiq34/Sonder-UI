# Visibility & cognitive load — audit and repair plan

Status: **not started**. Scope is deliberately narrow: this plan repairs
*perceptual* defects in the shipped design system. It does not restyle the
product, does not introduce boxes, fills, shadows or radii, and **does not touch
the landing page** (`components/landing/**`, `app/page.tsx`, the hero, the vine,
the WebGL brain).

Every measurement below was computed, not estimated. Contrast is WCAG 2.x
against the relevant ground.

---

## 0. How to use this plan

1. Work the steps in numerical order. Step 1 (the palette) is the load-bearing
   one — roughly two thirds of the findings in §1 dissolve the moment it lands,
   because they are all the same bug seen from different screens.
2. Each step names the file, the exact change, and how to verify it.
3. `app/globals.test.ts` enforces that the DARK and LIGHT token blocks stay in
   one-to-one correspondence. Any token added to one **must** be added to the
   other or the suite fails. This is a feature; do not weaken the test.
4. The gate, after every step:
   ```
   npm run lint
   npx tsc --noEmit
   npm test
   ```
   Baseline at the time of writing: **18 files, 88 tests, all passing.**

---

## 1. Findings

Ranked by how much they cost a user. "Evidence" is the file you can open to
confirm the claim.

### F1 — The three text tiers are one tier · CRITICAL

**Evidence:** `app/globals.css`, dark token block (uncommitted change):

```
--foreground:       #fafafa
--muted-foreground: #fafafa   /* was #8a8a8a */
--faint:            #fafafa   /* was #4a4a4a */
```

`@theme inline` maps these straight through, so **149 `text-muted-foreground`
call sites and 16 `text-faint` call sites now render exactly the same colour as
`text-foreground`.** The light block mirrors the same collapse onto `#1a1a1a`.

**Why this is the most expensive defect in the build.** This design system
deleted every other channel for expressing importance. There are no boxes
(`Section` separates with rules), no fills, no shadows (`--shadow-*` are all
`0 0 #0000`), and no radii (a base-layer `border-radius: 0 !important`). That is
a coherent and good decision — but it means rank is carried by exactly two
channels: **type size** and **colour value**. Removing the colour channel leaves
size alone, and inside a single block (a row, a table cell, an evidence step)
size is roughly constant. What is left to separate a label from its value is
`font-weight: 400` vs `500` — a difference below the threshold at which a
scanning reader forms groups. The result is that the reader parses every screen
by reading it, rather than by looking at it.

Seven concrete consequences, each verifiable on its own:

| # | Where | What breaks |
|---|---|---|
| a | 25 sites carrying `text-muted-foreground … hover:text-foreground` | The hover is a **no-op**. Dead on the top-bar links, `Breadcrumb` crumbs, `WorkspaceNav` items, `StepTimeline` chevrons, the `ghost` button variant, the `RoleMenu` trigger, the `FocusFrame` exit link. |
| b | `components/shared/StatusMark.tsx` | `pending` is `text-foreground`, `inert` is `text-muted-foreground`. **Two of the four status buckets are now the same colour.** Only the `Clock` vs `Minus` glyph separates "Awaiting review" from "Catalogued only". |
| c | `components/shared/PosteriorBarSet.tsx` | Leader bar `bg-foreground` vs the rest `bg-muted-foreground` — same colour. Leader `%` vs the rest — same colour. **The core visualisation of the entire product loses its leader signal in the `gathering` state**, which is the state it spends most of a session in. Only bar width is left. |
| d | `components/type/LayeredNumber.tsx` | An `aria-hidden`, 128–160px decorative numeral, explicitly documented as "depth without shadows", is now **full-contrast white sitting behind live content**. It competes with the thing it was meant to sit behind. |
| e | `components/app/RouteTabs.tsx` | The `disabled` tab uses `text-faint` and now reads at the same value as the **active** tab. A disabled destination and the current page look alike. |
| f | `components/shared/EvidenceStep.tsx` | `"Answered "` and the answer value are the same colour; the `00`/`01` step indices no longer recede. On the teacher's evidence trail — the densest screen in the build — every token in the row has equal weight. |
| g | `components/app/Breadcrumb.tsx` | The `/` separators (`text-faint`, `aria-hidden`) match the crumbs. The trail becomes an unbroken run of uniform white uppercase mono. |

**On why the change was probably made.** `#8a8a8a` is 5.04:1 — legal, but thin
and slightly washed at 11px mono, which is where most of this build's secondary
type lives. The instinct to brighten it was right. The mistake was going all the
way to `--foreground` instead of stopping at a value that is both clearly
readable *and* clearly subordinate. §3 picks that value by measurement.

### F2 — The one structural device in the system sits at 1.15:1 · CRITICAL

**Evidence:** `--border: #262626` on `--background: #1a1a1a` → **1.15:1**.
Light: `#e6e6e6` on `#fafafa` → **1.20:1**.

Because boxes were removed, `border-border` *is* the grouping grammar:
`ListRow`, `LinkRow`, `DataTable` rows, `MisconceptionCard`, `EvidenceStep`,
`Section bordered`, `SectionRule`, `PosteriorBarSet`, the `StatRow` cell
dividers and every sticky bar's bottom edge all rely on it.

At 1.15:1 that line is at or below reliable perception on a laptop panel viewed
off-axis, on a dimmed screen, or on a projector — which is how a final-year
project actually gets shown. When the hairline drops out, a table of eight
students stops being eight rows and becomes a column of text, and the reader has
to re-derive the row boundaries from alignment. That is exactly the work the
hairline existed to do.

This is not an argument for boxes. A hairline at 1.4:1 is still a hairline.

### F3 — Hover and selection are a 1.11:1 fill · HIGH

**Evidence:** `--muted: #232323` on `#1a1a1a` → **1.11:1**. Light `#f0f0f0` on
`#fafafa` → **1.09:1**. Used at 20 sites as `bg-muted` (selected) and 11 as
`hover:bg-muted`.

Selected states survive, because `ListRow`, `DataTable`, `MisconceptionCard`,
`EvidenceStep` and `RoleMenu` all pair the fill with a 2px accent rule on the
left edge, and that rule carries the state on its own.

**Hover has no second cue.** So on the teacher roster, the escalation queue's
master list, the session answer options and the role menu, moving the pointer
over a row produces essentially nothing. Two costs follow: the user cannot tell
which row the pointer is on before committing, and — worse — **a clickable row
is indistinguishable from a static one**, because the only thing that would have
advertised interactivity is the hover response. On `/teacher`, `DataTable` rows
are clickable; on `/admin/provenance` equivalent-looking rows are not.

### F4 — The first screen of a dashboard carries almost no information · HIGH

**Evidence:** `/teacher` at 1440×900 (a 1080p laptop after browser chrome),
measured from the component classes:

| Element | Height |
|---|---|
| Top bar (`--topbar-h` at ≥768px) | 80 |
| `PageMasthead` `pt-16` | 64 |
| `Label` | 15 |
| `mt-6` | 24 |
| `h1` `scale="hero"` (`lg:text-7xl` = 96px × `leading-tight` 1.1) | 105 |
| `mt-8` + `AccentBar` + `mt-8` | 66 |
| lede, `text-lg`/`leading-relaxed`, 2 lines | 63 |
| `mt-20` + `SectionRule` | 81 |
| `Section size="tight"` `py-20` | 80 |
| **Running total before the first number** | **≈ 578** |
| `StatRow` cell (`py-10`, `text-4xl` value, label) | ≈ 150 |
| `Section size="tight"` `py-20` (next section's top pad) | 80 |
| **`Callout` — "Needs your attention" — starts at** | **≈ 890** |

So the single most important object on the teacher's dashboard begins at the
fold or just past it, and the roster table's first row lands near **1400px**.

The masthead consumes ~46% of the first viewport to announce "Class dashboard" —
a fact the sidebar's active item, the breadcrumb and the page title already state
three other times. A poster opening is right for a *reading* surface (a study
note, a parent summary, a learn concept). On a *triage* surface its cost is a
scroll before the user can answer the only question they came with: what needs
me?

The same arithmetic applies to `/student`, `/parent` and `/admin` — all four
role homes use `scale="hero"`.

### F5 — Role identity is carried only by a person's name · MEDIUM

**Evidence:** `components/app/RoleMenu.tsx` renders `current.person` in the
trigger — "Imran Shah", "Nadia Qureshi", "Sana Malik", "Zara Qureshi". The role
word appears only *inside* the opened menu. `WorkspaceNav`'s
"`{meta.label}` workspace" caption is hidden when the sidebar is collapsed, and
collapse persists across sessions.

Role switching is instant, available everywhere, and is the central mechanic of
the demo. A user who has just switched — or who returns to a collapsed sidebar —
can be looking at a screen with **no plain statement of which role they are in**,
only a name they must map back to a role from memory. Four personas is four
mappings to hold, for no benefit.

### F6 — Admin navigation is duplicated, in two different orders · MEDIUM

**Evidence:**

- `lib/nav.tsx` sidebar: Overview · *Content:* Catalogue, Coverage, Provenance · *Insight:* Performance
- `app/admin/Tabs.tsx`: Overview, Catalogue, Coverage, Performance, Provenance

The same five destinations, presented twice on every admin screen, with
different grouping, different order, and different active-state treatment (a
left accent bar vs an underline). The reader's first job on each page is to work
out that these are the same set — pure overhead.

The teacher's `SessionTabs` are *not* this: Evidence / Review / Student insights
are sub-views of one scenario and are not in the sidebar. That is correct
contextual sub-navigation and stays.

### F7 — Primary actions read as labels · MEDIUM

**Evidence:** `buttonVariants()` primary is `text-accent`, `uppercase`,
`tracking-wider`, `font-semibold`, `px-0`, `text-sm`. `.label` — used for
kickers, group captions, nav captions, table headers, breadcrumbs and status
marks — is `uppercase`, `0.2em` tracking, mono, 11px.

The two occupy the same visual family: small, uppercase, wide-tracked. The
accent colour is the only separator, and accent is also used for `Label
tone="accent"` (every masthead kicker), the `AccentBar`, and `SectionRule`'s
tick. So on `/student`, the primary call to action — "Start a diagnostic" — is
~14px uppercase accent text below a 96px headline, in a page whose kicker is
also uppercase accent text.

Text-first buttons are a deliberate and defensible choice; this plan does not
propose filled buttons. But a text button still has to out-rank the labels
around it.

### F8 — `--faint` is asked to be two incompatible things · MEDIUM

**Evidence:** the 16 `text-faint` sites split cleanly in two:

- **Pure decoration, `aria-hidden`:** `LayeredNumber` (128–160px), `Breadcrumb`
  separators.
- **Small but genuinely readable:** misconception codes (`M1`) in
  `MisconceptionCard`, `ReviewPanel`, `/student/learn`, teacher student
  insights; `FilterStrip` counts; `RoleMenu` route hints; `RouteTabs` disabled
  labels; `SessionClient` / `VerifyClient` option letters.

One token cannot be both. The committed `#4a4a4a` is **1.96:1** — far too low
for the readable half. The working tree's `#fafafa` is far too high for the
decorative half. The token needs splitting.

### What is already right

Worth stating, because the plan must not damage it:

- The focus lock (`*:focus-visible` with `!important`) guarantees a visible
  focus ring on every focusable element, defeating the `outline-none` in the
  shadcn primitives. Keep it exactly as is.
- `--border-strong` at 3.03:1 correctly meets WCAG 1.4.11 for control
  boundaries, and `Input`, `Textarea` and the chip buttons all use it.
- Status is never colour-alone: every `Mark` pairs a glyph with a word, the tie
  state in `PosteriorBarSet` adds a hatch *and* the word "Tied", and
  `OutcomeBanner` varies rule weight, label and type family.
- Hit targets are honest — `min-h-11` / `size-11` throughout.
- `StepTimeline` and `FilterStrip` implement full roving-tabindex keyboard
  support with correct ARIA.
- `prefers-reduced-motion` is handled properly, in both CSS and JS.
- `Split sticky` caps the sticky column's height, so a tall aside is never
  unreachable.

---

## 2. Root causes

The eight findings reduce to four:

1. **A palette edit removed a whole tier of hierarchy** (F1, and F8's readable
   half). One file, one block.
2. **Every low-contrast token was tuned for restraint against a *design*, not
   against a *display*** (F2, F3). The values are self-consistent and look
   correct in a mockup at full brightness; they fall out of perception in a
   room.
3. **The editorial voice of the landing was applied to triage surfaces** (F4,
   F7). Poster typography is right where a user reads; it is expensive where a
   user scans and acts.
4. **The same destination is stated more times than it needs to be** (F5, F6) —
   or, once, not at all.

---

## 3. Step 1 — Repair the palette (fixes F1, F2, F3, F8)

This is the whole of the critical work. **Do this step alone, then re-look at
every screen before starting Step 2** — several later steps may need less than
they look like they do.

### 3.1 Method

The secondary tier must satisfy two constraints at once, which is why eyeballing
it failed:

- **Legibility:** ≥ 7:1 against the ground, so it never reads as washed at 11px
  mono. (The old `#8a8a8a` gave 5.04:1 — legal but thin, and the reason it was
  overridden.)
- **Separation:** ≥ 1.8:1 against `--foreground`, so the tier is visible *as* a
  tier. This is the constraint nobody was checking, and it is the one that
  matters for cognitive load.

Measured candidates on `#1a1a1a`:

| Hex | vs ground | vs `#fafafa` | Verdict |
|---|---|---|---|
| `#fafafa` | 16.67 | **1.00** | current — no tier at all |
| `#d4d4d4` | 11.74 | 1.42 | separation too weak |
| `#c8c8c8` | 10.40 | 1.60 | borderline |
| **`#b8b8b8`** | **8.77** | **1.90** | **both constraints met** |
| `#a3a3a3` | 6.90 | 2.42 | legibility below target |
| `#8a8a8a` | 5.04 | 3.31 | the committed value — washed |

Light mirrors it almost exactly: `#4a4a4a` is 8.49:1 on `#fafafa` and 1.96:1
against `#1a1a1a`.

### 3.2 The token changes

In `app/globals.css`, **`/* == TOKENS:DARK == */`**:

```css
--muted-foreground: #b8b8b8;   /* 8.77:1 on ground, 1.90:1 below --foreground */
--faint: #8a8a8a;              /* 5.04:1. Small readable mono only. */
--decorative: #333333;         /* 1.38:1. aria-hidden ornament ONLY. Never text. */

--border: #333333;             /* 1.38:1, was #262626 at 1.15:1 */
--muted: #2e2e2e;              /* 1.28:1, was #232323 at 1.11:1 */
```

In **`/* == TOKENS:LIGHT == */`**:

```css
--muted-foreground: #4a4a4a;   /* 8.49:1 on ground, 1.96:1 below --foreground */
--faint: #6b6b6b;              /* 5.11:1 */
--decorative: #e0e0e0;

--border: #d4d4d4;             /* 1.42:1, was #e6e6e6 at 1.20:1 */
--muted: #e8e8e8;              /* 1.17:1, was #f0f0f0 at 1.09:1 */
```

Reasoning per token:

- **`--faint`** returns to `#8a8a8a`. Its job is now only the *readable* half of
  F8: codes, counts, option letters, disabled labels. At 5.04:1 it passes AA and
  sits a clear 3.3:1 below `--foreground` — exactly the recessive-but-legible
  role those call sites want.
- **`--decorative`** is new, and takes over the `aria-hidden` half. At 1.38:1 it
  is a shape, not a word — which is what `LayeredNumber` was always documented
  to be.
- **`--border`** roughly doubles its perceptual delta while staying a hairline.
  1.38:1 is still far below anything that reads as a box; it is simply above the
  floor where the line survives a real display.
- **`--muted`** rises for the same reason. It is not asked to carry hover on its
  own — Step 2 gives hover a second cue — but a selected row's ground should be
  legible as a ground.

`--border-strong`, `--border-hover`, `--accent`, `--attention`, `--card`,
`--input` and every `--paper-*` token are **unchanged**.

### 3.3 Required companions (the test will catch you if you skip these)

1. `@theme inline` — add `--color-decorative: var(--decorative);`
2. `.paper-band` — add `--decorative: var(--paper-faint);` so the band inverts
   as a unit.
3. `.ink-stage` — add the dark literals for `--muted-foreground`, `--faint`,
   `--decorative`, `--border` and `--muted` so the hero stays pinned. **This is
   the only landing-adjacent edit in the plan, and it exists precisely to keep
   the landing from changing.** Verify the hero is pixel-identical before and
   after.

### 3.4 Verify

```
npm test -- app/globals.test.ts
```

must stay green — it enforces dark↔light token parity and will fail if
`--decorative` is added to one block only.

Then, by eye, confirm: the `/teacher` roster's four columns now read at two
distinct weights; `/teacher/session/A` shows a leading hypothesis; the
`LayeredNumber` on the admin overview has receded behind its content; a
`RouteTabs` disabled tab reads as disabled.

---

## 4. Step 2 — Give hover a second cue (finishes F3)

A 1.28:1 fill is a reasonable *resting* ground for a selected row. It is not a
sufficient *transient* signal for hover. Add a position-stable second cue and
you get a three-rung ladder the eye can read without comparison:

| State | Cue |
|---|---|
| resting | nothing |
| hover | 2px left rule in `--border-strong` + `bg-muted` |
| selected | 2px left rule in `--accent` + `bg-muted` |

This reuses the accent-rule mechanism already present in five components, so it
adds no new vocabulary.

**Files:** `components/layout/ListRow.tsx`,
`components/app/DataTable.tsx`,
`components/shared/MisconceptionCard.tsx`,
`app/student/session/[scenario]/[mode]/SessionClient.tsx` (answer options),
`components/app/RoleMenu.tsx`.

Implementation sketch — render the rule unconditionally and switch its colour,
rather than conditionally mounting it, so nothing shifts on hover:

```tsx
<span
  aria-hidden
  className={cn(
    "absolute inset-y-0 left-0 w-0.5 transition-colors duration-150 ease-[var(--ease)]",
    selected ? "bg-accent" : "bg-transparent group-hover:bg-border-strong",
  )}
/>
```

`ListRow` and the session options are already buttons without `group` — add
`group` to the row's class string. `DataTable`'s rule lives in the first `<td>`;
put `group` on the `<tr>`.

**Do not** add hover cues to rows that are not interactive. `DataTable` should
only render the rule when `onRowClick` is defined — that is the point of the
change: interactivity becomes visible.

**Verify:** on `/teacher`, pointing at a roster row shows a grey left rule; on
`/admin/provenance` (non-clickable rows) it does not.

---

## 5. Step 3 — Reclaim the first screen on triage surfaces (fixes F4)

Two independent changes. Neither touches the landing.

### 5.1 Add a `compact` size to `Section`

`Section` is shared with `components/landing/sections/*`, which use `tight`,
`default` and `hero`. **Those three values must not change.** Add a fourth:

```tsx
size === "compact" && "py-10 md:py-12",
```

Then, in product routes only, shift each `Section` down one rung:
`default` → `tight`, `tight` → `compact`.

Files: the 18 under `app/**` that import `Section`.
`app/dev/components/page.tsx` may be left alone.

This alone removes roughly 500px from the teacher dashboard above the roster.

### 5.2 Drop the role homes from `hero` to `page` scale

`scale="hero"` is `lg:text-7xl` (96px). `scale="page"` is `lg:text-6xl` (72px).
Change the four role homes — `app/student/page.tsx`, `app/teacher/page.tsx`,
`app/parent/page.tsx`, `app/admin/page.tsx` — to `scale="page"`.

Reasoning: `hero` was specified as "role home pages and the landing sections".
On the landing that scale is doing editorial work. On a dashboard it is spending
33px of headline height for a title the sidebar already shows as an active item.
`page` is still a 72px h1 — this is a trim, not a flattening, and the poster
opening (kicker, accent bar, lede, rule) survives intact.

Also reduce the masthead's pre-rule gap from `mt-16 md:mt-20` to
`mt-10 md:mt-12`. **`components/layout/PageMasthead.test.tsx` asserts
`toContain("mt-16")` on the rule's parent — update that assertion in the same
commit.**

**Verify:** re-run the §1 F4 arithmetic. Target: the `Callout` on `/teacher`
begins above 700px, i.e. inside the first viewport at 1440×900.

### 5.3 Do NOT do this

Leave the poster masthead exactly as it is on reading surfaces —
`/student/remediation/[scenario]`, `/parent/summary/[id]`,
`/student/learn/[subject]/[code]`. Those pages are meant to be read from the
top, `.prose-editorial` is tuned for them, and the opening is doing real work.

---

## 6. Step 4 — Name the role (fixes F5)

Two small changes in `components/app/RoleMenu.tsx` and
`components/app/WorkspaceNav.tsx`:

1. The trigger label becomes the role, with the person as secondary:
   ```tsx
   <span className="text-foreground">{current.label}</span>
   <span className="text-faint">{current.person}</span>
   ```
   Below `md`, hide the person and keep the role — the role is the load-bearing
   half, and it is the half currently missing.

2. In `WorkspaceNav`, when `collapsed` is true, replace the blank `h-8` spacer
   with the role's nav icon or initial in `.label`, with the existing `Tooltip`
   giving the full "Teacher workspace". The collapsed rail currently reserves
   that space and shows nothing.

**Verify:** collapse the sidebar, switch role from the menu, and confirm the
role word is visible without opening anything.

---

## 7. Step 5 — Delete the duplicated admin tabs (fixes F6)

Remove `<AdminTabs />` from the `tabs` prop on all five admin pages and delete
`app/admin/Tabs.tsx`. The sidebar already lists all five destinations, groups
them meaningfully, and marks the active one.

Keep `app/teacher/session/[scenario]/Tabs.tsx` — that is genuine contextual
sub-navigation.

One consequence to handle: `/admin/catalogue`'s filter bar is
`sticky top-[var(--topbar-h)]`, and with the tabs gone it becomes the only
sticky element under the top bar. Confirm it still docks flush and that its
bottom hairline reads at the new `--border`.

---

## 8. Step 6 — Let primary actions out-rank labels (fixes F7)

Minimal, within the text-first constraint. In `components/ui/button.tsx`:

- Raise the `default` size from `text-sm` to `text-base`, and `lg` from
  `text-base` to `text-lg`.
- Drop `tracking-wider` to `tracking-wide` on the `primary` variant only. Wide
  tracking is the `.label` signature; narrowing it is what separates an action
  from a caption.
- Keep `uppercase`, keep the 2px accent underline, keep `px-0`. Do not add a
  fill.

Then, at the call sites in the four role-home mastheads and `SessionClient`'s
"Begin", use `size="lg"`.

Reasoning: the button keeps its family and its mechanism; it simply stops
sharing a size and a tracking value with the captions it must dominate. The
`ghost` and `outline` variants are unchanged.

**Verify:** on `/student`, "Start a diagnostic" is unambiguously the most
prominent interactive thing below the headline.

---

## 9. Step 7 — Retire `--faint` from decoration (finishes F8)

`components/type/LayeredNumber.tsx`: `text-faint` → `text-decorative`.
`components/app/Breadcrumb.tsx`: the `/` separator → `text-decorative`.

Every other `text-faint` site is small readable mono and stays as it is — at
`#8a8a8a` those now sit correctly one tier below `--muted-foreground`.

Add a one-line comment above `--decorative` in `globals.css`: *aria-hidden
ornament only; if a user has to read it, it is `--faint`.*

---

## 10. Out of scope — deliberately

- **The landing page in every respect** — the hero, the vine, the brain, the
  reveal choreography, `components/landing/**`, `app/page.tsx`. The only
  landing-adjacent edit is `.ink-stage` in §3.3, whose entire purpose is to keep
  the landing unchanged.
- Filled buttons, boxes, shadows, radii. The radius lock and the shadow tokens
  stay.
- The accent colours. `#39ff14` (12.84:1) and `#ffb020` (9.5:1) are correct.
- `--border-strong` at 3.03:1 — already at the WCAG 1.4.11 target.
- Restructuring navigation beyond deleting the admin duplicate.
- The scripted-fixture data model, routing, or role-gate behaviour.

---

## 11. Final gate

```
npm run lint
npx tsc --noEmit
npm test        # 18 files / 88 tests, plus the PageMasthead assertion updated in §5.2
npm run build
```

Then walk the four role homes, `/teacher/session/A`, `/teacher/escalations`,
`/admin/catalogue` and `/student/session/A/topic` in **both themes**, and check:

- [ ] Secondary copy is visibly a tier below primary copy, and still comfortable
      to read at 11px mono.
- [ ] "Awaiting review" and "Catalogued only" are distinguishable at a glance.
- [ ] `PosteriorBarSet` shows an obvious leader while still gathering.
- [ ] Every table and list row boundary is visible at arm's length.
- [ ] Hovering a clickable row shows a grey left rule; hovering a static row
      does not.
- [ ] "Needs your attention" is above the fold on `/teacher` at 1440×900.
- [ ] The current role is stated in words with the sidebar collapsed.
- [ ] The landing page is pixel-identical to `master`.
