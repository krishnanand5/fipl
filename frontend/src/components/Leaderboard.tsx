import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography,
  useTheme,
  Collapse,
  Box,
  IconButton
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { PlayerPoints, LeaderboardEntry, FranchiseStats } from '../types';
import { RecentStats } from './Statsboard';
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
}

const FranchiseRow: React.FC<FranchiseRowProps> = ({ franchise, players, index, isOpen, onToggle }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerPoints | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useTheme();

  const handlePlayerClick = (player: PlayerPoints) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  return (
    <>
      <TableRow 
        sx={{ 
          '&:nth-of-type(odd)': { backgroundColor: theme.palette.grey[50] },
          '&:hover': { backgroundColor: theme.palette.action.hover },
        }}
      >
        <TableCell padding="checkbox">
          <IconButton size="small" onClick={onToggle}>
            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row" sx={{ fontWeight: index < 3 ? 600 : 400 }}>
          {franchise.franchise}
        </TableCell>
        <TableCell align="right">{franchise.player_count}</TableCell>
        <TableCell align="right">{franchise.total_points}</TableCell>
        <TableCell align="right">
          {(franchise.total_points / franchise.player_count).toFixed(1)}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell>Player</TableCell>
                    <TableCell align="right">Matches</TableCell>
                    <TableCell align="right">Batting</TableCell>
                    <TableCell align="right">Bowling</TableCell>
                    <TableCell align="right">Fielding</TableCell>
                    <TableCell align="right">MoM</TableCell>
                    <TableCell align="right">Total</TableCell>
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
                          '&:hover': { 
                            textDecoration: 'underline',
                            color: theme.palette.primary.main 
                          }
                        }}
                        onClick={() => handlePlayerClick(player)}
                      >
                        {player.player_name}
                      </TableCell>
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
                      <TableCell align="right">{player.total_points}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
  const theme = useTheme();
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

  return (
    <>
      <TableContainer component={Paper} sx={{ mx: 'auto', boxShadow: 3 }}>
        <Typography variant="h4" align="center" sx={{ my: 3, fontWeight: 600 }}>
          FIPL 2025 Leaderboard
        </Typography>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
              <TableCell />
              <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Franchise</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Players</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Total Points</TableCell>
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
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <RecentStats allPlayerPoints={allPlayerPoints} />
    </>
  );
};