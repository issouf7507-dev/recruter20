import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Turbopack must compile from the repo root (where `next` is installed), not from `app/`.
  // Without this, Next can infer the wrong workspace root and fail to resolve `next/package.json`.
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
