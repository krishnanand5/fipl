import * as puppeteer from 'puppeteer';
import { TeamInnings, BattingRecord, BowlingRecord } from '../types';

/**
 * Extracts basic match information
 * @param page - Puppeteer page
 * @returns Match information (teams, title, date)
 */
export async function extractMatchInfo(page: puppeteer.Page): Promise<{
  team1: string;
  team2: string;
  matchDate: string;
  matchTitle: string;
}> {
  return await page.evaluate(() => {
    // Helper for logging
    const log = (msg: string) => console.log(`[Browser] ${msg}`);
    
    try {
      log('Extracting match information');
      
      let team1 = 'Team 1';
      let team2 = 'Team 2';
      let matchDate = '';
      let matchTitle = '';
      
      // Try to get the exact match title from the element you identified
      const matchTitleElement = document.querySelector('li[ng-if*="matchSummary.MatchName"] span:last-child');
      if (matchTitleElement && matchTitleElement.textContent) {
        matchTitle = matchTitleElement.textContent.trim();
        log(`Found match title: "${matchTitle}"`);
        
        // Also extract team names from match title if available
        if (matchTitle.includes('vs')) {
          const teamParts = matchTitle.split('vs').map(part => part.trim());
          team1 = teamParts[0];
          team2 = teamParts[1];
          log(`Extracted teams from title: Team 1="${team1}", Team 2="${team2}"`);
        }
      } else {
        log('Match title element not found, trying alternative methods');
        
        // Fallback: Try to get team names from other elements
        const teamElements = document.querySelectorAll('.match-squad-team-name, .team-name');
        if (teamElements.length >= 2) {
          team1 = teamElements[0].textContent?.trim() || 'Team 1';
          team2 = teamElements[1].textContent?.trim() || 'Team 2';
          matchTitle = `${team1} vs ${team2}`;
          log(`Constructed match title from team elements: "${matchTitle}"`);
        }
      }
      
      // Try to get match date
      const dateElement = document.querySelector('.smry-subhead, .match-date, [ng-if*="matchSummary.MatchDate"]');
      if (dateElement) {
        matchDate = dateElement.textContent?.trim() || '';
        log(`Found match date: "${matchDate}"`);
      }
      
      return {
        team1,
        team2,
        matchDate,
        matchTitle
      };
    } catch (e) {
      log(`Error extracting match info: ${e}`);
      return {
        team1: 'Team 1',
        team2: 'Team 2',
        matchDate: '',
        matchTitle: 'Unknown Match'
      };
    }
  });
}

/**
 * Extracts the Man of the Match information
 * @param page - Puppeteer page
 * @returns Man of the Match name or null
 */
export async function extractManOfTheMatch(page: puppeteer.Page): Promise<string | null> {
  return await page.evaluate(() => {
    // Helper for logging
    const log = (msg: string) => console.log(`[Browser] ${msg}`);
    
    try {
      log('Looking for Man of the Match');
      
      // First try the direct querySelector with the specific structure you shared
      const directMomElement = document.querySelector('li[ng-if*="matchSummary.MOM"] span:last-child');
      if (directMomElement) {
        const text = directMomElement.textContent?.trim() || '';
        log(`Found MOM via direct selector: "${text}"`);
        return text.split('(')[0].trim();
      }
      
      // Second approach: Look for list items with MOM text
      const listItems = document.querySelectorAll('li');
      for (const item of Array.from(listItems)) {
        const text = item.textContent?.trim() || '';
        if (text.includes('MOM ')) {
          log(`Found list item with MOM text: "${text}"`);
          // Extract player name after "MOM "
          const playerNameWithTeam = text.replace('MOM', '').trim();
          const playerName = playerNameWithTeam.split('(')[0].trim();
          log(`Extracted player name: "${playerName}"`);
          return playerName;
        }
      }
      
      // Third approach: Any element with MOM text
      const allElements = document.querySelectorAll('*');
      for (const el of Array.from(allElements)) {
        const text = el.textContent?.trim() || '';
        if (text.startsWith('MOM ') && text.length > 5) {
          log(`Found element with MOM text: "${text}"`);
          return text.replace('MOM', '').trim().split('(')[0].trim();
        }
      }
      
      log('No Man of the Match found');
      return null;
    } catch (e) {
      log(`Error finding Man of the Match: ${e}`);
      return null;
    }
  });
}


// Update the extractInningsData function to take advantage of the active tab

