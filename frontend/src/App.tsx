import React, { useEffect, useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { FranchiseLeaderboard } from './components/Leaderboard';
import { LeaderboardEntry, PlayerPoints } from './types';
import { BrowserRouter } from 'react-router-dom';

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
  }, []);

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <FranchiseLeaderboard 
            leaderboardData={leaderboardData} 
            allPlayerPoints={allPlayerPoints}
          />
        </Container>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;