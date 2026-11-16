import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/group/two/2',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;