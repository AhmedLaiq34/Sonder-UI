# Implementation Plan — `sonder-web`

## Merging the `brain-extract-anatomy` design into the `FYP_POC_UI` product, in a new third folder

**Workspace root:** `D:\FYP\Sonder\brain-ui\`

| Folder | Role in this plan | Writable? |
|---|---|---|
| `brain-extract-anatomy\` | **Design source.** The visual design to be reproduced. | **READ ONLY** |
| `FYP_POC_UI\` | **Product source.** The 27 screens, fixtures, components, tests. | **READ ONLY** |
| `sonder-web\` | **The deliverable.** Created by this plan. Everything is built here. | **The only writable folder** |

> **THE THREE-FOLDER RULE — read it twice, it governs every command in this document.**
> You will create a third folder, `D:\FYP\Sonder\brain-ui\sonder-web\`, and every single file you
> write, edit or delete goes inside it. `brain-extract-anatomy\` and `FYP_POC_UI\` are inputs. You
> read from them and copy out of them. **You never write into them, never edit a file inside them,
> never run `npm install` inside them, never `git commit` inside them.** If you find yourself about
> to modify a path that does not begin with `D:\FYP\Sonder\brain-ui\sonder-web\`, stop.
>
> This is not tidiness. Both source folders are separate git repositories with their own history and
> their own remotes (`brain-extract-anatomy` pushes to a private repo called `Brain-Landing-Page`).
> Mutating them destroys the ability to diff the merge against either parent, and it destroys the
> ability to re-sync when either parent moves on.

**Goal, in three parts:**

1. **Reproduce the `brain-extract-anatomy` landing design exactly** inside a Next.js app: the fixed
   charcoal grid and particle backdrop, the pinned hero where the **SONDER** wordmark is drawn as a
   technical pen drawing and then gives way to a 3D brain rising from below the camera frustum, and
   the scroll-grown vine that delivers a node of copy at each stop. Behaviour, timing, colour and
   geometry constants are **preserved verbatim**. This is a port, not a re-interpretation.
2. **Make that landing a real product landing page**, with the Sonder narrative replacing the
   placeholder copy and the *existing 27 product screens* showcased inside it as live, in-design
   vignettes, ending in a role-entry section that replaces today's bare role picker.
3. **Propagate the design language across the whole product** — one token layer, one type system,
   one motion system, one shape vocabulary — applied route by route to all 27 screens, so that
   walking from the landing into `/student` or `/admin` feels like the same object.

This plan is written to be executed literally by an implementer who has **not** read either source
codebase. Every file, every constant, every decision and its reasoning is given.
**Do not improvise. Do not skip phases. Do not reorder them.**

---

# PART I — GROUNDING

## 0. Read this first

### 0.1 Non-negotiables

- **The three-folder rule above.**
- **The visual design of `brain-extract-anatomy` is the specification.** Where this plan and your
  instinct disagree, the source repo wins. Where the source repo is silent, this plan wins. Where
  this plan is silent, §3 (the design language) decides.
- **One accent colour.** `#39FF14` (neon rim) and its highlight `#C8FFB0`. Do not introduce a second
  brand hue anywhere. The status colours (warn / info / ai / destructive) are the only other
  chromatic values allowed, and they exist only inside product screens, never on the landing.
- **Do not touch the vine geometry engine, the three.js viewer, the material shader, or any
  `*-theme.ts` constant file** beyond the mechanical import-path rewrites specified in §7. Those
  numbers were derived, not guessed. `ENTRY_Y_START = -6.6` is computed from the camera's 34 degree
  vertical FOV, the camera distance of 13.5, and the model's normalised bounds; `VINE_AMP_FRAC` has
  a worked constraint in its own comment tying it to the card width. Changing one silently breaks
  the composition in a way that is very hard to trace back.
- **Zero em-dashes and zero en-dashes in any string the user can see.** See §4.3. This applies to
  page copy, button labels, alt text, metadata and captions. It does **not** apply to this plan's
  own explanatory prose, or to source-code comments.

### 0.2 Aesthetic ban (inherited from the source repo's own plans, still in force)

No scanlines. No glitch or RGB split. No flicker or opacity noise. No sweeping scan lines. No HUD
brackets, targeting reticles or rotating rings. No gradient-mesh blobs. No emoji in product chrome.
No "AI sparkle" iconography beyond the one existing `VerificationTag` `ai-proposed` state.

The design's character comes from four things and nothing else:

1. **Hairline strokes** on a dark ground.
2. **Real construction geometry** — crosshairs, cap-height and baseline rules, part-outline
   rectangles, a 24px grid that is genuinely 24px and genuinely aligned across sections.
3. **Honest draw-on animation** — things arrive by being *drawn* (`stroke-dashoffset`), not by
   fading in.
4. **Extreme letter-spacing on micro-type**, tight leading on display type.

### 0.3 Definition of done

`npm run lint`, `npm run build` and `npm test` clean inside `sonder-web`, plus every box in the
Pre-Flight Check (§17) honestly ticked, plus the manual matrix (§16.2) passing in a real browser at
390px, 860px, 1280px and 1920px in both `prefers-reduced-motion` states.

---

## 1. Design read and dials

The `taste-skill` requires a one-line design read and explicit dial values before any code. Here
they are, already reasoned. **Do not re-derive them; do not silently use the baseline.**

> **Design read:** *Reading this as a hybrid: a scroll-narrative landing page for an academic and
> teaching audience, in a dark technical-blueprint language (neon-on-charcoal, drawn construction
> geometry, WebGL specimen), fronting a dense multi-role assessment product that must stay calm and
> legible. Leaning toward: keep the source's GSAP + three.js stack for the landing, keep the
> existing shadcn/base-ui + Tailwind v4 foundation for the product, and unify them through one
> token layer rather than one visual treatment.*

This is a **two-surface product**, so it gets **two dial sets**. Collapsing them into one is the
single most likely way to wreck this build: a landing's variance applied to an evidence panel makes
it unreadable, and a dashboard's restraint applied to the hero makes it forgettable.

| Surface | `DESIGN_VARIANCE` | `MOTION_INTENSITY` | `VISUAL_DENSITY` | Reasoning |
|---|---|---|---|---|
| **Landing** (`/`) | **8** | **7** | **3** | Asymmetric by construction: a pinned WebGL hero, a serpentine vine that alternates sides, a sticky rail-and-frame showcase. Motion is the product demo, so it is high but every piece of it is scroll-linked and reversible, never decorative loops. Density is low: one idea per screenful. |
| **Product** (all 27 routes) | **4** | **3** | **7** | Dense diagnostic data, tables, evidence traces and chat. Variance drops to "offset, not asymmetric". Motion drops to CSS transitions and one route-enter, because a teacher reviewing an escalation does not want choreography. Density rises: this is a working tool. |

Consequences that follow directly from these dials, and that you must honour:

- Landing at `MOTION_INTENSITY 7` means **motion claimed is motion shown**: if you cannot ship the
  pin, the scrub and the reveals working, drop the whole landing to 3 and ship it static. Never ship
  half-built motion (cut-off ScrollTriggers, jumpy enters, missing cleanups).
- Product at `MOTION_INTENSITY 3` means **no scroll-linked animation on any product route**. The
  existing `.page-enter` plus CSS `transition` on hover and state is the entire motion budget.
- Product at `VISUAL_DENSITY 7` means numbers are mono and tabular, and micro-labels are hairline
  separated rather than boxed. It does **not** license removing whitespace from reading surfaces
  (`/student/remediation`, `/parent/summary`), which are editorial and stay at density 3.

---

## 2. Verified current state

Confirm each fact before starting. If any is false, **stop and re-read the code.**

### 2.1 `brain-extract-anatomy` (design source)

| Fact | Detail |
|---|---|
| Stack | Vite 8, React 19.2, TypeScript 5.9, Tailwind v4 (`@tailwindcss/vite`), `three@0.185.1`, `gsap@3.15.0`, `lenis@1.3.26` |
| Alias | `@/*` maps to `src/*` |
| Entry | `src/main.tsx` calls `initSmoothScroll()` at module scope, then renders `<App/>` |
| Composition | `src/App.tsx`: `<AetherFlowHero/>` (fixed, z-0) then `<main className="relative z-[1]">` containing `<HeroStage/>`, `<VineScroller/>`, and a placeholder `<footer>` |
| Backdrop | `src/components/ui/aether-flow-hero.tsx`: a `fixed inset-0 z-0` 2D canvas painting `#121212`, a 24px grid at `rgba(255,255,255,0.045)`, and a mouse-reactive particle network |
| Hero | `src/components/HeroStage.tsx`: a GSAP ScrollTrigger pin lasting `HERO_PIN_VH = 1.0` viewport heights at `scrub: 0.9`; one timeline of total duration 1.0 driving (a) brain entry `0` to `HERO_ENTRY_END (0.72)`, (b) wordmark rise and fade `0` to `0.45`, (c) a charcoal veil from `0.72` at final opacity `HERO_VEIL_OPACITY = 0`, a deliberate no-op kept as a tuning hook |
| Wordmark | `src/components/SonderWordmark.tsx` + `src/lib/hero/wordmark-glyphs.ts`: SONDER as hand-authored pen strokes in a 64x92 per-glyph authoring box, drawn with `stroke-dasharray` and `stroke-dashoffset` set on a wrapping `<g data-draw>` so the glow layer and the core layer animate from a single style write |
| Brain | `src/BrainViewer.tsx` + `src/lib/three/{viewer,loaders,hotspots,dispose,neuron-activity,teal-material,teal-theme}.ts` + `src/lib/anatomy/{brain-data,neuron-paths}.ts`. `three` is **dynamically imported inside a `useEffect`**, so it never blocks first paint |
| Vine | `src/components/VineScroller.tsx` + `src/lib/vine/{geometry,content,vine-theme}.ts` + `src/vine.css`. Measures its own cards with `offsetTop`/`offsetLeft`, builds a Catmull-Rom spine in section-pixel space, grows it with a scrubbed ScrollTrigger at `refreshPriority: 0` |
| Smooth scroll | `src/lib/smooth-scroll.ts`: Lenis on the document, wired to `ScrollTrigger.update` and `gsap.ticker`, skipped entirely under reduced motion |
| Model asset | `public/models/brain.glb`, exactly **2,570,592 bytes**, Meshopt-compressed, WebP textures, roughly 377k triangles. It is the only runtime asset. No DRACO, no KTX2/Basis files are needed. |
| Import shape | Every internal import inside `src/lib/` is **relative** (`./`, `../`). Verified by grep. This is why the whole tree can be copied as one folder with zero import edits. |
| `@/` imports | Exist only in five component files: `App.tsx`, `HeroStage.tsx`, `SonderWordmark.tsx`, `VineScroller.tsx`, `ui/aether-flow-hero.tsx`. `BrainViewer.tsx` uses `./lib/...` relative paths. |

**Six defects in the source that this port fixes rather than carries forward.** Each is referenced
later by its ID.

- **D1 — hydration.** `SonderWordmark` initialises `tracking` from `window.innerWidth` inside a
  `useState` initialiser. Under SSR that produces a different `viewBox` on server and client. Fixed
  in §7.5.
- **D2 — dead copy slots.** `content.ts` defines `eyebrow` and `meta`, and `vine.css` fully styles
  `.vine-node-eyebrow` and `.vine-node-meta` including their staggered reveal delays, but
  `VineScroller.tsx` never renders either element. Half the card's typographic choreography is
  currently dead code. Fixed in §7.6.
- **D3 — soft grid on HiDPI.** `AetherFlowHero` sizes its canvas in CSS pixels with no
  `devicePixelRatio` scaling, so its 1px grid lines are blurred on every retina display. Fatal for a
  design whose whole premise is hairline technical drawing. Fixed in §7.3.
- **D4 — unbounded O(n^2).** The particle count is `(w*h)/9000` with no cap, and `connect()` is a
  full pairwise pass. At 2560x1440 that is 410 particles and roughly 84,000 distance tests per
  frame. Capped in §7.3.
- **D5 — SSR layout-effect warnings.** `HeroStage`, `SonderWordmark` and `VineScroller` all call
  `useLayoutEffect`. Fixed in §7.2 with an isomorphic hook.
- **D6 — `h-screen` on mobile Safari.** `HeroStage` uses `h-screen` (100vh), which on iOS Safari is
  taller than the visible viewport, so the pinned hero's bottom content (the new lead copy and its
  CTAs) sits under the address bar. Fixed in §7.7.

### 2.2 `FYP_POC_UI` (product source)

| Fact | Detail |
|---|---|
| Stack | Next.js **16.3.4** App Router, React 19.2.8, Tailwind v4 (`@tailwindcss/postcss`), shadcn style `base-nova` on `@base-ui/react`, `next-themes`, `sonner`, `lucide-react`, vitest + jsdom |
| Alias | `@/*` maps to `./*` (repo root). **Different from the design source's `@/*` to `src/*`.** |
| `node_modules` | **Not installed.** There is no `.next` either. The tree is clean source. |
| Root layout | `app/layout.tsx`: Geist Sans and Geist Mono via `next/font/google`, then `<Providers>` wrapping `<AppShell>` |
| Providers | `app/providers.tsx`: `next-themes` (`attribute="class"`, `defaultTheme="system"`), `TooltipProvider`, `Toaster`, `SessionProvider` |
| Shell | `components/app/AppShell.tsx`: sidebar plus header plus an `app-scroll` main. **Returns bare children when `pathname === "/"` or `pathname.startsWith("/dev")`.** This is why the landing needs no shell surgery. |
| Current `/` | `app/page.tsx`: a client role picker. Four buttons call `signIn(role)` then `router.push(ROLES[role].home)`. |
| Session | `lib/session.tsx`: fake auth, role in `localStorage`, read through `useSyncExternalStore` so SSR sees signed-out and there is no effect calling `setState` |
| Tokens | `app/globals.css`: the stock shadcn neutral oklch ramp in `:root` and `.dark`, four custom semantic pairs (`ok`, `warn`, `info`, `ai`), and layout vars (`--header-height`, `--sidebar-width`, `--sidebar-width-collapsed`) |
| Routes | 27 `page.tsx` files: `/student` (8), `/teacher` (7), `/admin` (5), `/parent` (2), `/dev` (1), plus `/` and `not-found.tsx` |
| Shared vocabulary | `components/app/{PageShell, AppShell, AreaCard, Breadcrumb, EmptyState, Placeholder, RouteTabs, RoleGate, ThemeToggle, ChatConsultant, primitives}` and `components/shared/{PosteriorBarSet, EvidenceStep, MisconceptionCard, StatusBadge, OutcomeBanner, MetricCard, VerificationTag}` |
| Fixtures | `fixtures/`: scenarios A/B/C, catalogue, coverage, students, parent, performance, provenance, insights, consultant threads, learn pages. **Every number on the landing must come from these**, never from invented data. |
| Tests | `components/learn/ConceptChat.test.ts`, `lib/useRunPlayer.test.ts`, `lib/useScenarioPlayer.test.ts`. All must still pass unchanged. |
| `public/` | Only the four stock Next SVGs. No `models/` directory. |
| Verified route hrefs | `/student/verify/B`, `/student/remediation/B`, `/teacher/session/B`, `/student/start`, `/student/insights`, `/student/learn`, `/student/consultant`, `/teacher`, `/teacher/escalations`, `/teacher/content-review`, `/teacher/consultant`, `/parent`, `/admin`, `/admin/catalogue`, `/admin/coverage`, `/admin/performance`, `/admin/provenance`, `/dev/components`. These are the only hrefs the landing may link to. |
| `AGENTS.md` | Warns that this Next.js version differs from training data and that `node_modules/next/dist/docs/` is authoritative. **Read those docs before writing App Router code you are unsure about.** The block is regenerated by `next dev`; committing it with your work is correct. |

---

## 3. The design language, named and specified

Everything below is *extracted* from the design source. Your job is to give these values names once,
in `app/globals.css`, and then use only those names.

### 3.1 The eleven invariants

| # | Invariant | Value, verbatim from the source |
|---|---|---|
| 1 | **Ground** | `#121212` charcoal |
| 2 | **Grid** | 24px x 24px, 1px lines, `rgba(255,255,255,0.045)`, painted by the canvas in the hero and by a CSS `linear-gradient` everywhere else |
| 3 | **The one accent** | rim `#39FF14`, hot `#C8FFB0`, body `#0D4A08`, deep `#06180A` |
| 4 | **Ink** | paper `#E8FFE0` (a white with a green cast), muted `#7AAB70` |
| 5 | **Hairlines** | `rgba(57, 255, 20, 0.16)` accented, `rgba(232,255,224,0.10)` quiet |
| 6 | **Glass** | `rgba(10, 38, 12, 0.55)` plus `backdrop-filter: blur(9px)` |
| 7 | **Notch** | `border-radius: 2px 18px 18px 18px`, the signature asymmetric corner from `.vine-node` |
| 8 | **Depth** | `0 24px 60px rgba(0,0,0,0.45)` plus `inset 0 1px 0 rgba(57,255,20,0.08)` |
| 9 | **Micro-type** | mono, uppercase, 10.5px, `letter-spacing: 0.22em`, accent-coloured, opacity 0.85 |
| 10 | **Display type** | serif, weight 400, `clamp(22px, 2.1vw, 30px)`, `line-height: 1.16`, `letter-spacing: -0.01em` |
| 11 | **Ease** | `cubic-bezier(0.16, 1, 0.3, 1)` at 700 to 1000ms for reveals, 520 to 900ms for stroke draws |

