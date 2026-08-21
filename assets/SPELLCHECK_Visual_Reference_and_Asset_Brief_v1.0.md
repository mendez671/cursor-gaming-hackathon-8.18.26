---
document_id: spellcheck-visual-reference-asset-brief-v1
version: 1.0
purpose: agent-facing visual direction and vertical-slice asset scope
target_medium: React Three Fiber
player_facing_modes: 1
companion_document: SPELLCHECK_R3F_Continuous_World_Design_Prompt_v1.0.md
---

# SPELLCHECK — Visual Reference and Asset Brief

## Index

1. Visual thesis
2. Reference images
3. What each reference locks
4. Vertical-slice asset manifest
5. Enemy roles and visual grammar
6. Spell and world-reaction assets
7. Animation and feedback minimums
8. Asset decision rules
9. Build-agent handoff
10. Generation prompts

## 1. Visual thesis

Build a **storybook arcane frontier** in which written language is a physical force. The world should feel ancient, warm, mobile, and slightly theatrical rather than like a dark wizard arena. Parchment, ink, carved stone, wood, copper, and controlled emissive runes form the shared material language.

The visual design must reinforce the one-mode interaction contract:

> The world presents a phrase; the player types; the world responds.

The player should never need a second control language to understand the scene. Camera composition, enemy lanes, silhouettes, color, and world-space glyphs must make the next typing action legible without mouse aiming, WASD exploration, or click selection.

## 2. Reference images

### Character and bard

![Typomancer and bard character sheet](SPELLCHECK_Visual_References/01_Typomancer_and_Bard_Character_Sheet.png)

### World and encounter framing

![Lexicon Frontier world keyframe](SPELLCHECK_Visual_References/02_Lexicon_Frontier_World_Keyframe.png)

### Enemy bestiary

![Corrupted-language enemy bestiary](SPELLCHECK_Visual_References/03_Corrupted_Language_Enemy_Bestiary.png)

These are **visual north stars, not literal asset specifications**. Preserve their silhouette logic, palette relationships, material language, and encounter readability. Simplify geometry aggressively when doing so improves build speed or performance.

## 3. What each reference locks

### Typomancer

- A traveler and language-worker, not a generic robed wizard.
- The casting instrument resembles a portable mechanical grimoire or rune keyboard.
- The outfit is practical enough for travel: layered coat, boots, belt-mounted tools, restrained ornament.
- Indigo cloth, parchment fabric, copper fittings, and teal accents anchor the palette.
- Elemental charms give spells a physical source without becoming a flat ability bar.

The exact face, gender presentation, and costume details remain flexible. The locked feature is the silhouette of a traveler operating a wearable written-magic instrument.

### Bard companion

- The bard must exist inside the world rather than as a disembodied dialogue box.
- Preferred form: a floating quill-and-lute familiar that can perch on a book lectern.
- It needs a readable face or eye region, a musical prop, and a clear speaking animation.
- Its shape should remain visible beside the player without competing with the typing prompt.

### Traveling Scriptorium

- A bookish wooden wagon, lectern, and mobile sanctuary in one object.
- It provides automatic travel, a stable player stage, a bard perch, and a believable place for cooldown runes.
- It should feel handmade and magical rather than industrial or military.
- The walking-leg idea is optional for the first build. A floating, gliding, or simplified bobbing version preserves the design if leg animation becomes expensive.

### Lexicon Frontier

- The route is dense and authored enough to feel meaningful, but visually open enough to read threats.
- Broken letter monoliths, archive ruins, ink waterways, rune plants, and suspended fragments make language part of the terrain.
- The world should imply greater scale through landmarks and distant silhouettes rather than require a large explorable map.
- Previously cast spells leave short-lived environmental evidence: scorched ground, frozen ink, displaced foliage, raised stone, or revealed runes.

### Enemies

- Every enemy embodies one corrupted-language idea.
- Each enemy gets one dominant silhouette, one dominant behavior, and one dominant readability color.
- Black-violet ink identifies corruption across the family.
- Parchment, stone, punctuation shapes, censor bands, and broken glyph plates create variation without breaking cohesion.

