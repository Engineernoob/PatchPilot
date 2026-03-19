import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@patchpilot/shared", "@patchpilot/evals"],
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;

