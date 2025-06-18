import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/unstackle',
  assetPrefix: '/unstackle',
  trailingSlash: true,
  output: 'export',
  distDir: 'build'
};

module.exports = nextConfig;
