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
| — | Governance helpers | `utils/governance.ts` | `actionTagToTitle`, `computeVoteStats`, `computeYourVote` |

## Legacy (pre-overhaul) paths

Still present under `components/votes/` — prefer `components/governance/` for new extractions:

- `components/votes/SvListVoteRequests.tsx`
- `components/votes/VoteForm.tsx`

Log each extraction in [`splice-extraction-log.md`](./splice-extraction-log.md).
