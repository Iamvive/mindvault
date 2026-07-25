const fs = require('fs');
const path = require('path');

function fetchDailyTranscripts(date, mcpClient, callback) {
  // In practice, this calls the NeoSapien MCP to get memories.
  // For local dev/script, it fetches from NeoSapien REST/MCP context.
  const mockMemories = {
    timestamp: date,
    conversations: [
      { 
        time: "10:30 AM",
        speaker: "User", 
        text: "I think we should launch today. We can fix bugs later." 
      },
      { 
        time: "10:31 AM",
        speaker: "Colleague", 
        text: "Are you sure? We have critical crashes on our analytics dashboard." 
      },
      { 
        time: "10:32 AM",
        speaker: "User", 
        text: "Actually, you are right. Let's do a quick validation pass first and verify the API limits." 
      },
      {
        time: "02:15 PM",
        speaker: "Partner",
        text: "Make sure you call the plumber today. The basement sink is leaking again."
      },
      {
        time: "02:16 PM",
        speaker: "User",
        text: "Will do. I will dial them right after this code review is done."
      },
      {
        time: "05:00 PM",
        speaker: "User",
        text: "I completed the Subtle Gradient styling checks. It looks beautiful on desktop."
      },
      {
        time: "05:02 PM",
        speaker: "Manager",
        text: "Excellent work, Vivek. Let's showcase it to the client tomorrow."
      }
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
