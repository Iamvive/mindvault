#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "🔨 Building BTManager (Release)..."
DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer swift build -c release

APP_BUNDLE="$DIR/BTManager.app"
CONTENTS="$APP_BUNDLE/Contents"
MACOS="$CONTENTS/MacOS"
RESOURCES="$CONTENTS/Resources"

echo "📦 Creating macOS App Bundle ($APP_BUNDLE)..."
rm -rf "$APP_BUNDLE"
mkdir -p "$MACOS" "$RESOURCES"

cp "$DIR/.build/release/BTManager" "$MACOS/BTManager"
cp "$DIR/Info.plist" "$CONTENTS/Info.plist"
chmod +x "$MACOS/BTManager"

echo "✅ BTManager.app created successfully!"
