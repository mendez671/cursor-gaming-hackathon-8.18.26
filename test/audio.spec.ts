import { expect, test, type Page } from "@playwright/test";

type AudioHud = {
  phase: string | null;
  audio: string;
  line: string;
  pending: string;
  unlocked: string | null;
  ctx: string | null;
  bard: string | null;
  bardText: string;
  goose: string | null;
  struck: string | null;
  speaking: boolean;
  pendingUtterances: number;
};

async function audioHud(page: Page): Promise<AudioHud> {
  return page.evaluate(() => {
    const stage = document.querySelector(".stage");
    const bard = document.querySelector("[data-testid=bard-subtitle]");
    const well = document.querySelector(".well");
    const synth = window.speechSynthesis;
    return {
      phase: stage?.getAttribute("data-phase") ?? null,
      audio: stage?.getAttribute("data-audio") ?? "",
      line: stage?.getAttribute("data-audio-line") ?? "",
      pending: stage?.getAttribute("data-audio-pending") ?? "",
      unlocked: stage?.getAttribute("data-audio-unlocked") ?? null,
      ctx: stage?.getAttribute("data-audio-ctx") ?? null,
      bard: bard?.getAttribute("data-line") ?? null,
      bardText: bard?.textContent ?? "",
      goose: well?.getAttribute("data-goose") ?? null,
      struck: well?.getAttribute("data-struck") ?? null,
      speaking: Boolean(synth?.speaking),
      pendingUtterances: synth ? (synth as SpeechSynthesis & { pending?: boolean }).pending
        ? 1
        : synth.speaking
          ? 1
          : 0 : 0,
    };
  });
}

async function open(page: Page) {
  await page.goto("/?flat=1", { waitUntil: "domcontentloaded" });
  await page.locator("#caster").waitFor({ state: "attached" });
  await expect.poll(async () => (await audioHud(page)).phase).toBe("READY");
  await expect
    .poll(async () =>
      page.evaluate(() =>
        document.activeElement instanceof HTMLElement ? document.activeElement.id : null,
      ),
    )
    .toBe("caster");
}

test.describe("SPELLCHECK audio layer", () => {
  test("first key unlocks audio and typing leaves an observable cue", async ({ page }) => {
    await open(page);
    const cold = await audioHud(page);
    expect(cold.unlocked).toBe("false");
    expect(cold.bardText.length).toBeGreaterThan(0);

    await page.keyboard.type("i");
    await expect.poll(async () => (await audioHud(page)).unlocked).toBe("true");
    await expect.poll(async () => (await audioHud(page)).line).toBe("open_01");
    await expect.poll(async () => {
      const hud = await audioHud(page);
      return hud.audio || (hud.speaking ? "bard" : "");
    }).toMatch(/tick|bard|error|cast/);

    await page.keyboard.type("gnis ventus", { delay: 10 });
    await expect.poll(async () => (await audioHud(page)).phase).toBe("RESOLVING");
    const cast = await audioHud(page);
    expect(cast.struck).toBe("true");
    expect(cast.bardText.length).toBeGreaterThan(0);
    expect(
      cast.speaking ||
        cast.pendingUtterances > 0 ||
        /cast|bard|tick/.test(cast.audio),
    ).toBe(true);
  });

  test("goose records a misfire cue and keeps the subtitle", async ({ page }) => {
    await open(page);
    await page.keyboard.type("ignis ventis");
    await page.keyboard.press("Enter");
    await expect.poll(async () => (await audioHud(page)).phase).toBe("RESOLVING");
    const goose = await audioHud(page);
    expect(goose.goose).toBe("true");
    expect(goose.bard).toMatch(/^goose_0/);
    expect(goose.bardText.toLowerCase()).toMatch(/goose/);
    expect(goose.speaking || /goose|bard/.test(goose.audio)).toBe(true);
    expect(goose.line === "goose_01" || goose.pending === "goose_01" || goose.bard === "goose_01").toBe(
      true,
    );
  });

  test("thrown speak() cannot stall READY or RESOLVING", async ({ page }) => {
    await page.addInitScript(() => {
      const proto = SpeechSynthesis.prototype;
      proto.speak = () => {
        throw new Error("speechSynthesis.speak failed");
      };
    });
    await open(page);
    await page.keyboard.type("ignis ventus", { delay: 8 });
    await expect.poll(async () => (await audioHud(page)).phase).toBe("RESOLVING");
    const hud = await audioHud(page);
    expect(hud.struck).toBe("true");
    expect(hud.bardText.length).toBeGreaterThan(0);
    expect(hud.unlocked).toBe("true");
    expect(/cast|bard|tick|error|goose/.test(hud.audio)).toBe(true);
  });
});
