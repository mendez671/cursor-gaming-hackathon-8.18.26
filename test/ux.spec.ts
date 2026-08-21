import { expect, test, type Page } from "@playwright/test";

type Hud = {
  activeId: string | null;
  cue: string;
  reason: string;
  phase: string | null;
  locked: string | null;
  well: string | null;
  threat: string | null;
  bard: string | null;
  bardText: string;
  hint: string;
  tti: string;
  ttiMs: number;
  buffer: string;
  held: string;
  struck: string | null;
  goose: string | null;
  misfire: string | null;
  run: string | null;
  hits: string | null;
  cooling: string[];
  canvas: boolean;
  glCanvas: boolean;
  world: string | null;
  audio: string | null;
  audioUnlocked: string | null;
  casterDisabled: boolean;
};

async function hud(page: Page): Promise<Hud> {
  return page.evaluate(() => {
    const stage = document.querySelector(".stage");
    const well = document.querySelector(".well");
    const bard = document.querySelector("[data-testid=bard-subtitle]");
    const ttiText = document.querySelector("[data-testid=tti]")?.textContent ?? "";
    const cue = document.querySelector("[data-testid=incantation-cue]");
    return {
      activeId: document.activeElement instanceof HTMLElement ? document.activeElement.id : null,
      cue: cue?.textContent ?? "",
      reason: stage?.getAttribute("data-reason") ?? "",
      phase: stage?.getAttribute("data-phase") ?? null,
      locked: stage?.getAttribute("data-locked") ?? null,
      well: stage?.getAttribute("data-well") ?? null,
      threat: stage?.getAttribute("data-threat-id") ?? null,
      bard: bard?.getAttribute("data-line") ?? null,
      bardText: bard?.textContent ?? "",
      hint: document.querySelector("[data-testid=hint]")?.textContent ?? "",
      tti: ttiText,
      ttiMs: Math.round(parseFloat(ttiText) * 1000),
      buffer: (document.getElementById("caster") as HTMLInputElement | null)?.value ?? "",
      held: stage?.getAttribute("data-held") ?? "",
      struck: well?.getAttribute("data-struck") ?? null,
      goose: well?.getAttribute("data-goose") ?? null,
      misfire: stage?.getAttribute("data-misfire") ?? null,
      run: stage?.getAttribute("data-run") ?? null,
      hits: stage?.getAttribute("data-hits") ?? null,
      cooling: [...document.querySelectorAll("[data-testid=cooldown-strip] [data-cooling=true]")].map(
        (node) => node.textContent ?? "",
      ),
      canvas: Boolean(document.querySelector("[data-testid=well-canvas]")),
      glCanvas: Boolean(document.querySelector("[data-testid=well-canvas] canvas")),
      world: stage?.getAttribute("data-world") ?? null,
      audio: stage?.hasAttribute("data-audio") ? (stage.getAttribute("data-audio") ?? "") : null,
      audioUnlocked: stage?.getAttribute("data-audio-unlocked") ?? null,
      casterDisabled: Boolean((document.getElementById("caster") as HTMLInputElement | null)?.disabled),
    };
  });
}

async function waitReady(page: Page) {
  await expect.poll(async () => (await hud(page)).phase).toBe("READY");
  await expect.poll(async () => (await hud(page)).activeId).toBe("caster");
}

async function waitResolving(page: Page) {
  await expect.poll(async () => (await hud(page)).phase).toBe("RESOLVING");
}

async function open(page: Page, path: string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await page.locator("#caster").waitFor({ state: "attached" });
  await page.locator("[data-testid=incantation-cue]").waitFor();
}

