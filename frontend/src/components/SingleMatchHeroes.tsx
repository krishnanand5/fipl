import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';
import { PlayerPoints } from '../types';

interface Props {
  allPlayerPoints: PlayerPoints[];
}

const SingleMatchHeroes: React.FC<Props> = ({ allPlayerPoints }) => {
  // Flatten all matches and add player info
  const allMatches = allPlayerPoints.flatMap(player =>
    player.matches.map(match => ({
      player_name: player.player_name,
      franchise: player.franchise,
      ...match
    }))
  );

  const formatPoints = (points: number): string | number => {
    return points === 0 ? '-' : points;
  };

  const formatFranchise = (franchise: string): string => {
    return franchise === 'Unknown' ? 'UNSOLD' : franchise;
  };

  // Sort by total points and get top 10
  const topPerformances = allMatches
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  return (
    <TableContainer component={Paper} sx={{ backgroundColor: 'black', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ p: 2, textAlign: 'center', fontWeight: 'bold' }}>
        Single Match Heroes
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Player</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Franchise</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Batting</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Bowling</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Fielding</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>MOM</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topPerformances.map((performance, index) => (
            <TableRow 
              key={`${performance.player_name}-${performance.match_id}`}
              sx={{ 
                backgroundColor: 'rgba(24, 18, 18, 0.9)',
                '&:nth-of-type(odd)': { backgroundColor: 'rgba(83, 78, 78, 0.8)' }
              }}
            >
              <TableCell>{performance.player_name}</TableCell>
              <TableCell>{formatFranchise(performance.franchise)}</TableCell>
              <TableCell align="right">{formatPoints(performance.batting_points)}</TableCell>
              <TableCell align="right">{formatPoints(performance.bowling_points)}</TableCell>
              <TableCell align="right">{formatPoints(performance.fielding_points)}</TableCell>
              <TableCell align="right">{formatPoints(performance.mom)}</TableCell>
              <TableCell align="right">{performance.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SingleMatchHeroes;