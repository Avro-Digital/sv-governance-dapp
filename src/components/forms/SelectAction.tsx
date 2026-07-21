// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/forms/SelectAction.tsx
// at canton-network/splice main (July 2026 governance redesign). Original: Apache 2.0 (c) Digital Asset

import { useState, type FormEvent } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

import { Dropdown } from '@/components/ui/Dropdown';
import { createProposalActions } from '@/lib/proposal-actions';

const CARD_CONTENT_WIDTH = 833;
const CARD_BG = '#1b1b1b';
const CARD_VERTICAL_PADDING = '60px';
const PLACEHOLDER_TEXT = 'Select proposal type';

const pillButtonSx = {
  height: '39px',
  px: '16px',
  py: '10px',
};

const cancelButtonSx = {
  ...pillButtonSx,
  bgcolor: 'transparent',
  '&:hover': { bgcolor: 'transparent' },
};

const nextButtonSx = {
  ...pillButtonSx,
  '&:disabled': {
    bgcolor: '#696969',
    color: '#363636',
    border: 'none',
  },
};

const dropdownOptions = createProposalActions.map((action) => ({
  value: action.value,
  label: action.name,
  testId: action.value,
}));

export function SelectAction() {
  const navigate = useNavigate();
  const [action, setAction] = useState('');
  const canSubmit = createProposalActions.some((candidate) => candidate.value === action);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (canSubmit) {
      void navigate(`/governance/proposals/create?action=${action}`);
    }
  };

  const handleCancel = () => {
    setAction('');
    void navigate('/governance/proposals');
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        py: CARD_VERTICAL_PADDING,
        px: { xs: 2, sm: 4 },
        bgcolor: CARD_BG,
        borderRadius: '4px',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: CARD_CONTENT_WIDTH }}>
        <form onSubmit={handleSubmit}>
          <Dropdown
            label="Select proposal type"
            placeholder={PLACEHOLDER_TEXT}
            options={dropdownOptions}
            value={action}
            onChange={setAction}
            id="select-action"
            labelId="select-action-label"
            testId="select-action"
            sx={{ mb: '32px' }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px' }}>
            <Button
              variant="pill"
              color="secondary"
              size="large"
              sx={cancelButtonSx}
              data-testid="cancel-button"
              onClick={handleCancel}
              type="button"
            >
              Cancel
            </Button>

            <Button
              variant="pill"
              size="large"
              sx={nextButtonSx}
              id="next-button"
              data-testid="next-button"
              type="submit"
              disabled={!canSubmit}
            >
              Next
            </Button>
          </Box>
        </form>
      </Box>
    </Box>
  );
}
