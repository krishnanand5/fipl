#!/bin/bash

# Exit on any error
set -e

# Function to print status messages
print_status() {
    echo "➜ $1"
}

# Navigate to project root directory
cd "$(dirname "$0")/.." || exit 1

# Read the last match ID and increment it
LAST_MATCH_ID=$(jq '.lastMatchId' backend/src/match_tracker.json)
NEXT_MATCH_ID=$((LAST_MATCH_ID + 1))
print_status "Processing match ID: $NEXT_MATCH_ID"

# Navigate to backend and run scraper
cd backend || exit 1
print_status "Running scraper..."
npm run scrape single "$NEXT_MATCH_ID" || {
    print_status "ERROR: Scraping failed"
    exit 1
}

# Calculate points
print_status "Calculating points..."
npm run points || {
    print_status "ERROR: Points calculation failed"
    exit 1
}

# Generate franchise bonus stats
print_status "Generating franchise bonus statistics..."
npm run generate:bonus || {
    print_status "ERROR: Bonus stats generation failed"
    exit 1
}

# Create target directories if they don't exist
print_status "Creating directories..."
mkdir -p ../frontend/public/data/iplt20_match_stats
mkdir -p ../frontend/public/data/player_points

# Move match stats files
if [ -d "../data/iplt20_match_stats" ]; then
    cp -r ../data/iplt20_match_stats/* ../frontend/public/data/iplt20_match_stats/ || {
        print_status "ERROR: Failed to copy match stats"
        exit 1
    }
    print_status "Copied match stats files to frontend"
fi

# Move player points files
if [ -d "../data/player_points" ]; then
    cp -r ../data/player_points/* ../frontend/public/data/player_points/ || {
        print_status "ERROR: Failed to copy player points"
        exit 1
    }
    print_status "Copied player points files to frontend"
fi

print_status "Data update completed successfully"
