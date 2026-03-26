#!/bin/sh
set -e

# Run database migrations
prisma migrate deploy --schema=./prisma/schema.prisma

exec node dist/index.js