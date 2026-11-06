# Persona backend

One TypeScript package for Persona's application backend. The current entry point
is a text CLI that sends sequential conversation turns to Hermes.

`src/index.ts` validates runtime configuration and starts the CLI. `src/cli.ts`
owns terminal input, generic assistant instructions, and interruption handling.
`src/hermes.ts` exports `HermesClient`; its `sendMessage(message, signal)` method
creates one Hermes session, starts and polls runs, and requests a stop on failure
or cancellation. Call it sequentially for one conversation. Returned JSON is
validated at the HTTP boundary.

Hermes owns conversation history and model execution. The application will own
authorization and integration credentials when tools are introduced. The current
Hermes API toolsets are empty; conversational instructions are not an enforcement
mechanism for action permissions.

Run commands from the repository root:

- `make cli`: build the backend and open the CLI.
- `bun run dev`: run the CLI with Bun's file watcher; a restart creates a new session.
- `bun run build`: compile `src/` to `dist/` with TypeScript.
- `bun run start`: run the compiled CLI with Bun after building.
- `bun run check`: type checking, typed linting, and formatting checks.

`start` and `dev` load the root `.env`. The client reads `HERMES_API_KEY` and
`HERMES_BASE_URL` (default `http://127.0.0.1:8642`). Provider credentials are used by
the Hermes container, not sent in Persona's HTTP requests.

There are no runtime dependencies. Development tooling is declared in the root
workspace. Bun runs TypeScript directly during development; the compiler produces
JavaScript for the built entry point. Use `.ts` extensions for relative source
imports; TypeScript rewrites them when building.
