import { fetchIPLT20Scorecard, processLatestMatches } from '../services/iplt20_scraper.service';
import fs from 'fs/promises';
import path from 'path';

async function testScraper(matchId: number) {
  try {
    // Test a specific match
    console.log(`Testing scraper with match ID: ${matchId}`);
    
    const scorecard = await fetchIPLT20Scorecard(matchId);
    
    console.log('Scorecard extracted successfully:');
    console.log(`Match: ${scorecard.matchTitle}`);
    console.log(`Man of the Match: ${scorecard.manOfTheMatch || 'Not found'}`);
    console.log(`Innings: ${scorecard.innings.length}`);
    
    for (const inning of scorecard.innings) {
      console.log(`\n${inning.teamName} Innings:`);
      console.log(`Batting records: ${inning.battingRecords.length}`);
      console.log(`Bowling records: ${inning.bowlingRecords.length}`);
      console.log(`Total: ${inning.total}`);
      console.log(`Extras: ${inning.extras}`);
    }
    
    // Save the data for inspection
    const outputDir = path.resolve(process.cwd(), '..', 'data', 'iplt20_match_stats');
    await fs.mkdir(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, `iplt20_match_${matchId}.json`);
    await fs.writeFile(outputPath, JSON.stringify(scorecard, null, 2), 'utf-8');
    
    console.log(`Saved scorecard to: ${outputPath}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

async function testProcessLatestMatches(limit: number = 3) {
  try {
    console.log('Testing automatic match processing...');
    await processLatestMatches(3); // Process up to 3 latest matches
    console.log('Automatic processing completed');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'single'; // default to single match mode
const matchId = parseInt(args[1], 10); // default to 1801 if no match ID provided
const limit = parseInt(args[2], 10); // default to 3 matches for batch processing

if (command === 'batch') {
  testProcessLatestMatches(limit)
    .then(() => console.log('Automatic processing test completed'))
    .catch(console.error);
} else {
  testScraper(matchId)
    .then(() => console.log('Single match test completed'))
    .catch(console.error);
}
// Uncomment to test automatic processing of latest matches
// testProcessLatestMatches()
//   .then(() => console.log('Automatic processing test completed'))
//   .catch(console.error);