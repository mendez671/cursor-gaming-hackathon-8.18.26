import type { GameState } from "../game/machine";
import { stripSpeechMarkup } from "./speech";

export const GOOSE_LINE_DELAY_MS = 180;
export const CAST_LINE_DELAY_MS = 140;
export const TICK_GAP_MS = 95;

export type AudioCue =
  | "tick"
  | "error"
  | "cast"
  | "goose"
  | "bard"
  | "sting";

export type GameSoundView = {
  buffer: string;
  expected: string;
  lastOutcome: string;
  phase: string;
  bardLineId: string | null;
  bardSubtitle: string;
  bardPriority: number;
  family: string;
  threatId: string;
  ttiRatio: number;
  runResult: string;
  castsThisRun: number;
  hits: number;
};

export type SpeakMeta = {
  lineId: string;
  onEnded: () => void;
};

export type AudioPorts = {
  speak: (text: string, meta: SpeakMeta) => void;
  cancel: () => void;
  play: (cue: AudioCue, family?: string) => unknown;
  unlock: () => void;
  resetHardware?: () => void;
  playClip?: (lineId: string, onEnded: () => void) => boolean;
  now?: () => number;
  schedule?: (fn: () => void, ms: number) => unknown;
  unschedule?: (id: unknown) => void;
};

export type AudioSnapshot = {
  unlocked: boolean;
  lastCue: AudioCue | "";
  lastLineId: string | null;
  playingLineId: string | null;
  pendingLineId: string | null;
};

type HeldLine = {
  lineId: string;
  subtitle: string;
  priority: number;
};

export function soundView(state: GameState): GameSoundView {
  const total = state.ttiTotalMs;
  return {
    buffer: state.buffer,
    expected: state.recommendation.incantation,
    lastOutcome: state.lastOutcome,
    phase: state.phase,
    bardLineId: state.bardLineId,
    bardSubtitle: state.bardSubtitle,
    bardPriority: state.bardBusyPriority,
    family: state.recommendation.spellId,
    threatId: state.threat.id,
    ttiRatio: total <= 0 ? 0 : Math.max(0, state.ttiRemainingMs / total),
    runResult: state.runResult,
    castsThisRun: state.castsThisRun,
    hits: state.hits,
  };
}

function playSafe(
  ports: AudioPorts,
  cue: AudioCue,
  family: string | undefined,
  record: (cue: AudioCue) => void,
) {
  try {
    const result = ports.play(cue, family);
    if (result && typeof (result as Promise<unknown>).then === "function") {
      (result as Promise<unknown>).catch(() => undefined);
    }
  } catch {
    // Failed play() must not stall combat.
  }
  record(cue);
}

function isFreshRun(view: GameSoundView): boolean {
  return (
    view.phase === "READY" &&
    view.runResult === "none" &&
    view.castsThisRun === 0 &&
    view.hits === 0 &&
    view.lastOutcome === "none"
  );
}

