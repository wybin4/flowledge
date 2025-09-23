import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      include: /\/assets\/.*\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  turbopack: {
    root: process.cwd(),
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    }
  },
};

export default nextConfig;
