# SPELLCHECK v1 decision ledger

**Status:** FROZEN for implementation. Numbers are playtest-tunable, not measured.
**Date:** 2026-08-18
**Canonical spec:** `SPELLCHECK_Agent_Facing_Game_Concept_Spec_v1.0.md`
**Live app:** Outcome 1 owns `src/`. This ledger extends that machine; it does not authorize a rewrite.

Every former spec-O, Research Agenda item, and §25 question is CLOSED below.

---

## How to read

| Mark | Meaning |
|---|---|
| LOCKED | Spec D-001–D-015. Do not reopen without contradiction. |
| ADOPT | Spec DEFAULT taken as v1. |
| OVERRIDE | Spec DEFAULT replaced for v1; rationale recorded. |
| CLOSED | Was unspecified or spec-O / R-* / §25. Decision written. |
| SLICE | Outcome 1 may implement a thinner cut; the number stays frozen. |

---

## A. Inherited LOCKED (not reopened)

D-001 keyboard-first. D-002 surface the incantation. D-003 rec considers combat + availability. D-004 lock on first committed character. D-005 deterministic valid spells. D-006 no live model. D-007 corpus is pre-baked JSON. D-008 cooldowns change recs (SLICE: Outcome 2+). D-009 errors get specific feedback; important errors may misfire. D-010 bard is official historian, fondly unimpressed. D-011 no profanity; roast actions. D-012 bard is event-aware and selective. D-013 voice is part of the feature — satisfied by a consistent character on the page plus optional bundled clips; audio never gates play (D-014). D-014 visuals work with narration off. D-015 agent leverage is coherence, not volume.

---

## B. Spec DEFAULTS

| ID | v1 | Decision |
|---|---|---|
| D-101 (78 pairs) | OVERRIDE | Twelve roots ship as a glossary. Ten active spells ship. The 78-cell matrix is out of v1 (`F-004`, `F-015`). |
| D-102 (8–12 active) | ADOPT | **10** active spells. |
| D-103 (one prompt) | ADOPT | One primary recommendation. |
| D-104 (auto-cast) | ADOPT | Exact displayed incantation auto-casts once. Live in Outcome 1. |
| D-105 (Backspace + force) | ADOPT | Backspace recovers. Enter force-casts **only if the buffer is dirty**. Empty Enter is a no-op. |
| D-106 (WPM rank) | OVERRIDE | **Off** for v1. Ranking ignores typing speed (`F-007`). |
| D-107 (authored opening) | ADOPT | Encounter 1 is forced `ignis ventus` vs emberling. |
| D-108 (25–40 clips) | OVERRIDE | Text + subtitle is the floor. Clips may attach to existing line IDs without blocking. |
| D-109 (xAI voice) | ADOPT as intent | Intended voice: **orion** (serious cinematic). Listening test is probe `P-VOICE-AUDITION`. |
| D-110 (subtitles) | ADOPT | Every spoken line has a subtitle. |
| D-111 (short lines) | ADOPT | Routine 6–14 words; couplets reserved for endings if added. |

---

## C. Former O-001–O-012 — all CLOSED

