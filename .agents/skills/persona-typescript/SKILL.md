---
name: persona-typescript
description: Use when implementing, refactoring, or reviewing TypeScript, backend tooling configuration, or module boundaries in Persona.
---

# Persona TypeScript reference

Read [TypeScript quality](../../../docs/agents/typescript-quality.md) for coding conventions and [repository guidance](../../../AGENTS.md) for ownership and current tooling status.

| Task | Reference |
| --- | --- |
| Runtime, compiler, dependencies, module boundaries | [Repository guidance](../../../AGENTS.md#commands-and-verification), actual package manifests, and accepted decisions in `docs/decisions/` |
| Test design and commands | [Testing](../../../docs/agents/testing.md); load the `vitest` skill only when applicable to the installed runner |
| Task, tool, and approval contracts | [Architecture and ownership](../../../AGENTS.md#architecture-and-ownership) |

Resolve backticked paths from the repository root. Use commands that actually exist in the package manifests. Persona currently has no runnable build, lint, or test scripts; importing skills does not configure those tools.

Validate untrusted input at its entry point and trust validated typed internal calls. Choose `readonly` for concrete ownership guarantees rather than applying it everywhere. These scoped repository rules take precedence over generic TypeScript guidance.

When writing, editing, reviewing, or presenting TypeScript, use [Persona code readability](../persona-code-readability/SKILL.md), including documentation and chat snippets. Check logical spacing before presenting code and completing implementation changes.
