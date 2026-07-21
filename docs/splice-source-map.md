# Splice source map

Canonical repo: [canton-network/splice](https://github.com/canton-network/splice) (local: `../splice`).

Governance UI lives in `apps/sv/frontend/`. Route: `/governance` (`src/routes/governance.tsx`).

## Extraction targets

| Priority | This repo | Splice path | Notes |
| --- | --- | --- | --- |
| 1 | `src/routes/VoteList.tsx`, `src/components/votes/ListVoteRequests.tsx` | `apps/common/frontend/src/components/votes/ListVoteRequests.tsx` | Done — tabbed Vote Requests UX |
| 2 | `src/routes/VoteDetail.tsx` | `VoteModalContent` + `VoteRequestModalView` | Done — deep link matches modal |
| 3 | `src/components/governance/ProposalVoteForm.tsx` | `components/governance/ProposalVoteForm.tsx` | Done — shell wired to `useCastVote` |
| 4 | `src/routes/VoteList.tsx` | `components/governance/ActionRequiredSection.tsx` | Done — items with `yourVote: no-vote` |
| — | `src/types/governance.ts` | `utils/types.ts` | `ProposalListingData`, `ProposalVote`, `CastVoteArgs` shapes |
| — | `src/lib/sv-admin.ts` | `contexts/SvAdminServiceContext.tsx` | Reference only — not used at runtime |
| — | Governance helpers | `utils/governance.ts` | Ported to `src/lib/governance-transform.ts` (Scan JSON, not DAML.js) |

## UI pivot (post M2.4)

M2.3 extracted the **governance dashboard** table (`ProposalListingSection` from `routes/governance.tsx`). The canonical **Vote Requests** UX in your reference screenshots comes from a different Splice surface:

| Reference UX | Splice source | Status |
| --- | --- | --- |
| Tabbed list (Action Needed / In Progress / …) | `apps/common/frontend/src/components/votes/ListVoteRequests.tsx` | Done — [AVR-2481](https://linear.app/avro-digital/issue/AVR-2481) |
| Executed / Rejected tabs | `VoteResultsFilterTable.tsx` + Scan vote results | Done |
| Vote history section | `apps/sv/frontend/src/routes/governance.tsx` | Done — `ProposalListingSection` below tabs |
| Splice dark theme | `apps/common/frontend/src/theme/` | Done |
| Config diff accordion | `PrettyJsonDiff` + `JsonDiffAccordion` in modal `ActionView` | Done — `SRARC_SetConfig` |
| DataGrid rows (Tracking Id, Requester, dates) | `apps/common/frontend/src/components/votes/VoteRequestFilterTable.tsx` | Done — `@mui/x-data-grid` |
| Detail modal | `apps/common/frontend/src/components/votes/VoteModalContent.tsx` + `VoteForm.tsx` | Done — Splice layout + config diff accordion |
| Legacy vote route | `apps/sv/frontend/src/components/votes/VoteRequest.tsx` | Wrapper around `ListVoteRequests` |

The M2.4 Scan data layer (`scan-client`, `governance-transform`, hooks) feeds the lifted `ListVoteRequests` + modal stack on `/votes`.

## July 2026 redesign (current)

Upstream replaced the tabbed `/votes` surface with full-page routes. This dApp follows suit
(AVR-2471); the `components/votes/` tree was removed:

| Reference UX | Splice source | This repo |
| --- | --- | --- |
| Governance list page | `apps/sv/frontend/src/routes/governance.tsx` | `src/routes/Governance.tsx` on `/governance/proposals` |
| Proposal details page | `apps/sv/frontend/src/routes/voteRequestDetails.tsx` | `src/routes/ProposalDetails.tsx` on `/governance/proposals/:contractId` |
| Create-proposal flow | `apps/sv/frontend/src/routes/createProposal.tsx` + `components/forms/` | `src/routes/CreateProposal.tsx`, `src/components/forms/` |

Legacy `/votes` and `/votes/:id` URLs redirect to the new routes.

Log each extraction in [`splice-extraction-log.md`](./splice-extraction-log.md).
