// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { create } from 'zustand';

export interface SvIdentity {
  readonly partyId: string;
  readonly displayName: string;
  readonly svName: string;
}

interface IdentityState {
  readonly identity: SvIdentity;
  readonly setIdentity: (identity: SvIdentity) => void;
}

/** Mock SV identity until real auth is integrated (Milestone 2+). */
const MOCK_IDENTITY: SvIdentity = {
  partyId: 'mock-sv-party::1220abcd',
  displayName: 'Mock Super Validator',
  svName: 'mock-sv-1',
};

export const useIdentityStore = create<IdentityState>((set) => ({
  identity: MOCK_IDENTITY,
  setIdentity: (identity: SvIdentity): void => {
    set({ identity });
  },
}));
