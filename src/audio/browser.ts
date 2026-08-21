import { useRef, useState } from "react";
import type { GameState } from "../game/machine";
import {
  createDirector,
  soundView,
  type AudioCue,
  type AudioDirector,
  type AudioPorts,
  type AudioSnapshot,
  type GameSoundView,
  type SpeakMeta,
} from "./director";
import { pickSeriousVoice } from "./speech";

type WiredContext = {
  ctx: AudioContext;
  master: GainNode;
};

const CLIP_BASE = "/audio/bard";
const ORION = { rate: 0.92, pitch: 0.88, volume: 1 };
const missingClips = new Set<string>();
const availableClips = new Set<string>();

void fetch(`${CLIP_BASE}/manifest.json`)
  .then((response) => {
    if (!response.ok) {
      return null;
    }
    return response.json() as Promise<{
      clips?: Array<{ lineId?: unknown; status?: unknown }>;
    }>;
  })
  .then((manifest) => {
    for (const clip of manifest?.clips ?? []) {
      if (clip.status === "generated" && typeof clip.lineId === "string") {
        availableClips.add(clip.lineId);
      }
    }
  })
  .catch(() => undefined);

let wired: WiredContext | null = null;
let clipEl: HTMLAudioElement | null = null;
let honkTimer = 0;
let cachedVoice: SpeechSynthesisVoice | null = null;

function audioGraph(): WiredContext | null {
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) {
    return null;
  }
  if (!wired) {
    const ctx = new Ctor();
    const master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
    wired = { ctx, master };
  }
  return wired;
}

function blip(
  dest: AudioNode,
  freq: number,
  seconds: number,
  gain: number,
  type: OscillatorType,
  slideTo?: number,
) {
  if (!wired) {
    return;
  }
  const osc = wired.ctx.createOscillator();
  const amp = wired.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, wired.ctx.currentTime);
  if (slideTo !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(
      slideTo,
      wired.ctx.currentTime + seconds,
    );
  }
  amp.gain.setValueAtTime(gain, wired.ctx.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.0008, wired.ctx.currentTime + seconds);
  osc.connect(amp);
  amp.connect(dest);
  osc.start();
  osc.stop(wired.ctx.currentTime + seconds + 0.02);
}

function playCast(family: string | undefined) {
  if (!wired) {
    return;
  }
  const dest = wired.master;
  const id = family ?? "";
  if (id.includes("ignis")) {
    blip(dest, 220, 0.09, 0.08, "triangle", 294);
    return;
  }
  if (id.includes("glacies")) {
    blip(dest, 880, 0.1, 0.055, "sine");
    return;
  }
  if (id.includes("terra")) {
    blip(dest, 98, 0.11, 0.08, "triangle");
    return;
  }
  if (id.includes("lumen") || id.includes("aqua")) {
    blip(dest, 523, 0.09, 0.055, "sine");
    return;
  }
  if (id.includes("fulgur")) {
    blip(dest, 1180, 0.05, 0.06, "triangle");
    return;
  }
  if (id.includes("umbra") || id.includes("mors")) {
    blip(dest, 123, 0.11, 0.07, "triangle");
    return;
  }
  blip(dest, 262, 0.09, 0.07, "triangle");
}

function playCue(cue: AudioCue, family?: string) {
  const graph = audioGraph();
  if (!graph) {
    return;
  }
  const dest = graph.master;
  switch (cue) {
    case "tick":
      blip(dest, 760, 0.018, 0.01, "sine");
      return;
    case "error":
      blip(dest, 196, 0.07, 0.04, "triangle");
      blip(dest, 233, 0.05, 0.028, "sine");
      return;
    case "goose":
      blip(dest, 288, 0.09, 0.09, "sawtooth", 240);
      honkTimer = window.setTimeout(() => {
        blip(dest, 214, 0.1, 0.075, "sawtooth", 180);
      }, 80);
      return;
    case "sting":
      blip(dest, 73, 0.07, 0.03, "triangle");
      return;
    case "cast":
      playCast(family);
      return;
    case "bard":
      return;
  }
}

function resolveVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === "undefined") {
    return null;
  }
  if (cachedVoice) {
    return cachedVoice;
  }
  cachedVoice = pickSeriousVoice(speechSynthesis.getVoices());
  return cachedVoice;
}

function speakBrowser(text: string, onEnded: () => void) {
  if (typeof speechSynthesis === "undefined") {
    onEnded();
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = ORION.rate;
  utterance.pitch = ORION.pitch;
  utterance.volume = ORION.volume;
  const voice = resolveVoice();
  if (voice) {
    utterance.voice = voice;
  }
  utterance.onend = () => onEnded();
  utterance.onerror = () => onEnded();
  speechSynthesis.speak(utterance);
}

function stopClip() {
  if (!clipEl) {
    return;
  }
  clipEl.onended = null;
  clipEl.onerror = null;
  clipEl.pause();
  clipEl.src = "";
  clipEl = null;
}

function speakOrClip(text: string, meta: SpeakMeta) {
  let settled = false;
  let started = false;
  const finish = () => {
    if (settled) {
      return;
    }
    settled = true;
    meta.onEnded();
  };
  const fallback = () => {
    if (settled || started) {
      return;
    }
    started = true;
    missingClips.add(meta.lineId);
    speakBrowser(text, finish);
  };
  if (
    missingClips.has(meta.lineId) ||
    !availableClips.has(meta.lineId)
  ) {
    fallback();
    return;
  }
  try {
    stopClip();
    const audio = new Audio(`${CLIP_BASE}/${meta.lineId}.mp3`);
    clipEl = audio;
    audio.onended = () => {
      started = true;
      finish();
    };
    audio.onerror = fallback;
    const attempt = audio.play();
    if (attempt && typeof attempt.then === "function") {
      attempt.then(() => {
        started = true;
      }).catch(fallback);
    }
  } catch {
    fallback();
  }
}

function unlockHardware() {
  const graph = audioGraph();
  if (graph && graph.ctx.state === "suspended") {
    void graph.ctx.resume().catch(() => undefined);
  }
  if (typeof speechSynthesis === "undefined") {
    return;
  }
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener("voiceschanged", () => {
    cachedVoice = pickSeriousVoice(speechSynthesis.getVoices());
  });
}

function resetHardware() {
  if (honkTimer) {
    window.clearTimeout(honkTimer);
    honkTimer = 0;
  }
  stopClip();
  if (typeof speechSynthesis !== "undefined") {
    speechSynthesis.cancel();
  }
}

function browserPorts(): AudioPorts {
  return {
    speak: speakOrClip,
    cancel() {
      stopClip();
      if (typeof speechSynthesis !== "undefined") {
        speechSynthesis.cancel();
      }
    },
    play: playCue,
    unlock: unlockHardware,
    resetHardware,
  };
}

let singleton: AudioDirector | null = null;

export function getBrowserDirector(): AudioDirector {
  if (!singleton) {
    singleton = createDirector(browserPorts());
  }
  return singleton;
}

export function audioRuntime(): { contextState: string; currentTime: number } {
  return {
    contextState: wired?.ctx.state ?? "missing",
    currentTime: wired?.ctx.currentTime ?? 0,
  };
}

export function useAudioDirector(state: GameState): AudioSnapshot & {
  unlockFromKey: () => void;
  reset: () => void;
  contextState: string;
} {
  const director = getBrowserDirector();
  const prev = useRef<GameSoundView | null>(null);
  const [, bump] = useState(0);
  const next = soundView(state);
  director.sync(prev.current, next);
  prev.current = next;
  const snap = director.snapshot();

  return {
    ...snap,
    contextState: audioRuntime().contextState,
    unlockFromKey() {
      director.unlockFromKey();
      const graph = audioGraph();
      if (graph && graph.ctx.state === "suspended") {
        void graph.ctx.resume().then(() => bump((n) => n + 1)).catch(() => undefined);
      }
      bump((n) => n + 1);
    },
    reset() {
      director.reset();
      bump((n) => n + 1);
    },
  };
}
