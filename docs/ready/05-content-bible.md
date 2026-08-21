# Content bible

Canonical numbers live in `data/*.json`. This file is the rationale and the character rules. Do not grow a second book.

---

## Roots (O-001 CLOSED)

Twelve Latin-ish roots. All twelve appear in the 10-spell book.

| id | Speak | Logic |
|---|---|---|
| aqua | AH-kwah | Water; quenches fire |
| fractura | frak-TOO-rah | Break; armor |
| fulgur | FUL-gur | Lightning; interrupt |
| glacies | GLAH-see-es | Ice; hold and crack |
| ignis | IG-nis | Fire |
| lumen | LOO-men | Light; reveal swarms |
| mors | mors | Ending; lethal |
| ordo | OR-doh | Order; seal and measure |
| terra | TER-rah | Earth; hold |
| umbra | UM-brah | Shadow |
| ventus | VEN-tus | Wind; interrupt / scatter |
| vita | VEE-tah | Life; ward |

Pairs are unordered for corpus identity. Active play accepts the exact displayed authored incantation; reversed input is not a second matcher. Self-pair allowed once: `ignis ignis`.

---

## Active spellbook (10)

| id | Incantation | Role | vs | CD | Chars |
|---|---|---|---|---:|---:|
| ignis_ventus | ignis ventus | area fire | fleshy, swarm | 8 | 12 |
| glacies_fractura | glacies fractura | armor-break | armored, fire | 12 | 16 |
| terra_ordo | terra ordo | interrupt / seal | charging | 8 | 10 |
| lumen_aqua | lumen aqua | area tide | swarm, fire | 8 | 10 |
| fulgur_ventus | fulgur ventus | fast interrupt | charging | 4 | 13 |
| umbra_mors | umbra mors | lethal | elite, wounded | 12 | 10 |
| vita_terra | vita terra | safe hold | any | 8 | 10 |
| ignis_ignis | ignis ignis | overkill fire | fleshy | 12 | 11 |
| aqua_glacies | aqua glacies | quench | fire | 8 | 12 |
| ordo_lumen | ordo lumen | fastest safe | any | 4 | 10 |

A correct cast **defeats** if `effectiveAgainst` intersects threat tags or contains `any`. Otherwise **1.5s knockback**, threat remains. Correct typing stays better than goose or fizzle.

Color families tint the **well cast**, never the letters (`06-look-and-feel.md`).

---

## Enemies (O-004) — six-wave gauntlet

| Wave | id | Tags | TTI | Forced / expected pick |
|---:|---|---|---:|---|
| 1 | emberling | fleshy, fire | 8.0 | **forced** ignis_ventus |
| 2 | plated_sentinel | armored | 7.5 | glacies_fractura (wave-1 spell on CD) |
| 3 | moth_cloud | swarm | 7.0 | lumen_aqua |
| 4 | glass_hound | charging, approaching | 6.5 | fulgur_ventus |
| 5 | cinder_wight | fire | 6.0 | aqua_glacies |
| 6 | quiet_regent | elite | 5.5 | umbra_mors |

Win: 6 defeats. Lose: 3 hits. One threat on screen.

Outcome 1 may show only emberling and end on AFTERMATH after one cast. The gauntlet stays frozen for Outcome 2+.

---

## Goose mapping (O-012 CLOSED)

Normalize → table:

| received | result |
|---|---|
| `ignis ventis` | disappointed_goose |
| `ignis vnetus` | disappointed_goose |
| `ignsi ventus` | disappointed_goose |
| anything else dirty-submitted | fizzle |

Goose: 2.5s knockback, 0 hits, no defeat, two honks (audio if present). Demo: after wave 2 is up, type `ignis ventis` and Enter. String-first, so the expected prompt may be `glacies fractura`.

Panic (TYPING, TTI hits 0): if buffer matches a goose string → goose **and** 1 hit; else fizzle + 1 hit. Empty impact: 1 hit, no comic misfire.

---

## Bard

Official historian. Fondly unimpressed. Roast the typo, the timing, the goose — not the player's worth. No profanity. No identity attacks. No constant rhyme. Silence is legal.

Identity-floor events in `data/bard-lines.json`: opening, success, first typo, repeat typo, goose, panic fizzle, win, lose.

Selection: match event + conditions → drop recent 3 IDs → respect cooldown / max-per-run → highest priority wins → `PLAY_NOW` or `REPLACE` if new priority ≥ current; else `DROP`. Ordinary success: 8s cooldown.

Opening: pick one of `open_01`–`open_03` per run (bounded variation: `runStart` hash or first unused).

---

## Safety filter

Reject any line that contains profanity, slurs, identity targeting, or a direct attack on intelligence or disability. Spec appendix lines were curated against that bar. New lines need the same pass (`AC-BARD-001`).
