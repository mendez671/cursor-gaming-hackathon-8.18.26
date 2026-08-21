# SPELLCHECK checkpoint

## What we are trying to prove now

The identity loop still plays on a **presentable 3D Lexicon Frontier**, not a cube well or a keyframe wallpaper. DOM owns the readable Latin prompt. Canvas is the world. **Fail-closed well.**

## Scope tier

Identity floor + one authored route. Ranking, bard, and corpus stay frozen. World lives in `src/world/**`.

## How to hear it

1. Speakers or headphones on. `npm run dev` → `http://127.0.0.1:5174/`.
2. Do not click. The first keypress unlocks `AudioContext` and local clip playback (no “click to enable audio”).
3. Type `ignis ventus`. Soft throttled ticks, a short cast sting, then the bard (140 ms later). Opening line is queued until the first key; success will not cut it off.
4. After the page turns: `ignis ventis` + Enter. Honk, 180 ms, then the goose line. Repeat typo gets `typo_repeat_*` and interrupts routine.
5. Stage flags: `data-audio`, `data-audio-line`, `data-audio-pending`, `data-audio-unlocked`, `data-audio-ctx`. Subtitles stay if voice fails.

This agent / Playwright headless session is **speaker-mute** (`--mute-audio`). Nine bundled ElevenLabs MP3s using provisional Brian passed manifest, decode, duration, and secret-leak checks. Runtime order is generated clip → device `SpeechSynthesis` → subtitle. `P-AUDIO-ROOM` and final voice selection remain human evidence.

## How to see the world

1. `npm run dev` → `http://127.0.0.1:5174/` (this machine; 5173 was taken).
2. Do not click. `#caster` is focused. Three-quarter golden-hour view: four-legged Scriptorium, mage at a podium, quill-lute bard, ink-sprite threat, rune arc, cream HUD with `ignis ventus`.
3. Type `ignis ventus`. The ink mass flattens. A scorch scar sits on the nearby road. Fire becomes `SPENT`; prompt becomes `glacies fractura` (golem wave).
4. Restart if needed, then `ignis ventis` + Enter: a white goose (Honk + pendant) walks onto the path. Phrase does not move.
5. `?flat=1` (or no WebGL): same loop, CSS wyrm + threat bar, no canvas.

`prefers-reduced-motion: reduce` freezes walk, bob, and scroll. The DOM TTI numeral still ticks.

## Presentation release recheck — 2026-08-18 20:31 PDT

**Disposition:** **Conditionally supported.** The current working tree is locally presentable from the built production preview. Public hosting remains unsupported because both available authentication paths are unavailable. Human room/audio/usability checks remain conditions.

**Exact command evidence:**

- `npm run build` → exit 0; TypeScript completed, Vite transformed 65 modules, and emitted `index-RmqLV_dV.css` plus `index-C3bL22ON.js`. The 1.18 MB chunk warning remains non-blocking for this showcase.
- `npm test` → 33 tests in 11 suites: 33 pass, 0 fail, 0 skipped.
- `npx playwright test --list` → 19 tests in 2 files. The unchanged suite first encountered a process-sandbox Chrome-launch denial before any test body ran; rerunning outside that sandbox produced 19 pass, 0 fail, 0 skipped in 27.9 s.
- `SPELLCHECK_URL=http://127.0.0.1:4173 npx playwright test --list` → 19 tests in 2 files. `SPELLCHECK_URL=http://127.0.0.1:4173 npx playwright test` → 19 pass, 0 fail, 0 skipped in 26.0 s against the built preview.
- Dev `http://127.0.0.1:5174/` → HTTP 200. Production preview `http://127.0.0.1:4173/` → HTTP 200. Existing server processes were reused; no duplicate was launched.
- Public asset sweep against the production preview → 26/26 HTTP success with expected MIME: 12 MP3 (9 final bard clips + 3 auditions), 2 JSON, 1 ICO, 1 SVG, 5 WOFF2, 3 PNG, and 2 text licenses. The nine final clips were each `generated`, non-zero duration, HTTP 200, and `audio/mpeg`.
- `.env` is ignored, untracked, absent from `dist`, and its `ELEVENLABS_API_KEY` value had 0 matches across 76 scanned files in `src`, `public`, and `dist`. Source/public/dist credential-name review found provider metadata only; the unit secret-leak test also passed.
- `npx --yes netlify-cli status` → “Not logged in.” No interactive login was opened. One ngrok fallback check → `~/Library/Application Support/ngrok/ngrok.yml` does not exist. No public deployment or URL is claimed.

