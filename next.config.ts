import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.freepik.com/**",
      },
    ],
  },
  // if used turbopack
  transpilePackages: ["next-mdx-remote", "vnstock-js", "lightweight-charts"],
};

export default nextConfig;
