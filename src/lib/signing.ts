// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { ErrorCode } from '@canton-network/dapp-sdk';

import { governanceDappClient } from '@/lib/dapp-sdk';
import {
  buildVoteDelegationCastParams,
  buildVoteDelegationRequestParams,
  hashCastVoteArgs,
} from '@/lib/vote-delegation-commands';
import type {
  CastVoteArgs,
  PreparedVoteTransaction,
  RequestVoteArgs,
  SignedVoteTransaction,
} from '@/types/governance';

/**
 * External wallet signer for governance vote casting.
 *
 * Replaces Splice `SvAdminClient.castVote` with CIP-103 via `@canton-network/dapp-sdk`:
 * build `VoteDelegation_CastVote` → wallet `prepareExecuteAndWait`.
 */
export interface ExternalSigner {
  prepareVoteTransaction(args: CastVoteArgs): Promise<PreparedVoteTransaction>;
  requestSignature(prepared: PreparedVoteTransaction): Promise<SignedVoteTransaction>;
  submitSignedTransaction(signed: SignedVoteTransaction): Promise<string>;
}

export class SignatureRejectedError extends Error {
  readonly code = 'signature_rejected' as const;

  constructor(message = 'Signature rejected or cancelled in the wallet') {
    super(message);
    this.name = 'SignatureRejectedError';
  }
}

export async function submitDelegatedVoteRequest(args: RequestVoteArgs): Promise<string> {
  try {
    const result = await governanceDappClient.prepareExecuteAndWait(
      buildVoteDelegationRequestParams(args),
    );
    return result.tx.payload.updateId;
  } catch (error) {
    if (isUserCancelled(error)) {
      throw new SignatureRejectedError(
        error instanceof Error ? error.message : 'Signature rejected or cancelled in the wallet',
      );
    }
    throw error;
  }
}

function isUserCancelled(error: unknown): boolean {
  if (error instanceof SignatureRejectedError) {
    return true;
  }
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: unknown }).code;
    if (code === ErrorCode.UserCancelled || code === 'signature_rejected') {
      return true;
    }
  }
  if (error instanceof Error) {
    const lower = error.message.toLowerCase();
    return lower.includes('cancelled') || lower.includes('canceled') || lower.includes('rejected');
  }
  return false;
}

export const externalSigner: ExternalSigner = {
  async prepareVoteTransaction(args: CastVoteArgs): Promise<PreparedVoteTransaction> {
    // Validates command shape early; wallet signing happens in submit.
    buildVoteDelegationCastParams(args);

    return {
      voteRequestContractId: args.voteRequestContractId,
      accepted: args.accepted,
      reasonUrl: args.reasonUrl,
      reasonDescription: args.reasonDescription,
      voteDelegationCid: args.voteDelegationCid,
      dsoRulesCid: args.dsoRulesCid,
      svPartyId: args.svPartyId,
      voterPartyId: args.voterPartyId,
      ...(args.disclosedContracts !== undefined
        ? { disclosedContracts: args.disclosedContracts }
        : {}),
      transactionHash: hashCastVoteArgs(args),
      preparedAt: new Date().toISOString(),
    };
  },

  async requestSignature(prepared: PreparedVoteTransaction): Promise<SignedVoteTransaction> {
    // CIP-103 RemoteAdapter prompts during prepareExecuteAndWait; this step
    // packages the prepared payload for submit without a separate sign RPC.
    return {
      voteRequestContractId: prepared.voteRequestContractId,
      voterPartyId: prepared.voterPartyId,
      accepted: prepared.accepted,
      preparedTransactionHash: prepared.transactionHash,
      signature: 'pending-wallet-gateway',
      signedAt: new Date().toISOString(),
      prepared,
    };
  },

  async submitSignedTransaction(signed: SignedVoteTransaction): Promise<string> {
    const args: CastVoteArgs = {
      voteRequestContractId: signed.prepared.voteRequestContractId,
      accepted: signed.prepared.accepted,
      reasonUrl: signed.prepared.reasonUrl,
      reasonDescription: signed.prepared.reasonDescription,
      voteDelegationCid: signed.prepared.voteDelegationCid,
      dsoRulesCid: signed.prepared.dsoRulesCid,
      svPartyId: signed.prepared.svPartyId,
      voterPartyId: signed.prepared.voterPartyId,
      ...(signed.prepared.disclosedContracts !== undefined
        ? { disclosedContracts: signed.prepared.disclosedContracts }
        : {}),
    };

    try {
      const result = await governanceDappClient.prepareExecuteAndWait(
        buildVoteDelegationCastParams(args),
      );
      return result.tx.payload.updateId;
    } catch (error) {
      if (isUserCancelled(error)) {
        throw new SignatureRejectedError(
          error instanceof Error ? error.message : 'Signature rejected or cancelled in the wallet',
        );
      }
      throw error;
    }
  },
};
