#!/bin/sh
set -e

npx --yes prisma@6.4.1 migrate deploy --schema=packages/server/prisma/schema.prisma

exec node packages/server/dist/index.js