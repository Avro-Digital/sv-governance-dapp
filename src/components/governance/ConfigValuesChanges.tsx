// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/governance/ConfigValuesChanges.tsx
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { ConfigChange } from '@/types/governance';

interface ConfigValuesChangesProps {
  readonly changes: readonly ConfigChange[];
  readonly isSummaryView?: boolean;
}

export function ConfigValuesChanges({ changes, isSummaryView = false }: ConfigValuesChangesProps) {
  const textColor = isSummaryView ? 'text.secondary' : 'text.primary';

  return (
    <Box
      id="proposal-details-config-changes-section"
      data-testid="proposal-details-config-changes-section"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {changes.length === 0 && (
          <Box sx={{ py: 1 }}>
            <Typography variant="body2" color={textColor}>
              No changes found.
            </Typography>
          </Box>
        )}

        {changes.map((change) => (
          <Box
            key={change.fieldName}
            sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}
            data-testid="config-change"
          >
            <Typography
              variant="body1"
              sx={{ minWidth: 200 }}
              data-testid="config-change-field-label"
              color={textColor}
            >
              {change.label}
            </Typography>

            {change.currentValue.length > 0 && (
              <>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 1,
                    minWidth: 80,
                    textAlign: 'center',
                  }}
                  data-testid="config-change-current-value-container"
                >
                  <Typography
                    variant="body2"
                    fontFamily="monospace"
                    data-testid="config-change-current-value"
                  >
                    {change.currentValue}
                  </Typography>
                </Box>

                <Typography variant="body1" sx={{ mx: 1 }}>
                  →
                </Typography>
              </>
            )}

            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                bgcolor: 'rgba(255, 255, 255, 0.16)',
                borderRadius: 1,
                minWidth: 80,
                textAlign: 'center',
              }}
              data-testid="config-change-new-value-container"
            >
              <Typography variant="body2" fontFamily="monospace" data-testid="config-change-new-value">
                {change.newValue}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
