// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/common/frontend/src/components/votes/VoteModalContent.tsx @ canton-network/splice 80488155

import type { ReactElement, ReactNode } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import dayjs from 'dayjs';

import { ActionView } from '@/components/votes/ActionView';
import { CopyableTypography } from '@/components/votes/CopyableTypography';
import { DateWithDurationDisplay } from '@/components/votes/DateWithDurationDisplay';
import { PartyId } from '@/components/votes/PartyId';
import type { ScanActionRequiringConfirmation, ScanVote, ScanVoteReason } from '@/lib/scan-types';
import { displayLinkUrl } from '@/utils/display-url';

interface VoteModalContentProps {
  readonly voteRequestContractId: string;
  readonly action: ScanActionRequiringConfirmation;
  readonly requester: string;
  readonly getMemberName: (partyId: string) => string;
  readonly reason: ScanVoteReason;
  readonly voteBefore: Date;
  readonly rejectedVotes: readonly ScanVote[];
  readonly acceptedVotes: readonly ScanVote[];
  readonly voteForm?: (voteRequestContractId: string, currentSvVote: ScanVote | undefined) => ReactNode;
  readonly curSvVote?: ScanVote | undefined;
  readonly effectiveAt?: Date | undefined;
  readonly dsoConfig?: Record<string, unknown> | undefined;
  /** Open inflight requests vs closed results from vote-results API. */
  readonly expiryContext?: 'open' | 'closed';
  /** When `expiryContext` is `closed` and outcome is `VRO_Expired`. */
  readonly expiredWithoutResolution?: boolean;
}

