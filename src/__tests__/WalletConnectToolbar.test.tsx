// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WalletConnectToolbar } from '@/components/wallet/WalletConnectToolbar';
import { MOCK_SV_PARTY } from '@/lib/mock-proposals';
import { applyDefaultIdentity, useIdentityStore } from '@/stores/identity';
import { resetWalletSessionStoreForTests, useWalletSessionStore } from '@/stores/wallet-session';

const mockClient = vi.hoisted(() => ({
  init: vi.fn(async () => undefined),
  connect: vi.fn(),
  disconnect: vi.fn(async () => undefined),
  isConnected: vi.fn(),
  listAccounts: vi.fn(),
  onAccountsChanged: vi.fn(async () => undefined),
  removeOnAccountsChanged: vi.fn(async () => undefined),
}));

vi.mock('@/lib/dapp-sdk', () => ({
  governanceDappClient: mockClient,
  resetGovernanceDappClientForTests: vi.fn(),
}));

describe('WalletConnectToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetWalletSessionStoreForTests();
    applyDefaultIdentity();
    mockClient.isConnected.mockResolvedValue({ isConnected: false, isNetworkConnected: false });
  });

  it('connects a wallet and binds the governance-voter party', async () => {
    mockClient.connect.mockResolvedValue({
      isConnected: true,
      isNetworkConnected: true,
    });
    mockClient.listAccounts.mockResolvedValue([
      {
        primary: true,
        partyId: 'gov-voter::1220cccc',
        status: 'allocated',
        hint: 'gov-voter',
        publicKey: 'pk',
        namespace: 'ns',
        networkId: 'localnet',
        signingProviderId: 'sp',
      },
    ]);

    useWalletSessionStore.setState({ bootstrapComplete: true, status: 'disconnected' });

    render(<WalletConnectToolbar />);

    await userEvent.click(screen.getByTestId('wallet-connect-button'));

    await waitFor(() => {
      expect(useIdentityStore.getState().identity.partyId).toBe('gov-voter::1220cccc');
    });

    expect(screen.getByTestId('wallet-connected-party')).toHaveTextContent('gov-voter::1220cccc');
    expect(screen.getByTestId('wallet-disconnect-button')).toBeInTheDocument();
  });

  it('surfaces wallet_connection_failed when connect is rejected', async () => {
    mockClient.connect.mockResolvedValue({
      isConnected: false,
      isNetworkConnected: false,
      reason: 'User cancelled wallet picker',
    });

    useWalletSessionStore.setState({ bootstrapComplete: true, status: 'disconnected' });

    render(<WalletConnectToolbar />);

    await userEvent.click(screen.getByTestId('wallet-connect-button'));

    expect(await screen.findByTestId('wallet-connection-failed')).toHaveTextContent(
      'User cancelled wallet picker',
    );
    expect(useIdentityStore.getState().identity.partyId).toBe(MOCK_SV_PARTY);
  });

  it('disconnect restores the default identity', async () => {
    useWalletSessionStore.setState({
      bootstrapComplete: true,
      status: 'connected',
      connectedPartyId: 'gov-voter::1220cccc',
      accounts: [],
    });
    useIdentityStore.getState().setIdentity({
      partyId: 'gov-voter::1220cccc',
      displayName: 'gov-voter',
      svName: 'gov-voter',
    });

    render(<WalletConnectToolbar />);

    await userEvent.click(screen.getByTestId('wallet-disconnect-button'));

    await waitFor(() => {
      expect(useIdentityStore.getState().identity.partyId).toBe(MOCK_SV_PARTY);
    });
    expect(screen.getByTestId('wallet-connect-button')).toBeInTheDocument();
  });
});
