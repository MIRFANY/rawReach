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
  experimental: {
    optimizeCss: false, // Disable lightningcss temporarily
    turbo: false,       // Turn off Turbo if it's causing cache or reload issues
  },
  reactStrictMode: true,
};

export default nextConfig;