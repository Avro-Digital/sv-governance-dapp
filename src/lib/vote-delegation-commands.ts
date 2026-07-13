// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import type { PrepareExecuteParams } from '@canton-network/dapp-sdk';

import type { CastVoteArgs } from '@/types/governance';

const DEFAULT_PACKAGE_NAME = 'splice-dso-governance';
const VOTE_DELEGATION_MODULE = 'Splice.DsoRules.VoteDelegation';
const VOTE_DELEGATION_ENTITY = 'VoteDelegation';
const CAST_VOTE_CHOICE = 'VoteDelegation_CastVote';

export function getVoteDelegationTemplateId(
  packageName: string = import.meta.env.VITE_DSO_GOVERNANCE_PACKAGE_NAME?.trim() ||
    DEFAULT_PACKAGE_NAME,
): string {
  return `#${packageName}:${VOTE_DELEGATION_MODULE}:${VOTE_DELEGATION_ENTITY}`;
}

/**
 * Builds CIP-103 `prepareExecute` params for a delegated cast:
 * `VoteDelegation_CastVote` → nested `DsoRules_CastVote` with `vote.sv` = delegating SV.
 */
export function buildVoteDelegationCastParams(args: CastVoteArgs): PrepareExecuteParams {
  const templateId = getVoteDelegationTemplateId();

  const choiceArgument = {
    dsoRulesCid: args.dsoRulesCid,
    castVote: {
      requestCid: args.voteRequestContractId,
      vote: {
        sv: args.svPartyId,
        accept: args.accepted,
        reason: {
          url: args.reasonUrl,
          body: args.reasonDescription,
        },
        optCastAt: null,
      },
    },
  };

  const actAs = [args.voterPartyId];
  const readAs =
    args.dsoPartyId !== undefined && args.dsoPartyId.length > 0
      ? [args.dsoPartyId]
      : undefined;

  return {
    commands: [
      {
        ExerciseCommand: {
          templateId,
          contractId: args.voteDelegationCid,
          choice: CAST_VOTE_CHOICE,
          choiceArgument,
        },
      },
    ],
    actAs,
    ...(readAs !== undefined ? { readAs } : {}),
  };
}

export function hashCastVoteArgs(args: CastVoteArgs): string {
  const payload = JSON.stringify({
    voteRequestContractId: args.voteRequestContractId,
    accepted: args.accepted,
    reasonUrl: args.reasonUrl,
    reasonDescription: args.reasonDescription,
    voteDelegationCid: args.voteDelegationCid,
    dsoRulesCid: args.dsoRulesCid,
    svPartyId: args.svPartyId,
    voterPartyId: args.voterPartyId,
  });

  // Lightweight non-crypto digest for UI / PreparedVoteTransaction correlation only.
  let hash = 0;
  for (let i = 0; i < payload.length; i += 1) {
    hash = (hash << 5) - hash + payload.charCodeAt(i);
    hash |= 0;
  }
  return `cast-${Math.abs(hash).toString(16)}`;
}
