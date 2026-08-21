#!/usr/bin/env node

import { mkdir, readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const SOURCE_MANIFEST = path.join(ROOT, "docs/ready/data/audio-manifest.json");
const OUTPUT_DIR = path.join(ROOT, "public/audio/bard");
const OUTPUT_MANIFEST = path.join(OUTPUT_DIR, "manifest.json");
const API_ORIGIN = "https://api.x.ai";
const VOICES_ENDPOINT = `${API_ORIGIN}/v1/tts/voices`;
const TTS_ENDPOINT = `${API_ORIGIN}/v1/tts`;
const AUDITION_VOICES = ["zagan", "orion", "sirius"];
const RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;

const AUDITION_SCRIPTS = [
  {
    id: "opening",
    text: "At last, our champion. The kingdom has chosen optimism.",
  },
  {
    id: "success",
    text: "A proper spell. I may yet keep my contract.",
  },
  {
    id: "goose",
    text: "[pause] You requested wind. The universe heard goose.",
  },
  {
    id: "repeat",
    text: "[sigh] Again? At this point, it may be tradition.",
  },
  {
    id: "lose",
    text: "Here fell our hero: brave, bold, and one vowel short.",
  },
];

function usage() {
  return [
    "Generate SPELLCHECK's bundled xAI bard voice pack.",
    "",
    "Usage:",
    "  node scripts/audio/generate-xai-bard.mjs --audition",
    "  node scripts/audio/generate-xai-bard.mjs --voice <voice-id> [--all]",
    "",
    "Options:",
    "  --audition       Generate the five representative scripts in zagan, orion, and sirius.",
    "  --voice <id>     Generate pack clips with a selected xAI built-in voice.",
    "  --all            Generate all nine rows; otherwise generate requiredForDemo rows only.",
    "  --help           Show this help.",
  ].join("\n");
}

function parseArgs(argv) {
  const options = { all: false, audition: false, help: false, voice: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--all") {
      options.all = true;
    } else if (arg === "--audition") {
      options.audition = true;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    } else if (arg === "--voice") {
      const voice = argv[index + 1];
      if (!voice || voice.startsWith("--")) {
        throw new Error("--voice requires a voice ID.");
      }
      options.voice = voice.toLowerCase();
      index += 1;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  if (options.audition && (options.voice || options.all)) {
    throw new Error("--audition cannot be combined with --voice or --all.");
  }
  if (!options.help && !options.audition && !options.voice) {
    throw new Error("Choose --audition or provide --voice <voice-id>.");
  }
  return options;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function retryDelay(response, attempt) {
  const retryAfter = response?.headers.get("retry-after");
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds)) {
      return Math.min(10_000, Math.max(0, seconds * 1_000));
    }
  }
  return Math.min(8_000, 500 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 250);
}

async function request(url, init, label) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (response.ok) {
        return response;
      }
      if (!RETRYABLE_STATUS.has(response.status) || attempt === MAX_ATTEMPTS) {
        throw new Error(`${label} failed with HTTP ${response.status}.`);
      }
      await sleep(retryDelay(response, attempt));
    } catch (error) {
      lastError = error;
      const isHttpFailure =
        error instanceof Error && /failed with HTTP \d+/.test(error.message);
      if (isHttpFailure || attempt === MAX_ATTEMPTS) {
        throw error;
      }
      await sleep(retryDelay(null, attempt));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError ?? new Error(`${label} failed.`);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporary, file);
}

function isMp3(buffer) {
  return (
    buffer.length > 512 &&
    (buffer.subarray(0, 3).toString("ascii") === "ID3" ||
      (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0))
  );
}

