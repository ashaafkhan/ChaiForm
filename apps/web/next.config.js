/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['@chaiforms/ui', '@chaiforms/utils'],
  },
  typescript: {
    // TODO: Remove this once all types are fixed
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
