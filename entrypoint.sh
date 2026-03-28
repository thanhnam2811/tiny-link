#!/bin/sh
set -e

# Extract DB connection info from DATABASE_URL if needed, but pg_isready 
# can often take the full URL if passed correctly, or we use environment variables.
echo "Waiting for database to be ready..."
MAX_RETRIES=60
COUNT=0

until pg_isready -d "$DATABASE_URL" || [ $COUNT -eq $MAX_RETRIES ]; do
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