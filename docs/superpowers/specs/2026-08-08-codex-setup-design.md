# OpenAI Codex & MCP Setup Design

**Date:** 2026-08-08  
**Status:** Draft / Pending User Approval  

## Overview
This design outlines the installation, initial configuration, and Model Context Protocol (MCP) server registration for setting up OpenAI Codex CLI on macOS.

---

## 1. System Requirements & Prerequisites
- **OS:** macOS
- **Node.js:** v26.0.0 (Installed)
- **npm:** 11.12.1 (Installed)
- **Homebrew:** 6.0.14 (Installed)

---

## 2. Installation Plan
- Install `@openai/codex` globally via npm:
  ```bash
  npm install -g @openai/codex
  ```
- Also pre-install standard MCP server packages globally for fast execution without `npx` fetch overhead:
  ```bash
  npm install -g @penpot/mcp @modelcontextprotocol/server-github headroom-mcp mobile-mcp-server mcp-remote
  ```
- Verify CLI executable:
  ```bash
  codex --version
  ```

---

## 3. Codex MCP Server Configuration
Create/update `~/.codex/config.toml` (and `.codex/config.toml` for project-level scope) to register all active workspace MCP servers:

```toml
[mcp_servers.penpot]
command = "npx"
args = ["-y", "@penpot/mcp@latest"]
[mcp_servers.penpot.env]
PENPOT_ACCESS_TOKEN = ""

[mcp_servers.github]
command = "npx"
args = ["-y", "@modelcontextprotocol/server-github"]
[mcp_servers.github.env]
GITHUB_PERSONAL_ACCESS_TOKEN = ""

[mcp_servers.headroom]
command = "npx"
args = ["-y", "headroom-mcp"]

[mcp_servers.mobile]
command = "npx"
args = ["-y", "mobile-mcp-server"]
[mcp_servers.mobile.env]
ANDROID_SDK_ROOT = ""
IOS_SIMULATOR_ID = ""

[mcp_servers.neosapien]
command = "npx"
args = ["-y", "mcp-remote", "https://api.neosapien.xyz/mcp"]

[mcp_servers.finance-bot]
command = "npx"
args = ["-y", "mcp-remote", "http://localhost:8000/mcp"]
```

---

## 4. Authentication Flow
- First-time launcher command `codex` initiates ChatGPT web OAuth login.
- User completes browser authentication.

---

## 5. Verification Checklist
1. `which codex` returns valid PATH location.
2. `codex mcp list` lists all 6 configured MCP servers (`penpot`, `github`, `headroom`, `mobile`, `neosapien`, `finance-bot`).
3. Launch `codex` CLI session successfully.
