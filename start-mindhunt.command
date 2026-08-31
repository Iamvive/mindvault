#!/bin/bash
# Move to the project folder
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR/job-hunter"

clear
echo "=================================================================="
echo "🎯 MindHunt — Zero-Cost AI Job Search & Application Cockpit"
echo "=================================================================="
echo ""

# Check if Chrome is running on port 9222
curl -s http://127.0.0.1:9222/json/version > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "💡 Tip: To enable live Chrome session automation & Claude 0-cost prompting:"
  echo "   Launch Chrome with debugging enabled in a separate window:"
  echo '   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-job-hunter-profile"'
  echo ""
  echo "ℹ️  Starting MindHunt in Local Cockpit mode..."
else
  echo "✅ Chrome CDP Detected on port 9222! Live automation enabled."
fi

echo ""
echo "🚀 Launching MindHunt Server on port 4200..."
echo "👉 Opening http://localhost:4200 in your browser..."
echo ""

# Start the node server in the background
node src/server/server.js &
SERVER_PID=$!

sleep 1.2
open "http://localhost:4200"

# Cleanup when user hits Ctrl+C
trap "kill $SERVER_PID" EXIT INT TERM
wait $SERVER_PID
