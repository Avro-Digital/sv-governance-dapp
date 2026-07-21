// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WalletSessionBootstrap } from '@/components/wallet/WalletSessionBootstrap';
import { applyDefaultIdentity, useIdentityStore } from '@/stores/identity';
import { resetWalletSessionStoreForTests, useWalletSessionStore } from '@/stores/wallet-session';

const mockClient = vi.hoisted(() => ({
  init: vi.fn(async () => undefined),
  isConnected: vi.fn(),
  listAccounts: vi.fn(),
  onAccountsChanged: vi.fn(async () => undefined),
  removeOnAccountsChanged: vi.fn(async () => undefined),
}));

vi.mock('@/lib/dapp-sdk', () => ({
  governanceDappClient: mockClient,
  resetGovernanceDappClientForTests: vi.fn(),
}));

describe('WalletSessionBootstrap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetWalletSessionStoreForTests();
    applyDefaultIdentity();
  });

  it('restores a persisted wallet session on mount', async () => {
    mockClient.isConnected.mockResolvedValue({
      isConnected: true,
      isNetworkConnected: true,
    });
    mockClient.listAccounts.mockResolvedValue([
      {
        primary: true,
        partyId: 'restored-voter::1220dddd',
        status: 'allocated',
        hint: 'restored-voter',
        publicKey: 'pk',
        namespace: 'ns',
        networkId: 'localnet',
        signingProviderId: 'sp',
      },
    ]);

    render(<WalletSessionBootstrap />);

    await waitFor(() => {
      expect(useWalletSessionStore.getState().status).toBe('connected');
    });

    expect(useIdentityStore.getState().voterPartyId).toBe('restored-voter::1220dddd');
    expect(useIdentityStore.getState().identity.partyId).toBeTruthy();
    expect(mockClient.init).toHaveBeenCalledTimes(1);
    expect(mockClient.onAccountsChanged).toHaveBeenCalledTimes(1);
  });
});
