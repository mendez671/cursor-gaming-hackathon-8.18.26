import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { considerBard, emptyBardMemory } from "../src/game/bard.ts";
import { assertBook } from "../src/game/bookAudit.ts";
import {
  OPENING,
  SPELLS,
  THREATS,
  lookupMisfire,
  normalizeCasterInput,
  openingRecommendation,
} from "../src/game/content.ts";
import { createInitialState, reduce } from "../src/game/machine.ts";
import { isReady, rank } from "../src/game/rank.ts";

function play(state, ...actions) {
  return actions.reduce((next, action) => reduce(next, action), state);
}

function exactCast(state) {
  return play(
    state,
    { type: "TYPE", value: state.recommendation.incantation },
    { type: "FINISH_RESOLVE" },
  );
}

function forcePhrase(state, value) {
  return play(state, { type: "TYPE", value }, { type: "FORCE_CAST" });
}

function emptyImpact(state) {
  return play(
    state,
    { type: "TICK", deltaMs: state.ttiRemainingMs },
    { type: "FINISH_RESOLVE" },
  );
}

describe("exact-cast once", () => {
  it("auto-casts the opening phrase exactly once", () => {
    const start = createInitialState();
    const resolving = reduce(start, {
      type: "TYPE",
      value: start.recommendation.incantation,
    });

    assert.equal(start.recommendation.incantation, "ignis ventus");
    assert.equal(resolving.phase, "RESOLVING");
    assert.equal(resolving.lastOutcome, "cast");
    assert.equal(resolving.castsThisRun, 1);
    assert.equal(resolving.threatStruck, true);
    assert.equal(resolving.promptLocked, true);

    const heldType = reduce(resolving, {
      type: "TYPE",
      value: start.recommendation.incantation,
    });
    const ignoredEnter = reduce(resolving, { type: "FORCE_CAST" });

    assert.equal(heldType.phase, "RESOLVING");
    assert.equal(heldType.castsThisRun, 1);
    assert.equal(heldType.lastOutcome, "cast");
    assert.equal(heldType.heldBuffer, start.recommendation.incantation);
    assert.equal(ignoredEnter, resolving);
  });
});

describe("resolve hold buffers the next phrase", () => {
  it("applies keys typed during RESOLVING to the following prompt", () => {
    const start = createInitialState();
    const resolving = reduce(start, {
      type: "TYPE",
      value: start.recommendation.incantation,
    });
    const held = reduce(resolving, { type: "TYPE", value: "gla" });
    const next = reduce(held, { type: "FINISH_RESOLVE" });

    assert.equal(held.phase, "RESOLVING");
    assert.equal(held.heldBuffer, "gla");
    assert.equal(held.buffer, "ignis ventus");
    assert.equal(next.phase, "TYPING");
    assert.equal(next.buffer, "gla");
    assert.equal(next.heldBuffer, "");
    assert.equal(next.recommendation.incantation, "glacies fractura");
    assert.equal(next.promptLocked, true);
  });

  it("auto-casts if the held string is the next incantation", () => {
    const start = createInitialState();
    const resolving = reduce(start, {
      type: "TYPE",
      value: start.recommendation.incantation,
    });
    const held = reduce(resolving, { type: "TYPE", value: "glacies fractura" });
    const next = reduce(held, { type: "FINISH_RESOLVE" });

    assert.equal(next.phase, "RESOLVING");
    assert.equal(next.lastOutcome, "cast");
    assert.equal(next.recommendation.incantation, "glacies fractura");
    assert.equal(next.castsThisRun, 2);
  });

  it("keeps goose-hold keys on the same phrase after the hold", () => {
    const goose = forcePhrase(createInitialState(), "ignis ventis");
    const held = reduce(goose, { type: "TYPE", value: "ig" });
    const next = reduce(held, { type: "FINISH_RESOLVE" });

    assert.equal(goose.phase, "RESOLVING");
    assert.equal(next.phase, "TYPING");
    assert.equal(next.buffer, "ig");
    assert.equal(next.recommendation.incantation, "ignis ventus");
    assert.equal(next.threat.id, "emberling");
  });

  it("does not buffer during AFTERMATH", () => {
    let won = createInitialState();
    for (let wave = 0; wave < THREATS.length; wave += 1) {
      won = exactCast(won);
    }
    const typed = reduce(won, { type: "TYPE", value: "ignis" });
    assert.equal(won.phase, "AFTERMATH");
    assert.equal(typed, won);
    assert.equal(typed.buffer, "");
  });
});

describe("prompt lock", () => {
  it("locks the shown recommendation on the first committed glyph", () => {
    const start = createInitialState();
    const locked = reduce(start, { type: "TYPE", value: "i" });

    assert.equal(start.promptLocked, false);
    assert.equal(locked.promptLocked, true);
    assert.equal(locked.phase, "TYPING");
    assert.deepEqual(locked.recommendation, start.recommendation);

    const afterTick = reduce(locked, { type: "TICK", deltaMs: 250 });
    assert.deepEqual(afterTick.recommendation, start.recommendation);
    assert.equal(afterTick.promptLocked, true);

    const cleared = reduce(locked, { type: "TYPE", value: "" });
    assert.equal(cleared.promptLocked, false);
    assert.equal(cleared.phase, "READY");
  });
});

