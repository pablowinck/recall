import type { NextConfig } from 'next';
import path from 'node:path';

// Agents that ask for Markdown (acceptmarkdown.com) get Markdown; browsers keep the HTML.
const markdownAccept = { type: 'header', key: 'accept', value: '(.*)text/markdown(.*)' } as const;

const nextConfig: NextConfig = {
  // Next.js #96646: the Vercel adapter conflicts with standalone output in 16.3.
  output: process.env.VERCEL ? undefined : 'standalone',
  outputFileTracingRoot: path.join(process.cwd(), '../..'),
  transpilePackages: ['@recall/contracts', '@recall/client'],
  poweredByHeader: false,
  // Agents that ask for Markdown get the llms.txt guide at the home page (acceptmarkdown.com); browsers keep the HTML.
  // Advertise the Markdown twin in the response too (RFC 8288), for agents that read headers before HTML.
  async headers() {
    return [
      {
        source: '/',
        headers: [{ key: 'Link', value: '</llms.txt>; rel="alternate"; type="text/markdown"' }],
      },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          has: [markdownAccept],
          destination: '/llms.txt',
        },
      ],
      afterFiles: [
        // Agents probe /index.md for a Markdown twin of the home page.
        { source: '/index.md', destination: '/llms.txt' },
      ],
      fallback: [
        // Unknown paths give agents a Markdown 404 with the way back; browsers keep not-found.tsx.
        { source: '/:path*', has: [markdownAccept], destination: '/not-found.md' },
      ],
    };
  },
};

export default nextConfig;
