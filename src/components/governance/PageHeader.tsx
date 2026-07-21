// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/beta/PageHeader.tsx
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface PageHeaderProps {
  readonly title: string;
  readonly actionElement?: ReactNode;
  readonly 'data-testid': string;
}

export function PageHeader({ title, actionElement, 'data-testid': testId }: PageHeaderProps) {
  return (
    <Box
      sx={{ mb: 7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      data-testid={testId}
    >
      <Typography variant="h2" lineHeight={1} fontSize={40} data-testid={`${testId}-title`}>
        {title}
      </Typography>
      {actionElement ?? null}
    </Box>
  );
}
