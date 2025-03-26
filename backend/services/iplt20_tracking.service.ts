import * as fs from 'fs/promises';
import * as path from 'path';

// Interface for tracking the last processed match
export interface MatchTracker {
  lastMatchId: number;
  lastProcessedDate: string;
}

/**
 * Update the last processed match ID
 */
export async function updateLastProcessedMatch(matchId: number, matchDate: string): Promise<void> {
  try {
    const trackerPath = path.resolve(process.cwd(), 'src', 'match_tracker.json');
    
    // Create tracker object
    const tracker: MatchTracker = {
      lastMatchId: matchId,
      lastProcessedDate: matchDate || new Date().toISOString().split('T')[0]
    };
    
    // Write to file
    await fs.writeFile(trackerPath, JSON.stringify(tracker, null, 2), 'utf-8');
    
    console.log(`Updated match tracker: lastMatchId=${matchId}, date=${matchDate}`);
  } catch (error) {
    console.error('Error updating last processed match:', error);
  }
}

/**
 * Get the last processed match ID
 */
export async function getLastProcessedMatch(): Promise<MatchTracker> {
  try {
    const trackerPath = path.resolve(process.cwd(), 'src', 'match_tracker.json');
    
    // Check if file exists
    try {
      await fs.access(trackerPath);
    } catch (e) {
      // File doesn't exist, return default
      return {
        lastMatchId: 1798, // Start with ID before the first match (1799)
        lastProcessedDate: new Date().toISOString().split('T')[0]
      };
    }
    
    // Read and parse file
    const content = await fs.readFile(trackerPath, 'utf-8');
    return JSON.parse(content);
    
  } catch (error) {
    console.error('Error getting last processed match:', error);
    // Return default in case of error
    return {
      lastMatchId: 1798,
      lastProcessedDate: new Date().toISOString().split('T')[0]
    };
  }
}

/**
 * Get the next match ID to process
 */
export async function getNextMatchToProcess(): Promise<number> {
  const tracker = await getLastProcessedMatch();
  return tracker.lastMatchId + 1;
}