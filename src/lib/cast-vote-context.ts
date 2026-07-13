// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { getDsoInfo } from '@/lib/scan-client';
import type { ScanDsoInfoResponse } from '@/lib/scan-types';
import { useIdentityStore } from '@/stores/identity';
import type { CastVoteArgs } from '@/types/governance';

export type CastVoteFormInput = Pick<
  CastVoteArgs,
  'voteRequestContractId' | 'accepted' | 'reasonUrl' | 'reasonDescription'
>;

export class CastVoteContextError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CastVoteContextError';
  }
}

function readRequiredEnv(name: 'VITE_VOTE_DELEGATION_CID' | 'VITE_DSO_RULES_CID'): string | undefined {
  const value = import.meta.env[name]?.trim();
  return value !== undefined && value.length > 0 ? value : undefined;
}

function resolveDsoRulesCid(dsoInfo: ScanDsoInfoResponse): string | undefined {
  const fromEnv = readRequiredEnv('VITE_DSO_RULES_CID');
  if (fromEnv !== undefined) {
    return fromEnv;
  }

  const contractId = dsoInfo.dso_rules.contract.contract_id?.trim();
  return contractId !== undefined && contractId.length > 0 ? contractId : undefined;
}

/**
 * Resolves VoteDelegation cast context from wallet session, env, and Scan `/v0/dso`.
 *
 * `VITE_VOTE_DELEGATION_CID` is required until ACS / Scan discovery is wired.
 */
export async function resolveCastVoteArgs(input: CastVoteFormInput): Promise<CastVoteArgs> {
  const { identity, voterPartyId } = useIdentityStore.getState();

  if (voterPartyId === null || voterPartyId.length === 0) {
    throw new CastVoteContextError(
      'Connect a wallet so the VoteDelegation voterParty can sign the cast.',
    );
  }

  if (identity.partyId.length === 0) {
    throw new CastVoteContextError(
      'VITE_SV_PARTY_ID is required — set the delegating SV party (Vote.sv) for this cast.',
    );
  }

  const voteDelegationCid = readRequiredEnv('VITE_VOTE_DELEGATION_CID');
  if (voteDelegationCid === undefined) {
    throw new CastVoteContextError(
      'VITE_VOTE_DELEGATION_CID is not configured — set the VoteDelegation contract id for this LocalNet.',
    );
  }

  const USE_MOCK = import.meta.env.VITE_USE_MOCK_VOTES !== 'false';
  let dsoInfo: ScanDsoInfoResponse | undefined;

  if (!USE_MOCK) {
    try {
      dsoInfo = await getDsoInfo();
    } catch {
      dsoInfo = undefined;
    }
  }

  const dsoRulesCid =
    resolveDsoRulesCid(
      dsoInfo ?? {
        sv_user: '',
        sv_party_id: identity.partyId,
        dso_party_id: '',
        voting_threshold: 0,
        dso_rules: { contract: { payload: { svs: [] } } },
      },
    ) ?? readRequiredEnv('VITE_DSO_RULES_CID');

  if (dsoRulesCid === undefined) {
    throw new CastVoteContextError(
      'DsoRules contract id missing — set VITE_DSO_RULES_CID or ensure Scan /v0/dso exposes dso_rules.contract.contract_id.',
    );
  }

  const dsoPartyId = dsoInfo?.dso_party_id?.trim();

  return {
    ...input,
    voteDelegationCid,
    dsoRulesCid,
    svPartyId: identity.partyId,
    voterPartyId,
    ...(dsoPartyId !== undefined && dsoPartyId.length > 0 ? { dsoPartyId } : {}),
  };
}
