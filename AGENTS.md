# Working in Persona

Persona is a general-purpose voice assistant project with a planned SwiftUI iPhone client and TypeScript backend. Tasks will be able to continue independently of conversations. The current runnable backend is a text CLI connected to Hermes; other application components remain planned. Read the affected files before assuming a component or command exists.

## Skills and policies

- For TypeScript implementation, refactoring, tooling, or review, use [.agents/skills/persona-typescript/SKILL.md](.agents/skills/persona-typescript/SKILL.md) and [TypeScript quality](docs/agents/typescript-quality.md).
- When writing, editing, reviewing, or presenting code in any language, including Swift, scripts, documentation, and chat snippets, use [.agents/skills/persona-code-readability/SKILL.md](.agents/skills/persona-code-readability/SKILL.md). Respect the language's syntax and formatter.
- When designing or changing module contracts, use [.agents/skills/codebase-design/SKILL.md](.agents/skills/codebase-design/SKILL.md) with the architecture boundaries below and any applicable accepted decisions in `docs/decisions/`. Persona terminology and explicit task constraints take precedence over upstream terminology and workflow advice. Do not add interfaces, adapters, or remove tests solely to satisfy a skill heuristic.
- For product agent architecture and workflow composition, use [.agents/skills/agent-workflow-design/SKILL.md](.agents/skills/agent-workflow-design/SKILL.md). It does not authorize delegation of the current coding task.
- Do not write or modify tests unless the user explicitly asks, except to update existing tests broken by an authorized change. Run existing required checks and report verification limitations. Higher-priority task instructions remain authoritative. Follow [testing](docs/agents/testing.md); use the vendored Vitest reference only when Vitest is applicable and its APIs match the installed version.
- The five reasoning workflows in [.agents/skills/README.md](.agents/skills/README.md) remain explicit-only. Do not load the whole collection for every task.
- Persona is not in production. Do not preserve obsolete development contracts through speculative backward compatibility or legacy fallbacks. Change affected producers and consumers together. This does not remove approval/action versioning, execution-history compatibility required by a selected workflow engine, database migrations, or protections for real persisted user data.
- Make the smallest complete change. Minimize unnecessary complexity, not line count. Prefer readable, explicit code over compressed expressions. Independently review nontrivial behavior or architecture changes before completion when the available workflow permits it.
- Prefer small, focused files when separation improves readability. Extract cohesive helpers into clearly named files when helpful, even for a single caller; avoid generic utility files and mechanical splitting.
- Whenever creating a package, add a concise root `README.md` explaining its purpose, boundaries, main public APIs, dependencies, and main flow. Add packages with real functionality, not speculative scaffolding.
- In tests, put substantial setup, fixture builders, and doubles in nearby `*.helpers.ts` files. Keep short, cohesive setup inline.
- Write comments for a teammate seeing the code for the first time. Explain non-obvious purpose and constraints in plain sentences. For crucial contracts, types, or functions, document the required invariants, important callers and relationships, and non-obvious effects, failure, or cancellation behavior. Add a minimal example when it clarifies use; do not narrate obvious code. See the [comment policy](docs/agents/typescript-quality.md#comments).

## Architecture and ownership

These are the agreed boundaries for implementation; corresponding modules may not exist yet.

- `apps/ios/` owns the SwiftUI interface, voice interaction, task views, and approval presentation. Backend authorization remains authoritative.
- `apps/backend/` is one TypeScript package with separate API and worker entry points. Keep entry points thin; application behavior belongs in modules.
- The tasks module owns tasks, runs, action proposals, and approval rules. An approval applies to an exact action version; changed payloads require revalidation and a new approval when policy requires it.
- Agent tools pass through validated application authorization. Integration adapters perform provider-specific operations and must not bypass approval policy.
- Workflows coordinate durable execution; activities invoke modules and integrations. Keep model calls, network requests, and database operations outside deterministic workflow code.
- Handle ambiguous external outcomes explicitly. A timeout does not prove an action failed; do not blindly retry non-idempotent operations.
- Memory preserves provenance and distinguishes user statements, model inferences, and retrieved claims. Corrections must remain distinguishable from older evidence.
- Backend definitions will generate the API and event schemas in `contracts/` once tooling is selected. Do not expose internal persistence types as the public API or hand-maintain competing contracts.
- Keep backend unit tests beside their owning source. Integration and end-to-end tests belong in `apps/backend/tests/`; agent behavior evaluations belong in `evals/`. Swift tests belong with the iOS app.
- Use intentional module exports; do not import through another module's private implementation. Add separate packages only when a concrete need warrants them.

## Commands and verification

Use the Bun version pinned in `package.json` for both the runtime and package manager. From the root, `bun install --frozen-lockfile` installs the workspace, `bun run check` runs strict TypeScript checking, typed ESLint, and Prettier, and `bun run build` compiles the backend. `bun run start` runs the compiled entry point; `bun run dev` watches the TypeScript source. `bunfig.toml` makes development tools use Bun even when their shebang names Node. `docker compose config --quiet` validates Hermes configuration once `HERMES_API_KEY` is set. There are no configured tests or Xcode project yet. Do not advertise invented commands or install tooling merely because an imported skill mentions it.

Once tooling is added, use the actual manifests, version pins, formatter configuration, and Xcode schemes. Format touched files with the applicable language tooling and run the required checks. Keep runtime and dependency pins consistent; never weaken strictness to make a change pass. Report checks actually run and their limits; structural checks do not prove runtime behavior.

## Project records and data

Record consequential decisions in `docs/decisions/` with rationale and evidence. Keep source references and engineering notes in `docs/knowledge/`, separate from runtime user memory. Never commit credentials, private conversations, emails, or downloaded books and papers. Use synthetic or explicitly sanitized fixtures.

No remote issue tracker is configured. Verify the repository before creating or changing remote records; do not reuse another project's issue tracker. Imported skill provenance and licenses are recorded in `.agents/skills-sources.json` and `.agents/licenses/`.
