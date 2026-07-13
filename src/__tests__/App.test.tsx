// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { App } from '@/App';

vi.mock('@/lib/dapp-sdk', () => ({
  governanceDappClient: {
    init: vi.fn(async () => undefined),
    isConnected: vi.fn(async () => ({ isConnected: false, isNetworkConnected: false })),
    onAccountsChanged: vi.fn(async () => undefined),
    removeOnAccountsChanged: vi.fn(async () => undefined),
  },
  resetGovernanceDappClientForTests: vi.fn(),
}));

describe('App', () => {
  it('renders the application title', async () => {
    render(<App />);
    expect(screen.getByText('SV Governance')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('wallet-connect-button')).toBeEnabled();
    });
  });

  it('renders wallet connect controls', async () => {
    render(<App />);
    expect(screen.getByTestId('wallet-connect-toolbar')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('wallet-connect-button')).toBeEnabled();
    });
  });
});
