#!/bin/bash
PLIST_PATH="$HOME/Library/LaunchAgents/com.user.btmanager.plist"

echo "🛑 Unloading BTManager LaunchAgent..."
launchctl unload "$PLIST_PATH" 2>/dev/null || true
rm -f "$PLIST_PATH"
pkill -x "BTManager" 2>/dev/null || true

echo "✅ BTManager autostart has been removed and stopped."
