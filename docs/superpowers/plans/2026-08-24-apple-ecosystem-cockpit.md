# Apple Ecosystem Cockpit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack local Apple Ecosystem Cockpit web application (Node.js/Express backend + React/Vite frontend) to orchestrate, inspect, diagnose, and optimize workflows across a Mac mini, MacBook, and iPad.

**Architecture:** Node.js/Express backend exposes REST & WebSocket endpoints executing native macOS system CLI commands (`dns-sd`, `scutil`, `system_profiler`, `defaults`, `sharingd`), while a React + Vite frontend provides an interactive dark-mode glassmorphic dashboard adhering to the Subtle Gradient design system.

**Tech Stack:** Node.js 18+, Express, `ws`, `cors`, React 18, Vite, Vitest, Vanilla CSS.

## Global Constraints
- Typography: `Inter`, system-ui, sans-serif with negative letter tracking on headings.
- Colors: `--sg-primary` (`#e60023`), desaturated surface washes (`--gradient-wash-*`), dark glassmorphic surfaces.
- Geometry: Strict `16px` (cards/buttons), `32px` (containers/sections), and `9999px` (pills/badges) border radii.
- Safe Execution: Non-destructive macOS commands with fallback mocks when running in restricted environments.

---

### Task 1: Project Scaffolding & Root Configuration
**Files:**
- Create: `apple-cockpit/package.json`
- Create: `apple-cockpit/start.command`
- Create: `apple-cockpit/README.md`

**Interfaces:**
- Produces: Root project runners and executable `start.command` for macOS double-click launch.

- [ ] **Step 1: Create `apple-cockpit/package.json`**
```json
{
  "name": "apple-ecosystem-cockpit",
  "version": "1.0.0",
  "description": "Interactive command center and diagnostic hub for Mac mini, MacBook, and iPad",
  "scripts": {
    "dev": "concurrently \"npm run server --prefix server\" \"npm run dev --prefix client\"",
    "start": "node server/index.js",
    "test": "npm run test --prefix server && npm run test --prefix client"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

- [ ] **Step 2: Create `apple-cockpit/start.command` with executable permissions**
```bash
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "🍎 Launching Apple Ecosystem Cockpit..."

if [ ! -d "node_modules" ]; then
  echo "📦 Installing root dependencies..."
  npm install
fi

if [ ! -d "server/node_modules" ]; then
  echo "📦 Installing server dependencies..."
  cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
  echo "📦 Installing client dependencies..."
  cd client && npm install && cd ..
fi

# Open default browser after a 2-second boot delay
(sleep 2 && open "http://localhost:5173") &

