import fs from 'fs/promises';
import path from 'path';

export async function trackUnassignedPlayers(leaderboard: Array<{
  player_name: string;
  franchise: string;
  matches_played: number;
  total_points: number;
}>) {
  try {
    // Filter unassigned players
    const unassignedPlayers = leaderboard
      .filter(player => player.franchise === 'Unknown')
      .map(player => `${player.player_name} (${player.matches_played} matches, ${player.total_points} points)`);

    if (unassignedPlayers.length === 0) {
      console.log('No unassigned players found');
      return;
    }

    // Create content with timestamp
    const separator = '-'.repeat(100);
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const content = `\n${separator}\n${timestamp}\n${unassignedPlayers.join('\n')}\n`;

    // Write to file
    const outputPath = path.resolve(__dirname, '../../data/unassigned_players.txt');
    await fs.appendFile(outputPath, content, 'utf-8');
    
    console.log(`Added ${unassignedPlayers.length} unassigned players to tracking file`);
  } catch (error) {
    console.error('Error tracking unassigned players:', error);
  }
}