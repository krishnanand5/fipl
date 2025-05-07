import { PlayerPoints, MatchPoints } from '../types/index';

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

export const calculateRecentForm = (matches: MatchPoints[]): number[] => {
  const sortedMatches = [...matches]
    .sort((a, b) => parseInt(b.match_id) - parseInt(a.match_id))
    .slice(0, 3);

  return sortedMatches.map(match => match.total);
};

export const getTopPerformers = (players: PlayerPoints[], count: number = 10) => {
  return players
    .map(player => {
      const recentMatches = player.matches
        .sort((a, b) => parseInt(b.match_id) - parseInt(a.match_id))
        .slice(0, 3);

      return {
        player_name: player.player_name,
        franchise: player.franchise,
        matches_played: recentMatches.length,
        total_points: recentMatches.reduce((sum, match) => sum + match.total, 0)
      };
    })
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, count);
};

export const getFranchiseStats = (players: PlayerPoints[]) => {
  const franchisePoints = new Map<string, number>();
  const franchiseMatches = new Map<string, Set<string>>();
  const franchisePlayerCount = new Map<string, number>();

  players.forEach(player => {
    if (player.franchise === 'Unknown') return;

    const franchise = player.franchise;
    franchisePlayerCount.set(franchise, (franchisePlayerCount.get(franchise) || 0) + 1);

    player.matches.forEach(match => {
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

  return Array.from(franchisePoints.entries()).map(([franchise, points]) => ({
    franchise,
    total_points: points,
    player_count: franchisePlayerCount.get(franchise) || 0,
    matches_played: franchiseMatches.get(franchise)?.size || 0
  }));
};

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