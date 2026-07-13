// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/governance/ProposalVoteForm.tsx
// at commit 8048815509402e52fc218ce43a7707412d648b56. Original: Apache 2.0 (c) Digital Asset

import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useCastVote } from '@/hooks/useCastVote';
import { CastVoteContextError } from '@/lib/cast-vote-context';
import { SignatureRejectedError } from '@/lib/signing';
import type { ProposalVote, YourVoteStatus } from '@/types/governance';
import { isValidUrl } from '@/utils/validations';

function formatCastVoteError(error: unknown): string {
  if (error instanceof SignatureRejectedError) {
    return 'signature_rejected: Wallet cancelled or rejected the signature request.';
  }
  if (error instanceof CastVoteContextError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message === 'not implemented'
      ? 'External signing is not yet implemented (Milestone 2).'
      : `Something went wrong: ${error.message}`;
  }
  return 'Something went wrong: Unable to cast vote';
}

interface ProposalVoteFormProps {
  readonly voteRequestContractId: string;
  readonly currentSvPartyId: string;
  readonly votes: readonly ProposalVote[];
  readonly onSubmissionComplete?: (() => void) | undefined;
}

export function ProposalVoteForm({
  voteRequestContractId,
  currentSvPartyId,
  votes,
  onSubmissionComplete,
}: ProposalVoteFormProps) {
  const yourVote = votes.find((vote) => vote.sv === currentSvPartyId);
  const initialVote: YourVoteStatus = yourVote?.vote ?? 'no-vote';

  const [reason, setReason] = useState(yourVote?.reason?.body ?? '');
  const [url, setUrl] = useState(yourVote?.reason?.url ?? '');
  const [urlError, setUrlError] = useState<string | undefined>(undefined);

  const castVote = useCastVote(voteRequestContractId);

  useEffect(() => {
    if (castVote.isSuccess || castVote.isError) {
      onSubmissionComplete?.();
    }
  }, [castVote.isSuccess, castVote.isError, onSubmissionComplete]);

  const validateUrl = (value: string): boolean => {
    if (value.trim().length === 0 || isValidUrl(value)) {
      setUrlError(undefined);
      return true;
    }
    setUrlError('Invalid URL');
    return false;
  };

  const handleSubmit = async (accepted: boolean): Promise<void> => {
    if (!validateUrl(url)) {
      return;
    }
    try {
      await castVote.mutateAsync({
        voteRequestContractId,
        accepted,
        reasonUrl: url,
        reasonDescription: reason,
      });
    } catch {
      // Error state is surfaced via castVote.isError below.
    }
  };

  if (castVote.isSuccess) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }} data-testid="submission-message">
        <Alert severity="success" data-testid="vote-submission-success">
          Vote successfully updated!
        </Alert>
      </Box>
    );
  }

  if (castVote.isError) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }} data-testid="submission-message">
        <Alert severity="error" data-testid="vote-submission-error">
          {formatCastVoteError(castVote.error)}
        </Alert>
      </Box>
    );
  }

  const isValid = reason.trim().length > 0 && urlError === undefined;

  return (
    <Box
      data-testid="your-vote-form"
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
    >
      {initialVote !== 'no-vote' && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You previously voted: {initialVote}
        </Typography>
      )}

      <Stack gap={3} sx={{ width: '100%', maxWidth: 480 }}>
        <Stack gap={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            Reason
          </Typography>
          <TextField
            multiline
            rows={4}
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
            }}
            inputProps={{ 'data-testid': 'your-vote-reason-input' }}
            fullWidth
          />
        </Stack>

        <Stack gap={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            Vote Reason URL
          </Typography>
          <TextField
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              validateUrl(event.target.value);
            }}
            error={urlError !== undefined}
            helperText={urlError}
            inputProps={{ 'data-testid': 'your-vote-url-input' }}
            fullWidth
          />
        </Stack>

        <Stack direction="row" gap={2} justifyContent="center" sx={{ pt: 1 }}>
          {castVote.isPending ? (
            <Typography color="text.secondary">Submitting…</Typography>
          ) : (
            <>
              <Button
                variant="contained"
                disabled={!isValid}
                onClick={() => {
                  void handleSubmit(true);
                }}
                data-testid="your-vote-accept"
              >
                Accept
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                disabled={!isValid}
                onClick={() => {
                  void handleSubmit(false);
                }}
                data-testid="your-vote-reject"
              >
                Reject
              </Button>
            </>
          )}
        </Stack>

        <Typography variant="caption" color="text.secondary" textAlign="center">
          Votes will be signed externally via wallet gateway once Milestone 2 is complete.
        </Typography>
      </Stack>
    </Box>
  );
}
