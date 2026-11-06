# TypeScript backend and a separate Hermes runtime

Status: accepted for the initial local setup, 2026-11-06.

Persona uses one TypeScript backend package in a Bun workspace. Bun 1.3.10, already
available in the development environment, is pinned in `package.json` as both the
runtime and package manager. `bun.lock` records dependency resolutions, and frozen
installs preserve them. `bunfig.toml` runs development tools with Bun rather than
depending on a separate Node installation.

Strict compilation, typed ESLint checks, and Prettier establish the initial
tooling. TypeScript 6.0.3 stays within typescript-eslint 8.72.1's supported peer
range (`>=4.8.4 <6.1.0`); upgrading the compiler requires checking that range. Bun
runs TypeScript directly during development, while `tsc` checks types and produces
JavaScript for the built entry point. The compiler uses Bun types and bundler
module resolution, with the existing strict checks retained.

Bun's type definitions also depend on Node API definitions. `@types/node` is pinned
to 25.3.0 because Bun 1.3.10 references types that the previously installed 24.19.2
does not export. Keep these type packages compatible when upgrading; library type
checking remains enabled. A one-line Bun patch also lets `Bun.Env.TZ` explicitly
accept `undefined`, matching Node's environment type under
`exactOptionalPropertyTypes`. Remove that patch when upstream supplies the fix.
This development dependency does not require a Node runtime installation.

Hermes runs separately using the official `latest` Docker image, which tracks
upstream stable releases. This follows the user's preference for this learning
project. Updates are deliberate: pull the image and recreate the container, then
verify it. The tag can change, so it does not guarantee reproducible versions;
use a digest if exact reproducibility becomes necessary. We do not fork or vendor
its Python source. Persona's TypeScript backend will use the existing HTTP API.

A Docker named volume retains Hermes's own configuration and state. This setup
does not introduce a Persona database or replace Hermes's storage. The API binds
to all interfaces inside the container so Docker can forward it, but the host
port is bound only to `127.0.0.1`. A required bearer token protects API operations.
The public health endpoint only proves that the HTTP service is available.

Hermes is a local single-user runtime at this stage. Persona will own integration
authorization and credentials; a future application-controlled tool boundary must
enforce that policy before enabling email or Notion. Container authentication does
not implement Persona's action approval rules.

The next milestone is a text clarification flow through the native Hermes API.
API/worker separation, durable tasks, memory customization, MCP, and voice will be
introduced when their behavior is implemented, rather than scaffolded now.

Sources checked on 2026-11-06:

- [Official Docker setup](https://hermes-agent.nousresearch.com/docs/user-guide/docker)
- [Official API server documentation](https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server)
- [Official Docker image](https://hub.docker.com/r/nousresearch/hermes-agent)
- [typescript-eslint 8.72.1 metadata](https://registry.npmjs.org/typescript-eslint/8.72.1)
- [Bun workspaces](https://bun.sh/docs/pm/workspaces)
- [Bun TypeScript configuration](https://bun.sh/docs/runtime/typescript)
- [Bun runtime configuration](https://bun.sh/docs/runtime/bunfig#run-bun-auto-alias-node-to-bun)
