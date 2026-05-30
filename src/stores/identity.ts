// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { create } from 'zustand';

import { MOCK_SV_PARTY } from '@/lib/mock-proposals';

export interface SvIdentity {
  readonly partyId: string;
  readonly displayName: string;
  readonly svName: string;
}

interface IdentityState {
  readonly identity: SvIdentity;
  readonly setIdentity: (identity: SvIdentity) => void;
}

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_VOTES !== 'false';

/** Mock SV identity until wallet session is integrated (AVR-2476). */
const MOCK_IDENTITY: SvIdentity = {
  partyId: MOCK_SV_PARTY,
  displayName: 'Mock Super Validator',
  svName: 'mock-sv-1',
};

function resolveLiveIdentity(): SvIdentity {
  const partyId = import.meta.env.VITE_SV_PARTY_ID?.trim() ?? '';
  return {
    partyId,
    displayName: partyId.length > 0 ? 'Super Validator' : 'Unknown SV',
    svName: 'sv',
  };
}

const INITIAL_IDENTITY = USE_MOCK_DATA ? MOCK_IDENTITY : resolveLiveIdentity();

export const useIdentityStore = create<IdentityState>((set) => ({
  identity: INITIAL_IDENTITY,
  setIdentity: (identity: SvIdentity): void => {
    set({ identity });
  },
}));
