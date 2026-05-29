// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/beta/VoteStats.tsx
// at commit 8048815509402e52fc218ce43a7707412d648b56. Original: Apache 2.0 (c) Digital Asset

import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Stack from '@mui/material/Stack';
import Typography, { type TypographyProps } from '@mui/material/Typography';

import type { YourVoteStatus } from '@/types/governance';

interface VoteStatsProps {
  readonly vote: YourVoteStatus;
  readonly noVoteMessage?: string;
  readonly count?: number;
  readonly typography?: TypographyProps;
  readonly 'data-testid': string;
}

export function VoteStats({
  vote,
  noVoteMessage = 'No Vote',
  count,
  typography,
  'data-testid': testId,
}: VoteStatsProps) {
  if (vote === 'accepted') {
    return (
      <Stack direction="row" gap="4px" alignItems="center" data-testid={testId}>
        <CheckCircleOutlineIcon
          fontSize="small"
          color="success"
          data-testid={`${testId}-accepted-icon`}
        />
        <Typography {...typography} data-testid={`${testId}-value`}>
          {count !== undefined ? `${count} ` : ''}Accepted
        </Typography>
      </Stack>
    );
  }

  if (vote === 'rejected') {
    return (
      <Stack direction="row" gap="4px" alignItems="center" data-testid={testId}>
        <CancelOutlinedIcon
          fontSize="small"
          color="error"
          data-testid={`${testId}-rejected-icon`}
        />
        <Typography {...typography} data-testid={`${testId}-value`}>
          {count !== undefined ? `${count} ` : ''}Rejected
        </Typography>
      </Stack>
    );
  }

  return (
    <Typography {...typography} data-testid={`${testId}-value`}>
      {noVoteMessage}
    </Typography>
  );
}
