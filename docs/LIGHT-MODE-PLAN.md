# Light mode — implementation plan

Status: **not started**. Every step below is written to be executed in order,
top to bottom, with no design decisions left open. Where a decision was
genuinely open it has been made here, and the rejected alternatives are recorded
so nobody re-litigates them mid-build.

---

## 0. How to use this plan

1. Work the steps **in numerical order**. Several later steps depend on tokens or
   files created earlier; skipping ahead produces a broken intermediate state
   that is hard to debug.
2. Every step states **the file**, **the exact change**, and **how to verify it**.
   The code blocks are final, not sketches — paste them.
3. Run each step's verification line before moving on. Do not batch verification
   to the end.
4. At the end, run the full gate:
   ```
   npm run lint
   npx tsc --noEmit
   npm test
   npm run build
   ```
5. `AGENTS.md` requires reading the relevant guide in `node_modules/next/dist/docs/`
   before writing code. The guide that governs this work is
   `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md`
   (sections "Themes" and "Re-applying attributes in development"). It has been
   read, and its idioms are reproduced verbatim in Steps 2–3. Do not invent a
   different flash-prevention scheme.

---

## 1. What exists today (audit — this was verified, trust it)

The build is far better set up for this than it looks. The findings that shape
every decision below:

| Finding | Evidence | Consequence |
|---|---|---|
| **The whole product is token-driven.** There is not one hardcoded Tailwind palette colour (`bg-white`, `text-zinc-400`, …) in `app/` or `components/`. | A grep for the full Tailwind colour namespace across `--include=*.tsx` returned zero hits. | Light mode is overwhelmingly a **CSS custom-property job**. Almost no component files change. |
| **There is not one `dark:` variant in the codebase.** | grep `dark:` across `app/ components/ lib/` → zero hits. `shadcn/dist/tailwind.css` and `tw-animate-css` define no `.dark` block either. | The `.dark` class on `<html>` is inert and can be removed. |
| **`@theme inline` maps every colour as `--color-x: var(--x)`.** | `app/globals.css`, the `@theme inline` block. | `inline` means a utility emits `var(--background)`, not a baked hex. Re-declaring `--background` at `:root[data-theme="light"]` therefore repaints **all ~100 `border-border`, 148 `text-muted-foreground` and 40 `bg-accent` call sites** with zero component edits. This one fact is what the entire plan rests on. |
| **A contrast-checked light palette already ships.** | `--paper`, `--paper-ink`, `--paper-muted`, `--paper-accent`, `--paper-border` on `:root`, consumed by `.paper-band` and `vine.css`. | Do not invent a light palette from scratch. Promote the paper palette. `--paper-accent: #1b7a00` exists precisely because `#39ff14` on white is 1.30:1. |
| **Only two files hardcode a colour a theme flip would break.** | `components/shared/PosteriorBarSet.tsx` (the `rgba(26,26,26,0.55)` tie hatch) and `components/ui/anomalous-matter-hero.tsx` (`const NEON`). | Two small surgical edits, Steps 13–14. |
| **The 3D brain's palette is baked into GLSL at material-construction time.** | `lib/landing/three/teal-material.ts` string-interpolates `FACING_ALPHA`, `EDGE_ALPHA`, `FRESNEL_POWER` into the shader source via `glsl()`. | Live re-theming of the brain is impossible without rebuilding the material, which means re-running the GLB loader. **The hero is therefore pinned to charcoal in both themes** (§2.5). |
| **There is an established store idiom.** | `lib/session.tsx` and `lib/local-flag.ts` both use `useSyncExternalStore` with a module-level value, a listener `Set`, a `storage`-event bridge, and a server snapshot that is always the default. | `lib/theme.tsx` must follow it exactly. Do not reach for a `useState` + `useEffect` provider. |
| **Route transitions already use the View Transition API — and freeze the chrome.** | `app/template.tsx` renders `<ViewTransition default="page-swap">`; `globals.css` sets `view-transition-name: topbar` / `worknav` and `::view-transition-group(topbar) { animation: none }`. | The theme wipe is also a view transition and **will collide with those two frozen groups** unless their names are suppressed for the duration of the switch. Step 9b handles this. It is the single most likely thing to get wrong. |
| **There is one uncommitted change in the tree.** | `git diff app/globals.css`: `--muted-foreground` and `--faint` were both raised to `#fafafa` (equal to `--foreground`). | The light palette must **mirror that decision**, not the committed one. See §3.2. |

---

## 2. Architecture decisions

### 2.1 The switch is an attribute on `<html>`, not a class

`data-theme="dark" | "light"` on the document element.

- **Why an attribute, not a class:** `<html>`'s `className` is already owned by
  JSX (it carries the three `next/font` variables). An inline script that
  rewrites `className` fights React's reconciliation. Nobody else writes
  `data-theme`, so the script and React never contend for the same property.
  This is also exactly what the Next.js guide prescribes.
- **The attribute is always present.** The JSX renders `data-theme="dark"`, and
  the inline script overwrites it with `"light"` when that is what is stored.
  Never write a selector that relies on "attribute absent means dark" — but *do*
  keep the dark palette on bare `:root` as the structural fallback, so a failure
  of the script degrades to the shipped design rather than to unstyled text.