**Production-preview browser evidence:**

- The 19-test suite exercised cold no-click focus, prompt lock, exact-once cast, cooldown rerank, goose, recovery, win/restart, lose/restart, Caps Lock/Backspace, no click-to-cast, flat fallback, subtitle/audio failure fallback, and non-local request blocking.
- `scripts/final-qa.mjs` against `4173` recorded 0 console errors, 0 page errors, 0 failed requests, 0 HTTP error responses, 0 audio MIME mismatches, and 0 remote requests.
- 1280×720 and 1440×900 states were observed. Final evidence is `artifacts/presentation-final/evidence.json`; captures include `01-cold-1280x720.png`, `02-clean-cast.png`, `03-rerank.png`, `04-goose.png`, `05-win.png`, `06-cold-1440x900.png`, and `07-lose.png`.
- Debug flags observed local sequencing: first gameplay key changed audio unlock to `true`; clean cast recorded `data-audio=cast` with `AudioContext=running`; goose recorded `data-audio=goose` and `goose_01`; recovery selected `recover_01`; win selected `win_01`. This is engine/file evidence, not physical audibility.
- Four `THREE.Clock` deprecation warnings remain. Source contains no `Clock` use, so the warning originates in the rendering dependency and has no local low-risk replacement. One non-visible preload timing warning for the bundled 600-weight font was also recorded. Neither produced an error, failed request, or visible gameplay failure.

**Release configuration:**

- `playwright.config.ts` now accepts `SPELLCHECK_URL`, allowing the same 19-test suite to target dev or production preview.
- `scripts/final-qa.mjs` now accepts `SPELLCHECK_OUTPUT_DIR` for final evidence placement.
- `npm run preflight` runs the build and 33-test unit gate; long browser tests remain explicit.
- Operator handoff: `docs/presentation/PRESENTATION_CHECKLIST.md`. Primary local URL is production preview `4173`; dev `5174` and preview `4173/?flat=1` are fallbacks.

**Human-only conditions:** `P-AUDIO-ROOM`, `P-VOICE-AUDITION` (Brian remains provisional), `P-COMPREHENSION-5S`, `P-A11Y-CONTRAST`, `P-TTI-FAIRNESS`, and `P-AUTOCAST-FEEL`.

**RED-IF / STOP:** build or test failure; discovery below 19 or an unexplained skip; focus, prompt-lock, or double-cast regression; broken win/lose/restart; missing audio or leaked secret; a remote critical dependency; failed preview load or target viewport; any failed human condition; or a public deploy claimed without a verified URL.

## Final independent release gate — 2026-08-18

**Disposition:** **Conditionally supported.** No code release blocker or regression was observed in the exact working tree. The conditions are the human sensory/usability checks named below; headless automation cannot establish room audibility, first-player comprehension, perceived fairness, or feel.

**Fresh command evidence:**

