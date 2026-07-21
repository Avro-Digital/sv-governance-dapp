// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/form-components/FormControls.tsx
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

export interface FormControlsProps {
  readonly showConfirmation: boolean;
  readonly isSubmitting: boolean;
  readonly canSubmit?: boolean;
  readonly onCancel: () => void;
  readonly onEdit: () => void;
  readonly submittingLabel?: string;
}

export function FormControls({
  showConfirmation,
  isSubmitting,
  canSubmit = true,
  onCancel,
  onEdit,
  submittingLabel = 'Submitting',
}: FormControlsProps) {
  const submitTitle = showConfirmation ? 'Submit Proposal' : 'Review Proposal';
  const cancelTitle = showConfirmation ? 'Edit Proposal' : 'Cancel';

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      data-testid="form-controls"
    >
      <Button
        variant="outlined"
        sx={{ mr: 8 }}
        data-testid="cancel-button"
        onClick={showConfirmation ? onEdit : onCancel}
        type="button"
      >
        {cancelTitle}
      </Button>

      <Button
        variant="pill"
        type="submit"
        size="large"
        disabled={!canSubmit || isSubmitting}
        id="submit-button"
        data-testid="submit-button"
      >
        {isSubmitting ? submittingLabel : submitTitle}
      </Button>
    </Box>
  );
}
