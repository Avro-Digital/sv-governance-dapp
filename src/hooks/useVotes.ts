// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useQuery } from '@tanstack/react-query';

import { useGovernanceSnapshot } from '@/hooks/useGovernanceSnapshot';
import { splitVoteRequestsForSv, toProposalListingItem } from '@/lib/governance-transform';
import { MOCK_PROPOSAL_LISTINGS } from '@/lib/mock-proposals';
import { useIdentityStore } from '@/stores/identity';
import type { ProposalListingItem } from '@/types/governance';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_VOTES !== 'false';

async function fetchVoteListings(): Promise<readonly ProposalListingItem[]> {
  await Promise.resolve();
  return MOCK_PROPOSAL_LISTINGS;
}

/**
 * Lists inflight governance proposals the connected SV has already voted on.
 * Mirrors Splice governance page "Inflight Votes" section.
 */
export function useVotes() {
  const partyId = useIdentityStore((state) => state.identity.partyId);
  const snapshotQuery = useGovernanceSnapshot();

  const mockQuery = useQuery({
    queryKey: ['listDsoRulesVoteRequests', USE_MOCK_DATA],
    queryFn: fetchVoteListings,
    enabled: USE_MOCK_DATA,
  });

  if (USE_MOCK_DATA) {
    return mockQuery;
  }

  return {
    ...snapshotQuery,
    data:
      snapshotQuery.data !== undefined
        ? splitVoteRequestsForSv(snapshotQuery.data.voteRequests, partyId).inflight.map(
            (contract) => toProposalListingItem(contract, snapshotQuery.data.dsoInfo, partyId),
          )
        : undefined,
  };
}
