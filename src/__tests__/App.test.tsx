// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from '@/App';

describe('App', () => {
  it('renders the application title', () => {
    render(<App />);
    expect(screen.getByText('SV Governance')).toBeInTheDocument();
  });
});
