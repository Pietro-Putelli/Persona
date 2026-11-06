# Generic text conversations through Hermes

Status: accepted interaction scope, 2026-11-06. Anthropic was selected by the user;
the transport, timeout values, and model below are implementation choices.

The first interaction is a Bun CLI connected to Hermes. Persona supplies short,
general instructions about context, clarification, and truthful reporting. The
model decides which information is missing. There are no task-specific fields,
fixed question sequences, or email handlers. Example conversations are validation
scenarios, not application logic.

The CLI owns terminal input and output. A small HTTP client owns one session per
CLI process and submits turns sequentially through `POST /v1/runs`. Hermes loads
the session history and performs model execution. The client polls the run until
it reaches a final state. A clarification question completes a turn; the user's
answer starts another run in the same session.

Native runs give us an ID for cancellation. This is preferable here to abandoning
a blocking chat request whose remote execution we cannot address. Polling keeps
the first implementation small; token streaming can be added when needed. Input
and response transport are separate from the agent's conversational instructions.

Each turn has a 60-second deadline. HTTP requests have a 10-second deadline and
cleanup has a fresh 5-second deadline. On cancellation or failure, the client asks
Hermes to stop a known active run. A stop request does not prove execution has
finished. If the submission response is lost, or stopping fails, the CLI reports
that uncertainty and ends without retrying. An unknown run after a gateway
restart requires inspection rather than automatic replay or acknowledgement.

The user chose Anthropic. Haiku 5.5 was available through the account's model API
when configured. Compose forwards only `ANTHROPIC_API_KEY` and the local Hermes
token, plus API server settings. Model selection and an iteration limit of two
are saved through Hermes's own config commands in its Docker volume.

The API toolsets are explicitly empty for this milestone. Prompt instructions
guide conversation; they do not replace Persona's future authorization checks.
Application-controlled tools, approvals, durable Persona tasks, custom memory,
and voice will be introduced separately. Hermes already stores session history;
this implementation adds no Persona database or long-term memory system.

Sources:

- [Hermes session and run APIs](https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server)
- [Hermes configuration](https://hermes-agent.nousresearch.com/docs/user-guide/configuration)
- [Anthropic models](https://platform.claude.com/docs/en/models/overview)