describe("input normalization", () => {
  it("normalizes Caps Lock input while preserving edits and rejecting non-caster glyphs", () => {
    assert.equal(normalizeCasterInput("IGNIS VENTUS"), "ignis ventus");
    assert.equal(normalizeCasterInput("IGN🔥"), null);

    const start = createInitialState();
    const wrong = reduce(start, { type: "TYPE", value: "IGNX" });
    assert.equal(wrong.buffer, "ignx");
    assert.equal(wrong.promptLocked, true);
    assert.equal(wrong.firstTypoSpoken, true);

    const erased = reduce(wrong, { type: "TYPE", value: "IGN" });
    assert.equal(erased.buffer, "ign");
    assert.equal(erased.promptLocked, true);

    const rejected = reduce(erased, { type: "TYPE", value: "IGN🔥" });
    assert.equal(rejected, erased);

    const cast = reduce(erased, { type: "TYPE", value: "IGNIS VENTUS" });
    assert.equal(cast.phase, "RESOLVING");
    assert.equal(cast.lastOutcome, "cast");
  });
});

describe("spent spells are never recommended", () => {
  it("keeps a spent spell out of rank and the next prompt", () => {
    const afterFirst = exactCast(createInitialState());

    assert.deepEqual(afterFirst.coolingIds, ["ignis_ventus"]);
    assert.equal(afterFirst.recommendation.spellId, "glacies_fractura");
    assert.equal(afterFirst.recommendation.reasonLabel, "BEST VS. ARMOR");
    assert.equal(isReady("ignis_ventus", afterFirst.coolingIds), false);

    for (const threat of THREATS) {
      const pick = rank(SPELLS, threat, afterFirst.coolingIds);
      assert.ok(pick);
      assert.notEqual(pick.spellId, "ignis_ventus");
      assert.equal(isReady(pick.spellId, afterFirst.coolingIds), true);
    }

    assert.equal(rank(SPELLS, THREATS[0], SPELLS.map((spell) => spell.id)), null);
  });
});

describe("ignis ventis → goose", () => {
  it("force-casts the authored near-miss as the disappointed goose", () => {
    assert.equal(lookupMisfire("ignis ventis").id, "disappointed_goose");

    const goose = forcePhrase(createInitialState(), "ignis ventis");

    assert.equal(goose.lastOutcome, "goose");
    assert.equal(goose.goosePresent, true);
    assert.equal(goose.misfireId, "disappointed_goose");
    assert.equal(goose.threatStruck, false);
    assert.equal(goose.hits, 0);
    assert.equal(goose.threat.id, "emberling");
    assert.ok(["goose_01", "goose_02"].includes(goose.bardLineId));
  });
});

describe("empty impact ≠ goose", () => {
  it("counts an empty timeout as a hit, not a goose", () => {
    const start = createInitialState();
    const resolving = reduce(start, { type: "TICK", deltaMs: start.ttiRemainingMs });

    assert.equal(resolving.lastOutcome, "empty_hit");
    assert.equal(resolving.goosePresent, false);
    assert.equal(resolving.misfireId, null);
    assert.equal(resolving.hits, 1);
    assert.equal(resolving.threatLanded, true);
    assert.notEqual(lookupMisfire("").id, "disappointed_goose");
  });
});

describe("bard first vs repeat vs recover vs end", () => {
  it("picks first, repeat, recover, then ending lines in order", () => {
    const quiet = { lineId: null, subtitle: "", busyPriority: 0 };

    const first = considerBard(
      emptyBardMemory(),
      { name: "THREAT_APPEARED", runStart: true },
      quiet,
    );
    assert.equal(first.lineId, "open_01");

    const repeat = considerBard(
      first.memory,
      { name: "THREAT_APPEARED", runStart: true },
      { lineId: first.lineId, subtitle: first.subtitle, busyPriority: 0 },
    );
    assert.equal(repeat.lineId, "open_02");

    const recover = considerBard(
      repeat.memory,
      { name: "PLAYER_RECOVERED", recovering: true },
      { lineId: repeat.lineId, subtitle: repeat.subtitle, busyPriority: 0 },
    );
    assert.equal(recover.lineId, "recover_01");

    const end = considerBard(
      recover.memory,
      { name: "RUN_WON" },
      { lineId: recover.lineId, subtitle: recover.subtitle, busyPriority: 0 },
    );
    assert.equal(end.lineId, "win_01");
  });

  it("routes those same beats through the machine", () => {
    const start = createInitialState();
    assert.equal(start.bardLineId, "open_01");

    const firstGoose = forcePhrase(start, "ignis ventis");
    assert.equal(firstGoose.bardLineId, "goose_01");

    const again = forcePhrase(
      reduce(firstGoose, { type: "FINISH_RESOLVE" }),
      "ignis ventis",
    );
    assert.equal(again.bardLineId, "typo_repeat_01");

    const recovered = reduce(reduce(again, { type: "FINISH_RESOLVE" }), {
      type: "TYPE",
      value: start.recommendation.incantation,
    });
    assert.equal(recovered.bardLineId, "recover_01");

    let won = createInitialState();
    for (let wave = 0; wave < THREATS.length; wave += 1) {
      won = exactCast(won);
    }
    assert.equal(won.runResult, "won");
    assert.equal(won.phase, "AFTERMATH");
    assert.equal(won.bardLineId, "win_01");

    const lost = emptyImpact(emptyImpact(emptyImpact(createInitialState())));
    assert.equal(lost.runResult, "lost");
    assert.equal(lost.phase, "AFTERMATH");
    assert.equal(lost.bardLineId, "lose_01");
  });
});

describe("bookAudit", () => {
  it("accepts the shipped book and rejects a short one", () => {
    assert.doesNotThrow(() =>
      assertBook(SPELLS, THREATS, OPENING.forcedSpellId),
    );
    assert.equal(SPELLS.length, 10);
    assert.equal(openingRecommendation().spellId, "ignis_ventus");
    assert.throws(
      () => assertBook(SPELLS.slice(0, 9), THREATS, OPENING.forcedSpellId),
      /Expected 10 spells/,
    );
  });
});
