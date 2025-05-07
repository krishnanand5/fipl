import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    fontFamily: [
      'Nunito',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontWeight: 500,
    },
    body2: {
      fontWeight: 400,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(13, 246, 215, 0.94)',
          transition: 'box-shadow 0.3s ease-in-out',
          border: '3px solid rgba(250, 231, 108, 0.79)',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16 
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          '@media (max-width: 600px)': {
            padding: '8px 4px',
            fontSize: '0.75rem',
            lineHeight: 1.2,
            '& .MuiTypography-root': {
              fontSize: '0.75rem',
            },
          },
        },
        body: {
          '@media (max-width: 600px)': {
            padding: '8px 4px',
            fontSize: '0.75rem',
            '& .MuiTypography-root': {
              fontSize: '0.75rem',
            },
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '@media (max-width: 600px)': {
            minWidth: '100%',
          },
        },
      },
    },
  }
}); 