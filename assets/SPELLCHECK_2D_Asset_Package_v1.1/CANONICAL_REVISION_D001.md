# Canonical Revision D-001 — Context-Safe Exploration and Casting

Status: accepted for the next prototype  
Effective package: SPELLCHECK 2D Asset Package v1.1

## Decision

Typing remains the primary combat and magical action, but it is no longer the only player-facing input.

SPELLCHECK now uses two mutually exclusive player contexts:

- **Exploration:** WASD or arrow keys move the Waybinder; Enter or Space interacts; the camera follows automatically and may support optional mouse orbit.
- **Casting:** movement pauses; printable keys, Space, Backspace, and Enter exclusively operate the typing spell system.

The system—not the player—transitions between these contexts. There is no combat-stance button and no click-to-cast.

## Supersession rule

When an older SPELLCHECK document conflicts with this revision, this revision wins specifically on:

- “Typing is the only control language.”
- “No WASD or direct character movement.”
- “The Scriptorium is the continuously controlled travel platform.”
- “Exploration and casting must be one uninterrupted input mode.”

Older documents remain canonical for spell grammar, recommendations, cooldown behavior, prompt commitment, deterministic resolution, bard personality, visual language, scope discipline, and world reactivity unless separately revised.

## Replacement invariant

> Explore through movement. Act through language. The input contexts never compete.

This means:

1. A printable key can never move the player and enter the typing buffer in the same state.
2. Casting cannot capture printable keys until player velocity reaches zero and the camera settles.
3. Exploration cannot resume until the typing buffer releases keyboard capture.
4. The transition is automatic and visibly acknowledged through camera, lectern, prompt, and restrained ground-ring behavior.
5. Keyboard-only completion remains supported across exploration interaction, casting, menus, and pause flows.

## World consequence

- The Waybinder is controlled on foot.
- The bard follows as a floating companion.
- The Scriptorium docks at waymarks and functions as save hub, spellbook station, settings location, and transport between unlocked regions.
- Regions are dense open zones connected through illustrated Scriptorium travel sequences, not one enormous seamless map.
- The field lectern and grimoire deploy beside the player when casting starts.
- The first proof is one Gilded Margin zone, not multiple biomes.

## Prototype gate

Do not expand the region count until one prototype proves this uninterrupted sequence:

> walk → notice → interact → encounter → settle → type → world consequence → bard response → walk again

The transition succeeds only if it feels like one adventure rather than two unrelated minigames.

## Scope guardrail

Free walking does not authorize sprinting, jumping, dodging, stamina, melee combat, loot inventory, manual targeting, vehicle steering, or a required mouse camera. Each would need a separate outcome-based justification before entering scope.

