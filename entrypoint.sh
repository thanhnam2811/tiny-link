#!/bin/sh
set -e

# TinyLink Entrypoint
# ────────────────────────────────────────────────────────────────
# Works with:
#   - Neon (serverless PostgreSQL): auto-pause supported, cold start ~1s
#   - Upstash Redis: serverless, connects via rediss:// TLS
#   - Standard PostgreSQL + Redis
#
# The pg_isready check helps with Neon's cold-start: if the DB is
# paused, the first connection wakes it up. We wait briefly, then
# start the app anyway — Fastify will handle the retry internally.

CLEAN_DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/?.*//')

echo "Checking database connectivity (Neon cold-start wakeup)..."
MAX_RETRIES=15
COUNT=0

until pg_isready -d "$CLEAN_DATABASE_URL" || [ $COUNT -eq $MAX_RETRIES ]; do
  echo "Database not ready yet - attempt $((COUNT+1))/$MAX_RETRIES"
  sleep 2
  COUNT=$((COUNT+1))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
  echo "Warning: Database not immediately reachable. Starting app anyway..."
  echo "Neon auto-pause may cause a brief delay on first query."
else
  echo "Database is ready!"
fi

echo "Starting TinyLink server..."

# Start the application (flattened by pnpm deploy)
exec node dist/index.js