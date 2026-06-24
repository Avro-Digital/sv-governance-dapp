// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useEffect } from 'react';

import { useWalletSessionStore } from '@/stores/wallet-session';

/** Initializes the CIP-103 SDK and restores any persisted wallet session on mount. */
export function WalletSessionBootstrap(): null {
  const bootstrap = useWalletSessionStore((state) => state.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return null;
}
