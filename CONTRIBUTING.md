# Contributing to SV Governance dApp

Thank you for your interest in contributing. External contributions are welcome.

Track work in Linear: [SV Governance dApp Implementation](https://linear.app/avro-digital/project/sv-governance-dapp-implementation-46f8d4022e3b). See [`docs/sdlc.md`](./docs/sdlc.md) for the full branching and review workflow.

## Development environment

1. Install **Node 20+** (see `.nvmrc`).
2. Install **pnpm** (`npm install -g pnpm` or via Corepack).
3. Clone the repository and install dependencies:

   ```bash
   pnpm install
   pnpm setup:hooks   # installs Signed-off-by prepare-commit-msg hook
   cp .env.example .env
   pnpm dev
   ```

4. Before opening a PR, ensure all checks pass locally:

   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```

   CI runs the same checks via GitHub Actions ([Lint](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/lint.yml), [Test](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/test.yml)).

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `chore:` — tooling, deps, CI
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — adding or updating tests

Example: `feat(votes): add proposal detail header from Splice extraction`

## Pull requests

**`main` is protected** — all changes land via PR with passing CI and at least one approval.

1. Create or pick a Linear issue (e.g. `AVR-2475`).
2. Branch using Linear's git branch name: `eric/avr-2475-short-description`.
3. Open PR to `main` with `Closes AVR-XXXX` in the body.
4. Ensure CI passes; request review.

- Keep PRs focused and reviewable; prefer smaller extractions over large monolithic imports.
- Link the relevant [grant milestone issue](https://github.com/canton-foundation/canton-dev-fund/issues/287) when the work maps to funded deliverables.
- Include a brief test plan in the PR description.
- For Splice extractions, record the source path, commit SHA, and target file in [`docs/splice-extraction-log.md`](./docs/splice-extraction-log.md).
- Follow existing code conventions: strict TypeScript, MUI v5 styling, named exports, sorted imports.

## Splice extractions

When adapting code from Splice, add a file header:

```typescript
// Adapted from <splice-path> at commit <sha>. Original: Apache 2.0 (c) Digital Asset
```

Preserve Apache 2.0 attribution and note any material changes in the extraction log.

## Questions

Open a [GitHub issue](https://github.com/avro-digital/sv-governance-dapp/issues) for bugs or feature requests.
