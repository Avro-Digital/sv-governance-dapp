// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { resolveVoteDelegationContext } from '@/lib/vote-delegation-context';
import type { GovernanceAction, RequestVoteArgs } from '@/types/governance';

export interface RequestVoteFormInput {
  readonly action: GovernanceAction;
  readonly reasonUrl: string;
  readonly reasonDescription: string;
  readonly voteRequestTimeoutMicroseconds: string;
  readonly targetEffectiveAt?: string;
}

export async function resolveRequestVoteArgs(
  input: RequestVoteFormInput,
): Promise<RequestVoteArgs> {
  const context = await resolveVoteDelegationContext('request');
  return {
    ...input,
    voteDelegationCid: context.voteDelegationCid,
    dsoRulesCid: context.dsoRulesCid,
    svPartyId: context.svPartyId,
    voterPartyId: context.voterPartyId,
    ...(context.dsoPartyId !== undefined ? { dsoPartyId: context.dsoPartyId } : {}),
  };
}
