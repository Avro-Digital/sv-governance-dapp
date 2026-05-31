# Software development lifecycle

Grant: [Canton Dev Fund PR #223](https://github.com/canton-foundation/canton-dev-fund/pull/223) · Linear: [SV Governance dApp Implementation](https://linear.app/avro-digital/project/sv-governance-dapp-implementation-46f8d4022e3b)

## Branching

**`main` is protected.** Do not push directly — open a pull request.

| Branch type | Pattern | Example |
| --- | --- | --- |
| Feature / fix | `{user}/avr-{id}-{slug}` | `eric/avr-2475-m24-wire-vote-data-layer-to-local-mocknet` |
| Docs / chore | same | `eric/avr-2472-m21-lock-down-sdlc-pr-only-main-linear-linked-branches` |

Use the **git branch name** from the Linear issue (copy from issue sidebar). This links commits, PRs, and grant traceability.

## Workflow

1. Pick or create a Linear issue under [M2: External Signing Proof of Concept](https://linear.app/avro-digital/project/sv-governance-dapp-implementation-46f8d4022e3b).
2. Move issue to **In Progress**.
3. Branch from latest `main`:

   ```bash
   git checkout main && git pull
   git checkout -b eric/avr-2475-m24-wire-vote-data-layer-to-local-mocknet
   ```

4. Implement; run locally:

   ```bash
   pnpm lint && pnpm typecheck && pnpm test && pnpm build
   ```

5. Open PR to `main`. PR body must include:
   - `Closes AVR-XXXX` or `Related to AVR-XXXX`
   - Test plan checklist
   - Grant milestone note if applicable

6. Wait for CI (`ESLint & Typecheck`, `Vitest`, `Production build`) and at least **one approving review**.
7. Squash-merge (or merge commit per team preference). Delete branch after merge.
8. Move Linear issue to **Done** (or **In Review** if awaiting external validation).

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/) — see [CONTRIBUTING.md](../CONTRIBUTING.md).

Signed-off-by trailer is appended automatically via `pnpm setup:hooks`.

## CI required checks

| Check | Workflow |
| --- | --- |
| ESLint & Typecheck | [Lint](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/lint.yml) |
| Vitest | [Test](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/test.yml) |
| Production build | [Test](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/test.yml) |

## Milestone map (M2)

Parent epic: [AVR-2471](https://linear.app/avro-digital/issue/AVR-2471) · Payment trigger: [AVR-1947](https://linear.app/avro-digital/issue/AVR-1947)

| Ticket | Title | Status |
| --- | --- | --- |
| AVR-2472 | SDLC: PR-only main | Done |
| AVR-2473 | Scaffold + CI | Done |
| AVR-2474 | Splice UI phase 1 | Done |
| AVR-2475 | Mocknet data layer | Done |
| AVR-2481 | UI parity gaps | Done |
| AVR-2484 | Docs + font housekeeping | In progress |
| AVR-2476 | Wallet connect | Backlog |
| AVR-2477 | ExternalSigner | Backlog |
| AVR-2478 | DAML command mapping | Backlog |
| AVR-2479 | E2E demo | Backlog |
| AVR-2480 | CIP-103 notes | Backlog |

## Releases

No release tags until mocknet E2E is validated ([AVR-2479](https://linear.app/avro-digital/issue/AVR-2479)).
