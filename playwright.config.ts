import { defineConfig } from "@playwright/test";

const baseURL = process.env.SPELLCHECK_URL ?? "http://127.0.0.1:5174";

export default defineConfig({
  testDir: "test",
  testMatch: "*.spec.ts",
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL,
    channel: "chrome",
    trace: "off",
    viewport: { width: 1100, height: 720 },
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 5174",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
