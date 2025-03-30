import React from 'react';
import { 
  Grid, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography,
  Card,
  Box
} from '@mui/material';
import { PlayerPoints } from '../types';
import { getRecentTopPerformers, getTopFranchiseForm } from '../utils/stats';

interface Props {
  allPlayerPoints: PlayerPoints[];
}

export const RecentStats: React.FC<Props> = ({ allPlayerPoints }) => {
  const topPerformers = getRecentTopPerformers(allPlayerPoints).map(player => ({
        ...player,
        franchise: player.franchise === 'Unknown' ? 'UNSOLD' : player.franchise
    }));
  const franchiseForm = getTopFranchiseForm(allPlayerPoints);

  return (
    <Card 
      elevation={3}
      sx={{
        borderRadius: 8,
        overflow: 'hidden',
        border: '3px solid rgba(250, 231, 108, 0.79)'
      }}
    >
      <Typography 
        variant="h5" 
        sx={{ 
          p: 2, 
          textAlign: 'center', 
          fontWeight: 'bold',
          color: 'white',
          borderBottom: '2px solid rgba(250, 231, 108, 0.4)'
        }}
      >
        Recent Performance Stats
      </Typography>

      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* Top Performers Table */}
          <Grid item xs={12} md={6}>
            < Card>
                <TableContainer 
                component={Paper}
                sx={{ 
                    backgroundColor: 'rgba(41, 5, 48, 0.95)',
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                }}
                >
                <Typography variant="h6" sx={{ p: 2, textAlign: 'center', fontWeight: 'bold' }}>
                    Top Performers (Last 5 Games)
                </Typography>
                <Table size="small">
                    <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Player</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Franchise</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Matches</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Points</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {topPerformers.map((player) => (
                        <TableRow key={player.player_name}>
                        <TableCell>{player.player_name}</TableCell>
                        <TableCell>{player.franchise}</TableCell>
                        <TableCell align="right">{player.matches_played}</TableCell>
                        <TableCell align="right">{player.total_points}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </TableContainer>
                </Card>
          </Grid>

          {/* Franchise Form Table */}
          <Grid item xs={12} md={6}>
            <Card>
                <TableContainer 
                component={Paper}
                sx={{ 
                    backgroundColor: 'rgba(41, 5, 48, 0.95)',
                    borderRadius: 2,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                }}
                >
                <Typography variant="h6" sx={{ p: 2, textAlign: 'center', fontWeight: 'bold' }}>
                    Franchise Form (Last 7 Games)
                </Typography>
                <Table size="small">
                    <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.04)' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Franchise</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Matches</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Points</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>Points/Match</TableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {franchiseForm.map((franchise) => (
                        <TableRow key={franchise.franchise}>
                        <TableCell>{franchise.franchise}</TableCell>
                        <TableCell align="right">{franchise.matches_played}</TableCell>
                        <TableCell align="right">{franchise.total_points}</TableCell>
                        <TableCell align="right">
                            {(franchise.total_points / franchise.matches_played).toFixed(1)}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
                </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};