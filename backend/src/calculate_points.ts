import fs from 'fs/promises';
import path from 'path';
import {trackUnassignedPlayers} from './track_unassigned_players';

// Define types for the new JSON data structure
interface Player {
  name: string;
}

interface BattingRecord {
  player: Player;
  status: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
}

interface BowlingRecord {
  player: Player;
  balls: number;
  maidens: number;
  runs: number;
  wickets: number;
  dots: number;
}

interface TeamInnings {
  teamName: string;
  battingRecords: BattingRecord[];
  bowlingRecords: BowlingRecord[];
  extras: string;
  total?: string;
  fallOfWickets?: string;
}

interface MatchData {
  matchTitle: string;
  manOfTheMatch: string | null;
  innings: TeamInnings[];
}

// Define the structure for player data in franchise file
interface PlayerFranchise {
  [playerName: string]: string; // Player name -> franchise mapping
}

// Define types for player points tracking
interface MatchPoints {
  match_id: string;
  batting_points: number;
  bowling_points: number;
  fielding_points: number;
  mom: number;
  total: number;
}

interface PlayerPointsData {
  player_name: string;
  franchise: string;
  matches: MatchPoints[];
  total_points: number;
}

// Helper function to normalize player names (remove special designations)
function normalizePlayerName(name: string): string {
  return name
    .replace(/\s*\(c\)$/, '')  // Remove captain designation
    .replace(/\s*†$/, '')      // Remove wicketkeeper designation
    .trim();
}

// Calculate batting points
function calculateBattingPoints(record: BattingRecord): number {
  const duckPoints = (record.runs === 0 && record.status !== "not out") ? -10 : 0;

  // Apply the formula: runs + (fours * 2) + (sixes * 3) + (runs % 25 * 10) + (runs - balls)
  const runsPoints = record.runs;
  const boundaryPoints = (record.fours * 2) + (record.sixes * 3);
  const milestoneBonusPoints = Math.floor(record.runs / 25) * 10;
  const strikeRatePoints = record.runs - record.balls;
  
  return runsPoints + boundaryPoints + milestoneBonusPoints + strikeRatePoints + duckPoints;
}

/**
 * Helper function to convert overs string to balls
 * @param oversString - The overs string (e.g. "4", "3.2")
 * @returns Total number of balls
 */
function convertOversToBalls(oversString: string): number {
  try {
    if (!oversString || typeof oversString !== 'string') {
      return 0;
    }
    
    // If it's just a whole number like "4"
    if (!oversString.includes('.')) {
      // Convert whole overs to balls (1 over = 6 balls)
      return (parseInt(oversString, 10) || 0) * 6;
    }
    
    // Parse fractional overs like "2.3" (2 overs and 3 balls)
    const parts = oversString.split('.');
    const fullOvers = parseInt(parts[0], 10) || 0;
    const additionalBalls = parseInt(parts[1], 10) || 0;
    
    // Calculate total balls (whole overs * 6 + additional balls)
    return (fullOvers * 6) + additionalBalls;
  } catch (e) {
    console.error(`Error converting overs "${oversString}" to balls:`, e);
    return 0;
  }
}

