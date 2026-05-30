// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/common/frontend/src/components/PrettyJsonDiff.tsx @ canton-network/splice 80488155

import { diff_match_patch as DiffMatchPatch } from '@dmsnell/diff-match-patch';
import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import * as jsondiffpatch from 'jsondiffpatch';
import * as htmlFormatter from 'jsondiffpatch/formatters/html';


export interface JsonConfigDiff {
  readonly newConfig: Record<string, unknown>;
  readonly actualConfig: Record<string, unknown>;
  readonly baseConfig?: Record<string, unknown>;
}

const jsondiffpatchInstance = jsondiffpatch.create({
  arrays: {
    detectMove: true,
    includeValueOnMove: false,
  },
  textDiff: {
    diffMatchPatch: DiffMatchPatch,
    minLength: 60,
  },
  cloneDiffValues: true,
});

function JsonDiffStyles() {
  return (
    <GlobalStyles
      styles={{
        '.jsondiffpatch-delta': {
          fontFamily: '"ui-monospace", "SFMono-Regular", "Menlo", monospace',
          fontSize: '12px',
          margin: 0,
          padding: '0 0 0 12px',
          display: 'inline-block',
        },
        '.jsondiffpatch-added .jsondiffpatch-property-name, .jsondiffpatch-added .jsondiffpatch-value pre, .jsondiffpatch-modified .jsondiffpatch-right-value pre, .jsondiffpatch-textdiff-added':
          { background: '#3cb505' },
        '.jsondiffpatch-deleted .jsondiffpatch-property-name, .jsondiffpatch-deleted pre, .jsondiffpatch-modified .jsondiffpatch-left-value pre, .jsondiffpatch-textdiff-deleted':
          { background: '#de1818', textDecoration: 'line-through' },
        '.jsondiffpatch-unchanged, .jsondiffpatch-movedestination': { color: 'gray' },
      }}
    />
  );
}

interface PrettyJsonDiffProps {
  readonly changes: JsonConfigDiff;
}

export function PrettyJsonDiff({ changes: { newConfig, baseConfig, actualConfig } }: PrettyJsonDiffProps) {
  const baseForDiff = baseConfig ?? actualConfig;
  const delta = jsondiffpatchInstance.diff(baseForDiff, newConfig);

  if (delta === undefined) {
    return (
      <Box
        component="pre"
        sx={{ overflow: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
        data-testid="stringify-display"
      >
        {JSON.stringify(newConfig, null, 2)}
      </Box>
    );
  }

  const sanitizedHtml = DOMPurify.sanitize(
    htmlFormatter.format(delta, actualConfig) as string,
  );

  return (
    <>
      <JsonDiffStyles />
      <Box sx={{ overflow: 'auto' }}>
        <Box data-testid="config-diffs-display">{parse(sanitizedHtml)}</Box>
      </Box>
    </>
  );
}
