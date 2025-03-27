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
  Grid,
  Card,
} from '@mui/material';
import { PlayerPoints } from '../types';

interface Props {
  allPlayerPoints: PlayerPoints[];
}

interface SkillStats {
  player_name: string;
  franchise: string;
  matches_played: number;
  total_points: number;
}

const SkillsLeaderboard: React.FC<Props> = ({ allPlayerPoints }) => {
  const calculateSkillStats = (skillType: 'batting' | 'bowling' | 'fielding'): SkillStats[] => {
    const stats = allPlayerPoints.map(player => {
      const pointsKey = `${skillType}_points` as const;
      const totalPoints = player.matches.reduce((sum, match) => sum + match[pointsKey], 0);
      
      return {
        player_name: player.player_name,
        franchise: player.franchise,
        matches_played: player.matches.length,
        total_points: totalPoints
      };
    });

    return stats
      .sort((a, b) => b.total_points - a.total_points)
      .filter(player => player.total_points > 0)
      .slice(0, 10);
  };

  const SkillTable: React.FC<{ title: string, data: SkillStats[], skillType: string }> = 
    ({ title, data, skillType }) => (
    <Card sx={{ mb: { xs: 2, md: 0 } }}>
      <TableContainer component={Paper}>
        <Typography variant="h6" sx={{ p: 2, textAlign: 'center', fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', fontSize:'10px' }}>Player</TableCell>
              <TableCell sx={{ fontWeight: 'bold' , fontSize:'10px'}}>Franchise</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize:'10px' }}>Matches</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold', fontSize:'10px'}}>{skillType} Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((player, index) => (
              <TableRow 
                key={player.player_name}
                sx={{ '&:nth-of-type(even)': { backgroundColor: 'action.hover' } }}
              >
                <TableCell>{player.player_name}</TableCell>
                <TableCell>{player.franchise === "Unknown" ? "UNSOLD" : player.franchise}</TableCell>
                <TableCell align="right">{player.matches_played}</TableCell>
                <TableCell align="right">{player.total_points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );

  const battingStats = calculateSkillStats('batting');
  const bowlingStats = calculateSkillStats('bowling');
  const fieldingStats = calculateSkillStats('fielding');

  return (
    <Grid 
      container 
      spacing={{ xs: 3, md: 2 }}
      sx={{ p: 2 }} 
    >
      <Grid item xs={12} md={4}>
        <SkillTable 
          title="Top Batters" 
          data={battingStats} 
          skillType="Batting"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <SkillTable 
          title="Top Bowlers" 
          data={bowlingStats} 
          skillType="Bowling"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <SkillTable 
          title="Top Fielders" 
          data={fieldingStats} 
          skillType="Fielding"
        />
      </Grid>
    </Grid>
  );
};

export default SkillsLeaderboard;