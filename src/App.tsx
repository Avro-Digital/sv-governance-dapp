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
import {
  BrowserRouter,
  Link as RouterLink,
  Navigate,
  Route,
  Routes,
  useParams,
} from 'react-router-dom';

import { WalletConnectToolbar } from '@/components/wallet/WalletConnectToolbar';
import { WalletSessionBootstrap } from '@/components/wallet/WalletSessionBootstrap';
import { CreateProposal } from '@/routes/CreateProposal';
import { Governance } from '@/routes/Governance';
import { ProposalDetails } from '@/routes/ProposalDetails';
import { theme } from '@/theme';

function LegacyVoteRedirect() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/governance/proposals/${encodeURIComponent(id ?? '')}`} replace />;
}

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
          <WalletSessionBootstrap />
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                SV Governance
              </Typography>
              <WalletConnectToolbar />
              <Link
                component={RouterLink}
                to="/governance/proposals"
                color="inherit"
                underline="hover"
                sx={{ ml: 2 }}
              >
                Governance
              </Link>
            </Toolbar>
          </AppBar>
          <Container maxWidth="xl">
            <Box component="main">
              <Routes>
                <Route path="/" element={<Navigate to="/governance/proposals" replace />} />
                <Route path="/governance" element={<Navigate to="/governance/proposals" replace />} />
                <Route path="/governance/proposals" element={<Governance />} />
                <Route path="/governance/proposals/create" element={<CreateProposal />} />
                <Route path="/governance/proposals/:contractId" element={<ProposalDetails />} />
                {/* Legacy M1/M2 demo URLs */}
                <Route path="/votes" element={<Navigate to="/governance/proposals" replace />} />
                <Route path="/votes/:id" element={<LegacyVoteRedirect />} />
              </Routes>
            </Box>
          </Container>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
