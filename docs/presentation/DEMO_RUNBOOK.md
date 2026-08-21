# SPELLCHECK demo runbook

Target: **65 seconds**, keyboard only, deterministic win path.

Production preview on this machine: `http://127.0.0.1:4173/`

Dev fallback: `http://127.0.0.1:5174/`

Public URL: unavailable; Netlify is not logged in and ngrok has no configuration file.

## Exact presentation

Do not load the page until the presenter is ready. The first threat clock starts immediately.

### 00:00–00:04 — Cold open and first cast

Screen: the continuous Lexicon Frontier, traveling four-legged Scriptorium, mage, bard, approaching Ember wisp, and the large `ignis ventus` cue with `BEST VS. FLESH`.

Say:

> “The battle chooses the spell. My hands still have to perform it.”

Keys: type `ignis ventus` exactly. Do **not** press Enter; exact completion auto-casts.

Check:

- The input was focused without a click.
- The Ember wisp visibly yields and a scorch mark appears.
- The cast cue is emitted; the room should hear the cast earcon if audio is working.
- Subtitle: “A proper spell. I may yet keep my contract.”

### 00:04–00:07 — Spent spell and tactical rerank

Say:

> “The cast changes the world. Fire is spent; armor reranks us to ice.”

Check:

- Prompt changes to `glacies fractura`.
- Reason chip reads `BEST VS. ARMOR`.
- Availability strip reads `SPENT · ignis ventus`.
- The threat is now the Plated sentinel.

### 00:07–00:10 — Authored typo and Honk

Say:

> “Now I insist on the wrong spelling.”

Keys: type `ignis ventis`, then press `Enter`.

Stop speaking and let the beat land.

Check:

- A white goose walks into the world.
- Label: `The Mildly Disappointed Goose`.
- Subtitle: “You requested wind. The universe heard goose.”
- The engine emits the two-note Honk cue.
- The prompt remains `glacies fractura`; the goose does not defeat the sentinel.

### 00:10–00:12 — Recovery

Say:

> “The bard remembers what happened—and notices the recovery.”

Keys: type `glacies fractura` exactly; no Enter.

Check:

- The sentinel visibly yields.
- Subtitle: “Competence has arrived. Fashionably late, but welcome.”

### 00:12–00:28 — Continue to the deterministic win

Say:

> “Now I follow the grimoire’s changing route to a clean finish.”

Type each visible phrase exactly after the next page appears; none needs Enter:

1. `lumen aqua` — `AREA COUNTER`
2. `fulgur ventus` — `INTERRUPT READY`
3. `aqua glacies` — `QUENCH FIRE`
4. `umbra mors` — `LETHAL`

Check at approximately 00:28:

- Banner: `THE LINE HELD`.
- Subtitle: “You have prevailed. I shall revise my earlier notes.”

### 00:28–00:58 — Pitch over the stable win screen

Deliver the 30-second pitch from `PITCH.md`. End with this required, accurate agent-leverage sentence:

> “Agents authored and validated the spell corpus, deterministic ranker, and event-aware bard, plus a bundled local voice pack with browser fallback; this build needs no runtime model.”

### 00:58–01:05 — Restart and close

Keys: press `R`.

Check:

- `ignis ventus` returns.
- Cooldowns, hits, and buffer are clear.
- The hidden caster is focused without a click.

Say the one-sentence close from `PITCH.md`, then stop. Keep this final beat under seven seconds because the restarted eight-second threat clock is live.

## Exact key sequence

```text
ignis ventus
ignis ventis
Enter
glacies fractura
lumen aqua
fulgur ventus
aqua glacies
umbra mors
R
```

Only the deliberate corrupted cast uses Enter. Correct phrases auto-cast.

## Rehearsal evidence

Environment: Google Chrome at 1440×900, clean browser context per run, no mouse events.

- Run 1: 60.07 seconds. First cast 4.36s; rerank 5.22s; goose 7.91s; recovery 11.26s; win 27.91s; restart focus 51.99s.
- Run 2: 58.85 seconds with every non-local request blocked. First cast 3.60s; rerank 4.38s; goose 6.99s; recovery 10.25s; win 26.83s; restart focus 50.85s.
- Revised-close run: 59.24 seconds. Win 27.55s; `R` at 58.04s; at 59.24s the fresh run remained `READY`, at zero hits, with `#caster` focused.

