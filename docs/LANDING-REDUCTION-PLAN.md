# Landing Reduction Plan — `sonder-web`

## Cut the landing to four things, and make the floating glass navbar the only way into the product

**Target:** `D:\FYP\Sonder\brain-ui\sonder-web\` — the only writable folder.
`brain-extract-anatomy\` and `FYP_POC_UI\` stay READ ONLY.

**Supersedes:** `docs/OVERHAUL-PLAN.md` §6.2 and §6.3 (the merged workspace grid and the resulting
seven-section landing). Everything else in both prior plans still stands.

**Change in one sentence:** the landing becomes **title and brain, then the vine, then a call to
action, then the footer** — and the four workspaces move out of the page body and into the floating
glass navbar, which becomes the single entry point to all 25 product screens.

---

## 1. Where the build is now

`npm run build` is clean. The overhaul plan is essentially complete: the glass system, `GlassRail`,
`GlassTopBar`, `GlassBottomBar`, all seven archetype shells, `StepTimeline`, `MetricStrip`,
`LeadPanel`, `WorklistRow`, `DataTable`, `FilterStrip` and `PageHeader` all exist, `StatTile` is
gone, and 24 of the 25 product screens have been migrated onto their assigned archetype.

**One gap remains from the previous plan** and should be closed as part of this work:

> `ConversationShell` exists but is only referenced by `/dev/components`. `ChatConsultant` was never
> refactored onto it, so `/student/consultant` and `/teacher/consultant` still render chat in normal
> page flow with a composer that scrolls away. That is overhaul Phase E7 and E14.

---

## 2. The target landing

```
┌─────────────────────────────────────────────────────────┐
│  ╭───────────────────────────────────────────────────╮  │  ← floating glass navbar
│  │ ◜S            How it works      Enter the ▾      │  │     (the ONLY navigation)
│  ╰───────────────────────────────────────────────────╯  │
│                                                         │
│                   S O N D E R                           │  ← wordmark drawn stroke by stroke
│                      ( brain )                          │  ← 3D specimen rising
│              It does not mark the answer.               │
│                                                         │
├─────────────────────────────────────────────────────────┤
│    ●  The problem                                       │
│    │  ┌──────────────────┐                              │
│    │  │ box of info      │                              │  ← the vine, growing
│    ●──┴──────────────────┘                              │     one box per stop
│    │              ┌──────────────────┐                  │
│    ●──────────────┤ box of info      │                  │
│    │              └──────────────────┘                  │
│                        ... six boxes ...                │
├─────────────────────────────────────────────────────────┤
│              Four workspaces. One engine.               │  ← the call to action
│                [ Enter the prototype ▾ ]                │
├─────────────────────────────────────────────────────────┤
│  ◜S   Sonder          Notes                             │  ← the footer
└─────────────────────────────────────────────────────────┘
```

Four things in `<main>`, plus the navbar and the footer. Roughly **8.7 viewports**, down from about
11 now and about 15 in the first build.

| # | Section | Component | Scroll |
|---|---|---|---|
| 1 | Hero: wordmark, brain, headline | `HeroStage` | 200dvh, pinned |
| 2 | The boxes | `VineScroller` | about 570vh |
| 3 | Call to action | `CtaBand` (new) | about 60vh |
| 4 | Footer | `LandingFooter` | about 40vh |

---

## 3. Delete

### 3.1 Components

```
components/landing/sections/ThesisBand.tsx
components/landing/sections/MechanismStrip.tsx
components/landing/sections/GuaranteeBand.tsx
components/landing/sections/EnterSection.tsx
```

Recoverable from git. Note the commit hash in `docs/PORT-NOTES.md` before deleting, the same way the
showcase deletion was recorded.

### 3.2 CSS

In `components/landing/styles/landing.css`, the four doomed sections occupy one **contiguous block**:

- **Delete lines 225 to 514** inclusive. That runs from the `/* ---- thesis ---- */` banner to the
  end of `.enter-card-see`, covering thesis, mechanism, guarantee and enter. Line 515 is the
  `/* ---- footer ---- */` banner and must survive.
- **Delete lines 94 to 103**, the two `.guarantee-band .sonder-cta--ghost` rules inside the shared
  CTA block. The rest of that block stays: the CTA styles are still used by the hero, the navbar and
  the new `CtaBand`.
- **Delete the `.vine-node-link` rules** near the end of the file (currently around line 633). See
  §5.3 for why the vine's links go.

Verify after deleting: `grep -c "thesis\|mechanism\|guarantee\|enter-card" landing.css` returns 0.

### 3.3 Anchors

`LandingNav` currently links to `#premise` and `#guarantee`. Both targets are being deleted, so both
links go. See §4.2 for what replaces them.

