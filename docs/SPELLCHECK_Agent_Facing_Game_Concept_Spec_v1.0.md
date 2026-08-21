---
document_id: spellcheck-agent-concept-v1
version: 1.0
status: concept_specification
working_title: SPELLCHECK
tagline: Every typo is canon.
primary_audience: AI agents
secondary_audience: human designers, developers, writers, audio directors, reviewers
document_purpose: Preserve the why, what, constraints, decisions, and quality bars while leaving implementation choices to downstream agents.
last_updated: 2026-08-19
normative_terms:
  MUST: required for concept integrity
  SHOULD: recommended default that may change with evidence
  MAY: optional or expansion behavior
  MUST_NOT: prohibited because it breaks an established design decision
decision_statuses:
  LOCKED: settled unless a material contradiction is demonstrated
  DEFAULT: preferred starting position; may change with explicit rationale
  OPEN: intentionally unresolved and available for research or prototyping
  DEFERRED: outside the initial experience
---

# SPELLCHECK
## Agent-Facing Game Concept, Feature Narrative, and Design Contract

> **Canonical compression:** The combat system decides what magic is tactically appropriate. The player must type the incantation before the threat arrives. The bard turns accuracy, speed, panic, and failure into a funny personal story.

> **Design allocation:** The system owns context. The recommendation engine owns tactical ranking. The player owns execution. Deterministic rules own consequences. Randomness owns texture. The bard owns interpretation.

---

## Index

