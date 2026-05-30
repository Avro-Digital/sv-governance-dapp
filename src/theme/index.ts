// Part of the SV Governance dApp — Canton Foundation Development Fund grant #223
// Adapted from apps/common/frontend/src/theme/index.ts @ canton-network/splice 80488155

import { createTheme, type TypographyStyle } from '@mui/material/styles';

import { generateHslPalette, generateRemValue, stylePillButton } from '@/theme/utils';

declare module '@mui/material/styles' {
  interface Theme {
    fonts: {
      sansSerif: TypographyStyle;
      monospace: TypographyStyle;
    };
  }

  interface ThemeOptions {
    fonts?: {
      sansSerif: TypographyStyle;
      monospace: TypographyStyle;
    };
  }

  interface TypeText {
    light: string;
  }

  interface Palette {
    colors: {
      neutral: Record<string, string>;
      primary: Record<string, string>;
      secondary: string;
      tertiary: string;
      mainnet: string;
      testnet: string;
      devnet: string;
      scratchnet: string;
    };
    tertiary: {
      main: string;
    };
  }

  interface PaletteOptions {
    colors?: {
      neutral?: Record<string, string>;
      primary?: Record<string, string>;
      secondary?: string;
      tertiary?: string;
      mainnet?: string;
      testnet?: string;
      devnet?: string;
      scratchnet?: string;
    };
    tertiary?: {
      main?: string;
    };
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    pill: true;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    pill: true;
  }
}

declare module '@mui/material/TableCell' {
  interface TableCellPropsVariantOverrides {
    party: true;
  }
}

const TYPE_SCALE = 1.25;

let theme = createTheme({
  palette: {
    mode: 'dark',
    colors: {
      neutral: generateHslPalette(0, 0, [0, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80]),
      primary: generateHslPalette(195, 96, [79, 89]),
      secondary: '#F3FF97',
      tertiary: '#875CFF',
      mainnet: '#F8FDCD',
      testnet: '#C8F1FE',
      devnet: '#C6B2FF',
      scratchnet: '#FFFFFF',
    },
  },
});

theme = createTheme(theme, {
  palette: {
    primary: {
      main: theme.palette.colors.primary[79] ?? 'hsl(195, 96%, 79%)',
      light: theme.palette.colors.primary[89] ?? 'hsl(195, 96%, 89%)',
    },
    secondary: {
      main: '#F3FF97',
    },
    tertiary: {
      main: '#875CFF',
    },
    warning: {
      main: '#FD8575',
    },
    error: {
      main: '#FD8575',
    },
    success: {
      main: '#33C200',
    },
    background: {
      default: theme.palette.colors.neutral[10],
      paper: theme.palette.colors.neutral[20],
    },
    text: {
      primary: '#ffffff',
      secondary: '#E2E2E2',
      light: '#E2E2E2',
    },
  },
});

theme = createTheme(theme, {
  fonts: {
    sansSerif: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 400,
    },
    monospace: {
      fontFamily: '"ui-monospace", "SFMono-Regular", "Menlo", monospace',
      fontWeight: 500,
    },
  },
});

theme = createTheme(theme, {
  typography: {
    h1: { ...theme.fonts.sansSerif, fontSize: generateRemValue(5, TYPE_SCALE) },
    h2: { ...theme.fonts.sansSerif, fontSize: generateRemValue(4, TYPE_SCALE) },
    h3: { ...theme.fonts.sansSerif, fontSize: generateRemValue(3, TYPE_SCALE) },
    h4: { ...theme.fonts.sansSerif, fontSize: generateRemValue(2, TYPE_SCALE) },
    h5: { ...theme.fonts.sansSerif, fontSize: generateRemValue(1, TYPE_SCALE) },
    h6: { ...theme.fonts.sansSerif, fontSize: generateRemValue(0, TYPE_SCALE) },
    subtitle1: theme.fonts.sansSerif,
    subtitle2: theme.fonts.sansSerif,
    body1: { ...theme.fonts.sansSerif, fontSize: generateRemValue(0, TYPE_SCALE) },
    body2: { ...theme.fonts.sansSerif, fontSize: '0.875rem' },
    button: theme.fonts.sansSerif,
    caption: { ...theme.fonts.sansSerif, fontSize: generateRemValue(-1, TYPE_SCALE) },
    overline: theme.fonts.sansSerif,
  },
});

theme = createTheme(theme, {
  components: {
    MuiButton: {
      defaultProps: {
        disableRipple: true,
      },
      variants: [
        {
          props: { variant: 'primary-button' },
          style: {
            color: 'black',
            textTransform: 'none',
            '.MuiButton-startIcon': {
              color: theme.palette.primary.main,
              marginRight: theme.spacing(0.5),
            },
          },
        },
        {
          props: { color: 'secondary' },
          style: {
            color: 'white',
            textTransform: 'none',
            '.MuiButton-startIcon': {
              color: theme.palette.secondary.main,
              marginRight: theme.spacing(0.5),
            },
          },
        },
        stylePillButton(
          {
            bgColor: theme.palette.primary.main,
            bgHoverColor: theme.palette.primary.light,
            bgDisableColor: theme.palette.colors.neutral[25] ?? 'hsl(0, 0%, 25%)',
            borderFocus: `2px solid ${theme.palette.primary.main}`,
            textColor: 'black',
          },
          { textTransform: 'none', fontSize: '16px' },
        ),
        stylePillButton({
          props: { color: 'secondary' },
          bgDisableColor: theme.palette.colors.neutral[25] ?? 'hsl(0, 0%, 25%)',
          border: `1px solid ${theme.palette.secondary.main}`,
          borderFocus: `2px solid ${theme.palette.secondary.main}`,
          textColor: 'white',
          textHoverColor: theme.palette.secondary.main,
        }),
        {
          props: { variant: 'outlined', color: 'secondary', size: 'small' },
          style: { color: 'white' },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          marginBottom: '4px',
          backgroundColor: theme.palette.colors.neutral[20],
          backgroundImage: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: theme.palette.colors.neutral[15],
          borderBottom: 'none',
        },
        head: {
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
        },
      },
    },
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'capitalize',
          fontWeight: 'bold',
          paddingLeft: '0px',
          paddingRight: '0px',
          marginRight: theme.spacing(4),
          color: 'white',
          '&.Mui-selected': {
            color: 'white',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          '.MuiTabs-indicator': {
            backgroundColor: theme.palette.secondary.main,
            borderBottomSize: '4px',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          '.MuiOutlinedInput-input': {
            backgroundColor: theme.palette.colors.neutral[10],
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.colors.neutral[15],
          backgroundImage: 'none',
        },
      },
    },
  },
});

export { theme };
