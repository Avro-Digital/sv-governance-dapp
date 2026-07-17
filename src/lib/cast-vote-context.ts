// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import {
  resolveVoteDelegationContext,
  VoteDelegationContextError,
} from '@/lib/vote-delegation-context';
import type { CastVoteArgs } from '@/types/governance';

export type CastVoteFormInput = Pick<
  CastVoteArgs,
  'voteRequestContractId' | 'accepted' | 'reasonUrl' | 'reasonDescription'
>;

export { VoteDelegationContextError as CastVoteContextError };

/**
 * Resolves VoteDelegation cast context from wallet session, env, and Scan `/v0/dso`.
 *
 * `VITE_VOTE_DELEGATION_CID` is required until ACS / Scan discovery is wired.
 */
export async function resolveCastVoteArgs(input: CastVoteFormInput): Promise<CastVoteArgs> {
  const context = await resolveVoteDelegationContext('cast');

  return {
    ...input,
    voteDelegationCid: context.voteDelegationCid,
    dsoRulesCid: context.dsoRulesCid,
    svPartyId: context.svPartyId,
    voterPartyId: context.voterPartyId,
    ...(context.dsoPartyId !== undefined ? { dsoPartyId: context.dsoPartyId } : {}),
  };
}
