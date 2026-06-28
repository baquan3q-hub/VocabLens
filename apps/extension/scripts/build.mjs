import { build, loadEnv } from "vite";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const watch = process.argv.includes("--watch") ? {} : null;
const production = process.argv.includes("--production");
const env = { ...loadEnv("production", root, ""), ...process.env };

if (production) {
  const required = ["VITE_API_BASE_URL", "VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
  const missing = required.filter(name => !env[name]);
  if (missing.length) throw new Error(`Missing production extension variables: ${missing.join(", ")}`);
  if (!String(env.VITE_API_BASE_URL).startsWith("https://")) throw new Error("VITE_API_BASE_URL must use HTTPS in production");
}

const targets = [
  { name: "content", input: "src/content.ts", format: "iife", copyPublicDir: true, emptyOutDir: true },
  { name: "background", input: "src/background.ts", format: "es", copyPublicDir: false, emptyOutDir: false },
  { name: "popup", input: "src/popup.ts", format: "es", copyPublicDir: false, emptyOutDir: false }
];

for (const target of targets) {
  await build({
    root,
    configFile: false,
    publicDir: target.copyPublicDir ? resolve(root, "public") : false,
    build: {
      outDir: resolve(root, "dist"),
      emptyOutDir: target.emptyOutDir,
      copyPublicDir: target.copyPublicDir,
      watch,
      rollupOptions: {
        input: resolve(root, target.input),
        output: {
          format: target.format,
          entryFileNames: `${target.name}.js`,
          inlineDynamicImports: true
        }
      }
    }
  });
}

const manifestPath = resolve(root, "dist/manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
for (const value of [env.VITE_API_BASE_URL, env.VITE_SUPABASE_URL]) {
  if (!value) continue;
  const originPattern = `${new URL(String(value)).origin}/*`;
  if (!manifest.host_permissions.includes(originPattern)) manifest.host_permissions.push(originPattern);
}
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
