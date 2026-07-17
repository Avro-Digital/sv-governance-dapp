// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useCreateVoteRequest } from '@/hooks/useCreateVoteRequest';
import { buildProposalAction } from '@/lib/proposal-actions';
import type { RequestVoteFormInput } from '@/lib/request-vote-context';
import type { ScanDsoInfoResponse } from '@/lib/scan-types';
import { SignatureRejectedError } from '@/lib/signing';
import { VoteDelegationContextError } from '@/lib/vote-delegation-context';
import type { SupportedActionTag } from '@/types/governance';

type ActionTag = SupportedActionTag;

const ACTION_OPTIONS: readonly { readonly tag: ActionTag; readonly label: string }[] = [
  { tag: 'SRARC_OffboardSv', label: 'Offboard Member' },
  { tag: 'SRARC_GrantFeaturedAppRight', label: 'Feature Application' },
  { tag: 'SRARC_RevokeFeaturedAppRight', label: 'Unfeature Application' },
  {
    tag: 'SRARC_SetConfig',
    label: 'Set Decentralized Synchronizer Operations (DSO) Rules Configuration',
  },
  { tag: 'CRARC_SetConfig', label: 'Set Amulet Rules Configuration' },
  { tag: 'SRARC_UpdateSvRewardWeight', label: 'Update Super Validator Reward Weight' },
  {
    tag: 'SRARC_CreateUnallocatedUnclaimedActivityRecord',
    label: 'Create Unclaimed Activity Record',
  },
];

