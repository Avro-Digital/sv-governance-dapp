// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/beta/CopyableIdentifier.tsx
// at commit 8048815509402e52fc218ce43a7707412d648b56. Original: Apache 2.0 (c) Digital Asset

import ContentCopy from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

export type CopyableIdentifierSize = 'small' | 'large';

interface CopyableIdentifierProps {
  readonly value: string;
  readonly copyValue?: string;
  readonly badge?: string;
  readonly size: CopyableIdentifierSize;
  /** Truncate visible text (full value still copied). Matches Splice `CopyableTypography` listing rows. */
  readonly maxDisplayLength?: number;
  readonly 'data-testid': string;
}

export function CopyableIdentifier({
  value,
  copyValue,
  badge,
  size,
  maxDisplayLength,
  'data-testid': testId,
}: CopyableIdentifierProps) {
  const displayedValue =
    maxDisplayLength !== undefined && value.length > maxDisplayLength
      ? value.slice(0, maxDisplayLength)
      : value;

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}
      data-testid={testId}
    >
      <Typography
        variant="body1"
        fontWeight="medium"
        fontFamily="monospace"
        fontSize={size === 'small' ? 14 : 18}
        data-testid={`${testId}-value`}
        sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
      >
        {displayedValue}
      </Typography>
      <IconButton
        color="secondary"
        size="small"
        aria-label="Copy identifier"
        data-testid={`${testId}-copy-button`}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          void navigator.clipboard.writeText(copyValue ?? value);
        }}
      >
        <ContentCopy sx={{ fontSize: size === 'small' ? 14 : 18 }} />
      </IconButton>
      {badge !== undefined && (
        <Chip label={badge} size="small" data-testid={`${testId}-badge`} />
      )}
    </Box>
  );
}
