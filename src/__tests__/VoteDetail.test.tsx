// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { VoteDetail } from '@/routes/VoteDetail';

function renderDetail(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/votes/:id" element={<VoteDetail />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('VoteDetail', () => {
  it('renders proposal details for a mock contract id', async () => {
    renderDetail('/votes/mock-vote-request%3A%3A1220abc11111111');

    expect(await screen.findByTestId('proposal-details-title')).toHaveTextContent('Proposal Details');
    expect(screen.getByText('Update Super Validator Reward Weight')).toBeInTheDocument();
  });

  it('shows not found for unknown contract id', async () => {
    renderDetail('/votes/unknown-contract');

    expect(await screen.findByText(/Proposal not found/i)).toBeInTheDocument();
  });
});
