const NOVELTY =
  /zarvox|trinoids|bad news|good news|hysterical|bubbles|boing|jester|whisper|princess|junior|albert|bahh|deranged|pipe organ|cellos|bells|wobble|superstar|organ\b|fred|kathy|ralph|trinoids/i;

export type VoiceLike = {
  name: string;
  lang: string;
  voiceURI?: string;
};

export function stripSpeechMarkup(text: string): string {
  return text
    .replace(/\[[^\]]*]/g, "")
    .replace(/\u2026/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

export function scoreSeriousVoice(voice: VoiceLike): number {
  if (!/^en(-|_|\b)/i.test(voice.lang) && !/^en$/i.test(voice.lang)) {
    return -1;
  }
  if (NOVELTY.test(voice.name) || NOVELTY.test(voice.voiceURI ?? "")) {
    return -1;
  }
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  if (name.includes("daniel") && /gb|uk/.test(lang)) {
    return 100;
  }
  if (name.includes("daniel")) {
    return 90;
  }
  if (name.includes("alex")) {
    return 85;
  }
  if (name.includes("arthur")) {
    return 84;
  }
  if (name.includes("oliver")) {
    return 80;
  }
  if (name.includes("james")) {
    return 78;
  }
  if (name.includes("george")) {
    return 76;
  }
  if (name.includes("david")) {
    return 74;
  }
  if (/premium|enhanced|natural|neural/.test(name)) {
    return 70;
  }
  if (name.includes("moira")) {
    return 60;
  }
  if (name.includes("samantha")) {
    return 55;
  }
  if (name.includes("karen")) {
    return 50;
  }
  return 20;
}

export function pickSeriousVoice<T extends VoiceLike>(voices: T[]): T | null {
  let best: T | null = null;
  let bestScore = -1;
  for (const voice of voices) {
    const score = scoreSeriousVoice(voice);
    if (score < 0) {
      continue;
    }
    if (
      score > bestScore ||
      (score === bestScore &&
        best !== null &&
        voice.name.localeCompare(best.name) < 0)
    ) {
      best = voice;
      bestScore = score;
    }
  }
  return best;
}