- **Rejected:** a `.light` class (fights the JSX className); a cookie read with
  `cookies()` in the root layout (opts the entire app out of static prerendering
  — the Next guide says so explicitly); `next-themes` (a dependency for ~90
  lines of code that would not follow this repo's store idiom).

### 2.2 Dark is the default, and the OS preference is ignored

A visitor with nothing in `localStorage` gets dark, whatever
`prefers-color-scheme` says. Dark is the brand: the pinned WebGL hero, the neon
accent and the grain are the product's identity, and handing half of all first
visits a different first impression is a marketing decision nobody has made.

The opt-in is small, and is documented in `lib/theme.tsx` so a future maintainer
does not have to reverse-engineer it. It requires changing **two** places that
must agree exactly — `DEFAULT_THEME` in `lib/theme.tsx` *and* the inline script
string in Step 3 — or the page will flash on every load.

### 2.3 Storage is `localStorage["sonder.theme"]`

Matching `sonder.role`, `sonder.music`, `sonder.sidebar.collapsed`. Values are
the literal strings `"dark"` and `"light"`. Anything else is treated as absent.

### 2.4 `.paper-band` keeps its name and **inverts** in light mode

`.paper-band` is the landing's "mechanism" section: a light band that interrupts
a dark page. In light mode, a light band interrupting a light page is not a band
at all — the editorial rhythm of the landing would simply collapse.

So in light mode the `--paper-*` tokens are redefined to **charcoal**, and the
band becomes the dark interruption. The rhythm is preserved, inverted, exactly
as the page's ground is.

- **The token names stay `--paper-*`.** They now mean "the band that opposes the
  page", not "white". This is a small semantic debt, taken deliberately:
  renaming would ripple through `@theme inline` (5 keys), `vine.css` (7 uses)
  and `Landing.tsx` (2 utility classes) for zero functional gain and real risk.
  A comment in `globals.css` records the new meaning.
- A consequence, and a good one: the vine becomes a **white ink line drawing on
  charcoal with a neon-green accent** in light mode — free, because `vine.css`
  reads only `--paper-*`.

### 2.5 The hero is pinned to charcoal in **both** themes

`.hero-stage` gets an `.ink-stage` token block that re-points `--background`,
`--foreground`, `--accent` and the borders to the dark values, using the very
same "re-point the tokens, edit no children" technique `.paper-band` already
uses.

Why:

- **It is technically forced.** The brain's Fresnel alphas
  (`FACING_ALPHA = 0.1`, `EDGE_ALPHA = 0.85`) are string-interpolated into GLSL
  in `teal-material.ts`. Changing them needs a new material, which needs a
  re-run of `AnatomyViewer.setOrgan()`, which needs the GLB re-processed. A
  theme toggle that rebuilds a 2.5 MB WebGL scene is not a toggle.
- **It is editorially right.** A 10%-opaque neon-green object on `#fafafa` is
  invisible. The hero is the theatre and the theatre has the lights down. The
  light-mode landing then reads: dark hero → light thesis → dark mechanism band
  → light numbers → light workspaces. That is the dark landing's own rhythm,
  inverted, which is the correct answer for an inverted theme.
- **It costs nothing.** In dark mode `.ink-stage` re-points tokens to the values
  they already hold: a no-op. Zero risk to the shipped design.
- Therefore **`hero-stage.css`, `brain-viewer.css`, `teal-theme.ts`,
  `viewer.ts`, `teal-material.ts`, `neuron-activity.ts` and `hotspots.ts` are
  not touched by this plan at all.** If you find yourself editing one of them,
  stop — you have gone off plan.

### 2.6 The animation is two layers

1. **A circular wipe of the whole page**, driven by
   `document.startViewTransition()`, with the incoming view clipped from a
   zero-radius circle at the toggle button's centre out to the farthest viewport
   corner. The light floods out from the switch you pressed.
2. **A sun ⇄ moon morph on the switch itself** — one inline SVG whose disc is
   masked by a circle that slides across to carve a crescent, while eight rays
   retract and counter-rotate. Pure CSS, driven off `[data-theme]`, so it works
   in browsers with no View Transition support and needs no JS to stay in sync.

During the wipe, the knob is lifted out of the page snapshot into its own view
transition group (Step 9c) so it stays above the sweep and cross-rotates rather
than being frozen into a snapshot image.

`prefers-reduced-motion: reduce` skips the view transition entirely in JS
(`lib/theme.tsx`) **and** is already neutralised in CSS by the existing
`::view-transition-group(*) { animation: none !important }` block. Belt and
braces, deliberately: the theme must still change, instantly, with no motion.

### 2.7 Explicitly out of scope

- Re-theming the 3D brain, its hotspots, its loader, or `brain-viewer.css` (§2.5).
- A system/auto tri-state on the toggle. Two states only (§2.2).
- Per-route theme overrides.
- Theming the `/dev/components` gallery chrome (it is deliberately chrome-free).
  An optional floating toggle for it is Step 17, last, and may be dropped.

---

## 3. The light palette

### 3.1 Method

Every value is either lifted from the existing `--paper-*` palette (already
contrast-checked and shipping) or derived by **mirroring the dark palette's own
contrast ratio**, not by eyeballing. Ratios below are computed against the light
ground `#fafafa` (relative luminance 0.9561) using WCAG 2.x.

Reference luminances used throughout:

| Hex | L | Contrast vs `#fafafa` |
|---|---|---|
| `#ffffff` | 1.0000 | 1.05 : 1 |
| `#fafafa` | 0.9561 | 1.00 : 1 |
| `#f0f0f0` | 0.8714 | 1.10 : 1 |
| `#e6e6e6` | 0.7912 | 1.20 : 1 |
| `#8f8f8f` | 0.2744 | **3.10 : 1** (meets WCAG 1.4.11 for controls) |
| `#9a5a00` | 0.1418 | **5.25 : 1** |
| `#1b7a00` | 0.1415 | **5.25 : 1** |
| `#5f5f5f` | 0.1144 | **6.12 : 1** |
| `#1a1a1a` | 0.0103 | **16.67 : 1** |

### 3.2 The token table

Every token in the dark block gets a light counterpart. Nothing is left to
inherit.

| Token | Dark (unchanged) | **Light** | Reasoning |
|---|---|---|---|
| `color-scheme` | `dark` | `light` | Drives native scrollbars, form controls and the browser's own canvas colour. Missing this is the classic cause of a white page with black scrollbars. |
| `--background` | `#1a1a1a` | `#fafafa` | The existing `--paper`. Never pure white — the design system's "never pure black" rule, mirrored. |
| `--foreground` | `#fafafa` | `#1a1a1a` | The existing `--paper-ink`. 16.67 : 1, the exact inverse of the dark pair. |
| `--muted` | `#232323` | `#f0f0f0` | The one elevated surface. `.paper-band` already uses `#f0f0f0` for this. |
| `--muted-foreground` | `#fafafa` | `#1a1a1a` | **Mirrors the uncommitted change** that set dark's `--muted-foreground` equal to `--foreground`. See the note below. |
| `--faint` | `#fafafa` | `#1a1a1a` | Same; mirrors the uncommitted change. |
| `--accent` | `#39ff14` | `#1b7a00` | The existing `--paper-accent`. **Neon green must never appear on the light ground: `#39ff14` on `#fafafa` is 1.30 : 1.** |
| `--accent-foreground` | `#1a1a1a` | `#fafafa` | 5.25 : 1 on the accent. |
| `--attention` | `#ffb020` | `#9a5a00` | `#ffb020` on `#fafafa` is 1.8 : 1 and fails. `#9a5a00` is a deep amber at 5.25 : 1, matching the accent's ratio exactly so the two read as equals. |
| `--attention-foreground` | `#1a1a1a` | `#fafafa` | |
| `--border` | `#262626` | `#e6e6e6` | Decorative hairline. Dark's `#262626` on `#1a1a1a` is 1.15 : 1; `#e6e6e6` on `#fafafa` is 1.20 : 1 — a hair stronger, because light-on-light reads slightly weaker than dark-on-dark at the same ratio. |
| `--border-strong` | `#666666` | `#8f8f8f` | Every control boundary. 3.10 : 1, clears WCAG 1.4.11. Already the value `.paper-band` uses. |
| `--border-hover` | `#404040` | `#a3a3a3` | Already the value `.paper-band` uses. |
| `--card` | `#0f0f0f` | `#ffffff` | Dark recesses the card below the ground; light raises it above. The mirror, not the copy. |
| `--card-foreground` | `#fafafa` | `#1a1a1a` | |
| `--input` | `#1a1a1a` | `#fafafa` | Dark sets input == background. Mirror it. |
| `--ring` | `#39ff14` | `#1b7a00` | Always equals `--accent`. |
| `--primary` | `#fafafa` | `#1a1a1a` | shadcn alias. |
| `--primary-foreground` | `#1a1a1a` | `#fafafa` | |
| `--secondary` | `#232323` | `#f0f0f0` | |
| `--secondary-foreground` | `#fafafa` | `#1a1a1a` | |
| `--popover` | `#0f0f0f` | `#ffffff` | Mirrors `--card`. |
| `--popover-foreground` | `#fafafa` | `#1a1a1a` | |
| `--destructive` | `#fafafa` | `#1a1a1a` | There is no red in this build; `--destructive` is just `--foreground`. |

**The inverting band** (§2.4). In light mode these become charcoal:

| Token | Dark | **Light** | Note |
|---|---|---|---|
| `--paper` | `#fafafa` | `#1a1a1a` | The band's ground. |
| `--paper-ink` | `#1a1a1a` | `#fafafa` | |
| `--paper-muted` | `#5f5f5f` | `#8a8a8a` | 5.04 : 1 on `#1a1a1a`. This is the value dark's `--muted-foreground` held before the uncommitted change — a known-good mid grey for charcoal. |
| `--paper-accent` | `#1b7a00` | `#39ff14` | Neon is legal here: the band is charcoal. 12.8 : 1. |
| `--paper-border` | `#d4d4d4` | `#262626` | |
| `--paper-surface` *(new)* | `#f0f0f0` | `#232323` | Was the hardcoded `--muted` inside `.paper-band`. |
| `--paper-faint` *(new)* | `#c8c8c8` | `#4a4a4a` | Was the hardcoded `--faint` inside `.paper-band`. |
| `--paper-border-strong` *(new)* | `#8f8f8f` | `#666666` | Was hardcoded inside `.paper-band`. |
| `--paper-border-hover` *(new)* | `#a3a3a3` | `#404040` | Was hardcoded inside `.paper-band`. |

The four new `--paper-*` tokens exist for one reason: `.paper-band` currently
hardcodes four hexes inline, and those hexes are *light-mode-only* values. Once
the band inverts they must come from the theme. Step 5b rewrites `.paper-band`
so it contains **no literal colour at all**.

**Utility tokens** (new, both themes):

| Token | Dark | **Light** | Purpose |
|---|---|---|---|
| `--hatch` | `rgba(26,26,26,0.55)` | `rgba(250,250,250,0.55)` | The tie-state diagonal hatch in `PosteriorBarSet`. It is drawn **over** an `--attention` fill; in dark that fill is bright so the hatch is ink, in light the fill is deep amber so the hatch must be paper. Step 13. |
| `--grain-opacity` | `0.015` | `0.03` | The `body::after` fractal-noise overlay. |
| `--grain-blend` | `normal` | `multiply` | On the light ground, additive noise washes out; multiply reads as paper tooth. |
| `--matter-opacity` | `0.14` | `0.07` | The fixed WebGL wireframe wallpaper. Step 14. |
| `--theme-wipe-ms` | `620ms` | *(same)* | Declared once on `:root`; the switch animation duration. Must match `THEME_WIPE_MS` in `lib/theme.tsx`. |

> **Note on `--muted-foreground` / `--faint`.** The working tree raises both to
> `#fafafa` in dark mode, i.e. "secondary copy is full-contrast white". The light
> values above mirror that. If that uncommitted change is reverted before this
> work lands, revert the light values to `#5f5f5f` (`--muted-foreground`,
> 6.12 : 1) and `#b5b5b5` (`--faint`, decorative only) to match. **Check
> `git diff app/globals.css` before you start.**

---

## 4. Step 1 — the theme store

**Create `lib/theme.tsx`.**

Follows `lib/session.tsx` exactly: module-level value, listener `Set`,
`useSyncExternalStore`, a server snapshot that is always the default, and all
mutation in module functions rather than hook closures.

```tsx
"use client";

/**
 * The theme store.
 *
 * One attribute — `data-theme` on <html> — is the single source of truth for the
 * rendered palette. globals.css defines the dark palette on :root and the light
 * palette on :root[data-theme="light"], and `@theme inline` means every Tailwind
 * colour utility emits `var(--token)` rather than a baked hex. Flipping the
 * attribute therefore repaints the entire product without re-rendering a single
 * component.
 *
 * The value is mirrored into localStorage and re-applied by the inline script in
 * app/layout.tsx before first paint, so a hard load never flashes.
 *
 * Read through useSyncExternalStore, exactly like lib/session.tsx: SSR sees the
 * default, the client sees the stored value after hydration, and no effect ever
 * calls setState.
 */

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "sonder.theme";
export const THEME_ATTRIBUTE = "data-theme";
/** Set on <html> for the duration of a switch. Scopes every wipe rule in
 *  globals.css so route transitions are never caught by them. */
export const THEME_SWITCH_ATTRIBUTE = "data-theme-switch";

/**
 * Dark is the brand, so a visitor with no stored preference gets dark whatever
 * their OS says. To respect the OS instead you must change BOTH this constant
 * and the inline script string in app/layout.tsx — if the two disagree, every
 * page load flashes.
 */
export const DEFAULT_THEME: Theme = "dark";

function isTheme(v: unknown): v is Theme {
  return v === "dark" || v === "light";
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(saved) ? saved : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/** Module-level cache, so the client snapshot is referentially stable and
 *  useSyncExternalStore does not loop. */
let current: Theme | null = null;

function snapshot(): Theme {
  if (current === null) current = readStoredTheme();
  return current;
}

function serverSnapshot(): Theme {
  return DEFAULT_THEME;
}

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/** The only thing that actually changes the paint. Everything else is bookkeeping. */
export function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== THEME_STORAGE_KEY) return;
    current = isTheme(e.newValue) ? e.newValue : DEFAULT_THEME;
    applyTheme(current);
    emit();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(cb);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

/** Viewport coordinates the circular wipe expands from. */
export type WipeOrigin = { x: number; y: number };

type ViewTransition = { finished: Promise<unknown> };
type DocumentWithVT = Document & {
  startViewTransition?: (cb: () => void) => ViewTransition;
};

/**
 * Writes the wipe geometry onto <html> as custom properties. The
 * ::view-transition pseudo-element tree inherits custom properties from the
 * document element, which is what lets a keyframe read them.
 *
 * The radius is the distance to the FARTHEST viewport corner: the point at which
 * the expanding circle has covered every pixel.
 */
function writeWipeVars(origin: WipeOrigin | null) {
  const root = document.documentElement;
  const x = origin ? origin.x : window.innerWidth / 2;
  const y = origin ? origin.y : window.innerHeight / 2;
  const r = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  root.style.setProperty("--theme-x", `${x}px`);
  root.style.setProperty("--theme-y", `${y}px`);
  root.style.setProperty("--theme-r", `${r}px`);
}

function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Guards against a second switch starting while one is mid-flight. */
let switching = false;

export function setTheme(next: Theme, origin?: WipeOrigin) {
  current = next;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    /* ignore */
  }

  const commit = () => {
    applyTheme(next);
    emit();
  };

  const doc = typeof document !== "undefined" ? (document as DocumentWithVT) : null;

  if (!doc || !doc.startViewTransition || switching || prefersReducedMotion()) {
    commit();
    return;
  }

  switching = true;
  writeWipeVars(origin ?? null);
  // MUST be set before startViewTransition: the old snapshot is captured
  // synchronously inside that call, and this attribute is what strips the
  // `topbar` / `worknav` view-transition-names so the frozen chrome groups do
  // not tear a hole in the wipe.
  doc.documentElement.setAttribute(THEME_SWITCH_ATTRIBUTE, "1");

  const transition = doc.startViewTransition(commit);
  const done = () => {
    switching = false;
    doc.documentElement.removeAttribute(THEME_SWITCH_ATTRIBUTE);
  };
  transition.finished.then(done, done);
}

export function toggleTheme(origin?: WipeOrigin) {
  setTheme(snapshot() === "dark" ? "light" : "dark", origin);
}

export function useTheme(): {
  theme: Theme;
  setTheme: (next: Theme, origin?: WipeOrigin) => void;
  toggle: (origin?: WipeOrigin) => void;
} {
  const theme = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const set = useCallback(
    (next: Theme, origin?: WipeOrigin) => setTheme(next, origin),
    [],
  );
  const toggle = useCallback((origin?: WipeOrigin) => toggleTheme(origin), []);
  return { theme, setTheme: set, toggle };
}

/** Test-only: drop the module cache so each test starts from localStorage. */
export function __resetThemeStoreForTests() {
  current = null;
  switching = false;
  listeners.clear();
}
```

Notes for the implementer:

- `commit()` calls `emit()` inside the view-transition callback. React's
  `useSyncExternalStore` update is scheduled, not synchronous, so it may land
  just after the new snapshot is captured. **This does not matter**: the only
  thing React renders from `theme` is the button's `aria-label`, Sonner's theme
  prop and the wallpaper's colour uniform — nothing that is visible inside a
  620 ms snapshot image. The visual change is entirely the attribute, and that
  *is* set synchronously.
- No React context and no provider. The store is module-level; any component can
  call `useTheme()` directly. This matches `useLocalFlag` and avoids adding a
  fourth nesting level to `Providers`.

**Verify:** `npx tsc --noEmit` passes.

---

## 5. Step 2 — the inline-script helper

**Create `components/app/InlineScript.tsx`.**

Copied from the Next.js guide's "Extracting a reusable component". The
server/client `type` swap is what stops React's development warning about
rendering `<script>` tags, and stops the script re-running on soft navigation.

```tsx
/**
 * A script that must run synchronously while the browser parses the HTML,
 * before first paint. Straight from the Next.js guide:
 * node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
 *
 * `type` is text/javascript on the server (so it executes during parsing) and
 * text/plain on the client (so React never re-executes it on a soft
 * navigation). suppressHydrationWarning absorbs that deliberate mismatch.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

**Verify:** `npx tsc --noEmit` passes.

---

## 6. Step 3 — wire the root layout

**Edit `app/layout.tsx`.**

Three changes to the `RootLayout` return value, and one new import.

1. Add the import:
   ```tsx
   import { InlineScript } from "@/components/app/InlineScript";
   import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from "@/lib/theme";
   ```

2. Replace the whole `<html>` open tag. **Remove the `dark` class** — it is
   inert (audit §1: zero `dark:` usages, no `.dark` block in `shadcn` or
   `tw-animate-css`) and leaving it implies a second, competing switch.

   Before:
   ```tsx
   <html
     lang="en"
     className={`dark ${interTight.variable} ${jetbrainsMono.variable} ${playfair.variable}`}
   >
   ```
   After:
   ```tsx
   <html
     lang="en"
     data-theme="dark"
     suppressHydrationWarning
     className={`${interTight.variable} ${jetbrainsMono.variable} ${playfair.variable}`}
   >
   ```

   `suppressHydrationWarning` on `<html>` tells React to keep whatever the DOM
   holds for this element rather than the value from the RSC payload — which is
   exactly what is wanted, because the inline script has already corrected it.

3. Add a `<head>` containing the script, directly above `<body>`:

   ```tsx
   <head>
     <InlineScript
       html={`(function(){try{var t=localStorage.getItem(${JSON.stringify(
         THEME_STORAGE_KEY,
       )});if(t==="light"||t==="dark")document.documentElement.setAttribute(${JSON.stringify(
         THEME_ATTRIBUTE,
       )},t)}catch(e){}})()`}
     />
   </head>
   ```

   Reading the constants through `JSON.stringify` rather than typing the strings
   twice is deliberate: the script and the store cannot drift apart.

Full expected result:

```tsx
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${interTight.variable} ${jetbrainsMono.variable} ${playfair.variable}`}
    >
      <head>
        <InlineScript
          html={`(function(){try{var t=localStorage.getItem(${JSON.stringify(
            THEME_STORAGE_KEY,
          )});if(t==="light"||t==="dark")document.documentElement.setAttribute(${JSON.stringify(
            THEME_ATTRIBUTE,
          )},t)}catch(e){}})()`}
        />
      </head>
      <body className="bg-background text-foreground antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
```

> The `try/catch` is not decoration: `localStorage` throws outright in some
> privacy modes, and an uncaught throw here would abort HTML parsing.

**Verify:** `npm run dev`, load `/`, and in DevTools run
`localStorage.setItem("sonder.theme","light")` then hard-reload. `<html>` must
carry `data-theme="light"` in the Elements panel on the very first paint. (The
page will still look dark — no light CSS exists yet. That is expected.)

---

## 7. Step 4 — `globals.css`, part A: the token blocks

**Edit `app/globals.css`.**

### 4a. Replace the custom-variant line

The `dark` class is gone, so the variant must follow the attribute. Replace:

```css
@custom-variant dark (&:is(.dark *));
```

with:

```css
/* Dark is the default palette, so "not light" is the correct test: it still
   matches if the attribute is somehow missing. Neither variant is used anywhere
   in the build today — they exist so a future `dark:` or `light:` utility works
   without anyone having to rediscover this mechanism. */
@custom-variant dark (&:where(:root:not([data-theme="light"]) *));
@custom-variant light (&:where(:root[data-theme="light"] *));
```

### 4b. Wrap the existing `:root` block in markers and add the new tokens

Find the existing `:root { ... }` raw-token block. Change its header comment,
add the marker comments (Step 16's parity test reads them — **do not omit or
reword them**), and add the tokens listed below.

Replace the block's opening comment and first lines:

```css
/* ==========================================================================
   RAW TOKENS
   Two palettes. Dark is the default and lives on bare :root, so a failure of
   the inline theme script degrades to the shipped design rather than to
   unstyled text. Light overrides only what must change, at
   :root[data-theme="light"].

   Every value is contrast-checked; the working is in docs/LIGHT-MODE-PLAN.md §3.
   ========================================================================== */

/* == TOKENS:DARK == */
:root {
  color-scheme: dark;
  ...
```

Immediately after `--ring: #39ff14;` — i.e. before the `/* ---- paper ground` 
comment — insert:

```css
  /* ---- the tie hatch. Drawn OVER an --attention fill, so it must oppose it. ---- */
  --hatch: rgba(26, 26, 26, 0.55);

  /* ---- the grain and the wireframe wallpaper ---- */
  --grain-opacity: 0.015;
  --grain-blend: normal;
  --matter-opacity: 0.14;
```

Rewrite the paper-ground comment and block (four tokens are new):

```css
  /* ---- THE INVERTING BAND.
          "paper" is historical. These tokens mean "the band that OPPOSES the
          page", not "white": in dark mode the band is paper, in light mode it is
          charcoal. `.paper-band` and `vine.css` read only these names, so both
          invert for free. Read docs/LIGHT-MODE-PLAN.md §2.4 before renaming.
          NEVER put --accent on this band. #39FF14 on #FAFAFA is 1.30:1 — which
          is exactly why --paper-accent exists. ---- */
  --paper: #fafafa;
  --paper-ink: #1a1a1a;
  --paper-muted: #5f5f5f;         /* 6.1:1 on paper */
  --paper-accent: #1b7a00;        /* 5.3:1 on paper */
  --paper-border: #d4d4d4;
  --paper-surface: #f0f0f0;
  --paper-faint: #c8c8c8;
  --paper-border-strong: #8f8f8f;
  --paper-border-hover: #a3a3a3;
```

At the very end of the `:root` block, after `--nav-w-collapsed: 72px;`, add:

```css
  /* ---- the theme switch. Must equal THEME_WIPE_MS in lib/theme.tsx. ---- */
  --theme-wipe-ms: 620ms;
}
/* == /TOKENS:DARK == */
```

### 4c. Add the light block

Immediately after the closing `/* == /TOKENS:DARK == */` marker, before the
`@media (min-width: 768px)` rule, insert:

```css
/* == TOKENS:LIGHT == */
:root[data-theme="light"] {
  color-scheme: light;

  /* ---- paper ground ---- */
  --background: #fafafa;          /* never pure white */
  --foreground: #1a1a1a;          /* 16.7:1 */
  --muted: #f0f0f0;               /* the one elevated surface */
  --muted-foreground: #1a1a1a;    /* same as --foreground, mirroring dark */
  --faint: #1a1a1a;               /* same as --foreground, mirroring dark */

  /* NEON IS ILLEGAL ON THIS GROUND. #39ff14 on #fafafa is 1.30:1. */
  --accent: #1b7a00;              /* 5.25:1 */
  --accent-foreground: #fafafa;
  --attention: #9a5a00;           /* 5.25:1 — deliberately equal to --accent */
  --attention-foreground: #fafafa;

  --border: #e6e6e6;              /* decorative hairlines only. 1.20:1 */
  --border-strong: #8f8f8f;       /* every control boundary. 3.10:1, WCAG 1.4.11 */
  --border-hover: #a3a3a3;

  /* Dark recesses the card below the ground; light raises it above. */
  --card: #ffffff;
  --card-foreground: #1a1a1a;
  --input: #fafafa;
  --ring: #1b7a00;

  --hatch: rgba(250, 250, 250, 0.55);

  --grain-opacity: 0.03;
  --grain-blend: multiply;
  --matter-opacity: 0.07;

  /* ---- the inverting band, now charcoal ---- */
  --paper: #1a1a1a;
  --paper-ink: #fafafa;
  --paper-muted: #8a8a8a;         /* 5.04:1 on charcoal */
  --paper-accent: #39ff14;        /* neon is legal here: 12.8:1 */
  --paper-border: #262626;
  --paper-surface: #232323;
  --paper-faint: #4a4a4a;
  --paper-border-strong: #666666;
  --paper-border-hover: #404040;

  /* ---- shadcn compatibility aliases ---- */
  --primary: #1a1a1a;
  --primary-foreground: #fafafa;
  --secondary: #f0f0f0;
  --secondary-foreground: #1a1a1a;
  --popover: #ffffff;
  --popover-foreground: #1a1a1a;
  --destructive: #1a1a1a;         /* no red in this build */
}
/* == /TOKENS:LIGHT == */
```

> The light block deliberately does **not** re-declare the font stacks, `--ease`,
> `--topbar-h`, `--nav-w`, `--nav-w-collapsed` or `--theme-wipe-ms`. Those are not
> colours and must stay single-sourced on `:root`. Step 16's parity test knows
> this and only compares the tokens it is given an allowlist for.

### 4d. Extend the `@theme inline` map

In the `@theme inline` block, after `--color-paper-border: var(--paper-border);`,
add the four new band tokens so they are reachable as utilities:

```css
  --color-paper-surface: var(--paper-surface);
  --color-paper-faint: var(--paper-faint);
  --color-paper-border-strong: var(--paper-border-strong);
  --color-paper-border-hover: var(--paper-border-hover);
```

**Verify:** `npm run dev`. With `sonder.theme` set to `"light"` in
`localStorage`, hard-reload `/student`. The whole product should now be light:
paper ground, charcoal type, deep-green accent, grey hairlines. The landing hero
will look wrong (washed-out brain) — Step 5b fixes that. Nothing else should be
broken.

---

## 8. Step 5 — `globals.css`, part B: the two band classes

### 5a. Rewrite `.paper-band` so it holds no literal colour

Find the existing `.paper-band` rule and replace it wholesale:

```css
/* The inverting band. Re-points every token so children written against the page
   palette keep working, inverted, with no per-child overrides. In dark mode this
   band is paper; in light mode it is charcoal. There must be NO literal colour
   in this rule — every value comes from a --paper-* token so the inversion is
   automatic. See docs/LIGHT-MODE-PLAN.md §2.4. */
.paper-band {
  background: var(--paper);
  color: var(--paper-ink);
  --background: var(--paper);
  --foreground: var(--paper-ink);
  --muted-foreground: var(--paper-muted);
  --faint: var(--paper-faint);
  --accent: var(--paper-accent);
  --accent-foreground: var(--paper);
  --border: var(--paper-border);
  --border-strong: var(--paper-border-strong);
  --border-hover: var(--paper-border-hover);
  --card: var(--paper);
  --muted: var(--paper-surface);
}
```

> Note `--accent-foreground: var(--paper)`. In dark mode that is `#fafafa` on a
> `#1b7a00` accent (5.25 : 1 ✓); in light mode it is `#1a1a1a` on a `#39ff14`
> accent (12.8 : 1 ✓). Both directions pass, which is why the token, not a
> literal, is correct here.

### 5b. Add `.ink-stage` — the hero's permanent night

Add immediately after `.paper-band`:

```css
/* THE HERO IS ALWAYS DARK. The WebGL brain's Fresnel alphas are compiled into
   GLSL at material-construction time (lib/landing/three/teal-material.ts), so
   the brain cannot be re-themed without rebuilding a 2.5MB scene — and a 10%
   transparent neon-green object on #fafafa would be invisible anyway. The hero
   is the theatre, and the theatre keeps the lights down in both themes.

   In dark mode every declaration here re-points a token to the value it already
   holds: a deliberate no-op. Do NOT "simplify" it away.
   See docs/LIGHT-MODE-PLAN.md §2.5. */
.ink-stage {
  color-scheme: dark;
  color: #fafafa;
  --background: #1a1a1a;
  --foreground: #fafafa;
  --muted: #232323;
  --muted-foreground: #fafafa;
  --faint: #fafafa;
  --accent: #39ff14;
  --accent-foreground: #1a1a1a;
  --attention: #ffb020;
  --attention-foreground: #1a1a1a;
  --border: #262626;
  --border-strong: #666666;
  --border-hover: #404040;
  --card: #0f0f0f;
}
```

### 5c. Make the grain theme-aware

In the `@layer base` block, change the two `body::after` declarations:

```css
    opacity: var(--grain-opacity);
    mix-blend-mode: var(--grain-blend);
```

(replacing the hardcoded `opacity: 0.015;`).

**Verify:** nothing visible changes yet in dark mode — confirm that. In light
mode the mechanism band should now be **charcoal with a white vine**, and the
page grain should read as paper tooth rather than a haze.

---

## 9. Step 6 — apply `.ink-stage` to the hero

**Edit `components/landing/HeroStage.tsx`.** One class added to the section:

```tsx
<section
  ref={sectionRef}
  className="hero-stage ink-stage relative h-[100dvh] min-h-[100dvh] w-full"
>
```

**Edit `components/landing/styles/landing.css`.** Remove the page-level
`color-scheme: dark` so the landing inherits the theme; the hero keeps its own
via `.ink-stage`.

```css
.sonder-landing {
  position: relative;
  min-height: 100dvh;
  color: var(--foreground);
  /* color-scheme is inherited from :root. The hero pins its own via .ink-stage. */
}
```

**Verify:** in light mode, load `/`. The hero is charcoal, the brain reads
correctly, the `from-background` legibility scrim under the headline is charcoal
(not paper), and the boundary between the hero and the Thesis section is a clean
edge. In dark mode the hero is pixel-identical to before.

---

## 10. Step 7 — the toggle component

**Create `components/app/ThemeToggle.tsx`.**

Sized and shaped like `MusicToggle` (`size-11`, hairline-free, colour-only
hover) so the topbar cluster stays rhythmically even.

```tsx
"use client";

import { useId, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";
import {
  useTheme,
  applyTheme,
  THEME_STORAGE_KEY,
  DEFAULT_THEME,
  type Theme,
} from "@/lib/theme";

const LABEL: Record<Theme, string> = {
  dark: "Switch to light theme",
  light: "Switch to dark theme",
};

/**
 * The theme switch. Shows the theme you would move TO: a sun while dark, a moon
 * while light. One SVG does both — a disc masked by a circle that slides across
 * to carve a crescent, and eight rays that retract. Every transition is CSS,
 * driven off [data-theme] on <html>, so the mark stays correct in browsers with
 * no View Transition support and needs no JS to stay in sync.
 *
 * The click hands the button's centre to the store, which expands the page-wide
 * circular wipe from that point.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  // useId can emit characters that are illegal in a fragment identifier.
  const maskId = `tk-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // React's Strict Mode remount in development resets <html> to only the
  // attributes it manages from JSX, clearing the one the inline script set.
  // Re-apply before paint. A no-op in production. This is the fix the Next.js
  // guide prescribes; see its "Re-applying attributes in development" section.
  useLayoutEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    applyTheme(stored === "light" || stored === "dark" ? stored : DEFAULT_THEME);
  }, []);

  return (
    <button
      type="button"
      data-theme-state={theme}
      aria-label={LABEL[theme]}
      title={LABEL[theme]}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      className={cn(
        "theme-toggle grid size-11 shrink-0 place-items-center",
        "text-muted-foreground transition-colors duration-150 hover:text-accent",
        className,
      )}
    >
      <svg
        className="theme-toggle-mark"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden
        focusable="false"
      >
        {/* maskUnits/maskContentUnits are set explicitly: the default
            objectBoundingBox units are computed from the masked element's bbox
            and would clip the crescent. */}
        <mask
          id={maskId}
          maskUnits="userSpaceOnUse"
          maskContentUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="24"
          height="24"
        >
          <rect x="0" y="0" width="24" height="24" fill="#fff" />
          {/* Parked clear of the disc while dark (centre 16.3 units away, r=8,
              disc outer radius 7.25). Slides onto it to carve the moon. */}
          <circle className="tk-bite" cx="26" cy="-2" r="8" fill="#000" />
        </mask>

        <g
          className="tk-rays"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" />
          <line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
          <line x1="4.2" y1="19.8" x2="5.6" y2="18.4" />
          <line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
        </g>

        <circle
          className="tk-disc"
          cx="12"
          cy="12"
          r="6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          mask={`url(#${maskId})`}
        />
      </svg>
    </button>
  );
}
```

**Geometry, so nobody re-tunes it blind.** The disc is centred `(12,12)` with
`r = 6.5` and a `1.5` stroke, so its outer radius is `7.25`. The bite circle has
`r = 8`.

- Parked (sun): bite centre `(26,-2)`; distance to the disc centre is
  `hypot(14,14) = 19.80`, leaving `19.80 − 8 = 11.80` of clearance over the
  disc's `7.25`. It cannot graze the disc.
- Moon: bite centre `(18,7)`, i.e. `translate(-8px, 9px)`. Distance to the disc
  centre is `hypot(6,5) = 7.81`, so it eats the upper-right of the ring; the
  disc's far-left point `(5.5,12)` is `hypot(12.5,5) = 13.46` away — well outside
  the bite — so a clean crescent survives, opening toward the upper right.

**Verify:** `npx tsc --noEmit`. The mark will be unstyled until Step 8.

---

## 11. Step 8 — `globals.css`, part C: the sun ⇄ moon morph

Add a new section to `app/globals.css`, immediately **after** the
`.rule-sweep` rules at the end of the file:

```css
/* ==========================================================================
   THE THEME SWITCH
   Two layers: this one (a CSS-only mark morph, works everywhere) and the
   circular page wipe below (View Transition API, progressive enhancement).
   ========================================================================== */

