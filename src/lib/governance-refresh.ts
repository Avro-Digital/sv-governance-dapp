// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import type { QueryClient } from '@tanstack/react-query';

const GOVERNANCE_QUERY_KEYS: readonly (readonly string[])[] = [
  ['governanceSnapshot'],
  ['actionRequired'],
  ['listDsoRulesVoteRequests'],
  ['voteRequestDetail'],
  ['voteRequestResults'],
];

/** Delay before the follow-up refresh; Scan ingests ledger updates asynchronously. */
const SCAN_INGEST_REFRESH_DELAY_MS = 5_000;

async function invalidateGovernanceQueries(queryClient: QueryClient): Promise<void> {
  await Promise.all(
    GOVERNANCE_QUERY_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  );
}

/**
 * Refreshes all governance reads after a write (request creation or cast):
 * once immediately, and once more after a short delay so views converge even
 * when Scan has not yet ingested the new transaction at the first refetch.
 */
export async function refreshGovernanceData(queryClient: QueryClient): Promise<void> {
  await invalidateGovernanceQueries(queryClient);
  setTimeout(() => {
    void invalidateGovernanceQueries(queryClient);
  }, SCAN_INGEST_REFRESH_DELAY_MS);
}
