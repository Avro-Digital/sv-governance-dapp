// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223

import { useMemo } from 'react';


import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import { ThemeProvider } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Link as RouterLink, Navigate, Route, Routes } from 'react-router-dom';

import { VoteDetail } from '@/routes/VoteDetail';
import { VoteList } from '@/routes/VoteList';
import { theme } from '@/theme';

export function App() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                SV Governance
              </Typography>
              <Link component={RouterLink} to="/votes" color="inherit" underline="hover">
                Votes
              </Link>
            </Toolbar>
          </AppBar>
          <Container maxWidth="md" sx={{ py: 4 }}>
            <Box component="main">
              <Routes>
                <Route path="/" element={<Navigate to="/votes" replace />} />
                <Route path="/votes" element={<VoteList />} />
                <Route path="/votes/:id" element={<VoteDetail />} />
              </Routes>
            </Box>
          </Container>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
