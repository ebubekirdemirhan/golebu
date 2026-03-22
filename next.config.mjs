/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/golebu',
  assetPrefix: '/golebu/',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