test.describe("SPELLCHECK player loop", () => {
  test("cold load: caster focused, phrase visible, no click", async ({ page }) => {
    await open(page, "/");
    const start = await hud(page);
    expect(start.activeId).toBe("caster");
    expect(start.cue.replace(/\s+/g, " ")).toContain("ignis ventus");
    expect(start.phase).toBe("READY");
    expect(start.casterDisabled).toBe(false);

    const cueBox = await page.locator("[data-testid=incantation-cue]").boundingBox();
    expect(cueBox).toBeTruthy();
    expect(cueBox!.width).toBeGreaterThan(120);
    expect(cueBox!.height).toBeGreaterThan(20);

    await expect(page.locator("[data-testid=nib]")).toBeVisible();
    const favicon = await page.request.get("/favicon.ico");
    expect(favicon.ok()).toBe(true);

    const pending = page.locator(".glyph-pending").first();
    const contrast = await pending.evaluate((node) => {
      const pageEl = document.querySelector(".page");
      const lectern = document.querySelector(".lectern");
      const color = getComputedStyle(node).color;
      const pageBg = getComputedStyle(pageEl ?? document.body).backgroundColor;
      const bg =
        pageBg === "rgba(0, 0, 0, 0)" || pageBg === "transparent"
          ? getComputedStyle(lectern ?? document.body).backgroundColor
          : pageBg;
      const channel = (value) =>
        value
          .replace(/rgba?\(/, "")
          .replace(")", "")
          .split(",")
          .slice(0, 3)
          .map((part) => Number(part.trim()) / 255);
      const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      const lum = (rgb) => 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
      const fg = lum(channel(color));
      const back = lum(channel(bg));
      const lighter = Math.max(fg, back);
      const darker = Math.min(fg, back);
      return (lighter + 0.05) / (darker + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(7);

    await page.keyboard.type("igni", { delay: 15 });
    const mid = await hud(page);
    expect(mid.buffer).toBe("igni");
    expect(mid.phase).toBe("TYPING");
    expect(mid.locked).toBe("true");
  });

  test("Caps Lock normalizes without breaking error feedback or Backspace", async ({ page }) => {
    await open(page, "/?flat=1");
    await waitReady(page);

    await page.keyboard.type("IGNX");
    const wrong = await hud(page);
    expect(wrong.buffer).toBe("ignx");
    expect(wrong.locked).toBe("true");
    await expect(page.locator(".glyph-incorrect")).toHaveCount(1);

    await page.keyboard.press("Backspace");
    const repaired = await hud(page);
    expect(repaired.buffer).toBe("ign");
    expect(repaired.locked).toBe("true");
    await expect(page.locator(".glyph-incorrect")).toHaveCount(0);

    await page.keyboard.type("IS VENTUS");
    await waitResolving(page);
    const cast = await hud(page);
    expect(cast.struck).toBe("true");
    expect(cast.goose).not.toBe("true");
  });

  test("typing the phrase auto-casts once and the threat reacts", async ({ page }) => {
    await open(page, "/");
    await waitReady(page);
    await page.keyboard.type("ignis ventus", { delay: 12 });
    await waitResolving(page);
    const resolving = await hud(page);
    expect(resolving.struck).toBe("true");
    expect(resolving.goose).not.toBe("true");
    expect(resolving.hint.toLowerCase()).not.toMatch(/invalid/);
    expect(page.url()).not.toMatch(/wasd/i);

    await page.keyboard.press("Enter");
    const still = await hud(page);
    expect(still.phase).toBe("RESOLVING");
    expect(still.struck).toBe("true");

    await waitReady(page);
    const next = await hud(page);
    expect(next.cue.replace(/\s+/g, " ")).toContain("glacies fractura");
    expect(next.reason).toBe("BEST VS. ARMOR");
    expect(next.threat).toBe("plated_sentinel");
    expect(next.locked).toBe("false");
    expect(next.activeId).toBe("caster");
    expect(next.cooling).toEqual(["SPENT · ignis ventus"]);
    await expect(page.locator("[data-testid=cooldown-strip]")).toHaveAttribute(
      "aria-label",
      "Spent spells",
    );
    await page.screenshot({ path: "artifacts/world-a-track/04-rerank.png", fullPage: true });
  });

  test("mid-word lock: prompt holds while TTI still moves", async ({ page }) => {
    await open(page, "/");
    await waitReady(page);
    const before = await hud(page);
    await page.keyboard.type("ig", { delay: 20 });
    const typed = await hud(page);
    expect(typed.locked).toBe("true");
    expect(typed.cue).toBe(before.cue);
    expect(typed.reason).toBe(before.reason);
    await page.waitForTimeout(350);
    const held = await hud(page);
    expect(held.cue).toBe(before.cue);
    expect(held.reason).toBe(before.reason);
    expect(held.locked).toBe("true");
    expect(held.phase).toBe("TYPING");
    expect(held.ttiMs).toBeLessThan(typed.ttiMs);
    expect(held.ttiMs).toBeGreaterThan(0);
  });

  test("ignis ventis + Enter is a goose, not an invalid", async ({ page }) => {
    await open(page, "/");
    await waitReady(page);
    await page.keyboard.type("ignis ventis");
    await page.keyboard.press("Enter");
    await waitResolving(page);
    const goose = await hud(page);
    expect(goose.goose).toBe("true");
    expect(goose.misfire).toBe("disappointed_goose");
    expect(goose.struck).toBe("false");
    expect(goose.bard).toMatch(/^goose_0/);
    expect(`${goose.hint} ${goose.bardText}`.toLowerCase()).not.toMatch(/invalid/);
    expect(goose.cue.replace(/\s+/g, " ")).toContain("ignis ventus");
    await page.screenshot({ path: "artifacts/world-a-track/05-goose.png", fullPage: true });
    const firstLine = goose.bard;

    await expect.poll(async () => (await hud(page)).phase).toBe("READY");
    await page.keyboard.type("ignis ventis");
    await page.keyboard.press("Enter");
    await waitResolving(page);
    const again = await hud(page);
    expect(again.goose).toBe("true");
    expect(again.bard).toBeTruthy();
    expect(again.bard).not.toBe(firstLine);
    expect(again.bard).toMatch(/typo_repeat|goose_0/);
    expect(again.hint.toLowerCase()).not.toMatch(/invalid/);
  });

  test("keys typed during RESOLVING land on the next prompt", async ({ page }) => {
    await open(page, "/?flat=1");
    await waitReady(page);
    await page.keyboard.type("ignis ventus", { delay: 8 });
    await waitResolving(page);
    await expect.poll(async () => (await hud(page)).activeId).toBe("caster");
    expect((await hud(page)).casterDisabled).toBe(false);
    await page.keyboard.type("gla", { delay: 20 });
    const holding = await hud(page);
    expect(holding.phase).toBe("RESOLVING");
    expect(holding.held).toBe("gla");
    await expect.poll(async () => (await hud(page)).phase).toBe("TYPING");
    const next = await hud(page);
    expect(next.buffer).toBe("gla");
    expect(next.phase).toBe("TYPING");
    expect(next.cue.replace(/\s+/g, " ")).toContain("glacies fractura");
    expect(next.activeId).toBe("caster");
  });

  test("click on canvas/stage does not cast or steal play", async ({ page }) => {
    await open(page, "/");
    await waitReady(page);
    const before = await hud(page);
    const wellCanvas = page.locator("[data-testid=well-canvas]");
    if ((await wellCanvas.count()) > 0) {
      await wellCanvas.click({ force: true, position: { x: 48, y: 48 } });
    }
    await page.mouse.click(420, 180);
    await page.waitForTimeout(80);
    const afterClick = await hud(page);
    expect(afterClick.phase).toBe("READY");
    expect(afterClick.struck).toBe("false");
    expect(afterClick.goose).not.toBe("true");
    expect(afterClick.buffer).toBe("");
    expect(afterClick.cue).toBe(before.cue);
    await expect.poll(async () => (await hud(page)).activeId).toBe("caster");

    await page.keyboard.type("ignis ventus", { delay: 10 });
    await waitResolving(page);
    expect((await hud(page)).struck).toBe("true");
  });

  test("world canvas exists unless ?flat=1", async ({ page }) => {
    await open(page, "/");
    await waitReady(page);
    await expect.poll(async () => (await hud(page)).well).toBe("canvas");
    await expect.poll(async () => (await hud(page)).canvas).toBe(true);
    await expect.poll(async () => (await hud(page)).glCanvas).toBe(true);
    const live = await hud(page);
    expect(live.world).toBe("frontier");
    expect(live.activeId).toBe("caster");

    await open(page, "/?flat=1");
    await waitReady(page);
    const flat = await hud(page);
    expect(flat.well).toBe("flat");
    expect(flat.world).toBe("flat");
    expect(flat.canvas).toBe(false);
    expect(flat.glCanvas).toBe(false);
    expect(flat.activeId).toBe("caster");
  });

  test("hold-buffer still works with the world canvas", async ({ page }) => {
    await open(page, "/");
    await waitReady(page);
    await expect.poll(async () => (await hud(page)).canvas).toBe(true);
    await page.keyboard.type("ignis ventus", { delay: 8 });
    await waitResolving(page);
    await expect.poll(async () => (await hud(page)).activeId).toBe("caster");
    expect((await hud(page)).casterDisabled).toBe(false);
    await page.keyboard.type("gla", { delay: 20 });
    const holding = await hud(page);
    expect(holding.phase).toBe("RESOLVING");
    expect(holding.held).toBe("gla");
    await expect.poll(async () => (await hud(page)).phase).toBe("TYPING");
    const next = await hud(page);
    expect(next.buffer).toBe("gla");
    expect(next.phase).toBe("TYPING");
    expect(next.cue.replace(/\s+/g, " ")).toContain("glacies fractura");
    expect(next.activeId).toBe("caster");
  });

  test("data-audio is present if the audio sibling wired it", async ({ page }) => {
    await open(page, "/");
    await waitReady(page);
    const start = await hud(page);
    if (start.audio === null && start.audioUnlocked === null) {
      test.skip(true, "audio sibling has not added data-audio");
    }
    expect(start.audioUnlocked).toBe("false");
    await page.keyboard.type("i");
    await expect.poll(async () => (await hud(page)).audioUnlocked).toBe("true");
    await expect
      .poll(async () => (await hud(page)).audio ?? "")
      .toMatch(/tick|bard|error|cast|bed/);
    await page.keyboard.type("gnis ventus", { delay: 10 });
    await waitResolving(page);
    const resolving = await hud(page);
    expect(resolving.struck).toBe("true");
    expect(resolving.audio).toMatch(/cast|bard|tick/);
  });

  test("R restart after a win returns focus and clears the lock", async ({ page }) => {
    await open(page, "/");
    const book = [
      "ignis ventus",
      "glacies fractura",
      "lumen aqua",
      "fulgur ventus",
      "aqua glacies",
      "umbra mors",
    ];
    for (const phrase of book) {
      await waitReady(page);
      await expect
        .poll(async () => (await hud(page)).cue.replace(/\s+/g, " "))
        .toContain(phrase);
      await page.keyboard.type(phrase, { delay: 8 });
      await waitResolving(page);
    }
    await expect.poll(async () => (await hud(page)).phase).toBe("AFTERMATH");
    const ended = await hud(page);
    expect(ended.run).toBe("won");
    expect(ended.bard).toBe("win_01");
    await page.screenshot({ path: "artifacts/world-a-track/06-win.png", fullPage: true });

    await page.keyboard.press("r");
    await waitReady(page);
    const fresh = await hud(page);
    expect(fresh.activeId).toBe("caster");
    expect(fresh.locked).toBe("false");
    expect(fresh.run).toBe("none");
    expect(fresh.cue.replace(/\s+/g, " ")).toContain("ignis ventus");
    expect(fresh.bard).toMatch(/^open_0/);
    expect(fresh.cooling).toEqual([]);
    expect(fresh.buffer).toBe("");
    expect(fresh.casterDisabled).toBe(false);
  });

  test("?flat=1 stays playable without a canvas", async ({ page }) => {
    await open(page, "/?flat=1");
    const start = await hud(page);
    expect(start.activeId).toBe("caster");
    expect(start.well).toBe("flat");
    expect(start.canvas).toBe(false);
    expect(start.cue.replace(/\s+/g, " ")).toContain("ignis ventus");

    await page.mouse.click(400, 200);
    await expect.poll(async () => (await hud(page)).activeId).toBe("caster");
    await page.keyboard.type("ignis ventus", { delay: 10 });
    await waitResolving(page);
    expect((await hud(page)).struck).toBe("true");
    await waitReady(page);
    const next = await hud(page);
    expect(next.cue.replace(/\s+/g, " ")).toContain("glacies fractura");
    expect(next.well).toBe("flat");
    expect(next.canvas).toBe(false);
  });

  test("three empty impacts lose the run", async ({ page }) => {
    await page.clock.install();
    await open(page, "/?flat=1");
    await waitReady(page);
    for (let hit = 1; hit <= 3; hit += 1) {
      const ttiMs = (await hud(page)).ttiMs;
      await page.clock.fastForward(Math.max(ttiMs + 250, 8_250));
      await expect.poll(async () => (await hud(page)).phase).toBe("RESOLVING");
      const impact = await hud(page);
      expect(impact.hits).toBe(String(hit));
      expect(impact.struck).toBe("false");
      expect(impact.goose).not.toBe("true");
      await page.clock.fastForward(600);
      if (hit < 3) {
        await waitReady(page);
      }
    }
    await expect.poll(async () => (await hud(page)).phase).toBe("AFTERMATH");
    const lost = await hud(page);
    expect(lost.phase).toBe("AFTERMATH");
    expect(lost.run).toBe("lost");
    expect(lost.hits).toBe("3");
    expect(lost.bard).toMatch(/^lose_0/);
    expect(lost.bardText.length).toBeGreaterThan(0);
  });

  test("goose then a clean cast speaks recover", async ({ page }) => {
    await open(page, "/?flat=1");
    await waitReady(page);
    await page.keyboard.type("ignis ventis");
    await page.keyboard.press("Enter");
    await waitResolving(page);
    expect((await hud(page)).goose).toBe("true");
    expect((await hud(page)).bard).toMatch(/^goose_0/);

    await waitReady(page);
    const cue = (await hud(page)).cue.replace(/\s+/g, " ");
    expect(cue).toContain("ignis ventus");
    await page.keyboard.type("ignis ventus", { delay: 8 });
    await waitResolving(page);
    const recovered = await hud(page);
    expect(recovered.struck).toBe("true");
    expect(recovered.goose).not.toBe("true");
    expect(recovered.bard).toMatch(/^recover_0/);
    expect(recovered.bardText.length).toBeGreaterThan(0);
  });

  test("mute still shows bard subtitle after opener and goose", async ({ page }) => {
    await page.addInitScript(() => {
      const proto = SpeechSynthesis.prototype;
      proto.speak = () => undefined;
      proto.cancel = () => undefined;
    });
    await open(page, "/?flat=1");
    await waitReady(page);
    const opener = await hud(page);
    expect(opener.bard).toMatch(/^open_0/);
    expect(opener.bardText.length).toBeGreaterThan(0);
    await expect(page.locator("[data-testid=bard-subtitle]")).toBeVisible();

    await page.keyboard.type("ignis ventis");
    await page.keyboard.press("Enter");
    await waitResolving(page);
    const goose = await hud(page);
    expect(goose.goose).toBe("true");
    expect(goose.bard).toMatch(/^goose_0/);
    expect(goose.bardText.length).toBeGreaterThan(0);
    await expect(page.locator("[data-testid=bard-subtitle]")).toBeVisible();
  });

  test("offline: no live model traffic", async ({ page }, testInfo) => {
    const localOrigin = new URL(String(testInfo.project.use.baseURL)).origin;
    const urls: string[] = [];
    const blocked: string[] = [];
    page.on("request", (request) => urls.push(request.url()));
    await page.route("**/*", async (route) => {
      const url = new URL(route.request().url());
      if (
        (url.protocol === "http:" || url.protocol === "https:") &&
        url.origin !== localOrigin
      ) {
        blocked.push(url.href);
        await route.abort("blockedbyclient");
        return;
      }
      await route.continue();
    });
    await open(page, "/?flat=1");
    await page.keyboard.type("ignis ventus", { delay: 10 });
    await waitResolving(page);
    const remote = urls.filter((url) => new URL(url).origin !== localOrigin);
    expect(blocked).toEqual([]);
    expect(remote).toEqual([]);
    expect(urls.some((url) => /openai|anthropic|api\.|\/v1\/|generate|model/i.test(url))).toBe(
      false,
    );
  });

  test("world A-track: corridor objects, readable prompt, no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });
    await open(page, "/");
    await waitReady(page);
    await expect.poll(async () => (await hud(page)).glCanvas).toBe(true);
    const cueBox = await page.locator("[data-testid=incantation-cue]").boundingBox();
    expect(cueBox).toBeTruthy();
    expect(cueBox!.width).toBeGreaterThan(120);
    expect(cueBox!.height).toBeGreaterThan(20);
    const start = await hud(page);
    expect(start.cue.replace(/\s+/g, " ")).toContain("ignis ventus");
    expect(start.world).toBe("frontier");

    await expect
      .poll(async () => {
        const found = await page.evaluate(() => {
          const root = (
            window as Window & {
              __SPELLCHECK_SCENE?: { getObjectByName: (name: string) => unknown };
            }
          ).__SPELLCHECK_SCENE;
          if (!root) {
            return { ready: false, missing: ["scene"] };
          }
          const names = [
            "road-ribbon",
            "departure-pad",
            "archive",
            "segment-departure-platform",
            "segment-opening-straight",
            "segment-encounter-clearing-a",
            "segment-river-bend",
            "segment-central-clearing",
            "segment-bridge",
            "segment-archive-approach",
            "vfx-fire",
            "vfx-ice",
            "vfx-wind",
            "vfx-earth",
            "monolith-A",
            "ink-river",
            "ink-river-near",
            "module-bridge",
            "module-clearing",
            "module-ramp",
            "wordlock-shrine",
            "verge-grass",
            "verge-flowers",
            "verge-shrubs",
          ];
          const missing = names.filter((name) => !root.getObjectByName(name));
          return { ready: missing.length === 0, missing };
        });
        return found.ready ? "ok" : found.missing.join(",");
      })
      .toBe("ok");

    await page.screenshot({ path: "artifacts/world-a-track/01-cold.png", fullPage: true });
    await page.keyboard.type("ignis ventus", { delay: 12 });
    await waitResolving(page);
    const cast = await hud(page);
    expect(cast.struck).toBe("true");
    expect(cast.cue.replace(/\s+/g, " ")).toContain("ignis ventus");
    await page.waitForTimeout(220);
    await page.screenshot({ path: "artifacts/world-a-track/02-cast.png", fullPage: true });
    expect(errors.filter((line) => !/favicon/i.test(line))).toEqual([]);
  });

  test("world A-track: reduced-motion still plays and ?flat=1 stays flat", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page, "/");
    await waitReady(page);
    await expect.poll(async () => (await hud(page)).activeId).toBe("caster");
    await page.keyboard.type("ignis ventus", { delay: 10 });
    await waitResolving(page);
    expect((await hud(page)).struck).toBe("true");
    await page.screenshot({ path: "artifacts/world-a-track/03-reduced-motion.png", fullPage: true });

    await open(page, "/?flat=1");
    await waitReady(page);
    const flat = await hud(page);
    expect(flat.well).toBe("flat");
    expect(flat.canvas).toBe(false);
    expect(flat.cue.replace(/\s+/g, " ")).toContain("ignis ventus");
  });
});
