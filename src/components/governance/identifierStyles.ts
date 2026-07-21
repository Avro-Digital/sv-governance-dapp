// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/beta/identifierStyles.ts
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import type { SxProps, Theme } from '@mui/material/styles';

const hiddenScrollbarSx = {
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
} as const;

export const scrollContainerSx: SxProps<Theme> = {
  minWidth: 0,
  overflowX: 'auto',
  overflowY: 'hidden',
  ...hiddenScrollbarSx,
};

export const scrollTextSx: SxProps<Theme> = {
  display: 'inline-block',
  width: 'max-content',
  minWidth: '100%',
  whiteSpace: 'nowrap',
  textOverflow: 'clip',
};

export const scrollableIdentifierFieldSx: SxProps<Theme> = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  ...scrollTextSx,
};

export const scrollTrackSx: SxProps<Theme> = {
  height: 0,
  opacity: 0,
  overflow: 'hidden',
  mt: 0,
  borderRadius: 1,
  bgcolor: 'rgba(255, 255, 255, 0.12)',
  position: 'relative',
  flexShrink: 0,
  transition: 'opacity 0.15s ease, height 0.15s ease, margin-top 0.15s ease',
  '.identifier-scroll-area:hover &': {
    height: 4,
    opacity: 1,
    mt: 0.5,
    bgcolor: 'rgba(255, 255, 255, 0.18)',
  },
};

export const scrollThumbSx = (
  thumbLeftPercent: number,
  thumbWidthPercent: number,
): SxProps<Theme> => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: `${String(thumbLeftPercent)}%`,
  width: `${String(thumbWidthPercent)}%`,
  borderRadius: 1,
  bgcolor: 'rgba(255, 255, 255, 0.35)',
  transition: 'background-color 0.15s ease',
  '.identifier-scroll-area:hover &': {
    bgcolor: 'rgba(255, 255, 255, 0.72)',
  },
});