Observed in all successful runs:

- Cold load began in `READY` with `#caster` focused and `ignis ventus` immediately visible.
- World and canvas wrapper computed `pointer-events: none`; casting was keyboard-driven.
- First cast set the visible threat reaction and reranked to `glacies fractura / BEST VS. ARMOR`.
- `ignis ventis` + Enter deterministically selected `disappointed_goose` and `goose_01`.
- The next clean cast deterministically selected `recover_01`.
- Six clean casts reached `win_01`; `R` restored the opening state and focus.
- The full win route completed while non-local requests were blocked. No runtime model or required network call was observed.

Audio evidence is engine and file evidence, not room-listen evidence. The rehearsal browser launched with `--mute-audio`, so no claim is made that sound was heard. Nine local ElevenLabs MP3s using provisional Brian pass manifest/decode checks; runtime order is generated clip → device `SpeechSynthesis` → subtitle. The DOM reported `AudioContext=running`, plus `data-audio=cast` on the first cast and `data-audio=goose` on the misfire; subtitles remained visible. A human must still perform the room-listen and final voice-selection checks.

Useful captures:

- `artifacts/demo/01-cold-open.png`
- `artifacts/demo/02-first-cast.png`
- `artifacts/demo/03-cooldown-rerank.png`
- `artifacts/demo/04-goose-misfire.png`
- `artifacts/demo/05-recovery.png`
- `artifacts/demo/06-win.png`
- `artifacts/demo/07-restart.png`

## Failure fallbacks

### Wrong text before Enter

Press `Escape` once to clear the buffer, then type the visible prompt. If the fizzle already resolved, wait for `READY` and continue. Do not click the page.

### Goose does not appear

Confirm the exact string is `ignis ventis`, with the final word ending in `is`, then press Enter. The authored trigger is deterministic and can be retried while the current prompt remains visible.

### Audio is absent or unintelligible

Continue without pausing. Point to or read the subtitle; audio is not required for state progression. Do not troubleshoot the voice on stage.

### WebGL/canvas fails

Switch to a pre-opened backup tab at `http://127.0.0.1:4173/?flat=1`. The same keyboard loop, reasons, goose, bard subtitles, ending, and restart remain available in the CSS fallback.

### Win route becomes unsafe

Type the phrase currently visible rather than relying on memory. If recovery is no longer practical, press `Escape` to clear any partial buffer and stop typing. Three empty impacts produce the reliable lose ending in about 25.5 seconds:

- Banner: `THE LINE BROKE`.
- Guaranteed defeat subtitle, normally “Here fell our hero: brave, bold, and one vowel short.”
- Press `R` to prove clean restart and focus.

### Server URL changes

Use `http://127.0.0.1:4173/` for the built production preview. If it is unavailable, use the Vite dev URL; on this machine port 5173 is occupied and Vite selected `http://127.0.0.1:5174/`.

## Current source verification gate

The source-of-truth `aqua_glacies` count is 12, matching `aqua glacies`; the startup corpus audit now also rejects future character-count and typing-band drift. Fresh unit/audio, build, browser, and cold-start rehearsal evidence is recorded in `docs/CHECKPOINT.md`.

## Room setup checklist

- Start or confirm the production preview and dev fallback before presenting; do not launch duplicates.
- Open the clean primary URL and pre-open `?flat=1` as a backup tab.
- Use Chrome, 100% zoom, full-screen presentation, and at least 1280×720.
- Put the mouse pointer at a screen edge before the demo; do not use it during play.
- Confirm speakers or the venue output are selected, unmuted, and at a safe level.
- Perform one human room-listen: first-key unlock, cast earcon, Honk, bard voice, and subtitle timing.
- The provisional voice is bundled ElevenLabs Brian, with device `SpeechSynthesis` and subtitle fallbacks; judge voice choice and intelligibility on the actual room system.
- Confirm `ignis ventus` is readable within five seconds from the audience distance.
- Rehearse the exact typo ending: `ventis`, then Enter.
- Do not speak over the goose line or the victory line.
- Keep the 30-second pitch on the stable win screen.
- Press `R` only for the final restart beat; finish the close before the new eight-second threat arrives.
- Keep the seven captured PNGs available as a static backup.
