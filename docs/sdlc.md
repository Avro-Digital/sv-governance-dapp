# Software development lifecycle

Grant: [Canton Dev Fund PR #223](https://github.com/canton-foundation/canton-dev-fund/pull/223) · amendment [#414](https://github.com/canton-foundation/canton-dev-fund/pull/414) · [proposal text](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-04-Avro-SV_Governance_dApp.md) · M1 impl: [`splice-sv-voting-dapp` #12](https://github.com/canton-network/splice-sv-voting-dapp/pull/12) · Linear: [SV Governance dApp Implementation](https://linear.app/avro-digital/project/sv-governance-dapp-implementation-46f8d4022e3b)

## Branching

| Branch | Role |
| --- | --- |
| **`develop`** | Default integration branch — **open PRs here** |
| **`main`** | Stable / release line — promote from `develop` when ready |

**`develop` and `main` are protected.** Do not push directly — open a pull request.

| Branch type | Pattern | Example |
| --- | --- | --- |
| Feature / fix | `{user}/avr-{id}-{slug}` | `eric/avr-2476-m25-wallet-connect-via-dapp-sdk` |
| Docs / chore | same | `eric/avr-2472-sdlc-develop-as-default-integration-branch` |

Use the **git branch name** from the Linear issue (copy from issue sidebar). This links commits, PRs, and grant traceability.

## Workflow

1. Pick or create a Linear issue under [M2: External Signing Proof of Concept](https://linear.app/avro-digital/project/sv-governance-dapp-implementation-46f8d4022e3b).
2. Move issue to **In Progress**.
3. Branch from latest `develop`:

   ```bash
   git checkout develop && git pull
   git checkout -b eric/avr-2476-m25-wallet-connect-via-dapp-sdk
   ```

4. Implement; run locally:

   ```bash
   pnpm lint && pnpm typecheck && pnpm test && pnpm build
   ```

5. Open PR to **`develop`**. PR body must include:
   - `Closes AVR-XXXX` or `Related to AVR-XXXX`
   - Test plan checklist
   - Grant milestone note if applicable

6. Wait for CI (`ESLint & Typecheck`, `Vitest`, `Production build`) and at least **one approving review**.
7. Squash-merge (or merge commit per team preference). Delete branch after merge.
8. Move Linear issue to **Done** (or **In Review** if awaiting external validation).

### Promoting to `main`

When a milestone or release slice is ready for the stable line, open a PR **`develop` → `main`**. Same CI and review requirements apply. Avoid long-lived drift between the two branches.

## Commit messages

[Conventional Commits](https://www.conventionalcommits.org/) — see [CONTRIBUTING.md](../CONTRIBUTING.md).

Signed-off-by trailer is appended automatically via `pnpm setup:hooks`.

## CI required checks

Both protected branches require these checks on PRs:

| Check | Workflow |
| --- | --- |
| ESLint & Typecheck | [Lint](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/lint.yml) |
| Vitest | [Test](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/test.yml) |
| Production build | [Test](https://github.com/Avro-Digital/sv-governance-dapp/actions/workflows/test.yml) |

## Milestone map

Parent epic: [AVR-2471](https://linear.app/avro-digital/issue/AVR-2471) · Payment trigger: [AVR-1947](https://linear.app/avro-digital/issue/AVR-1947)

| Grant milestone | Focus | Linear / repo |
| --- | --- | --- |
| **M1** | Separate voting identity (grant: field-classification language; **impl:** `VoteDelegation`) | Upstream [`splice-sv-voting-dapp` #12](https://github.com/canton-network/splice-sv-voting-dapp/pull/12) — not this repo |
| **M2** | External signing PoC | AVR-2471 children below — **this repo** |
| **M3** | Deployment packaging, operator binding, staging | Epic/tickets TBD in Linear |
| **M4** | UX hardening, audit views, rollout | Epic/tickets TBD in Linear |

### M2 tickets (this repo)

| Ticket | Title | Status | Notes (post-#414 + VoteDelegation pivot) |
| --- | --- | --- | --- |
| AVR-2472 | SDLC: PR-only + develop default | Done | |
| AVR-2473 | Scaffold + CI | Done | |
| AVR-2474 | Splice UI phase 1 | Done | |
| AVR-2475 | Mocknet data layer | Done | |
| AVR-2481 | UI parity gaps | Done | Absorbed grant M4 UI baseline early |
| AVR-2484 | Docs + font housekeeping | Done | |
| AVR-2476 | Wallet connect | In progress / PR | Bind **delegated voter party**, not SV operator |
| AVR-2478 | DAML command mapping | Backlog | `VoteDelegation` → `DsoRules_CastVote`; blocked on M1 localnet |
| AVR-2477 | ExternalSigner | Backlog | Depends on 2476 + 2478 |
| AVR-2479 | E2E demo | Backlog | Delegated voter on non-SV participant |
| AVR-2480 | CIP-103 notes | Backlog | Include `VoteDelegation` setup + partner path |
| AVR-2740 | Authority / delegation UI | Backlog | Scan `VoteDelegation` + audit attribution |
| *new* | M3 deployment + binding epic | Backlog | Grant M3 — create in Linear if missing |

## Releases

No release tags until mocknet E2E is validated ([AVR-2479](https://linear.app/avro-digital/issue/AVR-2479)).
