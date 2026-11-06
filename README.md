# Persona

Persona is a voice assistant project with a TypeScript backend and a planned
SwiftUI client. The current backend is a text CLI connected to a separate Hermes
runtime. It keeps a conversation session and lets the model ask for missing
information across different kinds of requests.

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
```

After configuring Hermes below, `make cli` builds the backend and opens the CLI.
`bun run start` runs the existing build. `bun run dev` runs
the TypeScript source and restarts it on changes. Both commands load the root
`.env`. The backend has no runtime dependencies;
[its README](apps/backend/README.md) describes the package boundary.
`bunfig.toml` also runs development tools with Bun. TypeScript still checks types
and compiles the backend; running a TypeScript file alone does not type-check it.

## Hermes

If `.env` does not exist, copy `.env.example` to `.env`. Generate a local token with
`openssl rand -hex 32` and put it in `HERMES_API_KEY`. Keep existing `.env` values;
do not commit this file. The token protects Hermes's API and is separate from a
model-provider key. Set `ANTHROPIC_API_KEY` to your existing Anthropic credential.
Compose forwards only the Hermes token and Anthropic key, along with the API
server settings. Other root `.env` secrets are not forwarded to the container.

```sh
docker compose config --quiet
docker compose up -d --wait
curl --fail http://127.0.0.1:8642/health
```

The health endpoint checks the HTTP service, not model availability. Configure
the model and conversation-only API once on a new Hermes volume:

```sh
docker compose exec -T --user hermes hermes hermes config set model.provider anthropic
docker compose exec -T --user hermes hermes hermes config set model.default claude-haiku-5-5
docker compose exec -T --user hermes hermes hermes config set platform_toolsets.api_server '[]'
docker compose exec -T --user hermes hermes hermes config set agent.max_turns 2
docker compose restart hermes
docker compose up -d --wait
```

Hermes keeps these settings and conversation history in the `persona_hermes-data`
Docker volume. Model requests use your Anthropic account. The two-iteration limit
applies to each agent run, not to the number of messages in a conversation.
Keep both credentials in the root `.env`; a second copy in Hermes's stored `.env`
can override the container environment.

Build the backend and start a conversation from the repository root:

```sh
make cli
```

Try an incomplete request, then answer the model's follow-up. The instructions are
generic: there are no email-specific fields, fixed questions, or task branches in
the application. `/exit` quits; Ctrl+C requests cancellation. Starting the CLI
again creates a new session. Responses are printed when complete.

Each turn has a 60-second deadline and individual HTTP requests have a 10-second
deadline. Cancellation requests a server-side stop when the run ID is known;
the CLI reports when the outcome remains uncertain and never retries a submitted
turn automatically. A failure ends the CLI so a later input is not silently sent
into an unresolved run.

Useful commands:

```sh
docker compose logs -f hermes
docker compose ps
docker compose down
```

`down` retains the volume. Adding `--volumes` deletes the persisted Hermes state,
including model configuration and conversation history.

Hermes uses the official `latest` image, which follows upstream stable releases.
To update the local image and recreate the container:

```sh
docker compose pull hermes
docker compose up -d --wait
```

An update can change Hermes behavior; check the service after upgrading. The
running container does not update itself when the upstream tag changes.

Its API is exposed only at `http://127.0.0.1:8642`; protected endpoints require
`Authorization: Bearer` with the local token. The API agent's toolsets are empty,
so this milestone only converses. No host source directory or Docker socket is
mounted, and no dashboard is exposed. This is a local, single-user setup.
Persona's application authorization and action tools remain a later milestone;
do not connect email or Notion directly to Hermes.

See the [runtime decision](docs/decisions/0001-backend-and-hermes-runtime.md),
[text CLI decision](docs/decisions/0002-text-cli-and-clarification.md),
[upstream Docker guide](https://hermes-agent.nousresearch.com/docs/user-guide/docker),
and [API guide](https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server).
