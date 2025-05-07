export interface LeaderboardEntry {
  player_name: string;
  franchise: string;
  total_points: number;
}

export interface MatchStats {
  match_id: string;
  batting_points: number;
  bowling_points: number;
  fielding_points: number;
  mom: number;
  total: number;
}

export interface PlayerPoints {
  player_name: string;
  franchise: string;
  total_points: number;
  matches: MatchStats[];
}

export interface FranchiseStats {
  franchise: string;
  total_points: number;
  player_count: number;
  players: PlayerPoints[];
}

export interface BonusStats {
  [key: string]: {
    total: number;
    count: number;
    average: number;
  };
}

export interface FranchiseBonus {
  [key: string]: {
    runs_25: number;
    runs_50: number;
    runs_75: number;
    runs_100: number;
    wickets_3: number;
    wickets_5: number;
    wickets_7: number;
    maidens: number;
  };
}

export interface PlayerStatsModalProps {
  player: PlayerPoints | null;
  isOpen: boolean;
  onClose: () => void;
} 