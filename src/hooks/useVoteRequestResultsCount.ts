// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/hooks/useVoteRequestResultsCount.ts
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import { useQuery } from '@tanstack/react-query';

import { fetchMockVoteRequestResults, USE_MOCK_VOTE_RESULTS } from '@/lib/mock-vote-results';
import { countVoteRequestResults } from '@/lib/scan-client';

/**
 * Total closed vote results for the Vote History badge: implemented accepted
 * results plus all non-accepted (rejected/expired) results. Resolves `null`
 * when the Scan instance does not expose the count endpoint yet, letting the
 * page fall back to the number of loaded history rows.
 */
export function useVoteRequestResultsCount() {
  return useQuery({
    queryKey: ['voteRequestResultsCount', USE_MOCK_VOTE_RESULTS],
    queryFn: async (): Promise<number | null> => {
      if (USE_MOCK_VOTE_RESULTS) {
        const mock = await fetchMockVoteRequestResults();
        return mock.dso_rules_vote_results.length;
      }

      const [effective, notAccepted] = await Promise.all([
        countVoteRequestResults({ accepted: true, effectiveTo: new Date().toISOString() }),
        countVoteRequestResults({ accepted: false }),
      ]);

      if (effective === null || notAccepted === null) {
        return null;
      }
      return effective + notAccepted;
    },
  });
}