/**
 * Extracts data for all innings, taking advantage of the initially active tab
 * @param page - Puppeteer page
 * @returns Array of team innings data
 */
export async function extractInningsData(
    page: puppeteer.Page,
    takeScreenshot: (page: puppeteer.Page, filename: string) => Promise<void>
): Promise<TeamInnings[]> {
    // Take a screenshot of current state
    await takeScreenshot(page, 'initial_innings_state.png');
    console.log('Taking initial innings screenshot');
    
    // First, determine which tab is currently active and get information about both tabs
    const inningsInfo = await page.evaluate(() => {
      const log = (msg: string) => console.log(`[Browser] ${msg}`);
      
      try {
        // Find all tab links
        const tabLinks = document.querySelectorAll('a.ap-inner-tb-click');
        log(`Found ${tabLinks.length} innings tab links`);
        
        if (tabLinks.length < 2) {
          log('Not enough tab links found, using defaults');
          return {
            tabs: [
              { name: 'First Innings', innNo: '1', teamAbbr: '', isActive: false },
              { name: 'Second Innings', innNo: '2', teamAbbr: '', isActive: true }
            ],
            activeTabIndex: 1 // Assume second tab is active by default
          };
        }
        
        // Determine which tab is active
        const tabs = Array.from(tabLinks).map((link, index) => {
          const isActive = link.classList.contains('ap-active-team');
          const teamAbbr = link.textContent?.trim().split(' ')[0] || '';
          const fullName = link.textContent?.trim() || '';
          
          return {
            name: `${teamAbbr} Innings`,
            innNo: String(index + 1),
            teamAbbr,
            fullName,
            isActive
          };
        });
        
        // Find which tab is active
        const activeTabIndex = tabs.findIndex(tab => tab.isActive);
        log(`Active tab index: ${activeTabIndex}, Team: ${tabs[activeTabIndex]?.teamAbbr || 'Unknown'}`);
        
        return {
          tabs,
          activeTabIndex: activeTabIndex !== -1 ? activeTabIndex : 1 // Default to second tab if none found active
        };
      } catch (e) {
        log(`Error analyzing innings tabs: ${e}`);
        return {
          tabs: [
            { name: 'First Innings', innNo: '1', teamAbbr: '', isActive: false },
            { name: 'Second Innings', innNo: '2', teamAbbr: '', isActive: true }
          ],
          activeTabIndex: 1 // Assume second tab is active by default
        };
      }
    });
    
    console.log(`Found ${inningsInfo.tabs.length} innings tabs:`, inningsInfo.tabs);
    console.log(`Active tab index: ${inningsInfo.activeTabIndex}`);
    
    // Get match title for team names
    const matchTitle = await page.evaluate(() => {
      const titleElement = document.querySelector('li[ng-if*="matchSummary.MatchName"] span:last-child');
      return titleElement ? titleElement.textContent?.trim() || '' : '';
    });
    
    let teams: string[] = ['Team 1', 'Team 2'];
    if (matchTitle && matchTitle.includes('vs')) {
      teams = matchTitle.split('vs').map(t => t.trim());
    }
    console.log(`Teams from match title: ${teams[0]} vs ${teams[1]}`);
    
    // Initialize innings array to hold both innings data
    const innings: TeamInnings[] = [
        { teamName: '', battingRecords: [], bowlingRecords: [], extras: '', total: '', fallOfWickets: '' },
        { teamName: '', battingRecords: [], bowlingRecords: [], extras: '', total: '', fallOfWickets: '' }
    ];
    
    // First, extract data from the currently active tab (likely the second innings)
    console.log(`Processing active tab (${inningsInfo.activeTabIndex+1}): ${inningsInfo.tabs[inningsInfo.activeTabIndex]?.name}`);
    const activeTabData = await extractSingleInningsData(
      page, 
      inningsInfo.tabs[inningsInfo.activeTabIndex]?.name || `Innings ${inningsInfo.activeTabIndex+1}`
    );
    
    // Store the active tab data in the correct position
    if (inningsInfo.activeTabIndex === 0) {
      activeTabData.teamName = `${teams[0]} 1st`;
      innings[0] = activeTabData;
    } else {
      activeTabData.teamName = `${teams[1]} 2nd`;
      innings[1] = activeTabData;
    }
    
    // Now click on the other tab
    const otherTabIndex = inningsInfo.activeTabIndex === 0 ? 1 : 0;
    console.log(`Switching to other tab (${otherTabIndex+1}): ${inningsInfo.tabs[otherTabIndex]?.name}`);
    
    const switchSuccessful = await page.evaluate((targetIndex) => {
      try {
        const tabLinks = document.querySelectorAll('a.ap-inner-tb-click');
        if (tabLinks.length > targetIndex) {
          console.log(`Clicking tab: "${tabLinks[targetIndex].textContent?.trim()}"`);
          (tabLinks[targetIndex] as HTMLElement).click();
          return true;
        }
        return false;
      } catch (e) {
        console.error(`Error clicking innings tab: ${e}`);
        return false;
      }
    }, otherTabIndex);
    
    // Wait for content to load after switching
    await new Promise(resolve => setTimeout(resolve, 5000));
    await takeScreenshot(page, `after_switch_to_tab_${otherTabIndex+1}.png`);
    
    if (switchSuccessful) {
      console.log(`Successfully switched to tab ${otherTabIndex+1}`);
      
      // Extract data for the other tab
      const otherTabData = await extractSingleInningsData(
        page, 
        inningsInfo.tabs[otherTabIndex]?.name || `Innings ${otherTabIndex+1}`
      );
      
      // Store the other tab data in the correct position
      if (otherTabIndex === 0) {
        otherTabData.teamName = `${teams[0]} 1st`;
        innings[0] = otherTabData;
      } else {
        otherTabData.teamName = `${teams[1]} 2nd`;
        innings[1] = otherTabData;
      }
    } else {
      console.warn(`Failed to switch to tab ${otherTabIndex+1}, creating placeholder`);
      
      // Create a placeholder for the missing innings
      const placeholderInnings: TeamInnings = {
        teamName: otherTabIndex === 0 ? `${teams[0]} 1st` : `${teams[1]} 2nd`,
        battingRecords: [],
        bowlingRecords: [],
        extras: '',
        total: '',
        fallOfWickets: ''
      };
      
      innings[otherTabIndex] = placeholderInnings;
    }
    
    // Remove any null values (in case something went wrong)
    const filteredInnings = innings.filter(inn => inn !== null);
    
    // Final check - if both innings have identical batting records, it means 
    // we failed to properly switch innings
    if (filteredInnings.length === 2 && 
        JSON.stringify(filteredInnings[0].battingRecords) === JSON.stringify(filteredInnings[1].battingRecords) &&
        filteredInnings[0].battingRecords.length > 0) {
      console.warn('WARNING: Both innings have identical batting records, innings switching likely failed');
      
      // Keep the active tab data and clear the other one to prevent duplication
      if (inningsInfo.activeTabIndex === 0) {
        filteredInnings[1].battingRecords = [];
        filteredInnings[1].bowlingRecords = [];
      } else {
        filteredInnings[0].battingRecords = [];
        filteredInnings[0].bowlingRecords = [];
      }
    }
    
    return filteredInnings;
  }

