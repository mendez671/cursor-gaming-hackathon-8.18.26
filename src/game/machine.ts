import {
  considerBard,
  emptyBardMemory,
  type BardEvent,
  type BardMemory,
} from "./bard";
import { assertBook } from "./bookAudit";
import {
  OPENING,
  RULES,
  SPELLS,
  THREATS,
  lookupMisfire,
  normalizeCasterInput,
  normalizeIncantation,
  openingRecommendation,
  type Recommendation,
  type Threat,
} from "./content";
import { rank } from "./rank";

assertBook(SPELLS, THREATS, OPENING.forcedSpellId);

export type Phase = "READY" | "TYPING" | "RESOLVING" | "AFTERMATH";
export type Outcome =
  | "none"
  | "cast"
  | "fizzle"
  | "cancel"
  | "empty_hit"
  | "panic"
  | "goose";
export type RunResult = "none" | "won" | "lost";

export type GameState = {
  phase: Phase;
  buffer: string;
  heldBuffer: string;
  promptLocked: boolean;
  recommendation: Recommendation;
  threat: Threat;
  threatIndex: number;
  coolingIds: string[];
  castsThisRun: number;
  hits: number;
  ttiTotalMs: number;
  ttiRemainingMs: number;
  threatStruck: boolean;
  threatLanded: boolean;
  goosePresent: boolean;
  misfireId: string | null;
  lastOutcome: Outcome;
  runResult: RunResult;
  bardLineId: string | null;
  bardSubtitle: string;
  bardBusyPriority: number;
  bardMemory: BardMemory;
  firstTypoSpoken: boolean;
  lastInvalid: string;
  invalidCount: number;
  recover: boolean;
  spokeSuccess: boolean;
};

export type Action =
  | { type: "TYPE"; value: string }
  | { type: "FORCE_CAST" }
  | { type: "CANCEL" }
  | { type: "TICK"; deltaMs: number }
  | { type: "FINISH_RESOLVE" }
  | { type: "RESTART" };

function ttiMs(threat: Threat): number {
  return Math.round(threat.ttiSeconds * 1000);
}

function withClock(threat: Threat): Pick<GameState, "ttiTotalMs" | "ttiRemainingMs"> {
  const ms = ttiMs(threat);
  return { ttiTotalMs: ms, ttiRemainingMs: ms };
}

function hasWrong(expected: string, value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    if (value[i] !== expected[i]) {
      return true;
    }
  }
  return false;
}

function applyBard(
  state: GameState,
  event: BardEvent,
  interrupting: boolean,
): GameState {
  const result = considerBard(state.bardMemory, event, {
    lineId: state.bardLineId,
    subtitle: state.bardSubtitle,
    busyPriority: interrupting ? state.bardBusyPriority : 0,
  });
  return {
    ...state,
    bardMemory: result.memory,
    bardLineId: result.lineId,
    bardSubtitle: result.subtitle,
    bardBusyPriority: result.busyPriority,
  };
}

function noteInvalid(state: GameState, received: string): GameState {
  const key = normalizeIncantation(received);
  if (key === state.lastInvalid) {
    return { ...state, lastInvalid: key, invalidCount: state.invalidCount + 1 };
  }
  return { ...state, lastInvalid: key, invalidCount: 1 };
}

function beginGoose(state: GameState, hits: number, atImpact: boolean): GameState {
  const counted = noteInvalid(state, state.buffer);
  const repeat = counted.invalidCount >= 2;
  const voiced = applyBard(
    counted,
    repeat
      ? {
          name: "REPEATED_TYPO",
          repeatCount: counted.invalidCount,
        }
      : {
          name: "MISFIRE_CREATED",
          misfireId: "disappointed_goose",
          atImpact,
          firstErrorThisRun: !counted.firstTypoSpoken,
        },
    counted.phase === "RESOLVING",
  );
  return {
    ...voiced,
    phase: "RESOLVING",
    promptLocked: true,
    heldBuffer: "",
    hits,
    threatStruck: false,
    threatLanded: atImpact,
    goosePresent: true,
    misfireId: "disappointed_goose",
    lastOutcome: "goose",
    recover: true,
    firstTypoSpoken: true,
  };
}

function loseIfNeeded(state: GameState, hits: number): GameState | null {
  if (hits < RULES.loseHits) {
    return null;
  }
  const lost: GameState = {
    ...state,
    phase: "AFTERMATH",
    buffer: "",
    heldBuffer: "",
    promptLocked: false,
    hits,
    ttiRemainingMs: 0,
    threatStruck: false,
    threatLanded: true,
    runResult: "lost",
  };
  return applyBard(lost, { name: "PLAYER_DEFEATED" }, false);
}

