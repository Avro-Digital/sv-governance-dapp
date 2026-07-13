// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { resolveCastVoteArgs, type CastVoteFormInput } from '@/lib/cast-vote-context';
import { externalSigner } from '@/lib/signing';

async function castVoteExternally(input: CastVoteFormInput): Promise<string> {
  const args = await resolveCastVoteArgs(input);
  const prepared = await externalSigner.prepareVoteTransaction(args);
  const signed = await externalSigner.requestSignature(prepared);
  return externalSigner.submitSignedTransaction(signed);
}

/** Mutation hook for VoteDelegation cast via CIP-103 wallet gateway. */
export function useCastVote(voteRequestContractId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['castVote', voteRequestContractId],
    mutationFn: castVoteExternally,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['governanceSnapshot'] });
      await queryClient.invalidateQueries({ queryKey: ['actionRequired'] });
    },
  });
}
