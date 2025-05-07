import { useState, useEffect } from 'react';
import { LeaderboardEntry, PlayerPoints, FranchiseBonus } from '../types';

export const useAppData = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [allPlayerPoints, setAllPlayerPoints] = useState<PlayerPoints[]>([]);
  const [bonusStats, setBonusStats] = useState<FranchiseBonus>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [leaderboard, players, bonus] = await Promise.all([
          fetch(`${process.env.PUBLIC_URL}/data/player_points/leaderboard.json`),
          fetch(`${process.env.PUBLIC_URL}/data/player_points/all_player_points.json`),
          fetch(`${process.env.PUBLIC_URL}/data/player_points/franchise_wise_bonus.json`)
        ]);

        if (!bonus.ok) {
          throw new Error(`Failed to fetch bonus stats: ${bonus.statusText}`);
        }
        
        const leaderboardJson = await leaderboard.json();
        const playersJson = await players.json();
        const bonusJson = await bonus.json();
        
        setLeaderboardData(leaderboardJson);
        setAllPlayerPoints(playersJson);
        setBonusStats(bonusJson);
        setError(null);
      } catch (error) {
        console.error('Error loading data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while loading data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    leaderboardData,
    allPlayerPoints,
    bonusStats,
    isLoading,
    error
  };
}; 