// Calculate bowling points
function calculateBowlingPoints(record: BowlingRecord): number {
  // balls is already a number in the updated structure
  console.log("Bowling record for", record.player.name, ":", JSON.stringify(record));
  
  // Check if balls exists and is a number
  if (record.balls === undefined || record.balls === null) {
    console.error(`ERROR: Balls is undefined/null for ${record.player.name}`);
    
    // Try to convert from overs field if it exists as a fallback
    if ('overs' in record) {
      console.log(`Found 'overs' field: ${(record as any).overs}, attempting conversion`);
      // Convert overs string to balls
      const oversString = (record as any).overs;
      if (typeof oversString === 'string') {
        record.balls = convertOversToBalls(oversString);
        console.log(`Converted overs "${oversString}" to ${record.balls} balls`);
      }
    } else {
      console.error(`No 'overs' field found, setting balls to 0`);
      record.balls = 0;
    }
  }
  
  // Ensure balls is a number
  const totalBalls = Number(record.balls) || 0;
  if (totalBalls === 0) {
    console.log(`${record.player.name} bowled 0 balls, returning 0 points`);
    return 0; // No balls bowled, no points
  }
  const totalOvers = totalBalls / 6;
  
  // Basic bowling points calculation
  const wicketPoints = record.wickets * 25;
  const maidenPoints = record.maidens * 10;
  const economyPoints = (totalOvers > 0) ? (totalOvers * 12) - (record.runs || 0) : 0;
  const dotBallPoints = record.dots * 1;
  
  let bonusPoints = 0;
  // Bonus for wicket milestones
  if (record.wickets >= 3 && record.wickets < 5) {
    bonusPoints += 25;
  } else if (record.wickets >= 5 && record.wickets < 7) {
    bonusPoints += 25; // 3 fer
    bonusPoints += 50;
  } else if (record.wickets >= 7) {
    bonusPoints += 25; // 3 fer
    bonusPoints += 50; // 5 fer
    bonusPoints += 100;
  }
  
  const totalPoints = wicketPoints + maidenPoints + economyPoints + dotBallPoints + bonusPoints;
  console.log(`
    Bowling points calculation for ${record.player.name}:
    - Total balls: ${totalBalls} (${totalOvers} overs)
    - Wickets: ${record.wickets || 0} → ${wicketPoints} points
    - Maidens: ${record.maidens || 0} → ${maidenPoints} points
    - Economy: (${totalOvers} * 12) - ${record.runs || 0} = ${economyPoints} points
    - Dot balls: ${record.dots || 0} → ${dotBallPoints} points
    - Wicket bonus: ${bonusPoints} points
    TOTAL: ${totalPoints} points
  `);

  return totalPoints;
}

// Find a player in the points data, or create a new entry
function findOrCreatePlayer(
  playerName: string,
  playersMap: Map<string, PlayerPointsData>,
  franchiseMap: Record<string, string>
): PlayerPointsData {
  const standardizedName = standardizePlayerName(playerName);
  
  // First try to find the player with standardized name
  for (const [existingName, playerData] of playersMap.entries()) {
    if (standardizePlayerName(existingName) === standardizedName) {
      // Found a match with standardized name
      console.log(`Matched "${playerName}" to existing player "${existingName}"`);
      return playerData;
    }
  }
  
  // If player doesn't exist, create new entry with standardized name
  let franchise = "Unknown";
  
  // Try exact match first in franchise map
  if (franchiseMap[standardizedName]) {
    franchise = franchiseMap[standardizedName];
  } else {
    // Try fuzzy matching if exact match fails
    for (const [name, team] of Object.entries(franchiseMap)) {
      if (standardizePlayerName(name) === standardizedName) {
        franchise = team;
        console.log(`Fuzzy matched "${playerName}" to "${name}" with franchise "${team}"`);
        break;
      }
    }
  }
  
  // Create new player data with standardized name
  const newPlayer: PlayerPointsData = {
    player_name: standardizedName, // Use standardized name for new entries
    franchise,
    matches: [],
    total_points: 0
  };
  
  playersMap.set(standardizedName, newPlayer);
  return newPlayer;
}

function extractFielderName(status: string): string {
  // Handle substitute cases
  if (status.includes('(Sub)')) {
    // Extract name that follows (Sub)
    const match = status.match(/\(Sub\)\s+([^b]+)/);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // Regular cases (no substitute)
  if (status.startsWith('c ')) {
    return status.substring(2).trim();
  }
  
  return status;
}

// Process fielding points from batting status
function processFieldingPoints(
  status: string,
  match_id: string,
  playersMap: Map<string, PlayerPointsData>,
  franchiseMap: Record<string, string>
): void {
  // Check for catches: "c PlayerName b BowlerName"
  if (status.startsWith('c ') && status.includes(' b ')) {
    const parts = status.split(' b ');
    let fielderName = extractFielderName(parts[0]);
    fielderName = normalizePlayerName(fielderName);
    
    // Add 15 points for catch
    updateFieldingPoints(fielderName, 15, match_id, playersMap, franchiseMap);
  }
  
  // Check for run outs: "run out (PlayerName)"
  if (status.includes('run out (')) {
    const match = status.match(/run out \(([^)]+)\)/);
    if (match && match[1]) {
      const fielders = match[1];
      
      // Check for shared run outs: "run out (PlayerA/PlayerB)"
      if (fielders.includes('/')) {
        const [firstFielder, secondFielder] = fielders.split('/');
        const firstFielderName = extractFielderName(firstFielder);
        const secondFielderName = extractFielderName(secondFielder);

        updateFieldingPoints(normalizePlayerName(firstFielderName), 6, match_id, playersMap, franchiseMap);
        updateFieldingPoints(normalizePlayerName(secondFielderName), 4, match_id, playersMap, franchiseMap);

      } else {
        const fielderName = extractFielderName(fielders);
        updateFieldingPoints(normalizePlayerName(fielders.trim()), 10, match_id, playersMap, franchiseMap);
      }
    }
  }
  
  // Check for stumpings: "st PlayerName b BowlerName"
  if (status.toLowerCase().startsWith('st ') && status.includes(' b ')) {
    const parts = status.split(' b ');
    let wicketKeeperName = parts[0].substring(3).trim();
    wicketKeeperName = normalizePlayerName(wicketKeeperName);
    
    // Add 10 points for stumping
    updateFieldingPoints(wicketKeeperName, 10, match_id, playersMap, franchiseMap);
  }
}

