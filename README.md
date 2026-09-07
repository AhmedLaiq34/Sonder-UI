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

Carried forward from the design source. Abbreviated disclosure also appears in the landing footer.

- The upstream app the viewer was extracted from (`github.com/thebuggeddev/anatomy`) has **no LICENSE file and no `license` field**, which under default copyright means all rights reserved. The extraction was made for this final-year-project use. **Confirm reuse terms with the source author before any public or commercial deployment.**
- `brain.glb`'s material is named `tripo_material_...`, meaning the mesh was generated with **Tripo AI**. Check Tripo's asset-licensing terms for the account that produced it.
- `gsap` ships under GreenSock's standard no-charge licence, free for most uses. Read https://gsap.com/licensing/ if this ever becomes commercial. `three`, `react`, `next`, `lenis` and `lucide` are MIT.

## Port notes

Every intentional divergence from `brain-extract-anatomy` is listed in `docs/PORT-NOTES.md`.