---

## 4. The navbar becomes the only navigation

This is the load-bearing part of the change. With `EnterSection` gone there is no role picker
anywhere in the page body, so **the navbar has to carry entry into all four workspaces or the
product becomes unreachable from the landing.**

### 4.1 New: `components/landing/WorkspaceMenu.tsx`

A glass popover listing the four roles. One component, used by three triggers (§4.4).

```tsx
"use client";
export function WorkspaceMenu({
  label = "Enter the prototype",
  size = "default",          // "default" | "sm" for the navbar
  align = "end",             // which edge of the trigger the panel aligns to
}: { label?: string; size?: "default" | "sm"; align?: "start" | "end" })
```

**Behaviour.** Uses the existing session plumbing unchanged:

```tsx
const { signIn } = useSession();
const router = useRouter();
const enter = (role: Role) => { signIn(role); router.push(ROLES[role].home); };
```

**Trigger.** A `<button>` carrying `.sonder-cta` (the existing neon-outline landing CTA), the label,
and a chevron that rotates 180 degrees when open. It must carry `aria-haspopup="menu"` and
`aria-expanded`.

**Panel.** `.sonder-glass`, `border-radius: 16px`, `width: 340px`, `z-index: 60`, positioned
absolutely below the trigger with an 8px offset, aligned per `align`. Contents:

- An `.eyebrow` header in `--sonder-muted`: `Choose a workspace`
- Four rows, one per `ROLE_ORDER`. Each row is a `<button role="menuitem">`, at least 56px tall:
  - left: the role icon at 16px in `var(--sonder-rim)`
  - middle: `ROLES[role].label` at 13px in `--sonder-paper`, then `ROLES[role].person` and
    `ROLES[role].context` on a second line at 11px in `--sonder-muted`
  - right: `ROLES[role].home` in `.eyebrow` mono, plus an arrow
  - hover and focus: `background: rgba(57, 255, 20, 0.07)` plus a 2px `--sonder-rim` left rule,
    matching `GlassRail`'s active treatment so the two navigation surfaces feel like one system

**Do not use the product's `DropdownMenu`.** It reads `--popover` and `--popover-foreground`, which
are theme-dependent, and the landing is theme-independent by construction. `landing.css` already
pins the dark glass variables on `.sonder-landing`, so a bespoke panel inherits the right material
automatically. Build it with a plain `useState` and the tokens already in scope.

**Keyboard and dismissal**, all required:

- `Escape` closes and returns focus to the trigger.
- `ArrowDown` / `ArrowUp` move between items; `Home` / `End` jump to first and last.
- A `pointerdown` listener on `document` closes on outside click, **added on open and removed on
  close**, never left mounted.
- Focus moves into the first item when the menu opens by keyboard, and stays on the trigger when it
  opens by mouse.
- `role="menu"` on the panel, `role="menuitem"` on each row.

**Motion.** Opens with opacity 0 to 1 and `translateY(-6px)` to 0 over 180ms `var(--ease-sonder)`.
Under `prefers-reduced-motion: reduce`, no transition; it simply appears.

### 4.2 `LandingNav` changes

- Left: `BrandMark`, unchanged.
- Centre: **one** anchor, `How it works`, targeting `#narrative`. `#premise` and `#guarantee` are
  gone. One link keeps the pill balanced and on one line at every width down to 900px, below which
  it hides as it does now.
- Right: `<WorkspaceMenu size="sm" align="end" />` replacing the current plain `#enter` CTA link.
- The skip link's target changes from `#enter` to `#cta`, and its label from
  `Skip to workspace entry` to **`Skip to the call to action`**.
- Everything else stays: the `IntersectionObserver` sentinel, the `data-scrolled` glass transition,
  the floating-pill geometry.

### 4.3 `HeroStage` changes

The hero lead currently has two anchor CTAs, one of which points at the deleted `#enter`.

- Primary becomes `<WorkspaceMenu />` (default size). Same label, same menu.
- Secondary keeps its ghost styling but its label changes from `See how it decides` to
  **`How it works`**, matching the navbar link exactly. Two different labels for one intent is a
  rule violation; one label used in two places is not.
