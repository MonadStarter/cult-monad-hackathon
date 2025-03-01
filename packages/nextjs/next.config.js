// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, //TODO: Set to true
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allows images from any hostname
      },
    ],
  },
  webpack: config => {
    config.infrastructureLogging = { level: "error" }; //TODO: Suppress warnings
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

module.exports = nextConfig;
