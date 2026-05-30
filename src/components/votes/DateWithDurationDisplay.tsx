// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/common/frontend/src/components/DateWithDurationDisplay.tsx @ canton-network/splice 80488155

import Box from '@mui/material/Box';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface DateWithDurationDisplayProps {
  readonly datetime: string | Date | undefined;
  readonly format?: string;
  readonly enableDuration?: boolean;
  readonly onlyDuration?: boolean;
  readonly id?: string;
}

export function DateWithDurationDisplay({
  datetime,
  format = 'YYYY-MM-DD HH:mm',
  enableDuration = false,
  onlyDuration = false,
  id,
}: DateWithDurationDisplayProps) {
  if (datetime === undefined || datetime === 'initial') {
    return <>initial</>;
  }

  const dateObj = typeof datetime === 'string' ? new Date(datetime) : datetime;
  const formatted = dayjs(dateObj).format(format);
  const duration = enableDuration ? `(${dayjs(dateObj).fromNow()})` : '';

  return (
    <Box component="span" id={id} data-testid={id}>
      {enableDuration && onlyDuration ? duration : `${formatted} ${duration}`.trim()}
    </Box>
  );
}