export function VoteModalContent({
  voteRequestContractId,
  action,
  requester,
  getMemberName,
  reason,
  voteBefore,
  rejectedVotes,
  acceptedVotes,
  voteForm,
  curSvVote,
  effectiveAt,
  dsoConfig,
  expiryContext = 'open',
  expiredWithoutResolution = false,
}: VoteModalContentProps) {
  const proposalUrl = displayLinkUrl(reason.url);

  return (
    <CardContent sx={{ px: { xs: 2, md: 8 } }}>
      <Stack direction="column" mb={4} spacing={1}>
        <Typography variant="h5">Requested Action</Typography>
        <ActionView action={action} dsoConfig={dsoConfig} />
      </Stack>

      <Stack direction="column" mb={4} spacing={1}>
        <Typography variant="h5">Request Information</Typography>
        <TableContainer>
          <Table style={{ tableLayout: 'auto' }} className="sv-voting-table">
            <TableBody>
              <TableRow>
                <TableCell>
                  <Typography variant="h6">Contract Id</Typography>
                </TableCell>
                <TableCell>
                  {voteRequestContractId.length > 0 ? (
                    <CopyableTypography
                      variant="body2"
                      id="vote-request-modal-content-contract-id"
                      text={voteRequestContractId}
                      maxWidth="320px"
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="h6">Requested by</Typography>
                </TableCell>
                <TableCell>
                  <PartyId id="vote-request-modal-requested-by" partyId={requester} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="h6">Proposal Summary</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="h6" id="vote-request-modal-reason-body">
                    {reason.body}
                  </Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="h6">Proposal URL</Typography>
                </TableCell>
                <TableCell>
                  {proposalUrl.length > 0 ? (
                    <Link
                      href={proposalUrl}
                      id="vote-request-modal-reason-url"
                      data-testid="vote-request-modal-reason-url"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {proposalUrl}
                    </Link>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="h6">Expires At</Typography>
                </TableCell>
                <TableCell>
                  <ExpiresAtDisplay
                    voteBefore={voteBefore}
                    expiryContext={expiryContext}
                    expiredWithoutResolution={expiredWithoutResolution}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="h6">Effective At</Typography>
                </TableCell>
                <TableCell>
                  {effectiveAt !== undefined ? (
                    <DateWithDurationDisplay
                      datetime={effectiveAt}
                      enableDuration
                      id="vote-request-modal-effective-at"
                    />
                  ) : (
                    <Typography id="vote-request-modal-effective-at">threshold</Typography>
                  )}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Typography variant="h6">Current Vote Status</Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={4} direction="row">
                    <Typography id="vote-request-modal-rejected-count" variant="h6">
                      <ClearIcon color="error" fontSize="inherit" /> {rejectedVotes.length}
                    </Typography>
                    <Typography id="vote-request-modal-accepted-count" variant="h6">
                      <CheckIcon color="success" fontSize="inherit" /> {acceptedVotes.length}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>

      {voteForm !== undefined && (
        <Stack>{voteForm(voteRequestContractId, curSvVote)}</Stack>
      )}

      <Stack direction="column" mb={4} spacing={1}>
        <Typography variant="h5">Votes</Typography>
        <TableContainer>
          <Table style={{ tableLayout: 'fixed' }} className="sv-accepted-vote-table">
            <TableHead>
              <TableRow>
                <TableCell>Super Validator</TableCell>
                <TableCell>Super Validator Party ID</TableCell>
                <TableCell>Reason Summary</TableCell>
                <TableCell>Reason URL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <VoteRows
                icon={<CheckIcon color="success" fontSize="inherit" />}
                votesTitle="Accepted"
                votes={acceptedVotes}
                getMemberName={getMemberName}
              />
              <VoteRows
                icon={<ClearIcon color="error" fontSize="inherit" />}
                votesTitle="Rejected"
                votes={rejectedVotes}
                getMemberName={getMemberName}
              />
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </CardContent>
  );
}

function ExpiresAtDisplay({
  voteBefore,
  expiryContext,
  expiredWithoutResolution,
}: {
  readonly voteBefore: Date;
  readonly expiryContext: 'open' | 'closed';
  readonly expiredWithoutResolution: boolean;
}) {
  const pastDeadline = dayjs().isAfter(voteBefore);

  if (expiryContext === 'closed') {
    if (expiredWithoutResolution) {
      return (
        <Typography
          variant="h6"
          id="vote-request-modal-expires-at"
          data-testid="vote-request-modal-expires-at"
        >
          Expired
        </Typography>
      );
    }

    if (pastDeadline) {
      return (
        <Typography
          variant="h6"
          id="vote-request-modal-expires-at"
          data-testid="vote-request-modal-expires-at"
        >
          Did not expire
        </Typography>
      );
    }

    return (
      <DateWithDurationDisplay
        datetime={voteBefore}
        enableDuration
        id="vote-request-modal-expires-at"
      />
    );
  }

  if (pastDeadline) {
    return (
      <Typography
        variant="h6"
        id="vote-request-modal-expires-at"
        data-testid="vote-request-modal-expires-at"
      >
        Expired
      </Typography>
    );
  }

  return (
    <DateWithDurationDisplay
      datetime={voteBefore}
      enableDuration
      id="vote-request-modal-expires-at"
    />
  );
}

interface VoteRowProps {
  readonly svName: string;
  readonly sv: string;
  readonly reasonBody: string;
  readonly reasonUrl: string;
}

export function VoteRow({ svName, sv, reasonBody, reasonUrl }: VoteRowProps) {
  const sanitizedUrl = displayLinkUrl(reasonUrl);

  return (
    <TableRow className="vote-table-row">
      <TableCell className="sv-name">{svName}</TableCell>
      <TableCell>
        <PartyId partyId={sv} className="sv-party" />
      </TableCell>
      <TableCell className="vote-reason-body">{reasonBody}</TableCell>
      <TableCell className="url">
        {sanitizedUrl.length > 0 ? (
          <Link data-testid="vote-row-reason-url" href={sanitizedUrl} target="_blank" rel="noopener noreferrer">
            {sanitizedUrl}
          </Link>
        ) : (
          '—'
        )}
      </TableCell>
    </TableRow>
  );
}

function VoteRows({
  icon,
  votes,
  votesTitle,
  getMemberName,
}: {
  readonly icon: ReactElement;
  readonly votes: readonly ScanVote[];
  readonly votesTitle: string;
  readonly getMemberName: (svParty: string) => string;
}) {
  return (
    <>
      {votes.length > 0 && (
        <TableRow className="vote-table-row">
          <TableCell className="sv-name" colSpan={4}>
            <Typography variant="h6">
              {icon} {votesTitle}
            </Typography>
          </TableCell>
        </TableRow>
      )}
      {votes.map((vote) => (
        <VoteRow
          key={vote.sv}
          sv={vote.sv}
          svName={getMemberName(vote.sv)}
          reasonBody={vote.reason.body}
          reasonUrl={vote.reason.url}
        />
      ))}
    </>
  );
}
