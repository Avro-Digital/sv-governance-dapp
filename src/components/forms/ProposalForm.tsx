// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/forms/* (UpdateSvRewardWeightForm,
// OffboardSvForm, GrantRevokeFeaturedAppForm, CreateUnallocatedUnclaimedActivityRecordForm,
// SetDsoConfigRulesForm, SetAmuletConfigRulesForm)
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset
//
// One controlled form covers all seven actions; submission goes through the
// CIP-103 wallet-signing path (VoteDelegation_RequestVote) instead of the SV Admin API.

import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

import {
  DateTimeField,
  EffectiveDateField,
  FormSelectField,
  FormTextField,
  ProposalSummaryField,
  ProposalTypeField,
  type EffectivityValue,
} from '@/components/forms/fields';
import { FormControls } from '@/components/forms/FormControls';
import { FormLayout } from '@/components/forms/FormLayout';
import { JsonDiffAccordion } from '@/components/governance/JsonDiffAccordion';
import { PrettyJsonDiff } from '@/components/governance/PrettyJsonDiff';
import { ProposalSummary, type ProposalSummaryProps } from '@/components/governance/ProposalSummary';
import { useCreateVoteRequest } from '@/hooks/useCreateVoteRequest';
import { buildConfigChanges, formatBasisPoints } from '@/lib/governance-transform';
import { buildProposalAction, createProposalActions } from '@/lib/proposal-actions';
import type { RequestVoteFormInput } from '@/lib/request-vote-context';
import type { ScanDsoInfoResponse } from '@/lib/scan-types';
import { SignatureRejectedError } from '@/lib/signing';
import { VoteDelegationContextError } from '@/lib/vote-delegation-context';
import type { SupportedActionTag } from '@/types/governance';
import { THRESHOLD_DEADLINE_SUBTITLE } from '@/utils/governance-constants';

