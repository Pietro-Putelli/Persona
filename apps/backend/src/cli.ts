import { createInterface } from 'node:readline';
import { stdin, stdout } from 'node:process';
import {
  type InspectColor,
  stripVTControlCharacters,
  styleText,
} from 'node:util';
import { isatty } from 'node:tty';
import { HermesClient } from './hermes.ts';

const instructions = `
  You are Persona, a concise, helpful personal assistant.
  Use information already provided in the conversation; do not ask for it again.
  When essential information is missing or ambiguous, ask a focused follow-up question instead of guessing.
  Use only the capabilities available to you. Be clear about limitations, and distinguish proposed actions from confirmed results.
  `;

export async function runCli(config: {
  apiKey: string;
  baseUrl: string;
}): Promise<void> {
  const client = new HermesClient({ ...config, instructions });
  const controller = new AbortController();
  const interactive = isatty(stdin.fd) && isatty(stdout.fd);
  const colorEnabled =
    interactive &&
    process.env.TERM !== 'dumb' &&
    process.env.NO_COLOR === undefined &&
    process.env.NODE_DISABLE_COLORS !== '1';
  const terminal = createInterface({
    input: stdin,
    output: stdout,
    terminal: interactive,
  });

  function style(format: InspectColor, text: string): string {
    return colorEnabled ? styleText(format, text) : text;
  }

  function interrupt(): void {
    controller.abort();
    terminal.close();
    process.exitCode = 130;
  }

  terminal.on('SIGINT', interrupt);
  process.once('SIGINT', interrupt);

  if (interactive) {
    console.info(`\n  ${style('bold', style('cyan', 'Persona'))}`);
    console.info(`  ${style('dim', 'Your personal assistant')}`);
    console.info(
      `\n  ${style('dim', '/exit to quit · Ctrl+C to cancel and exit')}\n`,
    );
    terminal.setPrompt(`  ${style('green', 'You')} ${style('dim', '›')} `);
    terminal.prompt();
  }

  try {
    /* Start consuming input immediately so piped lines are retained while a reply is pending. */
    for await (const line of terminal) {
      const message = line.trim();

      if (message === '/exit') {
        break;
      }

      if (message) {
        const reply = await client.sendMessage(message, controller.signal);
        const text = stripVTControlCharacters(reply);

        if (interactive) {
          console.info(`\n  ${style('cyan', 'Persona')}\n`);
          console.info(`  ${text.replaceAll('\n', '\n  ')}\n`);
        } else {
          console.info(`Persona: ${text}`);
        }
      }

      if (interactive && !controller.signal.aborted) {
        terminal.prompt();
      }
    }
  } catch (error) {
    if (!controller.signal.aborted) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : 'Request cancelled.';
    console.info(interactive ? `\n  ${style('yellow', message)}\n` : message);
  } finally {
    terminal.close();
    process.removeListener('SIGINT', interrupt);
  }
}
