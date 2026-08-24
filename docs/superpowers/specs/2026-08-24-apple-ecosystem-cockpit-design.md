# Apple Ecosystem Cockpit — System Design Specification

**Date:** 2026-08-24  
**Topic:** Apple Ecosystem Cockpit & Companion App  
**Target Setup:** Mac mini + MacBook + iPad  

---

## 1. Overview & Vision
The **Apple Ecosystem Cockpit** is an interactive, full-stack local command center and diagnostic hub designed to orchestrate, diagnose, and optimize seamless workflows across a **Mac mini**, **MacBook**, and **iPad**. 

It combines real-time macOS network and service inspection with an intuitive, glassmorphic web dashboard providing live topology mapping, drag-and-drop desk arrangement visualization, one-tap automated repairs for Continuity/Universal Control daemons, and interactive step-by-step master playbooks.

---

## 2. Architecture & Tech Stack

### 2.1 Backend Engine (Node.js & Express)
* **Runtime:** Node.js 18+ (bundled with standard macOS / local environment).
* **Framework:** Express + `ws` for real-time WebSocket state broadcasts.
* **macOS System Integration:** Safe, non-blocking execution of native macOS command-line utilities:
  * `dns-sd -B`: Bonjour / mDNS discovery of Apple services (`_companion-link._tcp`, `_airplay._tcp`, `_rfb._tcp`, `_smb._tcp`).
  * `scutil` / `ifconfig` / `networksetup`: Active subnet matching, Wi-Fi SSID, and IP inspection.
  * `system_profiler SPBluetoothDataType`: Bluetooth controller and link status.
  * `defaults read`: Verification of `com.apple.sharingd` and `com.apple.universalcontrol` configuration.
  * `open`: Launching native URL schemes (`vnc://`, `screen-sharing://`).
* **Recovery / Auto-Fix Endpoints:**
  * `restart-sharingd`: Graceful termination of `sharingd` to re-register Handoff & AirDrop tokens.
  * `flush-dns`: `killall -HUP mDNSResponder` to clear stale Bonjour discovery caches.
  * `restart-bluetooth`: Soft-reset Bluetooth subsystem daemon.

### 2.2 Frontend Application (React + Vite)
* **Framework:** React 18 + Vite for fast HMR and lightweight bundle size.
* **Styling & Aesthetics:** Pure Vanilla CSS conforming to the **Subtle Gradient Design System**:
  * Typography: `Inter`, system-ui, sans-serif with negative letter tracking on headings.
  * Colors: `--sg-primary` (`#e60023`), desaturated surface washes (`--gradient-wash-*`), and dark glassmorphic surfaces.
  * Geometry: Strict `16px` (cards/buttons), `32px` (containers/sections), and `9999px` (pills/badges) border radii.
* **State Management:** Custom React hook (`useCockpitState`) unifying WebSocket push events with polling fallbacks.

---

## 3. Detailed Component & Module Specifications

### 3.1 🌐 Topology & Device Radar (`TopologyRadar.jsx`)
* **Visual Graph:** Displays the 3 primary nodes:
  * 🖥️ **Mac mini:** Desk Workstation Engine (Host indicator, Ethernet/Wi-Fi status, IP, Screen Sharing port 5900).
  * 💻 **MacBook:** Portable Twin (Battery %, Wi-Fi link, Handoff status).
  * 📱 **iPad:** Auxiliary Companion & Pencil Tablet (Sidecar & Universal Control status, AirPlay receiver status).
* **Live Telemetry:** Real-time round-trip latency (ping ms), active Bonjour advertisements, and overall ecosystem sync score (0-100%).

