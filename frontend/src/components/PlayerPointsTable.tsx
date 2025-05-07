import React from 'react';
import { PlayerPoints } from '../types';
import { DataTable, Column } from './common/DataTable';
import '../styles/PlayerPointsTable.css';

interface Props {
  allPlayerPoints: PlayerPoints[];
}

interface PlayerTotalStats {
  name: string;
  franchise: string;
  battingPoints: number;
  bowlingPoints: number;
  fieldingPoints: number;
  momPoints: number;
  totalPoints: number;
}

export const PlayerPointsTable: React.FC<Props> = ({ allPlayerPoints }) => {
  const playerStats = allPlayerPoints.map(player => {
    const battingPoints = player.matches.reduce((sum, match) => sum + match.batting_points, 0);
    const bowlingPoints = player.matches.reduce((sum, match) => sum + match.bowling_points, 0);
    const fieldingPoints = player.matches.reduce((sum, match) => sum + match.fielding_points, 0);
    const momPoints = player.matches.reduce((sum, match) => sum + match.mom, 0);
    const totalPoints = battingPoints + bowlingPoints + fieldingPoints + momPoints;

    return {
      name: player.player_name,
      franchise: player.franchise === 'Unknown' ? 'UNSOLD' : player.franchise,
      battingPoints,
      bowlingPoints,
      fieldingPoints,
      momPoints,
      totalPoints
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 10);

  const formatPoints = (points: number): string | number => {
    return points === 0 ? '-' : points;
  };

  const columns: Column<PlayerTotalStats>[] = [
    { id: 'name', label: 'Player' },
    { id: 'franchise', label: 'Franchise' },
    { 
      id: 'totalPoints', 
      label: 'Total', 
      align: 'right',
      className: 'total-column'
    },
    { 
      id: 'battingPoints', 
      label: 'Batting', 
      align: 'right',
      getValue: (row) => formatPoints(row.battingPoints)
    },
    { 
      id: 'bowlingPoints', 
      label: 'Bowling', 
      align: 'right',
      getValue: (row) => formatPoints(row.bowlingPoints)
    },
    { 
      id: 'fieldingPoints', 
      label: 'Fielding', 
      align: 'right',
      getValue: (row) => formatPoints(row.fieldingPoints)
    },
    { 
      id: 'momPoints', 
      label: 'MoM', 
      align: 'right',
      getValue: (row) => formatPoints(row.momPoints)
    },
  ];

  return (
    <DataTable<PlayerTotalStats>
      title="Top 10 Performers"
      columns={columns}
      data={playerStats}
      getRowKey={(row) => row.name}
      tableClassName="player-points-table"
    />
  );
}; 