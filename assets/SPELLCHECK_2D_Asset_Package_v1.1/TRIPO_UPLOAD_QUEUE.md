# Tripo Upload Queue

## First pilot — prove the pipeline

1. `02_enemies/02_cooldown_golem.png`
   - Tests non-human topology, modular joints, halo plates, hit animation, and a 1K texture budget.
2. `02_enemies/03_misfire_goose.png`
   - Tests a recognizable organic silhouette, simple rigging, and whether the tiny charm should become a separate prop.
3. `01_core/04_traveling_scriptorium.png`
   - Tests a complex prop shell, pivot/scale, material coherence, and separation of mechanical parts.

Do not start with the hero. The Typomancer adds hands, coat tails, face, clothing deformation, attachments, and typing-specific performance at once.

## Second wave — playable identity floor

1. `01_core/01_typomancer_neutral.png` — neutral rig candidate; attach the grimoire separately.
2. `01_core/03_bard_familiar.png` — floating character; use procedural hover, gaze, squash, and instrument motion.
3. `02_enemies/01_inkblot_imp.png` — simple base mesh plus runtime ink shader/particles.
4. `03_world/01_ruined_archive_gateway.png` — background landmark shell; collision can remain primitive.
5. `04_spell_reactions/06_ice_crystal_ridge.png` and `08_earth_raised_barrier.png` — persistent world-memory props.

## Exploration-context extension

1. `06_exploration/03_field_casting_lectern.png` — direct candidate; keep the grimoire separate and author the deploy/retract motion.
2. `06_exploration/01_margin_archivist_npc.png` — humanoid rig candidate with idle, talk, and one pointing gesture.
3. `06_exploration/04_wordlock_shrine.png` — shell candidate; blank tile faces and runtime text are non-negotiable.
4. `06_exploration/02_scriptorium_waymark_dock.png` — shell candidate; rebuild the walkable platform and docking transforms precisely.

Do not use one-click generation for `05_open_zone_ground_module.png` or `06_terrace_ramp_module.png` if exact collision and snap dimensions matter. Reconstruct their simple forms deterministically and use the images as material/silhouette direction. `07_casting_context_ring_vfx_reference.png` is procedural VFX direction only.

## Third wave — stretch identity

- Redaction Hound.
- Homophone Harpy.
- Syntax Wyrm, preferably segmented into head, reusable body section, and tail.
- Prompt anchor shell, with all actual letters rendered at runtime.

## Do not upload as one-click runtime assets

- The three north-star sheets.
- The four dark-background VFX references.
- The material board.
- The top-down map.
- Whole route kit unless it is only being used to obtain a visual shell. Exact route dimensions, snap points, collision, and camera-safe widths should be deterministic.
- The ink surface as static opaque geometry; use a simple bank mesh plus a runtime liquid material.

## Per-asset generation settings

- Use image-to-3D for one isolated subject at a time.
- Default export: GLB.
- Start at 2K for Typomancer/Scriptorium and 1K for everything smaller.
- Prefer PBR when available.
- Retopologize to the target in `ASSET_MANIFEST.json` rather than accepting the generator's default density.
- Use a neutral pose for rigged characters.
- Save/download accepted files immediately into project-owned storage.

## Intake gate after every download

1. Inspect front, rear, both sides, top, and underside.
2. Check for holes, fused limbs, inflated bounds, inverted normals, stray geometry, and fake transparency.
3. Inventory materials, maps, dimensions, animation clips, bones, and triangle count.
4. Set scale in meters and a center-bottom pivot.
5. Separate any part that must rotate, recoil, hover, type, speak, or display cooldown state.
6. Replace mesh collision with a box, capsule, or authored compound proxy.
7. Test the GLB in the actual R3F camera at gameplay distance.
8. Record source image, generator/model version, date, settings, rights status, and final filename.
