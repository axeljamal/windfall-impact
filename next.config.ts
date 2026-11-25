import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `next build` writes plain HTML, CSS and JS to out/, served by Cloudflare Workers static assets
  // (wrangler.jsonc). No server runs at request time.
  output: "export",
  // method/index.html rather than method.html, so any plain static server (and Workers assets) finds it.
  trailingSlash: true,
  images: { unoptimized: true },
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
