// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useQuery } from '@tanstack/react-query';

import { useGovernanceSnapshot } from '@/hooks/useGovernanceSnapshot';
import { fetchMockGovernanceSnapshot } from '@/lib/mock-governance-snapshot';
import { findVoteRequestInSnapshot, resolveVoteRequest } from '@/lib/scan-client';
import type { ScanDsoInfoResponse, ScanVoteRequestContract } from '@/lib/scan-types';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_VOTES !== 'false';

export interface VoteRequestDetail {
  readonly contract: ScanVoteRequestContract;
  readonly dsoInfo: ScanDsoInfoResponse;
}

async function fetchMockVoteRequestDetail(routeId: string): Promise<VoteRequestDetail | null> {
  const snapshot = await fetchMockGovernanceSnapshot();
  const contract = findVoteRequestInSnapshot(routeId, snapshot.voteRequests);
  if (contract === undefined) {
    return null;
  }
  return { contract, dsoInfo: snapshot.dsoInfo };
}

async function fetchLiveVoteRequestDetail(
  routeId: string,
  dsoInfo: ScanDsoInfoResponse,
  knownRequests: readonly ScanVoteRequestContract[],
): Promise<VoteRequestDetail | null> {
  const contract = await resolveVoteRequest(routeId, knownRequests);
  if (contract === null) {
    return null;
  }
  return { contract, dsoInfo };
}

export function useVoteRequestDetail(contractId: string) {
  const decodedId = decodeURIComponent(contractId);
  const snapshotQuery = useGovernanceSnapshot();

  const mockQuery = useQuery({
    queryKey: ['voteRequestDetail', decodedId, USE_MOCK_DATA],
    queryFn: () => fetchMockVoteRequestDetail(decodedId),
    enabled: USE_MOCK_DATA && decodedId.length > 0,
  });

  const liveQuery = useQuery({
    queryKey: ['voteRequestDetail', decodedId, snapshotQuery.dataUpdatedAt],
    queryFn: () => {
      if (snapshotQuery.data === undefined) {
        throw new Error('Governance snapshot not loaded');
      }
      return fetchLiveVoteRequestDetail(
        decodedId,
        snapshotQuery.data.dsoInfo,
        snapshotQuery.data.voteRequests,
      );
    },
    enabled: !USE_MOCK_DATA && decodedId.length > 0 && snapshotQuery.data !== undefined,
  });

  return USE_MOCK_DATA ? mockQuery : liveQuery;
}
