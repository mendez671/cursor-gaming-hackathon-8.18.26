import { ROOT_PHONETICS, type Spell, type Threat } from "./content";
import { rank } from "./rank";

function subsets(ids: string[]): string[][] {
  const out: string[][] = [[]];
  for (const id of ids) {
    const next = out.map((row) => [...row, id]);
    out.push(...next);
  }
  return out;
}

function roleKey(spell: Spell): string {
  return [
    [...spell.tags].sort().join(","),
    [...spell.effectiveAgainst].sort().join(","),
    String(spell.characterCount),
  ].join("|");
}

function typingBand(characterCount: number): Spell["typingBand"] {
  if (characterCount <= 11) {
    return "short";
  }
  return characterCount <= 16 ? "medium" : "long";
}

/** Every spell must be unique and reachable by the ranker (or the forced opener). */
export function assertBook(
  spells: Spell[],
  threats: Threat[],
  openingSpellId: string,
): void {
  const ids = spells.map((spell) => spell.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error("Duplicate spell id");
  }
  if (ids.length !== 10) {
    throw new Error(`Expected 10 spells, got ${ids.length}`);
  }

  const phrases = spells.map((spell) => spell.incantation);
  if (new Set(phrases).size !== phrases.length) {
    throw new Error("Duplicate incantation");
  }

  const roles = new Map<string, string>();
  for (const spell of spells) {
    if (spell.characterCount !== spell.incantation.length) {
      throw new Error(
        `Character count drift on ${spell.id}: ${spell.characterCount} vs ${spell.incantation.length}`,
      );
    }
    const measuredBand = typingBand(spell.characterCount);
    if (spell.typingBand !== measuredBand) {
      throw new Error(
        `Typing band drift on ${spell.id}: ${spell.typingBand} vs ${measuredBand}`,
      );
    }
    const key = roleKey(spell);
    const prior = roles.get(key);
    if (prior) {
      throw new Error(`Cosmetic duplicate roles: ${prior} and ${spell.id}`);
    }
    roles.set(key, spell.id);
  }

  const reachable = new Set<string>([openingSpellId]);
  const others = ids.filter((id) => id !== openingSpellId);
  for (const threat of threats) {
    for (const cooling of subsets(others)) {
      const pick = rank(spells, threat, cooling);
      if (pick) {
        reachable.add(pick.spellId);
      }
    }
  }

  const dead = ids.filter((id) => !reachable.has(id));
  if (dead.length) {
    throw new Error(`Never recommended: ${dead.join(", ")}`);
  }

  for (const spell of spells) {
    const fromRoots = spell.incantation
      .split(" ")
      .map((token) => ROOT_PHONETICS[token] ?? token)
      .join(" ");
    if (fromRoots !== spell.pronunciation) {
      throw new Error(
        `Pronunciation drift on ${spell.id}: ${spell.pronunciation} vs ${fromRoots}`,
      );
    }
  }
}
