// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/sv/frontend/src/components/governance/JsonDiffAccordion.tsx @ canton-network/splice 80488155

import type { ReactNode } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface JsonDiffAccordionProps {
  readonly children: ReactNode;
}

export function JsonDiffAccordion({ children }: JsonDiffAccordionProps) {
  return (
    <Box>
      <Accordion elevation={0}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="json-diff-content"
          id="json-diff-header"
        >
          <Typography variant="h6">JSON Diffs</Typography>
        </AccordionSummary>
        <AccordionDetails data-testid="json-diffs-details">{children}</AccordionDetails>
      </Accordion>
    </Box>
  );
}
