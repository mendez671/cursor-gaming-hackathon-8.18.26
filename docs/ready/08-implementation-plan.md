# Implementation plan

**Outcome 1 is the live app track.** The Vite + React HUD in `src/` is already being built by a sibling. This document sequences work **on top of that tree**. It does not authorize rewriting `src/`, `index.html`, `package.json`, `vite.config.*`, or `tsconfig.*`.

---

## Live tree (do not replace)

```
package.json          vite ^7, react ^19, typescript ~5.9
index.html
vite.config.ts
tsconfig.json
src/main.tsx
src/App.tsx           HUD + input + 480ms resolve
src/index.css         lectern / well tokens
src/game/machine.ts   READY | TYPING | RESOLVING | AFTERMATH
src/vite-env.d.ts
```

## Extend (Outcome 2+)

```
src/game/recommend.ts     pure ranker (ledger §G)
src/game/resolve.ts       hits, goose table, CDs
src/game/events.ts        append-only enum
src/game/bard.ts          selector
src/game/tick.ts          TTI / CD via TICK
src/data/                 import or one-time copy of docs/ready/data/*.json
```

When a well canvas exists: `src/well/WellCanvas.tsx` behind the HUD, `pointer-events: none`, kill switch `?flat=1`. Boxes are enough.

---

## Package policy

**Already locked by Outcome 1:** `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `typescript`.

**Add only when the well slice starts:** `three`, `@react-three/fiber`.

**Do not install:** zustand (reducer exists), howler, rapier, `@react-three/drei` KeyboardControls, postprocessing, react-router, LLM SDKs.

---

## Outcome sequence

| Outcome | Observable | Owner |
|---|---|---|
| **1 Playable typing causality** | Cold load, autofocus, `ignis ventus`, exact auto-cast once, well reacts, keyboard restart | **Live app track (sibling)** |
| **2 Adaptive combat** | Six-wave book, CD changes wave-2 prompt, reason chip, 3-hit lose | Next; consume `data/encounter.json` + `spells.json` |
| **3 Stable pressure** | Lock holds; TTI; no softlock; next rec after resolve | Same machine + `TICK` |
| **4 Entertaining failure** | `ignis ventis` → goose + bard line | Resolver + bard JSON |
| **5 Relationship** | First vs repeat typo; win/lose lines | Bard memory slice |
| **6 Breadth** | Stay at 10 spells unless play evidence says otherwise | Content, not a new app |
| **7 Demo complete** | §26 path 10/10, offline | Rehearsal |

Do not start Fiber until Outcome 1 is observed (focus + one cast + restart). Do not start a second scaffold.

---

## Milestone map (product)

- **A** = Outcome 1 (+ restart). Presentable if a stranger can type.
- **B** = Outcomes 2–4 authored path (cast, rerank, goose, bard).
- **C** = clips / optional well. A+B still work with `?flat=1` and sound blocked.

---

## Integration rules

1. Extend `reduce`; do not wrap it in another store.
2. Lift `castsThisRun > 0` auto-cast cap when waves exist.
3. Keep `RESOLVE_MS = 480`.
4. Import JSON; do not re-author the 10 spells in component files.
5. Narration is a subscriber to events, never an `await` in `reduce`.
6. If this ledger and a live Outcome 1 detail collide, **keep the live input/phase names** and record the field add — see ledger §H.

---

## What “done” is not

A folder of docs, a lockfile, or a well mesh. Done is a stranger typing a phrase and seeing magic (`02-product.md` Milestone A).