- `npm run build` → exit 0; TypeScript completed, Vite transformed 65 modules, and emitted `index-RmqLV_dV.css` plus `index-C3bL22ON.js`. The 1.18 MB JS chunk warning is non-blocking for this local showcase.
- `npm test` → 33 tests, 11 suites, 33 pass, 0 fail, 0 skipped.
- `npx playwright test --list` → 19 tests in 2 files. `npx playwright test` → 19 pass, 0 fail, 0 skipped, 27.8 s.
- `npx playwright test test/ux.spec.ts --list` → 16 UX tests. `npx playwright test test/audio.spec.ts --list` → 3 audio tests. This is the 16-versus-19 explanation: 16 was the UX file only; the complete configured suite is 16 UX + 3 audio. The earlier 18-test report captured the file before the Caps Lock test landed.
- `curl ... http://127.0.0.1:5174/` → HTTP 200 at the actual dev URL. `git check-ignore -v .env` → `.gitignore:4:.env`.
- `node scripts/final-qa.mjs` → exit 0 against the same URL. Current evidence is `artifacts/final-qa/release/evidence.json`; current captures are `01-cold-1280x720.png` through `07-lose.png` in that directory.
- Local manifest URL sweep → 9/9 bard clip URLs returned HTTP success with `audio/mpeg`.

**Observed browser paths:**

- 1280×720 and 1440×900 cold starts both focused `#caster` without a click, showed `ignis ventus`, and rendered the Frontier canvas with `pointer-events: none`.
- `ignis ventus` auto-cast once, visibly struck the ember threat, marked `SPENT · ignis ventus`, and reranked to `glacies fractura` / `BEST VS. ARMOR`.
- `ignis ventis` + Enter deterministically produced the goose and `goose_01`; the next clean cast produced `recover_01`; six clean waves produced `THE LINE HELD`; `R` restored the opening, empty spent list, unlocked prompt, and focus.
- Three impacts produced `THE LINE BROKE` with `lose_01`; `R` restored the opening state and focus.
- Caps Lock normalized `IGNX` to `ignx`, retained visible incorrect-glyph feedback, survived Backspace repair, and uppercase completion cast. Mid-word tests held the prompt while TTI continued.
- Forced canvas/stage clicks neither cast nor selected a target. Source search found no click/pointer gameplay handler, WASD binding, `KeyboardControls`, or `OrbitControls`; `WorldLayer` disables the R3F event manager and the canvas pointer surface.
- Runtime audio resources included the local manifest and local MP3 clips. Director tests establish clip first, browser `SpeechSynthesis` on clip absence/failure, and subtitle/state progression when speech throws. This does not establish audible room output.
- `?flat=1` remained playable without a canvas. Reduced-motion emulation retained a stable committed prompt. The run resized from 1280×720 to 1440×900; file dimensions match both requested viewports.
- Release rehearsal recorded 0 console errors, 0 page errors, 0 failed requests, 0 HTTP error responses, 0 audio MIME mismatches, and 0 remote HTTP(S) requests. It recorded four instances of the known non-blocking `THREE.Clock` deprecation warning.
- The post-build integrity suite found the live `.env` credential absent from `src`, `public`, and `dist`; the critical browser path made no remote request.

**Claim record:**

- **MECHANISM:** `src/game/machine.ts` decides phase, lock, cast, impact, win/lose, and restart; `src/game/rank.ts` excludes spent spells; `src/App.tsx` normalizes/focuses input; `src/audio/director.ts` and `src/audio/browser.ts` decide clip/fallback order; `src/world/WorldLayer.tsx` disables pointer events and selects canvas/flat mode. Browser state flags, requests, screenshots, and the fresh test outputs above exercise those mechanisms.
- **DENOM-SRC:** Playwright discovery comes from `playwright.config.ts` plus `npx playwright test --list` (19 = 16 UX + 3 audio); clip count comes from `public/audio/bard/manifest.json` (9); unit totals come from Node's test runner output (33); viewport dimensions come from the generated PNG metadata.
- **RED-IF:** Treat this disposition as unsupported if the full discovery count drops below 19 or reports a skip without explanation; any keyboard path loses focus/locks to a changed prompt/casts twice; a spent spell becomes eligible; three impacts do not end the run; canvas events become active; a critical remote request appears; a clip URL or fallback blocks state progression; the target browser cannot render either canvas or flat mode; or any named human check below fails.

## Main implementation files

