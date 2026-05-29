// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useQuery } from '@tanstack/react-query';

import { MOCK_PROPOSAL_LISTINGS } from '@/lib/mock-proposals';
import type { ProposalListingItem } from '@/types/governance';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_VOTES !== 'false';

async function fetchVoteListings(): Promise<readonly ProposalListingItem[]> {
  await Promise.resolve();
  return USE_MOCK_DATA ? MOCK_PROPOSAL_LISTINGS : [];
}

/**
 * Lists pending governance proposals.
 * Will mirror Splice `useListDsoRulesVoteRequests` + listing transforms.
 */
export function useVotes() {
  return useQuery({
    queryKey: ['listDsoRulesVoteRequests', USE_MOCK_DATA],
    queryFn: fetchVoteListings,
  });
}
