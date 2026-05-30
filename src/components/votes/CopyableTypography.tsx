// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/common/frontend/src/components/CopyableTypography.tsx @ canton-network/splice 80488155

import type { ReactNode } from 'react';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import Typography, { type TypographyProps } from '@mui/material/Typography';

export type CopyableTypographyProps = {
  readonly text: string;
  readonly maxWidth?: string;
} & TypographyProps;

export function CopyableTypography({ text, maxWidth = '200px', ...typographyProps }: CopyableTypographyProps) {
  return (
    <BoxLikeRow>
      <EllipsisBox maxWidth={maxWidth}>
        <Typography {...typographyProps}>{text}</Typography>
      </EllipsisBox>
      <IconButton
        size="small"
        aria-label="Copy to clipboard"
        onClick={(event) => {
          event.stopPropagation();
          void navigator.clipboard.writeText(text);
        }}
      >
        <ContentCopyIcon fontSize="small" />
      </IconButton>
    </BoxLikeRow>
  );
}

function BoxLikeRow({ children }: { readonly children: ReactNode }) {
  return <div style={{ display: 'flex', alignItems: 'center' }}>{children}</div>;
}

function EllipsisBox({
  children,
  maxWidth,
}: {
  readonly children: ReactNode;
  readonly maxWidth: string;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        maxWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontWeight: 'lighter',
      }}
    >
      {children}
    </div>
  );
}
