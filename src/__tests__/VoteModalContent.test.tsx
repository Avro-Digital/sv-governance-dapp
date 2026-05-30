// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import fixture from '@/__fixtures__/scan-vote-requests.json';
import { VoteModalContent } from '@/components/votes/VoteModalContent';
import type { ScanVoteRequestContract } from '@/lib/scan-types';

const contract = fixture.dso_rules_vote_requests[0] as unknown as ScanVoteRequestContract;

describe('VoteModalContent', () => {
  it('renders Splice-style vote request sections', () => {
    const votes = contract.payload.votes.map(([, vote]) => vote);

    render(
      <VoteModalContent
        voteRequestContractId={contract.contract_id}
        action={contract.payload.action}
        requester={contract.payload.requester}
        getMemberName={() => 'sv'}
        reason={contract.payload.reason}
        voteBefore={new Date(contract.payload.voteBefore)}
        effectiveAt={new Date(contract.payload.targetEffectiveAt ?? '')}
        acceptedVotes={votes.filter((vote) => vote.accept)}
        rejectedVotes={votes.filter((vote) => !vote.accept)}
      />,
    );

    expect(screen.getByText('Requested Action')).toBeInTheDocument();
    expect(screen.getByText('Request Information')).toBeInTheDocument();
    expect(screen.getByText('Votes')).toBeInTheDocument();
    expect(screen.getByText('SRARC_UpdateSvRewardWeight')).toBeInTheDocument();
    expect(screen.getByText('NewWeight')).toBeInTheDocument();
    expect(screen.getByText('10000')).toBeInTheDocument();
    expect(screen.getByText('Update for funzies')).toBeInTheDocument();
    expect(screen.getByTestId('vote-request-modal-reason-url')).toHaveAttribute(
      'href',
      'http://sv.localhost:4000',
    );
  });
});
