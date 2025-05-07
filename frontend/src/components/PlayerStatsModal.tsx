// PlayerStatsModal.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box
} from '@mui/material';
import { PlayerStatsModalProps } from '../types';

  const formatPoints = (points: number): string | number => {
    return points === 0 ? '-' : points;
  };

const PlayerStatsModal: React.FC<PlayerStatsModalProps> = ({ player, isOpen, onClose }) => {
  if (!player) return null;

  const sortedMatches = [...player.matches]
    .sort((a, b) => parseInt(b.match_id) - parseInt(a.match_id));

  return (
    <Dialog 
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'black',
          color: 'white',
          border: '2px solid rgba(250, 231, 108, 0.79)'
        }
      }}
    >
      <DialogTitle>
        <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          {player.player_name}
        </Typography>
        <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>
          {player.franchise === 'Unknown' ? 'UNSOLD' : player.franchise}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Match History
                  </Typography>
          <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(24, 18, 18, 0.9)' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Match</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Batting</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Bowling</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Fielding</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>MoM</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedMatches.map((match) => (
                  <TableRow 
                  key={match.match_id}
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: 'rgba(83, 78, 78, 0.8)' }
                  }}
                  >
                    <TableCell>{match.match_id}</TableCell>
                    <TableCell align="right">{formatPoints(match.batting_points)}</TableCell>
                    <TableCell align="right">{formatPoints(match.bowling_points)}</TableCell>
                    <TableCell align="right">{formatPoints(match.fielding_points)}</TableCell>
                    <TableCell align="right">{formatPoints(match.mom)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{match.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: 'white' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlayerStatsModal;