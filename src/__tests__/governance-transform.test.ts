// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { describe, expect, it } from 'vitest';

import voteRequestsFixture from '@/__fixtures__/scan-vote-requests.json';
import {
  computeYourVote,
  getActionName,
  getVoteRequestContractId,
  getVoteResultStatus,
  parseVoteEntries,
  splitVoteRequestsForSv,
  toProposalDetailView,
  toProposalListingItem,
} from '@/lib/governance-transform';
import { findVoteRequestInSnapshot, getVoteRequestRouteId } from '@/lib/scan-client';
import type { ScanDsoInfoResponse, ScanListVoteRequestsResponse } from '@/lib/scan-types';

const SV_PARTY =
  'sv::12200b234519c3471f6a93e6988514c1bf20d615b795d28dd4fa0257039a65eb1cc5';

const mockDsoInfo: ScanDsoInfoResponse = {
  sv_user: 'ledger-api-user',
  sv_party_id: SV_PARTY,
  dso_party_id: 'DSO::1220da5bac6c651bdfab7b30576137b864ba7a1f82cdd0f38c72e231db38b70b1be7',
  voting_threshold: 1,
  dso_rules: {
    contract: {
      payload: {
        svs: [
          [
            SV_PARTY,
            {
              name: 'sv',
              svRewardWeight: '10000',
              participantId: `PAR::${SV_PARTY}`,
            },
          ],
        ],
      },
    },
  },
};

const voteRequest = (voteRequestsFixture as unknown as ScanListVoteRequestsResponse)
  .dso_rules_vote_requests[0]!;

describe('governance-transform', () => {
  it('maps a Scan VoteRequest to a listing row', () => {
    const listing = toProposalListingItem(voteRequest, mockDsoInfo, SV_PARTY);

    expect(listing.actionName).toBe('Update Super Validator Reward Weight');
    expect(listing.yourVote).toBe('accepted');
    expect(listing.voteStats.accepted).toBe(1);
    expect(listing.acceptanceThreshold).toBe(1n);
  });

  it('splits inflight vs action required by SV vote', () => {
    const split = splitVoteRequestsForSv([voteRequest], SV_PARTY);

    expect(split.inflight).toHaveLength(1);
    expect(split.actionRequired).toHaveLength(0);

    const otherSplit = splitVoteRequestsForSv([voteRequest], 'other-sv::1220dead');
    expect(otherSplit.inflight).toHaveLength(0);
    expect(otherSplit.actionRequired).toHaveLength(1);
  });

  it('builds proposal detail with vote tab data', () => {
    const detail = toProposalDetailView(voteRequest, mockDsoInfo, SV_PARTY);

    expect(detail.proposalDetails.action).toBe('SRARC_UpdateSvRewardWeight');
    expect(detail.proposalDetails.summary).toBe('Update for funzies');
    expect(detail.votes).toHaveLength(1);
    expect(detail.votes[0]?.vote).toBe('accepted');
  });

  it('computes your vote from payload votes', () => {
    const votes = parseVoteEntries(voteRequest.payload.votes);
    expect(computeYourVote(votes, SV_PARTY)).toBe('accepted');
    expect(computeYourVote(votes, 'missing::1220')).toBe('no-vote');
  });

  it('uses tracking CID for route ids when present', () => {
    const tracked = {
      ...voteRequest,
      payload: { ...voteRequest.payload, trackingCid: 'tracking-cid::1220abc' },
    };
    expect(getVoteRequestContractId(tracked)).toBe('tracking-cid::1220abc');
    expect(findVoteRequestInSnapshot('tracking-cid::1220abc', [tracked])).toBe(tracked);
    expect(getVoteRequestRouteId(tracked)).toBe('tracking-cid::1220abc');
  });

  it('maps unknown action tags to unsupported detail shape', () => {
    const unknownAction = {
      ...voteRequest,
      payload: {
        ...voteRequest.payload,
        action: {
          tag: 'ARC_AmuletRules',
          value: {
            amuletRulesAction: {
              tag: 'CRARC_AddFutureAmuletConfigSchedule',
              value: {},
            },
          },
        },
      },
    };

    expect(getActionName(unknownAction.payload.action)).toBe('CRARC_AddFutureAmuletConfigSchedule');

    const detail = toProposalDetailView(unknownAction, mockDsoInfo, SV_PARTY);
    expect(detail.proposalDetails.action).toBe('unsupported');
    if (detail.proposalDetails.action === 'unsupported') {
      expect(detail.proposalDetails.rawActionTag).toBe('CRARC_AddFutureAmuletConfigSchedule');
    }
  });

  it('maps vote result outcomes to listing status', () => {
    expect(getVoteResultStatus({ tag: 'VRO_Rejected' })).toBe('Rejected');
    expect(getVoteResultStatus({ tag: 'VRO_Expired' })).toBe('Expired');
    expect(
      getVoteResultStatus({
        tag: 'VRO_Accepted',
        value: { effectiveAt: '2020-01-01T00:00:00Z' },
      }),
    ).toBe('Implemented');
  });
});
