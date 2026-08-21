import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_FILE = path.join(ROOT, "docs/ready/data/audio-manifest.json");
const PACK_FILE = path.join(ROOT, "public/audio/bard/manifest.json");
const AUDITION_FILE = path.join(ROOT, "public/audio/bard/auditions/manifest.json");
const REQUIRED_DEMO_IDS = [
  "open_01",
  "goose_01",
  "recover_01",
  "win_01",
  "lose_01",
];

async function json(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function diskPath(publicUrl) {
  assert.match(publicUrl, /^\/audio\/bard\/[a-z0-9_]+\.mp3$/);
  return path.join(ROOT, "public", publicUrl);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function filesUnder(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await filesUnder(file)));
    } else if (entry.isFile()) {
      files.push(file);
    }
  }
  return files;
}

async function elevenLabsSecret() {
  const env = await readFile(path.join(ROOT, ".env"), "utf8");
  const match = env.match(/^\s*ELEVENLABS_API_KEY\s*=\s*(.*?)\s*$/m);
  assert.ok(match, "ELEVENLABS_API_KEY is missing from .env");
  const raw = match[1].trim();
  const value =
    raw.length >= 2 &&
    ((raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'")))
      ? raw.slice(1, -1)
      : raw.replace(/\s+#.*$/, "").trim();
  assert.ok(value.length > 0, "ELEVENLABS_API_KEY is empty");
  return value;
}

function recognizesMp3(buffer) {
  return (
    buffer.subarray(0, 3).toString("ascii") === "ID3" ||
    (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0)
  );
}

test("bard pack manifest mirrors all nine canonical rows", async () => {
  const source = await json(SOURCE_FILE);
  const pack = await json(PACK_FILE);

  assert.equal(source.clips.length, 9);
  assert.equal(pack.clips.length, source.clips.length);
  assert.deepEqual(
    pack.clips.map((clip) => clip.lineId),
    source.clips.map((clip) => clip.lineId),
  );

  for (const [index, clip] of pack.clips.entries()) {
    const canonical = source.clips[index];
    assert.equal(clip.subtitle, canonical.subtitle);
    assert.equal(clip.requiredForDemo, canonical.requiredForDemo);
    assert.equal(clip.file, `/audio/bard/${clip.lineId}.mp3`);
    assert.doesNotMatch(clip.subtitle, /\[[^\]]+]/);
  }
});

test("bard pack covers every required demo beat", async () => {
  const pack = await json(PACK_FILE);
  const required = pack.clips
    .filter((clip) => clip.requiredForDemo)
    .map((clip) => clip.lineId);

  assert.deepEqual(required, REQUIRED_DEMO_IDS);
  for (const lineId of REQUIRED_DEMO_IDS) {
    assert.ok(
      pack.clips.some(
        (clip) => clip.lineId === lineId && clip.status === "generated",
      ),
    );
  }
});

test("bard clip status agrees with file and duration integrity", async () => {
  const pack = await json(PACK_FILE);
  const generated = pack.clips.filter((clip) => clip.status === "generated");

  assert.equal(pack.provider, "elevenlabs");
  assert.equal(pack.model, "eleven_multilingual_v2");
  assert.match(pack.selectedVoice?.id ?? "", /^[A-Za-z0-9]{20}$/);
  assert.ok(pack.selectedVoice?.name);
  assert.equal(generated.length, 9);

  const ffprobeAvailable =
    spawnSync("ffprobe", ["-version"], { stdio: "ignore" }).status === 0;

  for (const clip of pack.clips) {
    const file = diskPath(clip.file);
    assert.equal(await exists(file), true, `${clip.lineId} file is missing`);
    assert.ok(clip.durationSeconds > 0, `${clip.lineId} needs a measured duration`);
    assert.ok(clip.sizeBytes > 512, `${clip.lineId} needs a measured file size`);
    const bytes = await readFile(file);
    assert.ok((await stat(file)).size > 512, `${clip.lineId} is unexpectedly small`);
    assert.ok(recognizesMp3(bytes), `${clip.lineId} is not an MP3`);

    if (ffprobeAvailable) {
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
          "format=duration",
          "-of",
          "json",
          file,
        ],
        { encoding: "utf8" },
      );
      assert.equal(probe.status, 0, `${clip.lineId} cannot be decoded`);
      const metadata = JSON.parse(probe.stdout);
      assert.equal(metadata.streams?.[0]?.codec_name, "mp3");
      assert.ok(Number(metadata.format?.duration) > 0);
    }
  }
});

test("bard audition contains exactly three decodable candidates", async () => {
  const audition = await json(AUDITION_FILE);
  assert.equal(audition.provider, "elevenlabs");
  assert.equal(audition.model, "eleven_multilingual_v2");
  assert.equal(audition.humanSelectionRequired, true);
  assert.equal(audition.clips.length, 3);
  assert.equal(new Set(audition.clips.map((clip) => clip.voice.id)).size, 3);

  for (const clip of audition.clips) {
    assert.match(
      clip.file,
      /^\/audio\/bard\/auditions\/[A-Za-z0-9-]+\/composite\.mp3$/,
    );
    const file = path.join(ROOT, "public", clip.file);
    const bytes = await readFile(file);
    assert.ok(recognizesMp3(bytes), `${clip.voice.name} audition is not MP3`);
    assert.ok(clip.durationSeconds > 0);
    assert.ok(clip.sizeBytes > 512);
  }
});

test("ElevenLabs secret stays out of public, dist, and source", async () => {
  const secret = Buffer.from(await elevenLabsSecret());
  const gitignore = await readFile(path.join(ROOT, ".gitignore"), "utf8");
  assert.match(gitignore, /^\.env$/m);

  for (const directory of ["public", "dist", "src"]) {
    for (const file of await filesUnder(path.join(ROOT, directory))) {
      const contents = await readFile(file);
      assert.equal(
        contents.includes(secret),
        false,
        `${path.relative(ROOT, file)} contains the ElevenLabs credential`,
      );
    }
  }
});
