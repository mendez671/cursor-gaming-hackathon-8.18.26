# Audio production

Identity floor is still **text + subtitle** (`O-008`, `D-108` OVERRIDE, `D-013`, `D-014`). The reducer never waits on sound. Nine ElevenLabs clips are bundled locally; browser speech remains the fallback. No provider credential or network call enters the client.

Canonical source: `data/audio-manifest.json`. Generated-pack status: `../../public/audio/bard/manifest.json`. `binariesShipped: true`; combat still proceeds if every speaker on earth is unplugged.

---

## What a player hears now

Wired in `src/audio/**`, subscribed from `App.tsx`. **Not** inside `src/game/machine.ts`.

| Layer | What fires | Audible? |
|---|---|---|
| Italic rubric + subtitle | Always, from `bard-lines.json` | On screen. Source of truth. |
| First keypress unlock | `AudioContext.resume()`; permits bundled media playback and the speech fallback | No click-to-enable tutorial. |
| Bard voice | One playing + one pending. Higher priority interrupts; stale low-priority drops. Bundled clip first; browser voice speaks the clean subtitle on failure | Yes |
| Correct glyph | 760 Hz sine, gain 0.01, ≥95 ms apart | Yes, very soft; not a typewriter |
| Incorrect glyph | Soft triangle/sine pair (196 + 233 Hz) | Yes, clear, not harsh |
| Exact cast | Short family blip, then bard after **140 ms** | Yes |
| Goose / `ignis ventis` | Two-note honk, then bard after **180 ms** | Yes, comic, not a jump scare |
| Threat close-in | Quiet sting once per threat/wave when TTI ≤ 20% | Yes, once; resets on restart |
| Travel / page bed | Removed (oscillator drone was fatiguing) | **Off** |
| Bundled `public/audio/bard/*.mp3` | Tried first; 404/decode → speech once | **Nine files shipped** |
| Lute pluck / parchment scratch | Spec §16.6 | **Missing** |
| Human voice bake | ElevenLabs Brian provisional; Lily and George auditions retained | **Shipped; listening gate remains** |

Current runtime chain: **clip (`/audio/bard/<lineId>.mp3`) → SpeechSynthesis → subtitle**. A thrown `speak()`, a rejected `play()`, or a muted tab is not a combat error (`AC-BARD-007`, `F-014`). `cancel()` runs only on priority interrupt or restart.

Mute still shows the line (`AC-BARD-006` falsifier is a missing subtitle, not missing sound).

Headless / this agent environment: Playwright Chrome launches with `--mute-audio`. Speakers here cannot be trusted. Browser and pack evidence on `http://127.0.0.1:5174/?flat=1`:

- All nine manifest rows are `generated`; integrity tests decode the local MP3s and verify the ElevenLabs manifest.
- After `ignis ventus`: `data-audio=cast`, `data-audio-ctx=running`, subtitle `success_01`; the generated clip is attempted before device speech.
- After `ignis ventis`+Enter: `data-audio=goose`, `data-audio-ctx=running`, subtitle `goose_01`; the same clip-first fallback chain applies.

---

## How to hear it (human, speakers on)

1. `npm run dev` → Local URL (this machine: `http://127.0.0.1:5174/`).
2. Do **not** click. Type. The first key unlocks audio.
3. `ignis ventus` — ticks, then a cast sting, then the bard: “A proper spell…”
4. After the page turns: `ignis ventis` + Enter — honk, then “You requested wind. The universe heard goose.”
5. Stage debug: `data-audio`, `data-audio-line`, `data-audio-pending`, `data-audio-unlocked`, `data-audio-ctx`. No in-game `M` mute (M is a letter). Use OS/tab mute.

---

## Floor vs juice

| Layer | Role | May fail |
|---|---|---|
| Italic rubric + subtitle | Identity floor. Always. `D-110`, `bard-lines.json` `subtitleAlways` | No |
| Bundled clip (`public/audio/bard/*.mp3`) | Milestone C juice. Brian provisional pending human audition (`D-109`, `O-008`) | Yes — **shipped** |
| `speechSynthesis` | Garnish after a missing clip | Yes |
| Procedural earcons | Presentation juice until wav/mp3 exist | Yes |
| Subtitle only | Required last stop | — |

---

## Flagship vs later

Nine flagship IDs. Spec `D-108` asked for 25–40 clips; v1 overrides that. Variations stay text until a listening test says otherwise.

**Flagship** (in `data/audio-manifest.json`) — all nine files generated:

| lineId | Beat | requiredForDemo | suggestedFile | Heard now |
|---|---|---|---|---|
| `open_01` | Arrival | yes | `public/audio/bard/open_01.mp3` | Bundled clip |
| `success_01` | Clean cast | no | `public/audio/bard/success_01.mp3` | Bundled clip |
| `typo_first_01` | First miss | no | `public/audio/bard/typo_first_01.mp3` | Bundled clip |
| `typo_repeat_01` | Callback | no | `public/audio/bard/typo_repeat_01.mp3` | Bundled clip |
| `goose_01` | Goose | yes | `public/audio/bard/goose_01.mp3` | Honk + bundled clip |
| `panic_01` | Impact fizzle | no | `public/audio/bard/panic_01.mp3` | Bundled clip if the line picks |
| `recover_01` | After goose | yes | `public/audio/bard/recover_01.mp3` | Bundled clip |
| `win_01` | Sixth defeat | yes | `public/audio/bard/win_01.mp3` | Bundled clip |
| `lose_01` | Three hits | yes | `public/audio/bard/lose_01.mp3` | Bundled clip |