- Its `href` stays `#narrative`.

`HeroStage` becomes a client component that renders `WorkspaceMenu`; it already is `"use client"`,
so this costs nothing.

Hero text-element count stays at **3**: eyebrow, headline, CTA pair. Within the cap of 4.

### 4.4 Where the menu is triggered

Three places, one label, one menu, no duplicate-intent violation:

| Trigger | Size | Why it exists |
|---|---|---|
| Navbar | `sm` | Persistent. Always on screen, at every scroll position. |
| Hero lead | default | The moment a visitor decides. |
| `CtaBand` | default | The end of the argument. |

---

## 5. New section: `CtaBand`

`components/landing/sections/CtaBand.tsx`, `id="cta"`, about 60vh, centred, one column at
`max-width: 58ch`.

Copy, reused verbatim from the deleted `EnterSection` because it was already written and already
clears the em-dash ban:

- `.eyebrow` in `text-sonder-rim/85`: **Walk the build**
- `<h2>` in `font-display` at `clamp(26px, 3vw, 40px)`: **Four workspaces. One engine.**
- Body at 15.5px / 1.7 in `rgba(232,255,224,0.66)`:
  *This build runs entirely on scripted fixture data. There is no backend, no authentication and no
  live model. Pick a workspace and walk the flow end to end.*
- `<WorkspaceMenu />`, `align="start"`

Uses `useReveal` for the staggered entrance, exactly as the deleted sections did.

**Eyebrow budget.** Four sections means `ceil(4 / 3) = 2` section eyebrows are permitted. The hero
holds one and `CtaBand` holds the other. The vine's per-node kickers stay exempt: they are
list-item kickers inside one section, not section headers. **Do not add an eyebrow anywhere else.**

---

## 6. Two consequences that must be handled, not ignored

### 6.1 `RoleGate` currently throws deep links away

```tsx
// components/app/RoleGate.tsx, today
if (!current) router.replace("/");
else if (current !== role) signIn(role);
```

A visitor who is not signed in and opens **any** product URL is silently redirected to the landing.
That is already true today; it becomes much worse once the landing has no role picker, because there
is then no visible explanation and no obvious recovery. It also breaks the footer's own
`Walk the build` links to `/student`, `/teacher`, `/parent` and `/admin`.

**Fix, one line:**

```tsx
if (current !== role) signIn(role);
```

Adopt the role of whatever area was deep-linked into, which is what the second branch already does
for a signed-in visitor in the wrong area. Every product URL becomes shareable and the footer links
start working.

This is safe here specifically because there is no real authentication: a "session" is one of four
strings in `localStorage`, and the navbar and the rail both expose a role switcher. **If you would
rather keep the bounce, say so and this stays as it is** — but then the footer's four product links
must be deleted, because a link that silently throws you back to where you came from is worse than
no link.

### 6.2 The vine's per-node deep links

Each vine node currently renders its `meta` as a link into the product (`Start a diagnostic` to
`/student/start`, `Watch the posterior move` to `/teacher/session/B`, and four more).

The instruction is that the product is reached through the navbar only, and the vine's job is to
show boxes of information. So:

- Remove the `href` field from all six entries in `lib/landing/vine/content.ts`. Keep `meta` as a
  plain dim line under the hairline rule, which is what `vine.css` already styles.
- In `VineScroller.tsx`, drop the `Link` branch from the meta render and the `next/link` import,
  leaving `{node.meta}` as text.
- Delete the `.vine-node-link` rules from `landing.css`.
- In `lib/landing/vine/content.test.ts`, delete the `only links to routes that exist` case and the
  `KNOWN_ROUTES` set. Keep the other four cases: they still guard placeholder copy, em-dashes,
  unique ids and body length.
- The `href` field on the `VineNode` type can go too, since nothing uses it.

**The alternative, if you want the links back later:** keep them and rely on the §6.1 `RoleGate` fix
to make them land properly. Both work; this plan removes them because "navbar only" was explicit.

---

## 7. Files touched

**Delete (4):** `ThesisBand.tsx`, `MechanismStrip.tsx`, `GuaranteeBand.tsx`, `EnterSection.tsx`

**Add (2):** `components/landing/WorkspaceMenu.tsx`, `components/landing/sections/CtaBand.tsx`

