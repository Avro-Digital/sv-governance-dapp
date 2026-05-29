// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/governance/proposal-details/DetailItem.tsx
// at commit 8048815509402e52fc218ce43a7707412d648b56. Original: Apache 2.0 (c) Digital Asset

import type { ReactNode } from 'react';

import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface DetailItemProps {
  readonly label: string;
  readonly value: ReactNode;
  readonly labelId?: string | undefined;
  readonly valueId?: string | undefined;
}

export function DetailItem({ label, value, labelId, valueId }: DetailItemProps) {
  return (
    <Stack gap={2}>
      <Typography
        variant="subtitle2"
        fontWeight="bold"
        fontSize={16}
        id={labelId}
        data-testid={labelId}
      >
        {label}
      </Typography>
      {typeof value === 'string' ? (
        <Typography variant="body1" fontSize={16} id={valueId} data-testid={valueId}>
          {value}
        </Typography>
      ) : (
        value
      )}
      <Divider />
    </Stack>
  );
}
