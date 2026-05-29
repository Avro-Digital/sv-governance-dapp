// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import type {
  ActionRequiredItem,
  ProposalDetailView,
  ProposalListingItem,
  ProposalVote,
} from '@/types/governance';

const MOCK_SV_PARTY = 'mock-sv-party::1220abcd';
const OTHER_SV_1 = 'sv-other-1::1220aaaa';
const OTHER_SV_2 = 'sv-other-2::1220bbbb';

const MOCK_VOTES_REWARD_WEIGHT: readonly ProposalVote[] = [
  { sv: OTHER_SV_1, vote: 'accepted', reason: { url: 'https://example.com/v1', body: 'Supports rebalancing.' } },
  { sv: OTHER_SV_2, vote: 'rejected', reason: { url: '', body: 'Weight increase too aggressive.' } },
  { sv: MOCK_SV_PARTY, isYou: true, vote: 'no-vote' },
  { sv: 'sv-other-3::1220cccc', vote: 'no-vote' },
];

const MOCK_VOTES_FEATURE_APP: readonly ProposalVote[] = [
  {
    sv: MOCK_SV_PARTY,
    isYou: true,
    vote: 'accepted',
    reason: { url: 'https://example.com/v2', body: 'Provider meets criteria.' },
  },
  { sv: OTHER_SV_1, vote: 'accepted', reason: { url: '', body: 'Approved.' } },
  { sv: OTHER_SV_2, vote: 'no-vote' },
];

/** Dev mock listings until ledger / SV Admin API is wired. */
export const MOCK_PROPOSAL_LISTINGS: readonly ProposalListingItem[] = [
  {
    contractId: 'mock-vote-request::1220abc11111111',
    actionName: 'Update Super Validator Reward Weight',
    description: 'Increase reward weight for sv-example-1 from 1.0 to 1.2',
    votingThresholdDeadline: '2026-06-01T12:00:00Z',
    voteTakesEffect: 'Threshold',
    yourVote: 'no-vote',
    status: 'In Progress',
    voteStats: { accepted: 8, rejected: 1, 'no-vote': 4 },
    acceptanceThreshold: 9n,
  },
  {
    contractId: 'mock-vote-request::1220abc22222222',
    actionName: 'Feature Application',
    description: 'Grant featured app rights to provider::1220def',
    votingThresholdDeadline: '2026-06-15T08:00:00Z',
    voteTakesEffect: '2026-06-20T00:00:00Z',
    yourVote: 'accepted',
    status: 'In Progress',
    voteStats: { accepted: 5, rejected: 2, 'no-vote': 6 },
    acceptanceThreshold: 9n,
  },
];

export const MOCK_PROPOSAL_DETAILS: Readonly<Record<string, ProposalDetailView>> = {
  'mock-vote-request::1220abc11111111': {
    contractId: 'mock-vote-request::1220abc11111111',
    proposalDetails: {
      actionName: 'Update Super Validator Reward Weight',
      summary: 'Increase reward weight for sv-example-1 from 1.0 to 1.2',
      url: 'https://github.com/canton-foundation/canton-dev-fund/issues/287',
      isVoteRequest: true,
      action: 'SRARC_UpdateSvRewardWeight',
      proposal: {
        svToUpdate: 'sv-example-1::1220feed',
        currentWeight: '1.0',
        weightChange: '1.2',
      },
    },
    votingInformation: {
      requester: 'sv-requester::1220req1',
      votingThresholdDeadline: '2026-06-01T12:00:00Z',
      voteTakesEffect: 'Threshold',
      status: 'In Progress',
    },
    votes: MOCK_VOTES_REWARD_WEIGHT,
  },
  'mock-vote-request::1220abc22222222': {
    contractId: 'mock-vote-request::1220abc22222222',
    proposalDetails: {
      actionName: 'Feature Application',
      summary: 'Grant featured app rights to provider::1220def',
      url: 'https://github.com/canton-foundation/canton-dev-fund/pull/223',
      isVoteRequest: true,
      action: 'SRARC_GrantFeaturedAppRight',
      proposal: {
        provider: 'provider::1220def',
      },
    },
    votingInformation: {
      requester: 'sv-requester::1220req2',
      votingThresholdDeadline: '2026-06-15T08:00:00Z',
      voteTakesEffect: '2026-06-20T00:00:00Z',
      status: 'In Progress',
    },
    votes: MOCK_VOTES_FEATURE_APP,
  },
};

export function getMockProposalDetail(contractId: string): ProposalDetailView | undefined {
  return MOCK_PROPOSAL_DETAILS[contractId];
}

export function getMockActionRequiredItems(_currentSvPartyId: string): readonly ActionRequiredItem[] {
  return MOCK_PROPOSAL_LISTINGS.filter((item) => item.yourVote === 'no-vote').map((item) => ({
    contractId: item.contractId,
    actionName: item.actionName,
    description: item.description ?? item.actionName,
    votingCloses: item.votingThresholdDeadline,
    createdAt: '2026-05-20T10:00:00Z',
    requester: 'sv-requester::1220req1',
    isYou: false,
  }));
}

export { MOCK_SV_PARTY };
