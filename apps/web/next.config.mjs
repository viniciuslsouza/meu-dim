import { withSentryConfig } from "@sentry/nextjs/config";

/** @type {import("next").NextConfig} */
const nextConfig = {
  transpilePackages: ["@meudim/shared", "@meudim/ui"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false
    };

    return config;
  }
};

export default withSentryConfig(nextConfig, {
  silent: true
});
