// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ProposalVoteForm } from '@/components/governance/ProposalVoteForm';
import { MOCK_SV_PARTY } from '@/lib/mock-proposals';

function renderForm() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProposalVoteForm
        voteRequestContractId="mock-vote-request::1220abc11111111"
        currentSvPartyId={MOCK_SV_PARTY}
        votes={[{ sv: MOCK_SV_PARTY, isYou: true, vote: 'no-vote' }]}
      />
    </QueryClientProvider>,
  );
}

describe('ProposalVoteForm', () => {
  it('prompts to connect a wallet when cast context is incomplete', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByTestId('your-vote-reason-input'), 'Looks good.');
    await user.click(screen.getByTestId('your-vote-accept'));

    expect(await screen.findByTestId('vote-submission-error')).toHaveTextContent(
      /Connect a wallet so the VoteDelegation voterParty can sign the cast/i,
    );
  });
});
