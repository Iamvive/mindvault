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

function fetchDailyTranscripts(date, mcpClient, callback) {
  if (process.env.NODE_ENV === 'test') {
    const mockMemories = {
      timestamp: date,
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

  // Set timeout of 15 seconds for connection & fetch
  const timeoutTimer = setTimeout(() => {
    safeCallback(new Error("Timeout waiting for NeoSapien MCP response"));
  }, 15000);

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
    // Stderr logging is silenced to keep terminal output clean
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
      
      // Request list of all memories (limit 50 to cover the day)
      messageId++;
      sendRequest(messageId, "tools/call", {
        name: "list_all_memories",
        arguments: { limit: 50 }
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
              }
            }
          }
        }
      } catch (err) {
        console.error("[Shravana] Failed to parse memories content:", err);
      }

      // Filter memories matching date (starts with target date YYYY-MM-DD)
      const matchingMemories = memories.filter(item => {
        const memory = item.memory || item;
        return memory.created_at && memory.created_at.startsWith(date);
      });

      console.log(`[Shravana] Found ${matchingMemories.length} memories for ${date}`);

      if (matchingMemories.length === 0) {
        clearTimeout(timeoutTimer);
        return safeCallback(null, { timestamp: date, conversations: [] });
      }

      // Fetch transcripts in parallel
      const pendingTranscripts = [];
      const compiledConversations = [];

      for (const item of matchingMemories) {
        const memory = item.memory || item;
        const memoryId = memory._id;
        const memoryTime = formatShortTime(memory.created_at);

        const promise = new Promise((resolve) => {
          messageId++;
          const reqId = messageId;

          // Regiser listener for this specific request ID
          const responseListener = (res) => {
            if (res.id === reqId) {
              try {
                if (res.result && res.result.content) {
                  for (const itemContent of res.result.content) {
                    if (itemContent.type === 'text') {
                      const transcriptWrapper = JSON.parse(itemContent.text);
                      if (transcriptWrapper && transcriptWrapper.transcript) {
                        for (const seg of transcriptWrapper.transcript) {
                          compiledConversations.push({
                            time: memoryTime,
                            speaker: seg.speaker || (seg.is_user ? "User" : "Colleague"),
                            text: seg.text
                          });
                        }
                      }
                    }
                  }
                }
              } catch (e) {
                console.error(`[Shravana] Error parsing transcript for ${memoryId}:`, e);
              }
              resolve();
            }
          };

          // Temporarily subscribe to message logs to pick up response
          const handleTempStream = (data) => {
            const rawText = data.toString();
            try {
              const lines = rawText.split('\n');
              for (const line of lines) {
                if (line.trim()) {
                  const parsed = JSON.parse(line.trim());
                  responseListener(parsed);
                }
              }
            } catch (e) {}
          };
          child.stdout.on('data', handleTempStream);

          sendRequest(reqId, "tools/call", {
            name: "get_memory_transcript",
            arguments: { memory_id: memoryId }
          });
        });

        pendingTranscripts.push(promise);
      }

      Promise.all(pendingTranscripts).then(() => {
        clearTimeout(timeoutTimer);
        
        // Sort conversations by time if necessary, but keep original capture sequence
        safeCallback(null, {
          timestamp: date,
          conversations: compiledConversations
        });
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
