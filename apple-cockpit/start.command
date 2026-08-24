#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "🍎 Launching Apple Ecosystem Cockpit..."

# Check and install root dependencies
if [ ! -d "node_modules" ]; then
  echo "📦 Installing root dependencies..."
  npm install
fi

# Check and install server dependencies
if [ ! -d "server/node_modules" ]; then
  echo "📦 Installing server dependencies..."
  cd server && npm install && cd ..
fi

# Check and install client dependencies
if [ ! -d "client/node_modules" ]; then
  echo "📦 Installing client dependencies..."
  cd client && npm install && cd ..
fi

echo "🚀 Starting Cockpit Server & Frontend..."

# Open default browser after a 2-second boot delay
(sleep 2 && open "http://localhost:5173") &

# Start dev servers
npm run dev