.theme-toggle-mark {
  /* The rays sit at the viewBox edge; overflow must not clip them mid-rotation. */
  overflow: visible;
}

.theme-toggle-mark .tk-bite,
.theme-toggle-mark .tk-rays,
.theme-toggle-mark .tk-disc {
  /* view-box + center puts every child's transform origin at (12,12), the disc
     centre, which is what makes the rays counter-rotate around the sun rather
     than around their own midpoints. */
  transform-box: view-box;
  transform-origin: center;
  transition:
    transform 420ms var(--ease),
    opacity 420ms var(--ease);
}

/* ---- dark: the sun (the state you would move TO) ---- */
.theme-toggle-mark .tk-bite { transform: none; }
.theme-toggle-mark .tk-rays { opacity: 1; transform: rotate(0deg) scale(1); }
.theme-toggle-mark .tk-disc { transform: scale(1) rotate(0deg); }

/* ---- light: the moon ---- */
:root[data-theme="light"] .theme-toggle-mark .tk-bite {
  transform: translate(-8px, 9px);
}
:root[data-theme="light"] .theme-toggle-mark .tk-rays {
  opacity: 0;
  transform: rotate(-45deg) scale(0.5);
}
:root[data-theme="light"] .theme-toggle-mark .tk-disc {
  transform: scale(1.06) rotate(-18deg);
}

