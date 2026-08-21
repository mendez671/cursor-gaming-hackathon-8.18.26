# SPELLCHECK 2D Asset Package v1

## Package thesis

This is a vertical-slice source-art package for **SPELLCHECK**, a one-mode typing game in a continuous stylized 3D world.

> The world presents a phrase; the player types; the world responds.

The package converts the original combined concept sheets into isolated, inspectable assets. Each asset has a defined role in the game and a recommended implementation path. The images establish identity and form; they do not transfer gameplay responsibility to generated meshes.

## Index

1. `00_north_stars/` — original visual-direction images; never upload whole sheets as a single 3D subject.
2. `01_core/` — hero, separate grimoire, bard, Scriptorium, and diegetic prompt anchor.
3. `02_enemies/` — six isolated corrupted-language enemies.
4. `03_world/` — Archive destination and modular route/world references.
5. `04_spell_reactions/` — four procedural VFX references and four persistent reaction objects.
6. `05_direction/` — material grammar and top-down world layout.
7. `ASSET_MANIFEST.json` — machine-readable conversion strategy, budgets, scale, priority, and cautions.
8. `WORLD_LAYOUT_SPEC.json` — machine-readable semantic interpretation of the top-down layout.
9. `TRIPO_UPLOAD_QUEUE.md` — recommended generation order and intake checklist.

## Inventory

| Group | New images | Primary use |
|---|---:|---|
| Core | 5 | Player identity and recurring interaction anchors |
| Enemies | 6 | Threat silhouettes and comedy payoff |
| World | 7 | Landmark and modular world construction |
| Spell/reactions | 8 | Procedural effect language plus persistent world memory |
| Direction | 2 | Material and spatial coherence |
| North stars | 3 | Upstream visual reference only |

The package contains **28 newly generated images** and **3 preserved north-star images**.

## Locked visual language

- Storybook arcane frontier; clever and theatrical, not grimdark.
- Parchment stone, black-violet ink, carved oak, aged copper, indigo cloth, and cyan-teal runelight.
- Clean gameplay silhouettes before surface detail.
- Abstract glyph motifs may appear as ornament, but runtime phrases remain separate R3F text.
- No asset implies mouse aiming, click selection, inventory navigation, or a second exploration mode.

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
- Prompt tiles stay visually blank. Runtime text is rendered separately and remains stable after the first committed character.
- VFX reference images define color and motion grammar, not sprite sheets ready for direct shipping.
- The Scriptorium image is a shell. Legs, player stand point, lectern, bard perch, cooldown mounts, prompt anchor, and collider need explicit transforms.
- Route modules may not share exact generated dimensions. Normalize or rebuild them to a common snap grid before assembly.

## Acceptance rule

No generated asset is accepted because one render looks good. Inspect front, back, sides, and underside; confirm geometry, materials, scale, pivot, skeleton where needed, file size, runtime load, and provenance. The manifest marks every new image `generated_unvalidated` until that process is complete.