**Modify (7):**

| File | Change |
|---|---|
| `components/landing/Landing.tsx` | `<main>` drops to `HeroStage`, the vine section, `CtaBand` |
| `components/landing/LandingNav.tsx` | one anchor, `WorkspaceMenu`, new skip target |
| `components/landing/HeroStage.tsx` | primary CTA becomes `WorkspaceMenu`, secondary relabelled |
| `components/landing/VineScroller.tsx` | meta renders as text, `Link` import removed |
| `components/landing/styles/landing.css` | delete lines 225-514, 94-103, `.vine-node-link`; add `.workspace-menu*` and `.cta-band*` |
| `lib/landing/vine/content.ts` | drop `href` from all six nodes and from the type |
| `lib/landing/vine/content.test.ts` | drop the route case and `KNOWN_ROUTES` |
| `components/app/RoleGate.tsx` | adopt the role instead of bouncing (§6.1) |

`Landing.tsx` after the change:

```tsx
      <main className="relative z-[1]">
        <HeroStage />
        <section id="narrative" aria-label="How Sonder works">
          <VineScroller />
        </section>
        <CtaBand />
      </main>
```

---

## 8. Execution order

- [ ] 1 Record the pre-deletion commit hash in `docs/PORT-NOTES.md`
- [ ] 2 Build `WorkspaceMenu` in isolation; add it to `/dev/components` before wiring it anywhere
- [ ] 3 Build `CtaBand`
- [ ] 4 Wire `WorkspaceMenu` into `LandingNav` and `HeroStage`
- [ ] 5 Update `Landing.tsx`; delete the four section components
- [ ] 6 Delete the CSS blocks; add `.workspace-menu*` and `.cta-band*`
- [ ] 7 Strip the vine links (component, content, CSS, test)
- [ ] 8 Apply the `RoleGate` fix
- [ ] 9 Close the outstanding overhaul gap: refactor `ChatConsultant` onto `ConversationShell` and
      migrate `/student/consultant` and `/teacher/consultant`
- [ ] 10 `npm run lint`, `npm run build`, `npm test` clean
- [ ] 11 Verification (§9)

---

## 9. Verification

Run at 390px, 860px, 1280px and 1920px, in both themes, with reduced motion off and on.

1. The landing contains exactly four things in `<main>`: hero, vine, CTA, and nothing else. The
   footer follows outside `<main>`.
2. Total landing height is about 8 to 9 viewports.
3. The wordmark still draws stroke by stroke, and the brain still rises and settles during the pin.
4. All six vine boxes still open in sequence, with the eyebrow, title, body and meta stagger intact.
5. No vine box contains a link.
6. Nothing on the landing between the vine's last box and the footer except `CtaBand`.
7. The navbar's workspace menu opens, lists four roles, and each row signs in and lands on the right
   role home.
8. `Escape` closes the menu and focus returns to the trigger. Arrow keys move between roles.
9. Clicking outside closes it, and the `pointerdown` listener is removed (re-open and close ten
   times, then confirm in devtools that only one listener is ever attached).
10. The menu is legible over the moving particle canvas: the glass fill is dark enough that role
    labels stay above 4.5:1 while particles pass behind it.
11. All three triggers open the same menu and carry the same label.
12. There are exactly two section eyebrows on the landing.
13. The skip link targets `#cta` and is the first focusable element.
14. Opening `/teacher/session/B` directly in a fresh browser profile lands on that page rather than
    bouncing to `/`.
15. The footer's four product links work.
16. `/student/consultant` has a composer pinned to the bottom of the viewport that does not scroll
    away.
17. `git diff` still shows zero changes under `fixtures/` and to the ten product `lib/` modules
    other than `RoleGate.tsx`.

---

## 10. Pre-flight

Everything in the two prior plans still applies. Specific to this change:

- [ ] Zero em-dashes and en-dashes in the new `CtaBand` and `WorkspaceMenu` copy
- [ ] `WorkspaceMenu` uses no semantic tokens (`--popover`, `--card`, `--border`); the landing stays
      theme-independent
- [ ] Every menu row is at least 44px tall with 8px separation
- [ ] The outside-click listener is added on open and removed on close, never on mount
- [ ] No new dependency; still one animation library and one icon family
- [ ] Glass surface count on the landing is still one (the navbar) plus the menu panel while open
- [ ] No `window.addEventListener("scroll")` was introduced
