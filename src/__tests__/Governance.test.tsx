// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { Governance } from '@/routes/Governance';
import { theme } from '@/theme';

function renderGovernance() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={['/governance/proposals']}>
          <Governance />
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>,
  );
}

describe('Governance', () => {
  it('renders the page header with the initiate proposal button', async () => {
    renderGovernance();

    expect(await screen.findByTestId('governance-page-header-title')).toHaveTextContent(
      'Governance',
    );
    expect(screen.getByText('Initiate Proposal')).toHaveAttribute(
      'href',
      '/governance/proposals/create',
    );
  });

  it('renders section headers with mock data', async () => {
    renderGovernance();

    expect(await screen.findByText('Action Required')).toBeInTheDocument();
    expect(screen.getByText('Inflight Votes')).toBeInTheDocument();
    expect(screen.getByText('Vote History')).toBeInTheDocument();
  });
});