### 3.2 The three type roles

| Role | Family | Where |
|---|---|---|
| **Display** | serif: **Newsreader** via `next/font/google`, falling back to `"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif` (the exact stack the source uses) | Landing section headings, vine card titles, `PageShell` `<h1>`, `CardTitle`, long-form reading surfaces |
| **UI** | **Geist** (already a dependency) | Body copy, buttons, tables, forms, dense product chrome |
| **Micro and numeric** | **Geist Mono** (already a dependency) | Eyebrows, `Th`, `StatTile` and `MetricCard` labels, all `.nums` values, node meta lines, route paths shown as captions |

**Why a serif at all, given that `taste-skill` strongly discourages serif as a default.** Three
reasons, all specific rather than "it feels premium":

1. **The design source already uses one.** `vine.css` sets `--v-font-serif` for the vine card titles
   and `brain-viewer.css` sets `--bv-font-serif` for the viewer's caption and tool chrome. Removing
   the serif would not be restraint, it would be a failure to reproduce the specified design.
2. **The product's core artifact is prose.** A Sonder diagnosis becomes a written study note that a
   student reads (`/student/remediation`) and a plain-language summary that a parent reads
   (`/parent/summary/[id]`). Those are genuinely editorial reading surfaces, which is the one
   category where the skill explicitly permits serif.
3. **It carries the technical-drawing contrast.** The composition is hairline geometry plus mono
   micro-labels; an old-style serif at weight 400 is the only display voice that reads as
   *drafted* rather than *branded* next to that.

**Why Newsreader specifically.** It is an editorial serif with real 400/500 weights and true
italics, and its vertical proportions sit close to Palatino's, so the fallback stack degrades
without reflow damage. It is not one of the two faces `taste-skill` bans as LLM defaults (Fraunces,
Instrument Serif), and it is not a display-only face, which matters because the product needs it at
15px in `SectionHeading` as well as at 58px in the thesis band. **Do not substitute.**

### 3.3 The accent-discipline rule (read this twice)

The landing uses `#39FF14` freely. It is the brand moment. **Product screens must not.** If every
surface glows, nothing reads as important and dense data becomes unreadable.

> **In product screens, `#39FF14` is reserved for exactly six jobs:**
> focus rings, the active sidebar item's rule, the `ok` / "diagnosed" semantic state, link hover,
> the brand mark, and progress or posterior bar fills.
>
> **`--primary` stays paper `#E8FFE0` on ink.** High contrast, calm, and it keeps the neon precious.
> **There are no neon buttons in the product.** Landing CTAs are the one documented exception.

Reasoning: the source design earns its neon by spending it on roughly 4% of the pixels — hairlines,
strokes, one blurred glow behind the specimen. A dashboard with neon buttons, neon badges and neon
table rules spends it on 30% and reads as a toy. This rule is what makes the two halves of the site
feel like one product rather than a brand sheet stapled to a different app.

### 3.4 The shape rule

| Surface kind | Radius |
|---|---|
| **Invitations**: `AreaCard`, role cards, vine nodes, `EmptyState`, `MisconceptionCard`, landing plates | `2px 18px 18px 18px` via a `.notch` utility |
| **Data**: `StatTile`, `MetricCard`, tables, `Surface`, dialogs, inputs, buttons, badges | symmetric `--radius` (unchanged `0.5rem` scale) |

The notch says "enter here". On everything, it says nothing. This is the whole of the Shape
Consistency Lock: two shapes, one documented rule, no third case.

### 3.5 The motion rule

| Motion | Spec |
|---|---|
| Route enter | existing `.page-enter`, retimed to 260ms `var(--ease-sonder)` |
| Section / card reveal | opacity 0 to 1, `translate3d(0, 18px, 0)` to none, 720ms `var(--ease-sonder)`, 60ms stagger, driven by `IntersectionObserver` at `rootMargin: "0px 0px -12% 0px"` |
| Rule / stroke draw | `stroke-dashoffset` full to 0, 820ms `var(--ease-sonder)` |
| Scroll-scrubbed | **landing only**: hero pin `scrub: 0.9`, vine growth `scrub: 0.95`, showcase progress `scrub: 0.6` |
| Reduced motion | **every** scrub, pin, stagger and draw resolves instantly to its end state; Lenis is never initialised; the particle canvas is replaced by the static CSS grid |

**Two hard rules that come from the skills and are easy to violate by accident:**

- **One animation library per tree.** The landing uses **GSAP + ScrollTrigger only**. Do not install
  `motion` / `framer-motion` and do not use it anywhere in this project. They fight over the same
  frames. Product screens use **CSS transitions only**, no library.
- **Never `window.addEventListener("scroll", ...)`.** It runs on every scroll frame, is unbatched,
  and re-renders the React tree if it touches state. Use `IntersectionObserver` (cheapest), a
  ScrollTrigger `onToggle`, or a direct style write from a scrub callback. This plan uses
  `IntersectionObserver` for the nav state (§10.3) and ScrollTrigger for everything else. There is
  no case in this build that needs a scroll listener.

Also inherited from the GSAP guidance: **never `back.out` or any overshoot easing on dense
informational UI**; the bounce reads as sloppy on a data table. Overshoot is not used anywhere in
this plan.

---

## 4. Rules taken from the skills, and the four documented overrides

`taste-skill` and `ui-ux-pro-max` were consulted. Most of their rules apply directly. Four of them
conflict with the user's explicit instruction to reproduce the source design, and are overridden
below with reasoning. **A rule not listed as an override is in force.**

### 4.1 Rules adopted in full (these change the design from a naive port)

| Rule | What it changes here |
|---|---|
| **Eyebrow restraint**: at most `ceil(sections / 3)` eyebrows | 8 landing sections, so **at most 3 section eyebrows**. Budget spent in §5.3. Several sections that "obviously" wanted one do not get one. |
| **No section-number eyebrows, no generic step labels** | The mechanism strip loses its `01 / 02 / 03` numbers. The step's verb is the label. Vine `meta` lines lose their `01 —` prefixes. |
| **No fake product UI built from divs** | The showcase frame gets **no fake browser chrome**: no title bar, no three traffic-light dots. It is a plate with a hairline, and the route path is a mono caption **below** it. The content inside is real components, which the skill explicitly permits as "a real component preview". |
| **Zero decorative status dots** | No coloured dot before nav items, list rows or badges anywhere. |
| **No scroll cues** | No "Scroll" label, no animated mouse-wheel glyph, no down-arrow at the hero's base. |
| **No locale / time / weather / version strips** | No `v0.1`, no `BETA`, no `LIS 14:23`, no build stamp on any marketing surface. |
| **No `border-t` plus `border-b` on every row** of long lists | Applies to `/admin/provenance`, `/admin/catalogue` and the coverage table: one divider direction, used sparsely, or grouped chunks. |
| **Hero stack discipline**: max 4 text elements | Hero carries exactly three: eyebrow, headline, CTA pair. No sub-tagline under the CTAs, no trust strip, no feature bullets. |
| **No duplicate CTA intent** | "Enter the prototype" is the single label for the enter-the-app intent, used in the nav and the hero, both anchoring to `#enter`. The role cards inside `#enter` do not repeat the word: their action line is the destination route in mono. |
| **`min-h-[100dvh]`, never `h-screen`** | Fixes D6. |
| **Tables need an `overflow-x-auto` wrapper** | Applied in the route sweep to every `<table>`. |
| **Do not rely on colour alone** | Already true of `PosteriorBarSet` (stripes plus a "tied" text badge) and `StatusBadge` (icon plus label). Maintain it; every new state indicator needs a non-colour channel. |
| **Focus appearance**: 2px perimeter, 3:1 state contrast | `outline: 2px solid var(--sonder-rim); outline-offset: 3px` everywhere. Never `outline: none` without a replacement. |
| **At most 1 to 2 pinned sections per page** | The landing has exactly one true GSAP pin (the hero). The showcase uses native `position: sticky`. See §10.4.4. |
| **Copy self-audit before shipping** | §16.1 makes it a required step, not an intention. |

### 4.2 The four documented overrides

**Override 1 — neon accent and outer glow.** `taste-skill` §9.A bans neon and outer glows by
default, and §4.2 caps saturation below 80%. `#39FF14` is a fully saturated neon and the hero
carries a 420px blurred radial glow behind the specimen. **Overridden**, because the accent is the
specified brand, it is baked into a WebGL Fresnel material (`RIM_COLOR`, `RIM_STRENGTH`) and cannot
be desaturated in CSS without the 3D and the 2D drifting apart, and because §3.3's discipline rule
already confines it to roughly 4% of pixels on the landing and six named jobs in the product. The
ban's actual target — undirected purple button glows — is not what is happening here.

**Override 2 — hairline grid as decoration.** `taste-skill` §9.F bans "crosshair / hairline grid
lines as decoration". **Overridden**, because in this design the grid is not decoration: it is the
same 24px lattice the hero canvas paints, it is what makes the wordmark's construction rectangles
and cap-height rules legible as *construction*, and it is the shared ground that lets the fixed
canvas and the scrolling sections read as one surface. It is load-bearing. The crosshair used above
each mechanism step is the registration mark from the wordmark's own vocabulary, reused, not a new
flourish. **It is used exactly twice on the page** (the wordmark's own, and once per mechanism
step), not sprinkled.

**Override 3 — serif as display face.** Justified at length in §3.2.

**Override 4 — real photography.** `taste-skill` §4.8 requires real images and calls a pure-text
page "incomplete work". **Overridden**, because this landing's visual load is carried by a
377k-triangle WebGL specimen, a 220-particle animated network, a stroke-by-stroke drawn wordmark,
and a procedurally generated vine — none of which is text — plus four live renders of the real
product UI. Stock photography would actively damage a technical-drawing aesthetic and would be the
only inauthentic pixel on the page. **Two things the skill is right about are adopted anyway:** the
page needs a real social card (WebGL cannot render into an OG image), so §10.10 specifies one, and
it needs a real favicon, so §10.10 specifies that too.

### 4.3 The em-dash ban, stated operationally

Zero `—` and zero `–` in anything the user can see. That includes headings, eyebrows, button labels,
body copy, vine node text, alt text, `metadata.title`, `metadata.description`, OG copy, table
captions and empty-state text.

Replace them as follows. This is the exact substitution table; do not improvise a fifth option.

| Instead of | Use |
|---|---|
| `A. — B.` (parenthetical aside) | two sentences with a full stop, or a comma |
| `A — B` (definition or expansion) | a colon: `A: B` |
| `Name — Role` (attribution) | a line break, or a hyphen with spaces: `Name - Role` |
| `01 — Label` (numbered meta) | drop the number entirely, per §4.1 |
| `2018 — 2026` (range) | a hyphen: `2018-2026` |

**This does not apply to this plan's prose or to code comments.** It applies to strings that render.

### 4.4 Explicitly do not build

Listed so that a well-meaning implementer does not add them "to make it feel complete":

a "Trusted by" or "Used by" logo wall (there are no customers; fabricating one is dishonest);
a testimonial section (same); a pricing table; a blog; an animated logo variant; a light-mode
landing; a second 3D asset; a marquee of any kind; a newsletter capture; a cookie banner; a chat
widget; page-transition animation between routes; analytics; a CMS for the landing copy; any change
to how the diagnostic fixtures behave.

---

## 5. Target information architecture

### 5.1 Routes

Route structure is **unchanged from `FYP_POC_UI`**, with exactly one substitution.

| Route | Before | After |
|---|---|---|
| `/` | bare role picker | **the marketing landing page**. Still matches `AppShell`'s `bare` check, so no shell change is needed. |
| all 26 others | unchanged | unchanged routing, restyled per §12 |

**No new routes are created.** The role picker becomes the "Enter" section at the bottom of the
landing rather than moving to `/enter`. Reasoning: a PoC whose only conversion is "pick a role"
should not make the visitor navigate twice; and keeping one route means `AppShell`'s `bare` check,
`not-found.tsx`'s `home` fallback, and `RoleGate`'s `router.replace("/")` all keep working with zero
edits, which removes an entire class of regression.

### 5.2 Landing sections and scroll budget

| # | Section | Component | `id` | Scroll length | Pinned |
|---|---|---|---|---|---|
| - | Backdrop | `AetherFlow` | - | fixed, whole document | n/a |
| - | Nav | `LandingNav` | - | fixed top | n/a |
| 1 | Hero | `HeroStage` | `top` | 100dvh plus a 100dvh pin spacer = **200dvh** | **yes, GSAP pin** |
| 2 | Thesis | `ThesisBand` | `premise` | about 70vh | no |
| 3 | Narrative | `VineScroller` | `narrative` | 6 nodes at about 84vh, plus 22vh lead and 42vh tail, about **570vh** | no, scrubbed |
| 4 | Showcase | `ShowcaseStage` | `showcase` | 4 steps at 100vh = **400vh** | no, native sticky |
| 5 | Mechanism | `MechanismStrip` | `mechanism` | about 90vh | no |
| 6 | Guarantee | `GuaranteeBand` | `guarantee` | about 60vh | no |
| 7 | Enter | `EnterSection` | `enter` | about 90vh | no |
| 8 | Footer | `LandingFooter` | - | about 40vh | no |

About 15 viewport heights total. Long, but each screenful does a distinct job. Do not add a ninth.

**Layout-family audit** (the skill requires at least 4 distinct families across 8 sections; this has
8, one per section, so the Section-Layout-Repetition check passes trivially):

| Section | Layout family |
|---|---|
| Hero | pinned full-bleed stage, centred type over a 3D specimen |
| Thesis | centred editorial manifesto, no asset |
| Narrative | alternating serpentine spine with side-anchored cards |
| Showcase | sticky two-column, progress rail left, single frame right |
| Mechanism | three columns hanging under one shared horizontal rule, no cards |
| Guarantee | single bordered plate, centred, max 78ch |
| Enter | 2x2 card grid |
| Footer | 3-column ruled block |

The vine alternates left and right six times, which would normally trip the Zigzag Alternation Cap.
**Exempt**, because the cap targets repeated image-plus-text splits used as filler; here the
alternation is a single continuous scroll-linked drawing whose sides are dictated by the spine's
serpentine geometry, and there is one image-plus-text split on the whole page (the showcase). It is
one section, not six.

### 5.3 The eyebrow budget, spent

8 sections, so `ceil(8 / 3) = 3` section eyebrows are permitted. They are spent here and nowhere
else:

| Section | Eyebrow? | Text |
|---|---|---|
| Hero | **yes (1)** | `Final-year project. Adaptive misconception diagnosis.` |
| Thesis | **yes (2)** | `The premise` |
| Narrative | no | the vine's node kickers are exempt, see below |
| Showcase | no | the section leads with its headline |
| Mechanism | no | headline only, and the step numbers are removed per §4.1 |
| Guarantee | no | headline only |
| Enter | **yes (3)** | `Enter` |
| Footer | no | column headings are plain small caps in muted ink, not accent eyebrows |

**Vine node eyebrows are exempt from the budget.** Two reasons: they are list-item kickers *inside*
one section rather than section headers, which is the pattern the rule targets; and they are part of
the ported component's existing styling (`vine.css` defines `.vine-node-eyebrow` with its own reveal
delay) so removing them would be a deviation from the specified design, not restraint.

**Mechanical check before shipping:** grep the landing components for `class="eyebrow"` and for
`uppercase tracking`. Occurrences outside `VineScroller`'s node markup must be **3 or fewer**.

---

# PART II — EXECUTION

## 6. Phase 0 — Create the third folder

Every command in this and every later phase runs from `D:\FYP\Sonder\brain-ui\sonder-web\` unless
the command itself is the one creating it.

### 6.1 Why `sonder-web` starts as a copy of `FYP_POC_UI`, not a fresh `create-next-app`

`FYP_POC_UI` is roughly 7,700 lines across 27 routes, 19 shared components, 24 shadcn primitives,
19 fixture modules and 3 test suites. Recreating that from a blank Next app would take longer than
the entire rest of this plan and would introduce silent drift in fixtures the landing then reads
from. So: **copy the product wholesale, then merge the design into the copy.**

### 6.2 Create it

Run from `D:\FYP\Sonder\brain-ui\` (Git Bash):

```bash
# 1. Copy the product source, excluding VCS and build output.
cp -r FYP_POC_UI sonder-web

