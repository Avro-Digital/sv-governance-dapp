# Architecture decisions

Canonical upstream: [canton-network/splice](https://github.com/canton-network/splice) (`apps/sv/frontend/`). On-chain changes: [`canton-network/splice-sv-voting-dapp`](https://github.com/canton-network/splice-sv-voting-dapp).

Grant scope: [proposal #223](https://github.com/canton-foundation/canton-dev-fund/pull/223) · amendment [#414](https://github.com/canton-foundation/canton-dev-fund/pull/414).

## Status

M2 read path and Vote Requests UI parity landed on `develop` (Scan data layer + Splice `ListVoteRequests` extraction). External signing via the **governance-voter path** (`ExternalSigner`, wallet connect, `bindingCid` / `castBy`) remains in progress and depends on M1 contract infrastructure reaching localnet.

## Grant milestone split

| Milestone | Owner | This repo |
| --- | --- | --- |
| **M1** — CIP + Daml: field classification, `SvGovernanceVoter` binding, optional governance-voter cast path (Phase 1, status-quo preserving) | `splice-sv-voting-dapp` / CIP | Consumes upgraded Scan + ledger shapes only |
| **M2** — External signing PoC | This dApp | **Active** — wallet + cast demo |
| **M3** — Deployment packaging, operator binding workflow, staging | This dApp + ops | Planned |
| **M4** — UX hardening, audit views, rollout docs | This dApp | Planned |

## M1 amendment (#414) — what changed

The approved amendment expands M1 beyond action-level vote taxonomy:

- DSO rules and Amulet config fields are classified **operational**, **governance**, or **fixed**.
- **Governance is the default** for unset classifiable fields — votes use the governance-voter path unless explicitly operational or fixed.
- A governance vote process allows reclassification where permitted.
- Phase 1 lands **template infrastructure only** — one vote per SV, current voter set, status-quo behavior preserved until activation.
- `SvGovernanceVoter` binding + optional `bindingCid` / `castBy` on `DsoRules_CastVote` select operator vs governance-voter path; `Vote.castBy` / `castByRole` attribution metadata.

This dApp does **not** implement M1 contract work. It must align M2 cast commands and identity with the governance-voter path once M1 is on localnet.

## Data and signing paths

The Splice SV operator app does **not** use `@canton-network/dapp-sdk`. Governance voting flows through:

| Layer | Splice (today) | This dApp (target) |
| --- | --- | --- |
| UI | `components/governance/*`, route `/governance` | Extracted components under `src/components/` |
| Vote list | `useListDsoRulesVoteRequests` → SV Admin OpenAPI | `useGovernanceSnapshot` / `useGovernanceVoteRequests` → Scan API (`VITE_SCAN_URL`) |
| Cast vote | `SvAdminClient.castVote` (server-side, OIDC, operator path) | `ExternalSigner` → `@canton-network/dapp-sdk` `prepareExecute` on **governance-voter path** (`bindingCid`, `castBy`) |
| Types | `@daml.js/splice-dso-governance` | `src/types/governance.ts` (scaffold; DAML.js when M1 DAR is wired) |
| Auth | `react-oidc-context` (operator) | Wallet session for **governance-voter party** via CIP-103 ([AVR-2476](https://linear.app/avro-digital/issue/AVR-2476)); `VITE_SV_PARTY_ID` interim mock |

Reference interfaces:

- `src/lib/scan-client.ts` — Scan OpenAPI client for governance reads
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

`VITE_SV_PARTY_ID` identifies which SV’s vote to highlight until wallet connect ([AVR-2476](https://linear.app/avro-digital/issue/AVR-2476)) binds the **governance-voter party** from the wallet session.

Implementation: `src/lib/scan-client.ts`, `src/lib/governance-transform.ts`, hooks under `src/hooks/`.

## UI extraction principles

Splice’s explicit ask is **lift-and-shift** of the existing SV operator UI — layout, interaction, and visual tokens — not a redesign. That UI has been through community UX review.

| Aspect | Splice source | This dApp |
| --- | --- | --- |
| Theme | `apps/common/frontend/src/theme/` (`mode: 'dark'`, Inter, component overrides) | `src/theme/` — ported ([AVR-2481](https://linear.app/avro-digital/issue/AVR-2481)) |
| Vote Requests page | `CreateVoteRequest` + `SvListVoteRequests` stacked | See scope boundary below |

Grant M4 adds confirmation, diff, and **authority-path** audit views on top of this baseline.

## Vote Requests page — scope boundary

In Splice, `apps/sv/frontend/src/components/votes/VoteRequest.tsx` renders **two** stacked surfaces:

1. **`CreateVoteRequest`** — operator proposes a governance action (`SvAdminClient.createVoteRequest`, OIDC)
2. **`SvListVoteRequests`** — enumerate open requests, open detail modal, cast/edit vote

This dApp’s `/votes` route currently implements **(2) only**. That is intentional for M2: external governance **voters** discover and cast votes on existing proposals via Scan reads + wallet signing; they do not hold SV Admin credentials to create proposals.

**Workflow implication:** users accustomed to the full Splice page get list/review/vote here but must still **initiate** proposals through the SV operator app (e.g. localnet `http://sv.localhost:4000`) until a future ticket adds `CreateVoteRequest` + an operator write path. Document this in operator runbooks; do not assume `/votes` is a drop-in replacement for the entire Splice Vote Request route.

**Executed / Rejected tabs:** Splice groups `VRO_Expired` outcomes under the **Rejected** tab (same as here). Operators should expect expired proposals in that tab even though the label reads “Rejected” — not a data bug.

**Fonts:** Inter is bundled via `@fontsource/inter` (weights 400/500/700) — no third-party CDN at runtime.

## Planned topics

- Governance-voter `DsoRules_CastVote` command mapping with `bindingCid` / `castBy` ([AVR-2478](https://linear.app/avro-digital/issue/AVR-2478))
- Vote authority attribution in UI (`castBy`, `castByRole`) — grant M2/M4
- Operator governance-voter binding workflow — grant M3
- Splice UI extraction boundaries (see `docs/splice-source-map.md`)
