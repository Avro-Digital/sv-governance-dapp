// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/forms/FormLayout.tsx
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import type { FormEvent, ReactNode } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

export interface FormLayoutProps {
  readonly children: ReactNode;
  readonly onSubmit: () => void;
  readonly id: string;
}

export function FormLayout({ children, onSubmit, id }: FormLayoutProps) {
  return (
    <Box data-testid={id} id={id}>
      <Paper
        sx={{
          bgcolor: 'background.paper',
          p: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: '80%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
          <form
            onSubmit={(event: FormEvent) => {
              event.preventDefault();
              event.stopPropagation();
              onSubmit();
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', minWidth: 0 }}>
              {children}
            </Box>
          </form>
        </Box>
      </Paper>
    </Box>
  );
}