- `src/world/kit.ts` — typed spell-family materials, painterly palette, sky shader, shared geometry, curved route ribbon
- `src/world/art.tsx` — overhauled Scriptorium, mage, bard, bestiary, glyphs, archive and route props
- `src/world/StorybookFrontier.tsx` — authored composition, travel, gait, cast/impact, bounded world memory, Honk and damped camera
- `src/world/Frontier.tsx` / `src/world/cast.tsx` — retained legacy assemblies; runtime now uses `StorybookFrontier`
- `src/world/WorldLayer.tsx` — dead events, `pointer-events: none`
- `src/world/tex.tsx` — small procedural wood, stone, meadow, parchment, grimoire and banner paint maps
- `public/ref/*.png` — character sheet, keyframe, bestiary
- `docs/ready/11-world-slice.md` — what the browser shows vs cubes

Audio owns `src/audio/**` and a listener hook in `src/App.tsx`. `src/game/machine.ts` and `src/well/**` were not rewritten for sound.

## Files this slice (audio)

- `src/audio/director.ts` — priority queue, delays, dedupe, restart
- `src/audio/browser.ts` — clip→speech fallback, quieter earcons, no bed
- `src/audio/speech.ts` — tag strip + deterministic voice pick
- `src/App.tsx` — unlock/reset + `data-audio-line` / `data-audio-pending`
- `test/audio.test.mjs`, `test/audio.spec.ts`

Integration finish:

- `src/App.tsx`, `src/game/content.ts`, `src/game/machine.ts` — uppercase/NFC caster normalization and truthful `SPENT` HUD
- `src/game/bookAudit.ts`, `docs/ready/data/spells.json` — measured character-count and typing-band enforcement
- `test/game.test.mjs`, `test/ux.spec.ts` — Caps Lock, Backspace, error, cast, and `SPENT` regressions
- `docs/presentation/DEMO_RUNBOOK.md`, `docs/presentation/PITCH.md` — preserved 65-second route with current bundled-audio truth

## Decisions frozen

- DOM owns HUD. Canvas never hosts the prompt.
- `useFrame` reads a view ref. It does not own phase.
- WebGL fail / `?flat=1` → current threat bar + wyrm.
- No OrbitControls, no drei Html/Text, no KeyboardControls, no GLTF.
- Concept boards are visual targets, not background cards or scene geometry.

## Blocker

No code release blocker was observed on this machine. The only remaining release conditions are the named human checks below.

## Next right move

Human-only probes:

- `P-AUDIO-ROOM`: confirm clip playback and intelligibility on the actual demo device, speakers/headphones, and room.
- `P-VOICE-AUDITION`: choose Brian, Lily, or George by listening; Brian remains provisional.
- `P-COMPREHENSION-5S`: confirm a first-time player identifies the prompt within about five seconds.
- `P-A11Y-CONTRAST`: inspect the complete presentation on the target physical display, not only computed text contrast.
- `P-TTI-FAIRNESS`: confirm the first 8-second threat window is fair for the intended player.
- `P-AUTOCAST-FEEL`: confirm final-character auto-cast feels intentional in human play.

## Remaining roughness (not player-stuck)

- Assemblies remain authored procedural meshes rather than sculpted/rigged glTF; silhouettes carry more detail than surface topology.
- Monolith **A** can still read as a chevron at some camera scales.
- The archive uses modular towers, arches, bridges and a portal ring rather than a uniquely carved hero asset.
- Terrain paint is intentionally low-frequency and procedural; close inspection still reveals repeated paver and foliage geometry.
- First-wave 8 s is still tight if the player reads the bard line first.
- Brian is provisional until a human room listen selects among the three generated auditions. No lute/parchment stinger clips.
- R3F/Three emits a non-blocking `THREE.Clock` deprecation warning on canvas initialization; no uncaught console error occurs.

## Must not reopen without evidence

D-001–D-015. Ranking, bard pack, 10-spell book. DEFERRED: accounts, persistence, live model, 78-spell matrix, WPM, additional voice variations.
