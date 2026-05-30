// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useQuery } from '@tanstack/react-query';

import { useGovernanceSnapshot } from '@/hooks/useGovernanceSnapshot';
import { toProposalDetailView } from '@/lib/governance-transform';
import { getMockProposalDetail } from '@/lib/mock-proposals';
import { lookupDsoRulesVoteRequest } from '@/lib/scan-client';
import type { ScanDsoInfoResponse } from '@/lib/scan-types';
import { useIdentityStore } from '@/stores/identity';
import type { ProposalDetailView } from '@/types/governance';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_VOTES !== 'false';

async function fetchMockProposalDetail(contractId: string): Promise<ProposalDetailView | null> {
  await Promise.resolve();
  return getMockProposalDetail(contractId) ?? null;
}

async function fetchLiveProposalDetail(
  contractId: string,
  dsoInfo: ScanDsoInfoResponse,
  svPartyId: string,
): Promise<ProposalDetailView | null> {
  const contract = await lookupDsoRulesVoteRequest(contractId);
  if (contract === null) {
    return null;
  }
  return toProposalDetailView(contract, dsoInfo, svPartyId);
}

export function useProposalDetail(contractId: string) {
  const decodedId = decodeURIComponent(contractId);
  const partyId = useIdentityStore((state) => state.identity.partyId);
  const snapshotQuery = useGovernanceSnapshot();

  const mockQuery = useQuery({
    queryKey: ['proposalDetail', decodedId, USE_MOCK_DATA],
    queryFn: () => fetchMockProposalDetail(decodedId),
    enabled: USE_MOCK_DATA && decodedId.length > 0,
  });

  const liveQuery = useQuery({
    queryKey: ['proposalDetail', decodedId, partyId, snapshotQuery.dataUpdatedAt],
    queryFn: () => {
      if (snapshotQuery.data === undefined) {
        throw new Error('Governance snapshot not loaded');
      }
      return fetchLiveProposalDetail(decodedId, snapshotQuery.data.dsoInfo, partyId);
    },
    enabled: !USE_MOCK_DATA && decodedId.length > 0 && snapshotQuery.data !== undefined,
  });

  return USE_MOCK_DATA ? mockQuery : liveQuery;
}
