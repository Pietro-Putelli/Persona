# Persona repository skills

Load only the skills relevant to the task. [Repository guidance](../../AGENTS.md) and [local policies](../../docs/agents/typescript-quality.md) take precedence over generic examples.

| Skill | Activation | Purpose |
| --- | --- | --- |
| `persona-typescript` | TypeScript and backend tooling | Routes to Persona conventions and actual tooling status |
| `persona-code-readability` | Authoring, reviewing, or presenting code in any language | Logical grouping, clear control flow, and useful comments |
| `codebase-design` | Module and contract design | Small public interfaces and information hiding |
| `typescript-types` | Type modeling | Inference, assertions, unknown values, and scoped immutability |
| `typescript-discriminated-unions` | Variant and state modeling | Required variant data and exhaustive handling |
| `property-based-testing` | Authorized invariant testing or test review | Generators, properties, and counterexamples |
| `vitest` | Applicable Vitest work | Vendored API reference; verify the installed version first |
| `agent-workflow-design` | Product agent architecture | Pattern selection, composition, and Persona ownership |
| `shape` | Explicit only | Pressure-test an unresolved concept |
| `external-research` | Explicit only | Separate external evidence from interpretation |
| `disposable-prototype` | Explicit only | Settle a decision with a bounded experiment |
| `decisions-to-spec` | Explicit only | Turn resolved decisions into a specification |
| `proposal-audit` | Explicit only | Review a proposal or implementation |

The five reasoning workflows retain their explicit-only `agents/openai.yaml` policies and shared [context contract](references/context-contract.md). Their evaluation cases are in [evals](evals/README.md), separate from Persona's product evaluations in root `evals/`.

## Adaptation and provenance

Copied from the local Daphne checkout on 2026-11-05. The TypeScript and readability skills were renamed for Persona; the agent workflow skill now points to Persona's ownership rules. Rust migration guidance was omitted because Persona is not a migration project. Bun commands, legacy issue routing, and references to unavailable policy files were replaced with Persona guidance.

The property-testing skill's `effort` annotation was moved into frontmatter `metadata` for portable skill validation; its body and upstream attribution are unchanged. Other upstream skill contents, supporting references, and activation policies are preserved. Examples mentioning other languages or tools remain generic examples, not Persona requirements.

[skills-sources.json](../skills-sources.json) preserves upstream provenance and records current file hashes and local adaptations. [skills-lock.json](../../skills-lock.json) preserves the original installer records for three imported skills; it does not claim Persona dependencies were installed. License notices remain under [licenses](../licenses/) and the [Vitest skill](vitest/LICENSE.md).

## Usage boundaries

- TypeScript work starts with `persona-typescript`; Swift code uses the cross-language readability guidance without inheriting TypeScript tooling.
- Check [testing](../../docs/agents/testing.md) before changing tests. Having the Vitest or property-testing skill does not select a test runner or install a dependency.
- The Vitest reference identifies its source version. Compare its APIs with the installed version when Persona adopts a runner; no version compatibility has been established yet.
- `codebase-design` supports the agreed module boundaries. It does not require renaming Persona concepts, speculative adapters, deleting tests, or parallel agent exploration for every change.
- Upstream snapshots are reference material. Consult current official documentation when the installed tool version differs or a factual claim needs verification.
