// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Mirrors apps/sv/frontend/src/hooks/useVoteRequestResultByCid.ts behaviour on Scan data:
// resolve an open VoteRequest first, then fall back to closed vote results.

import { useQuery } from '@tanstack/react-query';

import { useGovernanceSnapshot } from '@/hooks/useGovernanceSnapshot';
import { useIdentityStore } from '@/stores/identity';
import { toClosedProposalDetailView, toProposalDetailView } from '@/lib/governance-transform';
import { fetchVoteRequestResults } from '@/lib/mock-vote-results';
import {
  findVoteRequestInSnapshot,
  getClosedVoteResultRowId,
  resolveVoteRequest,
} from '@/lib/scan-client';
import type { GovernanceSnapshot } from '@/lib/scan-types';
import type { ProposalDetailView } from '@/types/governance';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_VOTES !== 'false';

/** Scan vote-results pages are capped at 500; sufficient for detail lookups. */
const RESULTS_LOOKUP_LIMIT = 500;

async function fetchProposalDetails(
  routeId: string,
  snapshot: GovernanceSnapshot,
  svPartyId: string,
): Promise<ProposalDetailView | null> {
  const openContract = USE_MOCK_DATA
    ? findVoteRequestInSnapshot(routeId, snapshot.voteRequests)
    : ((await resolveVoteRequest(routeId, snapshot.voteRequests)) ?? undefined);

  if (openContract !== undefined) {
    return toProposalDetailView(openContract, snapshot.dsoInfo, svPartyId);
  }

  const results = await fetchVoteRequestResults({ limit: RESULTS_LOOKUP_LIMIT });
  const closed = results.dso_rules_vote_results.find(
    (result) =>
      result.request.trackingCid === routeId || getClosedVoteResultRowId(result) === routeId,
  );

  if (closed !== undefined) {
    return toClosedProposalDetailView(closed, snapshot.dsoInfo, svPartyId);
  }

  return null;
}

export function useProposalDetails(contractId: string) {
  const decodedId = decodeURIComponent(contractId);
  const partyId = useIdentityStore((state) => state.identity.partyId);
  const snapshotQuery = useGovernanceSnapshot();

  const detailQuery = useQuery({
    queryKey: ['voteRequestDetail', decodedId, partyId, snapshotQuery.dataUpdatedAt],
    queryFn: () => {
      if (snapshotQuery.data === undefined) {
        throw new Error('Governance snapshot not loaded');
      }
      return fetchProposalDetails(decodedId, snapshotQuery.data, partyId);
    },
    enabled: decodedId.length > 0 && snapshotQuery.data !== undefined,
  });

  return {
    ...detailQuery,
    isLoading: snapshotQuery.isLoading || detailQuery.isLoading,
    isError: snapshotQuery.isError || detailQuery.isError,
    error: snapshotQuery.error ?? detailQuery.error,
    svPartyId: partyId,
  };
}
