// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import type { Wallet } from '@canton-network/dapp-sdk';
import { describe, expect, it } from 'vitest';

import {
  formatWalletError,
  selectPrimaryWallet,
  truncatePartyId,
  walletToSvIdentity,
} from '@/lib/wallet-identity';

const WALLET_A: Wallet = {
  primary: false,
  partyId: 'party-a::1220aaaa',
  status: 'allocated',
  hint: 'voter-a',
  publicKey: 'pk-a',
  namespace: 'ns-a',
  networkId: 'localnet',
  signingProviderId: 'sp-a',
};

const WALLET_B: Wallet = {
  primary: true,
  partyId: 'party-b::1220bbbb',
  status: 'allocated',
  hint: 'delegated-voter',
  publicKey: 'pk-b',
  namespace: 'ns-b',
  networkId: 'localnet',
  signingProviderId: 'sp-b',
};

describe('wallet-identity', () => {
  it('selects the primary wallet when present', () => {
    expect(selectPrimaryWallet([WALLET_A, WALLET_B])).toBe(WALLET_B);
  });

  it('falls back to the first wallet when none is primary', () => {
    expect(selectPrimaryWallet([WALLET_A])).toBe(WALLET_A);
  });

  it('maps wallet hint to delegated voter identity', () => {
    expect(walletToSvIdentity(WALLET_B)).toEqual({
      partyId: 'party-b::1220bbbb',
      displayName: 'delegated-voter',
      svName: 'delegated-voter',
    });
  });

  it('truncates long party ids for display', () => {
    expect(truncatePartyId('0123456789012345678901234567890')).toBe('0123456789012345…34567890');
  });

  it('formats unknown errors', () => {
    expect(formatWalletError(new Error('gateway unreachable'))).toBe('gateway unreachable');
    expect(formatWalletError(undefined)).toBe('Wallet connection failed');
  });
});
