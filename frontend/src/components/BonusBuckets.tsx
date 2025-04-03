import React, { useEffect, useState } from 'react';
import { Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Grid } from '@mui/material';

interface BonusStats {
  runs_25: number;
  runs_50: number;
  runs_75: number;
  runs_100: number;
  wickets_3: number;
  wickets_5: number;
  wickets_7: number;
  maidens: number;
}

interface FranchiseBonus {
  [franchise: string]: BonusStats;
}

interface Props {
  bonusStats: FranchiseBonus;
}

const BonusBuckets: React.FC<Props> = ({ bonusStats }) => {
  const [battingBonuses, setBattingBonuses] = useState<Array<[string, number, BonusStats]>>([]);
  const [bowlingBonuses, setBowlingBonuses] = useState<Array<[string, number, BonusStats]>>([]);

  const formatValue = (value: number): string | number => {
    return value === 0 ? '-' : value;
  };

  const formatFranchise = (franchise: string): string => {
    return franchise === 'Unknown' ? 'UNSOLD' : franchise;
  };

  useEffect(() => {
    // Calculate and sort batting bonuses
    const battingEntries = Object.entries(bonusStats).map(([franchise, stats]) => {
      const totalPoints = (stats.runs_25 * 10) + (stats.runs_50 * 10) + 
                         (stats.runs_75 * 10) + (stats.runs_100 * 10);
      return [franchise, totalPoints, stats] as [string, number, BonusStats];
    }).sort((a, b) => b[1] - a[1]);

    // Calculate and sort bowling bonuses
    const bowlingEntries = Object.entries(bonusStats).map(([franchise, stats]) => {
      const totalPoints = (stats.wickets_3 * 25) + (stats.wickets_5 * 50) + 
                         (stats.wickets_7 * 75) + (stats.maidens * 10);
      return [franchise, totalPoints, stats] as [string, number, BonusStats];
    }).sort((a, b) => b[1] - a[1]);

    setBattingBonuses(battingEntries);
    setBowlingBonuses(bowlingEntries);
  }, [bonusStats]);

  return (
    <Grid container spacing={4}>
      {/* Batting Bonuses */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', backgroundColor: 'black', borderRadius: 4 }}>
          <Typography variant="h6" sx={{ p: 2, textAlign: 'center', fontWeight: 'bold' }}>
            Batting Milestones
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Franchise</TableCell>
                  <TableCell align="right">25+</TableCell>
                  <TableCell align="right">50+</TableCell>
                  <TableCell align="right">75+</TableCell>
                  <TableCell align="right">100+</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {battingBonuses.map(([franchise, total, stats]) => (
                  <TableRow 
                    key={franchise}
                    sx={{ 
                        backgroundColor: 'rgba(24, 18, 18, 0.9)',
                        '&:nth-of-type(odd)': { backgroundColor: 'rgba(83, 78, 78, 0.8)' }
                      }}
                >
                    <TableCell>{formatFranchise(franchise)}</TableCell>
                    <TableCell align="right">{formatValue(stats.runs_25)}</TableCell>
                    <TableCell align="right">{formatValue(stats.runs_50)}</TableCell>
                    <TableCell align="right">{formatValue(stats.runs_75)}</TableCell>
                    <TableCell align="right">{formatValue(stats.runs_100)}</TableCell>
                    <TableCell align="right">{formatValue(total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>

      {/* Bowling Bonuses */}
      <Grid item xs={12} md={6}>
        <Card sx={{ height: '100%', backgroundColor: 'black', borderRadius: 4 }}>
          <Typography variant="h6" sx={{ p: 2, textAlign: 'center', fontWeight: 'bold' }}>
            Bowling Milestones
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Franchise</TableCell>
                  <TableCell align="right">3-Fer</TableCell>
                  <TableCell align="right">5-Fer</TableCell>
                  <TableCell align="right">7-Fer</TableCell>
                  <TableCell align="right">Maidens</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bowlingBonuses.map(([franchise, total, stats]) => (
                  <TableRow 
                    key={franchise}
                    sx={{ 
                        backgroundColor: 'rgba(24, 18, 18, 0.9)',
                        '&:nth-of-type(odd)': { backgroundColor: 'rgba(83, 78, 78, 0.8)' }
                      }}
                    >
                    <TableCell>{formatFranchise(franchise)}</TableCell>
                    <TableCell align="right">{formatValue(stats.wickets_3)}</TableCell>
                    <TableCell align="right">{formatValue(stats.wickets_5)}</TableCell>
                    <TableCell align="right">{formatValue(stats.wickets_7)}</TableCell>
                    <TableCell align="right">{formatValue(stats.maidens)}</TableCell>
                    <TableCell align="right">{formatValue(total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>
    </Grid>
  );
};

export default BonusBuckets;