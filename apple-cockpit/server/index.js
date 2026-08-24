const express = require('express');
const http = require('http');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const devicesRouter = require('./routes/devices');
const diagnosticsRouter = require('./routes/diagnostics');
const actionsRouter = require('./routes/actions');
const { runHealthAudit, getSystemProfile } = require('./services/macDiagnostics');
const { getEcosystemTopology } = require('./services/bonjourScanner');

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/devices', devicesRouter);
app.use('/api/diagnostics', diagnosticsRouter);
app.use('/api/actions', actionsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Create HTTP Server & WebSocket Server
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function broadcastTelemetry() {
  if (wss.clients.size === 0) return;
  try {
    const topology = getEcosystemTopology();
    const diagnostics = runHealthAudit();
    const payload = JSON.stringify({
      type: 'TELEMETRY_UPDATE',
      topology,
      diagnostics,
      timestamp: new Date().toISOString()
    });

    for (const client of wss.clients) {
      if (client.readyState === 1) { // OPEN
        client.send(payload);
      }
    }
  } catch (err) {
    console.error('Error broadcasting telemetry:', err.message);
  }
}

// Periodic live telemetry broadcast every 3.5s
const broadcastInterval = setInterval(broadcastTelemetry, 3500);

wss.on('connection', (ws) => {
  // Send immediate state on connect
  try {
    const topology = getEcosystemTopology();
    const diagnostics = runHealthAudit();
    ws.send(JSON.stringify({
      type: 'INITIAL_STATE',
      topology,
      diagnostics,
      timestamp: new Date().toISOString()
    }));
  } catch (err) {
    console.error('Error sending initial WS state:', err.message);
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
      }
    } catch (e) {
      // ignore
    }
  });
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🍎 Apple Ecosystem Cockpit Server running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket server listening on ws://localhost:${PORT}`);
  });
}

module.exports = { app, server, wss, broadcastInterval };
