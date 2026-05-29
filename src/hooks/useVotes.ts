// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useQuery } from '@tanstack/react-query';

import type { ProposalListingItem } from '@/types/governance';

/** Mock data until Splice `ProposalListingSection` extraction + ledger wiring. */
const MOCK_PROPOSALS: readonly ProposalListingItem[] = [];

async function fetchVoteListings(): Promise<readonly ProposalListingItem[]> {
  await Promise.resolve();
  return MOCK_PROPOSALS;
}

/**
 * Lists pending governance proposals.
 * Will mirror Splice `useListDsoRulesVoteRequests` + listing transforms.
 */
export function useVotes() {
  return useQuery({
    queryKey: ['listDsoRulesVoteRequests'],
    queryFn: fetchVoteListings,
  });
}
