#!/bin/bash

# Exit on any error
set -e

# Function to print status messages
print_status() {
    echo "➜ $1"
}

# Navigate to project root directory
cd "$(dirname "$0")/.." || exit 1

# Deploy to GitHub Pages
print_status "Deploying to GitHub Pages..."
cd frontend
npm run deploy || {
    print_status "ERROR: Deployment failed"
    exit 1
}

print_status "Deployment completed successfully!"