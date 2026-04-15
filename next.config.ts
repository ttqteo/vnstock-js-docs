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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
  },
  turbopack: {
    resolveAlias: {
      fs: { browser: "./lib/empty-module.ts" },
      path: { browser: "./lib/empty-module.ts" },
      os: { browser: "./lib/empty-module.ts" },
      net: { browser: "./lib/empty-module.ts" },
      tls: { browser: "./lib/empty-module.ts" },
    },
  },
};

export default nextConfig;
