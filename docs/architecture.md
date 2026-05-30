# Architecture decisions

Canonical upstream: [canton-network/splice](https://github.com/canton-network/splice) (`apps/sv/frontend/`).

## Status

Initial scaffold — decisions logged as Milestone 2+ work lands.

## Data and signing paths

The Splice SV operator app does **not** use `@canton-network/dapp-sdk`. Governance voting flows through:

| Layer | Splice (today) | This dApp (target) |
| --- | --- | --- |
| UI | `components/governance/*`, route `/governance` | Extracted components under `src/components/` |
| Vote list | `useListDsoRulesVoteRequests` → SV Admin OpenAPI | `useVotes` → Scan API (`VITE_SCAN_URL`) |
| Cast vote | `SvAdminClient.castVote` (server-side, OIDC) | `ExternalSigner` → `@canton-network/dapp-sdk` `prepareExecute` |
| Types | `@daml.js/splice-dso-governance` | `src/types/governance.ts` (scaffold; DAML.js later) |
| Auth | `react-oidc-context` | `VITE_SV_PARTY_ID` (M2.4); wallet session via CIP-103 (M2.5+) |

Reference interfaces:

- `src/lib/scan-client.ts` — Scan OpenAPI client for governance reads
- `src/lib/sv-admin.ts` — documents the upstream API we are replacing for vote casting
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

`VITE_SV_PARTY_ID` identifies which SV’s vote to highlight until wallet connect (AVR-2476) replaces it.

Implementation: `src/lib/scan-client.ts`, `src/lib/governance-transform.ts`, hooks under `src/hooks/`.

## Planned topics

- Mapping `CastVoteArgs` → DAML `VoteRequest` choice exercise commands
- Splice UI extraction boundaries (see `docs/splice-source-map.md`)
