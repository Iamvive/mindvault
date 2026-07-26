# Graph Report - ai-play-ground  (2026-07-26)

## Corpus Check
- 161 files · ~168,825 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1499 nodes · 2101 edges · 121 communities (103 shown, 18 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 90 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `134f98ed`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Backend AI Initialization
- bot.py
- package.json
- db.py
- Backend Dependencies
- TestFinanceBotPipeline
- TestFinanceBotQueryQA
- llm_extract.py
- .oxlintrc.json
- package.json
- categorize.py
- scheduler.py
- MultiUserHTTPRequestHandler
- pull_db_from_vps.sh
- setup_vps.sh
- sync_to_vps.sh
- Test-Driven Development (TDD)
- Testing Skills With Subagents
- Subagent-Driven Development
- Using Git Worktrees
- Visual Companion Guide
- Creation Log: Systematic Debugging Skill
- Self-Hosted Telegram Personal Finance Bot & Dashboard
- Code Review Reception
- The Process
- Systematic Debugging
- Testing CLAUDE.md Skills Documentation
- Dispatching Parallel Agents
- Root Cause Tracing
- [Analysis Title]
- Persuasion Principles for Skill Design
- Writing Skills
- Writing Plans
- Defense-in-Depth Validation
- Verification Before Completion
- Database Schema & Core Tables
- Executing Plans
- Condition-Based Waiting
- helper.js
- Brainstorming Ideas Into Designs
- render-graphs.js
- stop-server.sh
- SKILL.md
- Skill Discovery Optimization (SDO)
- Bulletproofing Skills Against Rationalization
- Pressure Test 1: Emergency Production Fix
- Pressure Test 2: Sunk Cost + Exhaustion
- Pressure Test 3: Authority + Social Pressure
- Anti-Patterns
- Testing All Skill Types
- RED-GREEN-REFACTOR for Skills
- AGENTS.md
- penpot
- penpot
- codex-tools.md
- Pi Tool Mapping
- File Organization
- Skill Types
- CLAUDE.md
- React + Vite
- copilot-instructions.md
- start-server.sh
- Antigravity CLI (`agy`) Tool Mapping
- spec-document-reviewer-prompt.md
- review-package
- sdd-workspace
- task-brief
- find-polluter.sh
- test-academic.md
- plan-document-reviewer-prompt.md
- graphify.md
- graphify.md
- Design Spec: Subtle Gradient Design System
- DESIGN: Central AI Tools, MCPs, and Skills Sync (ai-tools-sync)
- Global Constraints
- ai-tools-sync
- Subtle Gradient Design System Reference Manual
- install.sh
- scripts
- src/database.js
- shravana.test.js
- Project Sanjaya: Design Specification
- Global Constraints
- Global Constraints
- src/server.js
- server-detail.test.js
- server.test.js
- manana.test.js
- Skill authoring best practices
- Skill structure
- Skill authoring best practices
- Global Constraints
- anthropic-best-practices.md
- db.py
- Evaluation and iteration
- Checklist for effective Skills
- Core principles
- AgentMessage
- LilAgentsController
- OpenClawSession
- WalkerCharacter
- TerminalView
- AgentProvider
- PaddedTextFieldCell
- CharacterSize
- CGRect
- Odysseus Hardware-Tuned macOS Installation Guide Design
- query_qa.py
- categorize.py
- AgentSession
- llm_extract.py
- scheduler.py
- lil agents
- devDependencies
- TestFinanceBotQueryQA
- Architecture Overview
- dashboard.py

## God Nodes (most connected - your core abstractions)
1. `WalkerCharacter` - 58 edges
2. `AgentMessage` - 30 edges
3. `TerminalView` - 29 edges
4. `LilAgentsController` - 25 edges
5. `OpenClawSession` - 25 edges
6. `main()` - 23 edges
7. `get_connection()` - 23 edges
8. `Writing Skills` - 23 edges
9. `AgentProvider` - 18 edges
10. `ClaudeSession` - 18 edges

## Surprising Connections (you probably didn't know these)
- `TerminalView` --references--> `AgentProvider`  [EXTRACTED]
  lil-agents/LilAgents/TerminalView.swift → lil-agents/LilAgents/AgentSession.swift
- `WalkerCharacter` --references--> `AgentProvider`  [EXTRACTED]
  lil-agents/LilAgents/WalkerCharacter.swift → lil-agents/LilAgents/AgentSession.swift
- `OpenClawSession` --references--> `AgentMessage`  [EXTRACTED]
  lil-agents/LilAgents/OpenClawSession.swift → lil-agents/LilAgents/AgentSession.swift
- `ClaudeSession` --inherits--> `AgentSession`  [EXTRACTED]
  lil-agents/LilAgents/ClaudeSession.swift → lil-agents/LilAgents/AgentSession.swift
- `CodexSession` --inherits--> `AgentSession`  [EXTRACTED]
  lil-agents/LilAgents/CodexSession.swift → lil-agents/LilAgents/AgentSession.swift

## Import Cycles
- None detected.

## Communities (121 total, 18 thin omitted)

### Community 0 - "Backend AI Initialization"
Cohesion: 0.06
Nodes (47): __dirname, __filename, initBot(), uploadDir, columns, Database, db, __dirname (+39 more)

### Community 1 - "bot.py"
Cohesion: 0.16
Nodes (30): DEFAULT_TYPE, InlineKeyboardMarkup, SimpleHTTPRequestHandler, ask_cmd(), dashboard_cmd(), debt_add_cmd(), debt_clear_cmd(), debts_list_cmd() (+22 more)

### Community 2 - "package.json"
Cohesion: 0.07
Nodes (27): dependencies, lucide-react, react, react-dom, devDependencies, oxlint, @types/react, @types/react-dom (+19 more)

### Community 3 - "db.py"
Cohesion: 0.21
Nodes (10): fs, generateLocalRAGAnswer(), { getDailyScores }, { GoogleGenAI }, handleChatQuery(), path, getDailyScores(), assert (+2 more)

### Community 4 - "Backend Dependencies"
Cohesion: 0.08
Nodes (23): axios, dependencies, axios, cheerio, cors, dotenv, express, multer (+15 more)

### Community 6 - "TestFinanceBotQueryQA"
Cohesion: 0.14
Nodes (14): dependencies, dotenv, express, @google/genai, react, react-dom, sqlite3, three (+6 more)

### Community 7 - "llm_extract.py"
Cohesion: 0.06
Nodes (55): bootstrapPage(), brandMarkup(), broadcast(), browserLauncherForPlatform(), chmodOwnerOnly(), clients, companionUrl(), computeAcceptKey() (+47 more)

### Community 8 - ".oxlintrc.json"
Cohesion: 0.15
Nodes (12): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, App(), oxc, react (+4 more)

### Community 9 - "package.json"
Cohesion: 0.17
Nodes (11): openskills, description, devDependencies, openskills, name, scripts, build, postinstall (+3 more)

### Community 10 - "categorize.py"
Cohesion: 0.18
Nodes (11): Avoid assuming tools are installed, Create verifiable intermediate outputs, MCP tool references, Next steps, Package dependencies, Returns: "OK" or lists conflicts, Runtime environment, Technical notes (+3 more)

### Community 11 - "scheduler.py"
Cohesion: 0.17
Nodes (11): 1. Executive Summary & Problem Statement, 2.1 Database Schema (`backend/database.js`), 2.2 Inactivity Auto-Pruning Engine (`backend/pruner.js`), 2. System Architecture & Database Schema, 3.1 GitHub Data Inspector (`backend/githubScraper.js`), 3.2 Gemini 2.5 Flash Deep Enrichment (`backend/gemini.js`), 3. GitHub Scraper & Gemini Enrichment Engine, 4. API Endpoints & Backend Routes (+3 more)

### Community 12 - "MultiUserHTTPRequestHandler"
Cohesion: 0.17
Nodes (12): Advanced: Skills with executable code, [Analysis Title], Anti-patterns to avoid, Avoid offering too many options, Avoid Windows-style paths, Conditional workflow pattern, Examples pattern, Executive summary (+4 more)

### Community 17 - "Test-Driven Development (TDD)"
Cohesion: 0.05
Nodes (38): Common Rationalizations, Debugging Integration, Example: Bug Fix, Final Rule, Good Tests, GREEN - Minimal Code, Overview, Red Flags - STOP and Start Over (+30 more)

### Community 18 - "Testing Skills With Subagents"
Cohesion: 0.06
Nodes (29): 1. Explicit Negation in Rules, 2. Entry in Rationalization Table, 3. Red Flag Entry, 4. Update description, Common Mistakes (Same as TDD), Example: TDD Skill Bulletproofing, GREEN Phase: Write Minimal Skill (Make It Pass), Initial Test (Failed) (+21 more)

### Community 19 - "Subagent-Driven Development"
Cohesion: 0.07
Nodes (25): Code Reviewer Prompt Template, Example Output, Example, How to Request, Integration with Workflows, Red Flags, Requesting Code Review, When to Request Review (+17 more)

### Community 20 - "Using Git Worktrees"
Cohesion: 0.10
Nodes (20): 1a. Native Worktree Tools (preferred), 1b. Git Worktree Fallback, Assuming directory location, Common Mistakes, Create the Worktree, Directory Selection, Fighting the harness, Overview (+12 more)

### Community 21 - "Visual Companion Guide"
Cohesion: 0.10
Nodes (19): Browser Events Format, Cards (visual designs), Cleaning Up, CSS Classes Available, Design Tips, File Naming, How It Works, Mock elements (wireframe building blocks) (+11 more)

### Community 22 - "Creation Log: Systematic Debugging Skill"
Cohesion: 0.10
Nodes (19): Bulletproofing Elements, Creation Log: Systematic Debugging Skill, Enhancement 1: TDD Reference, Extraction Decisions, Final Outcome, Initial Version, Iterations, Key Insight (+11 more)

### Community 23 - "Self-Hosted Telegram Personal Finance Bot & Dashboard"
Cohesion: 0.10
Nodes (19): 1. Prerequisites, 2. Install Locally, 3. Configure, 4. Run Tests, 50/30/20 Budget Taxonomy, 5. Run the Bot, Bot Commands & Usage Examples, Debts & Lending (+11 more)

### Community 24 - "Code Review Reception"
Cohesion: 0.11
Nodes (17): Acknowledging Correct Feedback, Code Review Reception, Common Mistakes, Forbidden Responses, From External Reviewers, From your human partner, GitHub Thread Replies, Gracefully Correcting Your Pushback (+9 more)

### Community 25 - "The Process"
Cohesion: 0.12
Nodes (16): Common Mistakes, Finishing a Development Branch, Option 1: Merge Locally, Option 2: Push and Create PR, Option 3: Keep As-Is, Option 4: Discard, Overview, Quick Reference (+8 more)

### Community 26 - "Systematic Debugging"
Cohesion: 0.12
Nodes (16): Common Rationalizations, Overview, Phase 1: Root Cause Investigation, Phase 2: Pattern Analysis, Phase 3: Hypothesis and Testing, Phase 4: Implementation, Quick Reference, Real-World Impact (+8 more)

### Community 27 - "Testing CLAUDE.md Skills Documentation"
Cohesion: 0.12
Nodes (16): Documentation Variants to Test, Expected Results, Next Steps, NULL (Baseline - no skills doc), Scenario 1: Time Pressure + Confidence, Scenario 2: Sunk Cost + Works Already, Scenario 3: Authority + Speed Bias, Scenario 4: Familiarity + Efficiency (+8 more)

### Community 28 - "Dispatching Parallel Agents"
Cohesion: 0.12
Nodes (15): 1. Identify Independent Domains, 2. Create Focused Agent Tasks, 3. Dispatch in Parallel, 4. Review and Integrate, Agent Prompt Structure, Common Mistakes, Dispatching Parallel Agents, Key Benefits (+7 more)

### Community 29 - "Root Cause Tracing"
Cohesion: 0.12
Nodes (15): 1. Observe the Symptom, 2. Find Immediate Cause, 3. Ask: What Called This?, 4. Keep Tracing Up, 5. Find Original Trigger, Adding Stack Traces, Finding Which Test Causes Pollution, Key Principle (+7 more)

### Community 30 - "[Analysis Title]"
Cohesion: 0.22
Nodes (10): CLAUDE_CONFIG_DIR, CLAUDE_CONFIG_PATH, __dirname, ENV_PATH, __filename, getVsCodeMcpPath(), HOME, loadSecrets() (+2 more)

### Community 31 - "Persuasion Principles for Skill Design"
Cohesion: 0.12
Nodes (15): 1. Authority, 2. Commitment, 3. Scarcity, 4. Social Proof, 5. Unity, 6. Reciprocity, 7. Liking, Ethical Use (+7 more)

### Community 32 - "Writing Skills"
Cohesion: 0.12
Nodes (16): Code Examples, Common Rationalizations for Skipping Testing, Directory Structure, Discovery Workflow, Flowchart Usage, Match the Form to the Failure, Overview, Skill Creation Checklist (TDD Adapted) (+8 more)

### Community 33 - "Writing Plans"
Cohesion: 0.15
Nodes (12): Bite-Sized Task Granularity, Execution Handoff, File Structure, No Placeholders, Overview, Plan Document Header, Remember, Scope Check (+4 more)

### Community 34 - "Defense-in-Depth Validation"
Cohesion: 0.17
Nodes (11): Applying the Pattern, Defense-in-Depth Validation, Example from Session, Key Insight, Layer 1: Entry Point Validation, Layer 2: Business Logic Validation, Layer 3: Environment Guards, Layer 4: Debug Instrumentation (+3 more)

### Community 35 - "Verification Before Completion"
Cohesion: 0.17
Nodes (11): Common Failures, Key Patterns, Overview, Rationalization Prevention, Red Flags - STOP, The Bottom Line, The Gate Function, The Iron Law (+3 more)

### Community 36 - "Database Schema & Core Tables"
Cohesion: 0.17
Nodes (11): 1. `transactions`, 2. `recurring`, 3. `pending_bills`, 4. `debts`, CLI Verification Commands, Database Schema & Core Tables, Direct Database Query (SQLite CLI), Pre-generate Dashboard HTML (+3 more)

### Community 37 - "Executing Plans"
Cohesion: 0.18
Nodes (10): Executing Plans, Integration, Overview, Remember, Step 1: Load and Review Plan, Step 2: Execute Tasks, Step 3: Complete Development, The Process (+2 more)

### Community 38 - "Condition-Based Waiting"
Cohesion: 0.20
Nodes (9): Common Mistakes, Condition-Based Waiting, Core Pattern, Implementation, Overview, Quick Patterns, Real-World Impact, When Arbitrary Timeout IS Correct (+1 more)

### Community 39 - "helper.js"
Cohesion: 0.42
Nodes (7): connect(), nextReconnectDelay(), reloadAfterRecovery(), sessionKey(), setStatus(), showTombstone(), websocketUrl()

### Community 40 - "Brainstorming Ideas Into Designs"
Cohesion: 0.22
Nodes (8): After the Design, Anti-Pattern: "This Is Too Simple To Need A Design", Brainstorming Ideas Into Designs, Checklist, Key Principles, Process Flow, The Process, Visual Companion

### Community 41 - "render-graphs.js"
Cohesion: 0.33
Nodes (8): combineGraphs(), { execSync }, extractDotBlocks(), extractGraphBody(), fs, main(), path, renderToSvg()

### Community 42 - "stop-server.sh"
Cohesion: 0.43
Nodes (4): command_has_server_id(), is_brainstorm_server(), mark_stopped(), stop-server.sh script

### Community 43 - "SKILL.md"
Cohesion: 0.33
Nodes (5): Platform Adaptation, Red Flags, Skill Priority, The Rule, User Instructions

### Community 44 - "Skill Discovery Optimization (SDO)"
Cohesion: 0.33
Nodes (6): 1. Rich Description Field, 2. Keyword Coverage, 3. Descriptive Naming, 4. Token Efficiency (Critical), 5. Cross-Referencing Other Skills, Skill Discovery Optimization (SDO)

### Community 45 - "Bulletproofing Skills Against Rationalization"
Cohesion: 0.33
Nodes (6): Address "Spirit vs Letter" Arguments, Build Rationalization Table, Bulletproofing Skills Against Rationalization, Close Every Loophole Explicitly, Create Red Flags List, Update SDO for Violation Symptoms

### Community 46 - "Pressure Test 1: Emergency Production Fix"
Cohesion: 0.40
Nodes (4): Choose A, B, or C, Pressure Test 1: Emergency Production Fix, Scenario, Your Options

### Community 47 - "Pressure Test 2: Sunk Cost + Exhaustion"
Cohesion: 0.40
Nodes (4): Choose A, B, or C, Pressure Test 2: Sunk Cost + Exhaustion, Scenario, Your Options

### Community 48 - "Pressure Test 3: Authority + Social Pressure"
Cohesion: 0.40
Nodes (4): Choose A, B, or C, Pressure Test 3: Authority + Social Pressure, Scenario, Your Options

### Community 49 - "Anti-Patterns"
Cohesion: 0.40
Nodes (5): Anti-Patterns, ❌ Code in Flowcharts, ❌ Generic Labels, ❌ Multi-Language Dilution, ❌ Narrative Example

### Community 50 - "Testing All Skill Types"
Cohesion: 0.40
Nodes (5): Discipline-Enforcing Skills (rules/requirements), Pattern Skills (mental models), Reference Skills (documentation/APIs), Technique Skills (how-to guides), Testing All Skill Types

### Community 51 - "RED-GREEN-REFACTOR for Skills"
Cohesion: 0.40
Nodes (5): GREEN: Write Minimal Skill, Micro-Test Wording Before Full Scenarios, RED-GREEN-REFACTOR for Skills, RED: Write Failing Test (Baseline), REFACTOR: Close Loopholes

### Community 52 - "AGENTS.md"
Cohesion: 0.33
Nodes (5): AGENTS, Available Skills, graphify, Penpot Integration (MCP), Subtle Gradient Design System Constraints

### Community 53 - "penpot"
Cohesion: 0.18
Nodes (16): ANDROID_SDK_ROOT, GITHUB_PERSONAL_ACCESS_TOKEN, IOS_SIMULATOR_ID, PATH, PENPOT_ACCESS_TOKEN, npx, headroom-mcp, mcp-remote (+8 more)

### Community 54 - "penpot"
Cohesion: 0.18
Nodes (16): ANDROID_SDK_ROOT, GITHUB_PERSONAL_ACCESS_TOKEN, IOS_SIMULATOR_ID, PATH, PENPOT_ACCESS_TOKEN, npx, headroom-mcp, mcp-remote (+8 more)

### Community 56 - "codex-tools.md"
Cohesion: 0.50
Nodes (3): Codex App Finishing, Environment Detection, Subagent dispatch requires multi-agent support

### Community 57 - "Pi Tool Mapping"
Cohesion: 0.50
Nodes (3): Pi Tool Mapping, Subagents, Task lists

### Community 58 - "File Organization"
Cohesion: 0.50
Nodes (4): File Organization, Self-Contained Skill, Skill with Heavy Reference, Skill with Reusable Tool

### Community 59 - "Skill Types"
Cohesion: 0.50
Nodes (4): Pattern, Reference, Skill Types, Technique

### Community 60 - "CLAUDE.md"
Cohesion: 0.50
Nodes (3): Available Skills, graphify, Penpot Integration (MCP)

### Community 61 - "React + Vite"
Cohesion: 0.50
Nodes (3): Expanding the Oxlint configuration, React Compiler, React + Vite

### Community 62 - "copilot-instructions.md"
Cohesion: 0.50
Nodes (3): Available Skills, graphify, Penpot Integration (MCP)

### Community 74 - "Design Spec: Subtle Gradient Design System"
Cohesion: 0.18
Nodes (10): 1. Overview & Principles, 2. Reusable Assets, 3. AI Assistant System Rules Integration, 4. Applying Design System to Telegram Finance Bot, 5. Verification Plan, `.agents/AGENTS.md`, Core Principles:, CSS Tokens (`subtle-gradient.css`): (+2 more)

### Community 75 - "DESIGN: Central AI Tools, MCPs, and Skills Sync (ai-tools-sync)"
Cohesion: 0.20
Nodes (9): 1. Core Architecture, 2. Directory Structure, 3. Configuration Formats, 4. Sync & Compilation Logic, 5. Automation & Trigger Mechanisms, A. The Central Registry (`registry.json`), B. Local Secrets (`~/.ai-tools.env`), DESIGN: Central AI Tools, MCPs, and Skills Sync (ai-tools-sync) (+1 more)

### Community 76 - "Global Constraints"
Cohesion: 0.33
Nodes (5): Global Constraints, Subtle Gradient Design System Integration Plan, Task 1: Create Core CSS stylesheet & Documentation, Task 2: Configure Workspace AI Rules, Task 3: Refactor Telegram Finance Bot HTML Dashboard Template

### Community 77 - "ai-tools-sync"
Cohesion: 0.50
Nodes (3): ai-tools-sync, How It Works, Setup & Installation

### Community 80 - "scripts"
Cohesion: 0.22
Nodes (8): name, scripts, build, dev:backend, dev:frontend, start, test, version

### Community 81 - "src/database.js"
Cohesion: 0.18
Nodes (11): DB_DIR, fs, getDbConnection(), path, runMigrations(), sqlite3, assert, fs (+3 more)

### Community 82 - "shravana.test.js"
Cohesion: 0.29
Nodes (3): fs, path, { spawn }

### Community 83 - "Project Sanjaya: Design Specification"
Cohesion: 0.22
Nodes (8): 1. Goal & Context, 2. Component & Directory Structure, 3. Data Protection & Scalability (Smriti Vault), 4. Scientific Behavioral Analysis (Manana Engine), 5. Subtle Gradient Dashboard UI (Darshana Dashboard), 6. Daily 1% Improvement Engine (Sadhana Loop), 7. Verification Plan, Project Sanjaya: Design Specification

### Community 84 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Project Sanjaya Implementation Plan, Task 1: Smriti Vault Schema & Migrations, Task 2: Shravana Daemon (NeoSapien Ingestion), Task 3: Manana Engine (LLM Scientific Analyzer), Task 4: API Server & 8 PM Scheduler Trigger, Task 5: Darshana Dashboard (Subtle Gradient Frontend)

### Community 85 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Project Sanjaya Scale & Design System Implementation Plan, Task 1: Smriti Schema Migration for Memories, Task 2: Update Ingestion & Manana Prompt for Top 3 Highlights, Task 3: Ingress API to Fetch Full Transcript & Date Queries, Task 4: Darshana Styling & Subtle Gradient Design System Link, Task 5: Memory Date Navigation & Full Detail Modal in UI

### Community 86 - "src/server.js"
Cohesion: 0.18
Nodes (14): saveDailyScore(), analyzeTranscript(), { analyzeTranscript }, app, express, { fetchDailyTranscripts, backupToVault }, fs, { getDailyScores, saveDailyScore } (+6 more)

### Community 87 - "server-detail.test.js"
Cohesion: 0.25
Nodes (7): app, assert, fs, path, request, { runMigrations }, test

### Community 88 - "server.test.js"
Cohesion: 0.25
Nodes (7): app, assert, fs, path, request, { runMigrations }, test

### Community 89 - "manana.test.js"
Cohesion: 0.33
Nodes (4): { GoogleGenAI }, { analyzeTranscript }, assert, test

### Community 91 - "Skill authoring best practices"
Cohesion: 0.33
Nodes (5): assert, { fetchDailyTranscripts, backupToVault }, fs, path, test

### Community 92 - "Skill structure"
Cohesion: 0.20
Nodes (10): Avoid deeply nested references, Naming conventions, Pattern 1: High-level guide with references, Pattern 2: Domain-specific organization, Pattern 3: Conditional details, Progressive disclosure patterns, Skill structure, Structure longer reference files with table of contents (+2 more)

### Community 93 - "Skill authoring best practices"
Cohesion: 0.22
Nodes (9): Avoid time-sensitive information, Common patterns, Content guidelines, Implement feedback loops, Skill authoring best practices, Template pattern, Use consistent terminology, Use workflows for complex tasks (+1 more)

### Community 94 - "Global Constraints"
Cohesion: 0.22
Nodes (8): Global Constraints, MindVault GitHub Repo Intelligence & Auto-Pruning Implementation Plan, Plan Handoff & Execution Choice, Task 1: Database Schema Extension & Helper Functions, Task 2: GitHub URL Inspector & Scraper Module, Task 3: Gemini Deep GitHub Enrichment Prompting, Task 4: Auto-Pruning Background Cron & API Integration, Task 5: Frontend React Dashboard UI Updates

### Community 95 - "anthropic-best-practices.md"
Cohesion: 0.40
Nodes (4): [Analysis Title], Executive summary, Key findings, Recommendations

### Community 96 - "db.py"
Cohesion: 0.15
Nodes (24): add_debt(), add_pending_bill(), add_recurring(), check_duplicate(), clear_debts_for_person(), delete_last_transaction(), delete_recurring(), delete_transaction() (+16 more)

### Community 97 - "Evaluation and iteration"
Cohesion: 0.50
Nodes (4): Build evaluations first, Develop Skills iteratively with the agent, Evaluation and iteration, Observe how agents navigate Skills

### Community 98 - "Checklist for effective Skills"
Cohesion: 0.50
Nodes (4): Checklist for effective Skills, Code and scripts, Core quality, Testing

### Community 99 - "Core principles"
Cohesion: 0.50
Nodes (4): Concise is key, Core principles, Set appropriate degrees of freedom, Test with all models you plan to use

### Community 100 - "AgentMessage"
Cohesion: 0.05
Nodes (41): ArraySlice, Foundation, AgentMessage, ClaudeSession, Any, Bool, Pipe, Process (+33 more)

### Community 101 - "LilAgentsController"
Cohesion: 0.07
Nodes (24): App, CoreGraphics, CVDisplayLink, Void, DockVisibility, Bool, AppDelegate, LilAgentsApp (+16 more)

### Community 102 - "OpenClawSession"
Cohesion: 0.10
Nodes (19): CryptoKit, Curve25519, Data, Int64, Role, assistant, error, toolResult (+11 more)

### Community 103 - "WalkerCharacter"
Cohesion: 0.13
Nodes (10): CFTimeInterval, ClosedRange, Any, Bool, CGFloat, Int, NSColor, WalkerCharacter (+2 more)

### Community 104 - "TerminalView"
Cohesion: 0.24
Nodes (6): Bool, String, Void, TerminalView, NSAttributedString, NSParagraphStyle

### Community 105 - "AgentProvider"
Cohesion: 0.11
Nodes (17): AgentProvider, claude, codex, copilot, gemini, openclaw, opencode, Bool (+9 more)

### Community 106 - "PaddedTextFieldCell"
Cohesion: 0.18
Nodes (12): PaddedTextFieldCell, Any, CGFloat, Int, NSColor, NSEvent, NSView, NSCoder (+4 more)

### Community 107 - "CharacterSize"
Cohesion: 0.13
Nodes (10): AppKit, AVFoundation, CaseIterable, KeyableWindow, Bool, CharacterSize, large, medium (+2 more)

### Community 108 - "CGRect"
Cohesion: 0.17
Nodes (8): AVPlayerLayer, AVPlayerLooper, AVQueuePlayer, CGRect, CharacterContentView, NSEvent, NSWindow, NSView

### Community 109 - "Odysseus Hardware-Tuned macOS Installation Guide Design"
Cohesion: 0.15
Nodes (12): 1. Prerequisites & Toolchain Setup, 2. Repository Cloning & Environment Setup, 3. Environment Configuration (`.env`), 4. Hardware-Aware Local Model Recommendation Table (16 GB RAM), 5. Execution & macOS App Wrapper, Deliverables & File Locations, Installation & Guide Content Structure, Key Design Principles & Constraints (+4 more)

### Community 110 - "query_qa.py"
Cohesion: 0.24
Nodes (8): @google/genai, get_llm_client(), any, Detects API keys and returns (provider, client/url)., execute_database_qa(), is_finance_query(), Classifies if the user's message is a natural language question or query     abo, Generates a secure SQL query to answer the user's financial question,     execut

### Community 111 - "categorize.py"
Cohesion: 0.22
Nodes (8): determine_type_and_bucket(), match_keyword_rules(), match_recurring_rules(), parse_amount(), Tries to extract a decimal or integer amount from a text string.     Example: "S, Checks the local keyword rules for counterparty keywords.     Returns (counterpa, Checks the text against active recurring item keywords.     Returns (counterpart, Helper to look up the bucket and type (credit/debit) for a valid category.

### Community 112 - "AgentSession"
Cohesion: 0.33
Nodes (3): AnyObject, AgentSession, NSMenuItem

### Community 113 - "llm_extract.py"
Cohesion: 0.47
Nodes (8): BaseModel, _extract_claude(), _extract_gemini(), _extract_local(), _extract_openai(), extract_transaction(), Calls the LLM to extract transaction details from either text or image.     Uses, TransactionExtraction

### Community 114 - "scheduler.py"
Cohesion: 0.36
Nodes (7): check_all_users_recurring(), process_due_recurring(), Scans the recurring table for a specific user, inserts due transactions into the, Asynchronous loop that runs on startup and every 4 hours.     Checks for due rec, Sends a summary notification to the user., run_scheduler(), send_summary()

### Community 115 - "lil agents"
Cohesion: 0.29
Nodes (6): building, features, license, lil agents, privacy, requirements

### Community 116 - "devDependencies"
Cohesion: 0.29
Nodes (7): devDependencies, supertest, vite, @vitejs/plugin-react, vite, @vitejs/plugin-react, supertest

### Community 118 - "Architecture Overview"
Cohesion: 0.33
Nodes (4): Architecture Overview, Building, Core Components, Key Patterns

### Community 119 - "dashboard.py"
Cohesion: 0.40
Nodes (5): generate_dashboard(), get_range_dates(), get_user_dashboard_payload(), Deprecated: Dashboard is now rendered dynamically on client request via API., Assembles the dashboard data payload (range_data, months_data, debts, pending_bi

## Knowledge Gaps
- **695 isolated node(s):** `crypto`, `http`, `fs`, `path`, `OPCODES` (+690 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `WalkerCharacter` connect `WalkerCharacter` to `LilAgentsController`, `TerminalView`, `AgentProvider`, `CharacterSize`, `CGRect`, `AgentSession`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `AgentSession` connect `AgentSession` to `AgentMessage`, `OpenClawSession`, `WalkerCharacter`, `TerminalView`, `AgentProvider`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `OpenClawSession` connect `OpenClawSession` to `AgentSession`, `AgentMessage`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `WalkerCharacter` (e.g. with `.completeOnboarding()` and `.updateEnvironmentVisibility()`) actually correct?**
  _`WalkerCharacter` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `LilAgentsController` (e.g. with `.applicationWillTerminate()` and `.switchCharacterSize()`) actually correct?**
  _`LilAgentsController` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `crypto`, `http`, `fs` to the rest of the system?**
  _695 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend AI Initialization` be split into smaller, more focused modules?**
  _Cohesion score 0.06240084611316764 - nodes in this community are weakly interconnected._