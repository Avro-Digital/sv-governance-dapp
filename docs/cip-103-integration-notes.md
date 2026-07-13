# CIP-103 integration notes (AVR-2480)

Notes for the wallet-gateway path used by this dApp’s **VoteDelegation** cast flow (grant M2).

Grant: [proposal #223](https://github.com/canton-foundation/canton-dev-fund/pull/223) · [proposal text](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-04-Avro-SV_Governance_dApp.md).  
M1 contracts: [`splice-sv-voting-dapp` #12](https://github.com/canton-network/splice-sv-voting-dapp/pull/12) (`VoteDelegation`).  
SDK: [`@canton-network/dapp-sdk`](https://www.npmjs.com/package/@canton-network/dapp-sdk) · [CIP-0103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md).

## Reference path (this repo)

| Step | Mechanism |
| --- | --- |
| Connect | `governanceDappClient.init()` + `RemoteAdapter({ rpcUrl: VITE_WALLET_GATEWAY_URL })` → `connect()` / session restore |
| Identity | Wallet `listAccounts()` → `voterPartyId`; `VITE_SV_PARTY_ID` → `identity.partyId` (`Vote.sv`) |
| Prepare | `buildVoteDelegationCastParams` → `ExerciseCommand` on `VoteDelegation_CastVote` |
| Sign + submit | `prepareExecuteAndWait` (wallet gateway prompts user) |
| Errors | `wallet_connection_failed` (toolbar); `signature_rejected` (vote form) |

Command shape (conceptual):

```text
actAs: [voterParty]
exercise VoteDelegationCid VoteDelegation_CastVote with
  dsoRulesCid
  castVote = DsoRules_CastVote with
    requestCid
    vote = Vote with sv = <delegating SV>; accept; reason; optCastAt = None
```

Implementation: `src/lib/vote-delegation-commands.ts`, `src/lib/signing.ts`, `src/lib/cast-vote-context.ts`.

### Required LocalNet / env

| Variable | Role |
| --- | --- |
| `VITE_WALLET_GATEWAY_URL` | CIP-103 gateway JSON-RPC |
| `VITE_SCAN_URL` | Vote list / DSO info |
| `VITE_SV_PARTY_ID` | Delegating SV (`Vote.sv` + highlighting) |
| `VITE_VOTE_DELEGATION_CID` | Active `VoteDelegation` contract (until ACS discovery) |
| `VITE_DSO_RULES_CID` | Optional override if Scan omits `dso_rules.contract.contract_id` |

Secrets (keys, mnemonics, JWTs) must **not** appear in dApp env or logs — only the gateway URL and public contract/party ids.

## Partner-compatible path

A partner wallet that implements CIP-103 (browser extension announce or remote gateway) should work without dApp changes if it:

1. Appears in the SDK wallet picker (or is registered as `RemoteAdapter`)
2. Exposes the `voterParty` in `listAccounts()`
3. Supports `prepareExecute` / `prepareExecuteAndWait` for Ledger API `ExerciseCommand` atoms
4. Hosts `voterParty` on a **participant that is not the SV node** (M2 acceptance)

Partners do **not** need to understand Splice SV Admin OIDC. They must authorize the same `VoteDelegation_CastVote` exercise the reference path builds.

Differences to expect across partners:

| Concern | Reference gateway | Partner wallet |
| --- | --- | --- |
| Discovery | `VITE_WALLET_GATEWAY_URL` RemoteAdapter | EIP-6963-style `canton:announceProvider` and/or custom RPC URL |
| UX | Gateway web UI / popup | Extension or mobile deep link |
| Session | SDK persisted session | May require reconnect each browser profile |

## Out of scope for M2 notes

- Operator `SvAdminClient.castVote` path
- Create-proposal (`VoteDelegation_RequestVote`) in this dApp
- Hard Daml who-can-vote gating (UI + Scan audit per M1 trust model)
- Production packaging (grant M3)

## Demo / reviewer checklist

1. LocalNet with VoteDelegation DAR loaded  
2. `VoteDelegation` created for `(sv, voterParty)` with voter on non-SV participant  
3. Gateway pointed at that participant; dApp env set  
4. Connect wallet → cast from Action Required → vote visible on Scan with `vote.sv` = SV  

See also [`external-signing-flow.md`](./external-signing-flow.md) and [`architecture.md`](./architecture.md).