/* The two directions are deliberately asymmetric, and the asymmetry is carried
   by specificity alone — no JS, no extra state:
     going TO light, the light rule (0,3,0) wins and the rays retract with no
       delay, so the disc is already closing as they fold away;
     going TO dark, the base rule (0,2,0) applies and the rays wait 90ms, so the
       crescent has filled back into a full disc BEFORE the sun grows its rays.
   Without this the rays sprout out of a crescent, which reads as a mistake. */
.theme-toggle-mark .tk-rays { transition-delay: 90ms; }
:root[data-theme="light"] .theme-toggle-mark .tk-rays { transition-delay: 0ms; }
```

> Specificity note, because this trips people: `:root[data-theme="light"] .x`
> is `(0,3,0)` and `.theme-toggle-mark .x` is `(0,2,0)`, and both match the same
> element — so the light rule wins whenever the attribute is set. That is only
> true *within* the mark. It is **not** how `.paper-band` and `.ink-stage` win:
> those match a different element (a section, not `<html>`), and a custom
> property set directly on an element always beats an inherited one no matter
> what the specificities are. Do not "fix" either mechanism to look like the
> other.

The existing global `prefers-reduced-motion` block already collapses every
`transition-duration` to `0.01ms`, so the mark snaps rather than morphs. No extra
rule needed — confirm this rather than adding one.

**Verify:** click the toggle (once Step 10 has mounted it) and watch the mark
alone. Sun → moon in 420 ms with the rays folding away. Then set
`prefers-reduced-motion: reduce` in DevTools' Rendering pane: the mark must snap
instantly and the theme must still change.

---

## 12. Step 9 — `globals.css`, part D: the circular page wipe

Add directly below the Step 8 block. **Read the three sub-notes before pasting —
this is the part with real collision risk.**

```css
/* --------------------------------------------------------------- the wipe
 * Everything here is scoped to :root[data-theme-switch="1"], which lib/theme.tsx
 * sets immediately BEFORE calling startViewTransition and clears when the
 * transition settles. That scoping is load-bearing: without it these rules would
 * also fire on every route navigation, which is a different view transition with
 * a stale --theme-r.
 */

