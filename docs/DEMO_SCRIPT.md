# Demo script — M2 CIP-103 request + cast (QuickTime)

Narration and click path for the **grant M2 acceptance** recording: externally signed proposal creation and cast via `VoteDelegation` + wallet gateway on LocalNet.

Setup / preflight: [`DEMO_RUNBOOK.md`](./DEMO_RUNBOOK.md). Do not hit Record until that preflight checklist is green.

**Audience:** grant / committee reviewers. **Network:** LocalNet only — no real CC.

**Length:** ~4–6 minutes. One continuous take preferred.

**Layout:** this dApp · wallet approval UI · optional Scan / gateway account view.

**Before recording (stock LocalNet, one SV):** seed a peer-SV vote request off camera per runbook 0.3 — it appears under **Action Needed** and gives Beat 4 a genuine first-time cast. In Beat 2 you **must** set a future custom effective time (otherwise the request executes instantly and shows under Executed).

---

## Cold open (15–20 s)

> “This is Milestone 2 of the SV Governance dApp grant: external signing for a delegated voter on a local Splice network — not TestNet or MainNet.
>
> On-ledger, Milestone 1 adds VoteDelegation: an SV pre-authorizes a separate voter party. There is no Daml-level split of operational versus governance votes; who can vote is enforced in the UI, with Scan as the audit trail.
>
> I’ll connect a CIP-103 wallet as the delegated voter on a non-SV participant, create a proposal in the standalone dApp, verify it through Scan, and cast on a separate open proposal through the same wallet gateway.”

---

## Beat 1 — Connect delegated wallet (~45 s)

1. Focus the standalone dApp (`http://localhost:5173/governance/proposals`).
2. Click **Connect wallet** and approve the CIP-103 session.
3. Briefly show the toolbar party is `voterParty`, not the SV party.
4. Optional: show the gateway account/participant mapping proving this party is hosted away from the SV node.

**Say:**

> “The connected wallet controls the delegated voter party on a non-SV participant. The delegating SV remains the governance identity recorded on requests and ballots. The separate participant hosting is the identity separation this milestone proves.”

---

## Beat 2 — Create and sign a vote request (~90 s)

1. Expand **Create Vote Request**.
2. Choose **Update Super Validator Reward Weight** (or another rehearsed harmless LocalNet action) and complete the action, expiry/effectivity, summary, and URL fields.
   - Checking **Set a specific effective time** (comfortably after the voting deadline) is **required** on stock LocalNet: with one SV the requester's automatic Accept meets the threshold instantly, and a request without a future effective time executes immediately and lands under **Executed**.
3. Click **Review request** and show the confirmation payload.
4. Click **Confirm and sign**, then approve the wallet prompt.
5. Show the new request under **In Progress** after Scan refreshes.

**Say:**

> “Creation uses VoteDelegation_RequestVote, relaying DsoRules_RequestVote with requester equal to the delegating SV and voterParty equal to this wallet. No SV Admin OIDC is involved.
>
> DsoRules automatically records the requester’s Accept vote, so this new request correctly appears In Progress. I’ll use a separate request from another SV for the clean cast demonstration.”

---

## Beat 3 — Verify creation and select the cast request (~45 s)

1. Focus **this dApp** (`http://localhost:5173/governance/proposals`).
2. Open the newly created request under **In Progress**.
3. Briefly show its action, expiry, and automatic requester Accept vote.
4. Return to the list and select the pre-seeded request under **Action Needed**.

**Say:**

> “Reads come from Scan, not the SV Admin OpenAPI — what an external voter sees without operator OIDC. This second request was seeded to represent a peer SV’s open proposal — this SV has not voted on it yet, so it appears under Action Needed.”

Optional cutaway: Scan UI showing the same request (`http://scan.localhost:4000/governance`).

---

## Beat 4 — CIP-103 cast (~90 s)

1. From **Action Needed**, open the seeded request → start vote (Accept or Reject).
2. Enter a short reason (and URL if the form requires it).
3. Confirm in the dApp dialog.
4. **Switch to / show wallet approval UI** — approve the signature.
5. Wait for success alert in the dApp.
6. Show updated “your vote” on the request (highlighting uses the **SV** party; the wallet signed as `voterParty`).

**Say:**

> “Submit builds a VoteDelegation_CastVote that relays DsoRules_CastVote with vote.sv equal to the delegating SV. The wallet signs via prepareExecute — no SV Admin cast, no operator OIDC.
>
> One vote per SV is preserved: the recorded ballot still belongs to the SV; the delegated party only authorizes the exercise.”

If the wallet prompt is slow: stay on it and narrate — don’t cut back early.

---

## Beat 5 — Prove the result (~30 s)

1. Refresh list or reopen detail if needed.
2. Optional: Scan UI governance page (`http://scan.localhost:4000/governance`) showing the same request and the SV’s ballot.
3. Optional: **Disconnect** wallet → toolbar returns to Connect (shows session is real).

**Say:**

> “Same result is visible through Scan. End-to-end: proposal creation and a separate first-time cast were both externally signed by the delegated voter on a non-SV participant and recorded on LocalNet.”

---

## Close (~15 s)

> “Milestone 2 proof on LocalNet: CIP-103 wallet connect, VoteDelegation-backed request and cast, confirming participant not the SV node. Not a MainNet claim — packaging and operator binding are later milestones.”

**Stop recording.**

---

## Timing

| Beat                         | Approx.    |
| ---------------------------- | ---------- |
| Cold open                    | 0:20       |
| Connect wallet               | 0:45       |
| Create + wallet approve      | 1:30       |
| Verify + select cast request | 0:45       |
| Cast + wallet approve        | 1:30       |
| Result + close               | 0:45       |
| **Total**                    | **~5 min** |

---

## Optional B-roll (insert offline if needed)

- Terminal: `curl` Scan `/v0/dso` showing `sv_party_id` (no secrets).
- Diagram lines: `VoteDelegation_RequestVote → DsoRules_RequestVote (requester = SV)` and `VoteDelegation_CastVote → DsoRules_CastVote (vote.sv = SV)`.
- Toolbar party id next to env note that `VITE_SV_PARTY_ID` is the SV (no need to show full `.env`).

---

## Do not say on camera

- That operational / governance / fixed **field classification** is live in Daml (grant text ≠ current M1 impl).
- That Splice `wallet.localhost` **is** the CIP-103 gateway.
- That request creation or casting uses **SV Admin / operator OIDC**.
- Anything implying MainNet, TestNet, or real funds.
- “Workaround” or “stub” language — this take is the real path.

---

## Pre-record checklist

- [ ] LocalNet healthy; VoteDelegation DAR loaded
- [ ] `VoteDelegation` exists; CID in `VITE_VOTE_DELEGATION_CID`
- [ ] `voterParty` on app-user (non-SV); gateway pointed there
- [ ] Cast target seeded per runbook 0.3 and visible under Action Needed
- [ ] `.env`: live Scan, gateway URL, `VITE_SV_PARTY_ID`, delegation (+ DsoRules) CIDs
- [ ] Practice delegated request and cast both succeeded once
- [ ] Notifications muted; script on second screen
- [ ] You know Accept vs Reject for this take
