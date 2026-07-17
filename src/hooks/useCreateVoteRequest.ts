// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { resolveRequestVoteArgs, type RequestVoteFormInput } from '@/lib/request-vote-context';
import { submitDelegatedVoteRequest } from '@/lib/signing';

export function useCreateVoteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RequestVoteFormInput) => {
      const args = await resolveRequestVoteArgs(input);
      return submitDelegatedVoteRequest(args);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['governance'] });
    },
  });
}