# 2. Sever it from the product repo's git history. sonder-web gets its own.
rm -rf sonder-web/.git

# 3. Belt and braces: these should not exist in the source, but remove them if they do.
rm -rf sonder-web/node_modules sonder-web/.next sonder-web/out sonder-web/coverage

# 4. Remove the two design-source-specific docs that do not describe this project.
#    (Keep docs/superpowers/specs/*, they are the product's own design records.)

# 5. Confirm.
ls -a sonder-web
```

`ls -a sonder-web` must show: `.gitignore`, `AGENTS.md`, `CLAUDE.md`, `README.md`, `app`,
`components`, `components.json`, `docs`, `eslint.config.mjs`, `fixtures`, `lib`, `next.config.ts`,
`package-lock.json`, `package.json`, `postcss.config.mjs`, `public`, `tsconfig.json`,
`vitest.config.mts`. It must **not** show `.git` or `node_modules`.

### 6.3 Make it its own project

```bash
cd sonder-web
git init
```

Edit `package.json`: change `"name": "sonder-poc"` to `"name": "sonder-web"` and
`"version": "0.1.0"` to `"version": "1.0.0"`. Change nothing else in that file yet.

Copy this plan in so the implementer and the repo stay together:

```bash
mkdir -p docs
cp ../SONDER-WEB-IMPLEMENTATION-PLAN.md docs/IMPLEMENTATION-PLAN.md
```

Create `README.md` (replace the stock Next one) with, at minimum: what `sonder-web` is, that it is
the merge of two upstream folders, the exact commit or state of each upstream at merge time, the run
commands, and the licensing notes from §18.4. A one-paragraph provenance note is the difference
between a maintainable merge and an orphan.

### 6.4 Baseline before any change

```bash
npm install
npm run build
npm test
```

All three must pass on the untouched copy. If `npm run build` fails here, **stop and report it**.
Debugging pre-existing breakage is not part of this work, and you must not confuse it with breakage
you cause later.

### 6.5 Add the runtime dependencies

```bash
npm i three@0.185.1 gsap@3.15.0 lenis@1.3.26
npm i -D @types/three@0.185.4
```

Versions are **pinned to the design source's exact versions**, no `^`. `three`'s
`three/examples/jsm/...` import paths are stable across patches but a minor bump has moved them
before, and GSAP 3.15's ScrollTrigger pin-spacer behaviour is what the hero's constants were tuned
against.

**Do not install** `motion`, `framer-motion`, `@gsap/react`, `@phosphor-icons/react`, or any other
icon library. Reasoning: §3.5 forbids a second animation library; `gsap.context()` already does what
`useGSAP` does and the source code already uses it; and `lucide-react` is already a project
dependency used across all 27 screens, which is the documented exception to `taste-skill`'s
preference against Lucide. **One icon family, one animation library.**

### 6.6 Copy the model asset

```bash
mkdir -p public/models
cp ../brain-extract-anatomy/public/models/brain.glb public/models/brain.glb
```

Verify it is exactly **2,570,592** bytes.

> **Repo-owner note, do not skip.** `.gitignore` does not exclude `public/`, so this 2.5 MB binary
> will enter `sonder-web`'s git history on the first commit. If that is unacceptable, host it and
> change the single `model:` string in `lib/landing/anatomy/brain-data.ts`. See §18.4 for why the
> asset also has an unresolved licence question.

### 6.7 If, and only if, the build cannot resolve three

`three` ships ESM, so no config is needed. Add the following **only after** an actual build failure
mentioning `three/examples/jsm/libs/meshopt_decoder.module.js`:

```ts
// next.config.ts
const nextConfig: NextConfig = { transpilePackages: ["three"] };
```

Do not add it speculatively.

---

## 7. Phase 1 — Port the landing engine

Mechanical copy plus a fixed edit list. Complete all of it before writing any new composition code.

### 7.1 Directory layout and the copy map

```
sonder-web/
├── lib/
│   ├── useIsomorphicLayoutEffect.ts          NEW
│   └── landing/
│       ├── anatomy/      copy of src/lib/anatomy/  (brain-data.ts, neuron-paths.ts)
│       ├── three/        copy of src/lib/three/    (viewer, loaders, hotspots, dispose,
│       │                                            neuron-activity, teal-material, teal-theme)
│       ├── hero/         copy of src/lib/hero/     (hero-theme.ts, wordmark-glyphs.ts)
│       ├── vine/         copy of src/lib/vine/     (geometry.ts, content.ts, vine-theme.ts)
│       └── smooth-scroll.ts
└── components/landing/
    ├── AetherFlow.tsx          from src/components/ui/aether-flow-hero.tsx
    ├── BrainViewer.tsx         from src/BrainViewer.tsx
    ├── HeroStage.tsx           from src/components/HeroStage.tsx
    ├── SonderWordmark.tsx      from src/components/SonderWordmark.tsx
    ├── VineScroller.tsx        from src/components/VineScroller.tsx
    └── styles/
        ├── brain-viewer.css    from src/brain-viewer.css     (unmodified)
        ├── hero-stage.css      from src/hero-stage.css       (one appended block)
        ├── vine.css            from src/vine.css             (unmodified)
        └── landing.css         NEW
```

**Why the whole `src/lib` tree is copied as one unit, preserving its sibling structure:** every
internal import inside it is relative. `viewer.ts` imports `../hero/hero-theme`; `hotspots.ts`
imports `../anatomy/brain-data`; `neuron-activity.ts` imports `../anatomy/neuron-paths`. Keeping
`three/`, `anatomy/`, `hero/` and `vine/` as siblings under `lib/landing/` means **zero import edits
inside `lib/landing/`**. Do not flatten it. Do not "tidy" it into `lib/three/`.

```bash
mkdir -p lib/landing components/landing/styles
cp -r ../brain-extract-anatomy/src/lib/anatomy lib/landing/anatomy
cp -r ../brain-extract-anatomy/src/lib/three   lib/landing/three
cp -r ../brain-extract-anatomy/src/lib/hero    lib/landing/hero
cp -r ../brain-extract-anatomy/src/lib/vine    lib/landing/vine
cp ../brain-extract-anatomy/src/lib/smooth-scroll.ts lib/landing/smooth-scroll.ts

cp ../brain-extract-anatomy/src/brain-viewer.css components/landing/styles/brain-viewer.css
cp ../brain-extract-anatomy/src/hero-stage.css   components/landing/styles/hero-stage.css
cp ../brain-extract-anatomy/src/vine.css         components/landing/styles/vine.css

cp ../brain-extract-anatomy/src/BrainViewer.tsx                     components/landing/BrainViewer.tsx
cp ../brain-extract-anatomy/src/components/HeroStage.tsx            components/landing/HeroStage.tsx
cp ../brain-extract-anatomy/src/components/SonderWordmark.tsx       components/landing/SonderWordmark.tsx
cp ../brain-extract-anatomy/src/components/VineScroller.tsx         components/landing/VineScroller.tsx
cp ../brain-extract-anatomy/src/components/ui/aether-flow-hero.tsx  components/landing/AetherFlow.tsx
```

**Do not copy** `src/App.tsx`, `src/main.tsx`, `src/app.css`, `src/index.css`, `index.html`,
`vite.config.ts`, `tsconfig.json`, `package.json`, or `dist/`. Their jobs are taken over by §8
and §10.

### 7.2 New file: `lib/useIsomorphicLayoutEffect.ts` (fixes D5)

```ts
"use client";

import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect warns when React renders on the server. Every landing component that
 * measures the DOM needs layout-effect timing in the browser and effect timing (which
 * never actually runs) on the server.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
```

### 7.3 `components/landing/AetherFlow.tsx`

Apply these edits in order. Everything not listed is copied **verbatim**: the `ParticleImpl` class,
`drawGrid`, `connect`, the mouse handlers, the visibility handling and the cleanup. The grid step
stays `24`, the stroke stays `rgba(255,255,255,0.045)`, the fill stays `#121212`, the particle
colour stays `rgba(200,200,200,0.2)`, the link colour stays `rgba(180,180,180, ...)`. **Do not
retune any of them.**

1. Prepend `"use client";` and a blank line.
2. Leave `import { cn } from "@/lib/utils";` **unchanged**. The target project has an identical
   `cn` at that exact path. Verify the file exists before assuming.
3. Rename the default export `AetherFlowHero` to `AetherFlow` and the props type
   `AetherFlowHeroProps` to `AetherFlowProps`.
4. **Fix D3, HiDPI.** Declare `let viewW = 0; let viewH = 0;` next to `let particles: Particle[] = [];`,
   then replace `resizeCanvas` with:

```ts
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      viewW = window.innerWidth;
      viewH = window.innerHeight;
      canvas.width = Math.round(viewW * dpr);
      canvas.height = Math.round(viewH * dpr);
      canvas.style.width = `${viewW}px`;
      canvas.style.height = `${viewH}px`;
      // Everything below draws in CSS pixels. This restores "one unit = one CSS pixel"
      // while the backing store stays at device resolution, so the 1px grid lines land
      // on physical pixels and stay hairline-crisp.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
    };
```

   Then **replace every remaining use of `canvas.width`, `canvas.height`, `innerWidth` and
   `innerHeight` inside the effect with `viewW` / `viewH`**. There are seven sites: the two bounds
   checks in `update()`, the particle-count and the x/y seeding in `init()`, the two loop bounds in
   `drawGrid()`, the distance threshold in `connect()`, and the `fillRect` in `animate()`. Missing
   one produces a canvas drawn at `1/dpr` scale in the top-left corner, which is immediately
   obvious, so check visually.

5. **Fix D4, particle cap.** In `init()`:

```ts
      const numberOfParticles = Math.min(220, Math.floor((viewH * viewW) / 9000));
```

   220 is the count at roughly 1440x1370, the density the design was authored at. Above that the
   network reads as noise anyway, and the pairwise `connect()` pass starts costing more than the
   rest of the frame combined.

6. **Reduced motion.** Immediately after the null guards at the top of the effect:

```ts
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // The static .sonder-grid painted on the landing root is a pixel-exact stand-in for
      // the grid this canvas draws, so bailing out here loses only the particles.
      canvas.style.display = "none";
      return;
    }
```

7. **Pause while the showcase is on screen.** Inside `animate()`, extend the existing visibility
   guard:

```ts
      if (!pageVisible) return;
      if (document.documentElement.hasAttribute("data-showcase-active")) return;
```

   One attribute read per frame is free, and it buys back the entire particle budget during the
   heaviest section of the page. `ShowcaseStage` sets and clears the attribute (§10.4.6).

### 7.4 `components/landing/BrainViewer.tsx`

1. Prepend `"use client";`.
2. Rewrite three imports:
   - `import type { AnatomyViewer } from "./lib/three/viewer";` becomes `from "@/lib/landing/three/viewer"`
   - `import { brain, type Organ } from "./lib/anatomy/brain-data";` becomes `from "@/lib/landing/anatomy/brain-data"`
   - `import "./brain-viewer.css";` becomes `import "./styles/brain-viewer.css";`
3. Rewrite the lazy import inside the mount effect: `void import("./lib/three/viewer")` becomes
   `void import("@/lib/landing/three/viewer")`. **It must stay a dynamic `import()`.** That is what
   keeps `three` (about 203 kB gzipped) out of the first chunk. Do not hoist it to a static import.
4. Nothing else changes. Props, the imperative handle, the inline SVG icons, the slow-load panel,
   the tool rail, the screen-reader hotspot list all stay exactly as written.

### 7.5 `components/landing/SonderWordmark.tsx`

1. Prepend `"use client";`.
2. Rewrite imports: `@/lib/hero/wordmark-glyphs` becomes `@/lib/landing/hero/wordmark-glyphs`;
   `@/lib/hero/hero-theme` becomes `@/lib/landing/hero/hero-theme`.
3. Import `useIsomorphicLayoutEffect` from `@/lib/useIsomorphicLayoutEffect` and use it in place of
   `useLayoutEffect`.
4. **Fix D1, hydration.** Replace the state initialiser and the resize effect with:

```tsx
  // Always start at the desktop tracking so server and client render an identical viewBox,
  // then correct on mount. The one-frame change is invisible: the draw-on has not started
  // yet (WM_DELAY is 0.35s).
  const [tracking, setTracking] = useState(WM_TRACKING_LG);

  useEffect(() => {
    const apply = () => setTracking(trackingFor(window.innerWidth));
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);
```

   Delete the old resize-only `useEffect`.

   **Why this is safe even though the draw-on layout effect has `[]` deps and may measure at LG
   tracking on a phone:** the glyph `d` strings are constant and glyphs are positioned by a
   `<g transform>`, never by baking an x offset into the path data. This is stated explicitly in
   `wordmark-glyphs.ts`'s header comment. Path length therefore does not depend on tracking.
   Verify anyway by resizing across the 640px and 1024px breakpoints mid-animation: strokes must
   not gap.

5. Nothing else changes.

### 7.6 `components/landing/VineScroller.tsx`

1. Prepend `"use client";`.
2. Rewrite imports: `@/lib/vine/geometry` to `@/lib/landing/vine/geometry`, `@/lib/vine/content` to
   `@/lib/landing/vine/content`, `@/lib/vine/vine-theme` to `@/lib/landing/vine/vine-theme`,
   `@/vine.css` to `./styles/vine.css`.
3. Swap both `useLayoutEffect` call sites for `useIsomorphicLayoutEffect`.
4. **Fix D2, plus the narrative-to-product links.** Replace the `<article>`'s children with:

```tsx
              <p className="vine-node-eyebrow">{node.eyebrow}</p>
              <h2 className="vine-node-title">{node.title}</h2>
              <p className="vine-node-body">{node.body}</p>
              {node.meta ? (
                <p className="vine-node-meta">
                  {node.href ? (
                    <Link className="vine-node-link" href={node.href}>
                      {node.meta}
                      <span aria-hidden="true"> &rarr;</span>
                    </Link>
                  ) : (
                    node.meta
                  )}
                </p>
              ) : null}
```

   Add `import Link from "next/link";` at the top.

   `vine.css` already styles all four elements and already stages their reveal at 0 / 80 / 160 /
   240ms, so this is what makes the card's typographic choreography visible for the first time.
   Adding two elements increases every card's height, which changes the measured geometry; that is
   fine and automatic, because `measure()` re-runs from the `ResizeObserver`. It also means
   `VINE_ANCHOR_INSET = 30`, documented as "tuned to land on the eyebrow line", finally lands where
   its comment says it does. **Do not adjust it.**

5. Extend the `VineNode` type in `lib/landing/vine/content.ts` with an optional
   `href?: string;` field, documented as "a real route in this app that demonstrates this node".

   **Why this matters as design, not just as a feature:** it turns the narrative from a poster into
   a table of contents. Each of the six claims links to the screen that proves it, which is exactly
   what a proof-of-concept landing page should do, and it gives the `meta` slot a job better than
   decoration.

6. **Heading level stays `<h2>`.** The hero owns the single `<h1>` (§15).
7. Nothing else changes: not the measurement strategy, not the pulse loop, not `refreshPriority: 0`,
   not the `data-ready` progressive-enhancement contract.

### 7.7 `components/landing/HeroStage.tsx`

1. Prepend `"use client";`.
2. Rewrite imports: `@/components/SonderWordmark` to `./SonderWordmark`, `@/BrainViewer` to
   `./BrainViewer`, `@/lib/hero/hero-theme` to `@/lib/landing/hero/hero-theme`,
   `@/hero-stage.css` to `./styles/hero-stage.css`.
3. Swap `useLayoutEffect` for `useIsomorphicLayoutEffect`.
4. **Fix D6.** Change the section's class from `h-screen` to `min-h-[100dvh] h-[100dvh]`.
   The ScrollTrigger `end` callback keeps using `window.innerHeight`, which tracks the dynamic
   viewport closely enough that the pin length stays correct; `invalidateOnRefresh: true` is already
   set, so an address-bar resize re-measures.
5. **Add the hero's lead copy**, which the design source does not have because it was a demo. Add
   `const leadRef = useRef<HTMLDivElement>(null);` and render, as the last child of the section:

```tsx
      <div
        ref={leadRef}
        className="hero-lead pointer-events-none absolute inset-x-0 bottom-0 z-[8]"
      >
        <div className="mx-auto flex max-w-[54ch] flex-col items-center gap-4 px-6 pb-[9vh] text-center">
          <p className="eyebrow text-sonder-rim/85">
            Final-year project. Adaptive misconception diagnosis.
          </p>
          <h1 className="font-display text-[clamp(26px,3.4vw,44px)] leading-[1.12] text-sonder-paper">
            It does not mark the answer.
            <br />
            It finds the idea underneath it.
          </h1>
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-3 pt-2">
            <a href="#enter" className="sonder-cta">Enter the prototype</a>
            <a href="#narrative" className="sonder-cta sonder-cta--ghost">See how it decides</a>
          </div>
        </div>
      </div>
```

   Append a fourth tween to the GSAP timeline, after the veil tween:

