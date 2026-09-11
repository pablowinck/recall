/** The public address of this deployment, used by metadata, robots and the sitemap. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://recall-web-gilt.vercel.app';

/** The MCP endpoint assistants connect to, as published in the server card. */
export const MCP_URL = process.env.NEXT_PUBLIC_MCP_URL ?? 'https://recall-mcp-five.vercel.app/mcp';
