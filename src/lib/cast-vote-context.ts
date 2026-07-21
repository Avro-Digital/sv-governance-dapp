// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { listDsoRulesVoteRequests, resolveVoteRequest } from '@/lib/scan-client';
import type { ScanVoteRequestContract } from '@/lib/scan-types';
import {
  resolveVoteDelegationContext,
  VoteDelegationContextError,
} from '@/lib/vote-delegation-context';
import type { CastVoteArgs, DisclosedContractInput } from '@/types/governance';

export type CastVoteFormInput = Pick<
  CastVoteArgs,
  'voteRequestContractId' | 'accepted' | 'reasonUrl' | 'reasonDescription'
>;

export { VoteDelegationContextError as CastVoteContextError };

interface CurrentVoteRequest {
  readonly contractId: string;
  readonly disclosed?: DisclosedContractInput;
}

function toDisclosure(contract: ScanVoteRequestContract): DisclosedContractInput | undefined {
  const blob = contract.created_event_blob?.trim();
  if (blob === undefined || blob.length === 0) {
    return undefined;
  }
  return {
    contractId: contract.contract_id,
    createdEventBlob: blob,
    templateId: contract.template_id,
  };
}

/**
 * Resolves the route id (tracking cid or contract id) to the **current**
 * VoteRequest contract. `DsoRules_CastVote` archives and recreates the
 * VoteRequest on every vote, so ids captured by the UI go stale after the
 * first cast — exercising them fails with CONTRACT_NOT_FOUND.
 */
async function resolveCurrentVoteRequest(routeId: string): Promise<CurrentVoteRequest> {
  if (import.meta.env.VITE_USE_MOCK_VOTES !== 'false') {
    return { contractId: routeId };
  }
  const knownRequests = await listDsoRulesVoteRequests();
  const contract = await resolveVoteRequest(routeId, knownRequests);
  if (contract === null) {
    throw new VoteDelegationContextError(
      'This vote request is no longer open — it may have executed, expired, or been updated. Refresh and retry.',
    );
  }
  const disclosed = toDisclosure(contract);
  return {
    contractId: contract.contract_id,
    ...(disclosed !== undefined ? { disclosed } : {}),
  };
}

/**
 * Resolves VoteDelegation cast context from wallet session, env, and Scan `/v0/dso`.
 *
 * `VITE_VOTE_DELEGATION_CID` is required until ACS / Scan discovery is wired.
 */
export async function resolveCastVoteArgs(input: CastVoteFormInput): Promise<CastVoteArgs> {
  const context = await resolveVoteDelegationContext('cast');
  const voteRequest = await resolveCurrentVoteRequest(input.voteRequestContractId);

  const disclosedContracts = [
    ...(context.dsoRulesDisclosed !== undefined ? [context.dsoRulesDisclosed] : []),
    ...(voteRequest.disclosed !== undefined ? [voteRequest.disclosed] : []),
  ];

  return {
    ...input,
    voteRequestContractId: voteRequest.contractId,
    voteDelegationCid: context.voteDelegationCid,
    dsoRulesCid: context.dsoRulesCid,
    svPartyId: context.svPartyId,
    voterPartyId: context.voterPartyId,
    ...(disclosedContracts.length > 0 ? { disclosedContracts } : {}),
  };
}
