import type { Phase, RunResult } from "../game/machine";

export type WorldView = {
  ttiRatio: number;
  struck: boolean;
  landed: boolean;
  goose: boolean;
  kind: string;
  phase: Phase;
  spellId: string;
  coolingIds: readonly string[];
  threatIndex: number;
  threatCount: number;
  runResult: RunResult;
  bardSpeaking: boolean;
  locked: boolean;
  typedRatio: number;
};
