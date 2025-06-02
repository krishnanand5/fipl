import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, Box, Card, Grid, Fade, Grow, Slide } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { Leaderboard } from './components/Leaderboard';
import { AllRoundersTable } from './components/AllRounders';
import { SingleMatchHeroes } from './components/SingleMatchHeroes';
import { SkillsLeaderboard } from './components/SkillsLeaderboard';
import { RecentStats } from './components/RecentStats';
import { BonusBuckets } from './components/BonusBuckets';
import SplashScreen from './components/SplashScreen';
import { theme } from './theme';
import { useAppData } from './hooks/useAppData';
import { FranchiseBonus } from './types';
import { PlayerPointsTable } from './components/PlayerPointsTable';
import PlayerStatsModal from './components/PlayerStatsModal';
import { PlayerPoints } from './types';
import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { leaderboardData, allPlayerPoints, bonusStats, error } = useAppData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerPoints | null>(null);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
  };

  if (error) {
    return (
      <Box sx={{ color: 'error.main', p: 2 }}>
        Error: {error}
      </Box>
    );
  }

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {showSplash ? (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        ) : (
          <Fade in timeout={1000}>
            <Container maxWidth="xl" sx={{ mt: 4 }}>
              <Grid container spacing={4}>
                {/* Main Leaderboard - Full Width */}
                <Grid item xs={12}>
                  <Slide direction="down" in timeout={1000}>
                    <div>
                      <Card sx={{ 
                        mb: 2,
                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
                      }}>
                        <Leaderboard 
                          leaderboardData={leaderboardData} 
                          allPlayerPoints={allPlayerPoints}
                        />
                      </Card>
                    </div>
                  </Slide>
                </Grid>

                {/* Player Points Table */}
                <Grid item xs={12}>
                  <Slide direction="up" in timeout={1000}>
                    <Card sx={{ 
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
                    }}>
                      <PlayerPointsTable allPlayerPoints={allPlayerPoints} />
                    </Card>
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
                        height: '100%',
                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
                      }}>
                        <SingleMatchHeroes allPlayerPoints={allPlayerPoints} />
                      </Card>
                    </Grow>
                  </Grid>

                  {/* All Rounders */}
                  <Grid item xs={12} md={6}>
                    <Grow in timeout={1500}>
                      <Card sx={{ 
                        height: '100%',
                        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out'
                      }}>
                        <AllRoundersTable allPlayerPoints={allPlayerPoints} />
                      </Card>
                    </Grow>
                  </Grid>
                </Grid>

                {/* Skills Leaderboard */}
                <Grid item xs={12}>
                  <Slide direction="up" in timeout={1000}>
                    <Card>
                      <SkillsLeaderboard allPlayerPoints={allPlayerPoints} />
                    </Card>
                  </Slide>
                </Grid>

                {/* Bonus Buckets */}
                <Grid item xs={12}>
                  <Slide direction="up" in timeout={1000}>
                    <Card>
                      <BonusBuckets bonusStats={bonusStats as FranchiseBonus} />
                    </Card>
                  </Slide>
                </Grid>
              </Grid>

              <PlayerStatsModal
                player={selectedPlayer}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
              />
            </Container>
          </Fade>
        )}
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;