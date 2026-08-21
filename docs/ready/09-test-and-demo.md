# Test and demo

Acceptance IDs are from spec §21. This file maps each to a **probe**, not a badge. A criterion is observed only when someone runs the listed action on a build.

Outcomes 1–7 can be shown from a cold tab without a live model. Canvas / R3F is still off.

---

## Identity floor

| ID | Probe | Falsifier |
|---|---|---|
| AC-ID-001 | Cold load; stranger; start clock at first paint | No directed keypress by ~5s (`P-COMPREHENSION-5S`) |
| AC-ID-002 | Hands off the mouse for a full slice | Any required click |
| AC-ID-003 | Type `ignis ventus` | No well change; double cast |
| AC-ID-004 | Enter `ignis ventis` | Generic “error”; luck-only goose |
| AC-ID-005 | Watch rubric on goose or first success | Line could fit any event |
| AC-ID-006 | After AFTERMATH, press `R` | Must click; stale run state |

---

## Typing and prompt

| ID | Probe | Falsifier |
|---|---|---|
| AC-TYPE-001 | Load and type immediately | Click-to-focus (`P-FOCUS`) |
| AC-TYPE-002 | Type a wrong letter | Hue-only change |
| AC-TYPE-003 | Type one letter; wait | Prompt swaps |
| AC-TYPE-004 | Type wrong, Backspace to empty, retype | Glyphs desync from buffer |
| AC-TYPE-005 | Complete the phrase | Two resolve events |
| AC-TYPE-006 | Mash, IME, Tab, Enter empty, hold keys | Invisible prompt or stuck RESOLVING (`P-SOFTLOCK`) |

---

## Recommendation (Outcome 2+)

| ID | Probe | Falsifier |
|---|---|---|
| AC-REC-001 | Debug eligible set vs prompt | On-CD spell shown as ready |
| AC-REC-002 | Cast wave 1; read wave 2 | Still `ignis ventus` while on CD |
| AC-REC-003 | Each authored wave | Reason label contradicts tags |
| AC-REC-004 | Two identical states | Two different picks |
| AC-REC-005 | Lock, then change would-be rank | Prompt moves |
| AC-REC-006 | (WPM off) | Any WPM-driven swap |

---

## Corpus

| ID | Probe | Falsifier |
|---|---|---|
| AC-CORPUS-001 | Count `spells[]` | Not 10 unique ids |
| AC-CORPUS-002 | Canonical root pair uniqueness | Two ids for one unordered corpus pair |
| AC-CORPUS-003 | Schema fields present | Missing tags / CD / count |
| AC-CORPUS-004 | Tag vocabulary | Unknown tag |
| AC-CORPUS-005 | Side-by-side roles | Two spells with same tags, CD, vs, length |
| AC-CORPUS-006 | Display each incantation | Unreadable overlap |

Claimed combination count for v1 is **10**, not 78.

---

## Combat

| ID | Probe | Falsifier |
|---|---|---|
| AC-COMBAT-001 | Cast; read CD map | Spell still eligible at t+0 |
| AC-COMBAT-002 | Wave 1 → wave 2 | Same prompt, same reason |
| AC-COMBAT-003 | Impact at TTI 0 | Phase stuck; hits not incremented |
| AC-COMBAT-004 | Take a hit / off-role cast | Player cannot say why |

Win/lose: 6 defeats / 3 hits (`data/encounter.json`).

---

## Bard and narration

| ID | Probe | Falsifier |
|---|---|---|
| AC-BARD-001 | Grep line pack | Profanity / identity attack |
| AC-BARD-002 | First typo then same typo again | Identical subtitle |
| AC-BARD-003 | Spam success | Queue of stale praise |
| AC-BARD-004 | Trigger win/lose during a success line | Low-priority line plays after context dies |
| AC-BARD-005 | Same success 3 times fast | Same `lineId` repeats immediately |
| AC-BARD-006 | Mute | No subtitle |
| AC-BARD-007 | Break narration provider | Phase does not advance |
| AC-BARD-008 | Room listen | Unintelligible (`P-AUDIO-ROOM`) |
| AC-BARD-009 | All clips / all text | Multiple personas |

---

## Operator demo (~90 seconds)

Hands off the mouse. Cold tab. No API keys.

| t | Operator | Must see |
|---|---|---|
| 0:00 | Load. Start typing. | Opener (`open_01`–`open_03`). Input focused. Cue `ignis ventus`. |
| 0:08 | Type `ignis ventus`. | Emberling yields. `ignis ventus` marked `SPENT` for this run. |
| 0:16 | Read the next page. | `glacies fractura` / `BEST VS. ARMOR`. |
| 0:20 | Type `ignis ventis`, Enter. | Goose. Goose line. Sentinel still there. |
| 0:28 | Type the current prompt. | `recover_01` — not a leftover success line. |
| 0:40–1:20 | Type each new cue (`lumen aqua`, `fulgur ventus`, `aqua glacies`, `umbra mors`). | Reason chip changes with the threat. |
| 1:25 | Sixth defeat. | `win_01`. AFTERMATH. |
| 1:28 | Press `R`. | Opener again. Unlocked. Focused. No leftover bard queue. |

Lose backup (if you would rather show the ending than the full book): after the goose, idle until three hits. `lose_01`. Then `R`.

Authored path (must not depend on luck):

1. Cold tab, keyboard only.
2. Opening rubric (one of `open_01`–`open_03`).
3. `ignis ventus` exact → emberling struck.
4. `glacies fractura` + `BEST VS. ARMOR`.
5. Type `ignis ventis`, Enter → goose + `goose_01` or `goose_02`.
6. Next clean cast → `recover_01`.
7. Six defeats → `win_01`, or three hits → `lose_01`.
8. `R` restart. Repeat 10/10.

| ID | Probe | Falsifier |
|---|---|---|
| AC-DEMO-001 | 10 cold starts | First prompt missing or uncastable |
| AC-DEMO-002 | 10× `ignis ventis` | Random other misfire |
| AC-DEMO-003 | Same 10 | No goose line |
| AC-DEMO-004 | Kill tab; new tab | Stale state (should be impossible — no persistence) |
| AC-DEMO-005 | Offline / no API keys | Spinner or blank prompt |
| AC-DEMO-006 | Operator says the agent sentence | “AI wrote jokes” as the only story |

---

## Debug lens

`?debug=1` should show: phase, expected, buffer, lock, threat id, CDs, last recommendation, last 5 event types, last bard `{lineId, action}`. This is how AC-REC and bard priority are inspected.

---

## Instrument note

A passing unit test of `reduce` is not `AC-ID-001`. Comprehension and room audio have no fixture. Those probes stay named in `00-HALT.md` until a human runs them.
