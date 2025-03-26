export interface MatchPoints {
  match_id: string;
  batting_points: number;
  bowling_points: number;
  fielding_points: number;
  mom: number;
  total: number;
}

export interface LeaderboardEntry {
  player_name: string;
  franchise: string;
  matches_played: number;
  total_points: number;
}

export interface PlayerPoints {
  player_name: string;
  franchise: string;
  matches: MatchPoints[];
  total_points: number;
}

export interface FranchiseStats {
  franchise: string;
  total_points: number;
  player_count: number;
}