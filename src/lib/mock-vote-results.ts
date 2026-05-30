// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import voteResultsFixture from '@/__fixtures__/scan-vote-results.json';
import { listVoteRequestResults } from '@/lib/scan-client';
import type { ScanListVoteResultsRequest, ScanListVoteResultsResponse } from '@/lib/scan-types';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_VOTES !== 'false';

export async function fetchMockVoteRequestResults(): Promise<ScanListVoteResultsResponse> {
  await Promise.resolve();
  return voteResultsFixture as unknown as ScanListVoteResultsResponse;
}

export async function fetchVoteRequestResults(
  request: ScanListVoteResultsRequest,
): Promise<ScanListVoteResultsResponse> {
  if (USE_MOCK_DATA) {
    const mock = await fetchMockVoteRequestResults();
    if (request.accepted === true) {
      return {
        ...mock,
        dso_rules_vote_results: mock.dso_rules_vote_results.filter(
          (result) => result.outcome.tag === 'VRO_Accepted',
        ),
      };
    }
    if (request.accepted === false) {
      return {
        ...mock,
        dso_rules_vote_results: mock.dso_rules_vote_results.filter(
          (result) => result.outcome.tag !== 'VRO_Accepted',
        ),
      };
    }
    return mock;
  }
  return listVoteRequestResults(request);
}

export { USE_MOCK_DATA as USE_MOCK_VOTE_RESULTS };
