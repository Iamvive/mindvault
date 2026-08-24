# 🍎 Apple Ecosystem Cockpit

A modern, high-performance command center and diagnostic hub tailored specifically for orchestrating seamless workflows across a **Mac mini**, **MacBook**, and **iPad**.

---

## 🌟 Key Features

* 🌐 **Live Ecosystem Radar**: Live status and Bonjour discovery of nearby Macs and iPads on your local network.
* 📐 **Desk & Display Studio**: Interactive drag-and-drop desk simulator to position monitors and tune Universal Control cursor transition boundaries.
* 🩺 **Diagnostic Center & 1-Tap Auto-Heal**: 8-point automated health audit (`sharingd`, Handoff, Bluetooth, Screen Sharing, AirDrop) with instant 1-tap repair buttons.
* 📖 **Master Playbook**: Interactive visual guides and step-by-step instructions for Universal Control, Sidecar with Apple Pencil, Universal Clipboard, and Screen Sharing.
* ⚡ **Quick Action Dock**: 1-click launchers to open Screen Sharing to Mac mini (`vnc://`), trigger AirDrop, or send cross-device clipboard pings.

---

## 🚀 Quick Start (1-Click Launch)

Simply double-click `start.command` in Finder:
```bash
./start.command
```

Or start manually via terminal:
```bash
# Install dependencies
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

# Run both backend & frontend
npm run dev
```

The Cockpit will automatically open in your browser at `http://localhost:5173`.
