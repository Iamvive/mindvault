#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PLIST_DIR="$HOME/Library/LaunchAgents"
PLIST_PATH="$PLIST_DIR/com.user.btmanager.plist"
BINARY_PATH="$DIR/BTManager.app/Contents/MacOS/BTManager"

# Ensure BTManager.app is built
if [ ! -f "$BINARY_PATH" ]; then
    echo "📦 Building BTManager.app first..."
    "$DIR/build_app.sh"
fi

mkdir -p "$PLIST_DIR"

# Unload previous service if loaded
launchctl unload "$PLIST_PATH" 2>/dev/null || true

echo "📝 Creating LaunchAgent at $PLIST_PATH..."
cat << EOF > "$PLIST_PATH"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.user.btmanager</string>
    <key>ProgramArguments</key>
    <array>
        <string>$BINARY_PATH</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>ThrottleInterval</key>
    <integer>3</integer>
    <key>ProcessType</key>
    <string>Interactive</string>
</dict>
</plist>
EOF

# Kill any loose instances before handing control to launchd
pkill -x "BTManager" 2>/dev/null || true

echo "🚀 Loading LaunchAgent into macOS..."
launchctl bootstrap gui/$(id -u) "$PLIST_PATH" 2>/dev/null || launchctl load "$PLIST_PATH"

echo "✅ BTManager is now configured to NEVER disappear!"
echo "   - Starts automatically on Mac login"
echo "   - Auto-restarts immediately if ever closed or crashed"
