// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Minimal subset of apps/common/frontend/src/components/votes/ActionView.tsx @ canton-network/splice 80488155

import Typography from '@mui/material/Typography';

import { ActionValueTable } from '@/components/votes/ActionValueTable';
import { DateWithDurationDisplay } from '@/components/votes/DateWithDurationDisplay';
import { PartyId } from '@/components/votes/PartyId';
import { getRawActionTag } from '@/lib/governance-transform';
import type { ScanActionRequiringConfirmation } from '@/lib/scan-types';

interface ActionViewProps {
  readonly action: ScanActionRequiringConfirmation;
}

export function ActionView({ action }: ActionViewProps) {
  const actionType = action.tag;

  if (action.tag === 'ARC_DsoRules' && action.value.dsoAction !== undefined) {
    const dsoAction = action.value.dsoAction;

    switch (dsoAction.tag) {
      case 'SRARC_OffboardSv':
        return (
          <ActionValueTable
            actionType={actionType}
            actionName={dsoAction.tag}
            valuesMap={{
              Member: <PartyId id="srarc_offboardsv-member" partyId={String(dsoAction.value.sv ?? '')} />,
            }}
          />
        );
      case 'SRARC_GrantFeaturedAppRight':
        return (
          <ActionValueTable
            actionType={actionType}
            actionName={dsoAction.tag}
            valuesMap={{
              Provider: <PartyId partyId={String(dsoAction.value.provider ?? '')} />,
            }}
          />
        );
      case 'SRARC_RevokeFeaturedAppRight':
        return (
          <ActionValueTable
            actionType={actionType}
            actionName={dsoAction.tag}
            valuesMap={{
              FeatureAppRightCid: <PartyId partyId={String(dsoAction.value.rightCid ?? '')} />,
            }}
          />
        );
      case 'SRARC_UpdateSvRewardWeight':
        return (
          <ActionValueTable
            actionType={actionType}
            actionName={dsoAction.tag}
            valuesMap={{
              Member: (
                <PartyId
                  id="srarc_updatesvrewardweight-member"
                  partyId={String(dsoAction.value.svParty ?? '')}
                />
              ),
              NewWeight: (
                <Typography id="srarc_updatesvrewardweight-weight">
                  {String(dsoAction.value.newRewardWeight ?? '')}
                </Typography>
              ),
            }}
          />
        );
      case 'SRARC_CreateUnallocatedUnclaimedActivityRecord':
        return (
          <ActionValueTable
            actionType={actionType}
            actionName={dsoAction.tag}
            valuesMap={{
              Beneficiary: <PartyId partyId={String(dsoAction.value.beneficiary ?? '')} />,
              Amount: <Typography>{String(dsoAction.value.amount ?? '')}</Typography>,
              'Must Mint Before': (
                <DateWithDurationDisplay datetime={String(dsoAction.value.expiresAt ?? '')} />
              ),
            }}
          />
        );
      case 'SRARC_SetConfig':
        return <ActionValueTable actionType={actionType} actionName={dsoAction.tag} />;
      default:
        return <ActionValueTable actionType={actionType} actionName={dsoAction.tag} />;
    }
  }

  if (action.tag === 'ARC_AmuletRules' && action.value.amuletRulesAction !== undefined) {
    const amuletRulesAction = action.value.amuletRulesAction;
    return <ActionValueTable actionType={actionType} actionName={amuletRulesAction.tag} />;
  }

  return <ActionValueTable actionType={actionType} actionName={getRawActionTag(action)} />;
}
