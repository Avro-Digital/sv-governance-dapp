// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useQuery } from '@tanstack/react-query';

import { getMockActionRequiredItems } from '@/lib/mock-proposals';
import { useIdentityStore } from '@/stores/identity';
import type { ActionRequiredItem } from '@/types/governance';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_VOTES !== 'false';

async function fetchActionRequired(partyId: string): Promise<readonly ActionRequiredItem[]> {
  await Promise.resolve();
  if (!USE_MOCK_DATA) {
    return [];
  }
  return getMockActionRequiredItems(partyId);
}

export function useActionRequired() {
  const partyId = useIdentityStore((state) => state.identity.partyId);

  return useQuery({
    queryKey: ['actionRequired', partyId, USE_MOCK_DATA],
    queryFn: () => fetchActionRequired(partyId),
  });
}
