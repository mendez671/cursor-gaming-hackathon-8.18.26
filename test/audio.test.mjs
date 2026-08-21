import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAST_LINE_DELAY_MS,
  createDirector,
  GOOSE_LINE_DELAY_MS,
  TICK_GAP_MS,
  soundView,
} from "../src/audio/director.ts";
import { pickSeriousVoice, stripSpeechMarkup } from "../src/audio/speech.ts";
import { createInitialState, reduce } from "../src/game/machine.ts";

function play(state, ...actions) {
  return actions.reduce((next, action) => reduce(next, action), state);
}

function forcePhrase(state, value) {
  return play(state, { type: "TYPE", value }, { type: "FORCE_CAST" });
}

function testClock() {
  let t = 0;
  const timers = [];
  return {
    now: () => t,
    schedule(fn, ms) {
      const token = { fn, at: t + ms, dead: false };
      timers.push(token);
      return token;
    },
    unschedule(id) {
      if (id) {
        id.dead = true;
      }
    },
    advance(ms) {
      t += ms;
      for (const timer of timers) {
        if (!timer.dead && timer.at <= t) {
          timer.dead = true;
          timer.fn();
        }
      }
    },
  };
}

function harness(extras = {}) {
  const spoken = [];
  const cancelled = [];
  const plays = [];
  const unlocks = [];
  const clips = [];
  const ended = [];
  const clock = testClock();
  const ports = {
    speak(text, meta) {
      spoken.push({ text, lineId: meta.lineId });
      ended.push(meta.onEnded);
    },
    cancel() {
      cancelled.push(true);
    },
    play(cue, family) {
      plays.push(family ? `${cue}:${family}` : cue);
    },
    unlock() {
      unlocks.push(true);
    },
    resetHardware() {
      cancelled.push("hw");
    },
    now: clock.now,
    schedule: clock.schedule,
    unschedule: clock.unschedule,
    ...extras,
  };
  if (extras.playClip) {
    ports.playClip = (lineId, onEnded) => {
      clips.push(lineId);
      return extras.playClip(lineId, onEnded);
    };
  }
  const director = createDirector(ports);
  return { director, spoken, cancelled, plays, unlocks, clips, ended, clock, ports };
}

describe("speech helpers", () => {
  it("strips performance tags and picks a serious English voice", () => {
    assert.equal(
      stripSpeechMarkup("At last. [pause] The kingdom [sigh] chose."),
      "At last. The kingdom chose.",
    );
    const picked = pickSeriousVoice([
      { name: "Zarvox", lang: "en-US" },
      { name: "Fred", lang: "en-US" },
      { name: "Samantha", lang: "en-US" },
      { name: "Daniel", lang: "en-GB" },
      { name: "Alice", lang: "it-IT" },
    ]);
    assert.equal(picked?.name, "Daniel");
  });
});