### 3.2 📐 Desk & Display Studio (`DeskArrangement.jsx`)
* **Interactive Canvas:** A virtual 2D representation of the physical desk workspace.
* **Drag-and-Drop Arrangement:** Users can position the Mac mini monitor, MacBook, and iPad side-by-side or stacked.
* **Universal Control Transition Preview:** Highlights the active boundary edges where the mouse pointer will transition between devices.
* **Arrangement Presets:**
  1. *Primary Desk Hub:* Mac mini center, iPad on right stand (Universal Control), MacBook in clamshell or left.
  2. *Creative Canvas:* Mac mini main, iPad center bottom (Pencil Markup / Sidecar).
  3. *Mobile Command:* MacBook main, iPad right (Sidecar Extended Dual).

### 3.3 🩺 Diagnostic Center & 1-Tap Auto-Heal (`DiagnosticCenter.jsx`)
* **8 Automated Health Audits:**
  1. `Wi-Fi Subnet Matching`: Ensures all devices are on the same local subnet.
  2. `Bluetooth Subsystem`: Audits BLE state and power level.
  3. `sharingd & Handoff`: Validates daemon responsiveness.
  4. `AirDrop Discoverability`: Checks visibility (`Everyone` / `Contacts Only`).
  5. `Universal Control Daemon`: Checks service enablement.
  6. `Screen Sharing (VNC Port 5900)`: Confirms Mac mini remote accessibility.
  7. `File Sharing (SMB Port 445)`: Confirms local file transfer accessibility.
  8. `Universal Clipboard Engine`: Validates cross-device clipboard sync.
* **1-Tap Fix Actions:** Direct triggers executing backend repair routines with live execution logs.

### 3.4 📖 Master Playbook & Interactive Cheat-Sheets (`MasterPlaybook.jsx`)
* **Interactive Step-by-Step Guides:**
  * *Universal Control:* Setup, edge calibration, multi-device drag & drop.
  * *Sidecar & Apple Pencil:* Extended display setup, graphic tablet mode in macOS apps.
  * *Universal Clipboard & Handoff:* Copy-paste shortcuts, continuing Safari/Notes sessions.
  * *Continuity Sketch & Markup:* Inserting iPad drawings directly into Mac documents.
  * *Remote Mac mini Screen Sharing:* Headless access configuration and low-latency tuning.
* **Interactive Action Triggers:** Copy terminal snippets, run verification scripts, or view gesture demonstrations.

### 3.5 ⚡ Quick Action Dock (`QuickActionDock.jsx`)
* Instant one-tap action buttons:
  * `[ 🖥️ Connect Screen Sharing to Mac mini ]`
  * `[ 📁 Open AirDrop in Finder ]`
  * `[ 📋 Send Test Clipboard Packet ]`
  * `[ 🔄 Run Full Ecosystem Health Check ]`

---

## 4. File Layout & Packaging

```
apple-cockpit/
├── package.json
├── start.command
├── dev.sh
├── server/
│   ├── index.js
│   ├── routes/
│   │   ├── devices.js
│   │   ├── diagnostics.js
│   │   └── actions.js
│   └── services/
│       ├── macDiagnostics.js
│       └── bonjourScanner.js
└── client/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── index.css
        ├── components/
        │   ├── Header.jsx
        │   ├── TopologyRadar.jsx
        │   ├── DeskArrangement.jsx
        │   ├── DiagnosticCenter.jsx
        │   ├── MasterPlaybook.jsx
        │   └── QuickActionDock.jsx
        └── hooks/
            └── useCockpitState.js
```

---

## 5. Verification & Testing Plan
1. **Backend Verification:**
   * Verify all REST endpoints (`/api/devices`, `/api/diagnostics`, `/api/actions/*`) return structured JSON.
   * Verify WebSocket sends periodic heartbeat and live metric broadcasts.
   * Verify 1-click repair endpoints run safely without elevating sudo permissions.
2. **Frontend Verification:**
   * Verify responsive layout across Desktop (Mac mini / MacBook) and Tablet (iPad Safari).
   * Verify drag-and-drop desk arrangement canvas calculations.
   * Verify live diagnostic audit updates upon clicking "Run Health Check" or "Auto-Fix".
3. **Integration Verification:**
   * Test launching via `./start.command` to ensure both server and client boot cleanly and open the browser.
