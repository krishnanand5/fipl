import React, { useEffect, useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Box, Card, Grid, Fade, Typography, Grow, Slide } from '@mui/material';
import { FranchiseLeaderboard } from './components/Leaderboard';
import { LeaderboardEntry, PlayerPoints } from './types';
import { BrowserRouter } from 'react-router-dom';
import SingleMatchHeroes from './components/SingleMatchHeroes';
import SkillsLeaderboard from './components/SkillsLeaderboard';


const theme = createTheme({
  palette: {
    mode: 'dark',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          overflow: 'hidden',
          border: '3px solid rgba(0, 0, 0, 0.8)',
          boxShadow: '0 8px 24px rgba(13, 246, 215, 0.94)',
          transition: 'box-shadow 0.3s ease-in-out',
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

function App() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [allPlayerPoints, setAllPlayerPoints] = useState<PlayerPoints[]>([]);
  const [showSplash, setShowSplash] = useState(true);


  useEffect(() => {
    // Use process.env.PUBLIC_URL to get correct path in GitHub Pages
    const loadData = async () => {
      try {
        const [leaderboard, players] = await Promise.all([
          fetch(`${process.env.PUBLIC_URL}/data/player_points/leaderboard.json`),
          fetch(`${process.env.PUBLIC_URL}/data/player_points/all_player_points.json`)
        ]);
        
        const leaderboardJson = await leaderboard.json();
        const playersJson = await players.json();
        
        setLeaderboardData(leaderboardJson);
        setAllPlayerPoints(playersJson);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const SplashScreen = () => (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        color: 'white',
        gap: 2
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 'bold',
          animation: 'pulse 1.5s infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.5 }
          }
        }}
      >
        Welcome to FIPL 2025
      </Typography>
      <img
        src={`${process.env.PUBLIC_URL}/assets/videos/intro.gif`}
        alt="Loading..."
        style={{
          maxWidth: '100%',
          maxHeight: '70vh',
          objectFit: 'contain'
        }}
      />
      <Typography 
        variant="h6" 
        sx={{ 
          animation: 'pulse 1.5s infinite',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.5 }
          }
        }}
      >
        Cooking now...
      </Typography>
    </Box>
  );

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {showSplash ? (
          <SplashScreen />
        ) : (
          <Fade in timeout={1000}>
            <Container maxWidth="xl" sx={{ mt: 4 }}>
              <Grid container spacing={4}> {/* Increased spacing between grid items */}
                {/* Main Leaderboard - Full Width */}
                <Grid item xs={12}>
                  <Slide direction="down" in timeout={1000}>
                    <div>
                      <Card sx={{ 
                        mb: 2,
                        boxShadow: '0 8px 24px rgba(63, 13, 246, 0.25)', // Blue tinted shadow
                        '&:hover': {
                          boxShadow: '0 12px 32px rgba(63, 13, 246, 0.35)',
                          transform: 'translateY(-4px)'
                        },
                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
                      }}>
                        <FranchiseLeaderboard 
                          leaderboardData={leaderboardData} 
                          allPlayerPoints={allPlayerPoints}
                        />
                      </Card>
                    </div>
                  </Slide>
                </Grid>

                {/* Match Heroes */}
                <Grid item xs={12}>
                  <Grow in timeout={1500}>
                    <Card sx={{ 
                      boxShadow: '0 8px 24px rgba(220, 0, 78, 0.25)', // Pink tinted shadow
                      '&:hover': {
                        boxShadow: '0 12px 32px rgba(220, 0, 78, 0.35)',
                        transform: 'translateY(-4px)'
                      },
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
                    }}>
                      <SingleMatchHeroes allPlayerPoints={allPlayerPoints} />
                    </Card>
                  </Grow>
                </Grid>

                {/* Skills Leaderboard */}
                <Grid item xs={12}>
                  <Grow in timeout={2000}>
                    <Card sx={{ 
                      width: '100%',
                      boxShadow: '0 8px 24px rgba(25, 118, 210, 0.25)', // Primary blue shadow
                      '&:hover': {
                        boxShadow: '0 12px 32px rgba(25, 118, 210, 0.35)',
                        transform: 'translateY(-4px)'
                      },
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
                    }}>
                      <SkillsLeaderboard allPlayerPoints={allPlayerPoints} />
                    </Card>
                  </Grow>
                </Grid>
              </Grid>
            </Container>
          </Fade>
        )}
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;