function standardizePlayerName(name: string): string {
  if (!name) return '';
  
  // Create a mapping for known name variations
  const nameVariations: { [key: string]: string } = {
    'ms dhoni': 'MS Dhoni',
  };
  
  // First standardize the name to lowercase with no special characters
  let standardized = name
    .toLowerCase()
    // Convert "M.S." or "M S" or "Ms" to "ms"
    .replace(/([a-z])\.?\s*([a-z])\.?/g, '$1$2')
    // Remove any remaining dots
    .replace(/\./g, '')
    // Remove extra spaces
    .trim()
    .replace(/\s+/g, ' ');
  
  // Check if this is a known variation
  if (nameVariations[standardized]) {
    return nameVariations[standardized];
  }
  
  return name; // Return original name if no mapping found
}

// Update fielding points for a player
function updateFieldingPoints(
  fielderName: string,
  points: number,
  match_id: string,
  playersMap: Map<string, PlayerPointsData>,
  franchiseMap: Record<string, string>
): void {
  // Try to find the exact player first
  let foundPlayer = false;
  let playerToUpdate: PlayerPointsData | null = null;

  const standardizedFielderName = standardizePlayerName(fielderName);
  
  for (const [name, playerData] of playersMap.entries()) {
    // Check for exact match or partial match
    const standardizedName = standardizePlayerName(name);
    if (standardizedName === standardizedFielderName || 
        standardizedName.includes(standardizedFielderName) || 
        standardizedFielderName.includes(standardizedName)) {
      playerToUpdate = playerData;
      foundPlayer = true;
      break;
    }
  }
  
  // If player not found, create new entry
  if (!foundPlayer) {
    playerToUpdate = findOrCreatePlayer(fielderName, playersMap, franchiseMap);
  }
  
  // Update fielding points
  if (playerToUpdate) {
    // Look for existing match record
    let matchRecord = playerToUpdate.matches.find(m => m.match_id === match_id);
    
    if (matchRecord) {
      // Update existing match record
      matchRecord.fielding_points += points;
      matchRecord.total += points;
    } else {
      // Create new match record
      matchRecord = {
        match_id,
        batting_points: 0,
        bowling_points: 0,
        fielding_points: points,
        mom: 0,
        total: points
      };
      playerToUpdate.matches.push(matchRecord);
    }
    
    // Update total points
    playerToUpdate.total_points += points;
  }
}

