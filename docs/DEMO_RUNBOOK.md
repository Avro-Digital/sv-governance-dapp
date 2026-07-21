# Demo runbook — M2 CIP-103 request + cast (LocalNet)

**Goal:** Reproducible LocalNet demo that satisfies grant M2 / [AVR-1947](https://linear.app/avro-digital/issue/AVR-1947): a **delegated voter party** signs proposal creation and casting via CIP-103 (`VoteDelegation_RequestVote` / `VoteDelegation_CastVote` → wallet gateway), confirming participant ≠ SV node.

Recording narration: [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md).  
Signing details: [`cip-103-integration-notes.md`](./cip-103-integration-notes.md).

Grant: [proposal text](https://github.com/canton-foundation/canton-dev-fund/blob/main/proposals/2026-04-Avro-SV_Governance_dApp.md) · M1: [`splice-sv-voting-dapp` #12](https://github.com/canton-network/splice-sv-voting-dapp/pull/12).

---

## Acceptance checklist

All items were verified on LocalNet during the recorded demo dry runs (2026-07-18).

- [x] dApp connects through `@canton-network/dapp-sdk`
- [x] Delegating SV identity and wallet-controlled `voterParty` remain separate
- [x] Proposal creation builds `VoteDelegation_RequestVote` and submits with `prepareExecuteAndWait`
- [x] Voting builds `VoteDelegation_CastVote` and submits with `prepareExecuteAndWait`
- [x] Neither write path uses SV Admin OIDC or requires keys, mnemonics, or JWTs in the dApp
- [x] Wallet `voterParty` is hosted on a participant other than the SV participant (app-user vs sv)
- [x] Created request appears through Scan with the requester’s automatic Accept vote
- [x] Cast appears through Scan with `vote.sv` equal to the delegating SV (Accept, Reject, and edit variants)

---

## What you are setting up

1. Splice LocalNet containing the VoteDelegation DAR
2. A demo SV plus an app-user party hosted away from the SV participant
3. `VoteDelegation(sv = demo SV, voterParty = app-user party)`
4. CIP-103 Wallet Gateway connected to the app-user participant
5. This dApp configured for live Scan data, the gateway, and the delegation contract
6. A seeded peer-SV vote request (created as the DSO) for the first-time cast demonstration

---

The dApp connects to the **CIP-103 Wallet Gateway** (`http://localhost:3030/api/v0/dapp`), not the Splice Wallet UI at `wallet.localhost`.

---

## 0. Preflight (before QuickTime)

Run these in order. Do not start recording until every step is green.

### 0.1 LocalNet

```bash
cd ~/Projects/splice
git checkout feat/voting-delegation-daml-foundation
direnv allow # first checkout; ensure "direnv: using nix" has loaded

# In the configured Splice development shell, build the images used by LocalNet.
# Their tag is derived automatically from this branch's commit.
make \
  cluster/images/canton/docker-build \
  cluster/images/splice-app/docker-build \
  cluster/images/wallet-web-ui/docker-build \
  cluster/images/ans-web-ui/docker-build \
  cluster/images/sv-web-ui/docker-build \
  cluster/images/scan-web-ui/docker-build

# Uses the same derived tag and local image repository.
build-tools/splice-localnet-compose.sh start
```

To inspect the generated tag, run `build-tools/get-snapshot-version`. Do not invent a tag or use a released image tag: released images do not contain the unmerged VoteDelegation branch.

If `splice-app/docker-build` fails inside `sbt bundle` with Sphinx doc warnings treated as errors (e.g. `undefined label` in `Splice-DSO-SVLocking.rst`), the branch has pre-existing doc warnings. Local workaround: remove the `-W` flag from the `sphinx-build` invocation in the `docs` project's `bundle` task in `build.sbt`, delete the generated `docs/src/app_dev/api`, `docs/html`, and `docs/target` directories, and re-run `make`. Do not commit that `build.sbt` change.

`/etc/hosts` if needed:

```text
127.0.0.1   scan.localhost sv.localhost wallet.localhost canton.localhost
```

Smoke:

```bash
curl -sS "http://scan.localhost:4000/api/scan/v0/dso" | jq -r '.sv_party_id, .dso_party_id, .dso_rules.contract.contract_id // "no-dso-rules-cid"'
curl -sS "http://scan.localhost:4000/api/scan/v0/admin/sv/voterequests" | head
```

Save `sv_party_id` for `VITE_SV_PARTY_ID` and `dso_rules.contract.contract_id` for `VITE_DSO_RULES_CID`.

### 0.2 Create `VoteDelegation`

There is no VoteDelegation creation GUI. Submit a Daml `CreateCommand` to the **SV participant JSON Ledger API**.

Generate the LocalNet admin JWT (the LocalNet auth configuration uses the known development secret `unsafe`):

```bash
TOKEN=$(
  node -e '
    const crypto = require("crypto");
    const enc = value => Buffer.from(JSON.stringify(value)).toString("base64url");
    const unsigned = `${enc({ alg: "HS256", typ: "JWT" })}.${enc({
      sub: "ledger-api-user",
      aud: "https://canton.network.global"
    })}`;
    const signature = crypto.createHmac("sha256", "unsafe")
      .update(unsigned).digest("base64url");
    process.stdout.write(`${unsigned}.${signature}`);
  '
)
```

Discover the parties:

```bash
SV_PARTY=$(
  curl -fsS -H "Authorization: Bearer $TOKEN" \
    http://localhost:4975/v2/users/ledger-api-user |
    jq -r '.user.primaryParty'
)

VOTER_PARTY=$(
  curl -fsS -H "Authorization: Bearer $TOKEN" \
    http://localhost:2975/v2/users/app-user |
    jq -r '.user.primaryParty'
)

DSO_PARTY=$(
  curl -fsS http://scan.localhost:4000/api/scan/v0/dso |
    jq -r '.dso_party_id'
)

printf 'SV_PARTY=%s\nVOTER_PARTY=%s\nDSO_PARTY=%s\n' \
  "$SV_PARTY" "$VOTER_PARTY" "$DSO_PARTY"
```

Expected:

- all three values are nonempty and not `null`;
- `SV_PARTY` differs from `VOTER_PARTY`;
- the Wallet Gateway account selected for the demo is `VOTER_PARTY`.

Upload the `splice-dso-governance` DAR to the **app-user participant**. LocalNet only auto-uploads it to the SV participant, but `voterParty` is a stakeholder on `VoteDelegation`, so its hosting participant must also vet the package — otherwise the create fails with `PACKAGE_SELECTION_FAILED`:

```bash
curl -fsS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @"$HOME/Projects/splice/daml/splice-dso-governance/.daml/dist/splice-dso-governance-current.dar" \
  http://localhost:2975/v2/packages
```

(An empty `{}` response means success.)

Create the contract:

```bash
CREATE_RESPONSE=$(
  jq -n \
    --arg dso "$DSO_PARTY" \
    --arg sv "$SV_PARTY" \
    --arg voter "$VOTER_PARTY" \
    --arg command_id "create-vote-delegation-$(date +%s)" \
    '{
      commands: {
        commands: [{
          CreateCommand: {
            templateId: "#splice-dso-governance:Splice.DsoRules.VoteDelegation:VoteDelegation",
            createArguments: {
              dso: $dso,
              sv: $sv,
              voterParty: $voter
            }
          }
        }],
        userId: "ledger-api-user",
        commandId: $command_id,
        actAs: [$sv],
        readAs: []
      }
    }' |
    curl -sS -X POST \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      --data-binary @- \
      http://localhost:4975/v2/commands/submit-and-wait-for-transaction
)

DELEGATION_CID=$(
  jq -r '
    .transaction.events[]
    | .CreatedEvent?
    | select(. != null)
    | select(.templateId | contains("VoteDelegation"))
    | .contractId
  ' <<<"$CREATE_RESPONSE"
)

if [[ -z "$DELEGATION_CID" || "$DELEGATION_CID" == "null" ]]; then
  echo "VoteDelegation was not created; full JSON API response:"
  jq . <<<"$CREATE_RESPONSE"
else
  printf 'VITE_SV_PARTY_ID=%s\nVITE_VOTE_DELEGATION_CID=%s\n' \
    "$SV_PARTY" "$DELEGATION_CID"
fi
```

Copy those final two values into the dApp `.env`.

Confirm `voterParty` lives on **app-user** (or app-provider), not the SV node. That is the M2 “confirming participant ≠ SV” proof.

If `VOTER_PARTY` is `null`, wait for LocalNet to become healthy and retry. Open `http://wallet.localhost:2000` once if the configured `app-user` wallet has not initialized.

### 0.3 Seed the cast request

Stock LocalNet has exactly one SV, and requests created through `DsoRules_RequestVote` carry the requester's automatic Accept — so nothing ever appears under **Action Needed** organically. Seed one directly instead: `VoteRequest.requester` is a `Text` (not a `Party`) and its only signatory is the DSO, which `ledger-api-user` on the SV participant can act as. Creating a `VoteRequest` with an empty `votes` map exactly reproduces a peer SV's open request, and the on-camera cast on it is the full real path (`VoteDelegation_CastVote` → `DsoRules_CastVote`).

Reuse `TOKEN`, `SV_PARTY`, and `DSO_PARTY` from 0.2:

```bash
VOTE_BEFORE=$(date -u -d "+2 days" +%Y-%m-%dT%H:%M:%SZ)   # BSD/macOS date: -v+2d
EFFECTIVE_AT=$(date -u -d "+3 days" +%Y-%m-%dT%H:%M:%SZ)  # BSD/macOS date: -v+3d

jq -n \
  --arg dso "$DSO_PARTY" \
  --arg sv "$SV_PARTY" \
  --arg voteBefore "$VOTE_BEFORE" \
  --arg effectiveAt "$EFFECTIVE_AT" \
  --arg command_id "seed-vote-request-$(date +%s)" \
  '{
    commands: {
      commands: [{
        CreateCommand: {
          templateId: "#splice-dso-governance:Splice.DsoRules:VoteRequest",
          createArguments: {
            dso: $dso,
            requester: "Demo-Peer-SV",
            action: {
              tag: "ARC_DsoRules",
              value: {
                dsoAction: {
                  tag: "SRARC_UpdateSvRewardWeight",
                  value: { svParty: $sv, newRewardWeight: "10000" }
                }
              }
            },
            reason: {
              url: "http://localhost",
              body: "Seeded request for first-time cast demo"
            },
            voteBefore: $voteBefore,
            votes: [],
            trackingCid: null,
            targetEffectiveAt: $effectiveAt
          }
        }
      }],
      userId: "ledger-api-user",
      commandId: $command_id,
      actAs: [$dso],
      readAs: []
    }
  }' |
  curl -sS -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    --data-binary @- \
    http://localhost:4975/v2/commands/submit-and-wait-for-transaction |
  jq -r '.transaction.events[]? | .CreatedEvent? | select(. != null) | .contractId'
```

Confirm through Scan (expect `requester: "Demo-Peer-SV"` with zero votes):

```bash
curl -sS "http://scan.localhost:4000/api/scan/v0/admin/sv/voterequests" |
  jq '.dso_rules_vote_requests[] | {requester: .payload.requester, votes: (.payload.votes | length)}'
```

The seeded request appears under **Action Needed** for `VITE_SV_PARTY_ID`, since the demo SV has not voted on it.

For every request you create **through the dApp** (including Beat 2 on camera), check **Set a specific effective time** with a time after the voting deadline. This is mandatory with one SV: the requester's automatic Accept meets the threshold instantly, and a request without a future effective time executes immediately and lands under **Executed**, not In Progress.

### 0.4 CIP-103 Wallet Gateway

The gateway is `@canton-network/wallet-gateway-remote` from [canton-network/wallet](https://github.com/canton-network/wallet) (same repo as the dApp SDK). Run it via npx with a config pointed at the **app-user** participant JSON Ledger API (host of `voterParty`).

Generate a starting config, then edit the self-signed network block:

```bash
mkdir -p ~/Projects/wallet-gateway && cd ~/Projects/wallet-gateway
npx -y @canton-network/wallet-gateway-remote --config-example > config.json
```

LocalNet values for the self-signed network (delete the OAuth example entries):

- `ledgerApi.baseUrl`: `http://127.0.0.1:2975` (app-user participant)
- `auth` / `adminAuth` `audience`: `https://canton.network.global`
- `auth.clientId`: `app-user` · `adminAuth.clientId`: `ledger-api-user`
- both `clientSecret`: `unsafe`

Start it and leave it running:

```bash
npx -y @canton-network/wallet-gateway-remote -c ./config.json
```

- User UI: `http://localhost:3030` — log in, pick the LocalNet network, and add a wallet for the demo.
- dApp RPC: `http://localhost:3030/api/v0/dapp` — this is `VITE_WALLET_GATEWAY_URL`.

If the gateway allocates a **new** party for its wallet instead of exposing the existing `VOTER_PARTY`, re-run the 0.2 create with that party as `voterParty` (it must match the wallet the dApp connects as).

### 0.5 This dApp

```bash
cd ~/Projects/sv-governance-dapp
git checkout develop
pnpm install
cp .env.example .env
```

`.env` for the recording:

```env
VITE_USE_MOCK_VOTES=false
VITE_SCAN_URL=http://scan.localhost:4000/api/scan
VITE_WALLET_GATEWAY_URL=http://localhost:3030/api/v0/dapp

# Delegating SV — Vote.sv + highlighting
VITE_SV_PARTY_ID=<sv_party_id from /v0/dso>

# Delegated request + cast context
VITE_VOTE_DELEGATION_CID=<VoteDelegation contract id>
VITE_DSO_RULES_CID=<dso_rules contract id if Scan omits it or you prefer an override>
# VITE_DSO_GOVERNANCE_PACKAGE_NAME=splice-dso-governance
```

```bash
pnpm dev   # http://localhost:5173
```

Dry run (not recorded): Connect wallet → create a request with a future effective time → approve it → verify it under In Progress → open the seeded Action Needed request from 0.3 → cast → approve. Confirm both wallet prompts complete, then re-seed 0.3 before recording.

---

## 1. Demo flow (what you will do on camera)

| Step | Where                                   | Action                                                                                       |
| ---- | --------------------------------------- | -------------------------------------------------------------------------------------------- |
| 1    | This dApp toolbar                       | **Connect wallet** → party = `voterParty`                                                    |
| 2    | This dApp `http://localhost:5173/governance/proposals` | Create, review, and wallet-sign vote request                                                 |
| 3    | This dApp                               | Show the created request under **In Progress** with its automatic requester vote             |
| 4    | This dApp **Action Needed**             | Open the separately seeded request; Accept/Reject + reason → Confirm → **approve in wallet** |
| 5    | This dApp + optional Scan               | Show updated ballot / history (`vote.sv` = SV)                                               |

Create and cast are **both** CIP-103 in this demo.

For a single-SV take, step 4 is instead: open the created In Progress request, click **Edit**, update the Accept reason, and approve the wallet prompt.

---

## 2. QuickTime

1. Mute Slack / calendar; one desktop space.
2. Layout: **this dApp** | wallet approval UI | optional **Scan** / gateway account view.
3. QuickTime → File → New Screen Recording → region covering those windows.
4. Speak [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) in order.
5. Save `.mov` locally.

---

## 3. Failure cheat sheet

| Symptom                                      | Fix                                                                                                           |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Scan CORS / status `(null)`                  | LocalNet down or `scan.localhost` DNS                                                                         |
| Empty list in live mode                      | `VITE_SCAN_URL` / Scan not ready                                                                              |
| Connect wallet fails                         | Gateway down or wrong `VITE_WALLET_GATEWAY_URL`                                                               |
| “Connect a wallet…” on submit                | Session not connected; `voterPartyId` null                                                                    |
| `PACKAGE_SELECTION_FAILED` on create/cast    | Upload the `splice-dso-governance` DAR to the app-user participant (see 0.2)                                  |
| “VITE_VOTE_DELEGATION_CID is not configured” | Set env; restart `pnpm dev`                                                                                   |
| “DsoRules contract id missing”               | Set `VITE_DSO_RULES_CID` from `/v0/dso`                                                                       |
| `signature_rejected`                         | User cancelled wallet — retry and approve                                                                     |
| Created request is not under Action Needed   | Expected: the requester’s automatic Accept vote places it under In Progress                                   |
| Created request lands under Executed         | Single-SV threshold met instantly; recreate with a future **Set a specific effective time**                   |
| Created/seeded request closes before cast    | Voting threshold is already met; use a multi-SV fixture or seed with a threshold that leaves the request open |
| Cast fails auth / wrong SV                   | `vote.sv` must equal `VoteDelegation.sv`; use `VITE_SV_PARTY_ID`                                              |
| Template / package errors                    | LocalNet DAR ≠ package name; check `VITE_DSO_GOVERNANCE_PACKAGE_NAME`                                         |
| Vote lands but “your vote” wrong             | Confirm `VITE_SV_PARTY_ID` is SV, not wallet party                                                            |

---

## 4. Stop LocalNet

```bash
cd ~/Projects/splice
build-tools/splice-localnet-compose.sh stop -D
```

Architecture: [`architecture.md`](./architecture.md) · signing flow: [`external-signing-flow.md`](./external-signing-flow.md).
