// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import type { PrepareExecuteParams } from '@canton-network/dapp-sdk';

import type { CastVoteArgs, DisclosedContractInput, RequestVoteArgs } from '@/types/governance';

const DEFAULT_PACKAGE_NAME = 'splice-dso-governance';
const VOTE_DELEGATION_MODULE = 'Splice.DsoRules.VoteDelegation';
const VOTE_DELEGATION_ENTITY = 'VoteDelegation';
const CAST_VOTE_CHOICE = 'VoteDelegation_CastVote';
const REQUEST_VOTE_CHOICE = 'VoteDelegation_RequestVote';

export function getVoteDelegationTemplateId(
  packageName: string = import.meta.env.VITE_DSO_GOVERNANCE_PACKAGE_NAME?.trim() ||
    DEFAULT_PACKAGE_NAME,
): string {
  return `#${packageName}:${VOTE_DELEGATION_MODULE}:${VOTE_DELEGATION_ENTITY}`;
}

function toSdkDisclosedContracts(
  disclosed: readonly DisclosedContractInput[] | undefined,
): PrepareExecuteParams['disclosedContracts'] {
  if (disclosed === undefined || disclosed.length === 0) {
    return undefined;
  }
  return disclosed.map((contract) => ({
    contractId: contract.contractId,
    createdEventBlob: contract.createdEventBlob,
    ...(contract.templateId !== undefined ? { templateId: contract.templateId } : {}),
  }));
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

  const disclosedContracts = toSdkDisclosedContracts(args.disclosedContracts);

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
    actAs: [args.voterPartyId],
    ...(disclosedContracts !== undefined ? { disclosedContracts } : {}),
  };
}

/**
 * Builds CIP-103 params for delegated proposal creation:
 * `VoteDelegation_RequestVote` → nested `DsoRules_RequestVote`.
 */
export function buildVoteDelegationRequestParams(args: RequestVoteArgs): PrepareExecuteParams {
  const targetEffectiveAt = args.targetEffectiveAt ?? null;
  const disclosedContracts = toSdkDisclosedContracts(args.disclosedContracts);

  return {
    commands: [
      {
        ExerciseCommand: {
          templateId: getVoteDelegationTemplateId(),
          contractId: args.voteDelegationCid,
          choice: REQUEST_VOTE_CHOICE,
          choiceArgument: {
            dsoRulesCid: args.dsoRulesCid,
            requestVote: {
              requester: args.svPartyId,
              action: args.action,
              reason: {
                url: args.reasonUrl,
                body: args.reasonDescription,
              },
              voteRequestTimeout: {
                microseconds: args.voteRequestTimeoutMicroseconds,
              },
              targetEffectiveAt,
              voterParty: args.voterPartyId,
            },
          },
        },
      },
    ],
    actAs: [args.voterPartyId],
    ...(disclosedContracts !== undefined ? { disclosedContracts } : {}),
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
