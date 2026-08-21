# SPELLCHECK presentation checklist

## Before the room opens

- [ ] Use Chrome at **100% zoom**, full screen, at **1280×720 or larger**.
- [ ] Close extra tabs, notifications, and apps that may steal keyboard focus or audio.
- [ ] Select and test the room speakers/output at a safe level.
- [ ] Choose among the three bundled ElevenLabs auditions. **Brian is provisional** until a human listens; do not describe him as final without that choice.
- [ ] Confirm the production preview is HTTP 200: `http://127.0.0.1:4173/`.
- [ ] Keep the dev fallback available: `http://127.0.0.1:5174/`.
- [ ] Keep the flat fallback pre-opened: `http://127.0.0.1:4173/?flat=1`.
- [ ] Public URL: **unavailable** until Netlify login or an ngrok config is provided.

## Immediately before presenting

- [ ] Hard reload the production preview, then do not click the stage.
- [ ] Confirm `ignis ventus` is visible and the hidden caster has focus.
- [ ] Press the first gameplay key to unlock local audio; confirm cast, Honk, bard, and subtitles on the actual room output.
- [ ] Keep the mouse pointer at a screen edge.

## 65-second route

- [ ] `ignis ventus` — auto-cast; no Enter.
- [ ] Confirm `SPENT · ignis ventus` and `glacies fractura / BEST VS. ARMOR`.
- [ ] `ignis ventis`, then `Enter` — authored goose.
- [ ] `glacies fractura`
- [ ] `lumen aqua`
- [ ] `fulgur ventus`
- [ ] `aqua glacies`
- [ ] `umbra mors`
- [ ] Deliver the pitch on `THE LINE HELD`.
- [ ] Press `R`; confirm opening prompt, empty spent list, and keyboard focus.

## Stage fallbacks

- [ ] WebGL trouble: switch to the pre-opened `?flat=1` tab.
- [ ] Wrong partial text: press `Escape`, then type the visible prompt.
- [ ] Unsafe win route: stop typing; three empty impacts produce `THE LINE BROKE`, then press `R`.
- [ ] Missing audio: continue with the visible subtitle; do not troubleshoot on stage.
- [ ] Keep `artifacts/presentation-final/` available for cold, cast/rerank, goose, win, and ending stills.

