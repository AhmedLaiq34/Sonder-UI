# Port notes — `brain-extract-anatomy` → `sonder-web`

Record of every intentional divergence from the design source
(`../brain-extract-anatomy`). Re-apply these when either upstream moves on.

Also records the **product overhaul** (`docs/OVERHAUL-PLAN.md`), which supersedes the
original merge plan's §12 (product sweep) and §10.4 (showcase).

## Defect fixes applied on port (D1–D6)

| ID | File | Change |
|---|---|---|
| D1 | `SonderWordmark.tsx` | Hydration-safe tracking: always initialise at `WM_TRACKING_LG`, then correct on mount via resize. |
| D2 | `VineScroller.tsx` | Render eyebrow, title, body, and meta (was title+body only). |
| D3 | `AetherFlow.tsx` | HiDPI canvas: DPR-aware backing store + `setTransform`; draw in CSS pixels via `viewW`/`viewH`. |
| D4 | `AetherFlow.tsx` | Particle cap `Math.min(220, …)` to bound O(n²) `connect()`. |
| D5 | Landing GSAP components | `useIsomorphicLayoutEffect` instead of `useLayoutEffect` for SSR. |
| D6 | `HeroStage.tsx` | `min-h-[100dvh] h-[100dvh]` instead of `h-screen`. |

## Behavioural additions (not in design source)

- **Hero lead copy + CTA pair** in `HeroStage.tsx`, with GSAP tween at `HERO_ENTRY_END - 0.1` and CTA styles appended to `hero-stage.css` only (neon button stays out of product CSS).
- **`href?: string` on `VineNode`** and Next `Link` on vine meta labels.
- **Real vine copy** in `lib/landing/vine/content.ts` (six product nodes; placeholders removed).
- **Reduced-motion bail** in `AetherFlow` (particle canvas hidden; static `.sonder-grid` remains).
- **Lenis** scoped to `Landing` mount/teardown (was module-scope in Vite `main.tsx`). Product scrolls the **document**; a leaked Lenis instance is load-bearing to destroy.
- **`document.fonts.ready` → `ScrollTrigger.refresh()`** in `Landing`.
- Landing composition: nav, thesis, vine, mechanism, guarantee, enter, footer.
- Dynamic imports for `AetherFlow` and `HeroStage` with `ssr: false`.

## Landing reduction (post-overhaul)

Documented in `docs/LANDING-REDUCTION-PLAN.md`. Baseline commit at start of this
workspace history: `7fb689d`. Sections deleted (recoverable from git history of
this branch once committed):

- `ThesisBand`, `MechanismStrip`, `GuaranteeBand`, `EnterSection`

Landing `<main>` is now: `HeroStage` → vine (`#narrative`). Product entry is
four workspace buttons in the floating navbar (Student / Teacher / Parent /
Admin). No "Enter the prototype" section or dropdown. Vine node `href` links
removed; meta is plain text. `RoleGate` adopts the deep-linked role instead of
bouncing unsigned visitors to `/`.

## Overhaul divergences (post-merge)

Documented in `docs/OVERHAUL-PLAN.md`. Key product-side changes that are **not** in the design source:

### Glass chrome
- `.sonder-glass` utility (web glassmorphism approximation; not Apple Liquid Glass) with `@supports` and `prefers-reduced-transparency` fallbacks.
- Floating `GlassRail` + `GlassTopBar` + mobile `GlassBottomBar` replace the flush opaque sidebar and hamburger drawer.
- Document is the scroll container (`data-shell="product"`); content passes behind fixed glass.
- Collapse sync via `data-collapsed` on `<html>` so rail width and top-bar `left` animate in lockstep.

### Landing trim
- **Showcase deleted** (`ShowcaseStage` + all vignettes). Landing drops to ~7 sections / ~11 viewports.
- `EnterSection` merged with former showcase claims: four workspace cards, primary sign-in + secondary "See it" proving links (Parent: primary only).
- `LandingNav` is a floating glass pill; centre links are Premise + Guarantee only (no `#showcase`).
- Removed dead `data-showcase-active` particle pause from `AetherFlow`.

### Seven page archetypes
Every product route uses exactly one shell under `components/app/shells/`:
Console, Worklist, Inspector, Focus, Article, Directory, Conversation.
`StatTile` deleted; replaced by hairline `MetricStrip`. Shared: `PageHeader`, `LeadPanel`, `WorklistRow`, `StepTimeline`, `DataTable`, `FilterStrip`.
`FocusShell` sets/clears `data-focus` on `<html>`.

### Glass surface cap
Product glass surfaces: rail, top bar, step timeline (plus bottom bar on mobile when the rail is absent). Landing pill uses the same `.sonder-glass` class.

## Font bridges (do not edit source CSS files)

In `components/landing/styles/landing.css` only:

- `.sonder-landing .vine-scroller` overrides `--v-font-serif|sans|mono`
- `.sonder-landing .brain-viewer` overrides `--bv-font-serif|sans`

`vine.css` and `brain-viewer.css` remain byte-identical to the design source aside from being relocated under `components/landing/styles/`.

## Import path rewrites

Design `@/lib/{three,anatomy,hero,vine,smooth-scroll}` → `@/lib/landing/...`.
Relative imports **inside** `lib/landing/` are unchanged (sibling tree preserved).

## Skill overrides retained (§4.2 of merge plan)

1. Neon accent + glow on the landing (and six reserved product jobs).
2. Hairline 24px construction grid as structural geometry, not decoration.
3. Newsreader display serif (not substituted).
4. No stock photography: WebGL specimen + live product UI instead of screenshots.

## Untouched from design source

- All `*-theme.ts` constants (hero, vine, teal).
- Vine geometry engine, three.js viewer core, Fresnel / teal material.
- Scrub timings: hero `0.9`, vine `0.95`.
- Refresh priorities: hero `1`, vine `0`.
- `ENTRY_Y_START`, `VINE_AMP_FRAC`, and related derived numbers.

## OpenGraph image

`app/opengraph-image.png` is a generated stand-in from wordmark glyph data. The merge plan asks for a manual screenshot of the hero at ~60% of the pin for the final card; replace when that capture is available.

## Licensing reminder

See `README.md`. Upstream anatomy repo has no LICENSE; `brain.glb` appears Tripo-generated. Confirm terms before public or commercial deployment.
