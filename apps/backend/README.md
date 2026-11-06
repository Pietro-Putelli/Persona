# Persona backend

One TypeScript package for Persona's application backend. The current entry point
prints a startup message and exits; it has no HTTP API, worker, or Hermes client yet.

The application will own authorization and integration credentials. Hermes runs
separately and will be called over HTTP. No application tools are connected yet.

Run commands from the repository root:

- `bun run dev`: run the entry point with Bun's file watcher.
- `bun run build`: compile `src/` to `dist/` with TypeScript.
- `bun run start`: run the compiled entry point with Bun after building.
- `bun run check`: type checking, typed linting, and formatting checks.

There are no runtime dependencies or public module exports. Development tooling is
declared in the root workspace. Bun runs TypeScript directly during development;
the compiler produces JavaScript for the built entry point. Use `.ts`
extensions for relative source imports; TypeScript rewrites them when building.
