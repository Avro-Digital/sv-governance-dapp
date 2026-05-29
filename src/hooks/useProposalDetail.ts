// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useQuery } from '@tanstack/react-query';

import { getMockProposalDetail } from '@/lib/mock-proposals';
import type { ProposalDetailView } from '@/types/governance';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_VOTES !== 'false';

async function fetchProposalDetail(contractId: string): Promise<ProposalDetailView | null> {
  await Promise.resolve();
  if (!USE_MOCK_DATA) {
    return null;
  }
  return getMockProposalDetail(contractId) ?? null;
}

export function useProposalDetail(contractId: string) {
  const decodedId = decodeURIComponent(contractId);

  return useQuery({
    queryKey: ['proposalDetail', decodedId, USE_MOCK_DATA],
    queryFn: () => fetchProposalDetail(decodedId),
    enabled: decodedId.length > 0,
  });
}