| ID | Decision | Rejected | Spec | Consequence |
|---|---|---|---|---|
| O-001 | Twelve roots in `data/roots.json` with pronunciations and meanings. | Inventing a 78-spell matrix; English cheat-words. | §9, D-101 OVERRIDE | Glossary is complete; play uses 10 pairs. |
| O-002 | Pairs are **unordered for corpus identity**. Display and active input use the exact authored `incantation`; `ventus ignis` does not cast `ignis ventus`. | Ordered 144-pair mode; second reversed-input matcher. | §9.2, integration D-104 | One prompt means one exact phrase. |
| O-003 | Active book = the 10 records in `data/spells.json`. First prompt `ignis ventus`. | Browsable 78; loadout screen. | D-102, §9.3 | Outcome 1 may hardcode the first phrase; Outcome 2+ loads the book. |
| O-004 | Six authored archetypes: fleshy, armored, swarm, charging, fire, elite. One on screen. | Simultaneous swarms as play surface; boss phases. | §12.2, D-107 | `data/encounter.json` waves 1–6. |
| O-005 | Limited book + per-run **SPENT** spell availability. Each successful spell is unavailable for the remaining authored six-wave run. | Timed countdowns; 78 independent CDs; resource meters. | D-008 equivalent, integration A-INT-001 | `SPENT` must change at least the wave-2 prompt. |
| O-006 | A wrong character **costs time only**. Buffer stays; Backspace recovers. No pre-submit corruption. | Error-count mutates the spell. | §11.3, §14.2 | Visual error now; misfire only on force, impact, or exact cursed string. |
| O-007 | **Enter** force-casts dirty buffer. **Escape** cancels to READY (clears lock). Auto-cast on exact match. | Space-to-cast; Ctrl-Enter; always-Enter confirm. | D-104, D-105 | Matches the live Outcome 1 machine. |
| O-008 | Identity-floor delivery is **text + subtitle**. Intended clip voice is orion. Browser `speechSynthesis` is optional garnish. Failure → subtitle. | Live TTS in the critical loop; playful “funny voice.” | D-013, D-014, §16 | Narration provider never `await`ed by the reducer. |
| O-009 | Chronicle **lectern + museum well**. Incantation is DOM. 3D, if any, is a clipped well. | Full-bleed R3F; WoW bar; Wordle tiles. | §17, F-016 | Outcome 1 already paints lectern/well in CSS. Do not restyle it for this freeze. |
| O-010 | Title stays **SPELLCHECK**. Tagline: **Every typo is canon.** | Rename for the showcase. | §2.4 | Mast already uses both. |
| O-011 | One prompt. `BEST` / `FAST` / `RISK` are out of v1. **Reason chip ships** (2–4 words). | Multi-prompt agency. | D-103, §8.3, §10.7 | Chip is Outcome 2+ HUD; ranking still computes a reason in Outcome 1 if cheap. |
| O-012 | Cursed results are **string-first**, then context. Table in `spells.json` `misfires`. Unrecognized dirty submit → `fizzle`. Same string → same misfire. | Pure random cursed; hash-to-content generator. | §14.3 | `ignis ventis` → disappointed goose. Works even if the expected prompt is another spell (force-cast). |

---

## D. Research Agenda — decision + prototype still required?

### §20.1 Blocking

| ID | Decision | Prototype still required? |
|---|---|---|
| R-001 | Desktop browser, speakers unknown, network may be off. Bundle clips if present. First keypress may unlock audio. Captions always. Volume is a rehearsal probe. | Yes — `P-AUDIO-ROOM` |
| R-002 | Intended voice: orion. Do not block the floor on clips. | Yes — `P-VOICE-AUDITION` when clips exist |
| R-003 | Pronunciations live on each root and spell. Clip generation must use them. | Yes — `P-PRONUNCIATION` at clip time |
| R-004 | Phrase bands: short ≤11, medium 12–16, long ≥17 (count spaces). TTI starts 8.0s, −0.5s per wave, floor 5.0s. | Yes — `P-TTI-FAIRNESS` |
| R-005 | Native `<input>` autofocus; refocus on blur/phase; canvas + HUD `pointer-events: none`; no click-to-cast / click-to-target / click-to-select-spell. IME via composition events (live). | **Yes, in flight in Outcome 1** — `P-FOCUS` |

### §20.2 Core design

| ID | Decision | Prototype still required? |
|---|---|---|
| R-101 | Teach by a huge still phrase, instant glyph states, Backspace. No tile game, no moving target. | Yes — `P-ERROR-RHYTHM` |
| R-102 | Unordered pairs + authored display + tags. One self-pair (`ignis ignis`) proves the rule. | No for v1 |
| R-103 | WPM adaptation off. No estimate, no oscillation. | No |
| R-104 | Reason chip 2–4 words, all-caps noun phrase (`BEST VS. ARMOR`). No score breakdown for players. | Yes — `P-REASON-TRUST` |
| R-105 | Active set size **10**. | Yes — `P-ROTATION-FEEL` |
| R-106 | Use spec priority order. Block last 3 line IDs. Ordinary success at most every 8s. One opening line per run. | Yes — `P-BARD-DENSITY` |
| R-107 | Underplayed serious delivery; sparse pauses. No stacked markup. | Same as `P-VOICE-AUDITION` |
| R-108 | Prompt contrast target ≥7:1. Errors: strike + deleatur mark + optional hue. `prefers-reduced-motion` = instant states. | Yes — `P-A11Y-CONTRAST` |
| R-109 | Autoplay will fail. First keypress unlocks. Never await audio in the machine. | Yes — `P-AUDIO-AUTOPLAY` |
| R-110 | No tutorial screen. Arrival is threat + phrase + optional one bard line. | Yes — `P-COMPREHENSION-5S` |

