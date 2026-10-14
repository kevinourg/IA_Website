import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Les packages internes sont consommés en TypeScript source.
  transpilePackages: ["@site-ia/ai", "@site-ia/core", "@site-ia/db", "@site-ia/renderer"],
  serverExternalPackages: ["postgres"],
};

export default nextConfig;
