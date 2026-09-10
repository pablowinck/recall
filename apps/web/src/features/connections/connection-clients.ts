export type ConnectionClientId =
  'claude-code' | 'codex' | 'cursor' | 'vscode' | 'claude-desktop' | 'gemini-cli' | 'other';

export interface ConnectionClient {
  id: ConnectionClientId;
  name: string;
  /** Where the setup goes, shown above the snippet. */
  where: string;
  /** Build ready-to-paste setup; the token is only known right after a connection is created. */
  setup: (endpoint: string, token: string) => string;
}

function json(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

/**
 * MCP clients that accept a bearer token over Streamable HTTP. Formats follow each client's docs.
 * Example: findConnectionClient('cursor').setup(url, token).
 */
export const connectionClients: ConnectionClient[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    where: 'Run this in your terminal.',
    setup: (endpoint, token) =>
      `claude mcp add --transport http recall ${endpoint} --header "Authorization: Bearer ${token}"`,
  },
  {
    id: 'codex',
    name: 'Codex',
    where: 'Add this to ~/.codex/config.toml, then set the token in your shell.',
    setup: (endpoint, token) =>
      `[mcp_servers.recall]\nurl = "${endpoint}"\nbearer_token_env_var = "RECALL_MCP_TOKEN"\n\n# In your shell profile:\n# export RECALL_MCP_TOKEN="${token}"`,
  },
  {
    id: 'cursor',
    name: 'Cursor',
    where: 'Add this to ~/.cursor/mcp.json.',
    setup: (endpoint, token) =>
      json({
        mcpServers: { recall: { url: endpoint, headers: { Authorization: `Bearer ${token}` } } },
      }),
  },
  {
    id: 'vscode',
    name: 'VS Code',
    where: 'Add this to .vscode/mcp.json. VS Code asks for the token once and stores it securely.',
    setup: (endpoint) =>
      json({
        inputs: [
          { type: 'promptString', id: 'recall-token', description: 'Recall token', password: true },
        ],
        servers: {
          recall: {
            type: 'http',
            url: endpoint,
            headers: { Authorization: 'Bearer ${input:recall-token}' },
          },
        },
      }),
  },
  {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    where: 'Add this to claude_desktop_config.json and restart Claude. It needs Node.js.',
    // mcp-remote bridges stdio-only desktop configs to a remote server; no spaces in args avoids a Windows quoting bug.
    setup: (endpoint, token) =>
      json({
        mcpServers: {
          recall: {
            command: 'npx',
            args: ['-y', 'mcp-remote', endpoint, '--header', 'Authorization:${RECALL_AUTH_HEADER}'],
            env: { RECALL_AUTH_HEADER: `Bearer ${token}` },
          },
        },
      }),
  },
  {
    id: 'gemini-cli',
    name: 'Gemini CLI',
    where: 'Add this to ~/.gemini/settings.json.',
    setup: (endpoint, token) =>
      json({
        mcpServers: {
          recall: { httpUrl: endpoint, headers: { Authorization: `Bearer ${token}` } },
        },
      }),
  },
  {
    id: 'other',
    name: 'Other MCP client',
    where: 'Use Streamable HTTP with this URL and header.',
    setup: (endpoint, token) => `URL: ${endpoint}\nHeader: Authorization: Bearer ${token}`,
  },
];

/** Find a client by id, falling back to the generic setup. Example: findConnectionClient('codex').name === 'Codex'. */
export function findConnectionClient(id: string): ConnectionClient {
  return (
    connectionClients.find((client) => client.id === id) ??
    connectionClients[connectionClients.length - 1]!
  );
}