### §20.3 Content and balance

| Topic | Decision | Prototype? |
|---|---|---|
| Familiar vs flavor | Mix: `ignis`/`aqua`/`terra` readable; `glacies`/`fulgur`/`umbra` flavor. | No |
| Incantation collisions | One displayed prompt, so prefix races cannot commit a second spell. Distinct first words where possible. | No |
| Difficulty vs power | Longer + longer CD → higher `basePowerBand`. | `P-TTI-FAIRNESS` |
| Self-pairs | One: `ignis ignis`. | No |
| Canonical order | Authored string. Learnable because the HUD shows it. | No |
| Twelve roots | Glossary of 12; 10 playable pairs. Enough semantic coverage for six archetypes. | No |
| Misfire mix | One authored mixed-help goose; unrecognized = fizzle (waste, no hit). Panic at impact = fizzle + 1 hit. | `P-PANIC-FAIRNESS` |
| Bard rate | About 6–10 lines in a 90s run. | `P-BARD-DENSITY` |
| Repeat-run comedy | Callbacks + small pack; no new generator. | `P-BARD-DENSITY` |

### §20.4 Expansion research

All out of v1: multi-prompt, player loadouts, persistent Appendix, bosses, daily seeds, competitive modes, live bard, alt personalities, localization. No architecture hooks.

---

## E. §25 questions — CLOSED

### §25.1 Design judgment

| # | Decision |
|---|---|
| 1 | One recommendation is enough for v1 and for the identity floor. |
| 2 | Post-mastery agency is out of v1. Execution remains the skill. |
| 3 | The player cannot cast a non-recommended known spell as a valid cast. Typing other book text is dirty input (force → cursed or fizzle). |
| 4 | Root order is canonicalized. Advanced order-mode is out of v1. |
| 5 | Tactical explanation = one reason chip. No paragraph. |
| 6 | Power tracks phrase length and cooldown band (see spells). |
| 7 | Misfires: goose mixed-help; fizzle waste; panic = 1 hit. Correct casts stay strictly better. |
| 8 | Persistent cursed discovery is out of v1. In-run goose is enough. |
| 9 | Bard is emblem + italic rubric at the top. No 3D talking head. |
| 10 | `SPELLCHECK` is the v1 title. |

### §25.2 Prototype questions — decided, some still need a running game

| # | Decision | Prototype? |
|---|---|---|
| 1 | Auto-cast on final character. Enter is not confirm. | `P-AUTOCAST-FEEL` |
| 2 | Routine lines 6–14 words / 1.5–3s. | `P-LINE-LAG` when audio exists |
| 3 | 10 active spells. | `P-ROTATION-FEEL` |
| 4 | TTI 8.0 → 5.0 by 0.5s steps. | `P-TTI-FAIRNESS` |
| 5 | Reason chip on. | `P-REASON-TRUST` |
| 6 | WPM estimate unused. | No |
| 7 | Panic misfire at impact: yes, +1 hit. | `P-PANIC-FAIRNESS` |
| 8 | Orion intended. | `P-VOICE-AUDITION` |
| 9 | Duck music ~6 dB if music exists; 80 ms fade. | `P-AUDIO-ROOM` |
| 10 | Errors: strike + mark + optional orpiment. Outcome 1 already uses a non-color `data-status`. Keep that. | `P-ERROR-RHYTHM` |

### §25.3 Out of v1 (no hooks)

Monetization, persistence, social, matchmaking, marketplace, live moderation, localization pipeline.

---

## F. Frozen numbers

