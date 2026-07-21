// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { create } from 'zustand';

import { MOCK_SV_PARTY } from '@/lib/mock-proposals';

export interface SvIdentity {
  /**
   * Delegating SV party id used for vote highlighting (`Vote.sv`).
   * Distinct from the wallet `voterParty` when VoteDelegation is in use.
   */
  readonly partyId: string;
  readonly displayName: string;
  readonly svName: string;
}

interface IdentityState {
  readonly identity: SvIdentity;
  /** Connected wallet party (`VoteDelegation.voterParty`), if any. */
  readonly voterPartyId: string | null;
  readonly setIdentity: (identity: SvIdentity) => void;
  readonly setVoterPartyId: (voterPartyId: string | null) => void;
}

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_VOTES !== 'false';

/** Mock SV identity for mock vote mode (highlighting uses this SV party). */
const MOCK_IDENTITY: SvIdentity = {
  partyId: MOCK_SV_PARTY,
  displayName: 'Mock Super Validator',
  svName: 'mock-sv-1',
};

function resolveLiveIdentity(): SvIdentity {
  const partyId = import.meta.env.VITE_SV_PARTY_ID?.trim() ?? '';
  return {
    partyId,
    displayName: partyId.length > 0 ? 'Delegating SV' : 'Unknown SV',
    svName: 'sv',
  };
}

const INITIAL_IDENTITY = USE_MOCK_DATA ? MOCK_IDENTITY : resolveLiveIdentity();

if (!USE_MOCK_DATA && INITIAL_IDENTITY.partyId.length === 0 && import.meta.env.DEV) {
  console.warn(
    'VITE_SV_PARTY_ID is empty — vote highlighting needs the delegating SV party (Vote.sv). Set it from GET /v0/dso sv_party_id. Wallet connect binds VoteDelegation.voterParty separately.',
  );
}

export const useIdentityStore = create<IdentityState>((set) => ({
  identity: INITIAL_IDENTITY,
  voterPartyId: null,
  setIdentity: (identity: SvIdentity): void => {
    set({ identity });
  },
  setVoterPartyId: (voterPartyId: string | null): void => {
    set({ voterPartyId });
  },
}));

export function getDefaultIdentity(): SvIdentity {
  return USE_MOCK_DATA ? MOCK_IDENTITY : resolveLiveIdentity();
}

export function applyDefaultIdentity(): void {
  const store = useIdentityStore.getState();
  store.setIdentity(getDefaultIdentity());
  store.setVoterPartyId(null);
}