/**
 * Extracts data for a single innings
 * @param page - Puppeteer page
 * @param inningName - Name of the innings
 * @returns Innings data
 */
async function extractSingleInningsData(page: puppeteer.Page, inningName: string): Promise<TeamInnings> {
  return await page.evaluate((inningName) => {
    // Helper to get text and clean it
    const getText = (element: Element | null) => 
      element ? element.textContent?.trim().replace(/\s+/g, ' ') || '' : '';
    
    // Helper for logging inside evaluate
    const log = (msg: string) => console.log(`[Browser] ${msg}`);
    
    try {
      // Extract team name from the innings name
      let teamName = inningName.replace(/\s*Innings.*$/i, '')
                            .replace(/\s*\d+(st|nd|rd|th)\s*Innings.*$/i, '')
                            .trim();
      
      log(`Extracted team name from innings name: "${teamName}"`);
      
      // If we couldn't extract from innings name, try to find it another way
      if (!teamName) {
        log('Team name not found in innings name, looking for alternatives');
        
        const teamHeader = document.querySelector('.innings-header, .team-name, .mc-batting-head');
        if (teamHeader) {
          teamName = getText(teamHeader);
          log(`Found team name from header: "${teamName}"`);
        } else {
          log('No team header found, using generic name');
          teamName = 'Team';
        }
      }
      
      // Parse batting table
      const battingRecords: BattingRecord[] = [];
      
      log('Looking for batting table rows');
      // Try multiple selectors for batting rows
      const battingSelectors = [
        '.mc-batting-table tbody tr:not(.mc-batting-total):not(.mc-batting-extras)',
        '.batting-table tbody tr:not(.total-row):not(.extras-row)',
        '.mc-batting-table tr.ng-scope'
      ];
      
      let battingRows: NodeListOf<Element> | null = null;
      for (const selector of battingSelectors) {
        const rows = document.querySelectorAll(selector);
        if (rows.length > 0) {
          log(`Found ${rows.length} batting rows with selector: ${selector}`);
          battingRows = rows;
          break;
        }
      }
      
      if (!battingRows || battingRows.length === 0) {
        log('No batting rows found with standard selectors, trying generic approach');
        // Last resort: look for any table with batting-like structure
        const tables = document.querySelectorAll('table');
        for (const table of Array.from(tables)) {
          const rows = table.querySelectorAll('tr');
          if (rows.length > 3) { // Needs at least a few players
            battingRows = rows;
            log(`Found potential batting table with ${rows.length} rows`);
            break;
          }
        }
      }
      
      if (battingRows) {
        battingRows.forEach((row, idx) => {
          try {
            const cells = row.querySelectorAll('td');
            
            // Skip if not a proper player row or if it's extras/total
            if (cells.length < 5) {
              log(`Skipping row ${idx+1} - insufficient cells (${cells.length})`);
              return;
            }
            
            // Check if this is a player row (usually has a link or doesn't have "TOTAL"/"EXTRAS")
            const playerNameCell = cells[0];
            const playerNameLink = playerNameCell.querySelector('a');
            let rawPlayerName = playerNameLink ? getText(playerNameLink) : getText(playerNameCell);
            
            // Skip if it's not a player
            if (!rawPlayerName || 
                rawPlayerName.toUpperCase().includes('TOTAL') || 
                rawPlayerName.toUpperCase().includes('EXTRAS')) {
              log(`Skipping row ${idx+1} - not a player: "${rawPlayerName}"`);
              return;
            }
            
            // Extract only the player name without dismissal info
            let playerName = rawPlayerName;
            let status = '';
            
            // First try to get status from the dedicated status column
            if (cells.length > 1) {
              status = getText(cells[1]);
            }
            
            // Clean the player name - we need to remove dismissal info completely
            const dismissalIndicators = [' c ', ' b ', ' lbw ', ' st ', ' run out', ' Retired hurt', ' Retired out', ' Hit Wicket', 'obstructing the field'];
            let earliestIndex = playerName.length;

            for (const indicator of dismissalIndicators) {
            const index = playerName.indexOf(indicator);
            if (index !== -1 && index < earliestIndex) {
                earliestIndex = index;
            }
            }

            if (earliestIndex < playerName.length) {
            // Only set status if it's not already set from the status column
            if (!status) {
                status = playerName.substring(earliestIndex).trim();
            }
            // Always clean the name regardless of status column
            playerName = playerName.substring(0, earliestIndex).trim();
            }

            
            // Further clean name (e.g., "not out" might be part of the name)
            if (playerName.includes(' not out')) {
              playerName = playerName.replace(' not out', '').trim();
              if (!status) status = 'not out';
            }
            
            // Keep designation like (c) for captain as part of the name
            playerName = playerName.replace(/\s*\([a-z]+\)\s*$/i, '').trim();
            playerName = playerName.trim();
            
            // Get stats with proper error handling
            let runs = 0;
            let balls = 0;
            let fours = 0;
            let sixes = 0;
            
            // Get runs and balls - these are usually in columns 3 and 4
            if (cells.length > 2) runs = parseInt(getText(cells[2]), 10) || 0;
            if (cells.length > 3) balls = parseInt(getText(cells[3]), 10) || 0;
            
            // For fours and sixes, columns vary more - typically column 5 and 6
            if (cells.length > 4) fours = parseInt(getText(cells[4]), 10) || 0;
            if (cells.length > 5) sixes = parseInt(getText(cells[5]), 10) || 0;
            
            // Check if we might have strike rate in place of sixes
            if (sixes > 30 && cells.length > 6) {
              // Last column is likely strike rate
              const lastCellValue = parseFloat(getText(cells[cells.length - 1])) || 0;
              
              // If "sixes" matches or is close to the last column value, it's probably strike rate
              if (Math.abs(sixes - lastCellValue) < 10) {
                log(`Detected strike rate (${sixes}) in sixes field, correcting`);
                
                // Try to find the real sixes value
                // It should be column 6 (index 5) in most tables
                if (cells.length > 5) {
                  const potentialSixes = parseInt(getText(cells[5]), 10) || 0;
                  if (potentialSixes < 20) { // Reasonable number of sixes
                    sixes = potentialSixes;
                  } else {
                    // If still too high, make a reasonable estimate
                    sixes = Math.floor((runs - (fours * 4)) / 6);
                    sixes = Math.max(0, Math.min(sixes, Math.floor(runs / 6))); // Sanity check
                  }
                }
              }
            }
            
            log(`Processing player: ${playerName}, Status: ${status}, R: ${runs}, B: ${balls}, 4s: ${fours}, 6s: ${sixes}`);
            
            // Create a batting record following the interface
            const battingRecord: BattingRecord = {
              player: { name: playerName },
              status,
              runs,
              balls,
              fours,
              sixes
            };
            
            battingRecords.push(battingRecord);
          } catch (e) {
            log(`Error processing batting row ${idx+1}: ${e}`);
          }
        });
      }
      
      log(`Processed ${battingRecords.length} batting records`);
      
          // Update the bowling records extraction within the extractSingleInningsData function
    
        // Parse bowling table - completely rewritten for the specific structure
        const bowlingRecords: BowlingRecord[] = [];
        
        log('Looking for bowling table with class ap-scorecard-outer');
        
        // Look for the specific bowling table structure you shared
        const bowlingTable = document.querySelector('.ap-scorecard-outer.sc-bow-card table');
        if (bowlingTable) {
        log('Found specific bowling table structure');
        
        // Get all rows except header
        const bowlingRows = bowlingTable.querySelectorAll('tbody:not(.ap-head-row) tr');
        log(`Found ${bowlingRows.length} bowling rows`);
        
        bowlingRows.forEach((row, idx) => {
            try {
            // Skip header rows
            if (row.classList.contains('ap-head-row')) {
                log(`Skipping header row ${idx+1}`);
                return;
            }
            
            const cells = row.querySelectorAll('td');
            if (cells.length < 7) {
                log(`Skipping row ${idx+1} - insufficient cells (${cells.length})`);
                return;
            }
            
            // Extract player name from the first cell with specific structure
            const nameSpan = cells[0].querySelector('.ap-bats-score-name a span');
            const playerName = nameSpan ? getText(nameSpan).trim() : '';
            
            if (!playerName) {
                log(`Skipping row ${idx+1} - no player name found`);
                return;
            }
            
            // Based on the structure:
            // Index 2: Overs
            // Index 3: Maidens
            // Index 4: Runs
            // Index 5: Wickets
            // Index 7: Dots (skipping economy which is index 6)
            
            const overs = getText(cells[2]);
            const maidens = parseInt(getText(cells[3]), 10) || 0;
            const runs = parseInt(getText(cells[4]), 10) || 0;
            const wickets = parseInt(getText(cells[5]), 10) || 0;
            // Skip economy at index 6
            const dots = parseInt(getText(cells[7]), 10) || 0;  // Dots are in column 8 (index 7)
            
            log(`Processing bowler: ${playerName}, O: ${overs}, M: ${maidens}, R: ${runs}, W: ${wickets}, D: ${dots}`);
            
            // Create a bowling record following the interface
            const bowlingRecord: BowlingRecord = {
                player: { name: playerName },
                overs,
                maidens,
                runs,
                wickets,
                dots
            };
            
            bowlingRecords.push(bowlingRecord);
            } catch (e) {
            log(`Error processing bowling row ${idx+1}: ${e}`);
            }
        });
        } else {
        // Fallback to more generic selectors if specific structure not found
        log('Specific bowling table not found, trying alternative selectors');
        
        const fallbackSelectors = [
            '.mc-bowling-table tbody tr',
            '.bowling-table tbody tr',
            '.mc-bowling-table tr.ng-scope',
            'table:has(th:contains("Bowler")) tbody tr',
            '.scorecard-table.bowler-wrap tr'
        ];
        
        let bowlingRows: NodeListOf<Element> | null = null;
        let foundSelector = '';
        
        for (const selector of fallbackSelectors) {
            const rows = document.querySelectorAll(selector);
            if (rows.length > 0) {
            log(`Found ${rows.length} bowling rows with selector: ${selector}`);
            bowlingRows = rows;
            foundSelector = selector;
            break;
            }
        }
        
        if (bowlingRows) {
            bowlingRows.forEach((row, idx) => {
            try {
                // Skip header rows
                if (row.querySelector('th') || row.tagName.toLowerCase() === 'th') {
                return;
                }
                
                const cells = row.querySelectorAll('td');
                
                // Skip if not a proper player row
                if (cells.length < 5) {
                log(`Skipping bowling row ${idx+1} - insufficient cells (${cells.length})`);
                return;
                }
                
                const playerNameCell = cells[0];
                const playerNameLink = playerNameCell.querySelector('a');
                let playerName = '';
                
                // Try to find the name in different ways
                if (playerNameLink) {
                const nameSpan = playerNameLink.querySelector('span');
                if (nameSpan) {
                    playerName = getText(nameSpan);
                } else {
                    playerName = getText(playerNameLink);
                }
                } else {
                playerName = getText(playerNameCell);
                }
                
                playerName = playerName.trim();
                
                if (!playerName) {
                log(`Skipping bowling row ${idx+1} - no player name found`);
                return;
                }
                
                // Find column positions based on headers
                let oversIndex = 1;
                let maidensIndex = 2;
                let runsIndex = 3;
                let wicketsIndex = 4;
                let dotsIndex = 6; // Skip economy at index 5
                
                // If we found by a specific selector, use known indices
                if (foundSelector.includes('mc-bowling-table') || foundSelector.includes('bowling-table')) {
                oversIndex = 1;
                maidensIndex = 2;
                runsIndex = 3;
                wicketsIndex = 4;
                dotsIndex = cells.length >= 7 ? 6 : cells.length - 1;
                }
                
                // Extract data from the appropriate columns
                const overs = getText(cells[oversIndex]);
                const maidens = parseInt(getText(cells[maidensIndex]), 10) || 0;
                const runs = parseInt(getText(cells[runsIndex]), 10) || 0;
                const wickets = parseInt(getText(cells[wicketsIndex]), 10) || 0;
                
                // For dots, try to get from the last column if available
                let dots = 0;
                if (cells.length > dotsIndex) {
                dots = parseInt(getText(cells[dotsIndex]), 10) || 0;
                }
                
                log(`Processing bowler: ${playerName}, O: ${overs}, M: ${maidens}, R: ${runs}, W: ${wickets}, D: ${dots}`);
                
                // Create a bowling record following the interface
                const bowlingRecord: BowlingRecord = {
                player: { name: playerName },
                overs,
                maidens,
                runs,
                wickets,
                dots
                };
                
                bowlingRecords.push(bowlingRecord);
            } catch (e) {
                log(`Error processing bowling row ${idx+1}: ${e}`);
            }
            });
        }
        }
          
      log(`Processed ${bowlingRecords.length} bowling records`);
      
      // Extract extras and total
      let extras = '';
      let total = '';
      let fallOfWickets = '';
      
      // Try to find extras
      log('Looking for extras');
      const extrasSelectors = [
        '.mc-batting-extras',
        '.extras-row',
        'tr.extras'
      ];
      
      for (const selector of extrasSelectors) {
        const extrasRow = document.querySelector(selector);
        if (extrasRow) {
          extras = getText(extrasRow);
          log(`Found extras: "${extras}"`);
          break;
        }
      }
      
      // Try to find total
      log('Looking for total');
      const totalSelectors = [
        '.mc-batting-total',
        '.total-row',
        'tr.total'
      ];
      
      for (const selector of totalSelectors) {
        const totalRow = document.querySelector(selector);
        if (totalRow) {
          total = getText(totalRow);
          log(`Found total: "${total}"`);
          break;
        }
      }
      
      // Try to find fall of wickets
      log('Looking for fall of wickets');
      const fowSelectors = [
        '.mc-fow-content',
        '.fow-text',
        '.fall-of-wickets'
      ];
      
      for (const selector of fowSelectors) {
        const fowRow = document.querySelector(selector);
        if (fowRow) {
          fallOfWickets = getText(fowRow);
          log(`Found fall of wickets: "${fallOfWickets}"`);
          break;
        }
      }
      
      return {
        teamName,
        battingRecords,
        bowlingRecords,
        extras,
        total,
        fallOfWickets
      };
    } catch (e) {
      log(`Error extracting innings data: ${e}`);
      return {
        teamName: 'Error',
        battingRecords: [],
        bowlingRecords: [],
        extras: '',
        total: '',
        fallOfWickets: ''
      };
    }
  }, inningName);
}