```ts
        .fromTo(
          leadRef.current,
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" },
          HERO_ENTRY_END - 0.1,
        );
```

   In the reduced-motion early-return branch, add `gsap.set(leadRef.current, { opacity: 1, y: 0 });`
   before the `return`.

   **Why `HERO_ENTRY_END - 0.1` (that is, 0.62):** the wordmark has fully exited by 0.45 and the
   brain finishes arriving at 0.72. Starting the copy at 0.62 means it begins while the brain is
   settling and is fully present through the dwell, so the pin's final third is never an empty hold,
   and the copy never fights the wordmark for the centre of the frame.

   **Hero text-element count: 3** (eyebrow, headline, CTA pair). Within the cap of 4. There is
   deliberately no sub-tagline, no trust strip and no scroll cue.

6. **Append this block to `components/landing/styles/hero-stage.css`** (do not edit anything above
   it):

```css
/* ---------------------------------------------------------------- lead copy */

.hero-stage .hero-lead { opacity: 0; }
.hero-stage[data-motion="reduced"] .hero-lead { opacity: 1; }

.hero-stage .sonder-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;          /* CTA labels must never wrap. */
  padding: 11px 20px;
  border: 1px solid var(--sonder-rim);
  border-radius: var(--sonder-notch);
  background: rgba(57, 255, 20, 0.1);
  color: var(--sonder-hot);
  font: 500 12.5px/1 var(--font-mono, ui-monospace, monospace);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-decoration: none;
  transition:
    background 420ms var(--ease-sonder),
    box-shadow 420ms var(--ease-sonder),
    color 420ms var(--ease-sonder);
}
.hero-stage .sonder-cta:hover {
  background: rgba(57, 255, 20, 0.18);
  color: #f2fff0;
  box-shadow: 0 0 0 1px rgba(57, 255, 20, 0.35), 0 12px 34px rgba(57, 255, 20, 0.12);
}
.hero-stage .sonder-cta:active { transform: translateY(1px); }
.hero-stage .sonder-cta:focus-visible {
  outline: 2px solid var(--sonder-rim);
  outline-offset: 3px;
}
.hero-stage .sonder-cta--ghost {
  border-color: var(--sonder-line-quiet);
  background: transparent;
  color: rgba(232, 255, 224, 0.72);
}
.hero-stage .sonder-cta--ghost:hover {
  border-color: var(--sonder-line);
  background: rgba(57, 255, 20, 0.06);
  color: var(--sonder-hot);
}

@media (max-width: 560px) {
  .hero-stage .hero-lead { padding-bottom: 4vh; }
  .hero-stage .sonder-cta { padding: 10px 15px; font-size: 11px; }
}
```

   > `.sonder-cta` lives here rather than in `globals.css` on purpose. It is the one neon button in
   > the build, §3.3 forbids neon buttons in the product, and keeping the class physically inside the
   > hero's own stylesheet makes that boundary hard to cross by accident. `LandingNav` and
   > `EnterSection` declare their own scoped variants in `landing.css` rather than importing this one.

   **Contrast check for this button** (mandatory, and it passes): `#C8FFB0` on the composite of
   `rgba(57,255,20,0.1)` over `#121212` gives roughly 13:1. The ghost variant's
   `rgba(232,255,224,0.72)` on `#121212` gives roughly 10:1. Both clear WCAG AA for large text by a
   wide margin, and AA for normal text too.

7. **Nothing else changes.** `HERO_PIN_VH`, `HERO_SCRUB`, `HERO_ENTRY_END`,
   `HERO_WORDMARK_EXIT_END`, `HERO_WORDMARK_RISE_PCT`, `HERO_VEIL_OPACITY`, `refreshPriority: 1`,
   `anticipatePin: 1`, `invalidateOnRefresh: true`, the `pushEntry` plumbing and the
   `onViewerReady` late-arrival handling all stay.

### 7.8 The landing is theme-independent

`next-themes` toggles a `.dark` class on `<html>`. The landing must look identical whichever way
that class falls, because its palette is baked into a WebGL Fresnel material and a canvas fill that
CSS cannot reach.

**Do not add or remove the `dark` class for the landing.** Instead, every landing style either uses
a `--sonder-*` primitive (defined on bare `:root`, never overridden by `.dark`) or a literal hex
value copied from the source. The three copied CSS files already satisfy this, because they were
written for a Vite app with no theming at all. `landing.css` must follow the same rule:
**no `var(--background)`, no `var(--foreground)`, no `var(--card)`, no `var(--border)` anywhere
inside the landing.** If you reach for a semantic token on the landing, you have made a mistake.

The one sanctioned exception is the showcase vignettes (§10.4.6), which deliberately render real
product chrome and therefore need the real product tokens.

### 7.9 Verification for Phase 1

`npm run build` must pass. Nothing renders yet. Then grep to confirm that **no file under
`lib/landing/` or `components/landing/` still imports** `@/lib/three`, `@/lib/vine`, `@/lib/hero`,
`@/BrainViewer`, `@/components/SonderWordmark`, `@/vine.css` or `@/hero-stage.css`.

---

## 8. Phase 2 — Tokens, fonts and global CSS

`app/globals.css` is the single most important file in this plan. Work through it in the order
given; do not reorganise it.

### 8.1 Fonts and metadata: `app/layout.tsx`

```tsx
import { Geist, Geist_Mono, Newsreader } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

/** Display serif. 400 and 500 only: the design never sets display type heavier than medium. */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});
```

Add `${newsreader.variable}` to the `<html>` class list, keeping `h-full antialiased`.

Replace `metadata` with:

```tsx
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
```

Note the colons. There is not an em-dash in the file.

### 8.2 `app/globals.css`

**8.2.1** Keep the four existing `@import` lines exactly as they are, at the very top. Tailwind v4
requires `@import "tailwindcss"` first, and `@import` must precede all rules.

**8.2.2** Add the brand primitive block immediately after `@custom-variant dark (...)` and **before**
`@theme inline`:

```css
/* ---------------------------------------------------------------- brand primitives
 * Taken verbatim from brain-extract-anatomy (src/lib/three/teal-theme.ts, src/vine.css,
 * src/hero-stage.css, src/app.css). These are RAW values. Only the landing may use them
 * directly; product code uses the semantic tokens below.
 * DO NOT retune these. The 3D material, the vine strokes and the wordmark are all mixed
 * against these exact numbers, and CSS cannot reach the WebGL side to keep it in step.
 */
:root {
  --sonder-ink: #121212;          /* page ground; also the canvas fill colour */
  --sonder-ink-raised: #17190f;   /* one step up: card ground on dark */
  --sonder-ink-sunken: #0c0e0c;   /* one step down: wells, table headers */
  --sonder-rim: #39ff14;          /* THE accent */
  --sonder-hot: #c8ffb0;          /* accent highlight / hot core */
  --sonder-body: #0d4a08;
  --sonder-deep: #06180a;         /* text colour on neon fills */
  --sonder-paper: #e8ffe0;        /* ink on dark */
  --sonder-muted: #7aab70;        /* secondary ink on dark */
  --sonder-line: rgba(57, 255, 20, 0.16);
  --sonder-line-quiet: rgba(232, 255, 224, 0.1);
  --sonder-glass: rgba(10, 38, 12, 0.55);
  --sonder-grid-line: rgba(255, 255, 255, 0.045);
  --sonder-grid-size: 24px;
  --sonder-shadow: 0 24px 60px rgba(0, 0, 0, 0.45);
  --sonder-shadow-inset: inset 0 1px 0 rgba(57, 255, 20, 0.08);
  --sonder-notch: 2px 18px 18px 18px;
  --ease-sonder: cubic-bezier(0.16, 1, 0.3, 1);
  --font-display-stack: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia,
    "Times New Roman", serif;
}
```

**8.2.3** Inside the existing `@theme inline` block, keep every existing entry, change one and add
five:

```css
  --font-heading: var(--font-display);   /* CHANGED from var(--font-geist-sans) */
  --font-display: var(--font-newsreader), var(--font-display-stack);
  --color-sonder-rim: var(--sonder-rim);
  --color-sonder-hot: var(--sonder-hot);
  --color-sonder-paper: var(--sonder-paper);
  --color-sonder-muted: var(--sonder-muted);
```

Changing `--font-heading` makes shadcn's `CardTitle` (which uses `font-heading`) pick up the serif
with no component edit. The four colour entries make `text-sonder-rim`, `bg-sonder-rim/10` and
friends available as Tailwind utilities.

**8.2.4** Replace the whole body of `.dark { ... }` with:

```css
.dark {
  --background: var(--sonder-ink);
  --foreground: var(--sonder-paper);

  --card: var(--sonder-ink-raised);
  --card-foreground: var(--sonder-paper);
  --popover: #1a1d19;
  --popover-foreground: var(--sonder-paper);

  /* Section 3.3: primary is PAPER, not neon. The neon is reserved. */
  --primary: var(--sonder-paper);
  --primary-foreground: var(--sonder-deep);

  --secondary: #1f231e;
  --secondary-foreground: var(--sonder-paper);
  --muted: #1b1e1a;
  --muted-foreground: var(--sonder-muted);
  --accent: rgba(57, 255, 20, 0.1);
  --accent-foreground: var(--sonder-hot);

  --destructive: oklch(0.7 0.18 25);
  --border: var(--sonder-line-quiet);
  --input: rgba(232, 255, 224, 0.14);
  --ring: var(--sonder-rim);

  /* Charts: accent first, then a green ramp, then one cool outlier so a fifth series
     is still distinguishable for a viewer with a green deficiency. */
  --chart-1: var(--sonder-rim);
  --chart-2: #7fd96a;
  --chart-3: #4f9c42;
  --chart-4: #2f6a2a;
  --chart-5: #8fb6ff;

  /* Semantic states. `ok` deliberately IS the accent: "resolved with confidence" is this
     product's success state and the brand already means exactly that. warn / info / ai are
     pushed apart in hue so that three states never read as one at badge size. */
  --ok: var(--sonder-rim);
  --ok-foreground: var(--sonder-deep);
  --warn: oklch(0.82 0.14 78);
  --warn-foreground: oklch(0.24 0.05 78);
  --info: oklch(0.78 0.11 205);
  --info-foreground: oklch(0.18 0.03 205);
  --ai: oklch(0.74 0.13 300);
  --ai-foreground: oklch(0.18 0.03 300);

  --sidebar: #101210;
  --sidebar-foreground: var(--sonder-paper);
  --sidebar-primary: var(--sonder-rim);
  --sidebar-primary-foreground: var(--sonder-deep);
  --sidebar-accent: rgba(57, 255, 20, 0.08);
  --sidebar-accent-foreground: var(--sonder-hot);
  --sidebar-border: var(--sonder-line-quiet);
  --sidebar-ring: var(--sonder-rim);
}
```

**8.2.5** Retune the light `:root` ramp. Neon on white is unreadable, so light mode uses a darkened
counterpart of the same hue. Change only these keys; leave `--radius`, `--header-height` and the
`--sidebar-width*` pair alone.

```css
  --background: #fbfbf8;                /* warm paper, not pure white */
  --foreground: #12140f;                /* off-black, not #000 */
  --card: #ffffff;
  --card-foreground: #12140f;
  --popover: #ffffff;
  --popover-foreground: #12140f;
  --primary: #16190f;
  --primary-foreground: #f7fff2;
  --secondary: #f1f2ec;
  --secondary-foreground: #16190f;
  --muted: #f1f2ec;
  --muted-foreground: #5c6355;          /* about 6.4:1 on the background */
  --accent: rgba(30, 122, 16, 0.1);
  --accent-foreground: #16510c;
  --destructive: oklch(0.55 0.2 27);
  --border: rgba(18, 20, 15, 0.1);
  --input: rgba(18, 20, 15, 0.14);
  --ring: #1e7a10;                      /* the light-mode counterpart of #39FF14 */
  --chart-1: #1e7a10;
  --chart-2: #4f9c42;
  --chart-3: #7a9c72;
  --chart-4: #b0bfa8;
  --chart-5: #4a6fa5;
  --ok: #1e7a10;
  --ok-foreground: #ffffff;
  --warn: oklch(0.68 0.13 72);
  --warn-foreground: oklch(0.3 0.05 72);
  --info: oklch(0.52 0.11 205);
  --info-foreground: #ffffff;
  --ai: oklch(0.5 0.13 300);
  --ai-foreground: #ffffff;
  --sidebar: #f6f7f2;
  --sidebar-foreground: #12140f;
  --sidebar-primary: #16190f;
  --sidebar-primary-foreground: #f7fff2;
  --sidebar-accent: rgba(30, 122, 16, 0.09);
  --sidebar-accent-foreground: #16510c;
  --sidebar-border: rgba(18, 20, 15, 0.1);
  --sidebar-ring: #1e7a10;
```

**8.2.6** Extend `@layer base`, after the existing `html { @apply font-sans; }`:

```css
  /* Display type: serif, never heavier than medium, tight leading. */
  h1, h2, h3 {
    font-family: var(--font-display);
    font-weight: 400;
    letter-spacing: -0.01em;
    line-height: 1.16;
  }
  /* The micro-type signature. One class, used wherever a label is not a sentence. */
  .eyebrow {
    font-family: var(--font-mono);
    font-size: 10.5px;
    line-height: 1.4;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }
  /* Italic descender clearance: display italic with a y/g/j/p/q must not clip. */
  .font-display em, .font-display i { line-height: 1.1; padding-bottom: 1px; }
```

**Replace** the existing `::selection` rule with
`background: color-mix(in oklch, var(--ring) 26%, transparent);`. Keep `.nums` unchanged. In
`.app-scroll`, change `scrollbar-color` and both thumb backgrounds from mixing against
`var(--foreground)` to mixing against `var(--ring)` at 22% and 34% respectively; the scrollbar is
the one piece of persistent chrome that should carry the accent.

**8.2.7** Add the shared utilities at the end of the file, before the existing
`@media (prefers-reduced-motion: reduce)` block:

```css
/* ------------------------------------------------------------------- utilities */

/* The 24px construction grid. Matches AetherFlow's canvas grid exactly: same pitch,
   same 1px line, same alpha, same origin. This is what lets the fixed canvas and the
   scrolling sections read as one continuous surface. */
.sonder-grid {
  background-color: var(--sonder-ink);
  background-image:
    linear-gradient(to right, var(--sonder-grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--sonder-grid-line) 1px, transparent 1px);
  background-size: var(--sonder-grid-size) var(--sonder-grid-size);
  background-position: 0 0;
}

/* Same grid, masked out toward the bottom. For product surfaces where a hard grid
   would compete with the data. */
.sonder-grid-soft {
  background-image:
    linear-gradient(to right, var(--sonder-grid-line) 1px, transparent 1px),
    linear-gradient(to bottom, var(--sonder-grid-line) 1px, transparent 1px);
  background-size: var(--sonder-grid-size) var(--sonder-grid-size);
  -webkit-mask-image: radial-gradient(120% 90% at 50% 0%, #000 35%, transparent 100%);
  mask-image: radial-gradient(120% 90% at 50% 0%, #000 35%, transparent 100%);
}

/* The signature asymmetric corner. Section 3.4: invitations only. */
.notch { border-radius: var(--sonder-notch); }

/* Product card depth: tinted to the ground hue, never pure black. */
.surface-shadow { box-shadow: 0 1px 2px rgba(18, 20, 15, 0.05); }
.dark .surface-shadow {
  box-shadow:
    inset 0 1px 0 rgba(232, 255, 224, 0.03),
    0 10px 30px -18px rgba(0, 0, 0, 0.7);
}

/* Scroll reveal. Elements start hidden ONLY once JS has marked the scope ready, so a
   no-JS or broken-JS render still shows every word and every crawler sees the copy. */
[data-reveal-scope="ready"] [data-reveal] {
  opacity: 0;
  transform: translate3d(0, 18px, 0);
  transition:
    opacity 720ms var(--ease-sonder),
    transform 720ms var(--ease-sonder);
  transition-delay: calc(var(--reveal-i, 0) * 60ms);
}
[data-reveal-scope="ready"] [data-reveal].is-revealed {
  opacity: 1;
  transform: none;
}

/* Loading idiom: a hairline that draws itself. Replaces every spinner in this build. */
@keyframes sonder-draw {
  0%   { transform: scaleX(0);   transform-origin: left center; }
  50%  { transform: scaleX(1);   transform-origin: left center; }
  50.1%{ transform: scaleX(1);   transform-origin: right center; }
  100% { transform: scaleX(0);   transform-origin: right center; }
}
.sonder-draw-rule {
  height: 1px;
  background: var(--ring);
  animation: sonder-draw 1.6s var(--ease-sonder) infinite;
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal-scope="ready"] [data-reveal],
  [data-reveal-scope="ready"] [data-reveal].is-revealed {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .sonder-draw-rule { animation: none; transform: none; opacity: 0.5; }
}
```