function winRun(state: GameState, coolingIds: string[]): GameState {
  const won: GameState = {
    ...state,
    phase: "AFTERMATH",
    buffer: "",
    heldBuffer: "",
    promptLocked: false,
    coolingIds,
    threatStruck: true,
    threatLanded: false,
    goosePresent: false,
    runResult: "won",
  };
  return applyBard(won, { name: "RUN_WON" }, false);
}

function nextAfterCast(state: GameState): GameState {
  const coolingIds = state.coolingIds.includes(state.recommendation.spellId)
    ? state.coolingIds
    : [...state.coolingIds, state.recommendation.spellId];
  const nextIndex = state.threatIndex + 1;
  if (nextIndex >= THREATS.length) {
    return { ...winRun(state, coolingIds), bardBusyPriority: 0 };
  }
  const threat = THREATS[nextIndex];
  const recommendation = rank(SPELLS, threat, coolingIds);
  if (!recommendation) {
    return { ...winRun(state, coolingIds), bardBusyPriority: 0 };
  }
  return {
    ...state,
    phase: "READY",
    buffer: "",
    promptLocked: false,
    recommendation,
    threat,
    threatIndex: nextIndex,
    coolingIds,
    threatStruck: false,
    threatLanded: false,
    goosePresent: false,
    misfireId: null,
    lastOutcome: "cast",
    bardBusyPriority: 0,
    ...withClock(threat),
  };
}

function nextAfterMisfire(state: GameState): GameState {
  return {
    ...state,
    phase: "READY",
    buffer: "",
    promptLocked: false,
    threatStruck: false,
    threatLanded: false,
    goosePresent: false,
    misfireId: null,
    bardBusyPriority: 0,
  };
}

function nextAfterImpact(state: GameState): GameState {
  const lost = loseIfNeeded(state, state.hits);
  if (lost) {
    return lost;
  }
  return {
    ...state,
    phase: "READY",
    buffer: "",
    promptLocked: false,
    threatStruck: false,
    threatLanded: false,
    goosePresent: false,
    misfireId: null,
    bardBusyPriority: 0,
    ...withClock(state.threat),
  };
}

function applyHeld(state: GameState): GameState {
  const held = state.heldBuffer;
  const cleared = { ...state, heldBuffer: "" };
  if (!held || cleared.phase === "AFTERMATH") {
    return cleared;
  }
  return reduce(cleared, { type: "TYPE", value: held });
}

export function createInitialState(): GameState {
  const threat = THREATS[0];
  const base: GameState = {
    phase: "READY",
    buffer: "",
    heldBuffer: "",
    promptLocked: false,
    recommendation: openingRecommendation(),
    threat,
    threatIndex: 0,
    coolingIds: [],
    castsThisRun: 0,
    hits: 0,
    threatStruck: false,
    threatLanded: false,
    goosePresent: false,
    misfireId: null,
    lastOutcome: "none",
    runResult: "none",
    bardLineId: null,
    bardSubtitle: "",
    bardBusyPriority: 0,
    bardMemory: emptyBardMemory(),
    firstTypoSpoken: false,
    lastInvalid: "",
    invalidCount: 0,
    recover: false,
    spokeSuccess: false,
    ...withClock(threat),
  };
  return applyBard(
    base,
    { name: "THREAT_APPEARED", runStart: true },
    false,
  );
}