function toLocalDateTime(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

/** Default threshold deadline from DsoRules `voteRequestTimeout`, or 24h. */
function getInitialExpiration(dsoInfo: ScanDsoInfoResponse): Date {
  const config = dsoInfo.dso_rules.contract.payload.config;
  const timeout = config?.voteRequestTimeout;
  const micros =
    typeof timeout === 'object' && timeout !== null && 'microseconds' in timeout
      ? Number((timeout as { microseconds?: string }).microseconds)
      : NaN;
  const offsetMs = Number.isFinite(micros) && micros > 0 ? micros / 1000 : 24 * 60 * 60 * 1000;
  return new Date(Date.now() + offsetMs);
}

function formatError(error: unknown): string {
  if (error instanceof SignatureRejectedError) {
    return 'Wallet signature was rejected or cancelled.';
  }
  if (error instanceof VoteDelegationContextError) {
    return error.message;
  }
  return error instanceof Error ? error.message : 'Failed to create vote request.';
}

interface ProposalFormProps {
  readonly action: SupportedActionTag;
  readonly dsoInfo: ScanDsoInfoResponse;
}

export function ProposalForm({ action, dsoInfo }: ProposalFormProps) {
  const navigate = useNavigate();
  const svs = dsoInfo.dso_rules.contract.payload.svs;
  const actionName =
    createProposalActions.find((candidate) => candidate.value === action)?.name ?? action;

  const initialExpiration = useMemo(() => getInitialExpiration(dsoInfo), [dsoInfo]);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formError, setFormError] = useState<string>();

  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [expiryDate, setExpiryDate] = useState(() => toLocalDateTime(initialExpiration));
  const [effectivity, setEffectivity] = useState<EffectivityValue>(() => ({
    type: 'custom',
    effectiveDate: toLocalDateTime(new Date(initialExpiration.getTime() + 24 * 60 * 60 * 1000)),
  }));

  const [party, setParty] = useState('');
  const [rewardWeight, setRewardWeight] = useState('');
  const [provider, setProvider] = useState('');
  const [activityWeight, setActivityWeight] = useState('');
  const [rightCid, setRightCid] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [amount, setAmount] = useState('');
  const [mustMintBefore, setMustMintBefore] = useState(() =>
    toLocalDateTime(new Date(Date.now() + 72 * 60 * 60 * 1000)),
  );
  const [configJson, setConfigJson] = useState('{}');

  const createRequest = useCreateVoteRequest();

  const svOptions = useMemo(
    () => svs.map(([partyId, info]) => ({ key: info.name, value: partyId })),
    [svs],
  );

  const baseConfig = useMemo(() => {
    if (action === 'SRARC_SetConfig') {
      return dsoInfo.dso_rules.contract.payload.config;
    }
    if (action === 'CRARC_SetConfig') {
      return dsoInfo.amulet_rules?.contract.payload.configSchedule?.initialValue;
    }
    return undefined;
  }, [action, dsoInfo]);

  useEffect(() => {
    if (baseConfig !== undefined) {
      setConfigJson(JSON.stringify(baseConfig, null, 2));
    }
  }, [baseConfig]);

  const currentWeight = useMemo(() => {
    const entry = svs.find(([partyId]) => partyId === party);
    return formatBasisPoints(entry?.[1].svRewardWeight ?? '');
  }, [svs, party]);

  const parsedConfig = useMemo((): Record<string, unknown> | undefined => {
    if (action !== 'SRARC_SetConfig' && action !== 'CRARC_SetConfig') {
      return undefined;
    }
    try {
      const parsed: unknown = JSON.parse(configJson);
      return typeof parsed === 'object' && parsed !== null
        ? (parsed as Record<string, unknown>)
        : undefined;
    } catch {
      return undefined;
    }
  }, [action, configJson]);

  const validate = (): string | undefined => {
    const expiry = new Date(expiryDate);
    if (summary.trim().length === 0) return 'Proposal summary is required.';
    if (!URL.canParse(url)) return 'A valid proposal URL is required.';
    if (Number.isNaN(expiry.getTime()) || expiry.getTime() <= Date.now()) {
      return 'The threshold deadline must be in the future.';
    }
    if (effectivity.type === 'custom') {
      const effective = new Date(effectivity.effectiveDate ?? '');
      if (Number.isNaN(effective.getTime()) || effective.getTime() <= expiry.getTime()) {
        return 'Effective time must be after the threshold deadline.';
      }
    }
    if ((action === 'SRARC_OffboardSv' || action === 'SRARC_UpdateSvRewardWeight') && party.length === 0) {
      return 'Select a Super Validator member.';
    }
    if (action === 'SRARC_GrantFeaturedAppRight' && provider.trim().length === 0) {
      return 'Provider party is required.';
    }
    if (
      action === 'SRARC_GrantFeaturedAppRight' &&
      activityWeight.trim().length > 0 &&
      (Number.isNaN(Number(activityWeight)) || Number(activityWeight) < 0)
    ) {
      return 'Activity weight must be a non-negative number.';
    }
    if (action === 'SRARC_RevokeFeaturedAppRight' && rightCid.trim().length === 0) {
      return 'Featured App Right contract ID is required.';
    }
    if (
      action === 'SRARC_UpdateSvRewardWeight' &&
      (!Number.isInteger(Number(rewardWeight)) || Number(rewardWeight) < 0)
    ) {
      return 'Reward weight must be a non-negative integer.';
    }
    if (
      action === 'SRARC_CreateUnallocatedUnclaimedActivityRecord' &&
      (beneficiary.trim().length === 0 || Number(amount) <= 0)
    ) {
      return 'Beneficiary and a positive amount are required.';
    }
    if (action === 'SRARC_SetConfig' || action === 'CRARC_SetConfig') {
      if (baseConfig === undefined) return 'Current configuration is unavailable from Scan.';
      if (parsedConfig === undefined) return 'Configuration must be valid JSON.';
    }
    return undefined;
  };

  const buildInput = (): RequestVoteFormInput => {
    const expiry = new Date(expiryDate);
    return {
      action: buildProposalAction(action, {
        party,
        provider: provider.trim(),
        activityWeight,
        rightCid: rightCid.trim(),
        rewardWeight,
        beneficiary: beneficiary.trim(),
        amount,
        summary: summary.trim(),
        mustMintBefore,
        configJson,
        ...(baseConfig !== undefined ? { baseConfig } : {}),
      }),
      reasonUrl: url.trim(),
      reasonDescription: summary.trim(),
      voteRequestTimeoutMicroseconds: String(
        BigInt(Math.max(1, expiry.getTime() - Date.now())) * 1000n,
      ),
      ...(effectivity.type === 'custom' && effectivity.effectiveDate !== undefined
        ? { targetEffectiveAt: new Date(effectivity.effectiveDate).toISOString() }
        : {}),
    };
  };

  const handleSubmit = () => {
    const validationError = validate();
    if (validationError !== undefined) {
      setFormError(validationError);
      return;
    }
    setFormError(undefined);

    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    createRequest.mutate(buildInput(), {
      onSuccess: () => {
        void navigate('/governance/proposals');
      },
    });
  };

  const handleCancel = () => {
    void navigate('/governance/proposals/create');
  };

  const summaryProps = ((): ProposalSummaryProps => {
    const common = {
      actionName,
      url,
      summary,
      expiryDate,
      effectiveDate: effectivity.type === 'custom' ? effectivity.effectiveDate : undefined,
    };

    switch (action) {
      case 'SRARC_UpdateSvRewardWeight':
        return {
          ...common,
          formType: 'sv-reward-weight',
          svRewardWeightMember: party,
          currentWeight,
          svRewardWeight: rewardWeight,
        };
      case 'SRARC_OffboardSv':
        return { ...common, formType: 'offboard', offboardMember: party };
      case 'SRARC_GrantFeaturedAppRight':
        return {
          ...common,
          formType: 'grant-right',
          grantRight: provider,
          activityWeight: activityWeight.trim().length > 0 ? activityWeight : 'Default',
        };
      case 'SRARC_RevokeFeaturedAppRight':
        return { ...common, formType: 'revoke-right', revokeRight: rightCid };
      case 'SRARC_CreateUnallocatedUnclaimedActivityRecord':
        return {
          ...common,
          formType: 'create-unallocated-unclaimed-activity-record',
          beneficiary,
          amount,
          expiresAt: mustMintBefore,
        };
      case 'SRARC_SetConfig':
      case 'CRARC_SetConfig':
        return {
          ...common,
          formType: 'config-change',
          configFormData: buildConfigChanges(baseConfig, parsedConfig ?? {}),
        };
    }
  })();

  return (
    <FormLayout onSubmit={handleSubmit} id={`create-proposal-form-${action}`}>
      {showConfirmation ? (
        <ProposalSummary {...summaryProps} />
      ) : (
        <>
          <ProposalTypeField id="create-proposal-action" value={actionName} />

          {(action === 'SRARC_OffboardSv' || action === 'SRARC_UpdateSvRewardWeight') && (
            <FormSelectField
              id="create-proposal-member"
              title="Member"
              options={svOptions}
              value={party}
              onChange={(value) => {
                setParty(value);
                if (action === 'SRARC_UpdateSvRewardWeight') {
                  setRewardWeight('');
                }
              }}
              placeholder="Select a Super Validator"
            />
          )}

          {action === 'SRARC_UpdateSvRewardWeight' && (
            <FormTextField
              id="create-proposal-weight"
              title="Weight"
              value={rewardWeight}
              onChange={setRewardWeight}
              {...(party.length > 0 ? { subtitle: `Current Weight: ${currentWeight}` } : {})}
            />
          )}

          {action === 'SRARC_GrantFeaturedAppRight' && (
            <>
              <FormTextField
                id="create-proposal-provider"
                title="Provider"
                value={provider}
                onChange={setProvider}
              />
              <FormTextField
                id="create-proposal-activity-weight"
                title="Activity Weight"
                value={activityWeight}
                onChange={setActivityWeight}
                subtitle="Optional; leave empty to use the default weight"
              />
            </>
          )}

          {action === 'SRARC_RevokeFeaturedAppRight' && (
            <FormTextField
              id="create-proposal-right-cid"
              title="Featured Application Contract ID"
              value={rightCid}
              onChange={setRightCid}
            />
          )}

          {action === 'SRARC_CreateUnallocatedUnclaimedActivityRecord' && (
            <>
              <FormTextField
                id="create-proposal-beneficiary"
                title="Beneficiary"
                value={beneficiary}
                onChange={setBeneficiary}
              />
              <FormTextField
                id="create-proposal-amount"
                title="Amount"
                type="number"
                value={amount}
                onChange={setAmount}
              />
              <FormTextField
                id="create-proposal-mint-before"
                title="Must Mint Before"
                type="datetime-local"
                value={mustMintBefore}
                onChange={setMustMintBefore}
              />
            </>
          )}

          {(action === 'SRARC_SetConfig' || action === 'CRARC_SetConfig') && (
            <>
              <FormTextField
                id="create-proposal-config-json"
                title="Configuration"
                value={configJson}
                onChange={setConfigJson}
                multiline
                minRows={12}
                {...(parsedConfig === undefined ? { error: 'Configuration must be valid JSON.' } : {})}
              />
              <JsonDiffAccordion variant="form">
                {baseConfig !== undefined && parsedConfig !== undefined ? (
                  <PrettyJsonDiff
                    changes={{ newConfig: parsedConfig, actualConfig: baseConfig }}
                  />
                ) : null}
              </JsonDiffAccordion>
            </>
          )}

          <DateTimeField
            id="create-proposal-expiry-date"
            title="Threshold Deadline"
            description={THRESHOLD_DEADLINE_SUBTITLE}
            value={expiryDate}
            onChange={setExpiryDate}
          />

          <EffectiveDateField
            id="create-proposal-effective-date"
            value={effectivity}
            onChange={setEffectivity}
            initialEffectiveDate={toLocalDateTime(
              new Date(initialExpiration.getTime() + 24 * 60 * 60 * 1000),
            )}
          />

          <ProposalSummaryField
            id="create-proposal-summary"
            value={summary}
            onChange={setSummary}
          />

          <FormTextField id="create-proposal-url" title="URL" value={url} onChange={setUrl} />
        </>
      )}

      {formError !== undefined && (
        <Alert severity="warning" data-testid="create-proposal-form-error">
          {formError}
        </Alert>
      )}
      {createRequest.isError && (
        <Alert severity="error" data-testid="create-proposal-submission-error">
          {formatError(createRequest.error)}
        </Alert>
      )}

      <FormControls
        showConfirmation={showConfirmation}
        isSubmitting={createRequest.isPending}
        submittingLabel="Waiting for wallet…"
        onCancel={handleCancel}
        onEdit={() => {
          setShowConfirmation(false);
        }}
      />
    </FormLayout>
  );
}
