import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { zipSync } from "fflate";

const extDist = resolve("apps/extension/dist");
const publicDir = resolve("apps/web/public");
const zipPath = resolve("apps/web/public/vocablens-extension.zip");

if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

if (!existsSync(extDist)) {
  console.error(`Error: Extension dist folder not found at "${extDist}".`);
  console.error("Please run the extension build first: npm run build -w @vocablens/extension");
  process.exit(1);
}

const files = {};
function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) collect(absolute);
    else files[relative(extDist, absolute).replaceAll("\\", "/")] = new Uint8Array(readFileSync(absolute));
  }
}

collect(extDist);
writeFileSync(zipPath, zipSync(files, { level: 9 }));
console.log(`Packaged ${Object.keys(files).length} extension files to ${zipPath}`);
