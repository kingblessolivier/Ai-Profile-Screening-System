import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
    resolveAlias: {
      tailwindcss: "tailwindcss",
      "tailwindcss/nesting": "tailwindcss/nesting",
    },
  },
};

export default nextConfig;
