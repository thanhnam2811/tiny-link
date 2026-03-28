#!/bin/sh
set -e

# Generate Prisma client for the current environment
prisma generate --schema=./prisma/schema.prisma

# Apply database migrations
prisma migrate deploy --schema=./prisma/schema.prisma

# Start the application
exec node dist/index.js