# SPELLCHECK integration decisions

**Audit:** 2026-08-18. Full canonical spec, startup prompt, checkpoint, ready docs, current source, tests, and working tree inspected. All project work is untracked from `889c01f`, so tracked/staged diffs are empty; findings below use the files and observed runtime, not patch provenance.

**Evidence labels:** **E** observed in source/test/runtime · **I** inference · **P** preference.  
**A-INT-001 (high):** the authored six-wave demo intentionally uses six distinct recommended spells; no spell must return during that run (`encounter.json`, passing win-path browser test).

| Decision | Observed state | Disposition | Owner |
|---|---|---|---|
| D-001–D-007, D-009–D-012, D-014 | **E:** one focused input; no click/WASD cast path; DOM prompt locks; deterministic local rank/data; authored goose; event/memory/priority bard; subtitles survive narration failure. Unit 30/30 and browser 18/18 pass. | **SUPPORTED / preserve LOCKED.** | Final Integrator guard |
| D-008; O-005 | **E:** `coolingIds` permanently excludes each cast spell and changes wave-2 recommendation; 4/8/12-second metadata never counts down. | **RESOLVED DEFAULT deviation:** under A-INT-001, v1 uses per-run **SPENT** availability, which satisfies D-008's “or equivalent” clause. Do not claim timed cooldowns; relabel `COOLING`/stale docs as `SPENT` unless timers are actually added. | Final Integrator |
| D-013, D-014; D-108/D-109 | **E:** runtime is generated-clip-aware, then device speech, then subtitle; manifest has zero generated clips and `selectedVoice: null`. `10-audio-production.md:28` still says clips are not attempted, and the checkpoint calls voice clips deferred. | **THREATENED, not a gameplay blocker.** D-014 passes. Voice Producer owns the bundle/audition; Final Integrator must reconcile docs and run `P-AUDIO-ROOM` before claiming the signature voice. | Voice Producer → Final Integrator |
| D-015 | **E:** 10-record JSON and reachability/pronunciation audit pass. Metadata still disagrees: `glacies fractura` is 16 chars but banded `long`; `05-content-bible.md` says 17, and says `ordo lumen` is 11 while JSON correctly says 10. | **THREATENED / exact cleanup:** canonicalize to measured JSON lengths, make `glacies` band `medium`, and extend the audit if this data is touched. Not a demo blocker. | Final Integrator |
| D-104; O-002; §25.1 #3 | **E:** `ventus ignis` force-casts as `fizzle`; docs elsewhere promise reversed-pair matching, while the settled one-prompt rule permits only the recommendation. | **RESOLVED:** unordered pairs define corpus identity; v1 active input casts only the exact displayed authored phrase. Remove the reverse-input promise/probe; do not add a second matcher. | Final Integrator docs |
| D-001/D-104 input robustness | **E:** `App.tsx` forwards raw input. `IGNIS VENTUS` remains TYPING and force-casts as `fizzle`, contrary to the frozen lowercase/NFC rule. | **HANDOFF:** normalize lowercase NFC and reject non-`[a-z ]` input before `TYPE`; add the Caps Lock regression probe. | Final Integrator |
| O-009 with D-001/D-002/D-004/D-014 | **E:** current checkpoint and `11-world-slice.md` explicitly replace the older clipped museum-well shell with the full-scene Lexicon Frontier; DOM prompt, dead canvas events, and `?flat=1` remain. | **RESOLVED visual-shell supersession:** accept the current Frontier; do not roll it back or use it to add movement/selection. This changes presentation, not gameplay authority. | 3D Visual → Final Integrator |

## Current handoff gate

- `npm run build` passes; an in-flight world type error appeared once and was resolved by its active owner without Steward edits.
- `npm test`: 30 pass. `npx playwright test`: 18 pass, including no-click play, prompt lock, deterministic rerank/goose, mute fallback, restart, win/lose, and no live-model traffic.
- Human probes remain evidence gaps: `P-AUDIO-ROOM`, `P-COMPREHENSION-5S`, `P-A11Y-CONTRAST`, `P-TTI-FAIRNESS`, `P-AUTOCAST-FEEL`.
- Preserved cuts: 10 active spells, one prompt, WPM off, no persistence/accounts/live model/78-matrix/multi-prompt. Cut visual/audio variation before typing → consequence → bard.

## Final Integrator resolution

- Active input now normalizes NFC uppercase to canonical lowercase and rejects non-`[a-z ]` values before `TYPE`; reducer defense and Caps Lock/Backspace/error regression coverage were added without changing composition-event gating.
- Player-facing availability says `SPENT`, matching the per-run behavior. Timed 4/8/12-second cooldowns were not added.
- The local pack now contains nine generated ElevenLabs clips using provisional Brian; runtime order is manifest-confirmed generated clip → device speech → subtitle. `P-VOICE-AUDITION` / `P-AUDIO-ROOM` remain human evidence.
- `glacies fractura` is measured at 16 characters with a `medium` typing band; `ordo lumen` is 10 and `aqua glacies` is 12. The startup book audit now rejects character-count or band drift.
- Unordered roots remain corpus identity only. Active play still accepts exactly the one displayed phrase; no reverse matcher or scope expansion was added.
