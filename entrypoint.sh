#!/bin/sh
set -e

# Cleanse the DATABASE_URL of query parameters for pg_isready compatibility
# libpq-based tools like pg_isready do not support Prisma's ?schema=... parameter
CLEAN_DATABASE_URL=$(echo "$DATABASE_URL" | sed 's/?.*//')

echo "Waiting for database to be ready..."
MAX_RETRIES=60
COUNT=0

until pg_isready -d "$CLEAN_DATABASE_URL" || [ $COUNT -eq $MAX_RETRIES ]; do
  echo "Database is unavailable - sleeping (attempt $((COUNT+1))/$MAX_RETRIES)"
  sleep 1
  COUNT=$((COUNT+1))
done

if [ $COUNT -eq $MAX_RETRIES ]; then
  echo "Error: Database did not become ready within 60 seconds. Exiting."
  exit 1
fi

echo "Database is ready! Starting application..."

# Start the application
exec node dist/index.js