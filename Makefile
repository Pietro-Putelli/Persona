.PHONY: cli

cli:
	@bun run --silent --cwd apps/backend build
	@bun run --silent --cwd apps/backend start
