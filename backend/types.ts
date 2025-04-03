export interface ScrapedPoint {
    id?: string;
    value: string;
    url?: string;
}
  
export interface ScraperOptions {
    selector?: string;
    timeout?: number;
    headers?: Record<string, string>;
}

/**
 * Type definitions for cricket scorecard data
 */

export interface Player {
    name: string;
    // link removed as requested
  }
  
  export interface BattingRecord {
    player: Player;
    status: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    // strikeRate removed as previously requested
  }
  
  export interface BowlingRecord {
    player: Player;
    overs: string;
    maidens: number;
    runs: number;
    wickets: number;
    dots: number;
    // economy, fours, sixes, wides, noBalls removed as previously requested
  }
  
  export interface TeamInnings {
    teamName: string;
    battingRecords: BattingRecord[];
    bowlingRecords: BowlingRecord[];
    extras: string;
    total: string;
    fallOfWickets: string;
  }
  
  export interface CricketScorecard {
    matchTitle: string;
    matchDate?: string;
    innings: TeamInnings[];
    manOfTheMatch?: string | null;
  }

  export interface PlayerFranchiseMap {
    [key: string]: string;
  }
  
  export interface FranchiseStats {
    [franchise: string]: {
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