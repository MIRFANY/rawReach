import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "your-image-host.com",
        pathname: "/**",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;