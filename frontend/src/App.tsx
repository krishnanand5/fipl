import React, { useEffect, useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Box, Card, Grid, Fade, Typography, Grow, Slide } from '@mui/material';
import { FranchiseLeaderboard } from './components/Leaderboard';
import { LeaderboardEntry, PlayerPoints, FranchiseBonus } from './types';
import { BrowserRouter } from 'react-router-dom';
import SingleMatchHeroes from './components/SingleMatchHeroes';
import SkillsLeaderboard from './components/SkillsLeaderboard';
import { AllRoundersTable } from './components/AllRounders';
import { RecentStats } from './components/RecentStats';
import BonusBuckets from './components/BonusBuckets';


const theme = createTheme({
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

function App() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [allPlayerPoints, setAllPlayerPoints] = useState<PlayerPoints[]>([]);
  const [bonusStats, setBonusStats] = useState<FranchiseBonus>({});
  const [showSplash, setShowSplash] = useState(true);


  useEffect(() => {
    // Use process.env.PUBLIC_URL to get correct path in GitHub Pages
    const loadData = async () => {
      try {
        const [leaderboard, players, bonus] = await Promise.all([
          fetch(`${process.env.PUBLIC_URL}/data/player_points/leaderboard.json`),
          fetch(`${process.env.PUBLIC_URL}/data/player_points/all_player_points.json`),
          fetch(`${process.env.PUBLIC_URL}/data/player_points/franchise_wise_bonus.json`)
        ]);

        if (!bonus.ok) {
          throw new Error(`Failed to fetch bonus stats: ${bonus.statusText}`);
        }
        
        const leaderboardJson = await leaderboard.json();
        const playersJson = await players.json();
        const bonusJson = await bonus.json();
        
        setLeaderboardData(leaderboardJson);
        setAllPlayerPoints(playersJson);
        setBonusStats(bonusJson);

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

                {/* Recent Stats */}
                <Grid item xs={12}>
                  <Slide direction="up" in timeout={1000}>
                    <div>
                      <RecentStats allPlayerPoints={allPlayerPoints} />
                    </div>
                  </Slide>
                </Grid>

                <Grid container item xs={12} spacing={4}>
                  {/* Match Heroes */}
                  <Grid item xs={12} md={6}>
                    <Grow in timeout={1500}>
                      <Card sx={{ 
                        height: '100%',  // Make cards same height
                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
                      }}>
                        <SingleMatchHeroes allPlayerPoints={allPlayerPoints} />
                      </Card>
                    </Grow>
                  </Grid>

                  {/* All Rounders */}
                  <Grid item xs={12} md={6}>
                    <Grow in timeout={1500}>
                      <div>
                        <AllRoundersTable allPlayerPoints={allPlayerPoints} />
                      </div>
                    </Grow>
                  </Grid>
                </Grid>

                {/* Bonus Buckets */}
                <Grid container item xs={12} spacing={4}>
                  <Grid item xs={12}>
                      <Grow in timeout={1800}>
                        <div>
                          <BonusBuckets bonusStats={bonusStats} />
                        </div>
                      </Grow>
                  </Grid>
                </Grid>

                {/* Skills Leaderboard */}
                <Grid item xs={12}>
                  <Grow in timeout={2000}>
                    <Card sx={{ 
                      width: '100%',
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