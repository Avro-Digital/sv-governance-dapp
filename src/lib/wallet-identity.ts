// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import type { Wallet } from '@canton-network/dapp-sdk';

import type { SvIdentity } from '@/stores/identity';

/** Prefer the wallet marked primary; otherwise use the first authorized account. */
export function selectPrimaryWallet(accounts: readonly Wallet[]): Wallet | undefined {
  if (accounts.length === 0) {
    return undefined;
  }

  return accounts.find((account) => account.primary) ?? accounts[0];
}

/** Map a connected wallet account — does not change SV highlighting identity. */
export function walletToSvIdentity(wallet: Wallet): SvIdentity {
  const hint = wallet.hint.trim();

  return {
    partyId: wallet.partyId,
    displayName: hint.length > 0 ? hint : 'Delegated voter',
    svName: hint.length > 0 ? hint : 'voter',
  };
}

export function truncatePartyId(partyId: string, head = 16, tail = 8): string {
  if (partyId.length <= head + tail + 1) {
    return partyId;
  }

  return `${partyId.slice(0, head)}…${partyId.slice(-tail)}`;
}

export function formatWalletError(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return 'Wallet connection failed';
}
