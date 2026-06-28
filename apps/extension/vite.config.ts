import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content.ts"),
        background: resolve(__dirname, "src/background.ts"),
        popup: resolve(__dirname, "src/popup.ts")
      },
      output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js" }
    }
  }
});
