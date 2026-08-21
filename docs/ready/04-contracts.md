# Contracts (v0 — frozen)

These are implementation schemas. Files in `docs/ready/data/` are the populated instances.

---

## Spell

```json
{
  "id": "glacies_fractura",
  "canonicalRoots": ["glacies", "fractura"],
  "incantation": "glacies fractura",
  "displayName": "Frost Fracture",
  "pronunciation": "GLAH-see-es frak-TOO-rah",
  "tags": ["ice", "armor-break", "single-target"],
  "effectiveAgainst": ["armored", "fire"],
  "basePowerBand": "high",
  "cooldownBand": "long",
  "cooldownSeconds": 12,
  "typingDifficulty": { "characterCount": 16, "band": "medium" },
  "presentation": { "colorFamily": "ice-blue", "effectFamily": "fracture" },
  "reasonWhenChosen": "BEST VS. ARMOR"
}
```

Required: `id`, `canonicalRoots` (1–2), `incantation`, `displayName`, `tags`, `effectiveAgainst`, `cooldownSeconds`, `typingDifficulty.characterCount`.  
`effectiveAgainst` may include `"any"` (fallback defeat).  
`basePowerBand`: `low` | `mid` | `high`.  
`cooldownBand`: `short` | `medium` | `long` (4 / 8 / 12).  
`typingDifficulty.band`: `short` | `medium` | `long` (≤11 / 12–16 / ≥17).

---

## Misfire

```json
{
  "id": "disappointed_goose",
  "displayName": "The Mildly Disappointed Goose",
  "triggerStrings": ["ignis ventis"],
  "severity": "comic_mixed",
  "defeatsThreat": false,
  "playerHits": 0,
  "knockbackSeconds": 2.5,
  "fallback": false
}
```

Lookup: normalize received string → exact active incantation auto-casts → dirty Enter checks exact `triggerStrings` → else record with `fallback: true` (`fizzle`). Unordered roots define corpus identity, not a reversed-input matcher.

---

## Recommendation

```json
{
  "spellId": "glacies_fractura",
  "targetId": "plated_sentinel",
  "reasonCode": "ARMOR_COUNTER",
  "reasonLabel": "BEST VS. ARMOR",
  "eligibility": "READY",
  "scoreBand": "high",
  "estimatedCompletionBand": "unused",
  "alternatives": []
}
```

`eligibility`: `READY` | `COOLDOWN` | `LOCKED`.  
`reasonCode`: `FLESH_COUNTER` | `ARMOR_COUNTER` | `AREA_COUNTER` | `INTERRUPT` | `LETHAL` | `QUENCH` | `HOLD` | `FASTEST_SAFE` | `FORCED_OPENING`.  
`estimatedCompletionBand` is present for schema stability and is **unused** while WPM is off.  
`alternatives` stays `[]` in v1.

---

## Game event

```json
{
  "eventId": "evt_00042",
  "type": "MISFIRE_CREATED",
  "timestamp": 0,
  "runContext": { "streak": 0, "hits": 0, "threatsDefeated": 1 },
  "typingContext": {
    "expected": "glacies fractura",
    "received": "ignis ventis",
    "repeatCount": 1
  },
  "outcome": { "misfireId": "disappointed_goose", "severity": "comic_mixed" }
}
```

`type` is the frozen enum in `03-state-architecture.md`. `timestamp` is run-ms from start.

---

## Bard selection

```json
{
  "lineId": "goose_01",
  "eventId": "evt_00042",
  "priority": 90,
  "action": "PLAY_NOW",
  "subtitle": "You requested wind. The universe heard goose.",
  "audioAsset": null
}
```

`action`: `PLAY_NOW` | `REPLACE` | `DROP`. No stale FIFO. `audioAsset` null → subtitle only (and optional speechSynthesis).

---

## Audio manifest (empty-safe)

```json
{
  "version": "v0",
  "voiceIntent": "orion",
  "unlock": "first-keypress",
  "duckDb": -6,
  "clips": []
}
```

A missing file or empty `clips` is valid. Combat proceeds.

---

## Encounter / threat

See `data/encounter.json`. Required per threat: `id`, `tags`, `wave`, `ttiSeconds`. Opening may `forcedSpellId`.

---

## Root

See `data/roots.json`. Required: `id`, `display`, `pronunciation`, `meaning`.

---

## Input intents (live action union — extend, do not fork)

Outcome 1:

- `TYPE { value: string }` — full buffer, already normalized by the input element
- `FORCE_CAST`
- `CANCEL`
- `FINISH_RESOLVE`
- `RESTART`

Outcome 2+ add: `TICK { dt: number }`, and let `TYPE` emit per-glyph events for the bard.

Normalize before `TYPE`: `toLowerCase`, NFC, strip characters outside `[a-z ]`.

---

## Provider boundaries

Input → intents. Recommendation → record above. Resolver → events + run fields. Bard → selection. Narration → side effect. Presentation → pixels. Ranking is a pure function of `(book, cooldowns, threat, wave)`.
