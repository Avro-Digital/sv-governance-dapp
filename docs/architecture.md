# Architecture decisions

Canonical upstream UI: [canton-network/splice](https://github.com/canton-network/splice) (`apps/sv/frontend/`).
On-chain / M1 work: [`canton-network/splice-sv-voting-dapp`](https://github.com/canton-network/splice-sv-voting-dapp) ([PR #12](https://github.com/canton-network/splice-sv-voting-dapp/pull/12)).

Grant scope: [proposal #223](https://github.com/canton-foundation/canton-dev-fund/pull/223) · approved text ([proposal markdown](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-04-Avro-SV_Governance_dApp.md)) · amendment [#414](https://github.com/canton-foundation/canton-dev-fund/pull/414).

## Status

M2 read path and Vote Requests UI parity landed on `develop`. Wallet connect for the **delegated voter party** landed in [AVR-2476](https://linear.app/avro-digital/issue/AVR-2476). `VoteDelegation_CastVote` command mapping and `ExternalSigner` → `prepareExecuteAndWait` land with [AVR-2478](https://linear.app/avro-digital/issue/AVR-2478) / [AVR-2477](https://linear.app/avro-digital/issue/AVR-2477). End-to-end LocalNet demo still depends on M1 DARs + CIP-103 gateway ([AVR-2479](https://linear.app/avro-digital/issue/AVR-2479)).

## Grant milestone split

| Milestone | Owner | This repo |
| --- | --- | --- |
| **M1** — CIP + Daml: separate governance-voting identity from node ops (Phase 1, one-vote-per-SV) | `splice-sv-voting-dapp` / CIP | Consumes upgraded Scan + ledger shapes only |
| **M2** — External signing PoC | This dApp | **Active** — wallet + cast demo |
| **M3** — Deployment packaging, operator binding workflow, staging | This dApp + ops | Planned |
| **M4** — UX hardening, audit views, rollout docs | This dApp | Planned |

## Grant amendment (#414) — approved intent

The approved proposal amendment expands M1 beyond an action-level vote allowlist. Grant text still calls for:

- Separating governance voting from SV node automation while preserving **one vote per SV**
- Configurable vote-category / field-classification language (operational / governance / fixed) with **governance as the default** for unset classifiable fields
- Operator-administered binding between an approved governance voter and a key/wallet path
- CIP-103-compatible external signing for a voter whose confirming participant need not be the SV node

That remains the **funding and acceptance framing**. How M1 is realized on-ledger evolved during upstream review (next section).

## M1 implementation — VoteDelegation pivot

Upstream M1 ([`splice-sv-voting-dapp` PR #12](https://github.com/canton-network/splice-sv-voting-dapp/pull/12)) implements an additive, SCU-compatible foundation that **diverges from a Daml-level operational/governance/fixed split**:

| Topic | Grant amendment language | Current M1 implementation |
| --- | --- | --- |
| On-ledger vote split | Per-field classification drives operator vs governance-voter path | **No governance/non-governance split in Daml** — all votes still use existing `DsoRules` request/cast |
| Separate voting identity | Governance-voter / binding contracts | `VoteDelegation` template: SV (signatory) pre-authorizes a `voterParty` (observer; DSO observes for Scan) |
| Cast / request path | Optional `bindingCid` / `castBy`-style attribution on cast | Nonconsuming `VoteDelegation` choices relay `DsoRules_RequestVote` / `DsoRules_CastVote`; optional trailing `voterParty` on `DsoRules_RequestVote` for co-authorization + audit |
| Who-can-vote gating | Field classification + contract path | **UI-level** (and Scan audit trail); not hard-gated in Daml |
| App config | Operator binding workflow (grant M3) | Optional `voterPartyId` on `SvAppBackendConfig` (identity externalized on the app side) |

Trust model (from PR #12): UI-level enforcement is acceptable because the node operator can already change the voter party; **Scan** is the integrity/audit mechanism, not Daml-level who-can-vote guards.

This dApp does **not** implement M1 contract work. M2 cast commands and identity must align with **`VoteDelegation` + wallet-held `voterParty`**, not the earlier `SvGovernanceVoter` / `bindingCid` / `castBy` sketch.

## Data and signing paths

The Splice SV operator app does **not** use `@canton-network/dapp-sdk`. Governance voting flows through:

| Layer | Splice (today) | This dApp (target) |
| --- | --- | --- |
| UI | `components/governance/*`, route `/governance` | Extracted components under `src/components/` |
| Vote list | `useListDsoRulesVoteRequests` → SV Admin OpenAPI | `useGovernanceSnapshot` / `useGovernanceVoteRequests` → Scan API (`VITE_SCAN_URL`) |
| Cast vote | `SvAdminClient.castVote` (server-side, OIDC, operator path) | `ExternalSigner` → `@canton-network/dapp-sdk` `prepareExecute` via **`VoteDelegation`** (delegated `voterParty` path) |
| Types | `@daml.js/splice-dso-governance` | `src/types/governance.ts` (scaffold; DAML.js when M1 DAR is wired) |
| Auth | `react-oidc-context` (operator) | Wallet session for **delegated voter party** via CIP-103 ([AVR-2476](https://linear.app/avro-digital/issue/AVR-2476)); `VITE_SV_PARTY_ID` interim fallback |

Reference interfaces:

- `src/lib/scan-client.ts` — Scan OpenAPI client for governance reads (and, once M1 lands, `VoteDelegation` visibility)
- `src/lib/sv-admin.ts` — documents the upstream operator API we are replacing for vote casting
- `src/lib/dapp-sdk.ts` — CIP-103 wrapper (`RemoteAdapter` from `VITE_WALLET_GATEWAY_URL`)
- `src/lib/signing.ts` — prepare / sign / submit stub for Milestone 2

## dApp SDK configuration

From `@canton-network/dapp-sdk` v1.2.0:

- `init({ additionalAdapters: [new RemoteAdapter({ rpcUrl }) ] })` registers a wallet gateway
- `connect()` opens wallet picker / restores session
- `prepareExecute` / `prepareExecuteAndWait` submit commands for wallet signing
- `ledgerApi` proxies Ledger API through the connected wallet provider

`VITE_LEDGER_URL` and `VITE_PARTICIPANT_ID` are reserved for direct participant reads; they are not passed into `LedgerApiParams` (the SDK routes via the wallet).

## Vote data source (M2.4)

Read path uses the **Scan API** (`VITE_SCAN_URL`), not SV Admin OpenAPI:

- External voters do not have operator OIDC credentials for SV Admin.
- Scan exposes the same `listDsoRulesVoteRequests` / `lookupDsoRulesVoteRequest` endpoints used by the Scan frontend.
- Localnet: `http://scan.localhost:4000/api/scan` (nginx on `SV_UI_PORT` 4000).
- List endpoint: `GET /v0/admin/sv/voterequests` (same as Splice Scan; verified 200 on localnet without auth gate).
- Lookup: `GET /v0/voterequests/{contract_id}` — accepts ledger contract IDs only; route IDs may use `trackingCid` (see `resolveVoteRequest` in `scan-client.ts`).
- After M1: `VoteDelegation` contracts are DSO-observed and ingested into Scan so delegated authorization is network-visible.

`VITE_SV_PARTY_ID` is a dev fallback for vote highlighting when no wallet is connected. Wallet connect ([AVR-2476](https://linear.app/avro-digital/issue/AVR-2476)) binds the **delegated voter party** (`VoteDelegation.voterParty`) from `listAccounts()`.

Implementation: `src/lib/scan-client.ts`, `src/lib/governance-transform.ts`, hooks under `src/hooks/`.

## UI extraction principles

Splice’s explicit ask is **lift-and-shift** of the existing SV operator UI — layout, interaction, and visual tokens — not a redesign. That UI has been through community UX review.

| Aspect | Splice source | This dApp |
| --- | --- | --- |
| Theme | `apps/common/frontend/src/theme/` (`mode: 'dark'`, Inter, component overrides) | `src/theme/` — ported ([AVR-2481](https://linear.app/avro-digital/issue/AVR-2481)) |
| Vote Requests page | `CreateVoteRequest` + `SvListVoteRequests` stacked | See scope boundary below |

Grant M4 adds confirmation, diff, and **authority-path** audit views (direct vs delegated) on top of this baseline. Who-can-vote policy for the dApp is a **UI concern**, aligned with M1’s trust model.

## Vote Requests page — scope boundary

In Splice, `apps/sv/frontend/src/components/votes/VoteRequest.tsx` renders **two** stacked surfaces:

1. **`CreateVoteRequest`** — operator proposes a governance action (`SvAdminClient.createVoteRequest`, OIDC)
2. **`SvListVoteRequests`** — enumerate open requests, open detail modal, cast/edit vote

This dApp’s `/votes` route currently implements **(2) only**. That is intentional for M2: external **voter parties** discover and cast votes on existing proposals via Scan reads + wallet signing; they do not hold SV Admin credentials to create proposals (unless a future path exercises delegated `RequestVote`).

**Workflow implication:** users accustomed to the full Splice page get list/review/vote here but must still **initiate** proposals through the SV operator app (e.g. localnet `http://sv.localhost:4000`) until a future ticket adds create-request + an appropriate write path. Document this in operator runbooks; do not assume `/votes` is a drop-in replacement for the entire Splice Vote Request route.

**Executed / Rejected tabs:** Splice groups `VRO_Expired` outcomes under the **Rejected** tab (same as here). Operators should expect expired proposals in that tab even though the label reads “Rejected” — not a data bug.

**Fonts:** Inter is bundled via `@fontsource/inter` (weights 400/500/700) — no third-party CDN at runtime.

## Planned topics

- `VoteDelegation`-backed cast command mapping ([AVR-2478](https://linear.app/avro-digital/issue/AVR-2478))
- Authority / delegation attribution in UI (Scan `VoteDelegation` + vote audit) — grant M2/M4
- Operator voter-party / key binding workflow — grant M3
- Splice UI extraction boundaries (see `docs/splice-source-map.md`)
