// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useQuery } from '@tanstack/react-query';

import { fetchGovernanceSnapshot, getScanApiBaseUrl } from '@/lib/scan-client';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_VOTES !== 'false';

export function useGovernanceSnapshot() {
  const scanUrl = import.meta.env.VITE_SCAN_URL?.trim() ?? '';

  return useQuery({
    queryKey: ['governanceSnapshot', scanUrl],
    queryFn: fetchGovernanceSnapshot,
    enabled: !USE_MOCK_DATA,
    staleTime: 30_000,
  });
}

export function useScanConfigured(): boolean {
  if (USE_MOCK_DATA) {
    return true;
  }

  try {
    getScanApiBaseUrl();
    return true;
  } catch {
    return false;
  }
}
