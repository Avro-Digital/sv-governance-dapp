// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { ListVoteRequests } from '@/components/votes/ListVoteRequests';

describe('ListVoteRequests', () => {
  it('renders tabbed vote requests with mock data', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ListVoteRequests />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Vote Requests' })).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('tab-panel-in-progress'));
    expect(await screen.findByTestId('sv-voting-in-progress-table-body')).toBeInTheDocument();
    expect(screen.getByText('Vote History')).toBeInTheDocument();
  });
});
