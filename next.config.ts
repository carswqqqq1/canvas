import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  transpilePackages: [
    "@openai-oauth/core",
    "@openai-oauth/react",
    "@openai-oauth/web"
  ]
};

export default nextConfig;
