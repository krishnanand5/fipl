import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { PlayerPoints, LeaderboardEntry, FranchiseStats } from '../types';
import { MatchPoints } from '../types/index';
import PlayerStatsModal from './PlayerStatsModal';
import { DataTable, Column } from './common/DataTable';
import '../styles/Leaderboard.css';

interface Props {
  leaderboardData: LeaderboardEntry[];
  allPlayerPoints: PlayerPoints[];
}

const formatRecentPoints = (matchTotals: number[]): React.ReactNode[] => {
  return matchTotals.map((points, index) => {
    let color = 'inherit';
    if (index < matchTotals.length - 1) {
      color = points > matchTotals[index + 1] ? 'success.main' : 
              points < matchTotals[index + 1] ? 'error.main' : 'inherit';
    }

    if (index === matchTotals.length - 1) {
      color = points > matchTotals[index - 1] ? 'success.main' : 
              points < matchTotals[index - 1] ? 'error.main' : 'inherit';
    }
    
    return (
      <Box 
        key={index}
        component="span"
        className={`recent-form-point ${color === 'success.main' ? 'increase' : color === 'error.main' ? 'decrease' : ''}`}
      >
        {points}
      </Box>
    );
  });
};

const formatPoints = (points: number): string | number => {
  return points === 0 ? '-' : points;
};

const calculatePlayerRecentForm = (matches: MatchPoints[]): React.ReactNode => {
  const sortedMatches = [...matches]
    .sort((a, b) => parseInt(b.match_id) - parseInt(a.match_id))
    .slice(0, 3);

  const recentPoints = sortedMatches.map(match => match.total);

  return (
    <Box className="recent-form-box">
      {formatRecentPoints(recentPoints)}
    </Box>
  );
};

const PlayerTable: React.FC<{ players: PlayerPoints[] }> = ({ players }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerPoints | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlayerClick = (player: PlayerPoints) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const columns: Column<PlayerPoints>[] = [
    { 
      id: 'player_name', 
      label: 'Player',
      render: (player) => (
        <Box 
          className="player-name"
          onClick={() => handlePlayerClick(player)}
        >
          {player.player_name}
        </Box>
      )
    },
    { 
      id: 'total_points', 
      label: 'Total', 
      align: 'right',
      getValue: (player) => formatPoints(player.total_points)
    },
    { 
      id: 'matches', 
      label: 'Matches', 
      align: 'right',
      getValue: (player) => player.matches.length
    },
    { 
      id: 'batting', 
      label: 'Batting', 
      align: 'right',
      getValue: (player) => formatPoints(player.matches.reduce((sum, m) => sum + m.batting_points, 0))
    },
    { 
      id: 'bowling', 
      label: 'Bowling', 
      align: 'right',
      getValue: (player) => formatPoints(player.matches.reduce((sum, m) => sum + m.bowling_points, 0))
    },
    { 
      id: 'fielding', 
      label: 'Fielding', 
      align: 'right',
      getValue: (player) => formatPoints(player.matches.reduce((sum, m) => sum + m.fielding_points, 0))
    },
    { 
      id: 'mom', 
      label: 'MoM', 
      align: 'right',
      getValue: (player) => formatPoints(player.matches.reduce((sum, m) => sum + m.mom, 0))
    },
    { 
      id: 'recent', 
      label: 'Last 3 Games', 
      align: 'center',
      render: (player) => calculatePlayerRecentForm(player.matches)
    },
  ];

  return (
    <>
      <DataTable<PlayerPoints>
        columns={columns}
        data={players}
        getRowKey={(player) => player.player_name}
        containerStyle={{
          backgroundColor: 'rgba(41, 5, 48, 0.95)',
          borderRadius: 8,
          border: '3px solid rgba(250, 231, 108, 0.79)'
        }}
      />
      <PlayerStatsModal 
        player={selectedPlayer} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export const Leaderboard: React.FC<Props> = ({ leaderboardData, allPlayerPoints }) => {
  // Aggregate data by franchise
  const franchiseStats = leaderboardData.reduce((acc: { [key: string]: FranchiseStats }, player) => {
    if (player.franchise === 'Unknown') return acc;
    
    if (!acc[player.franchise]) {
      acc[player.franchise] = {
        franchise: player.franchise,
        total_points: 0,
        player_count: 0,
        players: []
      };
    }
    
    const matchingPlayer = allPlayerPoints.find(p => p.player_name === player.player_name);
    if (matchingPlayer) {
      acc[player.franchise].total_points += player.total_points;
      acc[player.franchise].player_count += 1;
      acc[player.franchise].players.push(matchingPlayer);
    }
    
    return acc;
  }, {});

  const sortedFranchises = Object.values(franchiseStats)
    .sort((a, b) => b.total_points - a.total_points);

  const leadingPoints = sortedFranchises[0]?.total_points || 0;

  const columns: Column<FranchiseStats>[] = [
    { 
      id: 'franchise', 
      label: 'Franchise',
      render: (franchise, index) => (
        <Box className="franchise-container">
          <span>{franchise.franchise}</span>
          {index > 0 && (
            <Typography
              component="span"
              className="points-gap"
            >
              {leadingPoints - franchise.total_points}
            </Typography>
          )}
        </Box>
      )
    },
    { id: 'total_points', label: 'Points', align: 'right' },
    { id: 'player_count', label: 'Players', align: 'right' },
    { 
      id: 'recent_points', 
      label: 'Recent Form', 
      align: 'center',
      render: (franchise) => {
        // Get all matches from all players
        const allMatches = franchise.players.flatMap(player => 
          player.matches.map(match => ({
            match_id: match.match_id,
            total: match.total
          }))
        );

        // Group by match_id and sum totals
        const matchTotals = allMatches.reduce((acc, { match_id, total }) => {
          acc[match_id] = (acc[match_id] || 0) + total;
          return acc;
        }, {} as Record<string, number>);

        // Convert to array and sort by match_id
        const recentPoints = Object.entries(matchTotals)
          .sort(([a], [b]) => parseInt(b) - parseInt(a))
          .slice(0, 3)
          .map(([_, total]) => total);
        
        return (
          <Box className="recent-form-box">
            {formatRecentPoints(recentPoints)}
          </Box>
        );
      }
    },
    { 
      id: 'avg_points', 
      label: 'Avg/Player', 
      align: 'right',
      getValue: (franchise) => (franchise.total_points / franchise.player_count).toFixed(1)
    },
  ];

  return (
    <DataTable<FranchiseStats>
      columns={columns}
      data={sortedFranchises}
      getRowKey={(franchise) => franchise.franchise}
      expandable
      expandedContent={(franchise) => (
        <PlayerTable players={franchise.players} />
      )}
      rowStyle={(franchise, index) => ({
        fontWeight: index < 3 ? 600 : 400
      })}
    />
  );
};