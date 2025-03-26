import React from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { FranchiseLeaderboard } from './components/Leaderboard';
import leaderboardData from './data/player_points/leaderboard.json';
import allPlayerPoints from './data/player_points/all_player_points.json';
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