import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(process.cwd(), '../..'),
  transpilePackages: ['@recall/contracts', '@recall/client'],
  poweredByHeader: false,
};

export default nextConfig;
