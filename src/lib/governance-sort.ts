// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/governance/ProposalListingSection.tsx
// at commit 8048815509402e52fc218ce43a7707412d648b56. Original: Apache 2.0 (c) Digital Asset

import dayjs from 'dayjs';

import type { ProposalListingItem } from '@/types/governance';

export type ProposalSortOrder = 'effectiveAtAsc' | 'effectiveAtDesc';

const getTotalVotes = (item: ProposalListingItem): number =>
  item.voteStats.accepted + item.voteStats.rejected;

const getEffectiveDate = (item: ProposalListingItem): dayjs.Dayjs =>
  item.voteTakesEffect === 'Threshold' ? dayjs(0) : dayjs(item.voteTakesEffect);

/** Stable sort for governance proposal listing rows. */
export function sortProposals(
  data: readonly ProposalListingItem[],
  sortOrder?: ProposalSortOrder,
): readonly ProposalListingItem[] {
  if (sortOrder === undefined) {
    return data;
  }

  const copy = [...data];

  if (sortOrder === 'effectiveAtDesc') {
    return copy.sort((a, b) => dayjs(b.voteTakesEffect).diff(dayjs(a.voteTakesEffect)));
  }

  return copy
    .sort((a, b) => dayjs(a.votingThresholdDeadline).diff(dayjs(b.votingThresholdDeadline)))
    .sort((a, b) => getTotalVotes(b) - getTotalVotes(a))
    .sort((a, b) => getEffectiveDate(a).diff(getEffectiveDate(b)));
}
