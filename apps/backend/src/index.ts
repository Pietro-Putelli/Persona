import { runCli } from './cli.ts';

try {
  const apiKey = process.env.HERMES_API_KEY?.trim();

  if (!apiKey) {
    throw new Error('Set HERMES_API_KEY in the repository root .env file.');
  }

  await runCli({
    apiKey,
    baseUrl: process.env.HERMES_BASE_URL ?? 'http://127.0.0.1:8642',
  });
} catch (error) {
  console.error(
    error instanceof Error ? error.message : 'Persona could not start.',
  );
  process.exitCode = 1;
}
