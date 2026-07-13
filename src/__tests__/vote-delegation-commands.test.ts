// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { describe, expect, it } from 'vitest';

import {
  buildVoteDelegationCastParams,
  getVoteDelegationTemplateId,
  hashCastVoteArgs,
} from '@/lib/vote-delegation-commands';
import type { CastVoteArgs } from '@/types/governance';

const ARGS: CastVoteArgs = {
  voteRequestContractId: 'vote-request-cid',
  accepted: true,
  reasonUrl: 'https://example.com/r',
  reasonDescription: 'LGTM',
  voteDelegationCid: 'delegation-cid',
  dsoRulesCid: 'dso-rules-cid',
  svPartyId: 'sv::1220aaaa',
  voterPartyId: 'voter::1220bbbb',
  dsoPartyId: 'DSO::1220cccc',
};

describe('vote-delegation-commands', () => {
  it('builds a VoteDelegation_CastVote exercise with nested DsoRules_CastVote', () => {
    const params = buildVoteDelegationCastParams(ARGS);
    const command = params.commands[0] as {
      ExerciseCommand: {
        templateId: string;
        contractId: string;
        choice: string;
        choiceArgument: {
          dsoRulesCid: string;
          castVote: {
            requestCid: string;
            vote: { sv: string; accept: boolean; reason: { url: string; body: string } };
          };
        };
      };
    };

    expect(command.ExerciseCommand.templateId).toBe(getVoteDelegationTemplateId());
    expect(command.ExerciseCommand.contractId).toBe('delegation-cid');
    expect(command.ExerciseCommand.choice).toBe('VoteDelegation_CastVote');
    expect(command.ExerciseCommand.choiceArgument.dsoRulesCid).toBe('dso-rules-cid');
    expect(command.ExerciseCommand.choiceArgument.castVote.requestCid).toBe('vote-request-cid');
    expect(command.ExerciseCommand.choiceArgument.castVote.vote.sv).toBe('sv::1220aaaa');
    expect(command.ExerciseCommand.choiceArgument.castVote.vote.accept).toBe(true);
    expect(command.ExerciseCommand.choiceArgument.castVote.vote.reason.body).toBe('LGTM');
    expect(params.actAs).toEqual(['voter::1220bbbb']);
    expect(params.readAs).toEqual(['DSO::1220cccc']);
  });

  it('hashes cast args stably for a given payload', () => {
    expect(hashCastVoteArgs(ARGS)).toBe(hashCastVoteArgs(ARGS));
    expect(hashCastVoteArgs({ ...ARGS, accepted: false })).not.toBe(hashCastVoteArgs(ARGS));
  });
});
