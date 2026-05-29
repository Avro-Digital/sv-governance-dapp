// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { createTheme } from '@mui/material/styles';

/** Neutral MUI theme — align with Splice SV app tokens in a later extraction pass. */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});
