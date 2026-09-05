# sonder-web

Merged Sonder product: the `brain-extract-anatomy` landing design ported into the `FYP_POC_UI` Next.js assessment PoC.

## Provenance

| Upstream | Role | Notes |
|---|---|---|
| `../FYP_POC_UI` | Product source (27 screens, fixtures, tests) | Copied wholesale as the starting tree. Read-only after merge. |
| `../brain-extract-anatomy` | Design source (hero, vine, WebGL brain) | Files copied into `lib/landing/` and `components/landing/`. Read-only after merge. |

Both upstream folders are separate git repositories. This folder is the only writable deliverable. See `docs/IMPLEMENTATION-PLAN.md` for the full merge plan.

## Run

```bash
npm install
npm run dev
```

```bash
npm run build
npm test
npm run lint
```

## Stack

Next.js 16 App Router, React 19, Tailwind v4, shadcn/base-ui, three.js, GSAP + ScrollTrigger, Lenis (landing route only).

## Licensing

The 3D viewer and `public/models/brain.glb` originate from an Anatomy Atelier extraction. The upstream anatomy repository ships without a LICENSE file, and the GLB material names suggest Tripo AI generation. Reuse terms must be confirmed with the source author before any public or commercial deployment. The landing footer discloses the Tripo provenance of the specimen model.
