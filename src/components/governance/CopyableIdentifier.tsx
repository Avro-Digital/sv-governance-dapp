// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/beta/CopyableIdentifier.tsx
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import { useRef } from 'react';

import ContentCopy from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import {
  scrollContainerSx,
  scrollTextSx,
  scrollThumbSx,
  scrollTrackSx,
} from '@/components/governance/identifierStyles';
import { useHorizontalScrollMetrics } from '@/hooks/useHorizontalScrollMetrics';

export type CopyableIdentifierSize = 'small' | 'large';

interface CopyableIdentifierProps {
  readonly value: string;
  readonly copyValue?: string;
  readonly badge?: string;
  readonly size: CopyableIdentifierSize;
  readonly 'data-testid': string;
}

export function CopyableIdentifier({
  value,
  copyValue,
  badge,
  size,
  'data-testid': testId,
}: CopyableIdentifierProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const metrics = useHorizontalScrollMetrics(scrollRef, [value]);
  const fontSize = size === 'small' ? 14 : 18;

  return (
    <Box
      className="identifier-scroll-area"
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        color: 'text.light',
        minWidth: 0,
        maxWidth: '100%',
        width: '100%',
      }}
      data-testid={testId}
    >
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Box ref={scrollRef} sx={scrollContainerSx} data-testid={`${testId}-scroll`}>
          <Typography
            component="span"
            variant="body1"
            fontWeight="medium"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize={fontSize}
            data-testid={`${testId}-value`}
            sx={scrollTextSx}
          >
            {value}
          </Typography>
        </Box>
        {metrics.canScroll && (
          <Box sx={scrollTrackSx} data-testid={`${testId}-scroll-track`} aria-hidden>
            <Box sx={scrollThumbSx(metrics.thumbLeftPercent, metrics.thumbWidthPercent)} />
          </Box>
        )}
      </Box>
      <IconButton
        color="secondary"
        aria-label="Copy identifier"
        data-testid={`${testId}-copy-button`}
        sx={{ flexShrink: 0, mt: -0.25 }}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          void navigator.clipboard.writeText(copyValue ?? value);
        }}
      >
        <ContentCopy sx={{ fontSize }} />
      </IconButton>
      {badge !== undefined && (
        <Chip label={badge} size="small" data-testid={`${testId}-badge`} sx={{ flexShrink: 0 }} />
      )}
    </Box>
  );
}
