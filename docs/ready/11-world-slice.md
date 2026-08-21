# World slice — Lexicon Frontier

O-009. The player rides a four-legged traveling Scriptorium along one golden-hour route toward a cliff-archive. Typing is the only player-facing action. The world is meshes in R3F, not a keyframe pasted on a quad.

## Thesis

The world presents a phrase; the player types it; the route, threat silhouette, terrain scars, runestones, and bard body answer. Auto-travel continues in READY. TYPING damps the camera. A clean cast scars the path and drives the Scriptorium forward.

## Embodiment (what the browser shows)

- **Scriptorium:** wood + brass wagon on four articulated legs, rear bookshelves, chimney smoke, navy/bestiary banner, elemental diamond runestones on the roof.
- **Mage:** navy coat, dark hair, at a front podium with an open paper book. Grimoire-board (book + two key rows) on the hip. Character-sheet texture on the cover.
- **Bard:** quill-lute sprite (round head, cyan eyes, feather, lute body) on a small lectern at the aft-starboard rail. Not a cube.
- **Threats (bestiary silhouettes, not a generic cube):**
  - fleshy / fire → Ink Sprite (ink blob + purple comma-eye)
  - armored → Runic Golem (block stack, hourglass chest, floating plates)
  - charging / approaching → Parchment Hound
  - swarm → smaller ink sprites
  - elite → scroll wyrm
  - `disappointed_goose` → The Honk (white goose + purple pendant)
- **Route:** stone pavers, green grass, blue flower dots, roadside lanterns, trees, floating isles.
- **Ice / corruption patch** to the right of the road with cyan crystals.
- **Rune monoliths** A, I, F, X along the path.
- **Archive landmark:** stacked terrace boxes and dark arches on a distant cliff.

## Spatial slice

One biome (storybook meadow + sandstone road). One route. Progress is `threatIndex` plus cast surge. `?flat=1` keeps the CSS lectern.

## Camera

Three-quarter, behind-right, elevated. Damped to a held pose while `phase === "TYPING"`. No OrbitControls, no pointer-lock, no WASD. Reduced motion freezes walk, bob, and scroll.

## Diegetic info

Authoritative Latin phrase stays DOM on the cream HUD band (F-016). A glowing cyan/violet torus **rune arc** sits in world space in front of the carriage. It is decoration; it does not replace the readable prompt. Cooldown objects are the roof diamonds; the DOM strip is a whisper.

## Reaction matrix

| Event | World |
|---|---|
| READY | Slow route drift. Threat far→near on TTI. Legs walk. |
| TYPING / lock | Camera hold. Arc pulse settles. Walk freezes. |
| Clean cast | Threat flattens. Family scar on nearby ground (ember scorch / frost sheet / wind streak). Route surges. Used runestone sinks and dims. |
| Goose | Honk walks into the encounter space from the right. |
| Win | Route toward the archive. |
| Lose | Travel stops. Threat occupies the near path. |

## Asset strategy

Shared primitives + stylized assemblies in `src/world/cast.tsx`. Concept PNGs in `public/ref/` are **detail maps** (grimoire cover, banner, wagon plaque, paper) — not a background. No GLTF, drei Text/Html, HDRI, Rapier, or postprocessing.

## Acceptance signals

- Cold load: `#caster` focused. One interactive control. Canvas `pointer-events: none`.
- Phrase readable while the path moves.
- Prompt does not change after the first committed glyph (D-004).
- Exact cast changes the threat and leaves a terrain scar.
- Used spell is a dim roof diamond, not a clickable bar.
- Honk is a mesh in the encounter, not a click target.
- No `onClick` / `onPointerDown` on meshes that casts, targets, or selects.
- `?flat=1` still plays the identity loop.

Click-to-cast is **forbidden**, not deferred.
