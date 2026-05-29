# External signing flow

Placeholder — this document will describe the wallet-gateway-backed signing path for governance votes.

## Planned sections

1. Transaction preparation (`prepareVoteTransaction`)
2. Wallet signature request (`requestSignature`)
3. Signed transaction submission (`submitSignedTransaction`)
4. Reference implementation path vs partner-compatible CIP-103 path

See [`src/lib/signing.ts`](../src/lib/signing.ts) for the stubbed `ExternalSigner` interface.
