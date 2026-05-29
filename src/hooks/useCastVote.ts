// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useMutation } from '@tanstack/react-query';

import { externalSigner } from '@/lib/signing';
import type { CastVoteArgs } from '@/types/governance';

async function castVoteExternally(args: CastVoteArgs): Promise<string> {
  const prepared = await externalSigner.prepareVoteTransaction(args);
  const signed = await externalSigner.requestSignature(prepared);
  return externalSigner.submitSignedTransaction(signed);
}

/** Mutation hook for externally signed vote casting (stubbed). */
export function useCastVote(voteRequestContractId: string) {
  return useMutation({
    mutationKey: ['castVote', voteRequestContractId],
    mutationFn: castVoteExternally,
  });
}
