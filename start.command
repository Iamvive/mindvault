#!/bin/bash
# Move to the folder where this script is located
cd "$(dirname "$0")"

clear
echo "=================================================================="
echo "🧠 Welcome to MindVault Ingestion & Dashboard Server!"
echo "=================================================================="
echo ""
echo "🚀 Starting server and Telegram bot..."
echo "👉 Opening your dashboard in the browser..."
echo ""

# Automatically open the dashboard url in the default web browser
open "http://localhost:3001"

# Run the Express server & Bot listener
npm run start
