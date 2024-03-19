if (process.env.NODE_ENV === "development") {
  const { setupDevPlatform } = require("@cloudflare/next-on-pages/next-dev")
  setupDevPlatform()
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
};

module.exports = nextConfig;
