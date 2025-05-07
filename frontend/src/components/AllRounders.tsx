import React from 'react';
import { PlayerPoints } from '../types';
import { DataTable, Column } from './common/DataTable';
import '../styles/AllRounders.css';

interface Props {
  allPlayerPoints: PlayerPoints[];
}

interface AllRounderStats {
  name: string;
  franchise: string;
  matches: number;
  battingPoints: number;
  bowlingPoints: number;
  totalPoints: number;
}

export const AllRoundersTable: React.FC<Props> = ({ allPlayerPoints }) => {
  const allRounders = allPlayerPoints
    .map(player => {
      const battingPoints = player.matches.reduce((sum, match) => sum + match.batting_points, 0);
      const bowlingPoints = player.matches.reduce((sum, match) => sum + match.bowling_points, 0);
      
      // Only consider players with both batting and bowling contributions
      if (battingPoints > 200 && bowlingPoints > 200) {
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

  const columns: Column<AllRounderStats>[] = [
    { id: 'name', label: 'Player' },
    { id: 'franchise', label: 'Franchise' },
    { id: 'matches', label: 'Matches', align: 'right' },
    { id: 'battingPoints', label: 'Batting', align: 'right' },
    { id: 'bowlingPoints', label: 'Bowling', align: 'right' },
    { 
      id: 'totalPoints', 
      label: 'Total', 
      align: 'right',
      style: { fontWeight: 'bold' }
    },
  ];

  return (
    <DataTable<AllRounderStats>
      title={<>
        Top All-Rounders
        <br />
        (Min 200 points in each)
      </>}
      columns={columns}
      data={allRounders as AllRounderStats[]}
      getRowKey={(row) => row.name}
    />
  );
};