# Connect Recall to Codex

## Remote or local HTTP

Create a token in **Connections**. Set `RECALL_MCP_TOKEN` in the client process's environment and register:

```toml
[mcp_servers.recall]
url = "http://localhost:3212/mcp"
bearer_token_env_var = "RECALL_MCP_TOKEN"
```

Replace the URL with your own deployed MCP endpoint for production. Do not commit the real token to a config file or repository. Restart/reload the MCP client if it does not discover a new configuration immediately.

## Local development with the generated account

After `pnpm local:up` and a host `pnpm build`, the local stdio launcher reads the token from ignored `.local/account.json` and runs the same MCP tool definitions against the local API. It never writes secrets to stdout.

```bash
codex mcp add recall-local -- node scripts/launch-codex-local.mjs
```

Configure an absolute working directory/launcher path for clients started outside the repository. On Windows, invoke the launcher through WSL with the repository as its working directory.

Example requests:

- “List my decks in Recall.”
- “Create a flashcard explaining both meanings of I'd, with examples.”
- “Import these cards using stable source keys.”

For review tools, the user must provide the actual recall rating. Do not evaluate their cards automatically as a connectivity test.

Official client configuration: https://learn.chatgpt.com/docs/extend/mcp