/* (a) The chrome is normally frozen across route swaps by its own
 *     view-transition-name. During a theme switch it must instead be part of the
 *     root snapshot — otherwise the header and sidebar are lifted into their own
 *     un-animated groups and the wipe sweeps around two static holes. */
:root[data-theme-switch="1"] .topbar,
:root[data-theme-switch="1"] .workspace-nav {
  view-transition-name: none;
}

/* (b) The old view is held perfectly still underneath; the new view is revealed
 *     through an expanding circle centred on the button that was pressed.
 *     mix-blend-mode MUST be reset: the UA stylesheet sets plus-lighter on both
 *     snapshots for its default cross-fade, which would make the wipe glow at
 *     the seam instead of cutting cleanly. */
:root[data-theme-switch="1"]::view-transition-old(root) {
  animation: none;
  mix-blend-mode: normal;
  z-index: 1;
}
:root[data-theme-switch="1"]::view-transition-new(root) {
  animation: theme-wipe var(--theme-wipe-ms) var(--ease) both;
  mix-blend-mode: normal;
  z-index: 2;
}

/* Custom properties inherit from the document element into the
   ::view-transition pseudo tree, which is how these keyframes read the origin
   lib/theme.tsx wrote. The fallbacks cover a switch fired before any origin was
   recorded (e.g. from another tab's storage event). */
