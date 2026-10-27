import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const apiInternalUrl = (process.env.API_INTERNAL_URL || "http://127.0.0.1:3000").replace(
      /\/+$/,
      "",
    );

    return [
      {
        source: "/api/:path*",
        destination: `${apiInternalUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