function toLocalDateTime(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
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

interface Props {
  readonly dsoInfo: ScanDsoInfoResponse;
}

export function CreateVoteRequestForm({ dsoInfo }: Props) {
  const svs = dsoInfo.dso_rules.contract.payload.svs;
  const [expanded, setExpanded] = useState(false);
  const [actionTag, setActionTag] = useState<ActionTag>('SRARC_OffboardSv');
  const [party, setParty] = useState(svs[0]?.[0] ?? '');
  const [provider, setProvider] = useState('');
  const [rightCid, setRightCid] = useState('');
  const [rewardWeight, setRewardWeight] = useState(svs[0]?.[1].svRewardWeight ?? '0');
  const [beneficiary, setBeneficiary] = useState('');
  const [amount, setAmount] = useState('');
  const [summary, setSummary] = useState('');
  const [url, setUrl] = useState('');
  const [expiresAt, setExpiresAt] = useState(() =>
    toLocalDateTime(new Date(Date.now() + 24 * 60 * 60 * 1000)),
  );
  const [customEffectiveAt, setCustomEffectiveAt] = useState(false);
  const [effectiveAt, setEffectiveAt] = useState(() =>
    toLocalDateTime(new Date(Date.now() + 25 * 60 * 60 * 1000)),
  );
  const [mustMintBefore, setMustMintBefore] = useState(() =>
    toLocalDateTime(new Date(Date.now() + 72 * 60 * 60 * 1000)),
  );
  const [configJson, setConfigJson] = useState('{}');
  const [formError, setFormError] = useState<string>();
  const [pendingInput, setPendingInput] = useState<RequestVoteFormInput>();
  const createRequest = useCreateVoteRequest();

  const selectedConfig = useMemo(() => {
    if (actionTag === 'SRARC_SetConfig') {
      return dsoInfo.dso_rules.contract.payload.config;
    }
    if (actionTag === 'CRARC_SetConfig') {
      return dsoInfo.amulet_rules?.contract.payload.configSchedule?.initialValue;
    }
    return undefined;
  }, [actionTag, dsoInfo]);

  useEffect(() => {
    if (selectedConfig !== undefined) {
      setConfigJson(JSON.stringify(selectedConfig, null, 2));
    }
  }, [selectedConfig]);

  const validate = (): string | undefined => {
    const expiry = new Date(expiresAt);
    if (summary.trim().length === 0) return 'Proposal summary is required.';
    if (!URL.canParse(url)) return 'A valid proposal URL is required.';
    if (Number.isNaN(expiry.getTime()) || expiry.getTime() <= Date.now()) {
      return 'Vote request expiry must be in the future.';
    }
    if (customEffectiveAt && new Date(effectiveAt).getTime() <= expiry.getTime()) {
      return 'Effective time must be after vote request expiry.';
    }
    if (
      (actionTag === 'SRARC_OffboardSv' || actionTag === 'SRARC_UpdateSvRewardWeight') &&
      party.length === 0
    ) {
      return 'Select a Super Validator.';
    }
    if (actionTag === 'SRARC_GrantFeaturedAppRight' && provider.trim().length === 0) {
      return 'Provider party is required.';
    }
    if (actionTag === 'SRARC_RevokeFeaturedAppRight' && rightCid.trim().length === 0) {
      return 'Featured App Right contract ID is required.';
    }
    if (
      actionTag === 'SRARC_UpdateSvRewardWeight' &&
      (!Number.isInteger(Number(rewardWeight)) || Number(rewardWeight) < 0)
    ) {
      return 'Reward weight must be a non-negative integer.';
    }
    if (
      actionTag === 'SRARC_CreateUnallocatedUnclaimedActivityRecord' &&
      (beneficiary.trim().length === 0 || Number(amount) <= 0)
    ) {
      return 'Beneficiary and a positive amount are required.';
    }
    if (actionTag === 'SRARC_SetConfig' || actionTag === 'CRARC_SetConfig') {
      if (selectedConfig === undefined) return 'Current configuration is unavailable from Scan.';
      try {
        JSON.parse(configJson);
      } catch {
        return 'Configuration must be valid JSON.';
      }
    }
    return undefined;
  };

  const review = () => {
    const validationError = validate();
    if (validationError !== undefined) {
      setFormError(validationError);
      return;
    }
    const expiry = new Date(expiresAt);
    setFormError(undefined);
    setPendingInput({
      action: buildProposalAction(actionTag, {
        party,
        provider,
        rightCid,
        rewardWeight,
        beneficiary,
        amount,
        summary,
        mustMintBefore,
        configJson,
        ...(selectedConfig !== undefined ? { baseConfig: selectedConfig } : {}),
      }),
      reasonUrl: url.trim(),
      reasonDescription: summary.trim(),
      voteRequestTimeoutMicroseconds: String(
        BigInt(Math.max(1, expiry.getTime() - Date.now())) * 1000n,
      ),
      ...(customEffectiveAt ? { targetEffectiveAt: new Date(effectiveAt).toISOString() } : {}),
    });
  };

  const submit = () => {
    if (pendingInput === undefined) return;
    createRequest.mutate(pendingInput, {
      onSuccess: () => {
        setSummary('');
        setUrl('');
        setPendingInput(undefined);
      },
    });
  };

  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5">Create Vote Request</Typography>
                <Typography variant="body2" color="text.secondary">
                  Create a governance proposal through your VoteDelegation.
                </Typography>
              </Box>
              <Button onClick={() => setExpanded((value) => !value)}>
                {expanded ? 'Cancel' : 'Create proposal'}
              </Button>
            </Box>

            <Collapse in={expanded} unmountOnExit>
              <Stack spacing={3} sx={{ pt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="create-action-label">Action</InputLabel>
                  <Select
                    labelId="create-action-label"
                    label="Action"
                    value={actionTag}
                    onChange={(event) => setActionTag(event.target.value as ActionTag)}
                    inputProps={{ 'data-testid': 'create-action' }}
                  >
                    {ACTION_OPTIONS.map((option) => (
                      <MenuItem key={option.tag} value={option.tag}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {(actionTag === 'SRARC_OffboardSv' ||
                  actionTag === 'SRARC_UpdateSvRewardWeight') && (
                  <FormControl fullWidth>
                    <InputLabel id="create-sv-label">Super Validator</InputLabel>
                    <Select
                      labelId="create-sv-label"
                      label="Super Validator"
                      value={party}
                      onChange={(event) => setParty(event.target.value)}
                    >
                      {svs.map(([partyId, info]) => (
                        <MenuItem key={partyId} value={partyId}>
                          {info.name} ({partyId})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {actionTag === 'SRARC_GrantFeaturedAppRight' && (
                  <TextField
                    label="Provider party"
                    value={provider}
                    onChange={(event) => setProvider(event.target.value)}
                  />
                )}
                {actionTag === 'SRARC_RevokeFeaturedAppRight' && (
                  <TextField
                    label="Featured App Right contract ID"
                    value={rightCid}
                    onChange={(event) => setRightCid(event.target.value)}
                  />
                )}
                {actionTag === 'SRARC_UpdateSvRewardWeight' && (
                  <TextField
                    label="New reward weight"
                    type="number"
                    value={rewardWeight}
                    onChange={(event) => setRewardWeight(event.target.value)}
                  />
                )}
                {actionTag === 'SRARC_CreateUnallocatedUnclaimedActivityRecord' && (
                  <>
                    <TextField
                      label="Beneficiary party"
                      value={beneficiary}
                      onChange={(event) => setBeneficiary(event.target.value)}
                    />
                    <TextField
                      label="Amount"
                      type="number"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                    />
                    <TextField
                      label="Must mint before"
                      type="datetime-local"
                      value={mustMintBefore}
                      onChange={(event) => setMustMintBefore(event.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </>
                )}
                {(actionTag === 'SRARC_SetConfig' || actionTag === 'CRARC_SetConfig') && (
                  <TextField
                    label="Configuration"
                    multiline
                    minRows={12}
                    value={configJson}
                    onChange={(event) => setConfigJson(event.target.value)}
                    inputProps={{ 'data-testid': 'create-config-json' }}
                  />
                )}

                <TextField
                  label="Summary"
                  multiline
                  minRows={2}
                  value={summary}
                  onChange={(event) => setSummary(event.target.value)}
                  inputProps={{ 'data-testid': 'create-reason-summary' }}
                />
                <TextField
                  label="URL"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  inputProps={{ 'data-testid': 'create-reason-url' }}
                />
                <TextField
                  label="Vote request expires at"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(event) => setExpiresAt(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={customEffectiveAt}
                      onChange={(event) => setCustomEffectiveAt(event.target.checked)}
                    />
                  }
                  label="Set a specific effective time"
                />
                {customEffectiveAt && (
                  <TextField
                    label="Effective at"
                    type="datetime-local"
                    value={effectiveAt}
                    onChange={(event) => setEffectiveAt(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                )}

                {formError !== undefined && <Alert severity="warning">{formError}</Alert>}
                {createRequest.isError && (
                  <Alert severity="error">{formatError(createRequest.error)}</Alert>
                )}
                {createRequest.isSuccess && (
                  <Alert severity="success">Vote request created successfully.</Alert>
                )}

                <Button
                  variant="contained"
                  size="large"
                  disabled={createRequest.isPending}
                  onClick={review}
                  data-testid="create-voterequest-submit-button"
                >
                  Review request
                </Button>
              </Stack>
            </Collapse>
          </Stack>
        </CardContent>
      </Card>
      <Dialog
        open={pendingInput !== undefined}
        onClose={() => setPendingInput(undefined)}
        fullWidth
      >
        <DialogTitle>Confirm Your Vote Request</DialogTitle>
        <DialogContent>
          {pendingInput !== undefined && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography>
                <strong>Summary:</strong> {pendingInput.reasonDescription}
              </Typography>
              <Typography>
                <strong>URL:</strong> {pendingInput.reasonUrl}
              </Typography>
              <Box
                component="pre"
                sx={{ overflow: 'auto', p: 2, bgcolor: 'grey.100', borderRadius: 1 }}
              >
                {JSON.stringify(pendingInput.action, null, 2)}
              </Box>
              {createRequest.isError && (
                <Alert severity="error">{formatError(createRequest.error)}</Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingInput(undefined)}>Back</Button>
          <Button variant="contained" onClick={submit} disabled={createRequest.isPending}>
            {createRequest.isPending ? 'Waiting for wallet…' : 'Confirm and sign'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
