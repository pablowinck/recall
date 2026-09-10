FROM node:24.19.0-bookworm-slim AS build
WORKDIR /app
RUN npm install --global pnpm@10.26.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/mcp/package.json apps/mcp/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/domain/package.json packages/domain/package.json
COPY packages/client/package.json packages/client/package.json
RUN pnpm install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MCP_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_MCP_URL=$NEXT_PUBLIC_MCP_URL
RUN pnpm build
RUN pnpm --filter @recall/api deploy --legacy --prod /out/api
RUN pnpm --filter @recall/mcp deploy --legacy --prod /out/mcp

FROM node:24.19.0-bookworm-slim AS web
WORKDIR /app
ENV NODE_ENV=production PORT=3210 HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
USER node
EXPOSE 3210
CMD ["node", "apps/web/server.js"]

FROM node:24.19.0-bookworm-slim AS api
WORKDIR /app
ENV NODE_ENV=production PORT=3211
COPY --from=build --chown=node:node /out/api /app
USER node
EXPOSE 3211
CMD ["node", "dist/local.js"]

FROM node:24.19.0-bookworm-slim AS mcp
WORKDIR /app
ENV NODE_ENV=production PORT=3212
COPY --from=build --chown=node:node /out/mcp /app
USER node
EXPOSE 3212
CMD ["node", "dist/local.js"]
