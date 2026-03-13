#!/bin/sh
set -e

npx --yes prisma@6.4.1 migrate deploy --schema=prisma/schema.prisma

exec node dist/index.js