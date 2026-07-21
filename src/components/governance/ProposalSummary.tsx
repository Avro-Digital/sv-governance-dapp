// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/governance/ProposalSummary.tsx
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { ConfigValuesChanges } from '@/components/governance/ConfigValuesChanges';
import {
  scrollContainerSx,
  scrollableIdentifierFieldSx,
} from '@/components/governance/identifierStyles';
import type { ConfigChange } from '@/types/governance';
import { THRESHOLD_DEADLINE_SUBTITLE } from '@/utils/governance-constants';

interface BaseProposalSummaryProps {
  readonly actionName: string;
  readonly url: string;
  readonly summary: string;
  readonly expiryDate: string;
  readonly effectiveDate: string | undefined;
}

export type ProposalSummaryProps = BaseProposalSummaryProps &
  (
    | {
        readonly formType: 'sv-reward-weight';
        readonly svRewardWeightMember: string;
        readonly currentWeight: string;
        readonly svRewardWeight: string;
      }
    | {
        readonly formType: 'offboard';
        readonly offboardMember: string;
      }
    | {
        readonly formType: 'grant-right';
        readonly grantRight: string;
        readonly activityWeight: string;
      }
    | {
        readonly formType: 'revoke-right';
        readonly revokeRight: string;
      }
    | {
        readonly formType: 'config-change';
        readonly configFormData: readonly ConfigChange[];
      }
    | {
        readonly formType: 'create-unallocated-unclaimed-activity-record';
        readonly beneficiary: string;
        readonly amount: string;
        readonly expiresAt: string;
      }
  );

export function ProposalSummary(props: ProposalSummaryProps) {
  const { formType, actionName, url, summary, expiryDate, effectiveDate } = props;

  return (
    <Box data-testid="proposal-summary">
      <Typography variant="h3" mb={8}>
        Proposal Summary
      </Typography>

      <Box>
        <ProposalField id="action" title="Action" value={actionName} />

        <ProposalField id="url" title="URL" value={url} />

        <ProposalField id="summary" title="Summary" value={summary} />

        <ProposalField
          id="expiryDate"
          title="Threshold Deadline"
          subtitle={THRESHOLD_DEADLINE_SUBTITLE}
          value={expiryDate}
        />

        <ProposalField
          id="effectiveDate"
          title="Effective Date"
          value={effectiveDate ?? 'Threshold'}
        />

        {formType === 'sv-reward-weight' && (
          <>
            <ProposalField
              id="svRewardWeightMember"
              title="Member"
              value={props.svRewardWeightMember}
              scrollableIdentifier
            />
            <ProposalField
              id="configChange"
              title="Proposed Changes"
              value={
                <ConfigValuesChanges
                  changes={[
                    {
                      label: 'Super Validator Reward Weight',
                      fieldName: 'svRewardWeight',
                      currentValue: props.currentWeight,
                      newValue: props.svRewardWeight,
                    },
                  ]}
                />
              }
            />
          </>
        )}

        {formType === 'grant-right' && (
          <>
            <ProposalField
              id="grantRight"
              title="Provider Party ID"
              value={props.grantRight}
              scrollableIdentifier
            />
            <ProposalField
              id="grantRightActivityWeight"
              title="Activity Weight"
              value={props.activityWeight}
            />
          </>
        )}

        {formType === 'revoke-right' && (
          <ProposalField
            id="revokeRight"
            title="Featured Application Contract ID"
            value={props.revokeRight}
            scrollableIdentifier
          />
        )}

        {formType === 'offboard' && (
          <ProposalField
            id="offboardMember"
            title="Offboard Member"
            value={props.offboardMember}
            scrollableIdentifier
          />
        )}

        {formType === 'create-unallocated-unclaimed-activity-record' && (
          <>
            <ProposalField
              id="beneficiary"
              title="Beneficiary"
              value={props.beneficiary}
              scrollableIdentifier
            />

            <ProposalField id="amount" title="Amount" value={props.amount} />

            <ProposalField id="expiresAt" title="Must Mint Before" value={props.expiresAt} />
          </>
        )}

        {formType === 'config-change' && (
          <Box mt={4}>
            <ProposalField
              id="configChange"
              title="Proposed Changes"
              value={<ConfigValuesChanges changes={props.configFormData} isSummaryView />}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}

interface ProposalFieldProps {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly value: ReactNode;
  readonly scrollableIdentifier?: boolean;
}

function ProposalField({
  id,
  title,
  subtitle,
  value,
  scrollableIdentifier = false,
}: ProposalFieldProps) {
  return (
    <Box sx={{ minWidth: '80%' }}>
      <Typography variant="h5" id={`${id}-title`} data-testid={`${id}-title`} gutterBottom mb={1} mt={4}>
        {title}
      </Typography>

      <Box>
        {subtitle !== undefined && (
          <Typography variant="body2" id={`${id}-subtitle`} data-testid={`${id}-subtitle`} gutterBottom>
            {subtitle}
          </Typography>
        )}

        {typeof value === 'string' ? (
          scrollableIdentifier ? (
            <Box sx={scrollContainerSx} data-testid={`${id}-field-scroll`}>
              <Typography
                variant="body2"
                color="grey"
                data-testid={`${id}-field`}
                sx={scrollableIdentifierFieldSx}
              >
                {value}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" data-testid={`${id}-field`} color="grey">
              {value}
            </Typography>
          )
        ) : (
          value
        )}
      </Box>
    </Box>
  );
}