@keyframes theme-wipe {
  from {
    clip-path: circle(0px at var(--theme-x, 50%) var(--theme-y, 50%));
  }
  to {
    clip-path: circle(var(--theme-r, 150vmax) at var(--theme-x, 50%) var(--theme-y, 50%));
  }
}

/* (c) Lift the mark out of the page snapshot so it stays live above the sweep
 *     and cross-rotates, instead of being frozen into the image. Exactly one
 *     ThemeToggle is ever mounted (TopBar renders landing OR product slots), so
 *     the name is guaranteed unique — do not add a second one elsewhere without
 *     giving it a different name. */
:root[data-theme-switch="1"] .theme-toggle-mark {
  view-transition-name: theme-knob;
}
:root[data-theme-switch="1"]::view-transition-group(theme-knob) {
  z-index: 3;
}
:root[data-theme-switch="1"]::view-transition-image-pair(theme-knob) {
  isolation: auto;
}
:root[data-theme-switch="1"]::view-transition-old(theme-knob),
:root[data-theme-switch="1"]::view-transition-new(theme-knob) {
  mix-blend-mode: normal;
  animation-duration: 420ms;
  animation-timing-function: var(--ease);
  animation-fill-mode: both;
}
:root[data-theme-switch="1"]::view-transition-old(theme-knob) {
  animation-name: theme-knob-out;
}
:root[data-theme-switch="1"]::view-transition-new(theme-knob) {
  animation-name: theme-knob-in;
}
@keyframes theme-knob-out {
  from { opacity: 1; transform: none; }
  to   { opacity: 0; transform: rotate(-120deg) scale(0.3); }
}
@keyframes theme-knob-in {
  from { opacity: 0; transform: rotate(120deg) scale(0.3); }
  to   { opacity: 1; transform: none; }
}
```

Three things that are already handled and must **not** be "fixed" again:

1. **Reduced motion.** The existing block at the end of the MOTION section
   already sets `::view-transition-group(*)`, `-old(*)` and `-new(*)` to
   `animation: none !important`. On top of that, `setTheme` skips
   `startViewTransition` entirely when reduced motion is set, so the attribute is
   never applied and none of these rules can match. Two independent guards, on
   purpose.
2. **Route transitions.** `::view-transition-old(.page-swap)` /
   `-new(.page-swap)` are *class*-scoped selectors matching the name React's
   `<ViewTransition default="page-swap">` applies. `root` never matches them, and
   every rule above is attribute-scoped. The two systems cannot see each other.
3. **`::view-transition { pointer-events: none; }`** already exists and is
   correct — it keeps the frozen snapshot from swallowing clicks. Leave it.

**Verify:** click the toggle at the far right of the topbar. Light should flood
diagonally from that corner across the whole viewport in ~620 ms, header and
sidebar included, with the mark spinning above it. Then navigate between two
product routes and confirm the page-swap fade is unchanged.

---

## 13. Step 10 — put the toggle in the navbar

**Edit `components/app/TopBar.tsx`.**

1. Add the import next to the `MusicToggle` one:
   ```tsx
   import { ThemeToggle } from "./ThemeToggle";
   ```

2. In `LandingSlots`, the toggle joins `MusicToggle` at the end of the nav,
   outside the scrolling link list:
   ```tsx
       </div>
       <ThemeToggle />
       <MusicToggle />
     </nav>
   ```

3. In `ProductSlots`, in the right-hand cluster:
   ```tsx
   <div className="ml-auto flex shrink-0 items-center gap-2">
     <ThemeToggle />
     <MusicToggle />
     <RoleMenu />
   </div>
   ```

Order is deliberate — theme first, then music, then identity: least to most
personal, left to right. Both clusters use `gap-2` and 44 px hit targets, so
adding a third control does not change the header's height or rhythm.

**Do not add a second toggle to `MobileNav`.** The topbar toggle is rendered at
every breakpoint (`ProductSlots`' right cluster is not breakpoint-gated), and a
second instance would duplicate the `theme-knob` view-transition-name, which
throws the whole transition away.

**Verify:** the toggle is visible on `/` and on `/student`, at 375 px and at
1440 px width. Tab to it: the focus ring is the accent outline from the base
FOCUS LOCK rule.

---

## 14. Step 11 — the toast theme

**Edit `components/ui/sonner.tsx`.** Sonner paints its own surface from an
internal palette selected by its `theme` prop, so a hardcoded `"dark"` would
leave a black toast on the paper ground.

The `style` block already points at `var(--card)`, `var(--foreground)` and
`var(--border-strong)`, so those follow the theme by themselves. Only the
`theme` prop and the arrow-function body change. Replace the file with:

```tsx
"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";
import { Check, AlertTriangle, Minus } from "lucide-react";
import { useTheme } from "@/lib/theme";

/**
 * Icons follow the plan's four status buckets: confirmed, attention, inert.
 * There is no error/red state anywhere in this build, so `error` reuses the
 * attention glyph. The surface colours come from our own tokens in the style
 * block below; `theme` only selects Sonner's internal defaults underneath them,
 * which is why it has to follow ours.
 */
const Toaster = (props: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme}
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
};

export { Toaster };
```

`Toaster` is rendered from `app/providers.tsx`, which is already a client
component, so calling `useTheme()` here needs no other change.

**Verify:** trigger a toast in light mode (`/teacher/session/...` review actions
fire one) and confirm it is a white card with charcoal text and a grey hairline.

---

## 15. Step 12 — the tie hatch

**Edit `components/shared/PosteriorBarSet.tsx`.** The hatch is drawn *over* a
`bg-attention` fill, so it must oppose that fill, and the fill inverts with the
theme. Replace the hardcoded literal:

```tsx
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(45deg, transparent 0 3px, var(--hatch) 3px 6px)",
                    }}
