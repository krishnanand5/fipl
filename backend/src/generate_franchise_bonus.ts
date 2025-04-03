import * as fs from 'fs';
import * as path from 'path';
import {PlayerFranchiseMap, FranchiseStats} from '../types';

function initializeFranchiseStats(): FranchiseStats[string] {
  return {
    runs_25: 0,
    runs_50: 0,
    runs_75: 0,
    runs_100: 0,
    wickets_3: 0,
    wickets_5: 0,
    wickets_7: 0,
    maidens: 0,
  };
}

function processMatch(matchData: any, franchiseStats: FranchiseStats, playerFranchiseMap: PlayerFranchiseMap) {
  matchData.innings.forEach((innings: any) => {
    // Process batting records
    innings.battingRecords.forEach((record: any) => {
      const playerName = record.player.name;
      const franchise = playerFranchiseMap[playerName] || 'Unknown';
      
      if (!franchiseStats[franchise]) {
        franchiseStats[franchise] = initializeFranchiseStats();
      }

      const runs = record.runs;
      if (runs >= 100) {
        franchiseStats[franchise].runs_100++;
      } else if (runs >= 75 && runs < 100) {
        franchiseStats[franchise].runs_75++;
      } else if (runs >= 50 && runs < 75) {
        franchiseStats[franchise].runs_50++;
      } else if (runs >= 25 && runs < 50) {
        franchiseStats[franchise].runs_25++;
      }
    });

    // Process bowling records
    innings.bowlingRecords.forEach((record: any) => {
      const playerName = record.player.name;
      const franchise = playerFranchiseMap[playerName] || 'Unknown';
      
      if (!franchiseStats[franchise]) {
        franchiseStats[franchise] = initializeFranchiseStats();
      }

      const wickets = record.wickets;
      if (wickets >= 7) {
        franchiseStats[franchise].wickets_7++;
      } else if (wickets >= 5) {
        franchiseStats[franchise].wickets_5++;
      } else if (wickets >= 3) {
        franchiseStats[franchise].wickets_3++;
      }

      if (record.maidens > 0) {
        franchiseStats[franchise].maidens += record.maidens;
      }
    });
  });
}

async function generateFranchiseBonus() {
  try {
    // Read player franchise mapping
    const playerFranchiseMap: PlayerFranchiseMap = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../player_franchise.json'), 'utf-8')
    );

    const franchiseStats: FranchiseStats = {};
    const matchesDir = path.join(__dirname, '../../data/iplt20_match_stats');
    const matchFiles = fs.readdirSync(matchesDir)
      .filter(file => file.startsWith('iplt20_match_'))
      .sort((a, b) => {
        const matchIdA = parseInt(a.split('_')[2].split('.')[0]);
        const matchIdB = parseInt(b.split('_')[2].split('.')[0]);
        return matchIdA - matchIdB;
      });

    // Process each match file
    for (const file of matchFiles) {
      console.log(`Processing match file: ${file}`);
      const matchData = JSON.parse(
        fs.readFileSync(path.join(matchesDir, file), 'utf-8')
      );
      processMatch(matchData, franchiseStats, playerFranchiseMap);
    }

    // Write the output
    const outputPath = path.join(__dirname, '../../data/player_points/franchise_wise_bonus.json');
    fs.writeFileSync(outputPath, JSON.stringify(franchiseStats, null, 2));
    console.log('Generated franchise bonus statistics at:', outputPath);
  } catch (error) {
    console.error('Error generating franchise bonus stats:', error);
  }
}

generateFranchiseBonus().catch(console.error);