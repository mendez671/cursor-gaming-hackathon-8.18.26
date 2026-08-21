# SPELLCHECK 2D Asset Package v1.1

## Package thesis

This is a vertical-slice source-art package for **SPELLCHECK**, an exploration adventure whose meaningful magical actions are performed through typing.

> Explore through movement. Act through language. The input contexts never compete.

The package converts the original combined concept sheets into isolated, inspectable assets. Each asset has a defined role in the game and a recommended implementation path. The images establish identity and form; they do not transfer gameplay responsibility to generated meshes.

## Index

1. `00_north_stars/` — original visual-direction images; never upload whole sheets as a single 3D subject.
2. `01_core/` — hero, separate grimoire, bard, Scriptorium, and diegetic prompt anchor.
3. `02_enemies/` — six isolated corrupted-language enemies.
4. `03_world/` — Archive destination and modular route/world references.
5. `04_spell_reactions/` — four procedural VFX references and four persistent reaction objects.
6. `05_direction/` — material grammar and top-down world layout.
7. `06_exploration/` — NPC, waymark dock, deployable lectern, Wordlock Shrine, open terrain, ramp, and casting-transition reference.
8. `ASSET_MANIFEST.json` — machine-readable conversion strategy, budgets, scale, priority, and cautions.
9. `WORLD_LAYOUT_SPEC.json` — machine-readable semantic interpretation of the top-down layout.
10. `OPEN_ZONE_SPEC.json` — exploration/casting input contract and Gilded Margin prototype definition.
11. `CANONICAL_REVISION_D001.md` — explicit supersession notice for older typing-only design language.
12. `TRIPO_UPLOAD_QUEUE.md` — recommended generation order and intake checklist.

## Inventory

| Group | New images | Primary use |
|---|---:|---|
| Core | 5 | Player identity and recurring interaction anchors |
| Enemies | 6 | Threat silhouettes and comedy payoff |
| World | 7 | Landmark and modular world construction |
| Spell/reactions | 8 | Procedural effect language plus persistent world memory |
| Direction | 2 | Material and spatial coherence |
| Exploration extension | 7 | Free-walking discovery and automatic transition into casting |
| North stars | 3 | Upstream visual reference only |

The package contains **35 newly generated images** and **3 preserved north-star images**.

## Context-safe control model

| Context | Keyboard ownership | World behavior |
|---|---|---|
| Exploration | WASD/arrows move; Enter or Space interacts | Follow camera, bard companionship, discovery, NPCs, side paths |
| Transition to casting | No player input for a brief bounded beat | Movement reaches zero, camera settles, field lectern deploys, prompt becomes active |
| Casting | Letters, Space, Backspace, Enter exclusively cast | Movement is paused; recommendations, cooldowns, deterministic spells, and bard responses remain locked |
| Resolution | Input temporarily buffered or ignored | Spell consequence completes and the threat/world visibly responds |
| Return to exploration | Movement resumes only after typing capture releases | Prompt retracts, lectern folds, camera returns, exploration controls reactivate |

No manual combat-stance button and no click-to-cast are introduced. Sprinting, jumping, dodging, stamina, and action-combat inputs remain out of scope.

## Locked visual language

- Storybook arcane frontier; clever and theatrical, not grimdark.
- Parchment stone, black-violet ink, carved oak, aged copper, indigo cloth, and cyan-teal runelight.
- Clean gameplay silhouettes before surface detail.
- Abstract glyph motifs may appear as ornament, but runtime phrases remain separate R3F text.
- Exploration assets support readable walking and interaction without implying mouse aiming, click-to-cast, sprinting, jumping, dodging, or action combat.

## How to interpret conversion strategies

| Strategy | Meaning |
|---|---|
| `tripo_direct_candidate` | Good first-pass image-to-3D subject; still requires normal intake and optimization. |
| `tripo_shell_then_rebuild` | Generate a visual shell, then separate or rebuild gameplay-critical pieces. |
| `procedural_or_modular_rebuild` | Use the image as exact art direction; build simple deterministic geometry in Blender/R3F or from a modular kit. |
| `procedural_vfx_reference` | Do not make a static 3D model; reproduce the shape language with particles, ribbons, decals, shaders, and timed light. |
| `direction_only` | Planning or material reference; never treat the entire image as one runtime mesh. |

## Default export policy

- Runtime default: **GLB**.
- Typomancer and Scriptorium: start at **2K textures**.
- Bard, enemies, persistent spell props: start at **1K**.
- Repeated route and dressing pieces: **256–1K**, measured by screen footprint.
- Keep 4K only as an archival source when a hero asset visibly benefits; do not make 4K the browser default.
- FBX is an optional editable/rigging interchange master. GLB remains the R3F delivery format.

## Non-negotiable runtime separation

- Meshes present identity; deterministic code owns typing, recommendations, cooldowns, encounters, timing, collision, and bard selection.
- A single explicit state machine owns input context. WASD cannot move the player once casting captures printable keys, and the prompt cannot capture keys after exploration resumes.
- Prompt tiles stay visually blank. Runtime text is rendered separately and remains stable after the first committed character.
- VFX reference images define color and motion grammar, not sprite sheets ready for direct shipping.
- The Scriptorium is a stationary regional hub and transport object at waymarks. Its legs, docking points, player interaction point, bard perch, cooldown mounts, and collider need explicit transforms.
- The separate field lectern and grimoire deploy beside the player for casting; they are not permanently fused to the Waybinder or Scriptorium.
- Route modules may not share exact generated dimensions. Normalize or rebuild them to a common snap grid before assembly.

## Acceptance rule

No generated asset is accepted because one render looks good. Inspect front, back, sides, and underside; confirm geometry, materials, scale, pivot, skeleton where needed, file size, runtime load, and provenance. The manifest marks every new image `generated_unvalidated` until that process is complete.
