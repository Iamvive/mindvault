#!/bin/bash

# Export clean standard PATH for macOS
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

# Move to app directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR" || exit 1

echo "🍎 ============================================="
echo "🍎  Apple Ecosystem Cockpit (EcoApp)"
echo "🍎 ============================================="

# Start backend if not active
if ! curl -s http://localhost:5174/api/health >/dev/null 2>&1; then
  echo "🚀 Starting macOS Backend Engine..."
  node server/index.js &
fi

# Start frontend dev server if not active
if ! curl -s http://localhost:5173/ >/dev/null 2>&1; then
  echo "🚀 Starting Vite Frontend..."
  (cd client && npm run dev) &
fi

# Wait for client to become ready
for i in {1..20}; do
  if curl -s http://localhost:5173/ >/dev/null 2>&1; then
    break
  fi
  sleep 0.2
done

# Open browser
open "http://localhost:5173"