## 4. Vertical-slice asset manifest

### Tier 1 — Must exist in the playable demo

| Asset | Purpose | Minimum viable form |
|---|---|---|
| Typomancer | Player identity and casting origin | One rigged or simply animated model with idle, cast, error, and hit reactions |
| Bard familiar | Narration personality and roast delivery | One floating model with hover, speak, laugh, and disappointed reactions |
| Traveling Scriptorium | Continuous forward motion and player stage | One modular vehicle/platform with procedural bob or a short travel loop |
| Route kit | Creates the continuous journey | Straight path, one bend, one bridge or gap, two edge pieces, and repeatable ground dressing |
| Archive landmark | Gives the slice a visible destination | One large silhouette assembled from modular ruin pieces |
| Inkblot Imp | Fast, immediately readable basic enemy | Small ink body, bright eye, approach animation, pop defeat |
| Cooldown Golem | Slow armored contrast enemy | Large stone silhouette, rotating glyph plates, heavy hit reaction |
| Misfire Goose | Signature comedy payoff | Simple goose model with idle, confused look, honk, and exit motion |
| Four root FX | Establishes combinatorial magic | Fire, ice, wind, and earth source effects designed for recombination |
| World-space prompt anchor | Makes typing diegetic | Stable glyph arc, grimoire ribbon, or rune line near the encounter focal point |

### Tier 2 — Add only after the loop feels finished

| Asset | Purpose |
|---|---|
| Redaction Hound | Faster pressure enemy that visually removes or obscures characters |
| Homophone Harpy | Mirrored or deceptive prompt enemy with a strong paired silhouette |
| Syntax Wyrm | Long-form elite or boss encounter built from linked punctuation segments |
| Frozen ink variant | Strong persistent result for ice spells |
| Scorch, crack, and reveal decals | Inexpensive world memory for other spell families |
| Rune monolith variants | Reusable landmarks and typed route-choice anchors |

### Tier 3 — Reference only for the hackathon

- Multiple biomes.
- Full open-world traversal.
- Large enemy population.
- Unique geometry for every spell combination.
- Fully simulated wagon locomotion.
- A separate model for every cooldown, ingredient, or rune.

The visual pack may imply this larger world, but the playable slice should not attempt to build it.

## 5. Enemy roles and visual grammar

| Enemy | Language corruption | Combat behavior | Visual tell | Priority |
|---|---|---|---|---|
| Inkblot Imp | A stray mark becoming hostile | Basic timed approach | Small round splash, single bright punctuation eye | Must |
| Redaction Hound | Words being erased | Fast pressure; temporarily obscures part of a phrase | Long censor-band body and torn-paper trail | Stretch |
| Homophone Harpy | Sound-alike ambiguity | Presents a deceptive or paired phrase challenge | Mirrored heads and quotation-mark feathers | Stretch |
| Cooldown Golem | A valid spell becoming temporarily unavailable | Slow armored advance; recommended spell must adapt | Massive blocks and rotating inactive glyph plates | Must |
| Syntax Wyrm | A sentence becoming tangled | Multi-stage elite with a longer phrase | Segmented punctuation armor and ribbon body | Stretch/boss |
| Misfire Goose | Player typo turned into absurd consequence | Non-hostile interruption and comedic reset | Ordinary warm-white goose with one crooked rune charm | Must |

Enemy design heuristic:

> One mistake concept + one silhouette + one pressure pattern + one defeat gag.

Do not give every enemy several mechanics. Their job is to make the typing decision readable, not to become a separate combat system.

## 6. Spell and world-reaction assets

Do not author dozens of unrelated spell effects. Build a small composable visual language.

| Root | Primary color | Shape language | World evidence |
|---|---|---|---|
| Fire | Amber-red | Expanding arcs and sparks | Scorch decal, ember motes |
| Ice | Cyan-white | Angular crystals and sheets | Frozen ink or frosted ground |
| Wind | Pale teal | Spirals, ribbons, displaced particles | Bent grass, drifting leaves |
| Earth | Ochre-green | Blocks, cracks, rising slabs | Raised cover, repaired path, cracked terrain |

