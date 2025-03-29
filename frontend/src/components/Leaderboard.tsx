import React, { JSX, useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography,
  Collapse,
  Box,
  IconButton,
  Card,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { PlayerPoints, LeaderboardEntry, FranchiseStats } from '../types';
import PlayerStatsModal from './PlayerStatsModal';

interface Props {
  leaderboardData: LeaderboardEntry[];
  allPlayerPoints: PlayerPoints[];
}

interface FranchiseRowProps {
  franchise: FranchiseStats;
  players: PlayerPoints[];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  leadingPoints: number;
  recentPoints?: JSX.Element;
}

const formatRecentPoints = (matchTotals: number[]): JSX.Element[] => {
  return matchTotals.map((points, index) => {
    let color = 'inherit';
    if (index < matchTotals.length - 1) {
      color = points > matchTotals[index + 1] ? 'success.main' : 
              points < matchTotals[index + 1] ? 'error.main' : 'inherit';
    }

    if (index === matchTotals.length - 1) {
      color = points > matchTotals[index - 1] ? 'success.main' : 
              points < matchTotals[index - 1] ? 'error.main' : 'inherit';
    }
    
    return (
      <Box 
        key={index}
        component="span"
        sx={{ 
          color,
          flex: 1,
          display: 'inline-block',
          textAlign: 'center',
          fontWeight: 900,
          fontSize: '0.95rem',
          letterSpacing: '0.5px',
          fontFamily: 'system-ui',
          textShadow: '0.5px 0 0 currentColor',
          padding: '2px',
        }}
      >
        {points}
      </Box>
    );
  });
};

const FranchiseRow: React.FC<FranchiseRowProps> = ({ franchise, players, index, isOpen, onToggle, leadingPoints, recentPoints }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerPoints | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlayerClick = (player: PlayerPoints) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const pointsDifference = leadingPoints - franchise.total_points;

  const calculatePlayerRecentForm = (matches: PlayerPoints['matches']): JSX.Element => {
    const sortedMatches = [...matches]
      .sort((a, b) => parseInt(b.match_id) - parseInt(a.match_id))
      .slice(0, 3);
  
    const recentPoints = sortedMatches.map(match => 
      match.batting_points + match.bowling_points + match.fielding_points + match.mom
    );
  
    return (
      <Box 
        sx={{ 
          display: 'flex',
          backgroundColor: 'rgba(14, 14, 15, 0.9)',
          borderRadius: 1,
          px: 0.5,
          py: 0.25,
          width: 'fit-content',
          minWidth: '100px',
          maxWidth: '140px',
          margin: '0 auto',
          gap: 0.5
        }}
      >
        {formatRecentPoints(recentPoints)}
      </Box>
    );
  };

  return (
    <>
      <TableRow 
        sx={{ 
          '&:nth-of-type(odd)': { backgroundColor: '#28282B', color: 'white' },
        }}
      >
        <TableCell padding="checkbox">
          <IconButton size="small" onClick={onToggle}>
            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" sx={{ fontWeight: index < 3 ? 600 : 400 }}>
          {franchise.franchise}
          {index > 0 && (
            <Typography
              component="span"
              sx={{
                ml: 1,
                mr: 1,
                fontWeight: '900',
                backgroundColor: 'rgba(236, 11, 15, 0.79)',
                borderRadius: 2,
                padding: '4px',
                fontSize: '1rem',
              }}
            >
              {pointsDifference}
            </Typography>
          )}
        </TableCell>
        <TableCell align="right">{franchise.total_points}</TableCell>
        <TableCell align="right">{franchise.player_count}</TableCell>
        <TableCell 
          align="right" 
          sx={{ 
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}
        >
          {recentPoints}
        </TableCell>
        <TableCell align="right">
          {(franchise.total_points / franchise.player_count).toFixed(1)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Card 
                  elevation={3}
                  sx={{
                    backgroundColor: 'rgba(41, 5, 48, 0.95)',
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: '3px solid rgba(250, 231, 108, 0.79)'
                  }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Player</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="right">Matches</TableCell>
                        <TableCell align="right">Batting</TableCell>
                        <TableCell align="right">Bowling</TableCell>
                        <TableCell align="right">Fielding</TableCell>
                        <TableCell align="right">MoM</TableCell>
                        <TableCell 
                          align="center"
                          sx={{ 
                            fontWeight: 'bold'
                          }}
                        >
                          Last 3 Games
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {players.map((player) => (
                        <TableRow key={player.player_name}>
                          <TableCell 
                            component="th" 
                            scope="row"
                            sx={{ 
                              cursor: 'pointer',
                            }}
                            onClick={() => handlePlayerClick(player)}
                          >
                            {player.player_name}
                          </TableCell>
                          <TableCell align="right">{player.total_points}</TableCell>
                          <TableCell align="right">{player.matches.length}</TableCell>
                          <TableCell align="right">
                            {player.matches.reduce((sum, m) => sum + m.batting_points, 0)}
                          </TableCell>
                          <TableCell align="right">
                            {player.matches.reduce((sum, m) => sum + m.bowling_points, 0)}
                          </TableCell>
                          <TableCell align="right">
                            {player.matches.reduce((sum, m) => sum + m.fielding_points, 0)}
                          </TableCell>
                          <TableCell align="right">
                            {player.matches.reduce((sum, m) => sum + m.mom, 0)}
                          </TableCell>
                          <TableCell align="center">
                            {calculatePlayerRecentForm(player.matches)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
                <PlayerStatsModal 
                  player={selectedPlayer} 
                  isOpen={isModalOpen} 
                  onClose={() => setIsModalOpen(false)}
                />
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const FranchiseLeaderboard: React.FC<Props> = ({ leaderboardData, allPlayerPoints }) => {
  const [openFranchise, setOpenFranchise] = useState<string | null>(null);

  // Aggregate data by franchise
  const franchiseStats = leaderboardData.reduce((acc: { [key: string]: FranchiseStats }, player) => {
    if (player.franchise === 'Unknown') return acc;
    
    if (!acc[player.franchise]) {
      acc[player.franchise] = {
        franchise: player.franchise,
        total_points: 0,
        player_count: 0
      };
    }
    
    acc[player.franchise].total_points += player.total_points;
    acc[player.franchise].player_count += 1;
    
    return acc;
  }, {});

  // Convert to array and sort
  const sortedFranchises = Object.values(franchiseStats).sort((a, b) => {
    if (b.total_points !== a.total_points) {
      return b.total_points - a.total_points;
    }
    return b.franchise.localeCompare(a.franchise);
  });
  const leadingPoints = sortedFranchises[0]?.total_points || 0;

  // Add after imports

  const calculateFranchiseRecentPoints = (players: PlayerPoints[]): JSX.Element => {
    const allMatchIds = Array.from(new Set(
      players.flatMap(player => 
        player.matches.map(m => m.match_id)
      )
    )).sort((a, b) => parseInt(b) - parseInt(a));
  
    const lastThreeMatches = allMatchIds.slice(0, 3);
    
    const matchTotals = lastThreeMatches.map(matchId => {
      return players.reduce((total, player) => {
        const match = player.matches.find(m => m.match_id === matchId);
        if (!match) return total;
        return total + match.batting_points + match.bowling_points + match.fielding_points + match.mom;
      }, 0);
    });
  
    return (
      <Box 
        sx={{ 
          display: 'flex',
          backgroundColor: 'rgba(41, 5, 48, 0.95)',
          borderRadius: 1,
          px: 0.5,
          py: 0.25,
          width: 'fit-content',
          minWidth: '120px',
          maxWidth: '160px',
          margin: '0 auto', 
          gap: 0.5 
        }}
      >
        {formatRecentPoints(matchTotals)}
      </Box>
    );
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ mx: 'auto', boxShadow: 3 }}>
        <Typography variant="h4" align="center" sx={{ my: 3, fontWeight: 600 }}>
          FIPL 2025 Leaderboard
        </Typography>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#282828', color: "white" }}>
              <TableCell />
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Franchise</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total Points</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Players</TableCell>
              <TableCell 
                align="center" 
                sx={{ 
                  fontWeight: 'bold', 
                  fontSize: '1.1rem',
                }}
              >
                Last 3 Games
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Points/Player</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedFranchises.map((franchise, index) => (
              <FranchiseRow 
                key={franchise.franchise}
                franchise={franchise}
                players={allPlayerPoints.filter(p => p.franchise === franchise.franchise)}
                index={index}
                isOpen={openFranchise === franchise.franchise}
                onToggle={() => {
                  setOpenFranchise(
                    openFranchise === franchise.franchise ? null : franchise.franchise
                  );
                }} 
                leadingPoints={leadingPoints}
                recentPoints={calculateFranchiseRecentPoints(
                  allPlayerPoints.filter(p => p.franchise === franchise.franchise)
                )}            
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};