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
        template_id: 'pkg:Splice.DsoRules:DsoRules',
        created_event_blob: 'blob-dso-rules',
        payload: { svs: [] },
      },
    },
  })),
  listDsoRulesVoteRequests: vi.fn(async () => []),
  resolveVoteRequest: vi.fn(async () => ({
    template_id: 'pkg:Splice.DsoRules:VoteRequest',
    contract_id: 'vr-current',
    created_event_blob: 'blob-vote-request',
    created_at: '2026-07-18T00:00:00Z',
    payload: {},
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
    // Route id "vr" resolves to the current VoteRequest contract, which
    // changes after every cast (DsoRules_CastVote archives + recreates).
    expect(args.voteRequestContractId).toBe('vr-current');
    expect(args.disclosedContracts).toEqual([
      {
        contractId: 'dso-rules-from-scan',
        createdEventBlob: 'blob-dso-rules',
        templateId: 'pkg:Splice.DsoRules:DsoRules',
      },
      {
        contractId: 'vr-current',
        createdEventBlob: 'blob-vote-request',
        templateId: 'pkg:Splice.DsoRules:VoteRequest',
      },
    ]);
  });
});