export function createDirector(ports: AudioPorts) {
  const now = ports.now ?? Date.now;
  const schedule = ports.schedule ?? ((fn: () => void, ms: number) => setTimeout(fn, ms));
  const unschedule =
    ports.unschedule ?? ((id: unknown) => clearTimeout(id as ReturnType<typeof setTimeout>));

  let unlocked = false;
  let lastCue: AudioCue | "" = "";
  let lastLineId: string | null = null;
  let playing: HeldLine | null = null;
  let pending: HeldLine | null = null;
  let spokenIds = new Set<string>();
  let current: GameSoundView | null = null;
  let preUnlock: GameSoundView | null = null;
  let speakTimer: unknown = null;
  let lastTickAt = Number.NEGATIVE_INFINITY;
  let stungThreat = "";

  const record = (cue: AudioCue) => {
    lastCue = cue;
  };

  function clearSpeakTimer() {
    if (speakTimer !== null && speakTimer !== undefined) {
      unschedule(speakTimer);
      speakTimer = null;
    }
  }

  function interrupt() {
    clearSpeakTimer();
    if (playing) {
      try {
        ports.cancel();
      } catch {
        // cancel is garnish
      }
    }
    playing = null;
    pending = null;
  }

  function finishPlaying(lineId: string) {
    if (playing?.lineId !== lineId) {
      return;
    }
    playing = null;
    const next = pending;
    pending = null;
    if (!next) {
      return;
    }
    if (current && current.bardLineId !== next.lineId) {
      return;
    }
    if (spokenIds.has(next.lineId)) {
      return;
    }
    startLine(next, 0);
  }

  function startLine(line: HeldLine, delayMs: number) {
    clearSpeakTimer();
    playing = line;
    const deliver = () => {
      speakTimer = null;
      spokenIds.add(line.lineId);
      lastLineId = line.lineId;
      lastCue = "bard";
      const onEnded = () => finishPlaying(line.lineId);
      try {
        if (ports.playClip?.(line.lineId, onEnded)) {
          return;
        }
        ports.speak(stripSpeechMarkup(line.subtitle), {
          lineId: line.lineId,
          onEnded,
        });
      } catch {
        finishPlaying(line.lineId);
      }
    };
    if (delayMs <= 0) {
      deliver();
      return;
    }
    speakTimer = schedule(deliver, delayMs);
  }

  function offer(line: HeldLine, delayMs: number) {
    if (!line.lineId || !line.subtitle) {
      return;
    }
    if (playing?.lineId === line.lineId) {
      return;
    }
    if (spokenIds.has(line.lineId)) {
      return;
    }
    if (!playing) {
      startLine(line, delayMs);
      return;
    }
    if (line.priority > playing.priority) {
      interrupt();
      startLine(line, delayMs);
      return;
    }
    if (!pending || line.priority > pending.priority) {
      pending = line;
    }
  }

  function lineFrom(view: GameSoundView): HeldLine | null {
    if (!view.bardLineId || !view.bardSubtitle) {
      return null;
    }
    return {
      lineId: view.bardLineId,
      subtitle: view.bardSubtitle,
      priority: view.bardPriority,
    };
  }

  function offerFrom(view: GameSoundView, prev: GameSoundView | null) {
    const line = lineFrom(view);
    if (!line) {
      return;
    }
    let delay = 0;
    if (prev && view.lastOutcome === "goose" && prev.lastOutcome !== "goose") {
      delay = GOOSE_LINE_DELAY_MS;
    } else if (prev && view.lastOutcome === "cast" && prev.lastOutcome !== "cast") {
      delay = CAST_LINE_DELAY_MS;
    }
    offer(line, delay);
  }

  function reset() {
    interrupt();
    pending = null;
    spokenIds = new Set();
    stungThreat = "";
    lastTickAt = Number.NEGATIVE_INFINITY;
    lastCue = "";
    lastLineId = null;
    preUnlock = null;
    current = null;
    try {
      ports.resetHardware?.();
    } catch {
      // hardware reset is best-effort
    }
  }

  function unlockFromKey() {
    if (unlocked) {
      return;
    }
    unlocked = true;
    try {
      ports.unlock();
    } catch {
      // First-key unlock is best-effort.
    }
    const held = preUnlock;
    preUnlock = null;
    if (held) {
      current = held;
      offerFrom(held, null);
    }
  }

  function sync(prev: GameSoundView | null, next: GameSoundView) {
    if (prev && isFreshRun(next) && !isFreshRun(prev)) {
      reset();
    }
    current = next;
    if (!unlocked) {
      preUnlock = next;
      return;
    }
    if (prev) {
      if (next.lastOutcome === "goose" && prev.lastOutcome !== "goose") {
        playSafe(ports, "goose", undefined, record);
      } else if (next.lastOutcome === "cast" && prev.lastOutcome !== "cast") {
        playSafe(ports, "cast", next.family, record);
      } else if (
        next.phase !== "AFTERMATH" &&
        next.buffer.length === prev.buffer.length + 1 &&
        next.lastOutcome !== "cast" &&
        next.lastOutcome !== "goose"
      ) {
        const index = prev.buffer.length;
        const correct = next.buffer[index] === next.expected[index];
        if (!correct) {
          playSafe(ports, "error", undefined, record);
        } else if (now() - lastTickAt >= TICK_GAP_MS) {
          lastTickAt = now();
          playSafe(ports, "tick", undefined, record);
        }
      }
      if (next.threatId !== prev.threatId) {
        stungThreat = "";
      }
      if (
        next.phase !== "AFTERMATH" &&
        next.threatId !== stungThreat &&
        next.ttiRatio <= 0.2 &&
        prev.ttiRatio > 0.2
      ) {
        playSafe(ports, "sting", undefined, record);
        stungThreat = next.threatId;
      }
    }
    offerFrom(next, prev);
  }

  return {
    unlockFromKey,
    sync,
    reset,
    snapshot(): AudioSnapshot {
      return {
        unlocked,
        lastCue,
        lastLineId,
        playingLineId: playing?.lineId ?? null,
        pendingLineId: pending?.lineId ?? null,
      };
    },
  };
}

export type AudioDirector = ReturnType<typeof createDirector>;
