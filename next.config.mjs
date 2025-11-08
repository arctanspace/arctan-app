/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;
