// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SignatureRejectedError, externalSigner } from '@/lib/signing';
import type { CastVoteArgs } from '@/types/governance';

const prepareExecuteAndWait = vi.fn();

vi.mock('@/lib/dapp-sdk', () => ({
  governanceDappClient: {
    prepareExecuteAndWait: (...args: unknown[]) => prepareExecuteAndWait(...args),
  },
}));

const ARGS: CastVoteArgs = {
  voteRequestContractId: 'vr',
  accepted: true,
  reasonUrl: '',
  reasonDescription: 'ok',
  voteDelegationCid: 'del',
  dsoRulesCid: 'dso',
  svPartyId: 'sv::1',
  voterPartyId: 'voter::1',
};

describe('externalSigner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits VoteDelegation_CastVote via prepareExecuteAndWait', async () => {
    prepareExecuteAndWait.mockResolvedValue({
      tx: { status: 'executed', commandId: 'c1', payload: { updateId: 'upd-1', completionOffset: 1 } },
    });

    const prepared = await externalSigner.prepareVoteTransaction(ARGS);
    const signed = await externalSigner.requestSignature(prepared);
    const updateId = await externalSigner.submitSignedTransaction(signed);

    expect(updateId).toBe('upd-1');
    expect(prepareExecuteAndWait).toHaveBeenCalledTimes(1);
    const params = prepareExecuteAndWait.mock.calls[0]![0] as {
      commands: unknown[];
      actAs: string[];
    };
    expect(params.actAs).toEqual(['voter::1']);
    expect(params.commands).toHaveLength(1);
  });

  it('maps wallet cancellation to signature_rejected', async () => {
    prepareExecuteAndWait.mockRejectedValue(new Error('User cancelled'));

    const prepared = await externalSigner.prepareVoteTransaction(ARGS);
    const signed = await externalSigner.requestSignature(prepared);

    await expect(externalSigner.submitSignedTransaction(signed)).rejects.toBeInstanceOf(
      SignatureRejectedError,
    );
  });
});