export function reduce(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "TYPE": {
      if (state.phase === "AFTERMATH") {
        return state;
      }
      const value = normalizeCasterInput(action.value);
      if (value === null) {
        return state;
      }
      if (state.phase === "RESOLVING") {
        if (value === state.heldBuffer) {
          return state;
        }
        return { ...state, heldBuffer: value };
      }
      if (value === state.recommendation.incantation) {
        const voiced = applyBard(
          state,
          state.recover
            ? { name: "PLAYER_RECOVERED", recovering: true }
            : {
                name: "CAST_COMPLETED",
                firstSuccess: !state.spokeSuccess,
              },
          false,
        );
        return {
          ...voiced,
          buffer: value,
          heldBuffer: "",
          promptLocked: true,
          phase: "RESOLVING",
          castsThisRun: state.castsThisRun + 1,
          threatStruck: true,
          threatLanded: false,
          lastOutcome: "cast",
          recover: false,
          spokeSuccess: true,
        };
      }
      if (value.length === 0) {
        return {
          ...state,
          buffer: "",
          promptLocked: false,
          phase: "READY",
        };
      }
      const mistyped = hasWrong(state.recommendation.incantation, value);
      if (mistyped && !state.firstTypoSpoken) {
        const voiced = applyBard(
          state,
          {
            name: "CHARACTER_INCORRECT",
            firstErrorThisRun: true,
          },
          false,
        );
        return {
          ...voiced,
          buffer: value,
          promptLocked: true,
          phase: "TYPING",
          firstTypoSpoken: true,
        };
      }
      return {
        ...state,
        buffer: value,
        promptLocked: true,
        phase: "TYPING",
      };
    }
    case "TICK": {
      if (state.phase !== "READY" && state.phase !== "TYPING") {
        return state;
      }
      const remaining = state.ttiRemainingMs - action.deltaMs;
      if (remaining > 0) {
        return { ...state, ttiRemainingMs: remaining };
      }
      const hits = state.hits + 1;
      if (state.buffer.length === 0) {
        return {
          ...state,
          phase: "RESOLVING",
          promptLocked: true,
          heldBuffer: "",
          ttiRemainingMs: 0,
          hits,
          threatStruck: false,
          threatLanded: true,
          goosePresent: false,
          misfireId: null,
          lastOutcome: "empty_hit",
          recover: true,
        };
      }
      const misfire = lookupMisfire(state.buffer);
      if (misfire.id === "disappointed_goose") {
        return beginGoose({ ...state, ttiRemainingMs: 0 }, hits, true);
      }
      const voiced = applyBard(
        { ...state, recover: true, firstTypoSpoken: true },
        {
          name: "MISFIRE_CREATED",
          misfireId: misfire.id,
          atImpact: true,
        },
        false,
      );
      return {
        ...voiced,
        phase: "RESOLVING",
        promptLocked: true,
        heldBuffer: "",
        ttiRemainingMs: 0,
        hits,
        threatStruck: false,
        threatLanded: true,
        goosePresent: false,
        misfireId: misfire.id,
        lastOutcome: "panic",
        recover: true,
        firstTypoSpoken: true,
      };
    }
    case "FORCE_CAST": {
      if (state.phase === "RESOLVING" || state.phase === "AFTERMATH") {
        return state;
      }
      if (state.buffer.length === 0) {
        return state;
      }
      if (state.buffer === state.recommendation.incantation) {
        return state;
      }
      const misfire = lookupMisfire(state.buffer);
      if (misfire.id === "disappointed_goose") {
        return beginGoose(state, state.hits, false);
      }
      return {
        ...state,
        phase: "RESOLVING",
        promptLocked: true,
        heldBuffer: "",
        goosePresent: false,
        misfireId: misfire.id,
        lastOutcome: "fizzle",
        threatStruck: false,
        threatLanded: false,
        recover: true,
      };
    }
    case "CANCEL": {
      if (state.phase === "AFTERMATH") {
        return createInitialState();
      }
      if (state.phase === "RESOLVING") {
        return state;
      }
      return {
        ...state,
        buffer: "",
        promptLocked: false,
        phase: "READY",
        lastOutcome: "cancel",
      };
    }
    case "FINISH_RESOLVE": {
      if (state.phase !== "RESOLVING") {
        return state;
      }
      if (state.lastOutcome === "cast") {
        return applyHeld(nextAfterCast(state));
      }
      if (state.lastOutcome === "empty_hit" || state.lastOutcome === "panic") {
        return applyHeld(nextAfterImpact(state));
      }
      if (state.lastOutcome === "goose" || state.lastOutcome === "fizzle") {
        return applyHeld(nextAfterMisfire(state));
      }
      return applyHeld({
        ...state,
        phase: "READY",
        promptLocked: false,
        bardBusyPriority: 0,
      });
    }
    case "RESTART": {
      return createInitialState();
    }
    default:
      return state;
  }
}

export type GlyphStatus = "pending" | "correct" | "incorrect";

export type Glyph = {
  ch: string;
  status: GlyphStatus;
  typed?: string;
};

export function glyphs(expected: string, buffer: string): Glyph[] {
  const out: Glyph[] = [];
  const limit = Math.max(expected.length, buffer.length);
  for (let i = 0; i < limit; i += 1) {
    const ch = expected[i] ?? "";
    const typed = buffer[i];
    if (typed === undefined) {
      out.push({ ch, status: "pending" });
    } else if (ch !== "" && typed === ch) {
      out.push({ ch, status: "correct" });
    } else {
      out.push({ ch: ch || typed, status: "incorrect", typed });
    }
  }
  return out;
}
