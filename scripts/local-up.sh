#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
# Supabase's start output is long, so it goes to a log; when the start fails, the log is the only explanation.
if ! pnpm exec supabase start --exclude studio,imgproxy,realtime,storage-api,edge-runtime,logflare,vector,supavisor > .supabase-start.log 2>&1; then
  echo "Supabase did not start. The last lines of .supabase-start.log:" >&2
  tail -n 80 .supabase-start.log >&2
  exit 1
fi
pnpm exec supabase migration up --local
pnpm exec tsx scripts/configure-local.ts
docker compose up --build -d --wait
pnpm local:seed
