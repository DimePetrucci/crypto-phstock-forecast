import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    domains: ["assets.coingecko.com"],
  },
  experimental: {},
};

export default nextConfig;
