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
  Typography 
} from '@mui/material';
import { PlayerPoints } from '../types';
import { getRecentTopPerformers, getTopFranchiseForm } from '../utils/stats';

interface Props {
  allPlayerPoints: PlayerPoints[];
}

export const RecentStats: React.FC<Props> = ({ allPlayerPoints }) => {
  const topPerformers = getRecentTopPerformers(allPlayerPoints);
  const franchiseForm = getTopFranchiseForm(allPlayerPoints);

  return (
    <Grid container spacing={2} sx={{ mt: 4 }}>
      <Grid item xs={12} md={6}>
        <TableContainer component={Paper}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Top Performers (Last 5 Games)
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell>Franchise</TableCell>
                <TableCell align="right">Matches</TableCell>
                <TableCell align="right">Points</TableCell>
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
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TableContainer component={Paper}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Franchise Form (Last 7 Games)
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Franchise</TableCell>
                <TableCell align="right">Matches</TableCell>
                <TableCell align="right">Points</TableCell>
                <TableCell align="right">Points/Match</TableCell>
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
      </Grid>
    </Grid>
  );
};