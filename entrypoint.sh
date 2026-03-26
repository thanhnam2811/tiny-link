#!/bin/sh
set -e

prisma migrate deploy --schema=./prisma/schema.prisma

exec node dist/index.js