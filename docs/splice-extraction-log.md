# Splice extraction log

Record each UI or logic extraction from the [Splice SV operator app](https://github.com/digital-asset/splice).

| Date | Splice path | Splice commit SHA | Target file in this repo | Notes |
| --- | --- | --- | --- | --- |
| 2026-05-28 | `apps/sv/frontend/src/components/governance/ProposalListingSection.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/governance/ProposalListingSection.tsx` | Route `/votes/:id`; light-theme hover |
| 2026-05-28 | `apps/sv/frontend/src/components/beta/VoteStats.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/governance/VoteStats.tsx` | Named export |
| 2026-05-28 | `apps/sv/frontend/src/components/beta/PageSectionHeader.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/governance/PageSectionHeader.tsx` | Named export |
| 2026-05-28 | `apps/sv/frontend/src/components/beta/CopyableIdentifier.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/governance/CopyableIdentifier.tsx` | Monospace font vs Source Code Pro |
| 2026-05-28 | `apps/sv/frontend/src/components/governance/ProposalDetailsContent.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/governance/ProposalDetailsContent.tsx` | Config/JSON diff deferred |
| 2026-05-28 | `apps/sv/frontend/src/components/governance/ActionRequiredSection.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/governance/ActionRequiredSection.tsx` | Route `/votes/:id` |
| 2026-05-28 | `apps/sv/frontend/src/components/governance/ProposalVoteForm.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/governance/ProposalVoteForm.tsx` | useState form; `useCastVote` stub |
| 2026-05-28 | `apps/sv/frontend/src/components/governance/proposal-details/DetailItem.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/governance/DetailItem.tsx` | |
| 2026-05-28 | `apps/sv/frontend/src/components/governance/ConfigValuesChanges.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/governance/ConfigValuesChanges.tsx` | No PartyId component |
| 2026-05-28 | `apps/sv/frontend/src/components/beta/CopyableUrl.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/governance/CopyableUrl.tsx` | |
| 2026-05-28 | `apps/sv/frontend/src/components/beta/MemberIdentifier.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/governance/MemberIdentifier.tsx` | |
| 2026-05-30 | Scan API vote reads (new, not lifted) | localnet fixture | `src/lib/scan-client.ts`, `governance-transform.ts`, hooks | M2.4 — data layer; UI pivot to `ListVoteRequests` tracked in AVR-2481 |
| 2026-05-30 | `apps/common/frontend/src/components/votes/ListVoteRequests.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/votes/ListVoteRequests.tsx` | Tabbed list + modal; Executed/Rejected tabs deferred |
| 2026-05-30 | `apps/common/frontend/src/components/votes/VoteRequestFilterTable.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/votes/VoteRequestsFilterTable.tsx` | DataGrid wired to Scan snapshot |
| 2026-05-30 | `apps/common/frontend/src/components/DateDisplay.tsx`, `CopyableTypography.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/votes/DateDisplay.tsx`, `CopyableTypography.tsx` | |
| 2026-05-30 | `apps/common/frontend/src/components/votes/VoteModalContent.tsx`, `ActionView.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/votes/VoteModalContent.tsx`, `ActionView.tsx`, `ActionValueTable.tsx` | Minimal ActionView subset; config diff accordion deferred |
| 2026-05-30 | `apps/common/frontend/src/components/DateWithDurationDisplay.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/votes/DateWithDurationDisplay.tsx` | dayjs only (no date-fns dep) |
| 2026-05-30 | `apps/sv/frontend/src/components/votes/VoteForm.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/votes/VoteForm.tsx` | Edit/save flow; `useCastVote` stub until M2.5+ |
| 2026-05-30 | `apps/common/frontend/src/theme/` | `8048815509402e52fc218ce43a7707412d648b56` | `src/theme/index.ts`, `utils.ts` | Splice dark theme; Inter via `@fontsource/inter` |
| 2026-05-30 | `apps/common/frontend/src/components/PrettyJsonDiff.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/governance/PrettyJsonDiff.tsx`, `JsonDiffAccordion.tsx` | Generic JSON configs (no DAML.js) |
| 2026-05-30 | `apps/common/frontend/src/components/votes/VoteResultsFilterTable.tsx` | `8048815509402e52fc218ce43a7707412d648b56` | `src/components/votes/VoteResultsFilterTable.tsx` | Scan `POST /v0/admin/sv/voteresults` |
| 2026-05-30 | `apps/sv/frontend/src/routes/governance.tsx` (Vote History) | `8048815509402e52fc218ce43a7707412d648b56` | `ProposalListingSection` on `/votes` | Infinite scroll via `useVoteHistoryListing` |
