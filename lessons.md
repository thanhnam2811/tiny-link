# Lessons Learned: Prisma Client Initialization in Dockerized Monorepos

## Root Cause

When using `pnpm deploy` to create a standalone production bundle from a monorepo, many "side-effect" files in `node_modules` (like the generated Prisma Client) are not automatically carried over if they are nested within another workspace package's `node_modules`. This results in the "Prisma client did not initialize yet" error at runtime.

## Prevention Strategy

In Dockerized monorepos where `pnpm deploy` is used:

1. **Runtime Generation**: Always include `prisma generate` in the container's entrypoint script. This ensures the client is generated for the specific runtime environment (e.g., Alpine Linux) and is placed in the current environment's `node_modules`.
2. **Schema Availability**: Ensure the `schema.prisma` file is copied to the final runner stage of the Docker image so the CLI can find it at runtime.
3. **CLI Availability**: Ensure the `prisma` CLI is installed in the runner stage (either globally or as a production dependency).
