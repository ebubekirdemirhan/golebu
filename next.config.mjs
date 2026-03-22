/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'crests.football-data.org', pathname: '/**' },
      { protocol: 'http', hostname: 'crests.football-data.org', pathname: '/**' },
    ],
  },
};

export default nextConfig;
