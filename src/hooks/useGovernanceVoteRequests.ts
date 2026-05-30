// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useMemo } from 'react';

import { useGovernanceSnapshot } from '@/hooks/useGovernanceSnapshot';
import { splitVoteRequestsForSv } from '@/lib/governance-transform';
import type { ScanVoteRequestContract } from '@/lib/scan-types';
import { useIdentityStore } from '@/stores/identity';

function sortVoteRequestsNewestFirst(
  voteRequests: readonly ScanVoteRequestContract[],
): readonly ScanVoteRequestContract[] {
  return [...voteRequests].sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0));
}

export function useGovernanceVoteRequests() {
  const partyId = useIdentityStore((state) => state.identity.partyId);
  const snapshotQuery = useGovernanceSnapshot();

  const sortedRequests = useMemo(
    () =>
      snapshotQuery.data !== undefined
        ? sortVoteRequestsNewestFirst(snapshotQuery.data.voteRequests)
        : undefined,
    [snapshotQuery.data],
  );

  const split = useMemo(() => {
    if (sortedRequests === undefined) {
      return undefined;
    }
    return splitVoteRequestsForSv(sortedRequests, partyId);
  }, [sortedRequests, partyId]);

  return {
    isLoading: snapshotQuery.isLoading,
    isError: snapshotQuery.isError,
    error: snapshotQuery.error,
    dsoInfo: snapshotQuery.data?.dsoInfo,
    voteRequests: sortedRequests ?? [],
    actionNeeded: split?.actionRequired ?? [],
    inProgress: split?.inflight ?? [],
    svPartyId: partyId,
  };
}
