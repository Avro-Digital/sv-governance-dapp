# External signing flow

Documents the wallet-gateway-backed signing path for **delegated voter-party** votes under grant M2.

Grant context: [proposal #223](https://github.com/canton-foundation/canton-dev-fund/pull/223) · approved [proposal text](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-04-Avro-SV_Governance_dApp.md) · amendment [#414](https://github.com/canton-foundation/canton-dev-fund/pull/414).

M1 contracts: [`splice-sv-voting-dapp` PR #12](https://github.com/canton-network/splice-sv-voting-dapp/pull/12) (`VoteDelegation`).

## Scope (M2)

Grant M2 proves CIP-103 external signing for a governance voter whose confirming participant is **not** the SV node, while preserving one-vote-per-SV semantics.

On-ledger, M1 no longer introduces a separate governance/non-governance cast path. Instead:

1. An SV creates a `VoteDelegation` that pre-authorizes a `voterParty`
2. That `voterParty` drives `DsoRules_RequestVote` / `DsoRules_CastVote` through nonconsuming delegation choices (optional `voterParty` co-authorization on request for audit)
3. Who-can-vote policy stays in the UI; Scan provides the audit trail (`VoteDelegation` is DSO-observed)

This dApp therefore proves:

1. Wallet connect for the **delegated voter party** (confirming participant ≠ SV node)
2. Create requests and cast via `@canton-network/dapp-sdk` `prepareExecuteAndWait`, exercising **`VoteDelegation_RequestVote` / `VoteDelegation_CastVote`** (not SV Admin OIDC)
3. End-to-end demo on LocalNet with the M1 `VoteDelegation` DAR

Operator-path casting via `SvAdminClient.castVote` remains out of scope for this dApp.

## Reproducing the M2 demo

The committee-reproducible demo procedure lives in [`DEMO_RUNBOOK.md`](./DEMO_RUNBOOK.md) (LocalNet build, `VoteDelegation` creation, wallet gateway setup, request seeding, dApp configuration) with recording narration in [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md). The full flow — externally signed proposal creation and vote casting recorded on-chain, with the voter party confirmed through the app-user participant rather than the SV node — was verified on LocalNet on 2026-07-18.

Two implementation details a reviewer should know:

- Splice submissions from the voter's participant carry `DsoRules` (and for casts, the `VoteRequest`) as **explicitly disclosed contracts** sourced from Scan's `created_event_blob`, since that participant does not host DSO contracts.
- `DsoRules_CastVote` archives and recreates the `VoteRequest`; the dApp re-resolves the current contract id through Scan before every cast.

## Wallet connect (M2.5 / AVR-2476)

The dApp binds the **delegated voter party** (`VoteDelegation.voterParty`) from a CIP-103 wallet session — not the SV operator OIDC identity.

1. On mount, `governanceDappClient.init()` registers a `RemoteAdapter` when `VITE_WALLET_GATEWAY_URL` is set and attempts session restore.
2. **Connect wallet** in the app bar opens the SDK wallet picker (`connect()`).
3. `listAccounts()` returns authorized wallet parties; the primary account populates `voterPartyId` for request/cast commands while `identity.partyId` remains the delegating SV used for highlighting.
4. **Disconnect** clears `voterPartyId` without changing the delegating SV identity.
5. Connection failures surface as `wallet_connection_failed` in the toolbar.

### Environment

| Variable | Purpose |
| --- | --- |
| `VITE_WALLET_GATEWAY_URL` | CIP-103 wallet gateway RPC URL for `RemoteAdapter` |
| `VITE_SV_PARTY_ID` | Dev fallback party until wallet connect or M3 binding workflow |

Copy `.env.example` to `.env` and point the gateway at your LocalNet wallet gateway. The reference gateway is `@canton-network/wallet-gateway-remote` ([canton-network/wallet](https://github.com/canton-network/wallet)), which serves the CIP-103 dApp RPC at `http://localhost:3030/api/v0/dapp` — see [`DEMO_RUNBOOK.md`](./DEMO_RUNBOOK.md) §0.4 for setup.

`@canton-network/dapp-sdk` bundles a WalletConnect adapter; this repo lists `@walletconnect/sign-client` and `@walletconnect/types` as direct dependencies so Vite can resolve them at dev time (they are optional peers upstream).

Implementation: `src/lib/dapp-sdk.ts`, `src/stores/wallet-session.ts`, `src/components/wallet/WalletConnectToolbar.tsx`.

## Request and cast path (M2.7+)

1. Voter party + `VoteDelegation` setup (operator-administered; full binding/packaging workflow in grant M3)
2. Proposal creation (`buildVoteDelegationRequestParams` → `prepareExecuteAndWait`)
3. Cast preparation (`prepareVoteTransaction` → `buildVoteDelegationCastParams`)
4. Wallet signature + submit (`prepareExecuteAndWait` via `ExternalSigner`)
5. Reference vs partner-compatible CIP-103 notes — [`cip-103-integration-notes.md`](./cip-103-integration-notes.md) ([AVR-2480](https://linear.app/avro-digital/issue/AVR-2480))

See [`src/lib/signing.ts`](../src/lib/signing.ts), [`src/lib/vote-delegation-commands.ts`](../src/lib/vote-delegation-commands.ts), and [`docs/architecture.md`](./architecture.md).