1. [Machine-Reading Contract](#1-machine-reading-contract)
2. [Executive Concept](#2-executive-concept)
3. [Context and Operating Constraints](#3-context-and-operating-constraints)
4. [Decision Ledger](#4-decision-ledger)
5. [Feature Narrative](#5-feature-narrative)
6. [Player Fantasy and Experience Promise](#6-player-fantasy-and-experience-promise)
7. [Core Gameplay Loop](#7-core-gameplay-loop)
8. [Player Agency and Information Allocation](#8-player-agency-and-information-allocation)
9. [Spell Corpus and Active Spellbook](#9-spell-corpus-and-active-spellbook)
10. [Adaptive Recommendation System](#10-adaptive-recommendation-system)
11. [Typing Interaction Contract](#11-typing-interaction-contract)
12. [Combat, Cooldowns, and Pressure](#12-combat-cooldowns-and-pressure)
13. [State Architecture](#13-state-architecture)
14. [Misfires and Cursed Magic](#14-misfires-and-cursed-magic)
15. [The Bard: Character and Commentary System](#15-the-bard-character-and-commentary-system)
16. [Narration and Audio Direction](#16-narration-and-audio-direction)
17. [Interface and Information Architecture](#17-interface-and-information-architecture)
18. [Capability and Data Contracts](#18-capability-and-data-contracts)
19. [Agent Team and Role Specifications](#19-agent-team-and-role-specifications)
20. [Research Agenda](#20-research-agenda)
21. [Verification and Acceptance Signals](#21-verification-and-acceptance-signals)
22. [Scope Ladder](#22-scope-ladder)
23. [Risk and Failure-Mode Register](#23-risk-and-failure-mode-register)
24. [Non-Goals and Anti-Features](#24-non-goals-and-anti-features)
25. [Open Questions](#25-open-questions)
26. [Presentation and Demo Narrative](#26-presentation-and-demo-narrative)
27. [Instructions for Downstream Agents](#27-instructions-for-downstream-agents)
28. [Source and Research Notes](#28-source-and-research-notes)
29. [Appendix A: Seed Bard Line Library](#29-appendix-a-seed-bard-line-library)
30. [Appendix B: Agent Output Template](#30-appendix-b-agent-output-template)

---

## 1. Machine-Reading Contract

### 1.1 Purpose

This document is the canonical concept specification for an adaptive fantasy typing game currently using the working title **SPELLCHECK**. It is intended to provide enough structured context for one or more AI agents to research, design, build, write, test, and present the idea without repeatedly reopening decisions already clarified.

This document deliberately describes:

- Why the game should exist.
- What experience it should produce.
- What systems and behaviors are required.
- What decisions are already settled.
- What remains open to research or experimentation.
- What must be observable or verifiable.
- What each specialist agent owns.

This document deliberately does **not** dictate:

- A specific programming language, framework, rendering engine, hosting target, or repository structure.
- Exact class names, file names, functions, packages, or code organization.
- A fixed production sequence or rigid implementation schedule.
- Exact balance values before play evidence exists.
- A runtime model dependency when a deterministic system can satisfy the same outcome.

### 1.2 Agent interpretation rules

Any downstream agent using this file MUST:

1. Read the whole document before proposing material changes.
2. Reference relevant decision IDs when making a recommendation.
3. Preserve `LOCKED` decisions unless it identifies a direct contradiction, technical impossibility, safety issue, or evidence that materially changes the experience.
4. Treat `DEFAULT` decisions as preferred hypotheses, not immutable requirements.
5. Clearly tag any new assumption.
6. Distinguish evidence from inference and preference.
7. Optimize for a coherent playable identity before breadth.
8. Cut content volume before cutting the signature interaction.
9. Keep the critical loop operational without network access.
10. Return unresolved conflicts to the Decision Steward rather than silently choosing a new direction.

### 1.3 Concept integrity test

A proposed change belongs in the concept if it strengthens at least one of these relationships without materially weakening the others:

- Combat state becomes a readable typing prompt.
- Typing quality creates immediate magical consequence.
- Cooldowns and threat pressure create a changing spell rotation.
- Misfires turn errors into entertaining content.
- Bard commentary makes the game feel observant and personal.
- Agent-generated breadth remains coherent, deterministic, and testable.

If a feature does not strengthen one of those relationships, it is likely expansion rather than core design.

---

## 2. Executive Concept

### 2.1 One-sentence pitch

**SPELLCHECK is an adaptive typing-combat game in which a magical recommendation engine continuously selects the best available spell, the player must type its incantation before enemies arrive, and a theatrical bard praises, narrates, or politely roasts every triumph and mistake.**

### 2.2 Short pitch

The game contains a large pre-baked corpus of two-root spells. Players are not expected to memorize or browse that corpus during a short session. Instead, the game evaluates the current enemy, danger, cooldowns, potential combinations, and the player's demonstrated typing speed. It then surfaces the highest-ranked available incantation.

The player types the displayed phrase. Exact completion casts the intended spell. Delays, errors, forced submissions, or unfinished casts may produce misfires or cursed magic. The cast changes combat state, places abilities on cooldown, and causes the recommendation engine to select the next appropriate incantation.

The bard is not a decorative random quote system. He is an official chronicler forced to narrate an unreliable hero. He remembers repeated errors, notices recoveries and streaks, speaks selectively, and uses polished theatrical narration to make both success and failure funny.

### 2.3 The distinctive relationship

The concept is not novel because it contains typing, elemental magic, cooldowns, narration, generated content, or jokes in isolation. Its identity comes from their integration:

> **A combat engine converts world state into language; the player's hands execute that language; the world interprets mistakes as magic; and a bard turns the resulting performance into a relationship.**

### 2.4 Working title and tagline

- Working title: **SPELLCHECK**
- Primary tagline: **Every typo is canon.**
- Secondary line: **The grimoire knows the spell. Your hands have to keep up.**

The title is a working decision and MAY change, but any replacement SHOULD preserve the connection between spelling and spell-casting.

---

## 3. Context and Operating Constraints

### 3.1 Original context

The concept emerged for a short Cursor AI Gaming Hackathon described publicly as an event to create games using Grok and Cursor, followed by participant presentations. The original published event window was approximately three hours. This shaped the emphasis on immediate playability, browser-friendly interaction, agent-generated content, deterministic runtime behavior, and a demonstration that can be understood in seconds.

The concept may continue after the event, but the first experience SHOULD remain small enough to demonstrate cleanly in roughly one to two minutes.

### 3.2 Constraint hierarchy

In order of importance:

1. The typing loop must be immediately playable.
2. No mouse interaction may be required during active play.
3. A fresh player must always know what the game currently wants typed.
4. The displayed prompt must not change underneath an active typist.
5. A correct cast must create an obvious consequence.
6. An error must create understandable feedback and preferably entertainment.
7. The bard must sound intentional rather than like generic text-to-speech.
8. Agent-generated content must remain structured, coherent, and verifiable.
9. The critical loop must not depend on a live model or stable network connection.
10. Content breadth may expand only after the identity floor is complete.

### 3.3 Product posture

This is initially a **showcase game and concept proof**, not a content platform, persistent service, multiplayer product, or production-scale RPG. It should feel complete at its smallest size and extensible without requiring the prototype to impersonate the final product.

---

## 4. Decision Ledger

### 4.1 Locked decisions

| ID | Status | Decision | Rationale |
|---|---|---|---|
| D-001 | LOCKED | Active gameplay is keyboard-first and completable without a mouse. | Typing is the mechanic, not an input method layered onto another game. |
| D-002 | LOCKED | The system surfaces the current incantation rather than requiring the player to memorize the full corpus. | A two-minute player cannot reasonably learn dozens of spells. Cognitive effort should stay on execution and pressure. |
| D-003 | LOCKED | The recommendation engine considers current combat state and spell availability. | Otherwise the prompt is a random word generator with fantasy decoration. |
| D-004 | LOCKED | A recommendation locks when the player begins typing it. | A prompt changing mid-word would feel unfair and broken. |
| D-005 | LOCKED | Valid canonical spells have stable, deterministic meanings and outcomes under equivalent conditions. | Learning, trust, and reproducibility require causality. |
| D-006 | LOCKED | The critical gameplay loop does not require a live language model. | The game must remain responsive, testable, and demonstrable offline. |
| D-007 | LOCKED | The large spell corpus is pre-baked and machine-readable. | Agent leverage should create structured breadth without runtime fragility. |
| D-008 | LOCKED | Cooldowns or equivalent availability constraints must materially change recommendations. | Rotation is a core source of pace and variation. |
| D-009 | LOCKED | Errors create specific feedback; important errors can become comedic misfires rather than silent rejection. | Failure is a signature content channel. |
| D-010 | LOCKED | The bard is an official historian/chronicler who is fondly unimpressed by the player's unreliable heroism. | A strong character motive produces coherent comedy. |
| D-011 | LOCKED | Bard humor contains no profanity and targets actions or situations, not identity or human worth. | Formal restraint is funnier, safer, and more durable. |
| D-012 | LOCKED | Bard commentary is event-aware, stateful, selective, and priority-driven rather than purely random. | Timing, callbacks, and relevance create apparent intelligence. |
| D-013 | LOCKED | Voice performance is part of the feature, not a cosmetic afterthought. | The delivery can strengthen or destroy otherwise good writing. |
| D-014 | LOCKED | The player must receive readable visual feedback even when narration is unavailable. | Audio must enhance rather than gate comprehension or accessibility. |
| D-015 | LOCKED | The feature narrative emphasizes coherent agent leverage, not content volume alone. | Hundreds of records are not meaningful unless the system uses and validates them coherently. |

### 4.2 Recommended defaults

| ID | Status | Default | Why it is preferred |
|---|---|---|---|
| D-101 | DEFAULT | Use 12 roots to form 78 unordered canonical combinations including self-pairs. | It creates a large but bounded corpus; 12 × 13 ÷ 2 = 78. |
| D-102 | DEFAULT | Use an active spellbook of approximately 8–12 spells during a run. | Ranking all 78 equally would dilute cooldown meaning and overwhelm the experience model. |
| D-103 | DEFAULT | Show one primary recommendation in the initial build. | One prompt proves the typing loop with the smallest cognitive and state burden. |
| D-104 | DEFAULT | Cast automatically when the exact displayed incantation is completed. | It preserves keyboard rhythm and removes an unnecessary confirmation action. |
| D-105 | DEFAULT | Allow Backspace recovery; allow a deliberate force-cast input to submit corrupted text. | This creates a speed-versus-risk decision without mouse interaction. |
| D-106 | DEFAULT | Estimate typing speed during the run and include expected completion time in ranking. | The system can recommend spells the current player can realistically finish. |
| D-107 | DEFAULT | Author the opening encounter sequence and allow later variation. | The demo must reliably teach the loop before randomness expands it. |
| D-108 | DEFAULT | Pre-generate roughly 25–40 flagship bard clips and bundle them locally. | It provides consistent comedic timing without network or runtime voice latency. |
| D-109 | DEFAULT | Use an expressive xAI voice for the initial narration audition. | It supports the event narrative and currently provides performance controls suited to the bard. |
| D-110 | DEFAULT | Use subtitles for every spoken line. | It protects comprehension in a noisy room and supports accessibility. |
| D-111 | DEFAULT | Keep routine commentary lines short and reserve couplets for milestones. | Constant rhyme slows play and makes the bard predictable. |

### 4.3 Open decisions

| ID | Status | Question |
|---|---|---|
| O-001 | OPEN | What are the final twelve roots, their pronunciations, and their semantic logic? |
| O-002 | OPEN | Are canonical pairs fully unordered, or does a later mode make order meaningful? |
| O-003 | OPEN | What exact spells form the active spellbook for the first run? |
| O-004 | OPEN | What enemy archetypes best demonstrate changing recommendations? |
| O-005 | OPEN | What balance model makes cooldowns legible without requiring explanation? |
| O-006 | OPEN | Should a wrong character merely cost time, or should error accumulation affect the spell before submission? |
| O-007 | OPEN | What precise input forces a corrupted cast without interfering with normal typing? |
| O-008 | OPEN | Which voice and delivery treatment best realizes the bard persona? |
| O-009 | OPEN | What visual style communicates fantasy, speed, and comedy with minimal production burden? |
| O-010 | OPEN | What final name best communicates the typing-spell relationship? |
| O-011 | OPEN | Should alternatives appear after the primary loop works, and how many can remain readable? |
| O-012 | OPEN | Should cursed spells be deterministic by invalid string, event context, or both? |

### 4.4 Deferred decisions

Persistent progression, accounts, multiplayer, long-form campaign structure, monetization, live generative dialogue, large inventories, player-authored loadouts, and cross-session spell discovery are `DEFERRED` until the short experience demonstrates durable fun.

---

## 5. Feature Narrative

### 5.1 Narrative thesis

The player is a promising but unproven spellcaster facing an accelerating sequence of threats. A magical grimoire evaluates each threat and displays the most appropriate available incantation. The grimoire is tactically competent; whether the spell succeeds depends on the player's hands.

A bard has been assigned to chronicle the player's supposedly legendary defense. He begins ceremonially optimistic, becomes increasingly concerned when the player misspells ancient magic, and develops reluctant respect if the player recovers. He is not outside the world delivering game-system jokes. He is inside the fiction, trying to preserve a heroic historical record that the player keeps making difficult.

### 5.2 First-session experience beats

#### Arrival

- The player encounters an active threat immediately or after a minimal keyboard-start action.
- The current enemy and its defining trait are visible.
- A single incantation is presented prominently.
- The player understands within seconds that the phrase should be typed.
- The bard establishes the relationship with a brief ceremonial line.

#### First successful cast

- Correct letters visibly advance through the incantation.
- Exact completion immediately releases a clearly related magical effect.
- The enemy visibly reacts.
- The spell enters cooldown.
- A new recommendation appears because the world state changed.
- The bard offers restrained approval rather than excessive celebration.

#### Rotation recognition

- The player notices that different threats or cooldowns produce different prompts.
- The recommendation includes a concise reason or readable semantic cue.
- The player understands that the system is choosing tactically while they are responsible for execution.

#### First mistake

- A wrong letter receives immediate visual feedback.
- The player may recover with Backspace if time permits.
- If the invalid text is submitted or time expires, the game produces a specific misfire.
- The misfire is visually legible, mechanically consequential, and funny enough to remember.
- The bard comments on what actually happened, not merely that an error occurred.

#### Relationship development

- Repeated mistakes create callbacks.
- A recovery after failure receives different commentary from an ordinary success.
- A long correct streak makes the bard increasingly, and reluctantly, impressed.
- Repeating the same spell or strategy may receive a contextual observation.

#### Climax and ending

- Pressure rises through faster threats, longer prompts, tighter cooldown availability, or meaningful combinations.
- Victory or defeat produces a clear ending rather than an indefinite fade.
- The bard delivers a final verdict or short couplet.
- Restart is immediate and keyboard-accessible.

### 5.3 Strong feature narrative

The feature should be describable as a coherent sequence rather than a list of technologies:

> The game watches the battle, selects the best available magic, and writes that decision as an incantation. The player races to type it before danger arrives. Every correct phrase changes the tactical state and therefore the next phrase. Every important mistake becomes a magical incident. A bard remembers the player's patterns and turns the session into a comic legend.

### 5.4 Agent-built narrative

The agent contribution is not simply “an AI wrote a lot of jokes.” The stronger narrative is:

- An agent helped define a constrained spell language.
- An agent generated a structured corpus with consistent metadata.
- An agent helped create the ranking and validation scenarios.
- An agent produced and critiqued bard lines against a character bible.
- An agent assisted voice auditioning and expressive narration generation.
- Validators or behavioral checks rejected malformed, duplicated, incoherent, unsafe, or mechanically invalid content.
- The shipped game runs deterministically without requiring the model to remain present.

The production story is therefore **agent-amplified coherence**, not merely agent-amplified quantity.

---

## 6. Player Fantasy and Experience Promise

### 6.1 Primary fantasy

The player should feel like a spellcaster whose magical power is limited by composure, speed, and precision rather than by mouse dexterity or menu knowledge.

### 6.2 Secondary fantasy

The player is performing a legend in real time while an increasingly opinionated bard documents it.

### 6.3 Experience promises

The game MUST make the player feel that:

- Their typing directly causes magic.
- The game knows what is happening tactically.
- The current prompt has a reason for appearing.
- Speed and accuracy both matter.
- A mistake can be entertaining rather than merely punitive.
- The bard noticed the specific shape of their performance.
- The game can be understood quickly but played better with practice.

### 6.4 Experience anti-promises

The game MUST_NOT require the player to:

- Browse 78 spells during combat.
- Memorize an invented language before having fun.
- Move between menus while an enemy approaches.
- Use a mouse to select or confirm a standard cast.
- Wait for a server or language model before receiving a critical response.
- Listen to every narration line in order to understand the state.

---

## 7. Core Gameplay Loop

### 7.1 Canonical loop

1. A threat appears or advances.
2. The system evaluates threat state, available spells, cooldowns, combinations, urgency, and player typing performance.
3. The system surfaces the highest-ranked eligible incantation and a concise reason.
4. The player begins typing.
5. The recommendation and target lock.
6. Correct completion casts the intended spell.
7. Incorrect or unfinished execution may be corrected, forced, fizzled, or converted into a misfire.
8. The outcome changes health, status, distance, score, streak, cooldowns, or threat state.
9. The bard system evaluates whether the event deserves commentary.
10. Once the input buffer is clear and the world state is stable enough to assess, the recommendation engine selects the next prompt.

### 7.2 Compression formula

`WORLD STATE -> SPELL RANKING -> DISPLAYED LANGUAGE -> HUMAN EXECUTION -> CONSEQUENCE -> NEW WORLD STATE`

### 7.3 Quality bar

The loop is successful when:

- A fresh player understands what to type within approximately five seconds.
- A successful cast feels causally linked to typed completion.
- The next prompt visibly responds to the changed situation.
- A mistake produces useful feedback immediately.
- A memorable comic consequence can occur within the first minute.
- A complete session can produce an opening, escalation, and ending in roughly one to two minutes.

---

## 8. Player Agency and Information Allocation

### 8.1 Central decision

The initial game is not required to make spell selection itself the primary skill. Execution may be the core skill.

The system may select one recommended spell while the player expresses skill through:

- Speed.
- Accuracy.
- Error recovery.
- Choosing whether to correct or force a corrupted cast.
- Maintaining streaks.
- Completing longer spells before threat impact.
- Adapting to unfamiliar letter patterns.
- Later, choosing among multiple visible recommendations by typing the desired phrase.

### 8.2 Information allocation

| Owner | Responsibility |
|---|---|
| System | Present the threat, urgency, available tactical answer, cooldown state, and readable feedback. |
| Player | Execute, recover, accept risk, and improve performance. |
| Recommendation engine | Rank eligible spells and explain the dominant reason concisely. |
| Resolver | Apply deterministic consequences. |
| Bard | Interpret meaningful events through character and comedy. |
| Randomness | Vary enemy order, cosmetic treatment, eligible commentary, and optional cursed outcomes without invalidating causality. |

### 8.3 Optional agency expansion

After the one-prompt loop works, the system MAY display a small set such as:

- `BEST`: highest tactical score.
- `FAST`: shortest viable incantation.
- `RISK`: strongest cast that may be difficult to finish in time.

The player would choose entirely by beginning to type one of the displayed strings. No navigation key or mouse selection should be necessary. Shared prefixes must remain readable and must not cause accidental commitment.

This is an expansion, not a requirement for the identity floor.

---

## 9. Spell Corpus and Active Spellbook

### 9.1 Corpus purpose

The corpus provides enough breadth that a short demonstration does not exhaust the system. It also demonstrates agent-assisted content generation in a form that remains deterministic, auditable, and shippable.

The corpus is not valuable because it contains many rows. It is valuable when those rows create:

- Distinct tactical uses.
- Consistent semantic relationships.
- Different typing rhythms and lengths.
- Meaningful cooldown rotations.
- Readable visual identities.
- Coherent names and pronunciation.
- Reliable hooks for bard commentary.

### 9.2 Current combination model

The current default assumes twelve roots combined as unordered pairs with self-pairs allowed:

`12 × 13 ÷ 2 = 78 canonical combinations`

Under this model:

- `ignis ventus` and `ventus ignis` resolve to the same canonical spell.
- A canonical display order prevents duplication and confusion.
- Self-pairs such as `ignis ignis` may represent intensified or specialized forms.

If word order later becomes mechanically meaningful, the corpus would instead support up to 144 ordered pairs. That change must include an understandable grammar; order must predict behavior rather than merely double the table.

### 9.3 Active spellbook

The full corpus SHOULD NOT be equally active during a short run. The recommendation engine should operate over a bounded active spellbook or an equivalently constrained eligibility set.

Default target: approximately 8–12 active spells.

The active spellbook exists to:

- Preserve cooldown meaning.
- Create recognizable rotation.
- Limit near-duplicate recommendations.
- Make balance scenarios tractable.
- Allow a player to begin recognizing recurring incantations.

Selection of the active spellbook MAY be authored, seeded, theme-based, enemy-based, or later chosen by the player. The initial experience does not require a loadout screen.

### 9.4 Corpus quality requirements

Every canonical spell SHOULD have:

- Stable identifier.
- Canonical incantation.
- Display name.
- Pronunciation guidance when needed.
- Tactical tags.
- Strengths and limitations.
- Cooldown or availability behavior.
- Typing-length metadata.
- Visual and audio direction.
- Misfire relationship or failure treatment where relevant.
- Bard event metadata where a spell has special comic potential.

### 9.5 Corpus validation goals

Validation should detect:

- Duplicate identifiers or canonical pairs.
- Missing combinations when a complete matrix is claimed.
- Conflicting canonical ordering.
- Invalid or unsupported tags.
- Mechanically indistinguishable spells presented as unique.
- Dominant spells that invalidate rotation.
- Unpronounceable or visually confusing incantations.
- Offensive, profane, or tone-breaking content.
- Missing fallbacks for required effects.

---

## 10. Adaptive Recommendation System

### 10.1 System goal

The recommendation system should make the game appear tactically intelligent without taking typing away from the player. It translates combat state into a readable incantation.

### 10.2 Inputs the system should be able to consider

- Current enemy archetype and tags.
- Enemy health and status.
- Enemy distance or time to impact.
- Number of active threats.
- Spell cooldown state.
- Shared cooldown family state, if present.
- Active spellbook membership.
- Potential lethal outcome.
- Potential interrupt or defensive value.
- Area versus single-target value.
- Overkill or waste.
- Recent spell use and combo relationships.
- Player's observed typing speed.
- Player's observed accuracy.
- Incantation length and difficulty.
- Current streak, pressure, or accessibility modifiers.

No exact ranking formula is mandated. Any implementation must, however, make the dominant recommendation reason inspectable and testable.

### 10.3 Output contract

The engine should return at minimum:

- Recommended spell identifier.
- Display incantation.
- Primary recommendation reason.
- Target or threat context.
- Confidence or score sufficient for debugging.
- Eligibility confirmation.
- Optional alternatives.

### 10.4 Ranking principles

The engine SHOULD prefer a spell that is:

- Available now.
- Effective against the current threat.
- Realistically typeable before the danger arrives.
- Proportionate to the target.
- Useful within the current cooldown rotation.
- Legible to the player.

It SHOULD avoid:

- Recommending a spell still on cooldown.
- Recommending an incantation that will almost certainly finish after impact unless deliberately labeled as risky.
- Recommending excessive overkill when a shorter viable answer exists.
- Recommending the same dominant spell whenever it becomes available.
- Changing recommendations during committed typing.
- Using hidden randomness as the primary tie-breaker when deterministic ranking would be clearer.

### 10.5 Typing-speed adaptation

The system MAY estimate the player's characters per second or words per minute from completed casts. Expected completion time can then influence viability:

`estimated completion time = normalized incantation length / observed typing rate`

The conceptual outcome matters more than the exact formula:

- A fast player may receive longer, more powerful recommendations.
- A slower player may receive shorter defensive or delaying options.
- The system should adapt without shaming or explicitly labeling the player slow.
- Early estimates should be conservative and stabilize with more evidence.

### 10.6 Recommendation stability

Recommendations may update when:

- The input buffer is empty.
- A spell resolves.
- A cooldown meaningfully changes eligibility.
- The target or threat changes.
- A relevant status effect changes.

Recommendations MUST freeze when the player commits to typing a candidate. A cancellation or cleared buffer may return control to ranking.

### 10.7 Explainability

The player does not need a numeric score breakdown. A compact cue is sufficient:

- `BEST VS. ARMOR`
- `AREA COUNTER`
- `INTERRUPT READY`
- `FASTEST SAFE CAST`
- `LETHAL`

A debug or review view MAY expose detailed scoring for verification and tuning.

---

## 11. Typing Interaction Contract

### 11.1 Interaction goal

Typing must feel like casting, not filling a form.

### 11.2 Required behaviors

- The typing surface is focused automatically during active play.
- The player can begin typing without clicking.
- Correct characters receive immediate positive visual feedback.
- Incorrect characters receive immediate visible feedback.
- The player can recover from ordinary errors without leaving the keyboard.
- Completing the current canonical phrase produces an immediate cast or equally direct confirmation.
- The prompt remains stable after commitment.
- The input buffer resets predictably after resolution.
- Restart is keyboard-accessible.

### 11.3 Recommended default behaviors

- Exact completion automatically casts.
- Backspace corrects an error while time remains.
- A deliberate submission action may force corrupted input into a misfire.
- If a threat arrives while meaningful partial input exists, the partial phrase may become a panic misfire.
- Empty submission should not create a full comic response unless it represents a deliberate idle or panic event.

### 11.4 Typing difficulty is multidimensional

Difficulty may come from:

- Character count.
- Unfamiliar root spelling.
- Alternating hands or awkward key patterns.
- Repeated letters.
- Similar-looking incantations.
- Threat urgency.
- Correction cost.
- Rotation changes.

Difficulty SHOULD NOT depend on unreadable fonts, low contrast, prompt motion, or arbitrary input focus loss.

### 11.5 Accessibility considerations

Research and design should consider:

- Dyslexia-friendly readability.
- High contrast and non-color-only error feedback.
- Keyboard layouts and international input behavior.
- Reduced-motion treatment.
- Caption persistence.
- Adjustable difficulty or pressure without framing accommodations as failure.
- Clear separation between invented spelling and accidental ambiguity.

---

## 12. Combat, Cooldowns, and Pressure

### 12.1 Combat purpose

Combat exists to make typing consequential. It should create urgency, changing recommendations, and visible magical outcomes without becoming so complex that the player stops reading the prompt.

### 12.2 Initial combat posture

The simplest coherent model is one primary threat at a time, with a visible time-to-impact or spatial approach. Additional enemies or swarms may exist if they remain legible and materially change spell ranking.

### 12.3 Cooldown purpose

Cooldowns should:

- Prevent one optimal spell from dominating.
- Create recognizable rotation.
- Cause the recommendation engine to surface varied incantations.
- Reward surviving until a powerful answer returns.
- Be readable without requiring menu inspection.

Cooldowns should not exist merely because fantasy combat commonly contains them.

### 12.4 Cooldown design warning

If all 78 spells have independent cooldowns and similar substitutes, cooldowns become meaningless. The system can always recommend a near-identical replacement.

At least one of these constraints SHOULD exist:

- A limited active spellbook.
- Shared elemental cooldown families.
- Shared effect-family cooldowns.
- Resource constraints.
- Enemy-specific eligibility.
- Combination rules that make substitution costly.

The initial default is a limited active spellbook because it creates the clearest prototype contract.

### 12.5 Pressure sources

Pressure MAY come from:

- Enemy approach.
- Attack countdowns.
- Longer recommended phrases.
- Multiple statuses requiring different spell roles.
- Narrower recovery windows.
- Cooldown scarcity.
- Streak stakes.

Pressure MUST remain readable. The player should understand why they failed.

---

## 13. State Architecture

### 13.1 State goal

The architecture should preserve one source of truth for active play while keeping spell content, recommendation logic, bard memory, and narration providers separable. This section defines behavioral states, not code organization.

### 13.2 Core gameplay states

| State | System behavior | Player behavior | Exit condition |
|---|---|---|---|
| `READY` | Evaluate the world and display the best eligible prompt. | May begin typing immediately. | First meaningful input commits a prompt, or world state triggers a safe rerank. |
| `TYPING` | Freeze the active prompt and target; continue threat pressure. | Type, correct, cancel, or force a corrupted cast. | Exact completion, forced submission, cancellation, or threat impact. |
| `RESOLVING` | Apply spell or misfire consequence; update cooldowns, score, status, and events. | Input is either ignored or buffered only if explicitly supported. | Outcome reaches a stable post-cast state. |
| `READY` | Recalculate from the changed world. | Begin the next phrase. | Loop continues. |
| `GAME_OVER` | Present final outcome and bard verdict. | Restart or exit by keyboard. | New run or session end. |

An explicit `AFTERMATH` state MAY exist if animation and bard timing require it, but it should not block the player longer than the experience needs.

### 13.3 State invariants

- Only one canonical active prompt may be committed in the initial mode.
- A committed prompt cannot silently change.
- A spell on cooldown cannot be recommended as immediately available.
- A resolved cast must either produce an outcome or a visible failure reason.
- The input buffer must never become detached from the displayed prompt.
- A narration failure cannot prevent the gameplay state from advancing.
- Restart must clear run state predictably.
- Static corpus data should not mutate unintentionally during play.

### 13.4 Bard state

The bard maintains a small memory model separate from combat state:

- Total mistakes.
- Consecutive correct and incorrect casts.
- Last invalid string or error pattern.
- Repeat count for the same error.
- Last spell and repeat count.
- Streak milestones.
- Recovery or comeback events.
- Near-death and game-over context.
- Bard respect or relationship band.
- Recently played lines.
- Current and pending narration priority.

### 13.5 Event boundaries

Systems should communicate through observable events or equivalent contracts such as:

- `THREAT_APPEARED`
- `RECOMMENDATION_CHANGED`
- `PROMPT_COMMITTED`
- `CHARACTER_CORRECT`
- `CHARACTER_INCORRECT`
- `CAST_COMPLETED`
- `CAST_FORCED`
- `MISFIRE_CREATED`
- `SPELL_RESOLVED`
- `STREAK_REACHED`
- `STREAK_BROKEN`
- `PLAYER_RECOVERED`
- `PLAYER_DEFEATED`
- `RUN_WON`

Exact names are not mandated. Observable separation is.

---

## 14. Misfires and Cursed Magic

### 14.1 Purpose

Misfires transform errors from pure punishment into memorable interaction. They should never make accuracy irrelevant, but they may make failure entertaining enough that a player wants to show someone else.

### 14.2 Error ladder

| Error state | Recommended treatment |
|---|---|
| Single recoverable wrong character | Immediate visual error; player may Backspace. |
| Invalid text deliberately submitted | Corrupted cast or authored misfire. |
| Meaningful partial text at threat impact | Panic misfire or incomplete spell consequence. |
| Empty input at impact | Direct damage, fizzle, or brief idle commentary. |
| Repeated identical invalid text | Callback consequence or intensified bard reaction. |
| Unrecognized arbitrary string | Deterministic cursed outcome, bounded fallback, or clear fizzle. |

### 14.3 Deterministic cursed-magic option

A promising expansion maps invalid input to a stable cursed result. A normalized invalid string can select from pre-baked names, creatures, effects, colors, and bard categories. The same invalid string should produce the same cursed spell under equivalent rules.

Conceptual example:

`ignis ventis -> The Mildly Disappointed Goose`

Possible consequence:

- Knocks an enemy backward.
- Steals a small amount of player health.
- Honks twice.
- Enters a `Forbidden Appendix` discovery list.

The significance is not the goose specifically. The design principle is:

> **A typo is not discarded input. It can become a seed with memory.**

### 14.4 Misfire constraints

Misfires MUST:

- Remain visually understandable.
- Preserve the value of correct typing.
- Avoid offensive or profane content.
- Resolve quickly enough to keep the loop moving.
- Have a bounded fallback for arbitrary input.

Misfires SHOULD:

- Reflect how the player failed.
- Be reproducible when positioned as discoveries.
- Create bard material.
- Occasionally help, harm, or confuse rather than always applying the same penalty.

---

## 15. The Bard: Character and Commentary System

### 15.1 Character thesis

The bard is an official historian assigned to chronicle a supposedly legendary spellcaster whose execution repeatedly threatens the quality of the legend.

He is:

- Theatrical.
- Literate.
- Observant.
- Formally polite.
- Fondly unimpressed.
- Invested in preserving a heroic record.
- Reluctantly delighted by real competence.

He is not:

- Cruel.
- Profane.
- A generic insult generator.
- A constant rhyme machine.
- A commentator who speaks after every action.
- A tutorial voice that explains every mechanic literally.

### 15.2 Comedy principles

1. **Roast the action, not the person.** The joke concerns the typo, timing, tactical choice, spell, or historical record.
2. **Specificity beats severity.** “The spellbook has begun taking this personally” is stronger than “That was bad.”
3. **Epic framing meets mundane failure.** Majestic language should describe missing vowels, late arrivals, geese, and overkill.
4. **Callbacks create apparent memory.** The second identical error should not sound like the first.
5. **Praise gives roasting contrast.** Reluctant admiration prevents the bard from becoming exhausting.
6. **Understatement beats shouting.** The voice should trust the line.
7. **Silence is part of timing.** A bard who speaks constantly cannot land a punchline.
8. **No profanity.** Formal restraint is a feature.

### 15.3 Relationship arc

#### Ceremonial optimism

The bard begins by assuming the player might become heroic.

Example: “At last, our champion. The kingdom has chosen optimism.”

#### Growing concern

Errors force him to revise the historical narrative.

Example: “I was promised a wizard. The paperwork remains inconclusive.”

#### Reluctant respect or resignation

Sustained success makes mockery difficult; sustained failure turns the record into elaborate euphemism.

Success example: “Another flawless cast. This is becoming difficult to narrate properly.”

Failure example: “Future scholars will describe this as a strategically unusual afternoon.”

### 15.4 Commentary event taxonomy

- Opening.
- Ordinary correct cast.
- First use of a spell.
- High-value counter.
- Critical or perfect cast.
- First typo.
- Near miss.
- Forced corrupted cast.
- Panic misfire.
- Repeated identical mistake.
- Repeated spell or strategy.
- Slow completion.
- Overkill.
- Streak milestone.
- Streak broken.
- Near death.
- Comeback.
- Rare cursed event.
- Idle hesitation.
- Victory.
- Death or game over.

### 15.5 Commentary frequency and priority

| Event class | Speak frequency | Relative priority |
|---|---:|---:|
| Death/game over | Always | 100 |
| Rare cursed spell | Always | 90 |
| Repeated identical typo | Always | 85 |
| First meaningful misfire | Always | 80 |
| Panic cast | Usually | 75 |
| Streak break | Usually | 70 |
| Comeback | Usually | 65 |
| High streak milestone | Always | 60 |
| Significant tactical success | Sometimes | 40 |
| Ordinary correct cast | Occasionally | 20 |

Exact values may change. The ordering should remain recognizable.

### 15.6 Commentary selection contract

When a game event occurs, the bard system should:

1. Determine whether the event is narratively meaningful.
2. Inspect relevant player history and current bard relationship state.
3. Filter to lines whose conditions match.
4. Remove recently used or overused lines.
5. Respect global and category-specific commentary cooldowns.
6. Choose from the remaining candidates using bounded variation.
7. Compare the new line's priority against current and pending narration.
8. Play, replace, defer briefly, or drop the line.

The system SHOULD NOT preserve a normal first-in-first-out queue of stale jokes.

### 15.7 Line-length and form guidance

- Routine spoken lines: approximately 6–14 words.
- Routine audio duration: approximately 1.5–3 seconds.
- Milestones or final verdicts: may be longer.
- Recommended mix: about 70% dry one-liners, 20% ceremonial couplets, 10% sighs, chuckles, or short reactions.
- Rhyme should be reserved for moments that deserve ceremony.

### 15.8 Commentary record concept

```json
{
  "id": "typo_repeat_03",
  "event": "REPEATED_TYPO",
  "priority": 85,
  "conditions": {
    "minimumRepeatCount": 2,
    "maximumBardRespect": 5
  },
  "subtitle": "Again? At this point, it may be tradition.",
  "voiceScript": "[sigh] Again? [pause] At this point, it may be tradition.",
  "audioAsset": "bard/typo_repeat_03.mp3",
  "cooldownSeconds": 30,
  "maximumPerRun": 1,
  "tags": ["dry", "callback", "short"]
}
```

The exact schema is flexible. The separation between clean subtitle text, performance script, conditions, priority, and audio asset is the important contract.

### 15.9 Content safety and quality filter

Every line pack should be checked for:

- Profanity.
- Slurs or identity-based targeting.
- Direct attacks on intelligence, disability, worth, or competence as a person.
- Cruelty disproportionate to the event.
- Repetitive sentence openings.
- Generic lines that could apply to any event.
- Forced rhyme.
- Tongue-twisting phrasing that fails in narration.
- Excessive length.
- Tone drift from the official-historian persona.

---

## 16. Narration and Audio Direction

### 16.1 Audio goal

The bard should sound like a serious stage narrator who happens to be documenting absurd magical incompetence. The performance should create comedy through contrast, not through a cartoonish “funny voice.”

### 16.2 Voice direction

- Resonant and articulate.
- Slightly formal.
- Normal to slightly slow pace.
- Dry downward inflection on punchlines.
- Rarely shouting.
- Comfortable with short pauses.
- Personally invested in historical accuracy.
- Capable of reluctant warmth.
- Underplays jokes rather than signaling them aggressively.

### 16.3 Recommended voice workflow

The default approach is to audition several expressive voices using the same representative line set, then pre-generate the selected clips and bundle them locally.

Current xAI TTS documentation describes useful candidates including:

- `zagan`: powerful and dramatic.
- `orion`: rich and cinematic.
- `sirius`: quick-witted, clever, and playful.

The most obviously playful voice may not be the funniest. A deeply serious voice delivering “The universe heard goose” may produce stronger contrast. Selection should follow an actual listening test rather than labels alone.

### 16.4 Performance markup

The narration provider may support performance cues such as:

- Pauses.
- Long pauses.
- Chuckles.
- Sighs.
- Tongue clicks or restrained disapproval.
- Whispers.
- Slower or faster phrases.
- Emphasis.
- Sing-song or ceremonial delivery.

These should be used sparingly. Punctuation and one well-placed pause usually outperform stacked direction tags.

### 16.5 Provider strategy

| Provider mode | Role | Strength | Risk |
|---|---|---|---|
| Pre-generated expressive clips | Recommended primary | Reliable timing, consistent performance, offline playback | Less dynamic wording |
| Live expressive TTS | Optional enhancement | Can speak exact dynamic text | Network, latency, credentials, stale delivery |
| Browser speech synthesis | Fallback | Minimal external dependency | Device-dependent voices and inconsistent performance |
| Text-only subtitles | Required final fallback | Always readable | Loses performance layer |

Narration provider failure must degrade to subtitles rather than break gameplay.

### 16.6 Audio-director behavior

For a spoken line, the experience MAY:

1. Wait a short beat after the triggering event.
2. Play a small bard signature sound, such as a lute pluck or parchment scratch.
3. Duck music modestly.
4. Display the subtitle and play the voice together.
5. Restore music after the line.

Recommended sound signatures:

- Bright pluck for praise.
- Descending or unresolved pluck for mistakes.

Reverb should remain subtle. In a noisy room, intelligibility matters more than atmosphere.

### 16.7 Interruption behavior

- Death or victory may interrupt routine narration.
- A rare cursed-spell reaction may replace a queued ordinary success line.
- Low-priority comments should be dropped rather than played after their context is stale.
- Input and combat should continue while the bard speaks unless a deliberate ending state is active.

### 16.8 Pronunciation

Invented roots need a pronunciation dictionary or equivalent narration guidance. Display spelling and spoken form may differ. Pronunciation must be consistent across clips so repeated spells become learnable rather than confusing.

---

## 17. Interface and Information Architecture

### 17.1 One-screen principle

Active play should occur on one continuous screen. The player should not navigate between combat, spellbook, cooldown, and typing views.

### 17.2 Information hierarchy

| Priority | Information |
|---:|---|
| 1 | Exact incantation currently expected. |
| 2 | Player's live typing progress and errors. |
| 3 | Threat and urgency. |
| 4 | Immediate reason this spell is recommended. |
| 5 | Current cooldown/rotation context. |
| 6 | Bard subtitle and relationship feedback. |
| 7 | Score, streak, discoveries, and secondary metrics. |

### 17.3 Suggested screen regions

- Top: bard subtitle and optional portrait or emblem.
- Center: enemy, distance/time-to-impact, health, and defining trait.
- Primary focus: large recommended incantation.
- Input feedback: correct, current, and incorrect character states.
- Lower support area: recent casts and cooldown indicators.
- Corners: lives, score, streak, accuracy, or discoveries.

This is information architecture, not a mandated layout.

### 17.4 Visual feedback principles

- Typed progress should remain stable and easy to parse.
- Errors must use more than color alone.
- The active prompt should not move during typing.
- Cooldowns should be glanceable.
- A cast should visibly connect typed completion to enemy consequence.
- Misfires should be visually distinct from correct casts.
- Bard subtitles should not cover the current incantation.

### 17.5 Discovery interfaces

A full spellbook or `Forbidden Appendix` MAY appear between runs or as a compact secondary indicator. Discovery must not interrupt the typing rhythm. The player should not be expected to consult a 78-entry reference during combat.

---

## 18. Capability and Data Contracts

These contracts describe required information flow. They are not mandatory implementation schemas.

### 18.1 Spell record

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
  "typingDifficulty": {
    "characterCount": 17,
    "band": "medium"
  },
  "presentation": {
    "colorFamily": "ice-blue",
    "effectFamily": "fracture"
  }
}
```

### 18.2 Recommendation record

```json
{
  "spellId": "glacies_fractura",
  "targetId": "enemy_armor_01",
  "reasonCode": "ARMOR_COUNTER",
  "reasonLabel": "BEST VS. ARMOR",
  "eligibility": "READY",
  "scoreBand": "high",
  "estimatedCompletionBand": "safe",
  "alternatives": []
}
```

### 18.3 Game event

```json
{
  "eventId": "evt_00042",
  "type": "MISFIRE_CREATED",
  "timestamp": 0,
  "runContext": {
    "streak": 4,
    "lives": 2
  },
  "typingContext": {
    "expected": "ignis ventus",
    "received": "ignis ventis",
    "repeatCount": 2
  },
  "outcome": {
    "misfireId": "disappointed_goose",
    "severity": "comic_mixed"
  }
}
```

### 18.4 Bard selection result

```json
{
  "lineId": "typo_repeat_03",
  "eventId": "evt_00042",
  "priority": 85,
  "action": "PLAY_NOW",
  "subtitle": "Again? At this point, it may be tradition.",
  "audioAsset": "bard/typo_repeat_03.mp3"
}
```

### 18.5 Provider boundaries

Conceptual capabilities should remain separable:

- Input provider: emits normalized typing behavior.
- Recommendation provider: ranks eligible spells.
- Spell resolver: produces deterministic gameplay outcomes.
- Event stream: exposes meaningful transitions.
- Bard selector: chooses if and how to comment.
- Narration provider: converts a selected line into audible performance or fallback.
- Presentation layer: renders state without owning game truth.

---

## 19. Agent Team and Role Specifications

### 19.1 Coordination principle

Specialist agents should produce bounded decisions and artifacts. They should not independently reinterpret the entire concept or overwrite locked decisions. The Decision Steward integrates conflicts and maintains the canonical ledger.

### 19.2 Agent A0: Decision Steward / Orchestrator

**Mission:** Preserve concept coherence across agents and convert conflicts into explicit decisions.

**Owns:**

- Decision ledger.
- Scope tier.
- Cross-agent dependencies.
- Assumption and conflict tracking.
- Final integration approval.

**Inputs:** This document and all specialist outputs.

**Outputs:**

- Updated decision status.
- Conflict resolutions.
- Accepted/rejected change rationale.
- Current integration contract.

**Must not:** Invent implementation detail simply to resolve discomfort. Open questions may remain open until evidence is needed.

**Done signal:** No material contradiction exists between the feature narrative, mechanics, content, audio, and verification plan.

### 19.3 Agent A1: Research Scout

**Mission:** Gather primary evidence for questions that could materially change design or feasibility.

**Owns:**

- Adjacent-game research.
- Typing-game usability evidence.
- Voice/TTS capability research.
- Browser and audio constraints.
- Accessibility and input research.
- Evidence quality and citations.

**Outputs:**

- Evidence table.
- Supported findings.
- Contradictions and uncertainty.
- Implications for specific decision IDs.

**Must not:** Convert a popular convention into a requirement without relating it to the intended experience.

**Done signal:** Blocking uncertainties are supported by primary sources or clearly marked as requiring prototypes.

### 19.4 Agent A2: Feature Narrative / Player Experience Agent

**Mission:** Protect the emotional and experiential arc from first keypress through final bard verdict.

**Owns:**

- Player fantasy.
- First-session beats.
- Onboarding without tutorial burden.
- Moment-to-moment clarity.
- Demo handoff experience.

**Outputs:**

- Short and long feature narratives.
- Experience beat map.
- Confusion risks.
- Fresh-player comprehension criteria.

**Must not:** Add lore or presentation that obscures typing.

**Done signal:** A fresh player can understand the intended experience from the narrative without reading implementation notes.

### 19.5 Agent A3: Systems and State Architect

**Mission:** Define system responsibilities, state invariants, and transitions while leaving technology selection open.

**Owns:**

- Gameplay state model.
- Event boundaries.
- System capability contracts.
- Prompt locking and recovery behavior.
- Failure and restart behavior.

**Outputs:**

- State contract.
- Invariant list.
- Transition scenarios.
- Edge-case inventory.

**Must not:** Overdesign a framework before the identity floor is demonstrated.

**Done signal:** No normal or adversarial input path can leave the player with an invisible prompt, detached input, stale target, or softlock.

### 19.6 Agent A4: Recommendation and Balance Agent

**Mission:** Ensure recommendations are tactically meaningful, readable, stable, and compatible with human typing performance.

**Owns:**

- Ranking factors.
- Eligibility rules.
- Cooldown implications.
- Typing-speed adaptation.
- Recommendation explanations.
- Scenario-based balance evaluation.

**Outputs:**

- Ranking policy proposal.
- Test scenarios with expected recommendations.
- Dominance and cooldown analysis.
- Safe fallback behavior.

**Must not:** Optimize abstract combat value while ignoring phrase length, deadline, or player readability.

**Done signal:** Representative world states produce defensible, eligible, and stable prompts.

### 19.7 Agent A5: Spell Corpus and Content Agent

**Mission:** Produce a coherent pre-baked spell system whose breadth creates meaningful variation rather than cosmetic duplication.

**Owns:**

- Root vocabulary.
- Canonical pairs.
- Spell names.
- Tactical tags.
- Presentation metadata.
- Pronunciation notes.
- Corpus completeness and uniqueness.

**Outputs:**

- Machine-readable corpus.
- Root glossary.
- Combination rationale.
- Content validation report.
- Proposed active spellbook.

**Must not:** Treat a new name or color as sufficient mechanical uniqueness.

**Done signal:** Claimed combinations are complete, unique, pronounceable, internally consistent, and useful to the recommender.

### 19.8 Agent A6: Bard Comedy and Safety Agent

**Mission:** Write an event-aware commentary library in a single consistent character voice.

**Owns:**

- Character bible.
- Event line packs.
- Callback ladders.
- Praise-to-roast balance.
- Profanity and cruelty exclusions.
- Spoken-line brevity and cadence.

**Outputs:**

- Large candidate library.
- Curated final library.
- Rejection rationale for weak lines.
- Safety and repetition report.
- Performance-marked voice scripts.

**Must not:** Use generic insults, constant rhyme, profanity, identity attacks, or commentary detached from events.

**Done signal:** The curated pack is funny aloud, event-specific, non-repetitive in a short run, and recognizably spoken by one character.

### 19.9 Agent A7: Voice and Audio Director

**Mission:** Turn bard writing into a reliable performance and establish the audio priority system.

**Owns:**

- Voice audition criteria.
- Narration generation.
- Pronunciation dictionary.
- Audio timing.
- Music ducking and stingers.
- Provider fallback behavior.

**Outputs:**

- Voice comparison.
- Selected voice rationale.
- Bundled audio assets.
- Audio manifest.
- Interruption and fallback rules.

**Must not:** Make runtime network access necessary for understanding or progression.

**Done signal:** Representative lines land clearly in the actual demo environment without stale overlap.

### 19.10 Agent A8: UX and Accessibility Agent

**Mission:** Make the experience readable, keyboard-complete, and understandable under pressure.

**Owns:**

- Information hierarchy.
- Typing feedback.
- Prompt stability.
- Contrast and non-color cues.
- Captions.
- Focus and restart behavior.
- Reduced-motion and readability risks.

**Outputs:**

- Experience wireframe or layout contract.
- Keyboard-only journey.
- Accessibility findings.
- Fresh-player comprehension test.

**Must not:** Add navigation that competes with typing.

**Done signal:** A first-time player can begin, play, fail, recover, and restart without touching a mouse.

### 19.11 Agent A9: Builder / Integrator

**Mission:** Select appropriate implementation details and realize the accepted behavioral contracts.

**Owns:**

- Technical approach.
- Integration.
- Performance.
- Packaging.
- Runtime fallbacks.

**Inputs:** Accepted outputs from A0–A8.

**Outputs:** A playable artifact plus concise implementation notes and known limitations.

**Must not:** Quietly rewrite concept decisions because another implementation is easier. It may propose a scoped alternative with explicit tradeoffs.

**Done signal:** The accepted scope passes the relevant behavioral checks and can be demonstrated from a fresh start.

### 19.12 Agent A10: Verification and Adversarial Reviewer

**Mission:** Attempt to falsify claims of completeness, coherence, and reliability.

**Owns:**

- Acceptance checks.
- Failure injection.
- Corpus validation.
- State-transition testing.
- Audio overlap and fallback testing.
- Demo-environment rehearsal.

**Outputs:**

- Pass/fail evidence.
- Reproduction steps.
- Severity-ranked issues.
- Explicit ship blockers.

**Must not:** Mark a feature complete based only on code presence or a happy-path screenshot.

**Done signal:** Critical behaviors have been observed succeeding and relevant failure paths have been exercised.

### 19.13 Agent A11: Demo and Presentation Agent

**Mission:** Compress the system into a memorable, repeatable demonstration.

**Owns:**

- Demo sequence.
- Spoken pitch.
- Reset path.
- Fallback path.
- Agent-contribution explanation.

**Outputs:**

- 30–60 second demo script.
- Rehearsal checklist.
- Backup capture or fallback notes if appropriate.

**Must not:** Depend on a rare random event for the only compelling moment.

**Done signal:** The demo reliably shows one successful cast, one contextual rerank, one funny error, and one clear explanation of agent leverage.

### 19.14 Cross-agent handoff rules

- Agents return proposed changes with decision references.
- Research agents distinguish sourced fact, inference, and recommendation.
- Content agents conform to schemas accepted by systems and recommendation agents.
- Audio agents receive curated text, not the entire unfiltered candidate corpus.
- The builder receives approved contracts, not unresolved argument transcripts.
- Verification remains independent from completion claims.
- The Decision Steward records every material deviation.

---

## 20. Research Agenda

This section identifies what research should cover. It is not a claim that all research has already been completed.

### 20.1 Blocking or near-blocking research

| ID | Research question | Desired output | Design impact |
|---|---|---|---|
| R-001 | What audio and network conditions exist in the actual demo environment? | Reliability constraints and fallback requirements. | Determines pre-generation, preload, volume, and caption needs. |
| R-002 | Which available voice best delivers serious theatrical comedy? | Same-script blind audition across candidate voices. | Determines bard identity in practice. |
| R-003 | How are invented roots pronounced consistently by the selected voice? | Pronunciation dictionary and failed-word list. | Prevents audible incoherence. |
| R-004 | What phrase lengths remain readable and finishable under short threat windows? | Small scenario matrix across representative typing speeds. | Shapes active spellbook and recommendation safety. |
| R-005 | Does the chosen input environment reliably retain focus and support Backspace, Enter, Escape, and restart? | Keyboard behavior checklist. | Protects the central interaction. |

### 20.2 Core design research

| ID | Research area | Questions to investigate |
|---|---|---|
| R-101 | Typing-game precedents | How do successful typing games teach input, signal errors, scale phrase difficulty, and preserve rhythm? |
| R-102 | Spell-combination precedents | How do combination games make rules predictable rather than arbitrary? |
| R-103 | Adaptive difficulty | How can typing speed estimates stabilize quickly without oscillation or condescension? |
| R-104 | Recommendation trust | What explanation is enough for a player to understand why a prompt appeared? |
| R-105 | Cooldown rotation | What active set size creates variety without making availability meaningless? |
| R-106 | Comedy systems | What callback density and line frequency feel observant without becoming repetitive? |
| R-107 | TTS comedy | How do pause, pace, pitch, and underplayed delivery change perceived humor? |
| R-108 | Accessibility | What prompt styling and correction behavior support dyslexia, color-vision differences, and varying motor speed? |
| R-109 | Browser audio | What autoplay, preload, interruption, and device-voice constraints affect the selected environment? |
| R-110 | Short-session onboarding | Can a first-time player understand the loop without a separate tutorial screen? |

### 20.3 Content and balance research

- Root familiarity versus fantasy flavor.
- Similarity between incantations and accidental collisions.
- Character distribution and typing difficulty.
- Relationship between spell power, phrase length, cooldown, and urgency.
- Whether self-pairs are intuitive.
- Whether canonical ordering is learnable.
- Whether twelve active roots create sufficient semantic coherence.
- Whether misfires should be mostly harmful, mixed, or occasionally beneficial.
- How often a player should hear the bard during a 60–120 second session.
- Which line types remain funny after multiple runs.

### 20.4 Expansion research

- Multiple simultaneous recommendations.
- Player-selected active spellbooks.
- Persistent `Forbidden Appendix` discovery.
- Boss-specific spell rotations.
- Daily seeded challenges.
- Competitive typing score modes.
- Live dynamic bard lines with local fallback.
- Alternate bard personalities or line packs.
- Localization and language-specific incantation design.

### 20.5 Research standard

Research outputs should include:

- Source or observed evidence.
- Date and environment where relevant.
- Claim supported.
- Confidence.
- Contradictory evidence.
- Implication for a specific decision or open question.
- Whether a prototype is still required.

---

## 21. Verification and Acceptance Signals

These criteria express desired observable outcomes. They do not prescribe test frameworks.

### 21.1 Identity-floor acceptance criteria

| ID | Criterion |
|---|---|
| AC-ID-001 | A fresh player can identify the text to type within approximately five seconds. |
| AC-ID-002 | A full short run can be completed without touching a mouse. |
| AC-ID-003 | Exact completion visibly causes a magical cast and enemy consequence. |
| AC-ID-004 | At least one error path creates a funny, specific, understandable result. |
| AC-ID-005 | The bard produces at least one contextually correct reaction to success or failure. |
| AC-ID-006 | The game has a clear ending and immediate keyboard restart. |

### 21.2 Typing and prompt criteria

| ID | Criterion |
|---|---|
| AC-TYPE-001 | The typing surface is active without a mouse click after start/restart. |
| AC-TYPE-002 | Correct and incorrect characters are visually distinguishable without relying only on color. |
| AC-TYPE-003 | The active prompt cannot change after the first committed character. |
| AC-TYPE-004 | Backspace or the accepted correction behavior cannot detach the buffer from displayed progress. |
| AC-TYPE-005 | Exact completion casts once and only once. |
| AC-TYPE-006 | Unexpected input cannot softlock the run. |

### 21.3 Recommendation criteria

| ID | Criterion |
|---|---|
| AC-REC-001 | Every recommendation is currently eligible under the active rules. |
| AC-REC-002 | A spell on cooldown is not presented as immediately ready. |
| AC-REC-003 | Representative threat states produce defensible recommendation reasons. |
| AC-REC-004 | Equivalent state produces equivalent recommendation absent an explicit tie-break variation. |
| AC-REC-005 | The engine does not change the committed target or spell mid-typing. |
| AC-REC-006 | Typing-speed adaptation, if enabled, does not create rapid prompt oscillation. |

### 21.4 Corpus criteria

| ID | Criterion |
|---|---|
| AC-CORPUS-001 | The corpus contains the claimed number of unique canonical combinations. |
| AC-CORPUS-002 | Canonical ordering is consistent. |
| AC-CORPUS-003 | Every required record contains valid tactical and presentation metadata. |
| AC-CORPUS-004 | No unsupported tag or missing required identifier remains. |
| AC-CORPUS-005 | Near-duplicate spells have an explicit differentiator or are consolidated. |
| AC-CORPUS-006 | All active incantations can be displayed and pronounced acceptably. |

### 21.5 Cooldown and combat criteria

| ID | Criterion |
|---|---|
| AC-COMBAT-001 | Casting a spell updates its intended availability constraint. |
| AC-COMBAT-002 | Cooldown state changes at least one subsequent recommendation scenario. |
| AC-COMBAT-003 | Enemy impact or defeat cannot leave the resolver in an ambiguous state. |
| AC-COMBAT-004 | The player can understand the immediate reason for damage, success, or failure. |

### 21.6 Bard and narration criteria

| ID | Criterion |
|---|---|
| AC-BARD-001 | No shipped line contains profanity, slurs, or identity-based insults. |
| AC-BARD-002 | First-error and repeated-error lines are meaningfully different. |
| AC-BARD-003 | Routine commentary cannot indefinitely queue behind faster events. |
| AC-BARD-004 | A death or victory line can supersede stale low-priority commentary. |
| AC-BARD-005 | Recently played lines are protected from immediate repetition. |
| AC-BARD-006 | Every spoken line has a readable subtitle. |
| AC-BARD-007 | Narration failure does not halt combat or state progression. |
| AC-BARD-008 | Representative audio is intelligible in the actual room/device environment. |
| AC-BARD-009 | The selected voice sounds like one consistent character across the line pack. |

### 21.7 Demo criteria

| ID | Criterion |
|---|---|
| AC-DEMO-001 | The demo can reliably show a correct cast within the first encounter. |
| AC-DEMO-002 | The demo can deliberately trigger a known misfire without depending on random chance. |
| AC-DEMO-003 | The bard has a guaranteed relevant response for the demonstrated misfire. |
| AC-DEMO-004 | The build can restart cleanly from a fresh browser/session state. |
| AC-DEMO-005 | The core demonstration works without live model access. |
| AC-DEMO-006 | The agent contribution can be explained in one coherent sentence. |

### 21.8 Observability recommendations

A development or debug view SHOULD make it possible to inspect:

- Current gameplay state.
- Active prompt and locked target.
- Eligible and ineligible spells.
- Recommendation scores or reason codes.
- Cooldown values.
- Estimated typing rate.
- Emitted game events.
- Bard candidate filtering and selected line.
- Narration priority and fallback behavior.

Observability is for verification and tuning; it need not appear in the player-facing experience.

---

## 22. Scope Ladder

The ladder defines nested complete experiences. It is not a required production schedule.

### 22.1 Identity floor

The smallest version that still deserves the concept name:

- Keyboard-only start, play, and restart.
- One enemy at a time.
- One displayed recommended incantation.
- Small active spell set.
- Exact typing completion casts.
- At least one visible cooldown or availability change.
- One recoverable error path.
- One authored misfire.
- Text bard with event-specific success, error, and ending lines.
- Clear ending.

### 22.2 Target showcase

- Structured larger corpus with a bounded active spellbook.
- Several enemy archetypes that visibly change recommendations.
- Recommendation reason labels.
- Player typing-speed estimate.
- Multiple cooldown-driven rotations.
- Stateful bard callbacks.
- Approximately 25–40 curated pre-generated voice clips.
- Audio priority and subtitle fallback.
- Authored demo opening followed by bounded variation.

### 22.3 Enhanced showcase

- Deterministic cursed spells generated from invalid strings.
- `Forbidden Appendix` discovery display.
- `BEST`, `FAST`, and `RISK` typing options.
- Shared cooldown families or deeper combo logic.
- More sophisticated bard relationship states.
- Additional voice reactions for rare events.
- Persistent local discoveries.

### 22.4 Post-showcase expansion

- Player-selected spellbooks.
- Bosses and multi-phase encounters.
- Longer progression structure.
- Competitive or cooperative modes.
- Daily seeds.
- Localization.
- Live dynamic narration with robust local fallback.
- Community-generated or agent-generated line packs subject to validation.

### 22.5 Cut principle

When scope must shrink:

1. Cut corpus breadth.
2. Cut enemy variety.
3. Cut secondary metrics and discovery interfaces.
4. Cut audio variations.
5. Cut optional recommendation alternatives.

Do not cut the relationship between typing, magical consequence, and bard reaction. That relationship is the identity.

---

## 23. Risk and Failure-Mode Register

| ID | Risk | Why it matters | Guardrail or desired mitigation |
|---|---|---|---|
| F-001 | The concept becomes a generic word prompt game. | Random prompts would make combat metadata decorative. | Recommendations must visibly respond to threats and cooldowns. |
| F-002 | The concept drifts into mouse-driven spell selection. | It weakens the typing fantasy. | All required active-play choices remain keyboard-complete. |
| F-003 | The prompt changes mid-word. | It destroys trust immediately. | Lock prompt and target on commitment. |
| F-004 | The player is expected to learn 78 spells. | Short sessions cannot support the burden. | Surface the exact current incantation; keep corpus backstage. |
| F-005 | Cooldowns are meaningless because substitutes are unlimited. | Rotation becomes cosmetic. | Limit active spells or share meaningful cooldown families. |
| F-006 | One spell dominates whenever available. | Recommendations become repetitive. | Balance threat specificity, cost, phrase length, and availability. |
| F-007 | Typing-speed adaptation oscillates. | Prompts feel arbitrary or patronizing. | Stabilize estimates and update only at safe boundaries. |
| F-008 | Misfires reward random mashing more than accuracy. | The game stops valuing typing skill. | Keep cursed results mixed, bounded, and less reliable than correct casts. |
| F-009 | Bard lines are generic. | The system feels like a soundboard. | Key lines to specific events, history, and callbacks. |
| F-010 | Bard lines are too cruel. | The relationship becomes unpleasant. | Roast actions; enforce safety and tone checks. |
| F-011 | Bard speaks constantly. | Audio becomes noise and jokes arrive stale. | Priority, silence, cooldowns, and dropping stale events. |
| F-012 | Forced rhyme weakens writing. | Predictable meter becomes irritating. | Reserve couplets for milestones. |
| F-013 | TTS pronunciation breaks fantasy. | Invented roots sound inconsistent or comic unintentionally. | Audition, pronunciation guidance, replacements, and pre-generation. |
| F-014 | Live TTS fails in the room. | The signature personality disappears or blocks play. | Bundle primary clips and retain subtitles. |
| F-015 | Generated corpus contains incoherence. | Volume becomes visible sloppiness. | Schema validation, deduplication, tactical review, and human/agent curation. |
| F-016 | Visual effects obscure the prompt. | Spectacle competes with the mechanic. | Maintain information hierarchy and prompt stability. |
| F-017 | The demo depends on random luck. | The signature moment may not appear. | Author the opening and provide a deliberate misfire path. |
| F-018 | Architecture expands before fun is proven. | The build becomes technically impressive but unplayable. | Complete the identity floor before additional systems. |

---

## 24. Non-Goals and Anti-Features

The initial concept is not trying to become:

- A full role-playing game.
- A mouse-driven ability bar.
- A spellbook memorization exam.
- A free-text chatbot disguised as magic.
- A live-model dependency demonstration.
- A content-volume showcase without meaningful mechanics.
- A deep inventory or loadout manager.
- A procedural story generator.
- A cruel insult simulator.
- A constant-rhyme novelty act.
- A multiplayer service.
- An account-based progression platform.

The initial game MUST_NOT:

- Require browsing all canonical spells during combat.
- Randomly change the meaning of a valid known spell.
- Hide the expected phrase.
- Require clicking to restore focus after every cast.
- Queue narration indefinitely.
- Expose an API key in a distributed client.
- Allow audio failure to block the game.
- Claim completeness because files or records exist without observed behavior.

---

## 25. Open Questions

### 25.1 Questions requiring design judgment

1. Is one recommendation enough for the long-term game, or only for the prototype?
2. What form of agency should emerge after basic typing mastery?
3. Should the player be able to deliberately type a non-recommended known spell?
4. Should root order remain canonicalized or become meaningful in an advanced mode?
5. How much tactical explanation can appear without cluttering the typing surface?
6. What relationship should exist between phrase difficulty and magical power?
7. What proportion of misfires should help, harm, or produce mixed outcomes?
8. Does persistent cursed-spell discovery strengthen the loop or distract from speed?
9. How visible should the bard be as a character versus a voice and subtitle?
10. Is `SPELLCHECK` the final title or a prototype name?

### 25.2 Questions best answered through prototypes

1. Does auto-cast on final character feel better than Enter-to-cast?
2. How long can a line be before narration lags behind play?
3. How many active spells create recognizable rotation?
4. What minimum time-to-impact feels urgent but fair across typing speeds?
5. Does an on-screen recommendation reason improve trust?
6. How quickly can typing speed be estimated usefully?
7. Does a panic misfire at threat impact feel funny or unfair?
8. Which voice is funniest when paired with the actual line library?
9. How much audio ducking is necessary in the target environment?
10. Which visual feedback makes errors clear without interrupting rhythm?

### 25.3 Questions that should remain deferred

- Monetization.
- Large-scale persistence.
- Social features.
- Competitive matchmaking.
- Content marketplace.
- Live community moderation.
- Production localization pipeline.

These should not shape the identity-floor architecture unless a genuine constraint requires it.

---

## 26. Presentation and Demo Narrative

### 26.1 Presentation thesis

> “The game continuously calculates the best available spell, but the player still has to perform it. As it learns how quickly you type and watches cooldowns and enemies, it changes what it believes you can finish. When you get it wrong, the error becomes magic—and the bard makes sure history remembers.”

### 26.2 Recommended short demonstration

1. Start from a clean state using only the keyboard.
2. Let the bard establish ceremonial optimism.
3. Show the first recommendation and its concise tactical reason.
4. Type it correctly and let the cast visibly resolve.
5. Point out that the used spell is unavailable and the recommendation changed.
6. Deliberately enter a known near-miss.
7. Trigger a memorable misfire, ideally the disappointed goose or an equivalent authored incident.
8. Let the bard land a specific roast.
9. If stable, hand the keyboard to another player.

### 26.3 Agent-contribution line

> “The agent did not just write the code or generate random dialogue. It helped define and validate a coherent spell corpus, create the recommendation metadata, write event-aware bard material, and produce the voice performance. The shipped game then runs deterministically without needing the model online.”

### 26.4 Memorable demo line

> “Type what the grimoire recommends. Or misspell it and discover what the universe thought you meant.”

### 26.5 Demo reliability requirements

- The first correct cast is deterministic.
- The showcased cooldown rerank is deterministic.
- The showcased typo maps to a known misfire.
- The associated bard clip is preloaded.
- Subtitles exist if audio fails.
- Restart is immediate.
- A backup path does not require editing state live.

---

## 27. Instructions for Downstream Agents

### 27.1 Before acting

Each agent should answer internally or explicitly:

- What outcome am I responsible for?
- Which decision IDs govern this work?
- What assumptions am I making?
- What evidence or behavior could falsify my proposal?
- What other agent depends on my output?
- Am I adding scope or strengthening the core relationship?

### 27.2 Change proposal contract

A material change proposal should contain:

- Proposed change.
- Decision IDs affected.
- Problem being solved.
- Evidence or observed behavior.
- Expected experience impact.
- New risks introduced.
- Acceptance signal.
- Reversal or fallback option.

### 27.3 Completion contract

An agent must not declare work complete because:

- A file exists.
- A function exists.
- A prompt produced output.
- A visual appeared once.
- The happy path worked once.

Completion requires the relevant observable acceptance signals and explicit known limitations.

### 27.4 Content-generation contract

For generated spells, bard lines, or metadata:

1. Generate more candidates than will ship.
2. Validate structure automatically where possible.
3. Score or critique candidates against the relevant character or mechanic contract.
4. Curate the final set.
5. Preserve rejection reasons for recurring failure patterns.
6. Test content in its actual medium; bard writing must be heard, not only read.

### 27.5 Handoff contract

Every agent handoff should identify:

- What is settled.
- What remains uncertain.
- What downstream work can safely begin.
- What must not be inferred.
- Relevant artifacts and their version.
- Verification already completed.

---

## 28. Source and Research Notes

### 28.1 Event context

- Cursor community announcement: https://forum.cursor.com/t/new-event-cursor-ai-gaming-hackathon/167551
- Official event listing: https://luma.com/cursor-jl0y

The public listing described creating games using Grok and Cursor and presenting completed projects. It did not publish a detailed scoring rubric in the material reviewed during concept development.

### 28.2 xAI voice references

- Text-to-Speech documentation: https://docs.x.ai/developers/model-capabilities/audio/text-to-speech
- Voice overview: https://docs.x.ai/developers/model-capabilities/audio/voice

At the time reviewed, the documentation described expressive built-in voices, speed controls, pronunciation replacements, multiple audio formats, and inline or wrapping performance tags such as pauses, chuckles, sighs, whispers, emphasis, and speed changes.

### 28.3 Browser voice fallback

- SpeechSynthesisUtterance: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance
- SpeechSynthesis voices: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/getVoices

Browser speech synthesis can provide a fallback with voice, pitch, rate, and volume controls, but available voices depend on the current device and environment.

### 28.4 Prior-art research targets

Future research should inspect adjacent patterns rather than assume novelty from isolated mechanics. Useful categories include:

- Typing combat games.
- Element-combination magic systems.
- Spell-crafting systems.
- Reactive narrator systems.
- Adaptive difficulty and typing-speed estimation.
- MMO-style cooldown and rotation recommendation systems.
- Deterministic procedural naming and content composition.
- Audio-comedy timing in interactive systems.

Any novelty claim should be made about the specific integration and experience, not about the existence of typing, spells, generated content, or narrators individually.

---

## 29. Appendix A: Seed Bard Line Library

These are tone and quality references, not a final exhaustive corpus.

### 29.1 Opening

- “At last, our champion. The kingdom has chosen optimism.”
- “Your legend begins now. The spelling remains under review.”
- “History awaits. I have brought an eraser.”
- “The realm is counting on you. I have advised moderation.”

### 29.2 Ordinary correct cast

- “A proper spell. I may yet keep my contract.”
- “Correct, elegant, and deeply inconvenient to my material.”
- “Another clean cast. This is becoming difficult to mock.”
- “That was flawless. I shall deny saying so.”
- “Well cast. History may retain this paragraph.”

### 29.3 First typo

- “The spell was ancient. Your spelling was… experimental.”
- “Almost perfect. Magic, regrettably, is very specific.”
- “One letter wandered off. It has taken the battle with it.”
- “A bold interpretation of the alphabet.”
- “The intention was heroic. The consonants had other plans.”

### 29.4 Close miss

- “One vowel from glory. Several feathers from dignity.”
- “You requested wind. The universe heard goose.”
- “Nearly correct—which magic recognizes as completely incorrect.”
- “A single letter misplaced. An entire outcome reconsidered.”

### 29.5 Repeated mistake

- “Again? At this point, it may be tradition.”
- “The spellbook has begun taking this personally.”
- “Your confidence remains impressive. The word remains unchanged.”
- “We have tested that spelling thoroughly. It remains unhelpful.”
- “The alphabet has declined your appeal.”

### 29.6 Slow typing

- “A magnificent incantation. Tragically, the battle has ended.”
- “Take your time. The monster has chosen not to.”
- “The spell is nearly ready. The enemy is considerably readier.”
- “A lovely recital. The situation preferred the shorter edition.”
- “Your pacing is regal. The danger is less patient.”

### 29.7 Panic misfire

- “Half a spell. All of the consequences.”
- “You have cast uncertainty. It is effective on everyone.”
- “The spell was unfinished. The disaster appears complete.”
- “A panic cast—less strategy, more punctuation.”
- “Something has happened. Scholarship will require time.”

### 29.8 Repeated spell or narrow strategy

- “Fire again. Subtlety continues its day off.”
- “A third fireball. Narrow range; radiant commitment.”
- “Your strategy has one chapter. It is admittedly quite warm.”
- “Another flame. The element of surprise has filed a complaint.”
- “Consistency is a virtue. Variety has requested representation.”

### 29.9 Overkill

- “The creature had three health. You altered the local climate.”
- “Victory achieved. Geography reconsidered.”
- “A decisive response to a remarkably small problem.”
- “The enemy is defeated. Its neighboring villages remain concerned.”
- “The threat is gone. Several unrelated objects have joined it.”

### 29.10 Comeback

- “Competence has arrived. Fashionably late, but welcome.”
- “From catastrophe to control. A stirring little recovery.”
- “You live—against momentum and expectation.”
- “A recovery worthy of legend. Please disregard the opening chapters.”
- “There it is. The heroism I was instructed to document.”

### 29.11 Idle hesitation

- “The enemy approaches. Your keyboard appears contemplative.”
- “Any moment now. Preferably before the biting.”
- “A thoughtful pause. The monster is voting against it.”
- “History waits for no one. The enemy appears to agree.”

### 29.12 Victory

- “You have prevailed. I shall revise my earlier notes.”
- “The kingdom is safe. The dictionary is pleasantly surprised.”
- “Against spelling, timing, and several predictions—you won.”
- “A genuine triumph. How inconvenient for my closing joke.”

### 29.13 Game over

- “Here fell our hero: brave, bold, and one vowel short.”
- “The kingdom remains endangered. The dictionary feels vindicated.”
- “Your legend was brief, but the spelling was adventurous.”
- “History shall remember this kindly. I shall not.”
- “The monsters prevailed. Grammar remains undefeated.”

### 29.14 Milestone couplets

> “You shaped the storm, you held the line;  
> Against all odds, you spelled it fine.”

> “The flame was bright, the aim was true;  
> I’m mildly shocked it came from you.”

> “The beast prevailed, the bells now toll;  
> One missing vowel consumed the whole.”

### 29.15 Example 45-second relationship sequence

1. Opening: “At last, our champion. The kingdom has chosen optimism.”
2. First success: “A proper spell. I may yet keep my contract.”
3. First goose misfire: “You requested wind. The universe heard goose.”
4. Repeated mistake: “Again? At this point, it may be tradition.”
5. Recovery: “Competence has arrived. Fashionably late, but welcome.”
6. Defeat: “Here fell our hero: brave, bold, and one vowel short.”

The sequence demonstrates why stateful callbacks are more valuable than indiscriminate line volume.

---

## 30. Appendix B: Agent Output Template

Downstream agents should use or adapt this structure for material work:

```yaml
agent_role: "A# - Role Name"
task_id: "unique-task-id"
artifact_version: "0.1"
status: "proposal | validated | rejected | blocked"
objective: "Observable outcome owned by this task"
decision_refs:
  - "D-###"
open_question_refs:
  - "O-###"
assumptions:
  - id: "A-001"
    statement: "Explicit assumption"
    confidence: "low | medium | high"
evidence:
  - source: "URL, test, observation, or artifact"
    supports: "Claim supported"
proposal:
  summary: "What should change or be created"
  experience_effect: "What the player will perceive"
constraints_preserved:
  - "Relevant invariant"
risks:
  - risk: "New or remaining risk"
    severity: "low | medium | high | critical"
verification:
  acceptance_refs:
    - "AC-..."
  observed_results:
    - "Result or pending check"
unresolved:
  - "Question requiring decision or evidence"
handoff:
  next_agent: "A#"
  ready_inputs:
    - "Artifact or decision available"
  must_not_infer:
    - "Boundary that remains unresolved"
```

---

## Final Concept Check

Before any agent expands this design, it should be able to answer yes to the following:

- Is typing still the primary play action?
- Does the player always know what to type?
- Does combat state meaningfully influence the prompt?
- Does the prompt remain stable during commitment?
- Do cooldowns alter the rotation?
- Does correct typing create obvious magic?
- Can failure create a memorable but bounded consequence?
- Does the bard sound like one observant character?
- Can the critical loop run without a live model?
- Is breadth being validated rather than merely generated?
- Can the experience be shown clearly in under two minutes?

If several answers are no, the work has likely expanded away from the concept rather than deepened it.
