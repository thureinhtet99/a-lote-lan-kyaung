import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // transpilePackages: ["next-mdx-remote"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
