# External signing flow

Documents the wallet-gateway-backed signing path for **governance-voter** votes under grant M2.

Grant context: [proposal #223](https://github.com/canton-foundation/canton-dev-fund/pull/223) · M1 amendment [#414](https://github.com/canton-foundation/canton-dev-fund/pull/414).

## Scope (M2)

Phase 1 preserves status-quo voting behavior on-chain while landing infrastructure for a separate governance-voter identity. This dApp proves:

1. Wallet connect for the **governance-voter party** (confirming participant ≠ SV node)
2. `DsoRules_CastVote` via `@canton-network/dapp-sdk` `prepareExecute` with optional `bindingCid` and `castBy` (governance-voter path)
3. End-to-end demo on localnet once M1 Daml is available in Scan/localnet fixtures

Operator-path casting via SV Admin OIDC remains out of scope.

## Planned sections

1. Governance-voter party + `SvGovernanceVoter` binding setup (operator-administered; full workflow in grant M3)
2. Transaction preparation (`prepareVoteTransaction` → DAML command builder)
3. Wallet signature request (`requestSignature`)
4. Signed transaction submission (`submitSignedTransaction`)
5. Reference implementation path vs partner-compatible CIP-103 path ([AVR-2480](https://linear.app/avro-digital/issue/AVR-2480))

See [`src/lib/signing.ts`](../src/lib/signing.ts) for the stubbed `ExternalSigner` interface and [`docs/architecture.md`](./architecture.md) for milestone split.
