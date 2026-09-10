# Connect Recall to an AI assistant

Recall exposes an MCP server over Streamable HTTP. Any assistant that sends a bearer token with MCP requests can use it. In the web app, **Connections** creates a personal token and shows ready-to-paste setup for the assistant you pick.

Below, replace `https://your-recall-mcp/mcp` with your MCP endpoint (`http://localhost:3212/mcp` locally) and `RECALL_MCP_TOKEN` with a token from **Connections**. Keep tokens out of repositories.

## Claude Code

```bash
claude mcp add --transport http recall https://your-recall-mcp/mcp --header "Authorization: Bearer $RECALL_MCP_TOKEN"
```

## Codex

`~/.codex/config.toml`, with `RECALL_MCP_TOKEN` exported in the shell that starts Codex:

```toml
[mcp_servers.recall]
url = "https://your-recall-mcp/mcp"
bearer_token_env_var = "RECALL_MCP_TOKEN"
```

## Cursor, Gemini CLI and other JSON configs

`~/.cursor/mcp.json` uses `url`; `~/.gemini/settings.json` uses `httpUrl` for the same entry:

```json
{
  "mcpServers": {
    "recall": {
      "url": "https://your-recall-mcp/mcp",
      "headers": { "Authorization": "Bearer <token>" }
    }
  }
}
```

## VS Code

`.vscode/mcp.json` prompts for the token once instead of storing it in the file:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "recall-token",
      "description": "Recall token",
      "password": true
    }
  ],
  "servers": {
    "recall": {
      "type": "http",
      "url": "https://your-recall-mcp/mcp",
      "headers": { "Authorization": "Bearer ${input:recall-token}" }
    }
  }
}
```

## Claude Desktop

Desktop configs start local processes, so [`mcp-remote`](https://github.com/punkpeye/mcp-remote) bridges to the remote server. It needs Node.js; restart Claude after editing `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "recall": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://your-recall-mcp/mcp",
        "--header",
        "Authorization:${RECALL_AUTH_HEADER}"
      ],
      "env": { "RECALL_AUTH_HEADER": "Bearer <token>" }
    }
  }
}
```

## ChatGPT and claude.ai connectors

ChatGPT developer-mode connectors and claude.ai custom connectors authenticate remote MCP servers with OAuth. Recall's MCP server accepts personal bearer tokens only, so those connectors cannot sign in yet.

## Local development with the generated account

After `pnpm local:up` and a host `pnpm build`, the local stdio launcher reads the token from ignored `.local/account.json` and runs the same MCP tool definitions against the local API. It never writes secrets to stdout. Register it with any client that starts stdio servers:

```bash
codex mcp add recall-local -- node scripts/launch-codex-local.mjs
claude mcp add recall-local -- node scripts/launch-codex-local.mjs
```

Configure an absolute working directory/launcher path for clients started outside the repository. On Windows, invoke the launcher through WSL with the repository as its working directory.

Example requests:

- “List my decks in Recall.”
- “Create a flashcard explaining both meanings of I'd, with examples.”
- “Import these cards using stable source keys.”

For review tools, the user must provide the actual recall rating. Do not evaluate their cards automatically as a connectivity test.

Client references: [Claude Code](https://code.claude.com/docs/en/mcp), [Codex](https://learn.chatgpt.com/docs/extend/mcp), [Gemini CLI](https://geminicli.com/docs/tools/mcp-server/).