| Knob | Value | Notes |
|---|---|---|
| Active spells | 10 | `data/spells.json` |
| Roots | 12 | `data/roots.json` |
| Win | 6 threats | inside the mapped 5–7 |
| Lose | 3 unmitigated hits | SLICE: Outcome 2+ |
| Enemies on screen | 1 | |
| TTI start / step / min | 8.0 / 0.5 / 5.0 s | |
| CD short / mid / long | 4 / 8 / 12 s | |
| Phrase short / mid / long | ≤11 / 12–16 / ≥17 chars | includes the space |
| Resolve hold | **480 ms** | matches live `RESOLVE_MS` |
| Off-role knockback | 1.5 s | correct but wrong tag |
| Goose knockback | 2.5 s | 0 hits, no defeat |
| Restart | `R` or `Enter` on AFTERMATH / GAME_OVER | Escape on those phases also restarts (live) |
| Force-cast | `Enter` if `buffer.length > 0` and not exact | |
| Cancel | `Escape` during READY/TYPING | |
| Case | lowercase NFC; ignore Caps | |
| Space | one required between roots | |
| IME | composition does not lock; commit on `compositionend` | live |
| Desktop | v1 demo target | iOS / touch out of v1 |
| Persistence | none | restart clears the run |
| Live model | none | |

---

## G. Stack and HUD split (mapped — formalized)

| Topic | Frozen call |
|---|---|
| App | Vite + React. Live lockfile: vite ^7, react ^19, typescript ~5.9. |
| Store | **One reducer.** Live: `src/game/machine.ts` `reduce`. Do not add a second store. |
| HUD | DOM. Prompt, caret, errors, reason chip, bard rubric, real `<input>`. |
| Well | CSS in Outcome 1. R3F only as a clipped well **after** the HUD loop is observed. Canvas `pointer-events: none`. No drei `Html`/`Text` for the phrase. No OrbitControls. |
| Audio | Never awaited. Subtitle always. |
| Ranking | Tiny rules (below). Not an LLM. Not the full §10.2 list. WPM off. |

### Ranking rules (deterministic)

Eligible = in the active book and not yet `SPENT` in this run.

1. Forced opening: wave 1 → `ignis_ventus`.
2. If threat has `armored` → `glacies_fractura` if eligible.
3. If `charging` or `approaching` → shortest eligible among `{fulgur_ventus, terra_ordo}`.
4. If `swarm` → `lumen_aqua` if eligible else `ignis_ventus`.
5. If `fire` and not fleshy-only → `aqua_glacies` if eligible.
6. If `elite` or `wounded` → `umbra_mors` if eligible.
7. Else shortest eligible; tie-break by `id` ascending.
8. Never recommend an ineligible spell.
9. Equivalent state → equivalent pick (`AC-REC-004`).

---

## H. Conflicts resolved

| Tension | Pick |
|---|---|
| D-013 voice vs §22.1 text bard | Text + subtitle is the floor. Clips attach. Play never waits. |
| D-106 WPM vs identity floor | WPM off. |
| Pitch “learns how fast you type” vs v1 | Pitch may mention the concept; v1 does not estimate. |
| Spec GAME_OVER vs live AFTERMATH | Keep live phase name `AFTERMATH`. Outcome 2+ adds `runResult: won \| lost` (or a `GAME_OVER` phase) without renaming Outcome 1’s union until that slice. |
| Backspace to empty | Empty buffer returns to READY and may rerank (`AC-TYPE-004` still glued). |
| Reason chip vs clutter | Chip on, 2–4 words. |
| Art-director hex vs live CSS | **Live `src/index.css` tokens win** for the page. Do not restyle Outcome 1 to match unused hex. |
| useReducer vs zustand | Live reducer wins. Zustand is not required. |
| Outcome 1 `castsThisRun` blocks a second auto-cast | Slice constraint for the one-cast proof. Outcome 2+ removes the cap. |

---

## I. Risk register (F-*) — v1 treatment

F-001 recs respond to tags + CD. F-002 no mouse required. F-003 lock on commit. F-004 book is 10, not 78. F-005 limited book. F-006 tag-specific picks + CD. F-007 WPM off. F-008 goose mixed, weaker than a clean cast. F-009 event-keyed lines. F-010 D-011 filter. F-011 priority + drop stale. F-012 no routine rhyme. F-013 dictionary. F-014 subtitle fallback. F-015 10 curated spells. F-016 prompt band sacred; canvas behind. F-017 authored opening + `ignis ventis`. F-018 Outcome 1 HUD first; this pack does not start a second app.
