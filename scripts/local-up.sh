#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
pnpm exec supabase start --exclude studio,imgproxy,realtime,storage-api,edge-runtime,logflare,vector,supavisor > .supabase-start.log 2>&1
pnpm exec supabase migration up --local
pnpm exec tsx scripts/configure-local.ts
docker compose up --build -d --wait
pnpm local:seed
