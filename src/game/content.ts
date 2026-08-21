import encounterFile from "../../docs/ready/data/encounter.json";
import rootsFile from "../../docs/ready/data/roots.json";
import spellsFile from "../../docs/ready/data/spells.json";

export type Spell = {
  id: string;
  incantation: string;
  displayName: string;
  tags: string[];
  effectiveAgainst: string[];
  reasonWhenChosen: string;
  characterCount: number;
  typingBand: "short" | "medium" | "long";
  pronunciation: string;
};

export type Threat = {
  id: string;
  displayName: string;
  tags: string[];
  ttiSeconds: number;
};

export type Recommendation = {
  spellId: string;
  incantation: string;
  displayName: string;
  reasonCode: string;
  reasonLabel: string;
  pronunciation: string;
};

type SpellRow = {
  id: string;
  incantation: string;
  displayName: string;
  tags: string[];
  effectiveAgainst: string[];
  reasonWhenChosen: string;
  pronunciation: string;
  typingDifficulty: {
    characterCount: number;
    band: "short" | "medium" | "long";
  };
};

type ThreatRow = {
  id: string;
  displayName: string;
  tags: string[];
  ttiSeconds: number;
};

export type Misfire = {
  id: string;
  displayName: string;
  triggerStrings: string[];
  defeatsThreat: boolean;
  playerHits: number;
  knockbackSeconds: number;
  fallback?: boolean;
};

type MisfireRow = Misfire;

const encounter = encounterFile as {
  loseHits: number;
  resolveHoldMs: number;
  ttiStartSeconds: number;
  ttiStepSeconds: number;
  ttiMinSeconds: number;
  opening: { forcedSpellId: string; reasonCode: string; reasonLabel: string };
  threats: ThreatRow[];
};

const spellPack = spellsFile as { spells: SpellRow[]; misfires: MisfireRow[] };
const spellRows = spellPack.spells;
const threatRows = encounter.threats;
const opening = encounter.opening;

export const MISFIRES: Misfire[] = spellPack.misfires;
const goose = MISFIRES.find((row) => row.id === "disappointed_goose");
const fizzle = MISFIRES.find((row) => row.id === "fizzle");

export const RULES = {
  loseHits: encounter.loseHits,
  resolveHoldMs: encounter.resolveHoldMs,
  ttiStartSeconds: encounter.ttiStartSeconds,
  ttiStepSeconds: encounter.ttiStepSeconds,
  ttiMinSeconds: encounter.ttiMinSeconds,
  gooseHoldMs: Math.round((goose?.knockbackSeconds ?? 2.5) * 1000),
};

export function normalizeIncantation(value: string): string {
  return value.normalize("NFC").toLowerCase().trim().replace(/\s+/g, " ");
}

export function normalizeCasterInput(value: string): string | null {
  const normalized = value.normalize("NFC").toLowerCase();
  return /^[a-z ]*$/.test(normalized) ? normalized : null;
}

export function lookupMisfire(received: string): Misfire {
  const key = normalizeIncantation(received);
  const hit = MISFIRES.find((row) => row.triggerStrings.includes(key));
  if (hit) {
    return hit;
  }
  if (!fizzle) {
    throw new Error("Missing fizzle fallback");
  }
  return fizzle;
}

export const SPELLS: Spell[] = spellRows.map((row) => ({
  id: row.id,
  incantation: row.incantation,
  displayName: row.displayName,
  tags: row.tags,
  effectiveAgainst: row.effectiveAgainst,
  reasonWhenChosen: row.reasonWhenChosen,
  characterCount: row.typingDifficulty.characterCount,
  typingBand: row.typingDifficulty.band,
  pronunciation: row.pronunciation,
}));

/** Root phonetics from roots.json. HUD aria uses spell.pronunciation (same roots). No TTS. */
export const ROOT_PHONETICS: Record<string, string> = Object.fromEntries(
  (rootsFile as { roots: { id: string; pronunciation: string }[] }).roots.map(
    (root) => [root.id, root.pronunciation],
  ),
);

export const THREATS: Threat[] = threatRows.map((row) => ({
  id: row.id,
  displayName: row.displayName,
  tags: row.tags,
  ttiSeconds: row.ttiSeconds,
}));

export const OPENING = opening;

export function spellById(id: string): Spell {
  const found = SPELLS.find((spell) => spell.id === id);
  if (!found) {
    throw new Error(`Unknown spell ${id}`);
  }
  return found;
}

export function recFromSpell(
  spell: Spell,
  reasonCode: string,
  reasonLabel: string,
): Recommendation {
  return {
    spellId: spell.id,
    incantation: spell.incantation,
    displayName: spell.displayName,
    reasonCode,
    reasonLabel,
    pronunciation: spell.pronunciation,
  };
}

export function openingRecommendation(): Recommendation {
  const spell = spellById(OPENING.forcedSpellId);
  return recFromSpell(spell, OPENING.reasonCode, OPENING.reasonLabel);
}
