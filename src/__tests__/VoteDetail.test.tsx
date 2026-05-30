// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import fixture from '@/__fixtures__/scan-vote-requests.json';
import type { ScanVoteRequestContract } from '@/lib/scan-types';
import { VoteDetail } from '@/routes/VoteDetail';

const contract = fixture.dso_rules_vote_requests[0] as unknown as ScanVoteRequestContract;

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
  it('renders Splice-style vote request detail for a known contract id', async () => {
    renderDetail(`/votes/${encodeURIComponent(contract.contract_id)}`);

    expect(await screen.findByText('Requested Action')).toBeInTheDocument();
    expect(screen.getByText('SRARC_UpdateSvRewardWeight')).toBeInTheDocument();
    expect(screen.getByText('Update for funzies')).toBeInTheDocument();
  });

  it('shows not found for unknown contract id', async () => {
    renderDetail('/votes/unknown-contract');

    expect(await screen.findByText(/Vote request not found/i)).toBeInTheDocument();
  });
});
