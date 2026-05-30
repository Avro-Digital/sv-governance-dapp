// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/common/frontend/src/components/DateDisplay.tsx @ canton-network/splice 80488155

import Box from '@mui/material/Box';
import dayjs from 'dayjs';

interface DateDisplayProps {
  readonly datetime: string | Date;
  readonly format?: string;
  readonly id?: string;
}

export function DateDisplay({ datetime, format = 'YYYY-MM-DD HH:mm', id }: DateDisplayProps) {
  const value = dayjs(datetime).format(format);

  return (
    <Box component="span" id={id} data-testid={id}>
      {value}
    </Box>
  );
}
