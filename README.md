# Persona

Persona is a voice assistant project with a TypeScript backend and a planned
SwiftUI client. This first iteration contains a runnable backend entry point and
a separate Hermes runtime. The clarification flow comes next.

## Backend

Use Bun 1.3.10, pinned in `package.json`, plus Docker Desktop with Compose v2 for
Hermes. [Install Bun](https://bun.sh/docs/installation) if needed, then check that
`bun --version` prints `1.3.10`.

If an older Homebrew installation takes precedence over `~/.bun/bin`, select the
user installation in your terminal:

```sh
export PATH="$HOME/.bun/bin:$PATH"
```

From the repository root:

```sh
bun install --frozen-lockfile

bun run check
bun run build
bun run start
```

`bun run start` currently prints a startup message and exits. `bun run dev` runs the
same entry point and restarts it on source changes. The backend has no runtime
dependencies; [its README](apps/backend/README.md) describes the package boundary.
`bunfig.toml` also runs development tools with Bun. TypeScript still checks types
and compiles the backend; running a TypeScript file alone does not type-check it.

## Hermes

If `.env` does not exist, copy `.env.example` to `.env`. Generate a local token with
`openssl rand -hex 32` and put it in `HERMES_API_KEY`. Keep existing `.env` values;
do not commit this file. The token protects Hermes's API and is separate from a
model-provider key.

```sh
docker compose config --quiet
docker compose up -d --wait
curl --fail http://127.0.0.1:8642/health
```

The health endpoint checks the HTTP service, not model availability. Before the
first model request, stop the service and use Hermes's interactive model setup:

```sh
docker compose stop hermes
docker compose run --rm hermes model
docker compose up -d --wait
```

Choose your provider and model in the wizard. Hermes keeps this configuration and
its provider credentials in the `persona_hermes-data` Docker volume. Keep the
gateway's `API_SERVER_KEY` in Compose; do not set a second copy in Hermes's stored
`.env`, which can override the container environment.

Useful commands:

```sh
docker compose logs -f hermes
docker compose ps
docker compose down
```

`down` retains the volume. Adding `--volumes` deletes the persisted Hermes state,
including provider configuration and credentials.

Hermes uses the official `latest` image, which follows upstream stable releases.
To update the local image and recreate the container:

```sh
docker compose pull hermes
docker compose up -d --wait
```

An update can change Hermes behavior; check the service after upgrading. The
running container does not update itself when the upstream tag changes.

Its API is exposed only at `http://127.0.0.1:8642`; protected endpoints require
`Authorization: Bearer` with the local token. No host source directory, Docker socket, dashboard, or
integration credentials are mounted into the container. This is a local,
single-user setup. Persona's application authorization and tools are not
implemented yet; do not connect email or Notion directly to Hermes.

See the [runtime decision](docs/decisions/0001-backend-and-hermes-runtime.md),
[upstream Docker guide](https://hermes-agent.nousresearch.com/docs/user-guide/docker),
and [API guide](https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server).
