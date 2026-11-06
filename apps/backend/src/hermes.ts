import { setTimeout as delay } from 'node:timers/promises';

const turnTimeoutMs = 60_000;
const requestTimeoutMs = 10_000;

class RejectedHermesRequest extends Error {}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function objectResponse(value: unknown): Record<string, unknown> {
  if (!isObject(value)) {
    throw new Error('Hermes returned an unexpected response format.');
  }

  return value;
}

function stringField(value: Record<string, unknown>, name: string): string {
  const field = value[name];

  if (typeof field !== 'string' || !field.trim()) {
    throw new Error(`Hermes returned an invalid ${name} field.`);
  }

  return field;
}

/* One conversation per client. The CLI submits turns sequentially; Hermes stores their history. */
export class HermesClient {
  readonly #baseUrl: URL;
  readonly #apiKey: string;
  readonly #instructions: string;
  #sessionId: string | undefined;

  constructor(config: {
    baseUrl: string;
    apiKey: string;
    instructions: string;
  }) {
    let baseUrl: URL;

    try {
      baseUrl = new URL(config.baseUrl);
    } catch {
      throw new Error('HERMES_BASE_URL must be a valid HTTP or HTTPS URL.');
    }

    if (
      !['http:', 'https:'].includes(baseUrl.protocol) ||
      baseUrl.username ||
      baseUrl.password ||
      baseUrl.pathname !== '/' ||
      baseUrl.search ||
      baseUrl.hash
    ) {
      throw new Error(
        'HERMES_BASE_URL must be an HTTP or HTTPS origin without credentials or a path.',
      );
    }

    this.#baseUrl = baseUrl;
    this.#apiKey = config.apiKey;
    this.#instructions = config.instructions;
  }

  /*
   * Accepts a non-empty message. A timeout or cancellation requests a server-side
   * stop when the run ID is known; it does not prove that the remote work stopped.
   * Failed submissions are never retried automatically because admission can be ambiguous.
   */
  async sendMessage(message: string, signal: AbortSignal): Promise<string> {
    const deadline = AbortSignal.timeout(turnTimeoutMs);
    const turnSignal = AbortSignal.any([signal, deadline]);
    let submitted = false;
    let needsStop = false;
    let runId: string | undefined;

    try {
      if (!this.#sessionId) {
        const response = objectResponse(
          await this.#request('/api/sessions', turnSignal, {
            source: 'api_server',
          }),
        );
        this.#sessionId = stringField(objectResponse(response.session), 'id');
      }

      turnSignal.throwIfAborted();
      submitted = true;
      const accepted = objectResponse(
        await this.#request('/v1/runs', turnSignal, {
          input: message,
          session_id: this.#sessionId,
          instructions: this.#instructions,
        }),
      );
      runId = stringField(accepted, 'run_id');
      needsStop = true;

      for (;;) {
        const run = objectResponse(
          await this.#request(
            `/v1/runs/${encodeURIComponent(runId)}`,
            turnSignal,
          ),
        );
        const status = stringField(run, 'status');

        switch (status) {
          case 'completed': {
            needsStop = false;
            return stringField(run, 'output');
          }
          case 'failed': {
            needsStop = false;
            throw new Error(
              'Hermes could not complete the response. Check its model, provider credentials, and logs.',
            );
          }
          case 'cancelled':
          case 'interrupted': {
            needsStop = false;
            throw new Error(
              'Hermes stopped the response before completing it.',
            );
          }
          case 'unknown': {
            needsStop = false;
            throw new Error(
              `Hermes cannot determine the outcome of ${runId}. Inspect that run before retrying.`,
            );
          }
          case 'waiting_for_approval':
          case 'waiting_for_input': {
            throw new Error(
              'Hermes requested a tool interaction. Configure the API toolsets as empty for this text-only CLI.',
            );
          }
          case 'queued':
          case 'running':
          case 'stopping': {
            await delay(400, undefined, { signal: turnSignal });
            break;
          }
          default: {
            throw new Error('Hermes returned an unsupported run status.');
          }
        }
      }
    } catch (error) {
      let message =
        error instanceof Error ? error.message : 'The Hermes request failed.';

      if (signal.aborted) {
        message = 'Request cancelled.';
      } else if (deadline.aborted) {
        message = 'Hermes did not finish within 60 seconds.';
      }

      if (runId && needsStop) {
        try {
          /* A fresh deadline lets cleanup reach Hermes after the caller's signal has aborted. */
          await this.#request(
            `/v1/runs/${encodeURIComponent(runId)}/stop`,
            AbortSignal.timeout(5000),
            {},
          );
          message += ` Stop requested for ${runId}; Hermes may still be finishing.`;
        } catch {
          message += ` Could not confirm a stop request for ${runId}; it may still be running.`;
        }
      } else if (
        submitted &&
        !runId &&
        !(error instanceof RejectedHermesRequest)
      ) {
        message +=
          ' Hermes may have accepted the request. Inspect it before retrying.';
      }

      throw new Error(message, { cause: error });
    }
  }

  async #request(
    path: string,
    signal: AbortSignal,
    body?: Record<string, unknown>,
  ): Promise<unknown> {
    const requestSignal = AbortSignal.any([
      signal,
      AbortSignal.timeout(requestTimeoutMs),
    ]);
    let response: Response;

    try {
      response = await fetch(new URL(path, this.#baseUrl), {
        method: body === undefined ? 'GET' : 'POST',
        headers: {
          Authorization: `Bearer ${this.#apiKey}`,
          'Content-Type': 'application/json',
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: requestSignal,
        redirect: 'error',
      });
    } catch (error) {
      if (signal.aborted) {
        signal.throwIfAborted();
      }

      if (requestSignal.aborted) {
        throw new Error('The Hermes HTTP request timed out.', { cause: error });
      }

      throw new Error(
        'Cannot reach Hermes. Check HERMES_BASE_URL and run docker compose up -d --wait.',
        {
          cause: error,
        },
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw new RejectedHermesRequest(
        'Hermes rejected the API token. Check HERMES_API_KEY in the root .env file.',
      );
    }

    if (!response.ok) {
      const explanation = `Hermes returned HTTP ${String(response.status)}. Check its configuration and logs.`;

      if (response.status < 500) {
        throw new RejectedHermesRequest(explanation);
      }

      throw new Error(explanation);
    }

    try {
      const result: unknown = await response.json();
      return result;
    } catch (error) {
      if (signal.aborted) {
        signal.throwIfAborted();
      }

      if (requestSignal.aborted) {
        throw new Error('The Hermes HTTP response timed out.', {
          cause: error,
        });
      }

      throw new Error(
        'Hermes returned an invalid or incomplete JSON response.',
        { cause: error },
      );
    }
  }
}
