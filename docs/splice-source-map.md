# Splice source map

Canonical repo: [canton-network/splice](https://github.com/canton-network/splice) (local: `../splice`).

Governance UI lives in `apps/sv/frontend/`. Route: `/governance` (`src/routes/governance.tsx`).

## Extraction targets

| Priority | This repo | Splice path | Notes |
| --- | --- | --- | --- |
| 1 | `src/routes/VoteList.tsx`, `src/hooks/useVotes.ts` | `components/governance/ProposalListingSection.tsx`, `hooks/useListVoteRequests.tsx` | Done — mock listings |
| 2 | `src/routes/VoteDetail.tsx` | `components/governance/ProposalDetailsContent.tsx`, `routes/voteRequestDetails.tsx` | Done — mock detail by contractId |
| 3 | `src/components/governance/ProposalVoteForm.tsx` | `components/governance/ProposalVoteForm.tsx` | Done — shell wired to `useCastVote` |
| 4 | `src/routes/VoteList.tsx` | `components/governance/ActionRequiredSection.tsx` | Done — items with `yourVote: no-vote` |
| — | `src/types/governance.ts` | `utils/types.ts` | `ProposalListingData`, `ProposalVote`, `CastVoteArgs` shapes |
| — | `src/lib/sv-admin.ts` | `contexts/SvAdminServiceContext.tsx` | Reference only — not used at runtime |
| — | Governance helpers | `utils/governance.ts` | Ported to `src/lib/governance-transform.ts` (Scan JSON, not DAML.js) |

## UI pivot (post M2.4)

M2.3 extracted the **governance dashboard** table (`ProposalListingSection` from `routes/governance.tsx`). The canonical **Vote Requests** UX in your reference screenshots comes from a different Splice surface:

| Reference UX | Splice source | Status |
| --- | --- | --- |
| Tabbed list (Action Needed / In Progress / …) | `apps/common/frontend/src/components/votes/ListVoteRequests.tsx` | **Next extract** — [AVR-2481](https://linear.app/avro-digital/issue/AVR-2481) |
| DataGrid rows (Tracking Id, Requester, dates) | `apps/common/frontend/src/components/votes/VoteRequestFilterTable.tsx` | Depends on `@mui/x-data-grid` |
| Detail modal | `apps/common/frontend/src/components/votes/VoteRequestModalContent.tsx` | Replace route-only detail or offer both |
| Legacy vote route | `apps/sv/frontend/src/components/votes/VoteRequest.tsx` | Wrapper around `ListVoteRequests` |

**Plan:** keep the M2.4 Scan data layer (`scan-client`, `governance-transform`, hooks); swap `VoteList` / `VoteDetail` presentation to lifted `ListVoteRequests` + modal stack, wired to our hooks instead of `useVotesHooks()`.

## Legacy (pre-overhaul) paths

Still present under `components/votes/` — prefer `components/governance/` for new extractions:

- `components/votes/SvListVoteRequests.tsx`
- `components/votes/VoteForm.tsx`

Log each extraction in [`splice-extraction-log.md`](./splice-extraction-log.md).
