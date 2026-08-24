#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Kill existing instance if running
pkill -f "BTManager.app/Contents/MacOS/BTManager" 2>/dev/null || true
pkill -x "BTManager" 2>/dev/null || true

if [ ! -d "$DIR/BTManager.app" ]; then
    ./build_app.sh
fi

echo "🚀 Launching BTManager..."
open "$DIR/BTManager.app"