```

**Verify:** find a tied posterior (`/student/session/...` in a tie state, or the
`/dev/components` gallery) and confirm the diagonal hatch is visible over the
amber bar in both themes. This is a **WCAG 1.4.1 non-colour-cue**, not
decoration: if it disappears in light mode the tie state becomes colour-only.

---

## 16. Step 13 — the wireframe wallpaper

Two files. The fixed WebGL field behind every route is neon green at 14 %; over
the paper ground that reads as a green haze across the whole product.

### 13a. `components/ui/anomalous-matter-hero.tsx`

Take a `color` prop and update the uniform in place. **A colour change must not
re-create the scene** — the mount effect keeps its `[]` deps.

1. Change the signature and add two refs:
   ```tsx
   export function GenerativeArtScene({ color = NEON }: { color?: string }) {
     const mountRef = useRef<HTMLDivElement>(null);
     const materialRef = useRef<THREE.ShaderMaterial | null>(null);
     const redrawRef = useRef<(() => void) | null>(null);
   ```

2. Inside the mount effect, immediately after `scene.add(mesh);`:
   ```tsx
       materialRef.current = material;
       redrawRef.current = () => renderer.render(scene, camera);
   ```

3. In that effect's cleanup, before or alongside the existing disposal:
   ```tsx
       materialRef.current = null;
       redrawRef.current = null;
   ```

4. Add a second effect **after** the mount effect (declaration order matters:
   effects run in order, so the material already exists on the first pass):
   ```tsx
     // The colour is a uniform, so it changes without recompiling the shader or
     // re-creating the scene. Under reduced motion there is no rAF loop, so the
     // canvas must be told to repaint once.
     useEffect(() => {
       const material = materialRef.current;
       if (!material) return;
       material.uniforms.color.value.set(color);
       redrawRef.current?.();
     }, [color]);
   ```

### 13b. `components/app/BackgroundMatter.tsx`

Opacity comes from a CSS token (so it is correct before hydration); the colour
comes from React (the canvas is client-only anyway, so there is nothing to flash).

```tsx
"use client";

import dynamic from "next/dynamic";
import { useTheme } from "@/lib/theme";

const GenerativeArtScene = dynamic(
  () =>
    import("@/components/ui/anomalous-matter-hero").then(
      (m) => m.GenerativeArtScene,
    ),
  { ssr: false },
);

/** Neon is the dark ground's texture. On paper it reads as a green haze, so
 *  light mode swaps in the deep accent — the same #1b7a00 --accent resolves to,
 *  restated here because a WebGL uniform cannot read a CSS variable. */
const MATTER_COLOR = { dark: "#39FF14", light: "#1b7a00" } as const;

/**
 * Fixed wallpaper behind every route. Opacity keeps the field as ground, not
 * content, and comes from --matter-opacity so it is already correct at first
 * paint. pointer-events none, so it never intercepts the UI.
 */
export function BackgroundMatter() {
  const { theme } = useTheme();
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: "var(--matter-opacity)" }}
    >
      <GenerativeArtScene color={MATTER_COLOR[theme]} />
    </div>
  );
}
```

**Verify:** in light mode the wallpaper is a barely-there sage texture, not a
green cast. Toggle back and forth five times and watch the DevTools memory /
WebGL context count: **the context count must not grow.** If it does, the mount
effect's dependency array was changed — put it back to `[]`.

---

## 17. Step 14 — the stale comment in `Providers`

**Edit `app/providers.tsx`.** The doc comment now states the opposite of the
truth, which is worse than no comment:

```tsx
/**
 * Theme lives in lib/theme.tsx — a module-level store, not a provider — so
 * nothing needs to be added here. globals.css holds both palettes and
 * app/layout.tsx applies the stored one before first paint.
 */
```

**Verify:** `npm run lint`.

---

## 18. Step 15 — tests

### 15a. `lib/theme.test.ts` — the store

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  setTheme,
  toggleTheme,
  applyTheme,
  THEME_STORAGE_KEY,
  THEME_ATTRIBUTE,
  DEFAULT_THEME,
  __resetThemeStoreForTests,
} from "./theme";

describe("theme store", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
    __resetThemeStoreForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to dark, ignoring the OS preference", () => {
    expect(DEFAULT_THEME).toBe("dark");
  });

  it("writes the attribute and the stored value", () => {
    setTheme("light");
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("toggles from the stored value, not from the attribute", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    __resetThemeStoreForTests();
    toggleTheme();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("treats an unrecognised stored value as the default", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "sepia");
    __resetThemeStoreForTests();
    toggleTheme();
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
  });

  it("still applies the theme when startViewTransition is unavailable", () => {
    // jsdom has no View Transition API, which is exactly the fallback path.
    expect(
      (document as Document & { startViewTransition?: unknown })
        .startViewTransition,
    ).toBeUndefined();
    setTheme("light");
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("light");
  });

  it("survives a localStorage that throws", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(() => setTheme("light")).not.toThrow();
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("light");
  });

  it("applyTheme is the only thing that touches the DOM", () => {
    applyTheme("light");
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("light");
    applyTheme("dark");
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("dark");
  });
});
```

### 15b. `components/app/ThemeToggle.test.tsx` — the control

```tsx
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  THEME_STORAGE_KEY,
  THEME_ATTRIBUTE,
  __resetThemeStoreForTests,
} from "@/lib/theme";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute(THEME_ATTRIBUTE);
    __resetThemeStoreForTests();
  });

  afterEach(cleanup);

  it("offers light while dark, and flips on click", () => {
    render(<ThemeToggle />);

    const button = screen.getByRole("button", { name: "Switch to light theme" });
    expect(button.getAttribute("data-theme-state")).toBe("dark");

    fireEvent.click(button);

    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    ).toBeTruthy();
  });

  it("reads the stored preference on mount", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    __resetThemeStoreForTests();
    render(<ThemeToggle />);
    expect(
      screen.getByRole("button", { name: "Switch to dark theme" }),
    ).toBeTruthy();
    // The useLayoutEffect re-apply covers React's dev-only Strict Mode remount.
    expect(document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe("light");
  });

  it("gives the mask a unique, fragment-safe id", () => {
    const { container } = render(<ThemeToggle />);
    const mask = container.querySelector("mask");
    expect(mask?.id).toMatch(/^tk-[A-Za-z0-9_-]+$/);
    expect(container.querySelector(".tk-disc")?.getAttribute("mask")).toBe(
      `url(#${mask?.id})`,
    );
  });
});
```

### 15c. `app/globals.test.ts` — token parity

The guardrail that stops a colour being added to one palette and forgotten in the
other. It relies on the `/* == TOKENS:DARK == */` markers from Step 4b — if this
test cannot find them, the markers were dropped or reworded.

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const css = readFileSync(
  path.join(process.cwd(), "app/globals.css"),
  "utf8",
);

/** Tokens that are structural, not palette, and correctly live only on :root. */
const DARK_ONLY = new Set([
  "--stack-sans",
  "--stack-mono",
  "--stack-quote",
  "--ease",
  "--topbar-h",
  "--nav-w",
  "--nav-w-collapsed",
  "--theme-wipe-ms",
]);

function slice(marker: string): string {
  const open = `/* == TOKENS:${marker} == */`;
  const close = `/* == /TOKENS:${marker} == */`;
  const start = css.indexOf(open);
  const end = css.indexOf(close);
  expect(start, `missing ${open} in app/globals.css`).toBeGreaterThan(-1);
  expect(end, `missing ${close} in app/globals.css`).toBeGreaterThan(start);
  return css.slice(start + open.length, end);
}

function tokens(block: string): Set<string> {
  return new Set(
    [...block.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]),
  );
}

describe("globals.css palettes", () => {
  const dark = tokens(slice("DARK"));
  const light = tokens(slice("LIGHT"));

  it("gives every dark palette token a light counterpart", () => {
    const missing = [...dark].filter(
      (t) => !DARK_ONLY.has(t) && !light.has(t),
    );
    expect(missing, `light palette is missing: ${missing.join(", ")}`).toEqual([]);
  });

  it("does not invent tokens that exist only in light", () => {
    const extra = [...light].filter((t) => !dark.has(t));
    expect(extra, `light palette has orphans: ${extra.join(", ")}`).toEqual([]);
  });

  it("declares color-scheme in both", () => {
    expect(slice("DARK")).toContain("color-scheme: dark");
    expect(slice("LIGHT")).toContain("color-scheme: light");
  });

  it("never puts the neon accent on the paper ground", () => {
    const lightBlock = slice("LIGHT").toLowerCase();
    // #39ff14 is legal in the light block ONLY as --paper-accent, because that
    // band is charcoal in light mode.
    const neonLines = lightBlock
      .split("\n")
      .filter((l) => l.includes("#39ff14"));
    expect(neonLines.every((l) => l.includes("--paper-accent"))).toBe(true);
  });

  it("keeps .paper-band free of literal colour so it can invert", () => {
    const start = css.indexOf(".paper-band {");
    const band = css.slice(start, css.indexOf("}", start));
    expect(band).not.toMatch(/#[0-9a-f]{3,8}/i);
    expect(band).not.toMatch(/rgba?\(/i);
  });
});
```

### 15d. `components/app/AppShell.test.tsx` — extend, do not replace

Add one assertion to the existing `"shows landing slots on /"` test and one to
the product-slots test, so the toggle can never silently fall out of the chrome:

```tsx
    expect(
      screen.getByRole("button", { name: /Switch to (light|dark) theme/ }),
    ).toBeTruthy();
```

The existing tests wrap the shell in `SessionProvider` and `MusicProvider`. The
theme store needs **no provider**, so no wrapper changes are required. Add
`document.documentElement.removeAttribute("data-theme")` to that file's existing
`afterEach`, next to `localStorage.clear()`, so tests do not leak state into each
other.