# Start dev servers
npm run dev
```

- [ ] **Step 3: Make `start.command` executable**
Run: `chmod +x apple-cockpit/start.command`

- [ ] **Step 4: Create `apple-cockpit/README.md`**

- [ ] **Step 5: Commit**
```bash
git add apple-cockpit/package.json apple-cockpit/start.command apple-cockpit/README.md
git commit -m "chore: scaffold apple-cockpit root package and launch script"
```

---

### Task 2: Backend Engine — Services & macOS Diagnostic Probing
**Files:**
- Create: `apple-cockpit/server/package.json`
- Create: `apple-cockpit/server/services/macDiagnostics.js`
- Create: `apple-cockpit/server/services/bonjourScanner.js`
- Create: `apple-cockpit/server/tests/diagnostics.test.js`

**Interfaces:**
- Produces: `getSystemProfile()`, `runHealthAudit()`, `executeRepair(actionId)`, `scanBonjourServices()`

- [ ] **Step 1: Write backend tests in `apple-cockpit/server/tests/diagnostics.test.js`**
- [ ] **Step 2: Run tests to verify they fail before implementation**
Run: `cd apple-cockpit/server && npm test` (expected failure before implementation)
- [ ] **Step 3: Implement `macDiagnostics.js` and `bonjourScanner.js`**
  - Implement system profile reader (Model, Hostname, IPs, Wi-Fi SSID, Bluetooth state).
  - Implement 8-point automated health audit with fallback handling.
  - Implement 1-tap repair routines (`restart-sharingd`, `flush-dns`, `launch-screenshare`, `trigger-airdrop`).
  - Implement Bonjour mDNS scanner for `_companion-link._tcp`, `_airplay._tcp`, `_rfb._tcp`.
- [ ] **Step 4: Run tests to verify PASS**
Run: `cd apple-cockpit/server && npm test`
- [ ] **Step 5: Commit**
```bash
git add apple-cockpit/server/
git commit -m "feat(server): implement macOS diagnostic services and bonjour scanner"
```

---

### Task 3: Backend Express & WebSocket API Server
**Files:**
- Create: `apple-cockpit/server/routes/devices.js`
- Create: `apple-cockpit/server/routes/diagnostics.js`
- Create: `apple-cockpit/server/routes/actions.js`
- Create: `apple-cockpit/server/index.js`
- Create: `apple-cockpit/server/tests/api.test.js`

**Interfaces:**
- Produces: `GET /api/devices`, `GET /api/diagnostics`, `POST /api/diagnostics/repair`, `POST /api/actions/:action`, and WebSocket broadcasts on port `5174`.

- [ ] **Step 1: Write API endpoint integration tests in `apple-cockpit/server/tests/api.test.js`**
- [ ] **Step 2: Implement route handlers and Express + WS server in `server/index.js`**
- [ ] **Step 3: Run backend test suite**
Run: `cd apple-cockpit/server && npm test`
- [ ] **Step 4: Commit**
```bash
git add apple-cockpit/server/
git commit -m "feat(server): create Express and WebSocket API server"
```

---

### Task 4: Frontend Scaffolding, Design System & State Management
**Files:**
- Create: `apple-cockpit/client/package.json`
- Create: `apple-cockpit/client/vite.config.js`
- Create: `apple-cockpit/client/index.html`
- Create: `apple-cockpit/client/src/index.css` (Subtle Gradient Design Tokens)
- Create: `apple-cockpit/client/src/hooks/useCockpitState.js`

**Interfaces:**
- Produces: Design system CSS variables, custom hook `useCockpitState` delivering live device lists, diagnostics, ping latencies, and repair dispatchers.

- [ ] **Step 1: Setup `apple-cockpit/client/package.json` and `vite.config.js`**
- [ ] **Step 2: Implement `src/index.css` with Subtle Gradient design tokens (`--sg-primary`, `--gradient-wash-*`, `Inter` typography, glassmorphic dark styling)**
- [ ] **Step 3: Implement `src/hooks/useCockpitState.js` with WebSocket connection, auto-reconnect, and REST fallback**
- [ ] **Step 4: Commit**
```bash
git add apple-cockpit/client/
git commit -m "feat(client): add design system tokens and real-time state hook"
```

---

### Task 5: Core UI Components (Topology Radar, Desk Studio, Diagnostics Center)
**Files:**
- Create: `apple-cockpit/client/src/components/Header.jsx`
- Create: `apple-cockpit/client/src/components/TopologyRadar.jsx`
- Create: `apple-cockpit/client/src/components/DeskArrangement.jsx`
- Create: `apple-cockpit/client/src/components/DiagnosticCenter.jsx`

**Interfaces:**
- Produces:
  - `Header`: Ecosystem pulse indicator and navigation tabs.
  - `TopologyRadar`: Visual interactive network node graph.
  - `DeskArrangement`: Drag-and-drop desk simulator for Universal Control edge tuning.
  - `DiagnosticCenter`: 8 live health cards + 1-Tap Auto-Fix buttons.

- [ ] **Step 1: Implement `Header.jsx`**
- [ ] **Step 2: Implement `TopologyRadar.jsx` with animated SVG links and live device stats**
- [ ] **Step 3: Implement `DeskArrangement.jsx` with interactive drag & drop, edge collision indicators, and desk presets**
- [ ] **Step 4: Implement `DiagnosticCenter.jsx` with live audit badges and instant repair triggers**
- [ ] **Step 5: Commit**
```bash
git add apple-cockpit/client/src/components/
git commit -m "feat(client): implement topology radar, desk arrangement studio, and diagnostic center"
```

---

### Task 6: Master Playbook, Quick Action Dock & Main App Assembly
**Files:**
- Create: `apple-cockpit/client/src/components/MasterPlaybook.jsx`
- Create: `apple-cockpit/client/src/components/QuickActionDock.jsx`
- Create: `apple-cockpit/client/src/App.jsx`
- Create: `apple-cockpit/client/src/App.test.jsx`

**Interfaces:**
- Produces: Complete end-to-end interactive dashboard.

- [ ] **Step 1: Implement `MasterPlaybook.jsx` with interactive workflow guides, terminal copy snippets, and visual walk-throughs**
- [ ] **Step 2: Implement `QuickActionDock.jsx` with 1-click Screen Sharing, AirDrop launcher, and test ping utilities**
- [ ] **Step 3: Assemble `App.jsx` with tab switching, responsive layouts, and live notifications**
- [ ] **Step 4: Write and run frontend test in `App.test.jsx`**
Run: `cd apple-cockpit/client && npm test`
- [ ] **Step 5: Commit**
```bash
git add apple-cockpit/client/
git commit -m "feat(client): implement master playbook, quick dock, and main cockpit view"
```

---

### Task 7: End-to-End Build, Launch Verification & Walkthrough
**Files:**
- Test all end-to-end flows.
- Verify `./start.command` startup.

- [ ] **Step 1: Build client production bundle to verify zero lint/build errors**
Run: `cd apple-cockpit/client && npm run build`
- [ ] **Step 2: Start server and verify API endpoints and WebSocket connection**
- [ ] **Step 3: Commit final updates and generate walkthrough artifact**
```bash
git add apple-cockpit/
git commit -m "chore: verify end-to-end build and launch flows for apple-cockpit"
```
