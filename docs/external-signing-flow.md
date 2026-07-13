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
2. Cast via `@canton-network/dapp-sdk` `prepareExecute` exercising the **`VoteDelegation` → `DsoRules_CastVote`** path (not SV Admin OIDC)
3. End-to-end demo on localnet once M1 Daml is available in Scan/localnet fixtures

Operator-path casting via `SvAdminClient.castVote` remains out of scope for this dApp.

## Planned sections

1. Voter party + `VoteDelegation` setup (operator-administered; full binding/packaging workflow in grant M3)
2. Transaction preparation (`prepareVoteTransaction` → DAML command builder over delegation choices)
3. Wallet signature request (`requestSignature`)
4. Signed transaction submission (`submitSignedTransaction`)
5. Reference implementation path vs partner-compatible CIP-103 path ([AVR-2480](https://linear.app/avro-digital/issue/AVR-2480))

See [`src/lib/signing.ts`](../src/lib/signing.ts) for the stubbed `ExternalSigner` interface and [`docs/architecture.md`](./architecture.md) for the grant-vs-implementation split.