For a two-root spell, combine the source geometry and behavior of both roots rather than building an entirely new art pipeline. For example, fire + wind can use a wind spiral carrying fire particles; ice + earth can raise a crystalline stone ridge.

Required shared effect assets:

- Cast charge at the grimoire.
- Traveling spell trace.
- Enemy hit flash.
- Defeat dissolve or pop.
- Fizzle puff.
- Misfire burst with a comic pause before the result appears.
- Small camera impulse and world-light response.

## 7. Animation and feedback minimums

### Typomancer

- Idle at the lectern.
- Short successful cast.
- Brief typo/error reaction that does not lock out typing for long.
- Hit or pressure reaction.
- Victory/rest beat.

### Bard

- Hover or perch loop.
- Speak gesture.
- Laugh or delighted flourish.
- Dry disappointment.
- Alarm or warning.

### Scriptorium

- Continuous travel motion.
- Stop or brace for encounter.
- Spell-response recoil.
- Resume motion.

### Every enemy

- Idle/readable anticipation.
- Approach or attack loop.
- Hit reaction.
- Defeat.

Animation can be skeletal, morph-based, or procedural. The required outcome is readable state change at gameplay distance.

## 8. Asset decision rules

Use these rules whenever the build agent must simplify:

1. **Preserve silhouettes before details.** If a creature cannot be identified at gameplay scale, added texture detail is wasted.
2. **Preserve the typing focal area.** Nothing should cross or shake the active phrase enough to impair reading.
3. **Reuse the material grammar.** Parchment, ink, stone, wood, copper, and runelight should cover most assets.
4. **Spend uniqueness on reactions.** A reusable enemy with a memorable defeat or bard response is more valuable than another static model.
5. **Imply scale through landmarks.** Do not build empty traversable acreage.
6. **Keep humor physically present.** The goose, bard gestures, fizzle effects, and enemy deaths should occur in the world.
7. **Design for one mode.** No asset should imply click targeting, inventory navigation, or a separate exploration control scheme.

## 9. Build-agent handoff

Give the development agent this document, the three reference images, and the R3F continuous-world design prompt together.

Ask the agent to begin by returning:

1. The exact Tier 1 assets it will source, generate, approximate, or build procedurally.
2. A scene blockout showing the Scriptorium, route, prompt anchor, one enemy, and archive landmark in one camera frame.
3. A palette/material test using the six shared material families.
4. A gameplay-scale silhouette test for the Typomancer, bard, Imp, Golem, and Goose.
5. A cut list that protects the one-mode typing loop if asset integration takes too long.

The agent should then implement the smallest playable spatial slice instead of continuing to expand the concept-art inventory.

## 10. Generation prompts

The following prompts produced the reference images and can be reused to create variants.

### Character sheet prompt

```text
Use case: stylized-concept
Asset type: game character visual-development sheet for a React Three Fiber prototype
Primary request: create an original production reference sheet for the hero and bard companion of a one-mode typing spell game
Scene/backdrop: warm neutral parchment-gray studio backdrop with subtle floor shadows, no environment
Subject: a young adult traveling typomancer in a practical layered robe-coat with a compact rune keyboard/grimoire mounted at the waist, ink-stained gloves, sturdy boots, and six small elemental rune charms; beside them, an embodied bard companion designed as a charming floating quill-and-lute familiar perched on a tiny book-shaped traveling lectern. Show the hero in front, three-quarter, side, and back views plus two close detail views of the grimoire and rune charms. Keep the bard visible at two scales.
Style/medium: polished stylized 3D game concept art, storybook arcane frontier, readable low-poly-to-mid-poly forms suitable for R3F/glTF production, simple modular geometry, expressive but not chibi
Composition/framing: clean orthographic-style character sheet, clearly separated views, strong silhouette consistency
Lighting/mood: soft studio key light, inviting, clever, adventurous
Color palette: deep indigo, aged parchment, warm copper, teal magic accents, small controlled elemental colors
Materials/textures: painted leather, woven cloth, brushed copper, carved wood, luminous etched runes
Constraints: entirely original design; asset feasibility matters; no readable text, no logos, no watermark, no giant hat, no photorealism, no UI screens, no extra characters
Avoid: generic wizard robes, excessive tiny ornament, anime school uniform, dark horror, visual clutter
```

