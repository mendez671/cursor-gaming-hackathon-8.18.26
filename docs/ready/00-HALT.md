# Ready-state HALT

This track freezes design. It does **not** claim the game is playable, fair, or funny.
Outcome 1 is the live app track and may keep building against this ledger.

No ASSURED / PASS / ALL-GREEN marks appear here. Numbers are decisions, not measurements.

---

## What is frozen

- Ledger: `01-decision-ledger.md` — every spec-O, R-*, and §25 question is CLOSED there.
- Product, state, contracts, content, look, input, plan, test: `02`–`09`.
- Data: `data/roots.json`, `spells.json`, `encounter.json`, `bard-lines.json`.
- Stack split: DOM HUD owns the phrase; well is CSS now and R3F only after the HUD loop is observed.
- Input: auto-cast exact; Enter dirty-only; Escape cancel; R/Enter restart on AFTERMATH.
- Combat numbers for Outcome 2+: 6 threats, 3 hits, TTI 8.0−0.5s (min 5.0), CD 4/8/12.
- WPM off. No persistence. No live model. Desktop only.

---

## Must not

- Scaffold or edit `src/`, `index.html`, `package.json`, `vite.config.*`, `tsconfig.*` from this track.
- Treat this HALT as a stop-work order for Outcome 1.
- Treat JSON on disk as proof the loop is fun (`§27.3`).
- Ship a second store or a 78-spell matrix.

---

## Named probes (need a running game or a room)

These are the only unfinished items. They are observations, not design leftovers.

| Probe | What would change our mind | Needs |
|---|---|---|
| P-FOCUS (R-005) | Focus lost after cast, blur, or tab-back; player must click | Outcome 1 cold load + blur + restart |
| P-AUTOCAST-FEEL | Final glyph feels like a form submit or double-fires | Running HUD |
| P-TTI-FAIRNESS | 8.0–5.0s windows are trivial or impossible at booth speeds | Outcome 2+ combat clock |
| P-REASON-TRUST | Chip unread or mistrusted | Chip on screen |
| P-ROTATION-FEEL | 10 spells feel like one spell or like noise | Full book + CDs |
| P-ERROR-RHYTHM | Error marks break typing cadence | Running HUD |
| P-PANIC-FAIRNESS | Impact-misfire + hit feels cruel | Combat clock |
| P-COMPREHENSION-5S | Stranger does not type within ~5s | Cold stranger, no coaching |
| P-BARD-DENSITY | Bard is mute or a firehose | Line selector live |
| P-AUDIO-ROOM | Clips inaudible or harsh in the demo room | Room + device |
| P-AUDIO-AUTOPLAY | Gesture gate blocks play (must not) | Cold tab, sound blocked |
| P-VOICE-AUDITION | Orion is not the funniest serious voice | Same-script listen |
| P-PRONUNCIATION | A root is mangled in a clip | Clip pass |
| P-LINE-LAG | Spoken line trails the next cast | Audio + play |
| P-A11Y-CONTRAST | Prompt < readable contrast; color-only errors | Browser + reduced-motion |
| P-SOFTLOCK | Unexpected keys / IME / empty-buffer leave no prompt | Adversarial keyboard |

`P-FOCUS` is the probe Outcome 1 is already built to answer. `docs/CHECKPOINT.md` records an automated-browser autofocus pass; that is not a stranger playtest and does not close the probe.

---

## Verification this track actually ran

- Files exist under `docs/ready/` as listed in the orchestrator return.
- JSON parses.
- Grep of these docs: `TBD` / `TODO` / leftover design-`OPEN` appear only in this HALT if at all.
- App paths listed above were not written by this track.

This is a design halt, not a playtest halt.
