// PlayerStatsModal.tsx
import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Paper,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface MatchStats {
  match_id: string;
  batting_points: number;
  bowling_points: number;
  fielding_points: number;
  mom: number;
  total: number;
}

interface PlayerStatsModalProps {
  player: {
    player_name: string;
    franchise: string;
    matches: MatchStats[];
    total_points: number;
  } | null;
  onClose: () => void;
  isOpen: boolean;
}

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 800,
    maxHeight: '80vh',
    bgcolor: 'rgba(41, 5, 48, 0.95)',
    borderRadius: 3,
    boxShadow: `
      0 0 0 2px rgb(25, 118, 210),
      0 12px 24px -4px rgba(25, 118, 210, 0.3),
      0 8px 16px -4px rgba(29, 15, 179, 0.46)
    `,
    p: 4,
    overflow: 'auto',
    transition: 'box-shadow 0.3s ease-in-out',
    '&:hover': {
      boxShadow: `
        0 0 0 2px rgba(25, 118, 210, 0.2),
        0 16px 32px -4px rgba(25, 118, 210, 0.4),
        0 12px 24px -4px rgba(0, 0, 0, 0.3)
      `
    }
  };

const PlayerStatsModal: React.FC<PlayerStatsModalProps> = ({ player, onClose, isOpen }) => {
  if (!isOpen || !player) return null;

  const sortedMatches = [...player.matches].sort((a, b) => 
    parseInt(a.match_id) - parseInt(b.match_id)
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="player-stats-modal"
      aria-describedby="player-match-statistics"
      closeAfterTransition
      BackdropProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
        },
      }}
    >
      <Fade in={isOpen} timeout={400}>
        <Box sx={{
            ...modalStyle,
            opacity: 0,
            transform: 'translate(-50%, -45%)',
            animation: isOpen ? 'slideIn 400ms forwards' : 'slideOut 400ms forwards',
            '@keyframes slideIn': {
              '0%': {
                opacity: 0,
                transform: 'translate(-50%, -45%)',
              },
              '100%': {
                opacity: 1,
                transform: 'translate(-50%, -50%)',
              },
              '@keyframes slideOut': {
                '0%': {
                  opacity: 1,
                  transform: 'translate(-50%, -50%)',
                },
                '100%': {
                  opacity: 0,
                  transform: 'translate(-50%, -55%)',
                },
          },
            },
          }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ flex: 1 }} /> {/* Left spacer */}
                  <Typography sx={{ flex: 2, textAlign: 'center', fontWeight: 'bold' }}>
                      {player.player_name} ({player.total_points} points)
                  </Typography>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton onClick={onClose} size="small">
                  <CloseIcon />
                  </IconButton>
              </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <TableContainer
              component={Paper} 
              sx={{ 
                  mb: 2,
                  boxShadow: '0 4px 12px rgba(15, 108, 201, 0.15)',
                  borderRadius: 2,
                  '& .MuiTable-root': {
                  backgroundColor: 'rgba(25, 118, 210, 0.02)'
                  },
                  '& .MuiTableHead-root': {
                  backgroundColor: 'rgba(25, 118, 210, 0.05)'
                  },
                  '& .MuiTableRow-root:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.05)'
                  }
              }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Match</TableCell>
                  <TableCell align="right">Batting</TableCell>
                  <TableCell align="right">Bowling</TableCell>
                  <TableCell align="right">Fielding</TableCell>
                  <TableCell align="right">MOM</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedMatches.map((match, index) => (
                  <TableRow key={match.match_id}>
                    <TableCell component="th" scope="row">
                      {index + 1}
                    </TableCell>
                    <TableCell align="right">{match.batting_points}</TableCell>
                    <TableCell align="right">{match.bowling_points}</TableCell>
                    <TableCell align="right">{match.fielding_points}</TableCell>
                    <TableCell align="right">{match.mom}</TableCell>
                    <TableCell align="right">{match.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Fade>
    </Modal>
  );
};

export default PlayerStatsModal;