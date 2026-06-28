import type { NextConfig } from "next";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const configDirectory = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ["@vocablens/shared"],
  poweredByHeader: false,
  turbopack: {
    root: resolve(configDirectory, "../.."),
  },
};

export default nextConfig;
