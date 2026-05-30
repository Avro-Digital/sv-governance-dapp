// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/governance/ProposalListingSection.tsx
// at commit 8048815509402e52fc218ce43a7707412d648b56. Original: Apache 2.0 (c) Digital Asset

import { memo, useEffect, useMemo, useRef, type PropsWithChildren } from 'react';


import InfoOutlined from '@mui/icons-material/InfoOutlined';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography, { type TypographyProps } from '@mui/material/Typography';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';

import { CopyableIdentifier } from '@/components/governance/CopyableIdentifier';
import { PageSectionHeader } from '@/components/governance/PageSectionHeader';
import { VoteStats } from '@/components/governance/VoteStats';
import { sortProposals, type ProposalSortOrder } from '@/lib/governance-sort';
import type { ProposalListingItem, ProposalListingStatus, YourVoteStatus } from '@/types/governance';

export type { ProposalSortOrder };

interface ProposalListingSectionProps {
  readonly sectionTitle: string;
  readonly data: readonly ProposalListingItem[];
  readonly noDataMessage: string;
  readonly uniqueId: string;
  readonly showThresholdDeadline?: boolean;
  readonly showVoteStats?: boolean;
  readonly showStatus?: boolean;
  readonly sortOrder?: ProposalSortOrder;
  readonly fetchNextPage?: () => void;
  readonly hasNextPage?: boolean;
  readonly isFetchingNextPage?: boolean;
  readonly pageCount?: number;
}

const tableBodyTypography: TypographyProps = {
  fontSize: 14,
  lineHeight: 2,
};

function TableBodyTypography({ children }: PropsWithChildren) {
  return <Typography {...tableBodyTypography}>{children}</Typography>;
}

function getGridTemplate(
  showThresholdDeadline?: boolean,
  showStatus?: boolean,
  showVoteStats?: boolean,
): string {
  const columns = [
    'minmax(180px, 1.5fr)',
    'minmax(160px, 1.1fr)',
  ];

  if (showThresholdDeadline === true) {
    columns.push('minmax(140px, 0.95fr)');
  }
  columns.push('minmax(130px, 0.9fr)');
  if (showStatus === true) {
    columns.push('minmax(100px, 0.65fr)');
  }
  if (showVoteStats === true) {
    columns.push('minmax(110px, 0.75fr)');
  }
  columns.push('minmax(100px, 0.65fr)');

  return columns.join(' ');
}

const gridRowSx = {
  display: 'grid',
  alignItems: 'center',
  columnGap: 2,
  px: 1,
} as const;

const headCellSx = {
  border: 0,
  minWidth: 0,
  py: 1.5,
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

const bodyCellSx = {
  border: 0,
  minWidth: 0,
  py: 0,
  overflow: 'hidden',
} as const;

interface InfoBoxProps {
  readonly info: string;
  readonly 'data-testid': string;
}

function InfoBox({ info, 'data-testid': testId }: InfoBoxProps) {
  return (
    <Stack
      gap={1}
      direction="row"
      alignItems="center"
      sx={{
        width: 'max-content',
        borderColor: 'secondary.main',
        borderWidth: 2,
        borderStyle: 'solid',
        borderRadius: 1,
        p: 2,
      }}
      data-testid={testId}
    >
      <InfoOutlined color="secondary" fontSize="small" />
      <Typography fontWeight="bold" fontSize={14}>
        {info}
      </Typography>
    </Stack>
  );
}

interface VoteRowProps {
  readonly actionName: string;
  readonly description?: string | undefined;
  readonly contractId: string;
  readonly status: ProposalListingStatus;
  readonly uniqueId: string;
  readonly voteStats: Record<YourVoteStatus, number>;
  readonly voteTakesEffect: string;
  readonly votingThresholdDeadline: string;
  readonly yourVote: YourVoteStatus;
  readonly gridTemplate: string;
  readonly showThresholdDeadline?: boolean | undefined;
  readonly showStatus?: boolean | undefined;
  readonly showVoteStats?: boolean | undefined;
}

const VoteRow = memo(function VoteRow(props: VoteRowProps) {
  const {
    actionName,
    description,
    contractId,
    status,
    uniqueId,
    voteStats,
    voteTakesEffect,
    votingThresholdDeadline,
    yourVote,
    gridTemplate,
    showThresholdDeadline,
    showStatus,
    showVoteStats,
  } = props;

  const navigate = useNavigate();

  return (
    <TableRow
      onClick={() => {
        void navigate(`/votes/${encodeURIComponent(contractId)}`);
      }}
      sx={{
        ...gridRowSx,
        gridTemplateColumns: gridTemplate,
        borderRadius: 1,
        border: 1,
        borderColor: 'divider',
        py: 1.25,
        cursor: 'pointer',
        '&:hover': { backgroundColor: 'action.hover' },
      }}
      data-testid={`${uniqueId}-row`}
    >
      <TableCell data-testid={`${uniqueId}-row-action-name`} sx={bodyCellSx}>
        <Typography
          {...tableBodyTypography}
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {actionName}
        </Typography>
        {description !== undefined && description.length > 0 && (
          <Typography
            data-testid={`${uniqueId}-row-description`}
            sx={{
              fontSize: 12,
              color: 'text.secondary',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.4,
            }}
          >
            {description}
          </Typography>
        )}
      </TableCell>
      <TableCell data-testid={`${uniqueId}-row-contract-id`} sx={bodyCellSx}>
        <CopyableIdentifier
          value={contractId}
          maxDisplayLength={16}
          size="small"
          data-testid={`${uniqueId}-row-contract-id-value`}
        />
      </TableCell>
      {showThresholdDeadline === true && (
        <TableCell data-testid={`${uniqueId}-row-voting-threshold-deadline`} sx={bodyCellSx}>
          <TableBodyTypography>{votingThresholdDeadline}</TableBodyTypography>
        </TableCell>
      )}
      <TableCell data-testid={`${uniqueId}-row-vote-takes-effect`} sx={bodyCellSx}>
        <TableBodyTypography>{voteTakesEffect}</TableBodyTypography>
      </TableCell>
      {showStatus === true && (
        <TableCell data-testid={`${uniqueId}-row-status`} sx={bodyCellSx}>
          <TableBodyTypography>{status}</TableBodyTypography>
        </TableCell>
      )}
      {showVoteStats === true && (
        <TableCell data-testid={`${uniqueId}-row-all-votes`} sx={bodyCellSx}>
          <Stack>
            <VoteStats
              vote="accepted"
              count={voteStats.accepted}
              typography={tableBodyTypography}
              data-testid={`${uniqueId}-row-all-votes-stats-accepted`}
            />
            <VoteStats
              vote="rejected"
              count={voteStats.rejected}
              typography={tableBodyTypography}
              data-testid={`${uniqueId}-row-all-votes-stats-rejected`}
            />
          </Stack>
        </TableCell>
      )}
      <TableCell data-testid={`${uniqueId}-row-your-vote`} sx={bodyCellSx}>
        <VoteStats
          vote={yourVote}
          typography={tableBodyTypography}
          data-testid={`${uniqueId}-row-your-vote-stats`}
        />
      </TableCell>
    </TableRow>
  );
});

export function ProposalListingSection(props: ProposalListingSectionProps) {
  const {
    sectionTitle,
    data,
    noDataMessage,
    uniqueId,
    showThresholdDeadline,
    showVoteStats,
    showStatus,
    sortOrder,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    pageCount,
  } = props;

  const sectionRef = useRef<HTMLDivElement>(null);
  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage === true && isFetchingNextPage !== true && fetchNextPage !== undefined) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const sortedData = useMemo(() => sortProposals(data, sortOrder), [data, sortOrder]);

  const gridTemplate = getGridTemplate(showThresholdDeadline, showStatus, showVoteStats);
  const supportsInfiniteScroll = fetchNextPage !== undefined;

  return (
    <Box ref={sectionRef} sx={{ mb: 6 }} data-testid={`${uniqueId}-section`}>
      <PageSectionHeader title={sectionTitle} data-testid={`${uniqueId}-section`} />

      {sortedData.length === 0 && hasNextPage !== true ? (
        <InfoBox info={noDataMessage} data-testid={`${uniqueId}-section-info`} />
      ) : (
        <>
          <TableContainer sx={{ overflowX: 'auto' }} data-testid={`${uniqueId}-section-table`}>
            <Table sx={{ minWidth: 960 }}>
              <TableHead>
                <TableRow sx={{ ...gridRowSx, gridTemplateColumns: gridTemplate, mb: 1 }}>
                  <TableCell sx={headCellSx}>ACTION</TableCell>
                  <TableCell sx={headCellSx}>CONTRACT ID</TableCell>
                  {showThresholdDeadline === true && (
                    <TableCell sx={headCellSx}>THRESHOLD DEADLINE</TableCell>
                  )}
                  <TableCell sx={headCellSx}>EFFECTIVE AT</TableCell>
                  {showStatus === true && <TableCell sx={headCellSx}>STATUS</TableCell>}
                  {showVoteStats === true && <TableCell sx={headCellSx}>VOTES</TableCell>}
                  <TableCell sx={headCellSx}>YOUR VOTE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ display: 'contents' }}>
                {sortedData.map((vote) => (
                  <VoteRow
                    key={vote.contractId}
                    actionName={vote.actionName}
                    {...(vote.description !== undefined ? { description: vote.description } : {})}
                    contractId={vote.contractId}
                    uniqueId={uniqueId}
                    votingThresholdDeadline={vote.votingThresholdDeadline}
                    voteTakesEffect={vote.voteTakesEffect}
                    yourVote={vote.yourVote}
                    status={vote.status}
                    voteStats={vote.voteStats}
                    gridTemplate={gridTemplate}
                    showVoteStats={showVoteStats}
                    showThresholdDeadline={showThresholdDeadline}
                    showStatus={showStatus}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {supportsInfiniteScroll && (
            <Box
              ref={ref}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                pt: 2,
                minHeight: 32,
              }}
            >
              {isFetchingNextPage === true || (inView && hasNextPage === true) ? (
                <CircularProgress size={24} />
              ) : hasNextPage === true ? (
                <Typography fontSize={14} color="text.secondary">
                  More results available
                </Typography>
              ) : (pageCount ?? 0) > 1 ? (
                <Stack alignItems="center" gap={0.5}>
                  <Typography fontSize={14} color="text.secondary">
                    You&apos;ve reached the end
                  </Typography>
                  <Typography
                    fontSize={13}
                    color="primary.main"
                    sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                    onClick={() => {
                      sectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Back to top
                  </Typography>
                </Stack>
              ) : null}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
