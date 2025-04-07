import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  Typography
} from '@mui/material';
import { PlayerPoints } from '../types';

interface Props {
  allPlayerPoints: PlayerPoints[];
}

export const AllRoundersTable: React.FC<Props> = ({ allPlayerPoints }) => {
  const allRounders = allPlayerPoints
    .map(player => {
      const battingPoints = player.matches.reduce((sum, match) => sum + match.batting_points, 0);
      const bowlingPoints = player.matches.reduce((sum, match) => sum + match.bowling_points, 0);
      
      // Only consider players with both batting and bowling contributions
      if (battingPoints > 75 && bowlingPoints > 75) {
        return {
          name: player.player_name,
          franchise: player.franchise !== 'Unknown' ? player.franchise : 'UNSOLD',
          matches: player.matches.length,
          battingPoints,
          bowlingPoints,
          totalPoints: battingPoints + bowlingPoints,
        };
      }
      return null;
    })
    .filter(Boolean) // Remove null entries
    .sort((a, b) => b!.totalPoints - a!.totalPoints)
    .slice(0, 10); // Get top 10

  return (
    <Card 
      elevation={3}
      sx={{
        backgroundColor: 'black',
        overflow: 'hidden',
        border: '2px solid rgba(250, 231, 108, 0.79)'
      }}
    >
      <Typography 
        variant="h5" 
        sx={{ 
          p: 2, 
          color: 'white',
          textAlign: 'center',
          fontWeight: 'bold'
        }}
      >
        Top All-Rounders
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Player</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Franchise</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Matches</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Batting</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Bowling</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allRounders.map((player, index) => (
              <TableRow 
                key={player!.name}
                sx={{ 
                  backgroundColor: 'rgba(24, 18, 18, 0.9)',
                  '&:nth-of-type(odd)': { backgroundColor: 'rgba(83, 78, 78, 0.8)' }
                }}
              >
                <TableCell>{player!.name}</TableCell>
                <TableCell>{player!.franchise}</TableCell>
                <TableCell align="right">{player!.matches}</TableCell>
                <TableCell align="right">{player!.battingPoints}</TableCell>
                <TableCell align="right">{player!.bowlingPoints}</TableCell>
                <TableCell 
                  align="right"
                  sx={{ fontWeight: 'bold' }}
                >
                  {player!.totalPoints}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
};