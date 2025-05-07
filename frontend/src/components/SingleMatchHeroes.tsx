import React from 'react';
import { DataTable, Column } from './common/DataTable';
import { PlayerPoints } from '../types';
import '../styles/SingleMatchHeroes.css';

interface Props {
  allPlayerPoints: PlayerPoints[];
}

const formatPoints = (points: number): string | number => {
  return points === 0 ? '-' : points;
};

export const SingleMatchHeroes: React.FC<Props> = ({ allPlayerPoints }) => {
  // Flatten all matches with player info
  const allMatches = allPlayerPoints.flatMap(player => 
    player.matches.map(match => ({
      ...match,
      player_name: player.player_name,
      franchise: player.franchise === 'Unknown' ? 'UNSOLD' : player.franchise
    }))
  );

  // Calculate total points for each match
  const matchesWithTotal = allMatches.map(match => ({
    ...match,
    total: match.batting_points + match.bowling_points + match.fielding_points + match.mom
  }));

  // Sort by total points and get top 10
  const topPerformances = matchesWithTotal
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const columns: Column<typeof topPerformances[0]>[] = [
    { id: 'player_name', label: 'Player' },
    { id: 'franchise', label: 'Franchise' },
    { 
      id: 'batting_points', 
      label: 'Batting', 
      align: 'right',
      getValue: (row) => formatPoints(row.batting_points),
      className: 'points-column'
    },
    { 
      id: 'bowling_points', 
      label: 'Bowling', 
      align: 'right',
      getValue: (row) => formatPoints(row.bowling_points),
      className: 'points-column'
    },
    { 
      id: 'fielding_points', 
      label: 'Fielding', 
      align: 'right',
      getValue: (row) => formatPoints(row.fielding_points),
      className: 'points-column'
    },
    { 
      id: 'mom', 
      label: 'MoM', 
      align: 'right',
      getValue: (row) => formatPoints(row.mom),
      className: 'points-column'
    },
    { 
      id: 'total', 
      label: 'Total', 
      align: 'right',
      className: 'total-column'
    },
  ];

  return (
    <div className="single-match-heroes">
      <DataTable<typeof topPerformances[0]>
        title="Top Single Match Performances"
        columns={columns}
        data={topPerformances}
        getRowKey={(row) => `${row.player_name}-${row.match_id}`}
      />
    </div>
  );
};