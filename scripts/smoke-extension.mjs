import { chromium } from "playwright-core";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const extensionPath = resolve("apps/extension/dist");
const executablePath = process.env.BROWSER_EXECUTABLE || "C:\\Program Files\\CocCoc\\Browser\\Application\\browser.exe";
const profile = await mkdtemp(join(tmpdir(), "vocablens-extension-"));
let context;

try {
  context = await chromium.launchPersistentContext(profile, {
    executablePath,
    headless: true,
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      "--no-first-run",
      "--disable-default-apps"
    ]
  });

  const page = await context.newPage();
  await page.goto("http://localhost:3000/extension-test.html", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    const text = document.querySelector("#test-copy")?.firstChild;
    if (!text?.textContent) throw new Error("Fixture text missing");
    const start = text.textContent.indexOf("paradigm");
    const range = document.createRange();
    range.setStart(text, start); range.setEnd(text, start + "paradigm".length);
    const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range);
    document.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  });

  await page.waitForFunction(() => {
    const host = document.querySelector("#vocablens-shadow-host");
    return host?.shadowRoot?.querySelector("h2")?.textContent?.toLowerCase() === "paradigm";
  }, null, { timeout: 20_000 });

  await page.evaluate(() => {
    const button = document.querySelector("#vocablens-shadow-host")?.shadowRoot?.querySelector("#save");
    if (!button) throw new Error("Save button missing");
    button.click();
  });

  await page.waitForFunction(() => {
    const button = document.querySelector("#vocablens-shadow-host")?.shadowRoot?.querySelector("#save");
    return button?.textContent?.includes("Đã lưu");
  }, null, { timeout: 10_000 });

  const worker = context.serviceWorkers().find(item => item.url().includes("background.js"));
  if (!worker) throw new Error("Extension service worker did not start");
  const extensionId = new URL(worker.url()).hostname;
  if (extensionId !== "hgiddlpbigolofgkdpjbomekihbajogp") throw new Error(`Unexpected extension id: ${extensionId}`);

  console.log(`Extension smoke test passed (${extensionId}): selection -> popup -> lookup -> save`);
} finally {
  await context?.close();
  await rm(profile, { recursive: true, force: true });
}