describe("audio director never gates combat", () => {
  it("queues the opening line and speaks it only after unlock", () => {
    const { director, spoken, unlocks, plays } = harness();
    const start = createInitialState();
    director.sync(null, soundView(start));

    assert.equal(director.snapshot().unlocked, false);
    assert.equal(spoken.length, 0);
    assert.equal(unlocks.length, 0);

    director.unlockFromKey();

    assert.equal(director.snapshot().unlocked, true);
    assert.equal(unlocks.length, 1);
    assert.equal(plays.includes("bed"), false);
    assert.equal(spoken[0]?.text, start.bardSubtitle);
    assert.equal(director.snapshot().lastCue, "bard");
    assert.equal(director.snapshot().lastLineId, "open_01");
    director.unlockFromKey();
    assert.equal(unlocks.length, 1);
    assert.equal(spoken.length, 1);
  });

  it("does not cancel a playing line for a lower-priority success", () => {
    const { director, spoken, cancelled, ended } = harness();
    const start = createInitialState();
    director.unlockFromKey();
    director.sync(null, soundView(start));
    assert.equal(spoken[0]?.lineId, "open_01");

    const cast = reduce(start, {
      type: "TYPE",
      value: start.recommendation.incantation,
    });
    director.sync(soundView(start), soundView(cast));

    assert.equal(cancelled.filter((item) => item === true).length, 0);
    assert.equal(spoken.length, 1);
    assert.equal(director.snapshot().playingLineId, "open_01");
    assert.equal(director.snapshot().pendingLineId, cast.bardLineId);

    ended[0]();
    assert.equal(spoken.at(-1)?.lineId, cast.bardLineId);
    assert.ok(cast.bardSubtitle.length > 0);
  });

  it("replaces a pending line and drops it when stale", () => {
    const { director, spoken, ended } = harness();
    const start = createInitialState();
    director.unlockFromKey();
    director.sync(null, soundView(start));

    const low = {
      ...soundView(start),
      bardLineId: "success_01",
      bardSubtitle: "A proper spell.",
      bardPriority: 20,
      lastOutcome: "cast",
    };
    director.sync(soundView(start), low);
    assert.equal(director.snapshot().pendingLineId, "success_01");

    const mid = {
      ...low,
      bardLineId: "recover_01",
      bardSubtitle: "Competence has arrived.",
      bardPriority: 40,
      lastOutcome: "cast",
    };
    director.sync(low, mid);
    assert.equal(director.snapshot().pendingLineId, "recover_01");

    const moved = {
      ...mid,
      bardLineId: "typo_repeat_01",
      bardSubtitle: "Again?",
      bardPriority: 40,
    };
    director.sync(mid, moved);
    ended[0]();
    assert.equal(spoken.length, 1);
    assert.equal(spoken[0].lineId, "open_01");
  });

  it("interrupts routine speech for goose and delays the line", () => {
    const { director, spoken, plays, cancelled, clock } = harness();
    const start = createInitialState();
    director.unlockFromKey();
    director.sync(null, soundView(start));
    const goose = forcePhrase(start, "ignis ventis");

    const result = director.sync(soundView(start), soundView(goose));
    assert.equal(result, undefined);
    assert.ok(plays.includes("goose"));
    assert.ok(cancelled.includes(true));
    assert.equal(spoken.length, 1);
    assert.equal(spoken[0].lineId, "open_01");

    clock.advance(GOOSE_LINE_DELAY_MS - 1);
    assert.equal(spoken.length, 1);
    clock.advance(1);
    assert.equal(spoken.at(-1)?.text, goose.bardSubtitle);
    assert.ok(goose.bardSubtitle.length > 0);
    assert.equal(director.snapshot().pendingLineId, null);
  });

  it("clears a stale pending line when a higher-priority line interrupts", () => {
    const { director } = harness();
    const start = createInitialState();
    director.unlockFromKey();
    director.sync(null, soundView(start));
    const success = {
      ...soundView(start),
      bardLineId: "success_01",
      bardSubtitle: "A proper spell.",
      bardPriority: 20,
      lastOutcome: "cast",
    };
    director.sync(soundView(start), success);
    assert.equal(director.snapshot().pendingLineId, "success_01");
    const goose = forcePhrase(start, "ignis ventis");
    director.sync(success, soundView(goose));
    assert.equal(director.snapshot().pendingLineId, null);
    assert.equal(director.snapshot().playingLineId, goose.bardLineId);
  });

  it("delays cast narration so the sting is not the first syllable", () => {
    const { director, spoken, plays, clock } = harness();
    const start = createInitialState();
    director.unlockFromKey();
    const cast = reduce(start, {
      type: "TYPE",
      value: start.recommendation.incantation,
    });
    director.sync(soundView(start), soundView(cast));
    assert.ok(plays.some((cue) => String(cue).startsWith("cast")));
    assert.equal(spoken.length, 0);
    clock.advance(CAST_LINE_DELAY_MS);
    assert.equal(spoken[0]?.lineId, cast.bardLineId);
  });

  it("dedupes the same line across remount-style syncs", () => {
    const { director, spoken, cancelled } = harness();
    const start = createInitialState();
    director.unlockFromKey();
    director.sync(null, soundView(start));
    director.sync(null, soundView(start));
    director.sync(soundView(start), soundView(start));
    assert.equal(spoken.length, 1);
    assert.equal(cancelled.filter((item) => item === true).length, 0);
  });

  it("restart cancels speech and allows the opening line again", () => {
    const { director, spoken, cancelled } = harness();
    const start = createInitialState();
    director.unlockFromKey();
    director.sync(null, soundView(start));
    director.reset();
    assert.ok(cancelled.length >= 1);
    assert.equal(director.snapshot().playingLineId, null);
    assert.equal(director.snapshot().pendingLineId, null);

    const again = createInitialState();
    director.sync(null, soundView(again));
    assert.equal(spoken.at(-1)?.lineId, "open_01");
    assert.equal(spoken.filter((row) => row.lineId === "open_01").length, 2);
  });

  it("machine still advances if speechSynthesis.speak throws", () => {
    const { director, ports, plays } = harness();
    ports.speak = () => {
      throw new Error("speechSynthesis.speak failed");
    };
    const start = createInitialState();
    director.unlockFromKey();
    assert.doesNotThrow(() => director.sync(null, soundView(start)));
    assert.equal(start.phase, "READY");
    assert.ok(start.bardSubtitle.length > 0);

    const resolving = reduce(start, {
      type: "TYPE",
      value: start.recommendation.incantation,
    });
    assert.equal(resolving.phase, "RESOLVING");
    assert.doesNotThrow(() => director.sync(soundView(start), soundView(resolving)));
    assert.equal(resolving.phase, "RESOLVING");
    assert.ok(plays.some((cue) => String(cue).startsWith("cast")));
  });

  it("swallows play() throws and rejected play() promises", async () => {
    const { director, ports } = harness();
    let calls = 0;
    ports.play = () => {
      calls += 1;
      if (calls === 1) {
        return Promise.reject(new Error("NotAllowedError"));
      }
      throw new Error("The play() request was interrupted");
    };
    const start = createInitialState();
    const resolving = reduce(start, {
      type: "TYPE",
      value: start.recommendation.incantation,
    });
    assert.doesNotThrow(() => director.unlockFromKey());
    assert.doesNotThrow(() => director.sync(soundView(start), soundView(resolving)));
    await Promise.resolve();
    assert.equal(resolving.phase, "RESOLVING");
  });

  it("uses a clip when present and does not also speak", () => {
    const clips = [];
    const { director, spoken } = harness({
      playClip(lineId, onEnded) {
        clips.push(lineId);
        onEnded();
        return true;
      },
    });
    const start = createInitialState();
    director.unlockFromKey();
    director.sync(null, soundView(start));
    assert.deepEqual(clips, ["open_01"]);
    assert.equal(spoken.length, 0);
    assert.equal(director.snapshot().lastLineId, "open_01");
  });

  it("falls through to speech once when the clip is missing", () => {
    const { director, spoken } = harness({
      playClip() {
        return false;
      },
    });
    const start = createInitialState();
    director.unlockFromKey();
    director.sync(null, soundView(start));
    assert.equal(spoken.length, 1);
    assert.equal(spoken[0].text.includes("[pause]"), false);
  });

  it("throttles correct ticks and still marks an incorrect glyph", () => {
    const { director, plays, clock } = harness();
    const start = createInitialState();
    director.unlockFromKey();
    const one = reduce(start, { type: "TYPE", value: "i" });
    director.sync(soundView(start), soundView(one));
    const two = reduce(one, { type: "TYPE", value: "ig" });
    director.sync(soundView(one), soundView(two));
    assert.equal(plays.filter((cue) => cue === "tick").length, 1);

    clock.advance(TICK_GAP_MS);
    const three = reduce(two, { type: "TYPE", value: "ign" });
    director.sync(soundView(two), soundView(three));
    assert.equal(plays.filter((cue) => cue === "tick").length, 2);

    const wrong = reduce(three, { type: "TYPE", value: "ignx" });
    director.sync(soundView(three), soundView(wrong));
    assert.ok(plays.includes("error"));
    assert.ok(wrong.bardSubtitle.length > 0);
  });

  it("stings once per threat and again after restart", () => {
    const { director, plays } = harness();
    const start = createInitialState();
    director.unlockFromKey();
    const far = soundView(start);
    const near = { ...far, ttiRatio: 0.18 };
    director.sync(far, near);
    director.sync(near, { ...near, ttiRatio: 0.1 });
    assert.equal(plays.filter((cue) => cue === "sting").length, 1);

    director.reset();
    const fresh = soundView(createInitialState());
    director.sync(fresh, { ...fresh, ttiRatio: 0.18 });
    assert.equal(plays.filter((cue) => cue === "sting").length, 2);
  });
});
