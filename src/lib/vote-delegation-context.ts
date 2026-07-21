// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { getDsoInfo } from '@/lib/scan-client';
import type { ScanDsoInfoResponse } from '@/lib/scan-types';
import { useIdentityStore } from '@/stores/identity';
import type { DisclosedContractInput } from '@/types/governance';

export interface VoteDelegationContext {
  readonly voteDelegationCid: string;
  readonly dsoRulesCid: string;
  readonly svPartyId: string;
  readonly voterPartyId: string;
  readonly dsoInfo?: ScanDsoInfoResponse;
  /**
   * DsoRules disclosure for the voter participant, which does not host DSO
   * contracts. Without it, prepare fails with PERMISSION_DENIED (surfaced as
   * "A security-sensitive error has been received").
   */
  readonly dsoRulesDisclosed?: DisclosedContractInput;
}

export class VoteDelegationContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VoteDelegationContextError';
  }
}

function readEnv(name: 'VITE_VOTE_DELEGATION_CID' | 'VITE_DSO_RULES_CID'): string | undefined {
  const value = import.meta.env[name]?.trim();
  return value !== undefined && value.length > 0 ? value : undefined;
}

export async function resolveVoteDelegationContext(
  operation: 'cast' | 'request',
): Promise<VoteDelegationContext> {
  const { identity, voterPartyId } = useIdentityStore.getState();

  if (voterPartyId === null || voterPartyId.length === 0) {
    throw new VoteDelegationContextError(
      `Connect a wallet so the VoteDelegation voterParty can sign the ${operation}.`,
    );
  }
  if (identity.partyId.length === 0) {
    throw new VoteDelegationContextError(
      `VITE_SV_PARTY_ID is required — set the delegating SV party for this ${operation}.`,
    );
  }

  const voteDelegationCid = readEnv('VITE_VOTE_DELEGATION_CID');
  if (voteDelegationCid === undefined) {
    throw new VoteDelegationContextError(
      'VITE_VOTE_DELEGATION_CID is not configured — set the VoteDelegation contract id for this LocalNet.',
    );
  }

  let dsoInfo: ScanDsoInfoResponse | undefined;
  if (import.meta.env.VITE_USE_MOCK_VOTES === 'false') {
    try {
      dsoInfo = await getDsoInfo();
    } catch {
      dsoInfo = undefined;
    }
  }

  const dsoRulesCid =
    readEnv('VITE_DSO_RULES_CID') ?? dsoInfo?.dso_rules.contract.contract_id?.trim();
  if (dsoRulesCid === undefined || dsoRulesCid.length === 0) {
    throw new VoteDelegationContextError(
      'DsoRules contract id missing — set VITE_DSO_RULES_CID or ensure Scan /v0/dso exposes dso_rules.contract.contract_id.',
    );
  }

  const dsoRulesContract = dsoInfo?.dso_rules.contract;
  const dsoRulesBlob = dsoRulesContract?.created_event_blob?.trim();
  const dsoRulesDisclosed: DisclosedContractInput | undefined =
    dsoRulesBlob !== undefined && dsoRulesBlob.length > 0
      ? {
          contractId: dsoRulesCid,
          createdEventBlob: dsoRulesBlob,
          ...(dsoRulesContract?.template_id !== undefined
            ? { templateId: dsoRulesContract.template_id }
            : {}),
        }
      : undefined;

  return {
    voteDelegationCid,
    dsoRulesCid,
    svPartyId: identity.partyId,
    voterPartyId,
    ...(dsoInfo !== undefined ? { dsoInfo } : {}),
    ...(dsoRulesDisclosed !== undefined ? { dsoRulesDisclosed } : {}),
  };
}
