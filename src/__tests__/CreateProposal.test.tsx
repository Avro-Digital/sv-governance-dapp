// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { CreateProposal } from '@/routes/CreateProposal';
import { theme } from '@/theme';

function renderCreateProposal(url: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[url]}>
          <CreateProposal />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('CreateProposal', () => {
  it('shows the action selector when no action is chosen', () => {
    renderCreateProposal('/governance/proposals/create');

    expect(screen.getByTestId('create-proposal-title')).toHaveTextContent('Initiate Proposal');
    expect(screen.getByTestId('select-action')).toBeInTheDocument();
    expect(screen.getByTestId('next-button')).toBeDisabled();
  });

  it('renders the reward weight form for SRARC_UpdateSvRewardWeight', async () => {
    renderCreateProposal('/governance/proposals/create?action=SRARC_UpdateSvRewardWeight');

    expect(await screen.findByTestId('create-proposal-action')).toHaveTextContent(
      'Update Super Validator Reward Weight',
    );
    expect(screen.getByTestId('create-proposal-member-select-component')).toBeInTheDocument();
    expect(screen.getByTestId('create-proposal-weight')).toBeInTheDocument();
    expect(screen.getByTestId('create-proposal-summary')).toBeInTheDocument();
    expect(screen.getByTestId('create-proposal-url')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Review Proposal');
  });

  it('blocks review when required fields are missing', async () => {
    const user = userEvent.setup();
    renderCreateProposal('/governance/proposals/create?action=SRARC_GrantFeaturedAppRight');

    await user.click(await screen.findByTestId('submit-button'));

    expect(await screen.findByTestId('create-proposal-form-error')).toBeInTheDocument();
    expect(screen.queryByTestId('proposal-summary')).not.toBeInTheDocument();
  });

  it('shows the review summary once the form is valid', async () => {
    const user = userEvent.setup();
    renderCreateProposal('/governance/proposals/create?action=SRARC_GrantFeaturedAppRight');

    await user.type(await screen.findByTestId('create-proposal-provider'), 'provider::1220abc');
    await user.type(screen.getByTestId('create-proposal-summary'), 'Feature this app');
    await user.type(screen.getByTestId('create-proposal-url'), 'https://example.com/proposal');
    await user.click(screen.getByTestId('submit-button'));

    expect(await screen.findByTestId('proposal-summary')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toHaveTextContent('Submit Proposal');
    expect(screen.getByTestId('cancel-button')).toHaveTextContent('Edit Proposal');
  });
});
