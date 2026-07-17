// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { describe, expect, it } from 'vitest';

import { buildProposalAction, type ProposalActionFields } from '@/lib/proposal-actions';
import type { SupportedActionTag } from '@/types/governance';

const FIELDS: ProposalActionFields = {
  party: 'sv::2',
  provider: 'provider::1',
  rightCid: 'featured-app-right-cid',
  rewardWeight: '20000',
  beneficiary: 'beneficiary::1',
  amount: '42.5',
  summary: 'Proposal summary',
  mustMintBefore: '2026-07-25T12:00:00.000Z',
  configJson: '{"threshold": 3}',
  baseConfig: { threshold: 2 },
};

describe('buildProposalAction', () => {
  const cases: ReadonlyArray<
    readonly [SupportedActionTag, 'ARC_DsoRules' | 'ARC_AmuletRules', Record<string, unknown>]
  > = [
    ['SRARC_OffboardSv', 'ARC_DsoRules', { sv: 'sv::2' }],
    [
      'SRARC_GrantFeaturedAppRight',
      'ARC_DsoRules',
      { provider: 'provider::1', activityWeight: null },
    ],
    ['SRARC_RevokeFeaturedAppRight', 'ARC_DsoRules', { rightCid: 'featured-app-right-cid' }],
    ['SRARC_UpdateSvRewardWeight', 'ARC_DsoRules', { svParty: 'sv::2', newRewardWeight: '20000' }],
    [
      'SRARC_CreateUnallocatedUnclaimedActivityRecord',
      'ARC_DsoRules',
      {
        beneficiary: 'beneficiary::1',
        amount: '42.5',
        reason: 'Proposal summary',
        expiresAt: '2026-07-25T12:00:00.000Z',
      },
    ],
    [
      'SRARC_SetConfig',
      'ARC_DsoRules',
      { newConfig: { threshold: 3 }, baseConfig: { threshold: 2 } },
    ],
    [
      'CRARC_SetConfig',
      'ARC_AmuletRules',
      { newConfig: { threshold: 3 }, baseConfig: { threshold: 2 } },
    ],
  ];

  it.each(cases)('builds %s with its original SV GUI payload', (tag, wrapper, value) => {
    const action = buildProposalAction(tag, FIELDS);
    expect(action.tag).toBe(wrapper);
    const nested = action.value.dsoAction ?? action.value.amuletRulesAction;
    expect(nested).toEqual({ tag, value });
  });
});