**8.2.8** Retime `.page-enter` from `0.22s cubic-bezier(0.16, 1, 0.3, 1)` to
`0.26s var(--ease-sonder)`.

### 8.3 Default theme: `app/providers.tsx`

Change `defaultTheme="system"` to `defaultTheme="dark"`. Keep `enableSystem`.

Reasoning: the landing is dark-only by construction (§7.8). Defaulting the app to dark means a
first-time visitor never gets a hard white flash walking from `/` into `/student`. The toggle still
works and light mode is fully specified, so no one is trapped.

### 8.4 Verification for Phase 2

`npm run build`, then `npm run dev` and check `/student` in both themes. Nothing should be broken;
colours should be green-cast charcoal in dark and warm paper in light; page titles should be serif.
The landing does not exist yet, which is expected.

---

## 9. Phase 3 — Shared additions before the landing

Three small pieces that both surfaces need. Build them before the landing so the landing can use
them and the product sweep does not have to invent them twice.

### 9.1 `components/app/BrandMark.tsx`

One mark, four call sites (`LandingNav`, `LandingFooter`, `AppShell`'s `Brand`, and the favicon
source). Three hand-rolled copies is how a design system dies.

- Props: `size?: number` (default 22), `withWordmark?: boolean` (default true),
  `className?: string`.
- The glyph is the wordmark's own `S`: import `SONDER_GLYPHS` from
  `@/lib/landing/hero/wordmark-glyphs` and render `SONDER_GLYPHS[0].strokes[0]` as a single `<path>`
  inside a `viewBox="0 0 64 92"` svg, `fill="none"`, `stroke="currentColor"`, `strokeWidth={5}`,
  `strokeLinecap="round"`, `vectorEffect="non-scaling-stroke"`.
- Colour comes from `currentColor`, so callers set `text-sonder-rim` on the landing and
  `text-foreground` in the product shell.
- When `withWordmark`, follow it with `<span className="eyebrow" style={{letterSpacing:"0.34em"}}>SONDER</span>`.
- Mark the `<svg>` `aria-hidden="true" focusable="false"`; the accessible name comes from the
  wrapping link's text or `aria-label`.

**This is the one place in the build where a hand-drawn SVG path is permitted**, and it is permitted
because the path is not drawn by you: it is imported from the design source's own glyph data, which
is the brand.

### 9.2 `components/landing/useReveal.ts`

One hook implementing the `[data-reveal]` contract from §8.2.7. Used by every static landing
section and by the showcase rail.

```tsx
"use client";
import { useEffect, useRef } from "react";

/**
 * Adds `is-revealed` to every [data-reveal] descendant as it enters the viewport, once.
 * Sets data-reveal-scope="ready" only after mount, so a no-JS render shows everything
 * (globals.css hides [data-reveal] only inside a ready scope).
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    targets.forEach((el, i) => el.style.setProperty("--reveal-i", String(i)));
    root.dataset.revealScope = "ready";

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((el) => el.classList.add("is-revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("is-revealed");
          io.unobserve(e.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return ref;
}
```

Sections mark their children with a bare `data-reveal` attribute. The `--reveal-i` index drives the
60ms stagger declared in `globals.css`. Keep the stagger to at most 8 children per scope; beyond
that the last item feels laggy.

### 9.3 `components/landing/styles/landing.css`

The only new stylesheet. It contains, in this order:

1. `.sonder-landing` root: `position: relative; min-height: 100dvh; background: var(--sonder-ink);
   color: var(--sonder-paper); color-scheme: dark;`
2. `.sonder-landing :where(h1, h2, h3) { font-family: var(--font-display); font-weight: 400; }`
3. `.sonder-landing [id] { scroll-margin-top: 84px; }` so anchor jumps clear the fixed nav.
4. Every `.landing-nav*`, `.thesis*`, `.showcase*`, `.mechanism*`, `.guarantee*`, `.enter*` and
   `.landing-footer*` rule described in §10.
5. `contain: layout style;` on `.showcase-stage` and on `.vine-scroller`. Both are very tall
   subtrees whose internal changes must not trigger whole-document layout.
6. A `@media (prefers-reduced-motion: reduce)` block that kills every transition in this file and
   removes `position: sticky` from `.showcase-stage`.
7. **Exactly three font-variable overrides into the copied stylesheets, and nothing else:**

```css
/* The vine and the viewer authored their own Palatino stack before this app had a display
   font. Point them at the shared one so the landing and the product use the same serif.
   Everything else inside vine.css and brain-viewer.css stays byte-identical to the source,
   which is what keeps a future re-sync from brain-extract-anatomy cheap. */
.sonder-landing .vine-scroller {
  --v-font-serif: var(--font-display);
  --v-font-sans: var(--font-geist-sans), system-ui, sans-serif;
  --v-font-mono: var(--font-geist-mono), ui-monospace, monospace;
}
.sonder-landing .brain-viewer {
  --bv-font-serif: var(--font-display);
  --bv-font-sans: var(--font-geist-sans), system-ui, sans-serif;
}

/* The narrative-to-product link added in section 7.6. */
.sonder-landing .vine-node-link {
  color: var(--v-rim);
  text-decoration: none;
  transition: color 320ms var(--v-ease);
}
.sonder-landing .vine-node-link:hover { color: var(--v-hot); }
.sonder-landing .vine-node-link:focus-visible {
  outline: 2px solid var(--v-rim);
  outline-offset: 3px;
}
```

**Do not edit `vine.css` or `brain-viewer.css` themselves.**

---

## 10. Phase 4 — The landing composition

### 10.1 `app/page.tsx`

```tsx
import { Landing } from "@/components/landing/Landing";

export default function Home() {
  return <Landing />;
}
```

It stays a **server component** so the metadata from `layout.tsx` applies statically and the HTML
shell streams immediately. All interactivity is one level down.

### 10.2 `components/landing/Landing.tsx`

```tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { LandingNav } from "./LandingNav";
import { ThesisBand } from "./sections/ThesisBand";
import { ShowcaseStage } from "./sections/ShowcaseStage";
import { MechanismStrip } from "./sections/MechanismStrip";
import { GuaranteeBand } from "./sections/GuaranteeBand";
import { EnterSection } from "./sections/EnterSection";
import { LandingFooter } from "./sections/LandingFooter";
import VineScroller from "./VineScroller";
import { initSmoothScroll, destroySmoothScroll } from "@/lib/landing/smooth-scroll";
import "./styles/landing.css";

/**
 * The hero owns a WebGL context and a 2.5 MB model; the backdrop owns a rAF loop over a
 * full-viewport canvas. Neither can run on the server and neither belongs in the first JS
 * chunk, so both are client-only dynamic imports. Everything else, including the vine
 * whose copy must be in the server HTML, renders normally.
 */
const AetherFlow = dynamic(() => import("./AetherFlow"), { ssr: false });
const HeroStage = dynamic(() => import("./HeroStage"), {
  ssr: false,
  loading: () => <div className="sonder-grid h-[100dvh] w-full" aria-hidden />,
});

export function Landing() {
  useEffect(() => {
    initSmoothScroll();
    return () => destroySmoothScroll();
  }, []);

  return (
    <div className="sonder-landing" id="top">
      <AetherFlow />
      <LandingNav />

      <main className="relative z-[1]">
        <HeroStage />
        <ThesisBand />
        <section id="narrative" aria-label="How Sonder works">
          <VineScroller />
        </section>
        <ShowcaseStage />
        <MechanismStrip />
        <GuaranteeBand />
        <EnterSection />
      </main>

      <LandingFooter />
    </div>
  );
}
```

**Seven things to get right here, each of which will bite if missed:**

1. **`initSmoothScroll` moves from module scope into an effect with a real teardown.** In the design
   source it runs at import time in `main.tsx`. Under Next it must be scoped to this route, because
   the product shell is `h-dvh overflow-hidden` and scrolling there happens inside
   `main.app-scroll`, not on the document. Lenis left alive after navigating to `/student` keeps
   hijacking the wheel on an element that does not scroll, and the product feels broken. **The
   `destroySmoothScroll()` cleanup is load-bearing, not hygiene.**
2. **`ssr: false` requires a client parent.** `Landing` is `"use client"`. Calling
   `next/dynamic(..., { ssr: false })` from `app/page.tsx`, a server component, is an error in the
   App Router.
3. **`VineScroller` is deliberately NOT dynamic.** Its render path is SSR-safe: all `window` access
   is inside effects, `geom` starts `null`, and the `null` branch renders just the rows. Server
   rendering it puts all six nodes of product copy and all six deep links into the initial HTML, and
   `vine.css` keeps cards visible until `data-ready="true"`. Making it dynamic would throw away the
   SEO and the no-JS fallback for no gain.
4. **Stacking.** `AetherFlow` is `fixed inset-0 z-0`; `main` is `relative z-[1]`; `LandingNav` is
   `fixed z-50`. Do not change these. `HeroStage` internally uses `z-[6]`, `z-[7]` and `z-[8]`, all
   inside `main`'s stacking context.
5. **The `HeroStage` loading fallback must be exactly one dynamic viewport tall** and must carry
   `.sonder-grid`, so the page does not shift when the real hero swaps in. This is the CLS defence.
6. **`LandingFooter` sits outside `<main>`** so it is not in the same scroll-linked layer; it gets
   its own `position: relative; z-index: 1` in `landing.css`.
7. **Call `ScrollTrigger.refresh()` once after fonts settle.** Add to the same effect:

```tsx
    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        void import("gsap/ScrollTrigger").then((m) => m.ScrollTrigger.refresh());
      });
    }
```

   Web fonts landing late change every vine card's height, which changes the measured geometry and
   therefore every trigger's start position. Without this the vine's growth drifts out of step with
   the cards on a cold load.

### 10.3 `components/landing/LandingNav.tsx`

A fixed, hairline-bottomed bar, transparent at the top of the page, acquiring a glass background
once the hero pin has released.

- **Left:** `<BrandMark size={22} />` inside a link to `#top`, coloured `text-sonder-rim`.
- **Centre (only at `>= 900px`):** three anchors, `The premise` to `#premise`, `The product` to
  `#showcase`, `The guarantee` to `#guarantee`. Styled `.eyebrow`, `rgba(232,255,224,0.6)`, hover
  `var(--sonder-hot)`. Three items keeps the bar on one line at every width; **the nav must never
  wrap to two lines**, and its height is capped at **64px**.
- **Right:** one CTA, `.sonder-cta` scoped down to `padding: 8px 14px; font-size: 11px`, labelled
  **Enter the prototype**, anchoring to `#enter`. Same label as the hero primary, because it is the
  same intent.
- **First focusable element** is a visually-hidden skip link, **Skip to workspace entry**, targeting
  `#enter`. On a 15-viewport page this is not optional.
- **Semantics:** `<header role="banner">` wrapping `<nav aria-label="Landing">`.

**Scroll state, without a scroll listener.** Render a 1px sentinel `<div ref={sentinelRef} />` as the
first child of `.sonder-landing`, positioned at the top of the document, and observe it:

```tsx
  useEffect(() => {
    const el = sentinelRef.current;
    const header = headerRef.current;
    if (!el || !header) return;
    const io = new IntersectionObserver(
      ([entry]) => header.toggleAttribute("data-scrolled", !entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
```

Place the sentinel with `position: absolute; top: 90vh; height: 1px; width: 1px;` so the state
flips near the end of the hero's first screen. CSS transitions `background`, `border-color` and
`backdrop-filter` over 520ms `var(--ease-sonder)`:

```css
.sonder-landing .landing-nav[data-scrolled] {
  background: rgba(18, 18, 18, 0.72);
  backdrop-filter: blur(14px);
  border-bottom-color: var(--sonder-line-quiet);
}
```

**A `scroll` event listener here would be a violation of §3.5. Do not use one.**

Anchor scrolling works with plain `href="#id"` because Lenis intercepts and animates it; under
reduced motion Lenis is absent and the browser jumps, which is correct behaviour.

### 10.4 `components/landing/sections/ShowcaseStage.tsx`

This is the section that satisfies "integrate the product showcase with all its screens", and it is
the most involved new component in the plan. Build it exactly as specified.

#### 10.4.1 What it shows

Four steps, one per role, each pairing a claim with a **live composition of the product's own
components fed by the product's own fixtures**. Never a screenshot, never invented data.
Screenshots go stale the moment a token changes; live vignettes cannot, which is precisely why
`taste-skill` permits "a real component preview" while banning div-based fakes.

| Step | Role | Claim (display serif, at most 9 words) | Vignette content, all from `fixtures/` | Deep link |
|---|---|---|---|---|
| 1 | Student | *A question chosen to tell two ideas apart.* | `OutcomeBanner type="unsure"` plus two real answer options from scenario B, plus the engine's one-line reason for asking | `/student/start` |
| 2 | Teacher | *Every diagnosis arrives with its evidence.* | `PosteriorBarSet` in its **tie** state from scenario B, plus two `EvidenceStep` rows, plus `StatusBadge status="escalated"` | `/teacher/session/B` |
| 3 | Parent | *Nothing is shown before a teacher approves it.* | One `PARENT_SUMMARIES` entry rendered as `/parent` renders it, plus one gated row in its locked state | `/parent` |
| 4 | Admin | *When the bank falls short, it writes new questions.* | Three `StatTile`s from `CATALOGUE`, `COVERAGE_GAPS` and `PERF_METRICS`, plus one `COVERAGE_GAPS` row with its badge | `/admin/coverage` |

Each vignette is its own file under `components/landing/sections/vignettes/`:
`StudentVignette.tsx`, `TeacherVignette.tsx`, `ParentVignette.tsx`, `AdminVignette.tsx`. Each is a
server-safe component importing from `@/components/shared`, `@/components/app/primitives` and
`@/fixtures/*`. **Import the fixtures; never retype their values.** If a fixture field is not named
what you expect, open the fixture file. Do not guess and do not invent a number.

#### 10.4.2 Layout

```
<section id="showcase" className="showcase">          /* height: 400vh */
  <div className="showcase-stage">                    /* sticky; top:0; height:100dvh */
    <div className="showcase-grid">                   /* >=1024px: 320px rail + 1fr */
      <ol className="showcase-rail"> ...4 steps... </ol>
      <div className="showcase-panel">
        <div className="showcase-frame"> ...4 stacked vignettes... </div>
        <p className="showcase-route"> route path + link </p>
      </div>
    </div>
  </div>
</section>
```

- **Rail (left).** Four `<li>`s, each with the role name in display serif at 18px and the claim in
  13.5px body. The active row is at full opacity with a 1px neon left rule; inactive rows sit at
  0.32 opacity with a quiet rule. A single vertical hairline runs the rail's full height, with a
  neon segment whose `height` is written directly from the scrub progress. That growing line is the
  same idea as the vine, restated straight, which is why it belongs here and not somewhere else.
  **No numbers on the steps** (§4.1) and **no status dots**.
- **Frame (right).** A `.notch` plate: `background: var(--sonder-glass)`,
  `backdrop-filter: blur(9px)`, `border: 1px solid var(--sonder-line)`,
  `box-shadow: var(--sonder-shadow), var(--sonder-shadow-inset)`, `padding: 26px`,
  `overflow: hidden`. **No title bar. No traffic-light dots. No fake browser chrome of any kind.**
  Inside, the four vignettes are absolutely stacked; the active one gets `opacity: 1; transform: none`,
  the others `opacity: 0; transform: translate3d(0, 14px, 0); pointer-events: none`, transitioned
  over 520ms `var(--ease-sonder)`.
- **Below the frame.** One line: the destination route in `.eyebrow` mono
  (`/teacher/session/B`), then a `<Link>` styled as the ghost CTA, labelled
  **Open this screen**. This is what turns the showcase from a poster into a way into the product.
  Only one link label is used for all four steps, so this does not create four competing CTA
  intents.

#### 10.4.3 The scroll driver

```ts
const ctx = gsap.context(() => {
  ScrollTrigger.create({
    trigger: sectionRef.current,
    start: "top top",
    end: "bottom bottom",
    scrub: 0.6,
    invalidateOnRefresh: true,
    // Third in line. The hero pin (1) and the vine (0) must both be measured first,
    // because the hero's pin spacer moves this section's document position.
    refreshPriority: -1,
    onToggle: (self) =>
      document.documentElement.toggleAttribute("data-showcase-active", self.isActive),
    onUpdate: (self) => {
      const next = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length));
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);                                 // ONE React write per step
      }
      railFillRef.current?.style.setProperty("height", `${self.progress * 100}%`);
    },
  });
}, sectionRef);
```

