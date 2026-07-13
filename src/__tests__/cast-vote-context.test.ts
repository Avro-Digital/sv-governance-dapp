// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { afterEach, describe, expect, it, vi } from 'vitest';

import { CastVoteContextError, resolveCastVoteArgs } from '@/lib/cast-vote-context';
import { MOCK_SV_PARTY } from '@/lib/mock-proposals';
import { applyDefaultIdentity, useIdentityStore } from '@/stores/identity';

vi.mock('@/lib/scan-client', () => ({
  getDsoInfo: vi.fn(async () => ({
    sv_user: 'sv',
    sv_party_id: MOCK_SV_PARTY,
    dso_party_id: 'DSO::1220ffff',
    voting_threshold: 1,
    dso_rules: {
      contract: {
        contract_id: 'dso-rules-from-scan',
        payload: { svs: [] },
      },
    },
  })),
}));

describe('resolveCastVoteArgs', () => {
  afterEach(() => {
    applyDefaultIdentity();
    vi.unstubAllEnvs();
  });

  it('requires a connected voter party', async () => {
    await expect(
      resolveCastVoteArgs({
        voteRequestContractId: 'vr',
        accepted: true,
        reasonUrl: '',
        reasonDescription: 'x',
      }),
    ).rejects.toBeInstanceOf(CastVoteContextError);
  });

  it('resolves delegation cid from env and DsoRules from Scan', async () => {
    vi.stubEnv('VITE_USE_MOCK_VOTES', 'false');
    vi.stubEnv('VITE_VOTE_DELEGATION_CID', 'delegation-from-env');
    useIdentityStore.getState().setVoterPartyId('voter::1220bbbb');

    const args = await resolveCastVoteArgs({
      voteRequestContractId: 'vr',
      accepted: false,
      reasonUrl: 'https://example.com',
      reasonDescription: 'no',
    });

    expect(args.voteDelegationCid).toBe('delegation-from-env');
    expect(args.dsoRulesCid).toBe('dso-rules-from-scan');
    expect(args.svPartyId).toBe(MOCK_SV_PARTY);
    expect(args.voterPartyId).toBe('voter::1220bbbb');
    expect(args.dsoPartyId).toBe('DSO::1220ffff');
  });
});
