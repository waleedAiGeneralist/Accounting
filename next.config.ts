import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local-first ledger: always read live SQLite. Cache Components / PPR
  // conflict with force-dynamic pages used throughout the app.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