### World keyframe prompt

```text
Use case: stylized-concept
Asset type: world keyframe and environment asset reference for a React Three Fiber vertical slice
Primary request: visualize the Lexicon Frontier as a seamless one-mode typing adventure world, with no separate exploration mode
Scene/backdrop: a broad magical route crossing floating parchment-stone terraces, luminous rune grass, broken alphabet monoliths, an ink river, distant sentence-shaped mountain ridges, and one large ruined archive landmark; the hero travels automatically aboard a compact walking Scriptorium that resembles a bookish wooden wagon with articulated legs
Subject: third-person three-quarter gameplay view behind and above the traveling Scriptorium; the typomancer stands at its front lectern while a stable arc of floating rune glyphs appears directly ahead in world space; a corrupted ink creature approaches along the route; a recent ice spell has frozen part of the ink river and left visible world memory
Style/medium: polished stylized 3D game environment concept, storybook arcane frontier, designed to be achievable with R3F using modular glTF assets, instancing, simple materials, particles, decals, and lighting
Composition/framing: cinematic 16:9 gameplay keyframe with clear foreground interaction, midground encounter, background landmark; prompt area remains stable and readable though glyphs are decorative rather than actual text
Lighting/mood: late-afternoon amber sunlight with cool teal and violet magic contrast, adventurous and alive rather than ominous
Color palette: parchment sandstone, moss teal, indigo shadows, copper machinery, icy cyan spell traces, black-purple corruption accents
Materials/textures: stylized stone, timber, brass, parchment, ink, soft emissive runes
Constraints: one continuous typing control fantasy; no visible WASD prompts, no mouse cursor, no flat ability bar, no large static text overlay, no logos, no watermark, no photorealism
Avoid: empty open world, stationary arena, massive HUD, generic medieval village, overly dense vegetation, realistic military fantasy
```

### Enemy bestiary prompt

```text
Use case: stylized-concept
Asset type: enemy bestiary and gameplay silhouette reference sheet for a React Three Fiber typing spell game
Primary request: create an original six-enemy lineup based on corrupted language, punctuation, ink, and typing mistakes
Scene/backdrop: neutral desaturated parchment studio background with subtle ground planes, no environment
Subject: six clearly separated stylized 3D creatures shown at consistent three-quarter view and useful relative scale: (1) a small Inkblot Imp made from splashing black-violet ink with one bright punctuation-shaped eye; (2) a lean Redaction Hound whose body is wrapped in shifting black censor bands and torn paper; (3) a Homophone Harpy with paired mirrored heads and feather shapes like quotation marks; (4) a bulky Cooldown Golem built from stacked carved rune stones with rotating inactive glyph plates; (5) a long segmented Syntax Wyrm made of linked punctuation armor and ribbon-like parchment; (6) a harmless mildly disappointed white goose wearing one tiny crooked rune charm, the comic misfire creature. Give each a strong distinct silhouette, one obvious attack feature, and simple modular anatomy.
Style/medium: polished stylized 3D game concept art, storybook arcane frontier, low-poly-to-mid-poly production feasibility for R3F/glTF, expressive shapes, controlled detail
Composition/framing: clean bestiary lineup, smallest to largest, ample separation, no overlaps, a faint shadow beneath each
Lighting/mood: soft neutral studio lighting; clever, magical, lightly comedic, never gruesome
Color palette: parchment neutrals, black-purple corruption, copper rune accents, limited cyan and magenta emissive details; goose remains warm white
Materials/textures: ink, torn parchment, carved stone, stylized feathers, etched brass
Constraints: entirely original; no readable labels or text, no logos, no watermark, no blood, no gore, no photorealism
Avoid: cute mobile-game sameness, generic zombies, generic demons, excessive spikes, noisy micro-detail, horror imagery
```