**Do not drive the crossfade from `self.progress` through React state on every frame.** That is 60
re-renders per second of four fixture-heavy subtrees. The `activeRef` guard means React renders
exactly four times across 400vh of scroll, and everything continuous (the rail fill) is a direct
style write that never touches React at all.

#### 10.4.4 Native sticky, not a second GSAP pin

The stage uses CSS `position: sticky` and GSAP only *reads* progress. Reasoning, and it is the
GSAP guidance's own: **do not pin more than one or two sections per page**; pinning forces layout
reflow and fights native scroll feel, especially on mid-tier mobile. A second `pin: true` on the
same page as the hero's pin also compounds spacer-measurement ordering, which is the exact problem
`refreshPriority` exists to manage and the most common way these setups break. Sticky needs no
spacer, cannot desynchronise from the document, and degrades to "the section just scrolls" if
anything fails.

#### 10.4.5 Reduced motion

If `matchMedia("(prefers-reduced-motion: reduce)").matches`: create no ScrollTrigger, set
`data-motion="reduced"` on the section, and let `landing.css` set the section `height: auto` and
drop `position: sticky`. Render all four steps stacked vertically with their vignettes permanently
visible. Every claim, every vignette and every deep link stays reachable.

#### 10.4.6 Vignette theming, the one sanctioned exception

Vignettes render real product components, which read semantic tokens (`--card`, `--border`,
`--muted-foreground`). Wrap the frame's inner content in
`<div className="dark showcase-vignette">` so those tokens resolve to the dark ramp regardless of
what `next-themes` has done to `<html>`. This is the single sanctioned use of a semantic token
inside the landing (§7.8), and it is sanctioned precisely because the point is to show the real
product surface.

`.showcase-vignette` additionally needs `--card: rgba(23, 25, 15, 0.72);` so the vignette's cards
sit on the frame's glass instead of punching an opaque hole through it.

#### 10.4.7 Mobile

Below 1024px the grid collapses to one column: the rail becomes a horizontal scroll-snap strip of
four pills above the frame, the frame goes full width, and the section height drops to `320vh`. At
`< 640px` the frame's padding drops to 16px and vignettes may scroll internally with
`overflow-x: auto` where they contain a table-like row.

### 10.5 `components/landing/sections/ThesisBand.tsx`

One statement, one rule, nothing else. About 70vh, centred, `id="premise"`.

- `.eyebrow` in `text-sonder-rim/85`: **The premise** *(eyebrow 2 of 3)*
- Display serif, `clamp(30px, 4.4vw, 58px)`, `line-height: 1.08`, `max-width: 26ch`:
  **A mark is a number. A misconception is a reason.**
- Body, `max-width: 58ch`, `rgba(232,255,224,0.66)`, 15.5px / 1.7:
  *Marking tells a teacher that a student got it wrong. It does not tell them why. Sonder starts
  from the why: a catalogue of specific, named misconceptions, one of which is usually the real
  cause. Then it works out which one, question by question.*
- A full-width 1px rule beneath, which **draws itself** left to right when the section enters: an
  `<svg height="1" aria-hidden="true">` with one `<path>` whose `stroke-dashoffset` animates to 0
  over 820ms `var(--ease-sonder)`, triggered by the shared reveal observer.

### 10.6 `components/landing/sections/MechanismStrip.tsx`

Three steps showing how the engine decides, in the technical-drawing vocabulary. **No eyebrow, no
step numbers.** `id="mechanism"`.

Section headline (display serif, `clamp(24px, 2.6vw, 34px)`): **How it decides.**

| Title | Body |
|---|---|
| **Ask** | The next question is chosen to separate the two leading hypotheses, not to test more of the same. |
| **Update** | Every answer moves a probability across the whole set of competing misconceptions, not only the one being tested. |
| **Resolve, or escalate** | Above the confidence threshold it names the misconception. Level with a rival, it says so and hands the case to a teacher. It never guesses. |

Layout: a 3-column grid at `>= 900px`, stacked below. Each cell is **not a card**. It is a column
hanging under one shared horizontal hairline, with a 9px registration crosshair sitting on that rule
above each column (reuse `crosshair(7)` from `@/lib/landing/hero/wordmark-glyphs`), the title in
display serif at 22px, and the body at 14.5px / 1.66. Between cells at `>= 900px`, a 1px vertical
hairline in `var(--sonder-line-quiet)`. Cells reveal with the shared observer at 60ms stagger.

> Deliberately card-less: three identical cards in a row is the single most generic layout on the
> web and `taste-skill` bans it outright. The shared rule plus crosshairs carries the same
> information in the design's own language, and it is the only place besides the wordmark where the
> crosshair appears (§4.2, Override 2).

### 10.7 `components/landing/sections/GuaranteeBand.tsx`

About 60vh, `id="guarantee"`. A single bordered plate, `max-width: 78ch`, centred, `.notch`,
`border: 1px solid var(--sonder-line)`, `background: var(--sonder-glass)`,
`backdrop-filter: blur(9px)`, `box-shadow: var(--sonder-shadow)`. **No eyebrow.** Inside:

- Display serif, `clamp(24px, 2.8vw, 36px)`:
  **No student and no parent sees a result a teacher has not approved.**
- Body: *Escalation is a first-class outcome, not a failure mode. When the engine cannot separate
  two explanations it says so, shows the teacher every question it asked and every answer it got,
  and stops.*
- A `<Link href="/teacher">` in the ghost CTA style: **See the evidence panel**

### 10.8 `components/landing/sections/EnterSection.tsx`

Replaces the old `/` role picker and must keep its behaviour byte for byte. About 90vh, `id="enter"`.

```tsx
"use client";
import { useRouter } from "next/navigation";
import { useSession, type Role } from "@/lib/session";
import { ROLES, ROLE_ORDER } from "@/lib/roles";

// inside the component:
const { signIn } = useSession();
const router = useRouter();
const enter = (role: Role) => { signIn(role); router.push(ROLES[role].home); };
```

Header block:

- `.eyebrow` in `text-sonder-rim/85`: **Enter** *(eyebrow 3 of 3)*
- Display serif, `clamp(26px, 3vw, 40px)`: **Four workspaces. One engine.**
- Body, `max-width: 58ch`: *This build runs entirely on scripted fixture data. There is no backend,
  no authentication and no live model. Pick a workspace to walk the flow end to end.*

Four `<button type="button">` elements in a 2x2 grid at `>= 760px`, one column below. Each is
`.notch`, `border: 1px solid var(--sonder-line-quiet)`, `background: rgba(10, 38, 12, 0.34)`,
`backdrop-filter: blur(9px)`, `padding: 22px 24px 24px`, `text-align: left`. Contents, in the vine
card's own order and typography so the two read as the same object:

1. `.eyebrow` in `text-sonder-rim/85`: `ROLES[role].label` uppercased
2. Display serif 22px: `ROLES[role].person`
3. `.eyebrow` in `var(--sonder-muted)`, no accent: `ROLES[role].context`
4. Body 14px / 1.6 in `rgba(232,255,224,0.7)`: `ROLES[role].blurb`
5. A hairline rule, then a mono row: the role's icon at 16px in `var(--sonder-rim)`, then
   `ROLES[role].home` (for example `/student`) with a trailing arrow glyph.

**Row 5 is the route path, not the word "Enter".** Reasoning: `taste-skill` fails a page that has
two CTAs with the same intent under different labels, and "Enter the prototype" already owns that
intent in the nav and the hero. Showing the destination path is honest, technical, on-brand, and
tells the visitor exactly where the click lands.

States: hover gives `border-color: var(--sonder-line)`, `background: rgba(57,255,20,0.06)`,
`transform: translateY(-2px)`, `box-shadow: var(--sonder-shadow)` over 420ms `var(--ease-sonder)`.
Active gives `transform: translateY(0)`. Focus-visible gives
`outline: 2px solid var(--sonder-rim); outline-offset: 3px`.

### 10.9 `components/landing/sections/LandingFooter.tsx`

About 40vh, `.sonder-grid` ground with a top hairline, `role="contentinfo"`. Three columns at
`>= 760px`, stacked below. **No eyebrows** (the budget is spent); column headings are plain 11px
mono in `var(--sonder-muted)` without the accent colour, which is what distinguishes them from
eyebrows.

- **Left.** `<BrandMark size={20} />`, then in muted body: *Final-year project. Adaptive
  misconception diagnosis across Maths, Physics and Chemistry.*
- **Middle**, heading `Walk the build`: vertical links to `/student`, `/teacher`, `/parent`,
  `/admin`, and `/dev/components` labelled **Component gallery**.
- **Right**, heading `Notes`: three lines at 11.5px in `rgba(232,255,224,0.5)`:
  *Scripted data. No backend, no authentication, no live model.* /
  *3D model generated with Tripo AI. See the licence notes in the README.* /
  *Built with Next.js, three.js and GSAP.*

Bottom rule, then one centred line at 11px in `rgba(232,255,224,0.34)`: `SONDER · PROOF OF CONCEPT`
followed by the year. That is the **only** middle dot permitted on the page; `taste-skill` rations
it to one per line and this is the one line that uses it. **No version stamp, no build number, no
locale or time strip.**

**Contrast note:** `rgba(232,255,224,0.5)` over `#121212` is about 4.9:1, which clears AA for the
11.5px note text. Do not lower it further, and do not use it for anything a user must read to
operate the site.

### 10.10 Icon and social card

Both are required and both are quick.

- **`app/icon.svg`.** A 32x32 SVG: `#121212` square, and the wordmark `S` path from
  `SONDER_GLYPHS[0].strokes[0]` scaled into it, `stroke: #39FF14`, `stroke-width: 7`,
  `fill: none`, `stroke-linecap: round`. Next serves this as the favicon automatically. Delete
  `app/favicon.ico` once `icon.svg` is in place, or the stale Next default wins.
- **`app/opengraph-image.png`.** A committed static 1200x630 PNG. WebGL and canvas cannot render
  into a social card, so this must be produced once by hand: run the dev server, open `/`, let the
  hero settle at about 60% of the pin, screenshot at 1200x630, and commit the file. Next picks it up
  from that filename with no code. **Do not attempt to generate it with `ImageResponse`;** Satori
  cannot render the WebGL scene or the canvas grid, and the result would misrepresent the page.

---

## 11. Phase 5 — The copy

All landing copy is specified in §10 and §11.1. Do not write your own. Do not leave the word
"Placeholder" anywhere in the shipped build.

### 11.1 `lib/landing/vine/content.ts`

Keep the `VineNode` type, add the `href` field from §7.6, update the header comment to say the copy
is now real, and replace the array with exactly this:

```ts
export const VINE_NODES: VineNode[] = [
  {
    id: "problem",
    eyebrow: "The problem",
    title: "A wrong answer is not a diagnosis",
    body: "Marking tells a teacher that a student got it wrong. It does not tell them why. The same wrong answer can come from four different broken ideas, and each one needs a different fix.",
    meta: "Start a diagnostic",
    href: "/student/start",
  },
  {
    id: "engine",
    eyebrow: "The engine",
    title: "It asks until it can tell two ideas apart",
    body: "Sonder holds a set of competing misconceptions and a probability across all of them. Every answer moves the whole set, and the next question is chosen for one job: to separate the two that are still level.",
    meta: "Watch the posterior move",
    href: "/teacher/session/B",
  },
  {
    id: "evidence",
    eyebrow: "The evidence",
    title: "Every diagnosis shows its work",
    body: "A teacher does not receive a score. They receive the question that was asked, the answer that was given, the engine's reason for asking it, and the confidence across every hypothesis at every step.",
    meta: "See what a teacher receives",
    href: "/teacher",
  },
  {
    id: "gate",
    eyebrow: "The gate",
    title: "Nothing reaches a child unreviewed",
    body: "No student and no parent sees a result a teacher has not approved. When the engine cannot separate two explanations it says so and escalates. An honest \u201Cunsure\u201D is a first-class outcome, never dressed up as a result.",
    meta: "See what a parent sees",
    href: "/parent",
  },
  {
    id: "loop",
    eyebrow: "The loop",
    title: "When the bank falls short, it writes new questions",
    body: "A pair of misconceptions that no existing question can distinguish is a coverage gap. Sonder drafts candidates, scores them, discards the weak ones automatically, and sends only what survives to two independent human reviewers.",
    meta: "See a coverage gap",
    href: "/admin/coverage",
  },
  {
    id: "return",
    eyebrow: "The return",
    title: "A fix only counts if it holds",
    body: "Days after a study note is read, one question comes back to check the misconception has not returned. If it has, the case reopens where it left off instead of starting from nothing.",
    meta: "Take a follow-up check",
    href: "/student/verify/B",
  },
];
```

Notes on this copy, so you do not "improve" it into something worse:

- **Zero em-dashes.** The `\u201C` and `\u201D` escapes are curly quotes, which are correct
  typography and avoid a fight with `react/no-unescaped-entities`. Keep them as escapes.
- **The `meta` line is now an imperative link label**, not a numbered decoration. Every one of the
  six `href` values is a route verified to exist in §2.2.
- Titles are at most 8 words; bodies are 150 to 320 characters. The vine measures the cards and
  regrows around whatever length they turn out to be, but the reading rhythm breaks past about three
  sentences.

### 11.2 Copy rules for anything added later

British spelling, matching the existing product copy ("catalogue", "behaviour"). Never claim the PoC
does something it does not: there is no real model, no backend, no authentication. Every strong
claim above describes the *design*, and the footer and the Enter section both state the limitation
plainly. Keep that balance; it is what makes the page credible to an examiner.

---

## 12. Phase 6 — Propagating the design across the product

The landing establishes the language; this phase makes the other 26 screens speak it. Work
component-first, then sweep routes. **Every change in this phase is a styling change. Do not alter
behaviour, data flow, routing, fixtures or tests.**

Remember the product dial set: variance 4, motion 3, density 7. No scroll-linked animation, no
overshoot easing, no neon buttons.

### 12.1 `components/app/AppShell.tsx`

| Change | Detail |
|---|---|
| Background | Add `sonder-grid-soft` to the root `<div>` alongside `bg-background`, so the 24px lattice runs under the product too, masked so it never competes with data. |
| Brand | Replace the `S`-in-a-square with `<BrandMark size={20} withWordmark={!collapsed} />` from §9.1. |
| Brand link | `Brand`'s `href` becomes `/` (the landing), not `ROLES[role].home`. Clicking the wordmark should return to the front door. |
| Sidebar active state | Replace `bg-sidebar-accent font-medium text-foreground` with `relative bg-sidebar-accent font-medium text-foreground before:absolute before:inset-y-1 before:left-0 before:w-px before:bg-sonder-rim`. This is accent job 2 and it echoes the vine's growing line. |
| Section labels | The two `text-[11px] uppercase tracking-wider` labels become `.eyebrow`. |
| Header | Change `bg-background/80 backdrop-blur` to `bg-background/70 backdrop-blur-xl` so the grid shows through faintly. |
| Collapse button | Label becomes `.eyebrow`. |

### 12.2 `components/app/PageShell.tsx`

- `eyebrow` becomes `className="eyebrow text-muted-foreground"`.
- `<h1>` becomes `className="mt-1 font-display text-[26px] font-normal leading-[1.12] tracking-[-0.01em]"`.
  It is currently `text-xl font-semibold`. The serif at 26px / 400 carries the same optical weight,
  and it is the single strongest signal that the product and the landing are one design.
- Under the header block add a full-width hairline `<div className="mt-5 h-px bg-border" />`, and
  reduce the `tabs` and body top margins to `mt-4`. That rule is the product's echo of the
  wordmark's cap-height rule.

### 12.3 `components/app/primitives.tsx`

- `Surface`: keep `rounded-xl border border-border bg-card`, replace `shadow-xs` with
  `surface-shadow` from §8.2.7.
- `SectionHeading`: `<h2>` becomes `font-display text-[15px] font-normal`; the count pill becomes
  `.eyebrow` inside `rounded-full bg-muted px-2 py-0.5`.
- `StatTile`: label becomes `.eyebrow text-muted-foreground`. The value keeps `nums`.
- `Th`: becomes `.eyebrow text-muted-foreground`, replacing `text-xs uppercase tracking-wide`.
- `Td`: unchanged.

### 12.4 `components/app/AreaCard.tsx`

- Replace `rounded-xl` with `notch` (§3.4: this is an invitation).
- Hover: add `hover:border-sonder-rim/30 hover:bg-sonder-rim/[0.04]`; drop
  `hover:border-foreground/30`.
- Icon chip: `rounded-lg bg-muted` becomes `rounded-md bg-sonder-rim/10 text-sonder-rim` with
  `ring-1 ring-inset ring-sonder-rim/20`.
