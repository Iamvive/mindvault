#!/bin/bash
# Move to the folder where this script is located
cd "$(dirname "$0")/sanjaya"

clear
echo "=================================================================="
echo "🧠 Welcome to Project Sanjaya Daily Coach & Dashboard!"
echo "=================================================================="
echo ""
echo "🚀 Starting backend server on port 3001..."
echo "🚀 Starting frontend Vite server on port 3000..."
echo "👉 Opening your dashboard in the browser..."
echo ""

# Start the backend in the background
npm run dev:backend &
BACKEND_PID=$!

# Wait a second for backend to boot
sleep 1.5

# Open the browser to port 3000 (Vite frontend with proxy support)
open "http://localhost:3000"

# Start the frontend
npm run dev:frontend

# Cleanup: When the frontend server stops, stop the backend too
trap "kill $BACKEND_PID" EXIT
