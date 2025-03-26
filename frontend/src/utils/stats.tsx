import { PlayerPoints } from '../types';

interface RecentPerformance {
  player_name: string;
  franchise: string;
  matches_played: number;
  total_points: number;
}

interface FranchiseForm {
  franchise: string;
  total_points: number;
  matches_played: number;
}

export const getRecentTopPerformers = (
  allPlayerPoints: PlayerPoints[], 
  gameCount: number = 5
): RecentPerformance[] => {
  const allMatchIds = Array.from(new Set(
    allPlayerPoints.flatMap(p => p.matches.map(m => parseInt(m.match_id)))
  )).sort((a, b) => b - a);

  const recentMatchIds = allMatchIds.slice(0, gameCount);

  return allPlayerPoints
    .map(player => {
      const recentMatches = player.matches.filter(m => 
        recentMatchIds.includes(parseInt(m.match_id))
      );
      
      return {
        player_name: player.player_name,
        franchise: player.franchise,
        matches_played: recentMatches.length,
        total_points: recentMatches.reduce((sum, match) => sum + match.total, 0)
      };
    })
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 5);
};

export const getTopFranchiseForm = (
  allPlayerPoints: PlayerPoints[], 
  gameCount: number = 7
): FranchiseForm[] => {
  const allMatchIds = Array.from(
    new Set(allPlayerPoints.flatMap(p => p.matches.map(m => parseInt(m.match_id))))
  ).sort((a, b) => b - a);

  const recentMatchIds = allMatchIds.slice(0, gameCount);
  const franchisePoints = new Map<string, number>();
  const franchiseMatches = new Map<string, Set<string>>();

  allPlayerPoints.forEach(player => {
    const { franchise } = player;
    if (franchise === 'Unknown') return;

    player.matches
      .filter(m => recentMatchIds.includes(parseInt(m.match_id)))
      .forEach(match => {
        franchisePoints.set(
          franchise, 
          (franchisePoints.get(franchise) || 0) + match.total
        );
        
        if (!franchiseMatches.has(franchise)) {
          franchiseMatches.set(franchise, new Set());
        }
        franchiseMatches.get(franchise)?.add(match.match_id);
      });
  });

  return Array.from(franchisePoints.entries())
    .map(([franchise, points]) => ({
      franchise,
      total_points: points,
      matches_played: franchiseMatches.get(franchise)?.size || 0
    }))
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, 5);
};