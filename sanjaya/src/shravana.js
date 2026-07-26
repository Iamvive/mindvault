const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function formatShortTime(isoStr) {
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch (e) {
    return "N/A";
  }
}

function formatDuration(startedAt, finishedAt) {
  try {
    const s = new Date(startedAt);
    const f = new Date(finishedAt);
    const diffSec = Math.round((f - s) / 1000);
    if (diffSec < 60) {
      return `${diffSec}s`;
    }
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  } catch (e) {
    return "0s";
  }
}

function classifyEnvironment(domains) {
  if (!domains || !Array.isArray(domains)) return 'personal';
  const officeKeywords = ['professional', 'work', 'corporate', 'office', 'career', 'business', 'meeting', 'technical', 'development'];
  const hasOffice = domains.some(dom => 
    officeKeywords.some(kw => dom.toLowerCase().includes(kw))
  );
  return hasOffice ? 'office' : 'personal';
}

function fetchDailyTranscripts(date, mcpClient, callback) {
  if (process.env.NODE_ENV === 'test') {
    const mockMemories = {
      timestamp: date,
      memories: [
        {
          id: "mem-1",
          title: "Launch Discussion",
          summary: "Debated launching with crashes, selected code validation pass instead.",
          duration: "2m",
          environment: "office",
          time: "10:30 AM"
        }
      ],
      conversations: [
        { time: "10:30 AM", speaker: "User", text: "I think we should launch today. We can fix bugs later." },
        { time: "10:31 AM", speaker: "Colleague", text: "Are you sure? We have critical crashes on our analytics dashboard." },
        { time: "10:32 AM", speaker: "User", text: "Actually, you are right. Let's do a quick validation pass first and verify the API limits." }
      ]
    };
    return callback(null, mockMemories);
  }

  console.log(`[Shravana] Connecting to NeoSapien MCP to fetch transcripts for ${date}...`);
  const child = spawn('npx', ['-y', 'mcp-remote', 'https://api.neosapien.xyz/mcp']);

  let buffer = '';
  let messageId = 1;
  let hasCallbacked = false;

  const safeCallback = (err, result) => {
    if (!hasCallbacked) {
      hasCallbacked = true;
      child.kill();
      callback(err, result);
    }
  };

  // Set timeout of 60 seconds — mcp-remote needs time to negotiate OAuth + SSE on cold start
  const timeoutTimer = setTimeout(() => {
    safeCallback(new Error("Timeout waiting for NeoSapien MCP response"));
  }, 60000);

  child.stdout.on('data', (data) => {
    buffer += data.toString();
    let boundary = buffer.indexOf('\n');
    while (boundary !== -1) {
      const line = buffer.substring(0, boundary).trim();
      buffer = buffer.substring(boundary + 1);
      if (line) {
        try {
          const response = JSON.parse(line);
          handleResponse(response);
        } catch (err) {
          // JSON parse errors are ignored for clean output
        }
      }
      boundary = buffer.indexOf('\n');
    }
  });

  child.stderr.on('data', (data) => {
    console.error(`[Shravana MCP stderr] ${data.toString().trim()}`);
  });

  child.on('close', (code) => {
    clearTimeout(timeoutTimer);
    if (!hasCallbacked) {
      safeCallback(new Error(`MCP Connection terminated prematurely with code ${code}`));
    }
  });

  function handleResponse(response) {
    // 1. Handshake response
    if (response.id === 1) {
      sendNotification("notifications/initialized");
      
      // list_all_memories returns all memories; we filter client-side by date
      messageId++;
      sendRequest(messageId, "tools/call", {
        name: "list_all_memories",
        arguments: { limit: 200 }
      });
    }
    // 2. list_all_memories response
    else if (response.id === 2) {
      let memories = [];
      try {
        if (response.result && response.result.content) {
          for (const item of response.result.content) {
            if (item.type === 'text') {
              const parsed = JSON.parse(item.text);
              if (parsed && parsed.items) {
                memories = parsed.items;
              } else if (Array.isArray(parsed)) {
                memories = parsed;
              }
            }
          }
        }
      } catch (err) {
        console.error("[Shravana] Failed to parse memories content:", err);
      }

      console.log("[DEBUG memories count]", memories.length);
      if (memories.length > 0) {
        console.log("[DEBUG first 3 memories]", JSON.stringify(memories.slice(0, 3), null, 2));
      }

      function normalizeDateStr(val) {
        if (!val) return '';
        if (typeof val === 'number') {
          const ms = val < 1e11 ? val * 1000 : val;
          return new Date(ms).toISOString().split('T')[0];
        }
        if (typeof val === 'string') {
          if (val.length >= 10 && val.includes('-')) {
            try {
              const d = new Date(val);
              if (!isNaN(d.getTime())) {
                return d.toISOString().split('T')[0];
              }
            } catch (e) {}
            return val.substring(0, 10);
          }
        }
        return '';
      }

      // Filter memories matching date (starts with or matches target date YYYY-MM-DD)
      const matchingMemories = memories.filter(item => {
        const memory = item.memory || item;
        const rawDate = memory.created_at || memory.started_at || memory.timestamp || item.created_at || item.started_at;
        const normDate = normalizeDateStr(rawDate);
        return normDate === date || (typeof rawDate === 'string' && rawDate.startsWith(date));
      });

      console.log(`[Shravana] Found ${matchingMemories.length} memories for ${date}`);

      if (matchingMemories.length === 0) {
        clearTimeout(timeoutTimer);
        return safeCallback(null, { timestamp: date, memories: [], conversations: [] });
      }

      // Skip individual transcript fetching — NeoSapien rate-limits concurrent calls.
      // Use the summary text from list_all_memories directly for Gemini analysis.
      const compiledMemories = [];
      const compiledConversations = [];

      for (const item of matchingMemories) {
        const memory = item.memory || item;
        const rawDate = memory.created_at || memory.started_at || memory.timestamp;
        const memoryTime = formatShortTime(rawDate);
        const title = memory.title || memory.name || memory.topic || 'Note';
        const summary = memory.summary || memory.transcript || memory.text || memory.content || '';
        const duration = formatDuration(memory.started_at || rawDate, memory.finished_at || memory.ended_at);
        const environment = classifyEnvironment(memory.domains || memory.tags || []);

        compiledMemories.push({
          id: memory._id || memory.id || `mem-${compiledMemories.length + 1}`,
          title: title,
          summary: summary,
          duration: duration,
          environment: environment,
          time: memoryTime
        });

        // Use summary as a conversation entry for Gemini context
        if (summary) {
          compiledConversations.push({
            time: memoryTime,
            speaker: 'Memory',
            text: `[${title}] ${summary}`
          });
        }
      }

      clearTimeout(timeoutTimer);
      safeCallback(null, {
        timestamp: date,
        memories: compiledMemories,
        conversations: compiledConversations
      });
    }
  }

  function sendRequest(id, method, params) {
    const req = {
      jsonrpc: "2.0",
      id,
      method,
      params
    };
    child.stdin.write(JSON.stringify(req) + "\n");
  }

  function sendNotification(method, params) {
    const req = {
      jsonrpc: "2.0",
      method,
      params: params || {}
    };
    child.stdin.write(JSON.stringify(req) + "\n");
  }

  // Start handshake
  const initRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "sanjaya-client", version: "1.0.0" }
    }
  };
  child.stdin.write(JSON.stringify(initRequest) + "\n");
}

function backupToVault(date, rawJson) {
  const vaultDir = path.join(__dirname, '../smriti/vault');
  if (!fs.existsSync(vaultDir)) {
    fs.mkdirSync(vaultDir, { recursive: true });
  }
  const filePath = path.join(vaultDir, `${date}-raw.json`);
  fs.writeFileSync(filePath, JSON.stringify(rawJson, null, 2), 'utf8');
  return filePath;
}

module.exports = { fetchDailyTranscripts, backupToVault };
