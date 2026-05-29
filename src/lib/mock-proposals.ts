// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import type { ProposalListingItem } from '@/types/governance';

/** Dev mock data until ledger / SV Admin API is wired. */
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
