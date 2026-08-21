import {
  recFromSpell,
  type Recommendation,
  type Spell,
  type Threat,
} from "./content";

function shortest(spells: Spell[]): Spell {
  return [...spells].sort((a, b) => {
    if (a.characterCount !== b.characterCount) {
      return a.characterCount - b.characterCount;
    }
    return a.id.localeCompare(b.id);
  })[0];
}

function readySpells(spells: Spell[], coolingIds: readonly string[]): Spell[] {
  const cooling = new Set(coolingIds);
  return spells.filter((spell) => !cooling.has(spell.id));
}

function tagged(threat: Threat, tag: string): boolean {
  return threat.tags.includes(tag);
}

function interruptScore(spell: Spell, threat: Threat): number {
  let score = 0;
  if (spell.effectiveAgainst.includes("approaching") && tagged(threat, "approaching")) {
    score += 2;
  }
  if (spell.effectiveAgainst.includes("charging") && tagged(threat, "charging")) {
    score += 2;
  }
  if (spell.tags.includes("interrupt")) {
    score += 1;
  }
  return score;
}

/**
 * Tiny rules engine. WPM is off. Not an LLM.
 * armor → ice / armor-break; approaching|charging → interrupt; else tag match; else shortest ready.
 */
export function rank(
  spells: Spell[],
  threat: Threat,
  coolingIds: readonly string[],
): Recommendation | null {
  const ready = readySpells(spells, coolingIds);
  if (ready.length === 0) {
    return null;
  }

  if (tagged(threat, "armored")) {
    const vsArmor = ready.filter((spell) =>
      spell.effectiveAgainst.includes("armored"),
    );
    const ice = ready.filter((spell) => spell.tags.includes("ice"));
    const pick = vsArmor.length ? shortest(vsArmor) : ice.length ? shortest(ice) : null;
    if (pick) {
      return recFromSpell(pick, "ARMOR_COUNTER", "BEST VS. ARMOR");
    }
  }

  if (tagged(threat, "approaching") || tagged(threat, "charging")) {
    const interrupt = ready.filter(
      (spell) =>
        spell.tags.includes("interrupt") ||
        spell.effectiveAgainst.includes("approaching") ||
        spell.effectiveAgainst.includes("charging"),
    );
    if (interrupt.length) {
      const pick = [...interrupt].sort((a, b) => {
        const scoreA = interruptScore(a, threat);
        const scoreB = interruptScore(b, threat);
        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        if (a.characterCount !== b.characterCount) {
          return a.characterCount - b.characterCount;
        }
        return a.id.localeCompare(b.id);
      })[0];
      return recFromSpell(pick, "INTERRUPT", "INTERRUPT READY");
    }
  }

  const matched = ready.filter((spell) =>
    spell.effectiveAgainst.some(
      (tag) => tag !== "any" && threat.tags.includes(tag),
    ),
  );
  if (matched.length) {
    const pick = shortest(matched);
    return recFromSpell(pick, "TAG_COUNTER", pick.reasonWhenChosen);
  }

  return recFromSpell(shortest(ready), "FASTEST_SAFE", "FASTEST SAFE CAST");
}

export function isReady(spellId: string, coolingIds: readonly string[]): boolean {
  return !coolingIds.includes(spellId);
}
