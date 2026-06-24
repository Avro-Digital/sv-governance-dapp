// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import type { AccountsChangedEvent, Wallet } from '@canton-network/dapp-sdk';
import { create } from 'zustand';

import { governanceDappClient } from '@/lib/dapp-sdk';
import {
  formatWalletError,
  selectPrimaryWallet,
  walletToSvIdentity,
} from '@/lib/wallet-identity';
import { applyDefaultIdentity, useIdentityStore } from '@/stores/identity';

export type WalletConnectionStatus =
  | 'idle'
  | 'initializing'
  | 'connected'
  | 'disconnected'
  | 'wallet_connection_failed';

interface WalletSessionState {
  readonly status: WalletConnectionStatus;
  readonly accounts: readonly Wallet[];
  readonly connectedPartyId: string | null;
  readonly errorMessage: string | null;
  readonly bootstrapComplete: boolean;
  bootstrap(): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

function applyWalletAccounts(accounts: readonly Wallet[]): Pick<
  WalletSessionState,
  'accounts' | 'connectedPartyId' | 'status' | 'errorMessage'
> {
  const primary = selectPrimaryWallet(accounts);

  if (primary === undefined) {
    applyDefaultIdentity();
    return {
      accounts,
      connectedPartyId: null,
      status: 'disconnected',
      errorMessage: null,
    };
  }

  useIdentityStore.getState().setIdentity(walletToSvIdentity(primary));

  return {
    accounts,
    connectedPartyId: primary.partyId,
    status: 'connected',
    errorMessage: null,
  };
}

function connectionFailed(reason: string | undefined): Pick<
  WalletSessionState,
  'status' | 'errorMessage' | 'connectedPartyId'
> {
  applyDefaultIdentity();

  return {
    status: 'wallet_connection_failed',
    errorMessage: reason ?? 'Wallet connection failed',
    connectedPartyId: null,
  };
}

let accountsListener: ((accounts: AccountsChangedEvent) => void) | null = null;

export const useWalletSessionStore = create<WalletSessionState>((set, get) => ({
  status: 'idle',
  accounts: [],
  connectedPartyId: null,
  errorMessage: null,
  bootstrapComplete: false,

  async bootstrap(): Promise<void> {
    if (get().bootstrapComplete) {
      return;
    }

    set({ status: 'initializing', errorMessage: null });

    try {
      await governanceDappClient.init();

      if (accountsListener === null) {
        accountsListener = (accounts: AccountsChangedEvent): void => {
          set(applyWalletAccounts(accounts));
        };
        await governanceDappClient.onAccountsChanged(accountsListener);
      }

      const connection = await governanceDappClient.isConnected();
      if (connection.isConnected) {
        const accounts = await governanceDappClient.listAccounts();
        set(applyWalletAccounts(accounts));
      } else {
        applyDefaultIdentity();
        set({
          status: 'disconnected',
          accounts: [],
          connectedPartyId: null,
          errorMessage: null,
        });
      }
    } catch (error) {
      set({
        ...connectionFailed(formatWalletError(error)),
        accounts: [],
      });
    } finally {
      set({ bootstrapComplete: true });
    }
  },

  async connect(): Promise<void> {
    set({ status: 'initializing', errorMessage: null });

    try {
      await governanceDappClient.init();
      const result = await governanceDappClient.connect();

      if (!result.isConnected) {
        set({
          ...connectionFailed(result.reason),
          accounts: [],
        });
        return;
      }

      const accounts = await governanceDappClient.listAccounts();
      set(applyWalletAccounts(accounts));
    } catch (error) {
      set({
        ...connectionFailed(formatWalletError(error)),
        accounts: [],
      });
    }
  },

  async disconnect(): Promise<void> {
    try {
      await governanceDappClient.disconnect();
    } catch (error) {
      set({
        status: 'wallet_connection_failed',
        errorMessage: formatWalletError(error),
      });
      return;
    }

    applyDefaultIdentity();
    set({
      status: 'disconnected',
      accounts: [],
      connectedPartyId: null,
      errorMessage: null,
    });
  },
}));

/** Test-only cleanup for wallet session listeners and state. */
export function resetWalletSessionStoreForTests(): void {
  if (accountsListener !== null) {
    void governanceDappClient.removeOnAccountsChanged(accountsListener);
    accountsListener = null;
  }

  useWalletSessionStore.setState({
    status: 'idle',
    accounts: [],
    connectedPartyId: null,
    errorMessage: null,
    bootstrapComplete: false,
  });
}
