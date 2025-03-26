import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography,
  Button
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayerPoints } from '../types';

interface TeamParams {
  teamId?: string;
}

interface Props {
  allPlayerPoints: PlayerPoints[];
}

export const TeamDetails: React.FC<Props> = ({ allPlayerPoints }) => {
  const { teamId } = useParams<keyof TeamParams>() as TeamParams;
  const navigate = useNavigate();
  const decodedTeamId = decodeURIComponent(teamId || '');

  // Filter and sort players by total points
  const teamPlayers = allPlayerPoints
    .filter(player => player.franchise === decodedTeamId)
    .sort((a, b) => b.total_points - a.total_points);

  return (
    <TableContainer component={Paper}>
      <Button 
        onClick={() => navigate('/')}
        sx={{ margin: 2 }}
      >
        Back to Leaderboard
      </Button>
      
      <Typography variant="h4" padding={2}>
        {decodedTeamId} - Player Points
      </Typography>
      
      <Table>
        <TableHead>
          <TableRow>
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
          {teamPlayers.map((player) => (
            <TableRow key={player.player_name}>
              <TableCell>{player.player_name}</TableCell>
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
    </TableContainer>
  );
};