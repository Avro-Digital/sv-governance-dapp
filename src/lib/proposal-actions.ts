// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import type { GovernanceAction, SupportedActionTag } from '@/types/governance';

/** Mirrors Splice `createProposalActions` (`utils/governance.ts`, July 2026 redesign). */
export const createProposalActions: readonly {
  readonly name: string;
  readonly value: SupportedActionTag;
}[] = [
  { name: 'Offboard Member', value: 'SRARC_OffboardSv' },
  { name: 'Feature Application', value: 'SRARC_GrantFeaturedAppRight' },
  { name: 'Unfeature Application', value: 'SRARC_RevokeFeaturedAppRight' },
  {
    name: 'Set Decentralized Synchronizer Operations (DSO) Rules Configuration',
    value: 'SRARC_SetConfig',
  },
  {
    name: 'Create Unclaimed Activity Record',
    value: 'SRARC_CreateUnallocatedUnclaimedActivityRecord',
  },
  { name: 'Set Amulet Rules Configuration', value: 'CRARC_SetConfig' },
  { name: 'Update Super Validator Reward Weight', value: 'SRARC_UpdateSvRewardWeight' },
];

export interface ProposalActionFields {
  readonly party: string;
  readonly provider: string;
  /** Optional featured-app activity weight; empty string maps to DAML `None`. */
  readonly activityWeight?: string;
  readonly rightCid: string;
  readonly rewardWeight: string;
  readonly beneficiary: string;
  readonly amount: string;
  readonly summary: string;
  readonly mustMintBefore: string;
  readonly configJson: string;
  readonly baseConfig?: Record<string, unknown>;
}

function dsoAction(tag: SupportedActionTag, value: Record<string, unknown>): GovernanceAction {
  return { tag: 'ARC_DsoRules', value: { dsoAction: { tag, value } } };
}

export function buildProposalAction(
  tag: SupportedActionTag,
  fields: ProposalActionFields,
): GovernanceAction {
  switch (tag) {
    case 'SRARC_OffboardSv':
      return dsoAction(tag, { sv: fields.party });
    case 'SRARC_GrantFeaturedAppRight':
      return dsoAction(tag, {
        provider: fields.provider,
        activityWeight:
          fields.activityWeight === undefined || fields.activityWeight.trim().length === 0
            ? null
            : fields.activityWeight.trim(),
      });
    case 'SRARC_RevokeFeaturedAppRight':
      return dsoAction(tag, { rightCid: fields.rightCid });
    case 'SRARC_UpdateSvRewardWeight':
      return dsoAction(tag, {
        svParty: fields.party,
        newRewardWeight: fields.rewardWeight,
      });
    case 'SRARC_CreateUnallocatedUnclaimedActivityRecord':
      return dsoAction(tag, {
        beneficiary: fields.beneficiary,
        amount: fields.amount,
        reason: fields.summary,
        expiresAt: new Date(fields.mustMintBefore).toISOString(),
      });
    case 'SRARC_SetConfig':
      return dsoAction(tag, {
        newConfig: JSON.parse(fields.configJson) as Record<string, unknown>,
        baseConfig: fields.baseConfig ?? null,
      });
    case 'CRARC_SetConfig':
      return {
        tag: 'ARC_AmuletRules',
        value: {
          amuletRulesAction: {
            tag,
            value: {
              newConfig: JSON.parse(fields.configJson) as Record<string, unknown>,
              baseConfig: fields.baseConfig ?? null,
            },
          },
        },
      };
  }
}
