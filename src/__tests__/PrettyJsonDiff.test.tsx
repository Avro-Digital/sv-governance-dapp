// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { JsonDiffAccordion } from '@/components/governance/JsonDiffAccordion';
import { PrettyJsonDiff } from '@/components/governance/PrettyJsonDiff';
import { theme } from '@/theme';

describe('PrettyJsonDiff', () => {
  it('renders config diff inside accordion', () => {
    render(
      <ThemeProvider theme={theme}>
        <JsonDiffAccordion>
          <PrettyJsonDiff
            changes={{
              newConfig: { voteRequestTimeout: { microseconds: '604800000000' } },
              actualConfig: { voteRequestTimeout: { microseconds: '86400000000' } },
            }}
          />
        </JsonDiffAccordion>
      </ThemeProvider>,
    );

    expect(screen.getByTestId('json-diff-toggle')).toHaveTextContent('Show JSON');
    expect(screen.getByTestId('config-diffs-display')).toBeInTheDocument();
  });
});
