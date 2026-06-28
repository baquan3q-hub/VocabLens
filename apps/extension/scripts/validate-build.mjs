import { readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, "../dist");
const manifest = JSON.parse(await readFile(resolve(dist, "manifest.json"), "utf8"));
const requiredFiles = ["manifest.json", "background.js", "content.js", "popup.html", "popup.js"];
const errors = [];
for (const file of requiredFiles) {
  try { const info = await stat(resolve(dist, file)); if (info.size === 0) errors.push(`${file} is empty`); }
  catch { errors.push(`${file} is missing`); }
}
if (manifest.manifest_version !== 3) errors.push("manifest_version must be 3");
if (!manifest.key) errors.push("manifest key is required to keep a stable unpacked extension id");
if (manifest.background?.service_worker !== "background.js") errors.push("background service worker is not configured");
if (!manifest.content_scripts?.some(entry => entry.js?.includes("content.js"))) errors.push("content.js is not registered");
if (manifest.action?.default_popup !== "popup.html") errors.push("popup.html is not configured");
if (!manifest.permissions?.includes("identity") || !manifest.permissions?.includes("storage")) errors.push("identity/storage permissions are required");
const contentSource = await readFile(resolve(dist, "content.js"), "utf8");
if (/^\s*import\s/m.test(contentSource)) errors.push("content.js contains ESM imports; Manifest V3 content scripts must be self-contained");
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Extension build valid: ${requiredFiles.join(", ")}`);
