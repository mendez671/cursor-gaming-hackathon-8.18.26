import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const baseURL = process.env.SPELLCHECK_URL ?? "http://127.0.0.1:5174";
const baseOrigin = new URL(baseURL).origin;
const outputDir = process.env.SPELLCHECK_OUTPUT_DIR
  ? pathToFileURL(`${resolve(process.env.SPELLCHECK_OUTPUT_DIR)}/`)
  : new URL("../artifacts/final-qa/", import.meta.url);

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
});
const page = await context.newPage();
const evidence = {
  consoleErrors: [],
  consoleWarnings: [],
  pageErrors: [],
  failedRequests: [],
  badResponses: [],
  assetMismatches: [],
  remoteRequests: [],
  states: {},
};

page.on("console", (message) => {
  if (message.type() === "error") {
    evidence.consoleErrors.push(message.text());
  } else if (message.type() === "warning") {
    evidence.consoleWarnings.push(message.text());
  }
});
page.on("pageerror", (error) => evidence.pageErrors.push(error.message));
page.on("requestfailed", (request) => {
  evidence.failedRequests.push(
    `${request.method()} ${request.url()} ${request.failure()?.errorText ?? ""}`.trim(),
  );
});
page.on("response", (response) => {
  if (response.status() >= 400) {
    evidence.badResponses.push(`${response.status()} ${response.url()}`);
  }
  if (
    new URL(response.url()).pathname.endsWith(".mp3") &&
    !response.headers()["content-type"]?.includes("audio/mpeg")
  ) {
    evidence.assetMismatches.push(
      `${response.headers()["content-type"] ?? "missing content-type"} ${response.url()}`,
    );
  }
});
page.on("request", (request) => {
  const url = new URL(request.url());
  if (
    (url.protocol === "http:" || url.protocol === "https:") &&
    url.origin !== baseOrigin
  ) {
    evidence.remoteRequests.push(url.href);
  }
});

async function state() {
  return page.evaluate(() => {
    const stage = document.querySelector(".stage");
    const well = document.querySelector(".well");
    const caster = document.querySelector("#caster");
    const cue = document.querySelector("[data-testid=incantation-cue]");
    const cooldowns = [
      ...document.querySelectorAll("[data-testid=cooldown-strip] li"),
    ].map((node) => node.textContent?.trim() ?? "");
    return {
      phase: stage?.getAttribute("data-phase") ?? "",
      run: stage?.getAttribute("data-run") ?? "",
      prompt: cue?.textContent?.replace(/\s+/g, " ").trim() ?? "",
      reason: stage?.getAttribute("data-reason") ?? "",
      threat: stage?.getAttribute("data-threat-id") ?? "",
      locked: stage?.getAttribute("data-locked") ?? "",
      focused: document.activeElement === caster,
      canvas: Boolean(document.querySelector("[data-testid=well-canvas] canvas")),
      canvasPointerEvents: document.querySelector("[data-testid=well-canvas] canvas")
        ? getComputedStyle(
            document.querySelector("[data-testid=well-canvas] canvas"),
          ).pointerEvents
        : "none",
      goose: well?.getAttribute("data-goose") ?? "",
      struck: well?.getAttribute("data-struck") ?? "",
      bard: stage?.getAttribute("data-bard") ?? "",
      bardText:
        document.querySelector("[data-testid=bard-subtitle]")?.textContent?.trim() ??
        "",
      audio: stage?.getAttribute("data-audio") ?? "",
      audioUnlocked: stage?.getAttribute("data-audio-unlocked") ?? "",
      audioContext: stage?.getAttribute("data-audio-ctx") ?? "",
      cooldowns,
      outcome:
        document.querySelector("[data-testid=outcome-banner]")?.textContent?.trim() ??
        "",
      hint: document.querySelector("[data-testid=hint]")?.textContent?.trim() ?? "",
    };
  });
}

async function waitForPhase(...phases) {
  await page.waitForFunction(
    (expected) => expected.includes(document.querySelector(".stage")?.getAttribute("data-phase")),
    phases,
    { timeout: 35_000 },
  );
}

async function waitReady() {
  await waitForPhase("READY");
  await page.waitForFunction(() => document.activeElement?.id === "caster");
}

async function typeCurrent() {
  const current = await state();
  if (!current.prompt) {
    throw new Error(`No prompt available in ${current.phase}`);
  }
  await page.keyboard.type(current.prompt, { delay: 5 });
  await waitForPhase("RESOLVING");
}

async function settle() {
  await waitForPhase("READY", "AFTERMATH");
}

try {
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await waitReady();
  evidence.states.cold1280 = await state();
  await page.screenshot({
    path: new URL("01-cold-1280x720.png", outputDir).pathname,
  });

  await typeCurrent();
  evidence.states.cleanCast = await state();
  await page.screenshot({
    path: new URL("02-clean-cast.png", outputDir).pathname,
  });
  await settle();
  evidence.states.rerank = await state();
  await page.screenshot({
    path: new URL("03-rerank.png", outputDir).pathname,
  });

  await page.goto(baseURL, { waitUntil: "networkidle" });
  await waitReady();
  await page.keyboard.type("ignis ventis", { delay: 5 });
  await page.keyboard.press("Enter");
  await waitForPhase("RESOLVING");
  evidence.states.goose = await state();
  await page.screenshot({
    path: new URL("04-goose.png", outputDir).pathname,
  });

  await settle();
  await typeCurrent();
  await settle();
  evidence.states.recovery = await state();

  for (let wave = 0; wave < 10; wave += 1) {
    const current = await state();
    if (current.phase === "AFTERMATH") {
      break;
    }
    await typeCurrent();
    await settle();
  }
  evidence.states.win = await state();
  await page.screenshot({
    path: new URL("05-win.png", outputDir).pathname,
  });

  await page.keyboard.press("r");
  await waitReady();
  evidence.states.restartAfterWin = await state();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await waitReady();
  evidence.states.cold1440 = await state();
  await page.screenshot({
    path: new URL("06-cold-1440x900.png", outputDir).pathname,
  });

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(baseURL, { waitUntil: "networkidle" });
  await waitReady();
  const reducedBefore = await state();
  await page.keyboard.type("ig", { delay: 5 });
  const reducedAfter = await state();
  evidence.states.reducedMotion = {
    ...reducedAfter,
    promptHeld: reducedAfter.prompt === reducedBefore.prompt,
  };

  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(`${baseURL}/?flat=1`, { waitUntil: "networkidle" });
  await waitReady();
  evidence.states.flatCold = await state();
  await typeCurrent();
  evidence.states.flatCast = await state();

  await page.goto(`${baseURL}/?flat=1`, { waitUntil: "networkidle" });
  await waitReady();
  await waitForPhase("AFTERMATH");
  evidence.states.lose = await state();
  await page.screenshot({
    path: new URL("07-lose.png", outputDir).pathname,
  });
  await page.keyboard.press("r");
  await waitReady();
  evidence.states.restartAfterLoss = await state();
} finally {
  await browser.close();
}

evidence.remoteRequests = [...new Set(evidence.remoteRequests)];
console.log(JSON.stringify(evidence, null, 2));

if (
  evidence.consoleErrors.length ||
  evidence.pageErrors.length ||
  evidence.failedRequests.length ||
  evidence.badResponses.length ||
  evidence.assetMismatches.length ||
  evidence.remoteRequests.length
) {
  process.exitCode = 1;
}
