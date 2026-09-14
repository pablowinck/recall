/** The public address of this deployment, used by metadata, robots and the sitemap. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://userecall.org';

/** The MCP endpoint assistants connect to, as published in the server card. */
export const MCP_URL = process.env.NEXT_PUBLIC_MCP_URL ?? 'https://mcp.userecall.org/mcp';
