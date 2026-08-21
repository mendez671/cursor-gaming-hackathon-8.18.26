# Look and feel

O-009 CLOSED: a **chronicle lectern** around a **museum well**. Comedy is register clash (a goose walking into a Book of Hours), not a cartoon UI.

**Live CSS is the v1 page.** Outcome 1 already ships lectern/well tokens in `src/index.css`. Do not restyle that file from this track.

---

## North star

The player sits at bone-vellum and lamp-black ink. Below the writing edge, a dark well holds one object, lit like a plaster cast. Magic is ink taking and a miniature being struck. If a screenshot is the phrase plus a small serious object in a hole, it is correct. If it is a dungeon HUD, it is wrong.

---

## Two layers

```
DOM lectern (front): bard rubric, INCANTATION, caret, errors, reason chip, CD seals
CSS / R3F well (back): one threat, approach, clean hit vs goose intrusion
```

| DOM | Well |
|---|---|
| Phrase, glyphs, lock edge | Object + approach (Z or scale, or a CSS bar) |
| Reason chip | Material hit / goose from the margin |
| Bard italic rubric | Never a 3D talking head |
| Restart chrome | |

**F-016 clip rule:** VFX dies at the lectern lip. No camera shake, no orbit, no FOV punch. Cast energy travels **toward the well**, not across the letters. Prompt band is title-safe. Canvas `pointer-events: none`.

If R3F slips: keep the CSS well. A pretty canvas that hides `ignis ventus` is an F-016 fail.

---

## Live tokens (do not replace)

From `src/index.css`:

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#1c140c` | Incantation |
| `--vellum` | `#e6d6b8` | Page |
| `--vellum-edge` | `#c9b48a` | Edge |
| `--museum` | `#16110c` | Stage |
| `--well` | `#0b0907` | Cavity |
| `--lamp` | `#c4a35a` | Brass / lock |
| `--ember` | `#b4532a` | Threat juice |
| `--error-mark` | `#6b1d12` | Error (with structure) |

Hero type is already **Cormorant Garamond** (serif, still, tracked). Keep it. Reason chip / seals: add a grotesque (News Gothic DNA) when those HUD bits ship — not Inter.

Spell `colorFamily` tints the **cast in the well**, never the prompt glyphs.

---

## Type grammar

- Incantation is the largest type on screen. Lowercase as authored. Tracking wide enough that each glyph is a target.
- Lock (first committed character): hairline / brass edge. Position does not move. No scramble.
- Correct: ink fills (weight or fill). Not green tiles.
- Incorrect (`AC-TYPE-002`): **strike + mark** (`data-status="incorrect"` is already live) + optional hue. Never hue alone.
- Caret: thin nib; pulse ≤1 Hz; static if reduced motion.
- Bard: italic, smaller, sealing-wax / `--error-mark` family. Never covers the phrase.

`prefers-reduced-motion`: instant fill/mark, numeral TTI, no particles, freeze the well.

Contrast target: prompt ≥7:1 on vellum. Outcome 1 ink-on-vellum is the baseline; probe `P-A11Y-CONTRAST` measures it.

---

## Signature beats

| Beat | Picture |
|---|---|
| Arrival | Phrase already huge. Ember wisp in the well. One bard line. Keyboard live. |
| Clean cast | Last glyph fills. 480 ms hold. Object struck **inside** the well. Phrase then replaces in the same slot. |
| Rerank | Spent incantation becomes a small seal. New phrase, same size. Chip updates. |
| Goose | Object interrupted by a serious goose in the well foreground, below the lip. Phrase stays. |
| Bard | Pilcrow / manicule + italic line at top. Emblem postage-size. |

---

## Camera (when Canvas exists)

Tripod. Slight down angle. No OrbitControls. No WASD camera. TTI also exists as a DOM numeral so D-014 holds if WebGL dies.

---

## Anti-look

Default r3f grid, OrbitControls, city HDRI, WoW action bar, typing-tutor slots, Wordle tiles, vaporwave, Cinzel + purple glow, grimdark fog, cartoon-goose mascot UI.

---

## R3F verdict

3D is a **clipped reliquary**, not the game. Smallest bar: locked camera, one object, two resolutions (hit vs goose), hard clip, no 3D text. Outcome 1 already meets the floor with CSS. Add Fiber only after the HUD loop is observed.
