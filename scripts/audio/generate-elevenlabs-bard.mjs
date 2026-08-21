#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import {
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const SOURCE_MANIFEST = path.join(ROOT, "docs/ready/data/audio-manifest.json");
const OUTPUT_DIR = path.join(ROOT, "public/audio/bard");
const OUTPUT_MANIFEST = path.join(OUTPUT_DIR, "manifest.json");
const AUDITION_DIR = path.join(OUTPUT_DIR, "auditions");
const API_ORIGIN = "https://api.elevenlabs.io";
const VOICES_ENDPOINT = `${API_ORIGIN}/v2/voices`;
const MODELS_ENDPOINT = `${API_ORIGIN}/v1/models`;
const MODEL_ID = "eleven_multilingual_v2";
const OUTPUT_FORMAT = "mp3_44100_128";
const RETRYABLE_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 4;
const CANDIDATE_COUNT = 3;
const AUDITION_TEXT = [
  "At last, our champion. The kingdom has chosen optimism.",
  "You requested wind. The universe heard goose.",
  "Here fell our hero: brave, bold, and one vowel short.",
].join(" ");

const POSITIVE_TERMS = new Map([
  ["narrator", 14],
  ["narration", 14],
  ["storytelling", 12],
  ["deep", 10],
  ["cinematic", 10],
  ["british", 9],
  ["formal", 8],
  ["authoritative", 8],
  ["middle aged", 7],
  ["middle-aged", 7],
  ["warm", 6],
  ["resonant", 6],
  ["rich", 6],
  ["theatrical", 5],
  ["documentary", 5],
  ["mature", 4],
]);
const NEGATIVE_TERMS = new Map([
  ["cartoon", -30],
  ["novelty", -30],
  ["child", -20],
  ["childlike", -20],
  ["anime", -18],
  ["squeaky", -18],
  ["whimsical", -10],
  ["comedic", -8],
]);

function usage() {
  return [
    "Generate SPELLCHECK's bundled ElevenLabs bard voice pack.",
    "",
    "Usage:",
    "  node scripts/audio/generate-elevenlabs-bard.mjs --audition",
    "  node scripts/audio/generate-elevenlabs-bard.mjs --voice <id-or-name> [--all]",
    "",
    "Options:",
    "  --audition       Select three metadata-matched voices and generate one composite clip each.",
    "  --voice <value>  Generate pack clips with an exact voice ID or case-insensitive name.",
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
        throw new Error("--voice requires an ID or name.");
      }
      options.voice = voice;
      index += 1;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }
  if (options.audition && (options.voice || options.all)) {
    throw new Error("--audition cannot be combined with --voice or --all.");
  }
  if (!options.help && !options.audition && !options.voice) {
    throw new Error("Choose --audition or provide --voice <id-or-name>.");
  }
  return options;
}

function parseEnvValue(raw) {
  const value = raw.trim();
  if (
    value.length >= 2 &&
    ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'")))
  ) {
    return value.slice(1, -1);
  }
  return value.replace(/\s+#.*$/, "").trim();
}

async function loadApiKey() {
  if (process.env.ELEVENLABS_API_KEY) {
    return process.env.ELEVENLABS_API_KEY;
  }
  let contents;
  try {
    contents = await readFile(path.join(ROOT, ".env"), "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }
    throw error;
  }
  for (const line of contents.split(/\r?\n/)) {
    const match = line.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.*?)\s*$/);
    if (match) {
      return parseEnvValue(match[1]) || null;
    }
  }
  return null;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function retryDelay(response, attempt) {
  const retryAfter = response?.headers.get("retry-after");
  const seconds = Number(retryAfter);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(10_000, seconds * 1_000);
  }
  return Math.min(8_000, 500 * 2 ** (attempt - 1)) + Math.floor(Math.random() * 250);
}

async function safeErrorCode(response) {
  try {
    const payload = await response.json();
    const candidate = payload?.detail?.status ?? payload?.status;
    return /^[a-z0-9_.-]{1,80}$/i.test(String(candidate)) ? String(candidate) : null;
  } catch {
    return null;
  }
}

async function request(url, init, label) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (response.ok) {
        return response;
      }
      if (!RETRYABLE_STATUS.has(response.status) || attempt === MAX_ATTEMPTS) {
        const code = await safeErrorCode(response);
        throw new Error(
          `${label} failed with HTTP ${response.status}${code ? ` (${code})` : ""}.`,
        );
      }
      await sleep(retryDelay(response, attempt));
    } catch (error) {
      const definitive =
        error instanceof Error && /failed with HTTP \d+/.test(error.message);
      if (definitive || attempt === MAX_ATTEMPTS) {
        throw error;
      }
      await sleep(retryDelay(null, attempt));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw new Error(`${label} failed.`);
}

