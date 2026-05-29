// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ProposalListingSection } from '@/components/governance/ProposalListingSection';
import { MOCK_PROPOSAL_LISTINGS } from '@/lib/mock-proposals';

describe('ProposalListingSection', () => {
  it('renders empty state message', () => {
    render(
      <MemoryRouter>
        <ProposalListingSection
          sectionTitle="Inflight Votes"
          data={[]}
          noDataMessage="No inflight votes"
          uniqueId="inflight-votes"
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('No inflight votes')).toBeInTheDocument();
  });

  it('renders proposal rows from mock data', () => {
    render(
      <MemoryRouter>
        <ProposalListingSection
          sectionTitle="Inflight Votes"
          data={MOCK_PROPOSAL_LISTINGS}
          noDataMessage="No inflight votes"
          uniqueId="inflight-votes"
          showVoteStats
        />
      </MemoryRouter>,
    );

    expect(screen.getByText('Update Super Validator Reward Weight')).toBeInTheDocument();
    expect(screen.getByText('Feature Application')).toBeInTheDocument();
  });
});