// Main function to calculate player points for all matches
async function calculateAllPoints(): Promise<void> {
  try {
    // Create directories for output
    const outputDir = path.join(process.cwd(), '..','data','player_points');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Load player franchise data
    let franchiseMap: Record<string, string> = {};
    const PLAYER_FRANCHISE_FILE = path.join(process.cwd(), 'player_franchise.json');
    try {
      const franchiseData = await fs.readFile(PLAYER_FRANCHISE_FILE, 'utf-8');
      franchiseMap = JSON.parse(franchiseData);
      console.log(`Loaded franchise data for ${Object.keys(franchiseMap).length} players from ${PLAYER_FRANCHISE_FILE}`);
    } catch (error) {
      console.warn('Could not load player franchise data:', error);
      console.warn(`Expected file at: ${PLAYER_FRANCHISE_FILE}`);
      console.warn('Using empty franchise map - all franchises will be "Unknown"');
    }
    
    // Create a map to store player data
    const playersMap = new Map<string, PlayerPointsData>();
    
    // Find all match data files
    const matchesDir = path.join(process.cwd(), '..', 'data','iplt20_match_stats');
    try {
      await fs.access(matchesDir);
    } catch (error) {
      throw new Error('Matches directory not found. Create a "matches" directory and add match JSON files.');
    }
    
    const files = await fs.readdir(matchesDir);
    const matchFiles = files.filter(file => file.includes('iplt20_match_') && file.endsWith('.json'));
    
    console.log(`Found ${matchFiles.length} match files to process`);
    
    // Process each match file
    for (const file of matchFiles) {
      const filePath = path.join(matchesDir, file);
      const match_id = file.replace(/iplt20_match_(\d+)\.json/i, '$1');
      
      console.log(`Processing match: ${match_id}`);
      
      // Read and parse match data
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const matchData = JSON.parse(fileContent) as MatchData;
      
      // Process all innings
      for (const innings of matchData.innings) {
        // Process batting records
        for (const record of innings.battingRecords) {
          const playerName = normalizePlayerName(record.player.name);
          const battingPoints = calculateBattingPoints(record);
          
          // Get player data
          const playerData = findOrCreatePlayer(playerName, playersMap, franchiseMap);
          
          // Look for existing match record
          let matchRecord = playerData.matches.find(m => m.match_id === match_id);
          
          if (matchRecord) {
            // Update existing match record
            matchRecord.batting_points += battingPoints;
            matchRecord.total += battingPoints;
          } else {
            // Create new match record
            matchRecord = {
              match_id,
              batting_points: battingPoints,
              bowling_points: 0,
              fielding_points: 0,
              mom: 0,
              total: battingPoints
            };
            playerData.matches.push(matchRecord);
          }
          
          // Update total points
          playerData.total_points += battingPoints;
          
          // Process fielding points from this player's dismissal
          processFieldingPoints(record.status, match_id, playersMap, franchiseMap);
        }
        
        // Process bowling records
        for (const record of innings.bowlingRecords) {
          const playerName = normalizePlayerName(record.player.name);
          const bowlingPoints = calculateBowlingPoints(record);
          
          // Get player data
          const playerData = findOrCreatePlayer(playerName, playersMap, franchiseMap);
          
          // Look for existing match record
          let matchRecord = playerData.matches.find(m => m.match_id === match_id);
          
          if (matchRecord) {
            // Update existing match record
            matchRecord.bowling_points += bowlingPoints;
            matchRecord.total += bowlingPoints;
          } else {
            // Create new match record
            matchRecord = {
              match_id,
              batting_points: 0,
              bowling_points: bowlingPoints,
              fielding_points: 0,
              mom: 0,
              total: bowlingPoints
            };
            playerData.matches.push(matchRecord);
          }
          
          // Update total points
          playerData.total_points += bowlingPoints;
        }
      }
      
      // Process Man of the Match
      if (matchData.manOfTheMatch) {
        let momName = normalizePlayerName(matchData.manOfTheMatch);
        let momFound = false;
        
        // Try to find MOM in players map
        for (const [playerName, playerData] of playersMap.entries()) {
          // Check for exact or partial match
          if (playerName.toLowerCase() === momName.toLowerCase() || 
              playerName.toLowerCase().includes(momName.toLowerCase()) || 
              momName.toLowerCase().includes(playerName.toLowerCase())) {
            
            // Look for this match in player's records
            let matchRecord = playerData.matches.find(m => m.match_id === match_id);
            
            if (matchRecord) {
              matchRecord.mom = 25;
              matchRecord.total += 25;
            } else {
              matchRecord = {
                match_id,
                batting_points: 0,
                bowling_points: 0,
                fielding_points: 0,
                mom: 25,
                total: 25
              };
              playerData.matches.push(matchRecord);
            }
            
            // Update total points
            playerData.total_points += 25;
            momFound = true;
            console.log(`Applied MOM bonus to ${playerName} for match ${match_id}`);
            break;
          }
        }
        
        // If MOM not found, create new entry
        if (!momFound) {
          console.log(`Creating new player entry for MOM: ${momName}`);
          const playerData = findOrCreatePlayer(momName, playersMap, franchiseMap);
          
          // Create match record with MOM bonus
          const matchRecord = {
            match_id,
            batting_points: 0,
            bowling_points: 0,
            fielding_points: 0,
            mom: 25,
            total: 25
          };
          
          playerData.matches.push(matchRecord);
          playerData.total_points += 25;
        }
      }
    }
    
    // Convert map to array for output
    const playersArray = Array.from(playersMap.values());
    
    // Sort by total points (highest first)
    playersArray.sort((a, b) => b.total_points - a.total_points);
    
    // Write player points data to file
    const outputPath = path.join(outputDir, 'all_player_points.json');
    await fs.writeFile(
      outputPath,
      JSON.stringify(playersArray, null, 2),
      'utf-8'
    );
    
    console.log(`Player points calculated and saved to ${outputPath}`);
    
    // Create a leaderboard summary
    const leaderboard = playersArray.map(player => ({
      player_name: player.player_name,
      franchise: player.franchise,
      matches_played: player.matches.length,
      total_points: player.total_points
    }));
    
    const leaderboardPath = path.join(outputDir, 'leaderboard.json');
    await fs.writeFile(
      leaderboardPath,
      JSON.stringify(leaderboard, null, 2),
      'utf-8'
    );
    
    console.log(`Leaderboard saved to ${leaderboardPath}`);

    await trackUnassignedPlayers(leaderboard);
  } catch (error) {
    console.error('Error calculating player points:', error);
    throw error;
  }
}