async function writeMp3(file, buffer) {
  if (!isMp3(buffer)) {
    throw new Error("xAI returned data that is not a recognizable MP3.");
  }
  await mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp`;
  try {
    await writeFile(temporary, buffer);
    await rename(temporary, file);
  } catch (error) {
    await unlink(temporary).catch(() => undefined);
    throw error;
  }
}

async function listVoices(apiKey) {
  const response = await request(
    VOICES_ENDPOINT,
    {
      headers: { Authorization: `Bearer ${apiKey}` },
    },
    "xAI voice lookup",
  );
  const payload = await response.json();
  if (!Array.isArray(payload.voices)) {
    throw new Error("xAI voice lookup returned an unexpected response.");
  }
  return new Set(payload.voices.map((voice) => String(voice.voice_id).toLowerCase()));
}

async function synthesize({ apiKey, text, voice }) {
  const response = await request(
    TTS_ENDPOINT,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        voice_id: voice,
        language: "en",
        speed: 0.92,
        output_format: {
          codec: "mp3",
          sample_rate: 24000,
          bit_rate: 96000,
        },
        with_timestamps: true,
      }),
    },
    `xAI synthesis for ${voice}`,
  );

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error(`xAI returned unexpected content type: ${contentType || "missing"}.`);
  }
  const payload = await response.json();
  if (
    payload.content_type !== "audio/mpeg" ||
    typeof payload.audio !== "string" ||
    !Number.isFinite(payload.duration)
  ) {
    throw new Error("xAI synthesis returned an unexpected response.");
  }
  return {
    audio: Buffer.from(payload.audio, "base64"),
    durationSeconds: Number(payload.duration.toFixed(3)),
  };
}

async function fileExists(file) {
  try {
    return (await stat(file)).isFile();
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function buildPackManifest(source, selectedVoice, durations, generatedAt) {
  const clips = [];
  for (const clip of source.clips) {
    const relativeFile = `/audio/bard/${clip.lineId}.mp3`;
    const diskFile = path.join(ROOT, "public", relativeFile);
    const generated = await fileExists(diskFile);
    clips.push({
      lineId: clip.lineId,
      file: relativeFile,
      subtitle: clip.subtitle,
      requiredForDemo: clip.requiredForDemo,
      status: generated ? "generated" : "not-generated",
      durationSeconds: generated ? (durations.get(clip.lineId) ?? null) : null,
    });
  }
  const hasGeneratedClip = clips.some((clip) => clip.status === "generated");
  return {
    version: 1,
    provider: "xAI",
    api: "POST /v1/tts",
    sourceManifest: "docs/ready/data/audio-manifest.json",
    selectedVoice: hasGeneratedClip ? selectedVoice : null,
    generatedAt: hasGeneratedClip ? generatedAt : null,
    format: {
      codec: "mp3",
      mimeType: "audio/mpeg",
      sampleRateHz: 24000,
      bitRateBps: 96000,
    },
    clips,
  };
}

async function generateAuditions(apiKey, availableVoices) {
  for (const voice of AUDITION_VOICES) {
    if (!availableVoices.has(voice)) {
      throw new Error(`Required audition voice is unavailable: ${voice}.`);
    }
  }

  const clips = [];
  for (const voice of AUDITION_VOICES) {
    for (const script of AUDITION_SCRIPTS) {
      process.stdout.write(`Generating audition ${voice}/${script.id}...\n`);
      const result = await synthesize({ apiKey, text: script.text, voice });
      const relativeFile = `auditions/${voice}/${script.id}.mp3`;
      await writeMp3(path.join(OUTPUT_DIR, relativeFile), result.audio);
      clips.push({
        voice,
        scriptId: script.id,
        voiceScript: script.text,
        file: `/audio/bard/${relativeFile}`,
        durationSeconds: result.durationSeconds,
      });
      await sleep(150);
    }
  }

  await writeJson(path.join(OUTPUT_DIR, "auditions/manifest.json"), {
    version: 1,
    provider: "xAI",
    api: "POST /v1/tts",
    generatedAt: new Date().toISOString(),
    voices: AUDITION_VOICES,
    selectionStatus: "listen-and-select",
    clips,
  });
  process.stdout.write(
    "Auditions generated. Listen to public/audio/bard/auditions, then run the pack command with --voice.\n",
  );
}

async function generatePack(apiKey, availableVoices, source, voice, all) {
  if (!availableVoices.has(voice)) {
    throw new Error(`xAI voice is unavailable: ${voice}.`);
  }

  const selected = all
    ? source.clips
    : source.clips.filter((clip) => clip.requiredForDemo);
  const durations = new Map();
  const generatedAt = new Date().toISOString();

  for (const clip of selected) {
    process.stdout.write(`Generating ${clip.lineId} with ${voice}...\n`);
    const result = await synthesize({
      apiKey,
      text: clip.voiceScript,
      voice,
    });
    await writeMp3(path.join(OUTPUT_DIR, `${clip.lineId}.mp3`), result.audio);
    durations.set(clip.lineId, result.durationSeconds);
    await sleep(150);
  }

  const packManifest = await buildPackManifest(
    source,
    voice,
    durations,
    generatedAt,
  );
  await writeJson(OUTPUT_MANIFEST, packManifest);
  process.stdout.write(
    `Generated ${selected.length} bard clip${selected.length === 1 ? "" : "s"} with ${voice}.\n`,
  );
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n\n${usage()}\n`);
    process.exitCode = 1;
    return;
  }

  if (options.help) {
    process.stdout.write(`${usage()}\n`);
    return;
  }

  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    process.stderr.write(
      [
        "XAI_API_KEY is not set; no audio was generated.",
        "Audition: XAI_API_KEY=... npm run audio:bard -- --audition",
        "Full pack: XAI_API_KEY=... npm run audio:bard -- --voice zagan --all",
        "",
      ].join("\n"),
    );
    process.exitCode = 1;
    return;
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  const availableVoices = await listVoices(apiKey);
  if (options.audition) {
    await generateAuditions(apiKey, availableVoices);
    return;
  }

  const source = await readJson(SOURCE_MANIFEST);
  await generatePack(apiKey, availableVoices, source, options.voice, options.all);
}

main().catch((error) => {
  process.stderr.write(`Bard generation failed: ${error.message}\n`);
  process.exitCode = 1;
});