**Later** (same pack, no manifest row, no file):

`open_02`, `open_03`, `success_02`, `success_03`, `success_04`, `typo_first_02`, `typo_first_03`, `typo_repeat_02`, `typo_repeat_03`, `goose_02`, `win_02`, `win_03`, `lose_02`, `lose_03`.

---

## Never block combat

Narration is a Step, not the Workflow (`03-state-architecture.md`).

- Autoplay will fail. First committed keypress unlocks `AudioContext` / SpeechSynthesis (`R-109`). Do not ask for a click.
- Do not `await` `audio.play()`, `speak()`, or fetch inside `reduce`. The director is a subscriber.
- Win / lose / goose may `REPLACE` a lower-priority line. Ordinary success drops if stale (`F-011`). No FIFO joke queue.
- Input, TTI, lock, and the 480 ms resolve hold keep moving while a line is speaking (`§16.7`).
- Missing `suggestedFile`, decode error, or `play()` rejection → next fallback. Phase still advances.
- Do not install Howler.

---

## ElevenLabs production and human audition gate

Official ElevenLabs documentation was re-checked on 2026-08-18:

- [Create speech](https://elevenlabs.io/docs/api-reference/text-to-speech/convert)
- [List voices](https://elevenlabs.io/docs/api-reference/voices/search)
- [Authentication](https://elevenlabs.io/docs/api-reference/authentication)
- Voice discovery uses `GET /v2/voices`; generation uses `POST /v1/text-to-speech/{voice_id}` with the secret only in the server-side `xi-api-key` header.
- Production uses `eleven_multilingual_v2`, `mp3_44100_128`, and documented voice settings: stability 0.62, similarity 0.78, style 0.12, speaker boost, speed 0.94.
- Generation sends clean subtitles with punctuation. No xAI-only tags are sent.

Three account voices were selected from labels and descriptions, then rendered with one identical composite:

- **Brian — Deep, Resonant and Comforting** (`nPczCjzI2devNBz1zQrb`): middle-aged, resonant, classy narration. Metadata winner and provisional pack voice.
- **Lily — Velvety Actress** (`pFZP5JQG7iQjIQuC4Bku`): middle-aged British, warm, confident narration.
- **George — Warm, Captivating Storyteller** (`JBFqnCBsd6RMkjVDRZzb`): middle-aged British narrative storyteller.

Auditions are under `public/audio/bard/auditions/<voice-slug>/composite.mp3`. Brian is provisional based on metadata and valid output only; no claim is made that it is funniest. `P-VOICE-AUDITION` and `P-AUDIO-ROOM` remain human listening gates.

Regenerate the three auditions:

```bash
npm run audio:bard:elevenlabs -- --audition
```

Regenerate the complete provisional pack:

```bash
npm run audio:bard:elevenlabs -- --voice nPczCjzI2devNBz1zQrb --all
```

The script privately loads `ELEVENLABS_API_KEY` from the process environment or ignored repo `.env`, validates every MP3 with `ffprobe`, records durations and sizes, retries transient failures, and never prints the credential. The optional xAI generator remains available as `npm run audio:bard`.

### Final Integrator clip contract

Shipped in `src/audio/**`. The machine is unchanged.

- Load the local pack manifest, then try `/audio/bard/<lineId>.mp3` only for rows marked `generated`; on decode failure or rejected `play()`, speak once; never clip+speech together.
- One playing + one pending. Higher priority interrupts and clears pending. Stale pending drops on `onEnded` if `bardLineId` moved.
- Cast voice waits 140 ms; goose voice waits 180 ms after the honk.
- No looping bed. Restart (`R` / aftermath Enter / aftermath Escape) cancels speech, timers, and clip nodes.

---

## SpeechSynthesis garnish

Optional, after a missing clip, never instead of the rubric.

- Speak the **subtitle**, not the marked-up `voiceScript`.
- Prefer a serious English voice from `speechSynthesis.getVoices()` if one exists. Do not search for a comic voice.
- Slightly slow rate. Volume follows the player; default must survive a noisy room.
- `speak()` on the unlock gesture or after it. Ignore rejection.
- Voices empty, API missing, or utterance error → subtitle only.

---

## Pronunciation (from `data/roots.json`)

Flagship lines do not say Latin roots. Any later clip or garnish that does must use these spoken forms (`R-003`). Display spelling stays as authored.

| id | Speak |
|---|---|
| aqua | AH-kwah |
| fractura | frak-TOO-rah |
| fulgur | FUL-gur |
| glacies | GLAH-see-es |
| ignis | IG-nis |
| lumen | LOO-men |
| mors | mors |
| ordo | OR-doh |
| terra | TER-rah |
| umbra | UM-brah |
| ventus | VEN-tus |
| vita | VEE-tah |

Spell pairs use the same roots, authored order: e.g. `ignis ventus` = IG-nis VEN-tus, `glacies fractura` = GLAH-see-es frak-TOO-rah (`data/spells.json` `pronunciation`). Do not say `ventis`. That string is the goose trigger, not a root.

---

## Look

The accepted full-scene Frontier includes the embodied quill-lute bard while the subtitle remains the authoritative accessible line (`12-integration-decisions.md`, O-009 supersession). The bundled voice is off-screen narration; comedy remains register clash, not a separate talking-head interaction.

---

## Must not

- Call a TTS API from the game loop.
- Treat an empty `clips` array or a 404 as a load failure.
- Block READY / TYPING / RESOLVING on narration.
- Restyle the lectern to “make voice feel present.”