- Title becomes `font-display text-[16px] font-normal`.
- Add `active:translate-y-0` so the existing `-translate-y-0.5` hover reads as a physical press
  rather than sticking.

### 12.5 `EmptyState`, `Placeholder`, `RouteTabs`, `Breadcrumb`

- **EmptyState**: `rounded-xl` becomes `notch`; keep the dashed border; title becomes
  `font-display text-[15px]`.
- **Placeholder**: the "Arrives in Checkpoint N" strip becomes `.eyebrow`.
- **RouteTabs**: the active tab's `border-foreground` becomes `border-sonder-rim`; labels stay sans,
  because they are navigation, not micro-labels.
- **Breadcrumb**: keep the chevron but drop it to `text-muted-foreground/40`. Do **not** replace it
  with a middle dot; §4.1 rations those.

### 12.6 `components/shared/*`

| Component | Change |
|---|---|
| `StatusBadge` | `diagnosed` keeps `border-ok/30 bg-ok/10 text-ok`, which is now neon and correct (accent job 3). Verify `escalated` and `awaiting-review` stay clearly distinct against it at badge size; if `awaiting-review`'s info cyan reads too close, darken `--info` by 0.04 L and no more. Every state already carries an icon and a word, so colour is never the only channel. |
| `PosteriorBarSet` | The `bg-ok` leader fill is now neon, which is accent job 6. Change the non-diagnosis leader from `bg-foreground` to `bg-foreground/70` so the neon leader reads as a state change rather than a hue swap. Change the width transition to `duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`. Keep the tie stripes and the "tied" text badge: they are the non-colour channel. |
| `EvidenceStep` | When `isCurrent`, change the index chip from `border-foreground bg-foreground text-background` to `border-sonder-rim/50 bg-sonder-rim/12 text-sonder-rim`. The trace is the product's own growing line; the current step should read like a vine knot. |
| `MisconceptionCard` | `rounded-lg` becomes `notch` (it is an entry point in `/student/learn` and the review queue). The `selected` treatment becomes `border-sonder-rim/60 ring-sonder-rim/60`. The `code` chip becomes `.eyebrow`. |
| `OutcomeBanner` | The `diagnosed` variant's `border-l-ok` is now neon: keep. The `unsure` variant stays dashed info blue. **Do not make it green.** The entire point of this component is that the two states read differently in shape, colour and icon. |
| `MetricCard` | Label becomes `.eyebrow`. Value keeps `nums text-3xl`. Direction tones unchanged. |
| `VerificationTag` | `text-[11px] uppercase tracking-wide` becomes `.eyebrow`. |

### 12.7 `components/ui/*` (shadcn)

Touch as little as possible; these are generated files and regenerating them drops your edits. Only
two are worth changing:

- `button.tsx`: in the `cva` base string change `focus-visible:ring-ring/50` to
  `focus-visible:ring-ring/60`. Nothing else. `--ring` is already the accent, so focus rings become
  neon site-wide from the token change alone. **Add no neon button variant.**
- `card.tsx`: change `ring-1 ring-foreground/10` to `ring-1 ring-border`.

Everything else (`input`, `select`, `dialog`, `tabs`, `table`, `progress`, ...) inherits correctly
from the token layer. If a component still looks wrong after Phase 2, the fix is almost always a
token, not the component.

### 12.8 Route sweep, all 26 remaining screens

The baseline change for every screen: swap hand-rolled `rounded-xl border border-border bg-card`
blocks for `<Surface>`; swap hand-rolled uppercase micro-labels for `.eyebrow`; apply `notch` only
where the block is a link or an invitation; wrap every `<table>` in `<div className="overflow-x-auto">`.
The table below lists what is specific to each screen **beyond** that baseline.

| Route | Screen-specific work |
|---|---|
| `not-found.tsx` | Nothing beyond the baseline. Confirm the `home` fallback still resolves to `/` for a signed-out visitor; that is now the landing, which is correct. |
| `/student` | The two top links become `notch`. The "Follow-up check due" card keeps `border-info/30 bg-info/5`: it is a reminder, not a success, so it must not be neon. |
| `/student/start` | Selected subject and topic get the neon ring treatment from `MisconceptionCard`. |
| `/student/session/[scenario]/[mode]` (`SessionClient.tsx`) | The densest interaction in the app. Selected option: `border-sonder-rim/50 bg-sonder-rim/8`. Progress indicator: `bg-sonder-rim`. Add no motion beyond the existing transitions. |
| `/student/verify/[scenario]` (`VerifyClient.tsx`) | Same option treatment as the session. |
| `/student/remediation/[scenario]` | A reading surface, so density drops to 3 here: set the note body in `font-display` at 16.5px / 1.72 with `max-width: 68ch`. This is the product screen that should read like the landing's editorial copy. |
| `/student/learn` | Cards are `MisconceptionCard`, so the notch arrives automatically. The "Notes coming soon" disabled state becomes `opacity-55` with no accent. |
| `/student/learn/[subject]/[code]` | `ResourceFinder`'s scripted "Searching the web" state: replace any spinner with `.sonder-draw-rule` from §8.2.7. That is the design's own loading idiom and it already appears in the hero and the thesis band. |
| `/student/insights` | Verify every bar and chart reads `--chart-*` and no raw colour class. |
| `/student/consultant`, `/teacher/consultant` (`ChatConsultant.tsx`) | Assistant bubbles: `bg-muted` becomes `bg-sonder-rim/[0.06] ring-1 ring-inset ring-sonder-rim/15`. User bubbles stay `bg-secondary`. Suggestion chips become `.eyebrow` pills, no notch. |
| `/teacher` | `StatTile` row picks up `.eyebrow` labels. The "Needs your attention" cards become `<Surface>` plus `notch`, because they are links. |
| `/teacher/escalations` | Baseline only, plus the table wrapper. |
| `/teacher/session/[scenario]` + `EvidencePanel.tsx` + `Tabs.tsx` | The flagship screen. The `PosteriorBarSet` and `EvidenceStep` changes from §12.6 land here. Add nothing else; this screen's job is legibility. |
| `/teacher/session/[scenario]/review` (`ReviewPanel.tsx`) | Approve is the `default` (paper) button, Correct is `outline`, Reject is `destructive`. **Not neon.** |
| `/teacher/content-review` | Batch rows become `<Surface>`. |
| `/teacher/content-review/generation/[runId]` (`GenerationRunClient.tsx`) | The round-by-round player. Accepted candidates take the neon `ok` treatment; rejected go `muted-foreground`, dimmed, with no strikethrough. The round counter becomes `.eyebrow`. |
| `/teacher/content-review/agreement` | Agreement and disagreement indicators use `ok` and `warn`. Introduce no new hue. |
| `/teacher/students/[studentId]/insights` | As `/student/insights`. |
| `/parent`, `/parent/summary/[id]` (`SummaryView.tsx`) | The warmest screens in the app and another reading surface: body copy in `font-display` at 16px / 1.7, `max-width: 66ch`. The `ShieldCheck` approved marker becomes `text-sonder-rim`. Gated and locked rows stay muted. |
| `/admin` + `Tabs.tsx` | `StatTile` row plus `RouteTabs`. |
| `/admin/catalogue` | `MisconceptionCard` grid; the notch arrives automatically. |
| `/admin/coverage` | `thin-coverage` and `indistinguishable-pair` badges use `warn`; closed uses `ok`. |
| `/admin/performance` | `MetricCard` grid; verify the `--chart-*` ramp. |
| `/admin/provenance` | A log table. `Th` becomes `.eyebrow`; the `VerificationTag` column already carries the `ai` violet. **Remove any per-row double border** per §4.1: keep one divider direction only. |
| `/dev/components` | Extend the gallery with the new vocabulary: a `.notch` swatch, an `.eyebrow` swatch, the reveal stagger, `.sonder-draw-rule`, the full `--sonder-*` primitive swatch row, and both `BrandMark` sizes. This page is how the team will check that the system holds. |

### 12.9 What NOT to do in this phase

Do not put the 3D brain, the particle canvas or Lenis on any product route. Do not add scroll-linked
animation to product screens. Do not change any fixture, hook, test or route. Do not add a second
icon family. Do not introduce a neon button.

---

## 13. Phase 7 — Performance

### 13.1 Budget

| Item | Budget | How it is met |
|---|---|---|
| First-paint JS on `/` | under 120 kB gz | `three` and the scene land in the `HeroStage` dynamic chunk; `AetherFlow` is its own chunk; `VineScroller` ships in the page chunk because its copy must be server-rendered, and it pulls GSAP core at about 25 kB gz, which is accepted. |
| `brain.glb` | 2.5 MB, non-blocking | Fetched inside `BrainViewer`'s effect after the viewer module resolves. The grid, the wordmark and the lead copy are all on screen before it lands, and `showLoader={false}` means nothing flashes. |
| Idle GPU | about 0% | `viewer.ts` already renders on demand and pauses on `visibilitychange` and via `IntersectionObserver`. Do not "fix" that. |
| Particle frame cost | under 2 ms | The 220 cap (§7.3), the showcase pause (§7.3 step 7), and the visibility bail-out. |
| CLS on `/` | under 0.1 | The `HeroStage` dynamic `loading` fallback is exactly `h-[100dvh]`; the vine's SVG is absolutely positioned and cannot resize its own section. |
| LCP on `/` | under 2.5 s | The LCP element is the hero's `<h1>`, which is server-adjacent text in a system-fallback serif with `display: swap`. It is not the WebGL scene. |

### 13.2 Required additions

1. **Preload nothing.** Do not add `<link rel="preload">` for `brain.glb`; it would compete with the
   JS that decides whether to fetch it at all.
2. The viewer's existing low-power path (`max-width: 780px` or fewer than 6 logical cores gives DPR
   1.5 and no AA) stays as written.
3. `contain: layout style` on `.showcase-stage` and `.vine-scroller`, per §9.3.
4. **Do not** add `will-change` or `translateZ(0)` to `.vine-svg`. `vine.css` carries an explicit
   comment explaining why: that element is about 5000px tall and promoting it forces a roughly 30 MB
   composited layer. Respect it.
5. Run Lighthouse on `/` before declaring done. Target: Performance at least 75 on desktop
   throttling (the 2.5 MB model puts a hard ceiling here, do not chase 90), Accessibility at least
   95, Best Practices at least 95.

---

## 14. Phase 8 — Accessibility

| Requirement | Implementation |
|---|---|
| Skip link | First focusable element in `LandingNav`: "Skip to workspace entry" targeting `#enter`, visually hidden until focused. |
| Heading order | `/` has exactly one `<h1>` (the hero lead). Sections use `<h2>`; the vine's nodes are `<h2>`; showcase steps are `<h3>` inside an `<ol>`. |
| Landmarks | `<header role="banner">`, `<main>`, `<footer role="contentinfo">`, `<nav aria-label="Landing">`, and an `aria-label` on every otherwise-unlabelled `<section>`. |
| Canvas | `aria-hidden="true"`, already set in the source. |
| Brain | `<BrainViewer>` already carries an `aria-label` and a screen-reader hotspot list. Keep both even though the tool rail is hidden in the hero. |
| Decorative SVG | Every crosshair, rule and mark gets `aria-hidden="true" focusable="false"`. The wordmark itself is the exception and keeps `role="img" aria-label="Sonder"`. |
| Focus appearance | `outline: 2px solid var(--sonder-rim); outline-offset: 3px` on every interactive element. This satisfies the WCAG 2.2 focus-appearance guidance (at least a 2 CSS px perimeter at 3:1 state contrast). **Never `outline: none` without a replacement.** |
| Touch targets | Every landing CTA, role card and nav link is at least 44x44 px with at least 8px between neighbours. The role cards are far larger; check the nav links and the vine node links specifically. |
| Contrast, dark | `--sonder-muted #7AAB70` on `#121212` is about 7.0:1. `rgba(232,255,224,0.5)` on `#121212` is about 4.9:1 (footer notes, at 11.5px, which is the floor). `--sonder-rim` on `#121212` is about 14:1. `--sonder-hot` on the CTA fill is about 13:1. All pass AA. |
| Contrast, light | `--muted-foreground #5C6355` on `#FBFBF8` is about 6.4:1. `--ring #1E7A10` on white is about 4.9:1. Both pass AA. |
| Colour is never the only channel | `StatusBadge` (icon plus word), `PosteriorBarSet` (stripes plus a "tied" badge plus a caption), `OutcomeBanner` (different shape, border style and icon per state), `VerificationTag` (different icon per kind). Maintain this for anything new. |
| Reduced motion | §3.5. **Test by toggling the OS setting, not by editing CSS.** Under reduced motion the landing must be fully readable and fully navigable with zero pins, zero scrubs and no canvas. |
| Keyboard | Tab through `/` end to end: skip link, nav links, nav CTA, hero CTAs, vine node links, showcase deep link, role buttons, footer links. No trap, no focus lost off-screen, no element focusable that is visually hidden behind another. |
| `prefers-contrast` | Not required. Do not build it. |

---

## 15. Phase 9 — Tests

Only one new test file is required. The rest of this work is visual, and tests over it would be
theatre. But this one earns its place, because it guards two things a lesser implementer will get
wrong: placeholder copy shipping, and a vine link pointing at a route that does not exist.

`lib/landing/vine/content.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { VINE_NODES } from "./content";

/** Every route the landing is allowed to link to. Kept in sync with lib/nav.tsx by hand. */
const KNOWN_ROUTES = new Set([
  "/student", "/student/start", "/student/insights", "/student/learn",
  "/student/consultant", "/student/verify/B", "/student/remediation/B",
  "/teacher", "/teacher/session/B", "/teacher/escalations",
  "/teacher/content-review", "/teacher/consultant",
  "/parent", "/admin", "/admin/catalogue", "/admin/coverage",
  "/admin/performance", "/admin/provenance", "/dev/components",
]);

describe("VINE_NODES", () => {
  it("has six nodes with unique ids", () => {
    expect(VINE_NODES).toHaveLength(6);
    expect(new Set(VINE_NODES.map((n) => n.id)).size).toBe(6);
  });

  it("ships no placeholder copy", () => {
    for (const n of VINE_NODES) {
      const all = `${n.eyebrow} ${n.title} ${n.body} ${n.meta ?? ""}`.toLowerCase();
      expect(all).not.toContain("placeholder");
      expect(all).not.toContain("lorem");
    }
  });

  it("contains no em-dash or en-dash in any visible string", () => {
    for (const n of VINE_NODES) {
      const all = `${n.eyebrow}${n.title}${n.body}${n.meta ?? ""}`;
      expect(all).not.toMatch(/[\u2013\u2014]/);
    }
  });

  it("keeps bodies inside the length the layout was tuned for", () => {
    for (const n of VINE_NODES) {
      expect(n.body.length).toBeGreaterThanOrEqual(120);
      expect(n.body.length).toBeLessThanOrEqual(360);
    }
  });

  it("only links to routes that exist", () => {
    for (const n of VINE_NODES) {
      if (n.href) expect(KNOWN_ROUTES.has(n.href)).toBe(true);
    }
  });
});
```

---

# PART III — VERIFICATION AND CLOSE-OUT

## 16. Verification

### 16.1 Commands and the copy audit

```bash
npm run lint     # clean, with no rule silenced by an eslint-disable you added
npm run build    # clean
npm test         # the three existing suites plus the new one, all passing
```

Then the **copy self-audit**, which is a required step and not an intention. Re-read every visible
string in the build (headings, subheads, eyebrows, button labels, body copy, captions, alt text,
footer text, empty states, metadata) and flag anything that is grammatically broken, has an unclear
referent, or reads like a machine trying to sound thoughtful. Rewrite every flagged string; when in
doubt replace it with a plain functional sentence. Then grep the whole of `app/` and
`components/` for `\u2014` and `\u2013` and confirm zero hits outside code comments.

### 16.2 Manual matrix

Run at **390px, 860px, 1280px and 1920px**, in dark and light, with reduced motion off and on. Do
the 1280px / dark / motion-on pass in full and spot-check the rest against the items marked with a
dagger.

1. † `/` paints the charcoal grid within the first frame. **No white flash**, in either theme.
2. The wordmark draws its guides first, then its letters stroke by stroke, starting about 0.35 s in.
3. † The grid the canvas paints and the CSS `.sonder-grid` on the sections below **align**. No seam
   and no phase shift at the hero-to-thesis boundary.
4. Grid lines are **hairline-crisp on a HiDPI display** (D3). Zoom the browser to 200% and back;
   they stay one device pixel.
5. † Scrolling pins the hero for one viewport height. The wordmark exits before the brain arrives,
   the brain settles into its rest pose and starts auto-rotating, and the lead copy arrives during
   the dwell.
6. † Scrolling back up runs the whole hero in reverse cleanly, with no snap and no double-fire.
7. The vine's growing tip stays near the vertical centre of the viewport. Each card opens about
   120px before the tip reaches its branch, and the eyebrow, title, body and meta stagger is
   visible (D2).
