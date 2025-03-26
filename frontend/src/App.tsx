import React, { useEffect, useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Box, Card, Grid } from '@mui/material';
import { FranchiseLeaderboard } from './components/Leaderboard';
import { LeaderboardEntry, PlayerPoints } from './types';
import { BrowserRouter } from 'react-router-dom';
import SingleMatchHeroes from './components/SingleMatchHeroes';
import SkillsLeaderboard from './components/SkillsLeaderboard';


const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
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
    }, 5000);

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
        backgroundColor: 'black',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <video
        autoPlay
        muted
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain'
        }}
      >
        <source src={`${process.env.PUBLIC_URL}/assets/videos/intro.mp4`} type="video/mp4" />
      </video>
    </Box>
  );

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {showSplash ? (
        <SplashScreen />
      ) : (
        <Container maxWidth="xl" sx={{ mt: 4 }}>
          <Grid container spacing={3}>
            {/* Main Leaderboard - Full Width */}
            <Grid item xs={12}>
              <FranchiseLeaderboard 
                leaderboardData={leaderboardData} 
                allPlayerPoints={allPlayerPoints}
              />
            </Grid>

            {/* Left Section - Match Heroes */}
            <Grid item xs={12}>
              <Card sx={{boxShadow: 3 }}>
                <SingleMatchHeroes allPlayerPoints={allPlayerPoints} />
              </Card>
            </Grid>

            {/* Right Section - Skills Leaderboard */}
            <Grid item xs={12}>
              <Card sx={{ width: '100%',boxShadow: 3 }}>
                <SkillsLeaderboard allPlayerPoints={allPlayerPoints} />
              </Card>
            </Grid>
          </Grid>
        </Container>
      )}
    </ThemeProvider>
  </BrowserRouter>
  );
}

export default App;