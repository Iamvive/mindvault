const fs = require('fs');
const path = require('path');

function fetchDailyTranscripts(date, mcpClient, callback) {
  // In practice, this calls the NeoSapien MCP to get memories.
  // For local dev/script, it fetches from NeoSapien REST/MCP context.
  const mockMemories = {
    timestamp: date,
    conversations: [
      { speaker: "User", text: "I think we should launch today. We can fix bugs later." },
      { speaker: "Colleague", text: "Are you sure? We have critical crashes." },
      { speaker: "User", text: "Actually, you are right. Let's do a quick validation pass first." }
    ]
  };
  callback(null, mockMemories);
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
