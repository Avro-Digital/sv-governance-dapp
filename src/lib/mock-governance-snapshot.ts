// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import voteRequestsFixture from '@/__fixtures__/scan-vote-requests.json';
import type { GovernanceSnapshot, ScanListVoteRequestsResponse } from '@/lib/scan-types';

const MOCK_SV_PARTY =
  'sv::12200b234519c3471f6a93e6988514c1bf20d615b795d28dd4fa0257039a65eb1cc5';

/** Mock Scan snapshot for tests and VITE_USE_MOCK_VOTES=true. */
export async function fetchMockGovernanceSnapshot(): Promise<GovernanceSnapshot> {
  await Promise.resolve();

  const fixture = voteRequestsFixture as unknown as ScanListVoteRequestsResponse;

  return {
    dsoInfo: {
      sv_user: 'ledger-api-user',
      sv_party_id: MOCK_SV_PARTY,
      dso_party_id: 'DSO::1220da5bac6c651bdfab7b30576137b864ba7a1f82cdd0f38c72e231db38b70b1be7',
      voting_threshold: 1,
      dso_rules: {
        contract: {
          payload: {
            svs: [
              [
                MOCK_SV_PARTY,
                {
                  name: 'sv',
                  svRewardWeight: '10000',
                  participantId: `PAR::${MOCK_SV_PARTY}`,
                },
              ],
            ],
          },
        },
      },
    },
    voteRequests: fixture.dso_rules_vote_requests,
  };
}

export { MOCK_SV_PARTY as MOCK_SCAN_SV_PARTY };
