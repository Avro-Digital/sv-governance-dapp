// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/governance/ConfigValuesChanges.tsx
// at commit 8048815509402e52fc218ce43a7707412d648b56. Original: Apache 2.0 (c) Digital Asset

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { ConfigChange } from '@/types/governance';

interface ConfigValuesChangesProps {
  readonly changes: readonly ConfigChange[];
}

export function ConfigValuesChanges({ changes }: ConfigValuesChangesProps) {
  if (changes.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No changes found.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} data-testid="config-changes">
      {changes.map((change) => (
        <Box
          key={change.fieldName}
          sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
          data-testid="config-change"
        >
          <Typography variant="body2" sx={{ minWidth: 160 }} data-testid="config-change-field-label">
            {change.label}
          </Typography>
          <Typography
            variant="body2"
            fontFamily="monospace"
            sx={{ px: 1.5, py: 0.5, bgcolor: 'action.hover', borderRadius: 1 }}
            data-testid="config-change-current-value"
          >
            {change.currentValue}
          </Typography>
          <Typography variant="body2">→</Typography>
          <Typography
            variant="body2"
            fontFamily="monospace"
            sx={{ px: 1.5, py: 0.5, bgcolor: 'action.selected', borderRadius: 1 }}
            data-testid="config-change-new-value"
          >
            {change.newValue}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
