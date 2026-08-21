# Input and UX

Live behavior in `src/App.tsx` + `src/game/machine.ts` is the v1 input contract. Formalized here so Outcome 2+ does not invent a second scheme.

---

## Focus protocol (R-005 / P-FOCUS)

1. Native `<input>` is the caster. `autoFocus`. Outcome 1 class: `.caster`.
2. Refocus on phase change (`useEffect` → `inputRef.current?.focus()`).
3. `onBlur` during READY/TYPING → `requestAnimationFrame` refocus. That is silent recovery, not a click-to-play control.
4. Canvas, well, threat meshes, cooldown strip, and HUD: `pointer-events: none`. No click-to-cast, click-to-target, or click-to-select-spell. A page click must not cast, confirm, or pick anything. Prefer: click does nothing and `#caster` never loses focus (`mousedown` / `pointerdown` `preventDefault`). If a click does anything, it may only silently restore `#caster` focus. It must not be required after a cast (§24).
5. After restart, focus is already in the caster.
6. Do not disable the input on AFTERMATH if R/Enter are window listeners (Outcome 1 disables the input on AFTERMATH and listens on `window` — that is legal).
7. `Tab` during play: `preventDefault`. Stay in the caster.

Failure: any expected mid-run “click the page to type.” Any click path that casts, confirms, or selects.

---

## Keys

| Key | READY | TYPING | RESOLVING | AFTERMATH / GAME_OVER |
|---|---|---|---|---|
| `[a-z ]` | commit / type | type | buffer (apply on next READY) | ignore (except R) |
| Backspace | n/a | delete; empty → READY | edits held buffer | ignore |
| Enter | no-op if empty; force if dirty | force if dirty and not exact | ignore | **restart** |
| Escape | no-op | clear → READY | ignore | **restart** (live) |
| R / r | letter `r` | letter `r` | ignore | **restart** |
| Tab | stay put | stay put | stay put | stay put |

Auto-cast: when `buffer === expected`, dispatch resolve **once**.

Force-cast: Enter only if `buffer.length > 0` and `buffer !== expected`. Outcome 1 fizzles and returns to READY. Outcome 2+ runs the misfire table (goose / fizzle) then RESOLVING.

Cancel: Escape clears buffer and lock.

---

## Normalization

- Lowercase + NFC.
- Incantations are `[a-z]` plus one space.
- Caps Lock does not create a different spell.
- Extra characters outside the set are ignored once Outcome 2+ filters them; Outcome 1 currently forwards the input value — keep Latin-only prompts so this cannot drift.

---

## IME / composition

Live: `composingRef`. `onCompositionStart` skips `TYPE`. `onCompositionEnd` commits the value.

Lock (`promptLocked`) happens on the first **committed** character, not on composition start (`D-004`, `§11.5`). Desktop Latin is the demo assumption. iOS / mobile IME is out of v1.

---

## HUD hierarchy (`§17.2`)

1. Exact incantation.
2. Live glyphs (pending / correct / incorrect).
3. Threat + urgency (well + bar / TTI numeral).
4. Reason chip (2–4 words, small caps). Outcome 2+.
5. Cooldown seals.
6. Bard rubric.
7. Hits remaining / score — whispered corners.

One screen. No spellbook during combat. Subtitles never cover the phrase.

### Reason chip copy

All-caps noun phrase. Legal labels: `BEST VS. FLESH`, `BEST VS. ARMOR`, `AREA COUNTER`, `INTERRUPT READY`, `FASTEST SAFE CAST`, `LETHAL`, `QUENCH FIRE`, `HOLD THE LINE`. No tutorial sentence.

---

## Feedback

- Correct / incorrect via `data-status` on glyphs (already live). Add a strike or deleatur so hue is not the only channel (`AC-TYPE-002`).
- Prompt does not move while locked.
- Cast connects completion to the well (`threatStruck` is the Outcome 1 signal).
- Misfire treatment ≠ clean cast (goose intrusion vs ember slough).
- Reduced motion: skip pulses and well animation; keep glyph states.

---

## Accessibility

High contrast ink on vellum. Captions persist. Reduced-motion respected. Difficulty is phrase + TTI, not an unreadable face (`§11.4`). Accommodations are not framed as failure — WPM is off, so the game will not “helpfully” shorten prompts mid-run.

---

## Restart

AFTERMATH (and GAME_OVER): `R` or `Enter` or Escape → `createInitialState()`. Immediate. No click. Outcome 1 copy: “Press R to begin again.”
