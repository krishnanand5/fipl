import * as puppeteer from 'puppeteer';
import { CricketScorecard } from '../types';
import { updateLastProcessedMatch } from './iplt20_tracking.service';
import { extractMatchInfo, extractManOfTheMatch, extractInningsData } from './iplt20_extractors.service';
import { getLastProcessedMatch, getNextMatchToProcess } from './iplt20_tracking.service';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Fetches and extracts the scorecard from IPL T20 website using Puppeteer
 * for better handling of dynamic content
 * @param matchId - The match ID or full URL
 * @returns Promise with cricket scorecard data
 */
export async function fetchIPLT20Scorecard(matchId: string | number): Promise<CricketScorecard> {
  // Handle if full URL is provided
  let id = typeof matchId === 'string' && matchId.includes('/') 
    ? matchId.split('/').pop() 
    : matchId;
  
  const url = `https://www.iplt20.com/match/2025/${id}`;
  console.log(`Fetching IPL T20 scorecard from: ${url}`);

  // Create screenshots directory for this match
  const screenshotsDir = path.resolve(process.cwd(), 'screenshots', `${id}`);
  try {
    if (!fs.existsSync(path.resolve(process.cwd(), 'screenshots'))) {
      fs.mkdirSync(path.resolve(process.cwd(), 'screenshots'));
    }
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }
  } catch (error) {
    console.error(`Error creating screenshots directory: ${error}`);
  }
  
  // Function to take a screenshot with the path relative to the match directory
  const takeScreenshot = async (page: puppeteer.Page, filename: string) => {
    try {
      const filePath = path.join(screenshotsDir, filename);
      await page.screenshot({ path: filePath });
      console.log(`Saved screenshot to ${filePath}`);
    } catch (error) {
      console.error(`Error taking screenshot ${filename}: ${error}`);
    }
  };
  
  let browser;
  try {
    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set user agent and viewport
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the match page with longer timeout
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log('Page loaded, looking for scorecard tab');
    
    // Take a screenshot for debugging
    await takeScreenshot(page, 'match_page.png');
    
    // Wait a bit for Angular to initialize
    await new Promise(resolve => setTimeout(resolve, 3000));  
    
    // Try to find and click the exact scorecard link we identified
    console.log('Looking for the exact scorecard link...');
    
    await clickScorecardTab(page);
    
    // Take a screenshot after clicking
    await takeScreenshot(page, 'after_scorecard_click.png');
    
    // Wait for the scorecard content to load
    await new Promise(resolve => setTimeout(resolve, 3000));  
    
    // Extract match info (teams, title, date)
    const matchInfo = await extractMatchInfo(page);
    console.log(`Match: ${matchInfo.matchTitle} on ${matchInfo.matchDate}`);
    
    // Extract innings data
    const innings = await extractInningsData(page, takeScreenshot);
    
    // Extract Man of the Match
    const manOfTheMatch = await extractManOfTheMatch(page);
    
    // Update the last processed match ID
    await updateLastProcessedMatch(Number(id), matchInfo.matchDate || '');
    
    return { 
      matchTitle: matchInfo.matchTitle || `${matchInfo.team1} vs ${matchInfo.team2}`,
      manOfTheMatch,
      innings 
    };
    
  } catch (error) {
    console.error('Error fetching IPL T20 scorecard:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('Puppeteer browser closed');
    }
  }
}

/**
 * Clicks the scorecard tab on the match page
 * @param page - Puppeteer page object
 */
async function clickScorecardTab(page: puppeteer.Page): Promise<void> {
  // Try to click the exact element we found
  const exactLinkClicked = await page.evaluate(() => {
    const exactLink = document.querySelector('a[data-id="scoreCard"][ng-click="scorecardTabsChange(\'scoreCard\')"]');
    if (exactLink) {
      console.log('Found exact scorecard link, clicking it...');
      (exactLink as HTMLElement).click();
      return true;
    }
    return false;
  });
  
  if (!exactLinkClicked) {
    console.log('Exact scorecard link not found, trying alternatives...');
    
    // Try simpler selector
    const simpleSelectorClicked = await page.evaluate(() => {
      const simpleLink = document.querySelector('a[data-id="scoreCard"]');
      if (simpleLink) {
        console.log('Found scorecard link by data-id, clicking it...');
        (simpleLink as HTMLElement).click();
        return true;
      }
      return false;
    });
    
    if (!simpleSelectorClicked) {
      console.log('Still no scorecard link found, trying by text content...');
      
      // Try by text content as last resort
      const textContentClicked = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        for (const link of links) {
          if (link.textContent?.trim() === 'Scorecard') {
            console.log('Found scorecard link by text, clicking it...');
            (link as HTMLElement).click();
            return true;
          }
        }
        return false;
      });
      
      if (!textContentClicked) {
        console.log('WARNING: Could not find or click any scorecard link');
      }
    }
  }
}

/**
 * Processes matches automatically starting from the last processed match
 * @param maxMatches - Maximum number of matches to process
 */
export async function processLatestMatches(maxMatches: number = 5): Promise<void> {
  try {
    let nextMatchId = await getNextMatchToProcess();
    let matchesProcessed = 0;
    let consecutiveErrors = 0;
    
    console.log(`Starting automatic processing from match ID: ${nextMatchId}`);
    
    while (matchesProcessed < maxMatches && consecutiveErrors < 3) {
      try {
        console.log(`Attempting to process match ID: ${nextMatchId}`);
        const scorecard = await fetchIPLT20Scorecard(nextMatchId);
        
        console.log(`Successfully processed match ${nextMatchId}: ${scorecard.matchTitle}`);
        
        // Process the match data according to your needs
        // Here you would call your existing calculate_points functions etc.
        
        matchesProcessed++;
        consecutiveErrors = 0; // Reset consecutive errors on success
        nextMatchId++;
        
      } catch (error) {
        console.error(`Error processing match ${nextMatchId}:`, error);
        consecutiveErrors++;
        
        if (consecutiveErrors >= 3) {
          console.log(`Stopping after ${consecutiveErrors} consecutive errors`);
          break;
        }
        
        nextMatchId++; // Try the next match
      }
    }
    
    console.log(`Completed processing. Matches processed: ${matchesProcessed}`);
    
  } catch (error) {
    console.error('Error in automatic match processing:', error);
  }
}