function authHeaders(apiKey, json = false) {
  return {
    "xi-api-key": apiKey,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
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

async function listVoices(apiKey) {
  const voices = [];
  let nextPageToken = null;
  do {
    const url = new URL(VOICES_ENDPOINT);
    url.searchParams.set("page_size", "100");
    url.searchParams.set("include_total_count", "false");
    if (nextPageToken) {
      url.searchParams.set("next_page_token", nextPageToken);
    }
    const response = await request(
      url,
      { headers: authHeaders(apiKey) },
      "ElevenLabs voice lookup",
    );
    const payload = await response.json();
    if (!Array.isArray(payload.voices)) {
      throw new Error("ElevenLabs voice lookup returned an unexpected response.");
    }
    voices.push(...payload.voices);
    nextPageToken = payload.has_more ? payload.next_page_token : null;
  } while (nextPageToken && voices.length < 500);
  return voices;
}

async function verifyModel(apiKey) {
  const response = await request(
    MODELS_ENDPOINT,
    { headers: authHeaders(apiKey) },
    "ElevenLabs model lookup",
  );
  const payload = await response.json();
  const models = Array.isArray(payload) ? payload : payload.models;
  const model = models?.find((candidate) => candidate.model_id === MODEL_ID);
  if (!model || model.can_do_text_to_speech === false) {
    throw new Error(`ElevenLabs TTS model is unavailable: ${MODEL_ID}.`);
  }
}

function metadataText(voice) {
  return [
    voice.name,
    voice.description,
    voice.category,
    ...Object.entries(voice.labels ?? {}).flatMap(([key, value]) => [key, value]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[_-]+/g, " ");
}

function scoreVoice(voice) {
  const text = metadataText(voice);
  let score = 0;
  for (const [term, weight] of POSITIVE_TERMS) {
    if (text.includes(term)) {
      score += weight;
    }
  }
  for (const [term, weight] of NEGATIVE_TERMS) {
    if (text.includes(term)) {
      score += weight;
    }
  }
  if (/\b(en|english)\b/.test(text)) {
    score += 3;
  }
  return score;
}

function publicVoice(voice) {
  return {
    id: voice.voice_id,
    name: voice.name ?? voice.voice_id,
    category: voice.category ?? null,
    labels: voice.labels ?? {},
    description: voice.description ?? null,
    metadataScore: scoreVoice(voice),
  };
}

function selectCandidates(voices) {
  return [...voices]
    .filter((voice) => voice.voice_id && voice.name)
    .sort(
      (left, right) =>
        scoreVoice(right) - scoreVoice(left) ||
        String(left.name).localeCompare(String(right.name)),
    )
    .slice(0, CANDIDATE_COUNT);
}

function resolveVoice(voices, query) {
  const idMatch = voices.find((voice) => voice.voice_id === query);
  if (idMatch) {
    return idMatch;
  }
  const nameMatches = voices.filter(
    (voice) => String(voice.name).toLowerCase() === query.toLowerCase(),
  );
  if (nameMatches.length === 1) {
    return nameMatches[0];
  }
  if (nameMatches.length > 1) {
    throw new Error(`Voice name is ambiguous; use its ID: ${query}.`);
  }
  throw new Error(`ElevenLabs voice was not found: ${query}.`);
}

function slug(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function isMp3(buffer) {
  return (
    buffer.length > 512 &&
    (buffer.subarray(0, 3).toString("ascii") === "ID3" ||
      (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0))
  );
}

function inspectMp3(file) {
  const probe = spawnSync(
    "ffprobe",
    [
      "-v",
      "error",
      "-select_streams",
      "a:0",
      "-show_entries",
      "stream=codec_name",
      "-show_entries",
      "format=duration,size",
      "-of",
      "json",
      file,
    ],
    { encoding: "utf8" },
  );
  if (probe.status !== 0) {
    throw new Error(`Generated MP3 failed decode validation: ${path.basename(file)}.`);
  }
  const metadata = JSON.parse(probe.stdout);
  if (metadata.streams?.[0]?.codec_name !== "mp3") {
    throw new Error(`Generated file is not MP3 audio: ${path.basename(file)}.`);
  }
  const durationSeconds = Number(metadata.format?.duration);
  const sizeBytes = Number(metadata.format?.size);
  if (!(durationSeconds > 0) || !(sizeBytes > 512)) {
    throw new Error(`Generated MP3 is empty or invalid: ${path.basename(file)}.`);
  }
  return {
    durationSeconds: Number(durationSeconds.toFixed(3)),
    sizeBytes,
  };
}

async function synthesize({ apiKey, text, voiceId, destination }) {
  const url = new URL(
    `${API_ORIGIN}/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
  );
  url.searchParams.set("output_format", OUTPUT_FORMAT);
  const response = await request(
    url,
    {
      method: "POST",
      headers: authHeaders(apiKey, true),
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.62,
          similarity_boost: 0.78,
          style: 0.12,
          use_speaker_boost: true,
          speed: 0.94,
        },
      }),
    },
    `ElevenLabs synthesis for ${path.basename(destination)}`,
  );
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("audio/mpeg")) {
    throw new Error(
      `ElevenLabs returned unexpected content type: ${contentType || "missing"}.`,
    );
  }
  const audio = Buffer.from(await response.arrayBuffer());
  if (!isMp3(audio)) {
    throw new Error("ElevenLabs returned data that is not a recognizable MP3.");
  }
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, audio);
  return inspectMp3(destination);
}

async function generateAuditions(apiKey, voices) {
  const candidates = selectCandidates(voices);
  if (candidates.length < CANDIDATE_COUNT) {
    throw new Error("Fewer than three usable ElevenLabs voices are available.");
  }
  const staging = path.join(OUTPUT_DIR, `.audition-staging-${process.pid}`);
  const clips = [];
  try {
    for (const voice of candidates) {
      const directory = `${slug(voice.name)}-${voice.voice_id.slice(0, 6)}`;
      const stagedFile = path.join(staging, directory, "composite.mp3");
      process.stdout.write(`Generating audition: ${voice.name} (${voice.voice_id})\n`);
      const media = await synthesize({
        apiKey,
        text: AUDITION_TEXT,
        voiceId: voice.voice_id,
        destination: stagedFile,
      });
      clips.push({
        voice: publicVoice(voice),
        file: `/audio/bard/auditions/${directory}/composite.mp3`,
        ...media,
      });
      await sleep(150);
    }
    await rm(AUDITION_DIR, { recursive: true, force: true });
    await rename(staging, AUDITION_DIR);
    await writeJson(path.join(AUDITION_DIR, "manifest.json"), {
      version: 1,
      provider: "elevenlabs",
      api: "POST /v1/text-to-speech/{voice_id}",
      model: MODEL_ID,
      generatedAt: new Date().toISOString(),
      script: AUDITION_TEXT,
      provisionalVoice: publicVoice(candidates[0]),
      humanSelectionRequired: true,
      clips,
    });
  } catch (error) {
    await rm(staging, { recursive: true, force: true });
    throw error;
  }
  process.stdout.write(
    `Provisional metadata selection: ${candidates[0].name} (${candidates[0].voice_id}). Human listening is still required.\n`,
  );
}

async function generatePack(apiKey, source, voice, all) {
  const selected = all
    ? source.clips
    : source.clips.filter((clip) => clip.requiredForDemo);
  const staging = path.join(OUTPUT_DIR, `.pack-staging-${process.pid}`);
  const generated = new Map();
  try {
    for (const clip of selected) {
      const stagedFile = path.join(staging, `${clip.lineId}.mp3`);
      process.stdout.write(`Generating ${clip.lineId} with ${voice.name}...\n`);
      const media = await synthesize({
        apiKey,
        text: clip.subtitle,
        voiceId: voice.voice_id,
        destination: stagedFile,
      });
      generated.set(clip.lineId, media);
      await sleep(150);
    }

    for (const clip of selected) {
      await rename(
        path.join(staging, `${clip.lineId}.mp3`),
        path.join(OUTPUT_DIR, `${clip.lineId}.mp3`),
      );
    }
  } finally {
    await rm(staging, { recursive: true, force: true });
  }

  const clips = [];
  for (const clip of source.clips) {
    const file = path.join(OUTPUT_DIR, `${clip.lineId}.mp3`);
    let media = generated.get(clip.lineId);
    if (!media) {
      try {
        if ((await stat(file)).isFile()) {
          media = inspectMp3(file);
        }
      } catch (error) {
        if (error?.code !== "ENOENT") {
          throw error;
        }
      }
    }
    clips.push({
      lineId: clip.lineId,
      file: `/audio/bard/${clip.lineId}.mp3`,
      subtitle: clip.subtitle,
      requiredForDemo: clip.requiredForDemo,
      status: media ? "generated" : "not-generated",
      durationSeconds: media?.durationSeconds ?? null,
      sizeBytes: media?.sizeBytes ?? null,
    });
  }

  await writeJson(OUTPUT_MANIFEST, {
    version: 1,
    provider: "elevenlabs",
    api: "POST /v1/text-to-speech/{voice_id}",
    sourceManifest: "docs/ready/data/audio-manifest.json",
    selectedVoice: publicVoice(voice),
    model: MODEL_ID,
    generatedAt: new Date().toISOString(),
    format: {
      codec: "mp3",
      mimeType: "audio/mpeg",
      outputFormat: OUTPUT_FORMAT,
      sampleRateHz: 44100,
      bitRateBps: 128000,
    },
    clips,
  });
  process.stdout.write(
    `Generated ${selected.length} bard clip${selected.length === 1 ? "" : "s"} with ${voice.name}.\n`,
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

  const apiKey = await loadApiKey();
  if (!apiKey) {
    throw new Error(
      "ELEVENLABS_API_KEY is unavailable in the process environment or repo .env.",
    );
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  const [voices] = await Promise.all([listVoices(apiKey), verifyModel(apiKey)]);
  if (options.audition) {
    await generateAuditions(apiKey, voices);
    return;
  }
  const voice = resolveVoice(voices, options.voice);
  const source = await readJson(SOURCE_MANIFEST);
  await generatePack(apiKey, source, voice, options.all);
}

main().catch((error) => {
  process.stderr.write(`Bard generation failed: ${error.message}\n`);
  process.exitCode = 1;
});