8. Each vine node's meta line is a working link into the product.
9. † Below 860px the vine switches to the left rail, every card goes full width, and **nothing on
   the page scrolls horizontally**.
10. † The showcase sticks, advances through four steps, and the rail's neon fill tracks progress
    continuously. Each deep link navigates to the right route.
11. Every vignette renders **real fixture data** and looks like the real screen it represents.
    There is no fake browser chrome anywhere.
12. The four role buttons sign in and land on the right home route. Refreshing that route keeps you
    signed in.
13. † With reduced motion on: no pin, no scrub, no canvas, no Lenis. The brain is already in place.
    Every card, claim, link and button is visible and reachable.
14. Navigating `/` to `/student` and back twice leaves **no duplicated ScrollTriggers**
    (`ScrollTrigger.getAll().length` returns to its earlier value), **no leaked WebGL context**, and
    **no lingering Lenis** (the product's inner scroll must feel native, not inertial).
15. † The product screens read as the same design: serif page titles, mono eyebrows, the grid faintly
    present, and neon only on focus rings, the active nav rule, `ok` states, link hover, the brand
    mark and progress fills.
16. Tab order on `/` is complete and every focus ring is visible (§14).
17. On a mid-tier phone, scrolling the landing end to end stays smooth. If it does not, the first
    thing to check is the particle cap, then whether the showcase pause attribute is actually being
    set.
18. Lighthouse targets from §13.2 point 5 are met.

### 16.3 Regression guard

`git diff` against the first commit (the untouched copy of `FYP_POC_UI`) must show **zero changes**
under `fixtures/`, and zero changes to `lib/session.tsx`, `lib/roles.tsx`, `lib/nav.tsx`,
`lib/hypotheses.ts`, `lib/teacher-review.tsx`, `lib/local-flag.ts`, `lib/useRunPlayer.ts`,
`lib/useScenarioPlayer.ts`, `lib/assertGenerationRun.ts`, `lib/assertPosterior.ts`, and every
pre-existing `*.test.ts`. If any of those changed, you have changed behaviour and must revert it.

---

## 17. Pre-Flight Check

Adapted from `taste-skill` §14 and `ui-ux-pro-max`'s pre-delivery checklist, with the items that do
not apply to this build removed and the build-specific items added. **Every box must be honestly
ticked. If one cannot be, the work is not done.**

**Brief and system**

- [ ] Design read declared and dials set per surface (§1), not silently baselined
- [ ] Three-folder rule respected: `git status` in both source folders is clean and shows no edits
- [ ] One design system: shadcn/base-ui plus Tailwind v4 only, nothing mixed in
- [ ] One animation library: GSAP only, no Motion, no framer-motion anywhere in `package.json`
- [ ] One icon family: `lucide-react` only

**Copy**

- [ ] **Zero em-dashes and zero en-dashes** in any rendered string, verified by grep
- [ ] Copy self-audit performed; no broken grammar, no unclear referents, no machine-poetic filler
- [ ] No claim the PoC cannot support; the fixture-only limitation is stated in two places
- [ ] British spelling throughout, matching the existing product copy

**Layout and rhythm**

- [ ] Eyebrow count on the landing is **3 or fewer** outside the vine, verified by grep
- [ ] No section-number eyebrows and no generic step labels anywhere
- [ ] At least 4 distinct layout families across the 8 landing sections (there are 8)
- [ ] No split-header pattern: no section has a big left headline plus a small floating right paragraph
- [ ] Nav renders on one line at every width and is at most 64px tall
- [ ] Hero fits the viewport: headline at most 2 lines, 3 text elements total, CTAs visible without scrolling
- [ ] Hero top padding is not used to push content down the viewport
- [ ] No scroll cue, no version label, no locale or time strip, no decoration text strip

**Colour, shape, type**

- [ ] One accent used identically across every section; no second brand hue introduced
- [ ] Accent discipline held: no neon button in any product screen
- [ ] One radius system: notch for invitations, symmetric for data, no third case
- [ ] Page theme lock: the landing is dark throughout with no inverted section
- [ ] Serif is Newsreader, is justified in writing, and is neither Fraunces nor Instrument Serif
- [ ] Italic descenders in display type have clearance

**Interaction**

- [ ] Every CTA label fits on one line at desktop
- [ ] No two CTAs share an intent under different labels
- [ ] Every button and link passes WCAG AA contrast against its own background
- [ ] Active and hover states exist on every interactive element, with a physical press on active
- [ ] Loading state uses `.sonder-draw-rule`, not a spinner; empty and error states exist

**Motion**

- [ ] Motion claimed is motion shown: the pin, the scrub, the vine and the reveals all work
- [ ] Every animation can be justified in one sentence as hierarchy, storytelling, feedback or state
- [ ] At most one true GSAP pin on the page (there is one: the hero)
- [ ] No `window.addEventListener("scroll")` anywhere, verified by grep
- [ ] No overshoot easing on any informational UI
- [ ] Every `useEffect` that creates a GSAP context, observer, ticker or listener reverts it
- [ ] `prefers-reduced-motion` honoured everywhere, tested by toggling the OS setting

**Images and assets**

- [ ] No div-based fake screenshot anywhere; the showcase renders real components
- [ ] No fabricated logo wall, testimonial or customer count
- [ ] `app/icon.svg` in place, `app/favicon.ico` removed
- [ ] `app/opengraph-image.png` committed at 1200x630

**Product surface**

- [ ] Every table is wrapped in `overflow-x-auto`
- [ ] No long list uses both a top and a bottom border per row
- [ ] Numbers are tabular and mono wherever they carry meaning
- [ ] Both themes opened and checked; neither was shipped unseen

**Engineering**

- [ ] `npm run lint`, `npm run build`, `npm test` all clean
- [ ] No horizontal scroll at 390px anywhere in the build
- [ ] `min-h-[100dvh]`, never `h-screen`
- [ ] Core Web Vitals plausibly met (§13.1)
- [ ] Regression guard (§16.3) clean

---

## 18. Risks and close-out

### 18.1 The pin plus Lenis interaction is the fragile part

Symptom: sections overlap, the pin releases early, or the vine grows out of step with its cards.
Cause: ScrollTrigger measured a trigger before an earlier pin's spacer existed, or before web fonts
changed a card's height.

Fix, in this order: confirm the three `refreshPriority` values are `1` (hero), `0` (vine) and `-1`
(showcase); confirm every trigger sets `invalidateOnRefresh: true`; confirm the
`document.fonts.ready` refresh from §10.2 point 7 is actually firing. **Do not fix it by nudging the
hero or vine constants.** Those are derived values and moving them trades a visible bug for an
invisible one.

### 18.2 The 2.5 MB model on a slow connection

The hero is fully composed without it: the grid, the wordmark and the lead copy are all present, and
`showLoader={false}` is already passed so nothing flashes. If the model fails entirely, the canvas
stays blank and the rest of the page is unaffected; the source component fails soft by design. **Do
not add an error boundary that replaces the hero.** Add nothing.

### 18.3 Recording the divergence

Write `docs/PORT-NOTES.md` in `sonder-web` recording every deviation from
`brain-extract-anatomy`: the six defect fixes D1 to D6, the copy replacement, the lead-copy addition,
the `href` field on `VineNode`, the three font-variable overrides, and anything else you changed. If
either upstream folder ever moves on, that file is the diff to re-apply. Also record the four
skill overrides from §4.2 and their reasoning, so a future reviewer does not "fix" them back.

### 18.4 Licensing, unresolved, and the biggest non-technical risk

Carried forward from the design source's own README, unchanged in substance. Put an abbreviated form
in the landing footer (§10.9) and the full form in `sonder-web/README.md`.

- The upstream app the viewer was extracted from (`github.com/thebuggeddev/anatomy`) has **no
  LICENSE file and no `license` field**, which under default copyright means all rights reserved.
  The extraction was made for the owner's own final-year-project use. **Confirm reuse terms with the
  source author before any public or commercial deployment.**
- `brain.glb`'s material is named `tripo_material_...`, meaning the mesh was generated with **Tripo
  AI**. Check Tripo's asset-licensing terms for the account that produced it.
- `gsap` ships under GreenSock's standard no-charge licence, free for most uses. Read
  `https://gsap.com/licensing/` if this ever becomes commercial. `three`, `react`, `next`, `lenis`
  and `lucide` are MIT.

### 18.5 Scope discipline

Out of scope, and not to be built: everything in §4.4.

---

## 19. Execution checklist

Tick in order. Do not start one before the previous is verified.

**Phase 0, the third folder**
- [ ] 0.1 `cp -r FYP_POC_UI sonder-web`, then `rm -rf sonder-web/.git` and any build output
- [ ] 0.2 `git init` in `sonder-web`; rename the package; commit the untouched copy as commit 1
- [ ] 0.3 `cp ../SONDER-WEB-IMPLEMENTATION-PLAN.md docs/IMPLEMENTATION-PLAN.md`; write the new `README.md`
- [ ] 0.4 `npm install`, `npm run build`, `npm test` all clean on the untouched copy
- [ ] 0.5 `npm i three@0.185.1 gsap@3.15.0 lenis@1.3.26` and `npm i -D @types/three@0.185.4`
- [ ] 0.6 `public/models/brain.glb` copied, exactly 2,570,592 bytes
- [ ] 0.7 `git status` in **both** source folders is clean

**Phase 1, the engine**
- [ ] 1.1 `lib/useIsomorphicLayoutEffect.ts` created
- [ ] 1.2 `lib/landing/` tree copied with its sibling structure intact; zero import edits inside it
- [ ] 1.3 The three CSS files copied to `components/landing/styles/`
- [ ] 1.4 `AetherFlow.tsx` ported, plus D3, D4, reduced-motion and the showcase pause
- [ ] 1.5 `BrainViewer.tsx` ported; the dynamic `import()` is still dynamic
- [ ] 1.6 `SonderWordmark.tsx` ported, plus D1 and D5
- [ ] 1.7 `VineScroller.tsx` ported, plus D2, D5 and the `href` link
- [ ] 1.8 `HeroStage.tsx` ported, plus D5, D6, the lead copy, and the `hero-stage.css` addendum
- [ ] 1.9 Build clean; grep confirms no stale `@/` imports

**Phase 2, tokens**
- [ ] 2.1 `app/layout.tsx`: Newsreader added, metadata rewritten
- [ ] 2.2 `app/globals.css`: §8.2.1 through §8.2.8 in order
- [ ] 2.3 `app/providers.tsx`: `defaultTheme="dark"`
- [ ] 2.4 Build clean; `/student` renders correctly in both themes

**Phase 3, shared**
- [ ] 3.1 `components/app/BrandMark.tsx`
- [ ] 3.2 `components/landing/useReveal.ts`
- [ ] 3.3 `components/landing/styles/landing.css` skeleton

**Phase 4, the landing**
- [ ] 4.1 `lib/landing/vine/content.ts` real copy, plus §15's test, passing
- [ ] 4.2 `LandingNav.tsx` with the IntersectionObserver sentinel and the skip link
- [ ] 4.3 `sections/ThesisBand.tsx`
- [ ] 4.4 `sections/vignettes/*.tsx`, four live vignettes from real fixtures
- [ ] 4.5 `sections/ShowcaseStage.tsx`
- [ ] 4.6 `sections/MechanismStrip.tsx`
- [ ] 4.7 `sections/GuaranteeBand.tsx`
- [ ] 4.8 `sections/EnterSection.tsx`
- [ ] 4.9 `sections/LandingFooter.tsx`
- [ ] 4.10 `Landing.tsx` and `app/page.tsx`
- [ ] 4.11 `app/icon.svg` added, `app/favicon.ico` removed, `app/opengraph-image.png` committed
- [ ] 4.12 The §10 walk-through renders correctly end to end

**Phase 5, the product**
- [ ] 5.1 §12.1 through §12.7 component sweep
- [ ] 5.2 §12.8 route sweep, all 26 rows
- [ ] 5.3 `/dev/components` gallery extended

**Phase 6, close-out**
- [ ] 6.1 §13.2 performance additions and a Lighthouse run
- [ ] 6.2 §14 accessibility pass, tested with the OS reduced-motion setting toggled
- [ ] 6.3 §16.1 commands clean, plus the copy audit and the em-dash grep
- [ ] 6.4 §16.2 manual matrix, all 18 items
- [ ] 6.5 §16.3 regression guard clean
- [ ] 6.6 §17 Pre-Flight Check, every box
- [ ] 6.7 `docs/PORT-NOTES.md` written; `README.md` carries the licensing notes

---

## Appendix A — File inventory for `sonder-web`

**New files (37):**

```
docs/IMPLEMENTATION-PLAN.md
docs/PORT-NOTES.md
lib/useIsomorphicLayoutEffect.ts
lib/landing/smooth-scroll.ts
lib/landing/anatomy/brain-data.ts
lib/landing/anatomy/neuron-paths.ts
lib/landing/three/{viewer,loaders,hotspots,dispose,neuron-activity,teal-material,teal-theme}.ts
lib/landing/hero/{hero-theme,wordmark-glyphs}.ts
lib/landing/vine/{geometry,content,vine-theme}.ts
lib/landing/vine/content.test.ts
components/app/BrandMark.tsx
components/landing/{Landing,LandingNav,AetherFlow,BrainViewer,HeroStage,SonderWordmark,VineScroller}.tsx
components/landing/useReveal.ts
components/landing/sections/{ThesisBand,ShowcaseStage,MechanismStrip,GuaranteeBand,EnterSection,LandingFooter}.tsx
components/landing/sections/vignettes/{Student,Teacher,Parent,Admin}Vignette.tsx
components/landing/styles/{brain-viewer,hero-stage,vine,landing}.css
public/models/brain.glb
app/icon.svg
app/opengraph-image.png
```

**Modified:** `package.json`, `README.md`, `app/layout.tsx`, `app/globals.css`,
`app/providers.tsx`, `app/page.tsx` (replaced),
`components/app/{AppShell,PageShell,primitives,AreaCard,EmptyState,Placeholder,RouteTabs,Breadcrumb,ChatConsultant}.tsx`,
`components/shared/*` (all seven), `components/ui/{button,card}.tsx`, and every `app/**/page.tsx`
plus its client components (styling only).

**Deleted:** `app/favicon.ico`.

**Must not change:** everything under `fixtures/`, the ten `lib/*.ts(x)` product modules listed in
§16.3, every pre-existing `*.test.ts`, `next.config.ts` (unless §6.7 forces it),
`vitest.config.mts`, `eslint.config.mjs`, `components.json`, and **both source folders in their
entirety**.

## Appendix B — Import rewrite table

| In `brain-extract-anatomy` | In `sonder-web` |
|---|---|
| `@/lib/three/*` | `@/lib/landing/three/*` |
| `@/lib/anatomy/*` | `@/lib/landing/anatomy/*` |
| `@/lib/hero/*` | `@/lib/landing/hero/*` |
| `@/lib/vine/*` | `@/lib/landing/vine/*` |
| `@/lib/smooth-scroll` | `@/lib/landing/smooth-scroll` |
| `@/lib/utils` | `@/lib/utils` (**unchanged**, an identical `cn` already exists there) |
| `@/BrainViewer` | `./BrainViewer` |
| `@/components/SonderWordmark` | `./SonderWordmark` |
| `./lib/three/viewer` (inside `BrainViewer.tsx`) | `@/lib/landing/three/viewer` |
| `./lib/anatomy/brain-data` | `@/lib/landing/anatomy/brain-data` |
| `@/vine.css` | `./styles/vine.css` |
| `@/hero-stage.css` | `./styles/hero-stage.css` |
| `./brain-viewer.css` | `./styles/brain-viewer.css` |
| any relative import **inside** `lib/landing/` | **unchanged** |

## Appendix C — Token quick reference

| Purpose | Landing uses | Product uses |
|---|---|---|
| Page ground | `var(--sonder-ink)` | `bg-background` |
| Card ground | `var(--sonder-glass)` plus blur | `bg-card` |
| Primary text | `var(--sonder-paper)` | `text-foreground` |
| Secondary text | `rgba(232,255,224,0.66)` to `0.72` | `text-muted-foreground` |
| Hairline | `var(--sonder-line)` / `var(--sonder-line-quiet)` | `border-border` |
| Accent | `var(--sonder-rim)`, freely | `text-sonder-rim`, six jobs only (§3.3) |
| Button | `.sonder-cta`, neon outline | `<Button>` default, paper fill |
| Corner | `.notch` on plates and role cards | `.notch` on invitations only |
| Ease | `var(--ease-sonder)` | `var(--ease-sonder)` |
| Display font | `var(--font-display)` | `var(--font-display)` |
| Micro font | `.eyebrow` | `.eyebrow` |
| Loading | `.sonder-draw-rule` | `.sonder-draw-rule` |
