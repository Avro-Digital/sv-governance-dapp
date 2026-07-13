// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/votes/VoteForm.tsx @ canton-network/splice 80488155

import { useEffect, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import { useCastVote } from '@/hooks/useCastVote';
import { CastVoteContextError } from '@/lib/cast-vote-context';
import type { ScanVote } from '@/lib/scan-types';
import { SignatureRejectedError } from '@/lib/signing';
import { displayLinkUrl } from '@/utils/display-url';

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
      : error.message;
  }
  return 'Unable to cast vote';
}

interface VoteFormProps {
  readonly vote?: ScanVote | undefined;
  readonly voteRequestCid: string;
}

export function VoteForm({ vote, voteRequestCid }: VoteFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [voteEditing, setVoteEditing] = useState<'accept' | 'reject' | undefined>(undefined);
  const [reasonUrl, setReasonUrl] = useState('');
  const [reasonBody, setReasonBody] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const castVote = useCastVote(voteRequestCid);

  const voteFromLedger = vote !== undefined ? (vote.accept ? 'accept' : 'reject') : undefined;

  const startEditing = () => {
    setVoteEditing(voteFromLedger);
    setReasonUrl(vote?.reason.url ?? '');
    setReasonBody(vote?.reason.body ?? '');
    setSubmitError(null);
    setIsEditing(true);
  };

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    value: 'accept' | 'reject' | null,
  ) => {
    if (value !== null) {
      setVoteEditing(value);
    }
  };

  const handleConfirmationAccept = async () => {
    if (voteEditing === undefined) {
      return;
    }

    setSubmitError(null);
    try {
      await castVote.mutateAsync({
        voteRequestContractId: voteRequestCid,
        accepted: voteEditing === 'accept',
        reasonUrl,
        reasonDescription: reasonBody,
      });
      setConfirmDialogOpen(false);
      setIsEditing(false);
    } catch (error) {
      setSubmitError(formatCastVoteError(error));
      setConfirmDialogOpen(false);
    }
  };

  useEffect(() => {
    if (castVote.isSuccess) {
      setIsEditing(false);
    }
  }, [castVote.isSuccess]);

  const displayVoteReasonUrl = vote !== undefined ? displayLinkUrl(vote.reason.url) : '';

  return (
    <>
      <Typography variant="h5">
        {vote !== undefined ? 'Your Vote ' : 'You have not voted yet '}
        {!isEditing &&
          (vote !== undefined ? (
            <Button
              id="edit-vote-button"
              onClick={startEditing}
              variant="outlined"
              size="small"
              sx={{ marginLeft: 1 }}
              startIcon={<EditIcon fontSize="small" />}
            >
              Edit
            </Button>
          ) : (
            <Button id="cast-vote-button" size="small" variant="contained" onClick={startEditing} sx={{ ml: 1 }}>
              vote
            </Button>
          ))}
      </Typography>

      {submitError !== null && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {submitError}
        </Alert>
      )}

      {castVote.isSuccess && (
        <Alert severity="success" sx={{ mt: 2 }} data-testid="vote-submission-success">
          Vote successfully updated!
        </Alert>
      )}

      <Stack direction="column" mb={4} spacing={1}>
        <TableContainer>
          <Table style={{ tableLayout: 'auto' }} className="sv-voting-table">
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography variant="h6">Your Vote</Typography>
                </TableCell>
                <TableCell>
                  <ToggleButtonGroup
                    value={isEditing ? voteEditing : voteFromLedger}
                    exclusive
                    onChange={handleChange}
                    aria-label="Vote decision"
                    disabled={!isEditing || castVote.isPending}
                  >
                    <ToggleButton id="reject-vote-button" color="error" value="reject">
                      <ClearIcon />
                      Reject
                    </ToggleButton>
                    <ToggleButton id="accept-vote-button" color="success" value="accept">
                      <CheckIcon />
                      Accept
                    </ToggleButton>
                  </ToggleButtonGroup>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="h6">Vote Reason Summary</Typography>
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      sx={{ width: '100%' }}
                      id="vote-reason-body"
                      rows={4}
                      multiline
                      onChange={(event) => {
                        setReasonBody(event.target.value);
                      }}
                      value={reasonBody}
                      disabled={castVote.isPending}
                    />
                  ) : (
                    <Typography id="vote-request-modal-vote-reason-body" variant="h6">
                      {vote?.reason.body ?? ''}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="h6">Vote Reason URL</Typography>
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <TextField
                      sx={{ width: '100%' }}
                      id="vote-reason-url"
                      onChange={(event) => {
                        setReasonUrl(event.target.value);
                      }}
                      value={reasonUrl}
                      disabled={castVote.isPending}
                    />
                  ) : displayVoteReasonUrl.length > 0 ? (
                    <Typography id="vote-request-modal-vote-reason-url" variant="h6">
                      {displayVoteReasonUrl}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
              {isEditing && (
                <TableRow>
                  <TableCell />
                  <TableCell>
                    <Stack direction="row" spacing={2}>
                      <Button variant="outlined" onClick={() => setIsEditing(false)} disabled={castVote.isPending}>
                        Cancel
                      </Button>
                      <Button
                        id="save-vote-button"
                        variant="contained"
                        endIcon={<SendIcon />}
                        onClick={() => setConfirmDialogOpen(true)}
                        disabled={castVote.isPending || voteEditing === undefined}
                      >
                        Save
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Your Vote</DialogTitle>
        <DialogContent>
          <Typography variant="h6">
            Are you sure you want to {voteEditing} the changes proposed in this vote?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void handleConfirmationAccept()} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
