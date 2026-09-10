import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // Next.js #96646: the Vercel adapter conflicts with standalone output in 16.3.
  output: process.env.VERCEL ? undefined : 'standalone',
  outputFileTracingRoot: path.join(process.cwd(), '../..'),
  transpilePackages: ['@recall/contracts', '@recall/client'],
  poweredByHeader: false,
};

export default nextConfig;
