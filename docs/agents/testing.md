# Tests and evaluations

Do not write or modify tests unless the user explicitly asks, except to update existing tests broken by an authorized change. An implementation or bug-fix request alone is not an explicit request for new tests. This repository preference takes precedence over generic skill advice; higher-priority task instructions remain authoritative. Continue to run existing required checks and report verification limitations.

## Layout

- Backend unit tests live beside the owning source as `*.test.ts`.
- Cross-component tests live under `apps/backend/tests/integration/` and `apps/backend/tests/e2e/`; fixtures live under `apps/backend/tests/fixtures/`.
- Swift tests belong with the iOS application. Use its configured test targets when they exist.
- Agent behavioral evaluations use root `evals/`. Evaluation cases for the imported development skills stay under `.agents/skills/evals/`; they are a different system.
- Move substantial setup, fixture builders, and test doubles into nearby `*.helpers.ts` files, keeping test files focused on scenarios and assertions. Avoid splitting short cohesive setup mechanically.

## Behavior

Test observable outcomes and failures, not incidental implementation details. Keep default checks deterministic and offline, without API keys or paid model calls. Use temporary directories for filesystem integration checks and clean them afterward. Keep live provider tests opt-in.

Use synthetic or explicitly sanitized fixtures. Preserve exact fixture bytes when they matter; document provenance and intentional normalization rather than rewriting fixtures to make checks pass.

For task execution, useful cases include stale approvals, changed recipients or payloads, duplicate delivery, cancellation, and an external provider timing out after accepting an action. Check resulting state and externally observable effects, not only the assistant's explanation.

## Tooling status

No test runner, TypeScript compiler configuration, Xcode project, or application check commands are installed yet. The vendored `vitest` skill is reference material, not a decision to use that runner. If Vitest is selected, inspect its installed version, import APIs explicitly, and run TypeScript checking separately. Generic skill examples are not Persona commands.

Use the repository's actual scripts and targets once configured. Do not install a property-testing library merely because its skill is present. Report the checks run and any remaining gaps; static documentation or link checks cannot establish application behavior.
