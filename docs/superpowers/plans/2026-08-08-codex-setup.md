# OpenAI Codex CLI & MCP Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install OpenAI Codex CLI globally, pre-install MCP server packages, configure `~/.codex/config.toml` with all workspace MCP servers, and verify setup.

**Architecture:** Global npm package installation for `@openai/codex` and MCP server dependencies, followed by TOML configuration creation at `~/.codex/config.toml`.

**Tech Stack:** Node.js 26, npm 11, TOML, OpenAI Codex CLI v0.147.0

## Global Constraints
- Node.js >= 24
- npm global packages accessible in PATH
- Valid TOML configuration for `~/.codex/config.toml`

---

### Task 1: Install OpenAI Codex CLI & MCP Server Packages Globally

**Files:**
- System Global: `node_modules/@openai/codex`

**Interfaces:**
- Consumes: npm CLI v11.12.1
- Produces: `codex` executable in PATH

- [ ] **Step 1: Install `@openai/codex` globally via npm**

Run: `npm install -g @openai/codex`
Expected: `+ @openai/codex@0.147.0` installed globally

- [ ] **Step 2: Pre-install MCP server npm packages globally**

Run: `npm install -g @penpot/mcp @modelcontextprotocol/server-github headroom-mcp mobile-mcp-server mcp-remote`
Expected: All packages added successfully

- [ ] **Step 3: Verify `codex` binary is available in PATH**

Run: `which codex && codex --version`
Expected: Path printed and version outputted

---

### Task 2: Configure MCP Servers in `~/.codex/config.toml`

**Files:**
- Create/Modify: `~/.codex/config.toml`

**Interfaces:**
- Consumes: `.vscode/mcp.json` / `.cursor/mcp.json` definitions
- Produces: `[mcp_servers]` table definitions in `~/.codex/config.toml`

- [ ] **Step 1: Ensure `~/.codex` directory exists**

Run: `mkdir -p ~/.codex`

- [ ] **Step 2: Write `~/.codex/config.toml` with workspace MCP configurations**

Write content to `~/.codex/config.toml`:

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

### Task 3: Verify Codex Installation & MCP Server Registration

**Files:**
- None (Verification step)

- [ ] **Step 1: Verify MCP list via `codex mcp list`**

Run: `codex mcp list`
Expected: Output showing 6 registered MCP servers (`penpot`, `github`, `headroom`, `mobile`, `neosapien`, `finance-bot`)

- [ ] **Step 2: Commit implementation plan to git repository**

Run: `git add docs/superpowers/plans/2026-08-08-codex-setup.md && git commit -m "docs: add implementation plan for Codex CLI and MCP server setup"`
Expected: Clean commit message
