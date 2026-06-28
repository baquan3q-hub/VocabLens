import { execSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

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

try {
  if (process.platform === "win32") {
    // Windows: Try powershell Compress-Archive first, then fallback to tar
    try {
      console.log("Attempting to package using PowerShell Compress-Archive...");
      // Using -Path 'path/*' packs the contents, not the folder itself
      execSync(`powershell -Command "Compress-Archive -Path '${extDist}/*' -DestinationPath '${zipPath}' -Force"`, { stdio: "inherit" });
      console.log("Packaged successfully via PowerShell.");
    } catch (e) {
      console.log("PowerShell Compress-Archive failed. Trying tar...");
      execSync(`tar -a -c -f "${zipPath}" -C "${extDist}" .`, { stdio: "inherit" });
      console.log("Packaged successfully via tar.");
    }
  } else {
    // Unix/Linux/macOS: Try tar first, then fallback to zip command
    try {
      console.log("Attempting to package using tar...");
      execSync(`tar -a -c -f "${zipPath}" -C "${extDist}" .`, { stdio: "inherit" });
      console.log("Packaged successfully via tar.");
    } catch (e) {
      console.log("tar failed. Trying zip command...");
      execSync(`cd "${extDist}" && zip -r "${zipPath}" .`, { stdio: "inherit" });
      console.log("Packaged successfully via zip.");
    }
  }
} catch (err) {
  console.error("All packaging attempts failed:", err);
  process.exit(1);
}