// Function to calculate points for a single match
async function calculatePoints(matchId: string): Promise<void> {
  try {
    // Create directories for output
    const outputDir = path.join(process.cwd(), 'player_points');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Load player franchise data
    let franchiseMap: Record<string, string> = {};
    try {
      const franchiseData = await fs.readFile(
        path.join(process.cwd(), 'src', 'player_franchise.json'),
        'utf-8'
      );
      franchiseMap = JSON.parse(franchiseData);
      console.log(`Loaded franchise data for ${Object.keys(franchiseMap).length} players`);
    } catch (error) {
      console.warn('Could not load player franchise data:', error);
      console.warn('Using empty franchise map - all franchises will be "Unknown"');
    }
    
    // Find the match file
    const matchesDir = path.join(process.cwd(), 'iplt20_match_stats');
    const matchFile = `iplt20_match_${matchId}.json`;
    const filePath = path.join(matchesDir, matchFile);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      throw new Error(`Match file for ${matchId} not found at ${filePath}`);
    }
    
    // Create a map to store player data for this match
    const playersMap = new Map<string, PlayerPointsData>();
    
    // Read and parse match data
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const matchData = JSON.parse(fileContent) as MatchData;
    
    console.log(`Processing match: ${matchId} - ${matchData.matchTitle}`);
    
    // Process all innings
    for (const innings of matchData.innings) {
      console.log(`Processing innings: ${innings.teamName}`);
      
      // Process batting records
      for (const record of innings.battingRecords) {
        const playerName = normalizePlayerName(record.player.name);
        const battingPoints = calculateBattingPoints(record);
        
        console.log(`Batting: ${playerName} - ${battingPoints} points`);
        
        // Get player data
        const playerData = findOrCreatePlayer(playerName, playersMap, franchiseMap);
        
        // Look for existing match record
        let matchRecord = playerData.matches.find(m => m.match_id === matchId);
        
        if (matchRecord) {
          // Update existing match record
          matchRecord.batting_points += battingPoints;
          matchRecord.total += battingPoints;
        } else {
          // Create new match record
          matchRecord = {
            match_id: matchId,
            batting_points: battingPoints,
            bowling_points: 0,
            fielding_points: 0,
            mom: 0,
            total: battingPoints
          };
          playerData.matches.push(matchRecord);
        }
        
        // Update total points
        playerData.total_points += battingPoints;
        
        // Process fielding points from this player's dismissal
        processFieldingPoints(record.status, matchId, playersMap, franchiseMap);
      }
      
      // Process bowling records
      for (const record of innings.bowlingRecords) {
        const playerName = normalizePlayerName(record.player.name);
        const bowlingPoints = calculateBowlingPoints(record);
        
        console.log(`Bowling: ${playerName} - ${bowlingPoints} points`);
        
        // Get player data
        const playerData = findOrCreatePlayer(playerName, playersMap, franchiseMap);
        
        // Look for existing match record
        let matchRecord = playerData.matches.find(m => m.match_id === matchId);
        
        if (matchRecord) {
          // Update existing match record
          matchRecord.bowling_points += bowlingPoints;
          matchRecord.total += bowlingPoints;
        } else {
          // Create new match record
          matchRecord = {
            match_id: matchId,
            batting_points: 0,
            bowling_points: bowlingPoints,
            fielding_points: 0,
            mom: 0,
            total: bowlingPoints
          };
          playerData.matches.push(matchRecord);
        }
        
        // Update total points
        playerData.total_points += bowlingPoints;
      }
    }
    
    // Process Man of the Match
    if (matchData.manOfTheMatch) {
      let momName = normalizePlayerName(matchData.manOfTheMatch);
      let momFound = false;
      
      console.log(`Man of the Match: ${momName}`);
      
      // Try to find MOM in players map
      for (const [playerName, playerData] of playersMap.entries()) {
        // Check for exact or partial match
        if (playerName.toLowerCase() === momName.toLowerCase() || 
            playerName.toLowerCase().includes(momName.toLowerCase()) || 
            momName.toLowerCase().includes(playerName.toLowerCase())) {
          
          // Look for this match in player's records
          let matchRecord = playerData.matches.find(m => m.match_id === matchId);
          
          if (matchRecord) {
            matchRecord.mom = 25;
            matchRecord.total += 25;
          } else {
            matchRecord = {
              match_id: matchId,
              batting_points: 0,
              bowling_points: 0,
              fielding_points: 0,
              mom: 25,
              total: 25
            };
            playerData.matches.push(matchRecord);
          }
          
          // Update total points
          playerData.total_points += 25;
          momFound = true;
          console.log(`Applied MOM bonus to ${playerName}`);
          break;
        }
      }
      
      // If MOM not found, create new entry
      if (!momFound) {
        console.log(`Creating new player entry for MOM: ${momName}`);
        const playerData = findOrCreatePlayer(momName, playersMap, franchiseMap);
        
        // Create match record with MOM bonus
        const matchRecord = {
          match_id: matchId,
          batting_points: 0,
          bowling_points: 0,
          fielding_points: 0,
          mom: 25,
          total: 25
        };
        
        playerData.matches.push(matchRecord);
        playerData.total_points += 25;
      }
    }
    
    // Convert map to array for output
    const playersArray = Array.from(playersMap.values());
    
    // Sort by total points (highest first)
    playersArray.sort((a, b) => b.total_points - a.total_points);
    
    // Write player points data to file
    const outputPath = path.join(outputDir, `${matchId}_player_points.json`);
    await fs.writeFile(
      outputPath,
      JSON.stringify(playersArray, null, 2),
      'utf-8'
    );
    
    console.log(`Player points for match ${matchId} calculated and saved to ${outputPath}`);

    try {
      const matchDir = path.join(process.cwd(), 'matches', matchId);
      await fs.mkdir(matchDir, { recursive: true });
      
      const matchCopyPath = path.join(matchDir, 'player_points.json');
      await fs.writeFile(
        matchCopyPath,
        JSON.stringify(playersArray, null, 2),
        'utf-8'
      );
      
      console.log(`Copy saved in match directory: ${matchCopyPath}`);
    } catch (error) {
      console.warn(`Could not save copy to match directory: ${error}`);
    }
    

  } catch (error) {
    console.error(`Error calculating player points for match ${matchId}:`, error);
    throw error;
  }
}

// Function to update all player points (reads all matches and regenerates the complete player points)
async function updateAllPlayerPoints(): Promise<void> {
  await calculateAllPoints();
}

// Add self-execution when run directly
if (require.main === module) {
  // Get command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || 'all'; // Default to 'all' if no command given
  const matchId = args[1]; // Optional match ID
  
  console.log('Points Calculator Starting...');
  
  // Determine which function to run
  async function runCommand() {
    if (command === 'match' && matchId) {
      console.log(`Calculating points for match: ${matchId}`);
      await calculatePoints(matchId);
    } else if (command === 'update') {
      console.log('Updating all player points...');
      await updateAllPlayerPoints();
    } else {
      console.log('Calculating points for all matches...');
      await calculateAllPoints();
    }
  }
  
  // Run the command and handle errors
  runCommand()
    .then(() => {
      console.log('Points calculation completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error running points calculation:', error);
      process.exit(1);
    });
}

// Export functions for use in other files
export { 
  calculatePoints,
  calculateAllPoints,
  updateAllPlayerPoints
};