**Verify:** `npm test` — all suites green.

---

## 19. Step 16 — manual QA checklist

Run every line. Half of these cannot be caught by the test suite.

**Flash and persistence**
- [ ] Set light, hard-reload `/`. No dark frame at any point, on a cold cache
      with network throttled to Slow 3G. (This is the whole point of Step 3.)
- [ ] Set light, open a new tab to `/teacher`. Loads light.
- [ ] Toggle in tab A; tab B follows within a second (the `storage` bridge).
- [ ] Block all site data in the browser, load the app. It renders dark and the
      toggle click is a no-op that does not throw.

**The animation**
- [ ] Wipe expands from the button, not from the screen centre.
- [ ] The header and the left sidebar are wiped **with** the page, not left
      behind. (If they lag, Step 9a did not land.)
- [ ] No white or coloured flash at the seam. (If there is, `mix-blend-mode:
      normal` is missing — Step 9b.)
- [ ] The mark rotates above the wipe rather than being frozen into it.
- [ ] Toggle rapidly ten times. No stuck `data-theme-switch` attribute on
      `<html>`, no orphaned `::view-transition` pseudo tree.
- [ ] Toggle mid-route-navigation. Neither transition corrupts the other.
- [ ] DevTools → Rendering → emulate `prefers-reduced-motion: reduce`. The theme
      changes **instantly**, with no wipe and no morph.
- [ ] Firefox and Safari: either the wipe plays, or the theme snaps cleanly.
      Never a half-drawn circle.

**The light palette, page by page** — walk `/`, `/student`, `/student/start`,
`/student/session/*`, `/student/learn/*`, `/student/consultant`,
`/teacher`, `/teacher/session/*`, `/teacher/content-review/*`,
`/parent`, `/parent/summary/*`, `/admin/*`, `/dev/components`, and `/404`:
- [ ] No neon green anywhere on a paper ground. Accent is `#1b7a00`.
- [ ] Hairlines are visible — sections and rows still read as separated.
- [ ] `text-faint` decorative type is legible, not invisible.
- [ ] Focus rings are visible on every control (deep green, 2 px, 2 px offset).
- [ ] Selection highlight is readable.
- [ ] Sonner toasts are light.
- [ ] The tie hatch in `PosteriorBarSet` is visible over the amber bar.
- [ ] Native scrollbars are light, not dark. (If dark, `color-scheme` is wrong.)

**The landing specifically**
- [ ] The hero stays charcoal and the brain reads exactly as it does in dark.
- [ ] The legibility scrim under the hero headline is charcoal, not paper.
- [ ] The mechanism band is charcoal, the vine is a white line drawing with a
      neon accent, and the vine's node knots have a charcoal fill (`--paper`).
- [ ] The topbar is transparent over the hero and turns paper after the sentinel.
- [ ] Scroll the whole page with Lenis running. No section boundary tears.

**Accessibility**
- [ ] Every light-mode text/background pair meets 4.5 : 1; every control boundary
      meets 3 : 1. Spot-check with DevTools' contrast readout, especially
      `--muted-foreground` on `--muted` and `--accent` on `--muted`.
- [ ] The toggle is reachable by keyboard, announces its action, and the label
      updates after activation.
- [ ] Zoom to 200 %. The three-control topbar cluster does not overflow.

---

## 20. Risks, and what to do about each

| Risk | Signal | Response |
|---|---|---|
| **The wipe leaves the header behind.** | Header stays in the old colours for 620 ms then snaps. | Step 9a did not apply. Confirm `data-theme-switch="1"` is on `<html>` *before* `startViewTransition` runs — put a breakpoint in `setTheme`. Setting it after is the classic error: the old snapshot has already been captured. |
| **The seam glows or ghosts.** | A bright rim on the expanding circle. | `mix-blend-mode: normal` missing from `::view-transition-old(root)` / `-new(root)` (Step 9b). The UA default is `plus-lighter`. |
| **The keyframes ignore the origin.** | The wipe always starts from the screen centre. | `--theme-x/y/r` were written on the wrong element. They must go on `document.documentElement`, which is what the pseudo tree inherits from. |
| **`view-transition-name` collision.** | The whole transition is abandoned; the theme snaps. | Two `.theme-toggle-mark` elements are mounted at once. Only the TopBar may render `ThemeToggle` (Step 10). |
| **A dark flash on load.** | One dark frame in light mode. | The inline script is not in `<head>`, or is being deferred. It must be an `InlineScript` inside `<head>`, above `<body>`, with no `strategy`/`next/script` wrapper. |
| **The theme resets on every dev refresh.** | Works in `npm run build`, not in `npm run dev`. | Strict Mode's remount clears `<html>` attributes. That is exactly what the `useLayoutEffect` in `ThemeToggle` (Step 7) exists for — confirm it survived. |
| **Hairlines vanish in light mode.** | Rows and sections blur into one field. | `--border` at `#e6e6e6` is intentionally near-invisible, mirroring dark's `#262626`. If real use disagrees, raise it to `#dcdcdc` (1.31 : 1) — but change it **only** in the light block, and re-run `app/globals.test.ts`. |
| **A WebGL context leak.** | Console warns about too many contexts after repeated toggles. | The mount effect in `anomalous-matter-hero.tsx` gained a dependency. It must stay `[]`; only the second, colour-only effect may depend on `color` (Step 13a). |
| **`npm test` fails on `globals.test.ts` after an unrelated CSS edit.** | "light palette is missing: --x". | Working as designed. Add the token to the light block, or to `DARK_ONLY` if it is genuinely structural. |

### Rollback

Every change is additive except four small edits (`layout.tsx`'s `<html>` tag,
`sonner.tsx`'s `theme` prop, `PosteriorBarSet`'s hatch literal, and
`landing.css`'s `color-scheme`). To disable light mode without reverting the
branch: delete the two lines that render `<ThemeToggle />` in `TopBar.tsx`. With
no way to set `sonder.theme`, every visitor gets the dark default and the
`:root[data-theme="light"]` block is dead CSS.

---

## 21. Files touched, in full

**New (6)**
- `lib/theme.tsx`
- `lib/theme.test.ts`
- `components/app/InlineScript.tsx`
- `components/app/ThemeToggle.tsx`
- `components/app/ThemeToggle.test.tsx`
- `app/globals.test.ts`

**Modified (11)**
- `app/globals.css` — the bulk of the work: custom variants, two token blocks,
  `.paper-band` rewrite, `.ink-stage`, the grain, the mark morph, the wipe
- `app/layout.tsx` — `data-theme`, `suppressHydrationWarning`, the head script,
  the `dark` class removed
- `app/providers.tsx` — comment only
- `components/app/TopBar.tsx` — two mount points
- `components/app/BackgroundMatter.tsx` — colour + token opacity
- `components/app/AppShell.test.tsx` — two assertions, one `afterEach` line
- `components/ui/sonner.tsx` — `theme` from the store
- `components/ui/anomalous-matter-hero.tsx` — `color` prop, uniform update
- `components/shared/PosteriorBarSet.tsx` — one style literal → `var(--hatch)`
- `components/landing/HeroStage.tsx` — one class
- `components/landing/styles/landing.css` — drop `color-scheme`

**Deliberately untouched** — if you edited any of these, you went off plan:
`lib/landing/three/*`, `components/landing/styles/brain-viewer.css`,
`components/landing/styles/hero-stage.css`,
`components/landing/styles/vine.css`, `components/landing/BrainViewer.tsx`,
every file under `app/student/`, `app/teacher/`, `app/parent/`, `app/admin/`,
and every component in `components/type/`, `components/shared/` (bar
`PosteriorBarSet`) and `components/layout/`. They are token-driven and follow the
theme for free. That is the point.

---

## 22. Optional Step 17 — a toggle for the component gallery

`/dev/components` renders with `chromeMode === "gallery"` and therefore has no
TopBar, so it has no way to switch themes — which is unfortunate, because it is
the fastest way to eyeball the whole palette.

If you want it, add to `app/dev/components/page.tsx` a single fixed-position
mount:

```tsx
<div className="fixed right-4 top-4 z-50 border border-border-strong bg-background">
  <ThemeToggle />
</div>
```

This is safe **only** because `AppShell` returns the bare `<div>` branch for
`chromeMode === "gallery"`, so no TopBar — and therefore no second
`.theme-toggle-mark` — is mounted on this route. Re-check
`components/app/AppShell.tsx` before shipping it. If `AppShell` ever starts
rendering chrome on `/dev`, delete this mount rather than trying to keep both:
two elements claiming `view-transition-name: theme-knob` make the browser
abandon the entire transition, and the wipe silently stops working everywhere.

This is the only optional step in the plan. Everything above it is required.
