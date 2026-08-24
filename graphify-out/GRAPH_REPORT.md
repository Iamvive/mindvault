# Graph Report - ai-play-ground  (2026-08-24)

## Corpus Check
- 297 files · ~192,874 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2430 nodes · 3192 edges · 195 communities (165 shown, 30 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 121 edges (avg confidence: 0.69)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ab4acab2`
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
- scheduler.py
- Design Specification: Person Account Ledger & Collapsible Dashboard Sections
- Design Specification: Person Account Ledger & Collapsible Dashboard Sections
- Global Constraints
- second-brain-api.test.js
- Project Sanjaya: Top 3 Highlights Multi-Factor Ranking Design Specification
- scheduler.py
- Google SSO Authentication Design Specification
- Odysseus Hardware-Tuned macOS Installation Guide Design
- Global Constraints
- mcp_server.py
- devDependencies
- room-ai/frontend/package.json
- backend/src/types/room.ts
- compilerOptions
- 3. MCP Tools (Executable Functions)
- compilerOptions
- RoomAI Technical Design Specification
- Design Spec: Budget Month Tracking & Multi-Month/Overall Range Analysis
- Global Constraints
- BluetoothDevice
- llm_extract.py
- Global Constraints
- devDependencies
- wealth.js
- Budget Month Tracker Implementation Plan
- db_wealth.py
- 🏛️ Architecture Design: LLM Cost & Extraction Optimization Engine
- Per-API Endpoint Rate Limiting Specification
- Global Constraints
- scheduler.py
- Global Constraints
- Feature Specification: Auto-Logout & Session Expiration Management
- Global Constraints
- BluetoothService
- XCTest
- Global Constraints
- 2.1 Database Schema & Migrations
- PreferencesStore
- Design Specification - Wealth Monitor, Nominee Audit & Document Vault
- mcp_server.py
- get_active_user_id
- TestMCPAuth
- AudioRoutingService
- Bluetooth Device Manager (AKG Force-Connect) - macOS Menu Bar App Design Spec
- resolve_user_uuid
- Foundation
- Bluetooth Device Inspector & 1-Click Fix Engine Design Spec
- DeviceRowView
- query_qa.py
- Global Constraints
- 🎧 BTManager — macOS Bluetooth Device & Audio Manager
- Global Constraints
- Global Constraints
- OpenAI Codex & MCP Setup Design
- Global Constraints
- Global Constraints
- migrate_db
- FastMCP
- TestDatabaseSecurityMigration
- AGENTS.md
- Package.swift
- link_identity
- get_token_usage_stats
- manage_debts
- update_transaction
- update_family_contribution
- Design Specification — Zerodha Kite MCP Live OAuth & Wealth Audit Engine
- Headphone Audio & Microphone Control Suite Design Spec (v2: Stepped Rotary Dial Controls)
- Global Constraints
- Global Constraints
- Global Constraints
- dev_tools.sh
- add_debt
- build_app.sh
- setup_auto_start.sh
- stop_auto_start.sh
- server/package.json
- 3. Detailed Component & Module Specifications
- apple-cockpit/package.json
- Global Constraints
- REFACTOR Phase: Close Loopholes (Stay Green)
- TestWealthDB
- wealth_server.py
- VERIFY GREEN: Pressure Testing
- TestZerodhaSync
- Example: TDD Skill Bulletproofing
- 🍎 Apple Ecosystem Cockpit
- Anti-patterns to avoid

## God Nodes (most connected - your core abstractions)
1. `get_connection()` - 44 edges
2. `AudioControlService` - 28 edges
3. `react` - 27 edges
4. `main()` - 24 edges
5. `Writing Skills` - 23 edges
6. `TestFinanceBotPipeline` - 22 edges
7. `PreferencesStore` - 21 edges
8. `BluetoothDevice` - 20 edges
9. `TokenUsage` - 19 edges
10. `get_active_user_id()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `BTManagerApp` --calls--> `AudioRoutingService`  [INFERRED]
  bt-manager/Sources/BTManager/BTManagerApp.swift → bt-manager/Sources/BTManager/Services/AudioRoutingService.swift
- `BTManagerApp` --calls--> `BluetoothService`  [INFERRED]
  bt-manager/Sources/BTManager/BTManagerApp.swift → bt-manager/Sources/BTManager/Services/BluetoothService.swift
- `MainPopoverView` --calls--> `AudioControlService`  [INFERRED]
  bt-manager/Sources/BTManager/Views/MainPopoverView.swift → bt-manager/Sources/BTManager/Services/AudioControlService.swift
- `MainPopoverView` --calls--> `DeviceDiagnosticService`  [INFERRED]
  bt-manager/Sources/BTManager/Views/MainPopoverView.swift → bt-manager/Sources/BTManager/Services/DeviceDiagnosticService.swift
- `DummyGeminiUsage` --uses--> `TokenUsage`  [INFERRED]
  telegram-finance-bot/test_token_tracker.py → telegram-finance-bot/token_tracker.py

## Import Cycles
- None detected.

## Communities (195 total, 30 thin omitted)

### Community 0 - "Backend AI Initialization"
Cohesion: 0.06
Nodes (45): __dirname, __filename, initBot(), uploadDir, columns, Database, db, __dirname (+37 more)

### Community 1 - "bot.py"
Cohesion: 0.05
Nodes (65): InlineKeyboardMarkup, SimpleHTTPRequestHandler, main(), post_init(), determine_type_and_bucket(), extract_target_budget_month(), match_bank_sms_rules(), match_keyword_rules() (+57 more)

### Community 2 - "package.json"
Cohesion: 0.07
Nodes (27): dependencies, lucide-react, react, react-dom, devDependencies, oxlint, @types/react, @types/react-dom (+19 more)

### Community 3 - "db.py"
Cohesion: 0.21
Nodes (10): fs, generateLocalRAGAnswer(), { getDailyScores }, { GoogleGenAI }, handleChatQuery(), path, getDailyScores(), assert (+2 more)

### Community 4 - "Backend Dependencies"
Cohesion: 0.08
Nodes (25): axios, dependencies, axios, cheerio, cors, dotenv, express, @google/generative-ai (+17 more)

### Community 5 - "TestFinanceBotPipeline"
Cohesion: 0.08
Nodes (10): get_client_ip(), Any, RateLimiter, TestFinanceBotPipeline, DummyHandler, test_get_client_ip_fallback(), test_get_client_ip_forwarded_for(), test_get_client_ip_real_ip() (+2 more)

### Community 6 - "TestFinanceBotQueryQA"
Cohesion: 0.07
Nodes (28): @google/genai, dependencies, dotenv, express, @google/genai, react, react-dom, three (+20 more)

### Community 7 - "llm_extract.py"
Cohesion: 0.06
Nodes (55): bootstrapPage(), brandMarkup(), broadcast(), browserLauncherForPlatform(), chmodOwnerOnly(), clients, companionUrl(), computeAcceptKey() (+47 more)

### Community 8 - ".oxlintrc.json"
Cohesion: 0.05
Nodes (40): App(), DeskArrangement(), DiagnosticCenter(), Header(), MasterPlaybook(), QuickActionDock(), TopologyRadar(), useCockpitState() (+32 more)

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
Cohesion: 0.15
Nodes (13): Advanced: Skills with executable code, [Analysis Title], Build evaluations first, Conditional workflow pattern, Develop Skills iteratively with the agent, Evaluation and iteration, Examples pattern, Executive summary (+5 more)

### Community 17 - "Test-Driven Development (TDD)"
Cohesion: 0.05
Nodes (38): Common Rationalizations, Debugging Integration, Example: Bug Fix, Final Rule, Good Tests, GREEN - Minimal Code, Overview, Red Flags - STOP and Start Over (+30 more)

### Community 18 - "Testing Skills With Subagents"
Cohesion: 0.13
Nodes (13): Common Mistakes (Same as TDD), GREEN Phase: Write Minimal Skill (Make It Pass), Meta-Testing (When GREEN Isn't Working), Overview, Quick Reference (TDD Cycle), Real-World Impact, RED Phase: Baseline Testing (Watch It Fail), TDD Mapping for Skill Testing (+5 more)

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
Cohesion: 0.15
Nodes (12): AGENTS, Available Skills, Before claiming something is done, Before writing code, Coding Guidelines for AI Agents, graphify, Penpot Integration (MCP), Security basics (+4 more)

### Community 53 - "penpot"
Cohesion: 0.18
Nodes (18): ANDROID_SDK_ROOT, GITHUB_PERSONAL_ACCESS_TOKEN, IOS_SIMULATOR_ID, PATH, PENPOT_ACCESS_TOKEN, npx, headroom-mcp, mcp-remote (+10 more)

### Community 54 - "penpot"
Cohesion: 0.18
Nodes (18): ANDROID_SDK_ROOT, GITHUB_PERSONAL_ACCESS_TOKEN, IOS_SIMULATOR_ID, PATH, PENPOT_ACCESS_TOKEN, npx, headroom-mcp, mcp-remote (+10 more)

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
Cohesion: 0.09
Nodes (19): 🛡️ Emergency Rollback Plan, 🚀 Implementation Plan: Rebranding to WealthWise, 🎯 Objectives & Constraints, Phase 1: Preparation & Local Git Setup, Phase 2: Codebase & UI Branding, Phase 3: Infrastructure & Server Migration, Phase 4: Bot Identity & User Verification, 📋 Task Checklist & Execution Steps (+11 more)

### Community 81 - "src/database.js"
Cohesion: 0.16
Nodes (22): DB_DIR, fs, getActionItems(), getDailyDigest(), getDbConnection(), getEntities(), indexTranscriptFTS(), path (+14 more)

### Community 82 - "shravana.test.js"
Cohesion: 0.15
Nodes (10): backupToVault(), fetchDailyTranscripts(), fs, path, { spawn }, assert, { fetchDailyTranscripts, backupToVault }, fs (+2 more)

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
Cohesion: 0.22
Nodes (8): { analyzeTranscript }, app, express, { fetchDailyTranscripts, backupToVault }, fs, { handleChatQuery }, path, {
  runMigrations,
  getDailyScores,
  saveDailyScore,
  saveActionItems,
  getActionItems,
  toggleActionItem,
  saveEntities,
  getEntities,
  saveDailyDigest,
  getDailyDigest,
  indexTranscriptFTS,
  searchTranscriptsFTS
}

### Community 87 - "server-detail.test.js"
Cohesion: 0.25
Nodes (7): app, assert, fs, path, request, { runMigrations }, test

### Community 88 - "server.test.js"
Cohesion: 0.25
Nodes (7): app, assert, fs, path, request, { runMigrations }, test

### Community 89 - "manana.test.js"
Cohesion: 0.33
Nodes (5): analyzeTranscript(), { GoogleGenAI }, { analyzeTranscript }, assert, test

### Community 91 - "Skill authoring best practices"
Cohesion: 0.22
Nodes (8): 1. Vision & Executive Summary, 2. Directory Structure & Architecture, 3. Database Schema (Migration 003), 4. Manana Engine Gemini Extraction Specification, 5. Express API Endpoints (`src/server.js`), 6. Darshana Dashboard UI Structure, 7. Verification & Testing Strategy, Project Sanjaya: Comprehensive Second Brain & Behavioral Growth Design Specification

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
Cohesion: 0.10
Nodes (41): add_debt(), add_pending_bill(), add_recurring(), check_duplicate(), clear_debts_for_person(), create_temp_login_code(), create_user_pat(), create_user_session() (+33 more)

### Community 97 - "Evaluation and iteration"
Cohesion: 0.07
Nodes (39): actionsRouter, app, broadcastInterval, broadcastTelemetry(), cors, devicesRouter, diagnosticsRouter, express (+31 more)

### Community 98 - "Checklist for effective Skills"
Cohesion: 0.50
Nodes (4): Checklist for effective Skills, Code and scripts, Core quality, Testing

### Community 99 - "Core principles"
Cohesion: 0.50
Nodes (4): Concise is key, Core principles, Set appropriate degrees of freedom, Test with all models you plan to use

### Community 100 - "scheduler.py"
Cohesion: 0.25
Nodes (7): Global Constraints, Sanjaya Second Brain System Implementation Plan, Task 1: Database Migration 003 & Data Access Methods, Task 2: Manana Engine Second Brain Extraction, Task 3: Express API Server Second Brain Endpoints, Task 4: Darshana UI React Components (Subtle Gradient Design), Task 5: End-to-End Verification & Full Test Suite Pass

### Community 101 - "Design Specification: Person Account Ledger & Collapsible Dashboard Sections"
Cohesion: 0.15
Nodes (12): 1.1 Overview & Requirements, 1.2 Debts Tracker Card UI, 1.3 Person Account Statement Drawer (`#person-ledger-drawer`), 1. Person Account Ledger (Debts Tracker), 2.1 Overview & Requirements, 2.2 Sections with Collapse Support, 2.3 UI & State Persistence, 2. Collapsible Dashboard Sections (+4 more)

### Community 102 - "Design Specification: Person Account Ledger & Collapsible Dashboard Sections"
Cohesion: 0.15
Nodes (12): 1.1 Overview & Requirements, 1.2 Debts Tracker Card UI, 1.3 Person Account Statement Drawer (`#person-ledger-drawer`), 1. Person Account Ledger (Debts Tracker), 2.1 Overview & Requirements, 2.2 Sections with Collapse Support, 2.3 UI & State Persistence, 2. Collapsible Dashboard Sections (+4 more)

### Community 103 - "Global Constraints"
Cohesion: 0.33
Nodes (5): Global Constraints, Person Account Ledger & Collapsible Dashboard Sections Implementation Plan, Task 1: Add Collapsible Card Controls & State Persistence, Task 2: Build Person Account Ledger Drawer (`#person-ledger-drawer`) & Running Balance UI, Task 3: Automated Verification & Unit Tests

### Community 104 - "second-brain-api.test.js"
Cohesion: 0.29
Nodes (6): runMigrations(), app, assert, { runMigrations }, supertest, test

### Community 105 - "Project Sanjaya: Top 3 Highlights Multi-Factor Ranking Design Specification"
Cohesion: 0.29
Nodes (6): 1. Goal, 2. Multi-Factor Scoring Model (Model 1), 3. Fallback Heuristic Ranking, 4. UI Dashboard Display, Composite Score Formula, Project Sanjaya: Top 3 Highlights Multi-Factor Ranking Design Specification

### Community 107 - "scheduler.py"
Cohesion: 0.10
Nodes (20): 1. Overview & Goal, 2.1 Core Identity Tables, 2.2 Financial Domain Tables Schema Update, 2. Database Schema Design, 3.1 Data Backfill Protocol (`migrate_db()`), 3.2 Backward-Compatible Identity Resolution (`resolve_user_uuid`), 3. Migration Strategy & Zero-Breakage Guarantees, 4.1 Google SSO Flow (`/api/auth/google`) (+12 more)

### Community 108 - "Google SSO Authentication Design Specification"
Cohesion: 0.09
Nodes (21): 1. Overview & Goal, 2. Architecture & Authentication Flow, 3.1 Database Schema (`db.py`), 3.2 Backend Server (`handlers/http_server.py`), 3.3 Frontend Dashboard (`dashboard/template.html` / `dashboard.html`), 3.4 Telegram Bot Commands (`handlers/commands.py`), 3. Detailed Component & Schema Changes, 4. Security & Safety Principles (+13 more)

### Community 109 - "Odysseus Hardware-Tuned macOS Installation Guide Design"
Cohesion: 0.15
Nodes (12): 1. Prerequisites & Toolchain Setup, 2. Repository Cloning & Environment Setup, 3. Environment Configuration (`.env`), 4. Hardware-Aware Local Model Recommendation Table (16 GB RAM), 5. Execution & macOS App Wrapper, Deliverables & File Locations, Installation & Guide Content Structure, Key Design Principles & Constraints (+4 more)

### Community 110 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Global Constraints, Google SSO Authentication Implementation Plan, Task 1: Database Migration & Session Management (`db.py`), Task 2: Backend Google SSO Verification & Session Middleware (`handlers/http_server.py`), Task 3: Web Dashboard Frontend Google SSO Interface (`dashboard/template.html`), Task 4: Telegram `/dashboard` Command & Full End-to-End Verification

### Community 112 - "devDependencies"
Cohesion: 0.05
Nodes (37): dependencies, cors, dotenv, express, @google/generative-ai, multer, sharp, description (+29 more)

### Community 113 - "room-ai/frontend/package.json"
Cohesion: 0.07
Nodes (26): dependencies, lucide-react, react, react-dom, devDependencies, @types/react, @types/react-dom, typescript (+18 more)

### Community 114 - "backend/src/types/room.ts"
Cohesion: 0.16
Nodes (14): app, router, upload, getRecommendations(), analyzeRoomPhoto(), generateMakeoverImage(), DetectedFurniture, EstimatedFreeSpace (+6 more)

### Community 115 - "compilerOptions"
Cohesion: 0.09
Nodes (21): DOM, DOM.Iterable, ES2020, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib (+13 more)

### Community 116 - "3. MCP Tools (Executable Functions)"
Cohesion: 0.12
Nodes (16): 1. Executive Summary, 2. System Architecture, 3.1. `add_transaction`, 3.2. `get_budget_summary`, 3.3. `query_transactions`, 3.4. `update_transaction`, 3.5. `delete_transaction`, 3.6. `manage_debts` (+8 more)

### Community 117 - "compilerOptions"
Cohesion: 0.12
Nodes (15): ES2022, compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution, outDir (+7 more)

### Community 118 - "RoomAI Technical Design Specification"
Cohesion: 0.14
Nodes (13): 1. Overview & Goal, 2. Architecture & Tech Stack, 3. Directory & File Structure, 4. API Specifications, 5. Vision Analysis & Image Generation Prompts, 6. Curated Catalog Schema (`data/furnitureCatalog.json`), 7. Verification & Testing Plan, Gemini Vision Prompt Schema (+5 more)

### Community 119 - "Design Spec: Budget Month Tracking & Multi-Month/Overall Range Analysis"
Cohesion: 0.14
Nodes (13): 1. Database Schema Changes (`db.py`), 2. Text Parsing & Target Month Assignment (`categorize.py` & `llm_extract.py`), 3. Telegram Interaction & Inline Keyboards (`handlers/messages.py` & `handlers/callbacks.py`), 4. Web Dashboard & Scope Switching (`dashboard.py` & `template.html`), 5. Verification & Testing (`test_pipeline.py`), Database Helpers, Default & Range Options, Design Spec: Budget Month Tracking & Multi-Month/Overall Range Analysis (+5 more)

### Community 120 - "Global Constraints"
Cohesion: 0.17
Nodes (11): Global Constraints, Plan Verification Check, RoomAI Implementation Plan, Task 1: RoomAI Project Scaffolding & Shared Types, Task 2: Static Curated Catalog & Recommendation Matcher Service, Task 3: Gemini Flash Vision Analysis Service & Endpoint, Task 4: AI Makeover Generator Service & Endpoints, Task 5: Frontend Design System & Theme CSS (+3 more)

### Community 121 - "BluetoothDevice"
Cohesion: 0.11
Nodes (24): BluetoothDevice, DeviceType, headphones, keyboard, mouse, speaker, unknown, Bool (+16 more)

### Community 122 - "llm_extract.py"
Cohesion: 0.16
Nodes (29): _extract_claude(), _extract_gemini(), _extract_local(), _extract_openai(), extract_transaction(), BaseModel, Calls the LLM to extract transaction details from either text or image.     Uses, TransactionExtraction (+21 more)

### Community 123 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Global Constraints, Task 1: Environment Setup & MCP Dependency, Task 2: Implement MCP Server Core, Resources, and Prompts, Task 3: Implement MCP Tools (Transaction CRUD, Debts, Recurring), Task 4: Automated Test Suite & Verification, Telegram Finance Bot MCP Server Implementation Plan

### Community 124 - "devDependencies"
Cohesion: 0.11
Nodes (18): 1. Executive Summary, 2.1 Database Schema (`db.py`), 2.2 Database Query Helper Functions, 2. Architecture & Data Model, 3.1 Data Model, 3.2 Pricing Matrix (per 1M tokens), 3.3 Provider Token Normalization Logic, 3. Token Normalization & Pricing Module (`token_tracker.py`) (+10 more)

### Community 125 - "wealth.js"
Cohesion: 0.16
Nodes (26): addNewFamilyTransaction(), closeAssetModal(), closeLiabilityModal(), deleteDocument(), editFamilyTransaction(), filterFamilyTransactions(), formatINR(), getSessionToken() (+18 more)

### Community 126 - "Budget Month Tracker Implementation Plan"
Cohesion: 0.33
Nodes (5): Budget Month Tracker Implementation Plan, Task 1: Database Migration & Core Queries (`db.py`), Task 2: Target Month Natural Language Extraction (`categorize.py` & `llm_extract.py`), Task 3: Telegram Message Confirmation & Inline Callback Buttons (`handlers/messages.py` & `handlers/callbacks.py`), Task 4: Web Dashboard Payload & Range Filtering (`dashboard.py` & `dashboard/template.html`)

### Community 128 - "db_wealth.py"
Cohesion: 0.13
Nodes (11): BehavioralInsight, calculate_monthly_expense_rate(), generate_wealth_audit(), NomineeSuggestion, Any, BaseModel, RefinanceAlert, WealthAuditReport (+3 more)

### Community 129 - "🏛️ Architecture Design: LLM Cost & Extraction Optimization Engine"
Cohesion: 0.18
Nodes (10): 1. Bank & UPI SMS Regex Engine (`categorize.py`), 2. Dual-Model Routing (`llm_extract.py`), 3. Gemini Context Caching (`llm_extract.py`), 4. Telemetry & Cost Accounting (`token_tracker.py`), 🏛️ Architecture Design: LLM Cost & Extraction Optimization Engine, 🎯 Architecture Goals & Success Metrics, 📄 Component Specifications, 📌 Executive Summary (+2 more)

### Community 130 - "Per-API Endpoint Rate Limiting Specification"
Cohesion: 0.20
Nodes (9): 1. Executive Summary, 2.1 Route Quota Tiers, 2.2 Client IP Resolution (`get_client_ip`), 2. Architecture & Rate Limiting Tiers, 3.1 HTTP 429 Response Format, 3. Application-Level Rate Limiter (`handlers/http_server.py`), 4. Edge Proxy Configuration (`Caddyfile`), 5. Test & Verification Plan (+1 more)

### Community 131 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Task 1: Database Migration & Persistence Helpers (`db.py`), Task 2: Token Normalization & Pricing Engine (`token_tracker.py`), Task 3: Subsystem Instrumentation (`llm_extract.py`, `handlers/messages.py`, `query_qa.py`), Task 4: Telegram `/tokens` Command Handler (`handlers/commands.py` & `bot.py`), Task 5: Dashboard API Endpoint (`dashboard.py`) & MCP Tool (`mcp_server.py`), Token Usage Instrumentation Implementation Plan

### Community 132 - "scheduler.py"
Cohesion: 0.36
Nodes (7): check_all_users_recurring(), process_due_recurring(), Scans the recurring table for a specific user, inserts due transactions into the, Asynchronous loop that runs on startup and every 4 hours.     Checks for due rec, Sends a summary notification to the user., run_scheduler(), send_summary()

### Community 133 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Enterprise User UUID & Identity Architecture Implementation Plan, Global Constraints, Task 1: Database Migration & Identity Schema, Task 2: Identity Resolution & Helper Functions, Task 3: Update API Endpoints & Auth Handlers, Task 4: Complete Domain Query Compatibility & Deploy Verification

### Community 134 - "Feature Specification: Auto-Logout & Session Expiration Management"
Cohesion: 0.29
Nodes (6): 1. Goal, 2.1 Backend Expiration Verification (`handlers/http_server.py` & `db.py`), 2.2 Client-Side Global Interceptor (`dashboard/template.html`), 2. Technical Architecture, 3. Implementation Checklist, Feature Specification: Auto-Logout & Session Expiration Management

### Community 135 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Global Constraints, LLM Cost & Extraction Optimization Engine Implementation Plan, 🧪 Plan Self-Review & Verification, Task 1: Indian Bank & UPI Fast-Log Regex Engine, Task 2: Dual-Model Routing & Context Caching in `llm_extract.py`, Task 3: Pricing Table & Cost Accounting Update

### Community 136 - "BluetoothService"
Cohesion: 0.28
Nodes (6): BluetoothService, Bool, Int, String, Void, BluetoothServiceTests

### Community 137 - "XCTest"
Cohesion: 0.13
Nodes (9): AudioRoutingServiceTests, AutoReconnectWatcherTests, BTManagerSanityTests, DeviceDiagnosticReportTests, EQPresetTests, FixActionsServiceTests, BTManager, XCTest (+1 more)

### Community 138 - "Global Constraints"
Cohesion: 0.33
Nodes (5): Global Constraints, Per-API Endpoint Rate Limiting Implementation Plan, Task 1: RateLimiter & IP Resolution Module (`rate_limiter.py`), Task 2: HTTP Server Middleware Integration (`handlers/http_server.py`), Task 3: Edge Proxy Configuration & Deployment Sync (`Caddyfile`, `sync_to_vps.sh`)

### Community 139 - "2.1 Database Schema & Migrations"
Cohesion: 0.12
Nodes (16): 1. Overview, 2.1 Database Schema & Migrations, 2.2 API Endpoints, 2.3 Authentication Layer, 2.4 Web Dashboard UI, 2. Proposed Changes, 3.1 Automated Tests, 3.2 Manual Verification (+8 more)

### Community 140 - "PreferencesStore"
Cohesion: 0.15
Nodes (14): App, BTManagerApp, AutoReconnectWatcher, Bool, PreferencesStore, Bool, String, PreferencesStoreTests (+6 more)

### Community 141 - "Design Specification - Wealth Monitor, Nominee Audit & Document Vault"
Cohesion: 0.12
Nodes (15): 1. Goal & Context, 2. Directory & Module Boundaries, 3. Database Schema (finance.db additions), 4. API Endpoints, 5. AI Audit Engine (manana_wealth.py), 6. Frontend Layout & CSS Styling, 7. Verification Plan, CRUD Updates (+7 more)

### Community 142 - "mcp_server.py"
Cohesion: 0.14
Nodes (15): expense_audit_prompt(), fetch_family_transactions(), get_family_contributions_ledger(), get_family_ledger_resource(), get_finance_taxonomy_resource(), manage_recurring(), monthly_budget_review_prompt(), query_transactions() (+7 more)

### Community 143 - "get_active_user_id"
Cohesion: 0.13
Nodes (16): add_family_contribution(), add_transaction(), delete_transaction(), get_active_user_id(), get_budget_summary(), get_default_user_id(), get_finance_debts_resource(), get_finance_summary_resource() (+8 more)

### Community 144 - "TestMCPAuth"
Cohesion: 0.19
Nodes (3): TokenAuthMiddleware, MockApp, TestMCPAuth

### Community 145 - "AudioRoutingService"
Cohesion: 0.24
Nodes (9): AudioRoutingService, Bool, String, FixActionsService, Bool, DeviceRowView, Bool, MainPopoverView (+1 more)

### Community 146 - "Bluetooth Device Manager (AKG Force-Connect) - macOS Menu Bar App Design Spec"
Cohesion: 0.15
Nodes (12): 1. Executive Summary & Problem Statement, 2. System Architecture & Components, 3. Bluetooth & Audio Reconnection Logic, 4. User Interface & Menu Bar Panel Design, 5. Storage, Permissions & Error Handling, 6. Verification & Testing Plan, Auto-Reconnect Watchdog, Bluetooth Device Manager (AKG Force-Connect) - macOS Menu Bar App Design Spec (+4 more)

### Community 147 - "resolve_user_uuid"
Cohesion: 0.29
Nodes (10): get_ledger(), get_monthly_budget_summary(), get_or_create_user_by_identity(), get_recent_transactions(), get_token_usage_summary(), Any, Translates any input identifier (user_uuid, telegram_user_id int/str, or google_, Resolves or creates a user_uuid for a given provider and provider_uid. (+2 more)

### Community 148 - "Foundation"
Cohesion: 0.14
Nodes (9): AVFoundation, EQPreset, Double, String, Combine, CoreAudio, Foundation, Hashable (+1 more)

### Community 149 - "Bluetooth Device Inspector & 1-Click Fix Engine Design Spec"
Cohesion: 0.18
Nodes (10): 1. Executive Summary & Goal, 2. System Architecture & Components, 3. Inspection Rules & 1-Click Fix Actions by Device Category, 4. User Interface & Expandable Card Specification, 5. Verification & Test Plan, Bluetooth Device Inspector & 1-Click Fix Engine Design Spec, 🎧 Headphones & Audio Devices (AKG, eBuddies, Buds), ⌨️ Keyboards (Keychron K6, Wireless Keyboards) (+2 more)

### Community 150 - "DeviceRowView"
Cohesion: 0.11
Nodes (12): AppKit, AppDelegate, RotaryKnobView, Double, String, Void, CGFloat, Color (+4 more)

### Community 151 - "query_qa.py"
Cohesion: 0.09
Nodes (20): AVAudioEngine, AudioControlService, BassBoostStep, high, low, med, off, SidetoneStep (+12 more)

### Community 152 - "Global Constraints"
Cohesion: 0.20
Nodes (9): Bluetooth Device Manager (`bt-manager`) Implementation Plan, Execution Handoff, Global Constraints, Task 1: Project Scaffolding & macOS Executable Setup, Task 2: Data Models & `PreferencesStore` Layer, Task 3: Core `BluetoothService` & Force Connect Engine, Task 4: `AudioRoutingService` (macOS CoreAudio Integration), Task 5: `AutoReconnectWatcher` Background Daemon (+1 more)

### Community 153 - "🎧 BTManager — macOS Bluetooth Device & Audio Manager"
Cohesion: 0.18
Nodes (10): 1. Clone the Repository, 2. Build and Package Native App Bundle, 3. Launch App (One-Off), 4. ⚡ Make It Persistent (Always Run & Never Disappear), 🎧 BTManager — macOS Bluetooth Device & Audio Manager, 📦 Building & Running Locally, 📖 How to Use, 🌟 Key Features (+2 more)

### Community 155 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Bluetooth Device Inspector & 1-Click Fix Engine Implementation Plan, Execution Handoff, Global Constraints, Task 1: Data Models (`DeviceDiagnosticReport` & `DiagnosticIssue`), Task 2: `DeviceDiagnosticService` Inspection Engine, Task 3: 1-Click Fix Actions Engine (`FixActionsService`), Task 4: UI Components (`DiagnosticCardView` & Expandable `DeviceRowView`)

### Community 156 - "Global Constraints"
Cohesion: 0.25
Nodes (7): Global Constraints, Task 1: Database Migration & Schema Setup, Task 2: API Endpoints & Request Handlers, Task 3: Secure Document Vault Upload & Stream, Task 4: AI Audit Engine & Prompts, Task 5: Frontend UI & Tab Integration, Wealth Monitor Implementation Plan

### Community 157 - "OpenAI Codex & MCP Setup Design"
Cohesion: 0.25
Nodes (7): 1. System Requirements & Prerequisites, 2. Installation Plan, 3. Codex MCP Server Configuration, 4. Authentication Flow, 5. Verification Checklist, OpenAI Codex & MCP Setup Design, Overview

### Community 158 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Decoupling User IDs and Securing MCP Server Implementation Plan, Global Constraints, Task 1: Database Migrations and Helper Functions, Task 2: Securing the MCP Server Auth Layer, Task 3: HTTP Server API Endpoints, Task 4: Web Dashboard settings Tab UI

### Community 159 - "Global Constraints"
Cohesion: 0.33
Nodes (5): Global Constraints, OpenAI Codex CLI & MCP Setup Implementation Plan, Task 1: Install OpenAI Codex CLI & MCP Server Packages Globally, Task 2: Configure MCP Servers in `~/.codex/config.toml`, Task 3: Verify Codex Installation & MCP Server Registration

### Community 160 - "migrate_db"
Cohesion: 0.07
Nodes (29): dependencies, lucide-react, react, react-dom, devDependencies, jsdom, @testing-library/jest-dom, @testing-library/react (+21 more)

### Community 163 - "AGENTS.md"
Cohesion: 0.50
Nodes (3): Available Skills, graphify, Penpot Integration (MCP)

### Community 166 - "link_identity"
Cohesion: 0.12
Nodes (10): sqlite3, sqlite3, get_llm_client(), any, Detects API keys and returns (provider, client/url)., execute_database_qa(), is_finance_query(), Classifies if the user's message is a natural language question or query     abo (+2 more)

### Community 171 - "Design Specification — Zerodha Kite MCP Live OAuth & Wealth Audit Engine"
Cohesion: 0.18
Nodes (10): 1. Overview & Context, 2. Architecture & Data Flow, 3.1 Zerodha Kite OAuth Sync Session, 3.2 Portfolio Aggregation & Cash Flow Baseline, 3.3 Audit Metrics & Behavioral Intelligence, 3. Detailed Component Specifications, 4. Verification Plan, Automated Verification (+2 more)

### Community 172 - "Headphone Audio & Microphone Control Suite Design Spec (v2: Stepped Rotary Dial Controls)"
Cohesion: 0.25
Nodes (7): 1. Executive Summary & Goal, 2. Stepped Rotary Dial Specifications, 3. UI Component Architecture, 4. Verification & Test Plan, 🔊 Bass Boost Rotary Dial (`BassLevel`), Headphone Audio & Microphone Control Suite Design Spec (v2: Stepped Rotary Dial Controls), 🎧 Mic Sidetone Rotary Dial (`SidetoneLevel`)

### Community 173 - "Global Constraints"
Cohesion: 0.29
Nodes (6): Execution Handoff, Global Constraints, Headphone Audio & Microphone Control Suite Implementation Plan, Task 1: Data Models (`EQPreset.swift`), Task 2: `AudioControlService` & `GlobalHotkeyService` Core Engines, Task 3: UI Components (`HeadphoneAudioControlView.swift` & Integration)

### Community 174 - "Global Constraints"
Cohesion: 0.33
Nodes (5): Execution Handoff, Global Constraints, Stepped Rotary Dial Controls Implementation Plan, Task 1: Enums & `AudioControlService` Stepped API, Task 2: Interactive `RotaryKnobView` UI Component

### Community 175 - "Global Constraints"
Cohesion: 0.40
Nodes (4): Global Constraints, Task 1: Zerodha OAuth Sync & Asset Upsert Engine, Task 2: Wealth Check-Up Audit Engine Test & Validation, Zerodha Kite OAuth Sync & Wealth Check-Up Implementation Plan

### Community 177 - "add_debt"
Cohesion: 0.28
Nodes (15): add_nominee_item(), add_wealth_asset(), add_wealth_document(), add_wealth_liability(), delete_wealth_document(), get_connection(), get_nominee_checklist(), get_wealth_assets() (+7 more)

### Community 181 - "server/package.json"
Cohesion: 0.13
Nodes (14): dependencies, cors, express, ws, description, cors, express, main (+6 more)

### Community 182 - "3. Detailed Component & Module Specifications"
Cohesion: 0.14
Nodes (13): 1. Overview & Vision, 2.1 Backend Engine (Node.js & Express), 2.2 Frontend Application (React + Vite), 2. Architecture & Tech Stack, 3.1 🌐 Topology & Device Radar (`TopologyRadar.jsx`), 3.2 📐 Desk & Display Studio (`DeskArrangement.jsx`), 3.3 🩺 Diagnostic Center & 1-Tap Auto-Heal (`DiagnosticCenter.jsx`), 3.4 📖 Master Playbook & Interactive Cheat-Sheets (`MasterPlaybook.jsx`) (+5 more)

### Community 183 - "apple-cockpit/package.json"
Cohesion: 0.18
Nodes (10): description, devDependencies, concurrently, name, scripts, dev, start, test (+2 more)

### Community 184 - "Global Constraints"
Cohesion: 0.20
Nodes (9): Apple Ecosystem Cockpit Implementation Plan, Global Constraints, Task 1: Project Scaffolding & Root Configuration, Task 2: Backend Engine — Services & macOS Diagnostic Probing, Task 3: Backend Express & WebSocket API Server, Task 4: Frontend Scaffolding, Design System & State Management, Task 5: Core UI Components (Topology Radar, Desk Studio, Diagnostics Center), Task 6: Master Playbook, Quick Action Dock & Main App Assembly (+1 more)

### Community 185 - "REFACTOR Phase: Close Loopholes (Stay Green)"
Cohesion: 0.29
Nodes (7): 1. Explicit Negation in Rules, 2. Entry in Rationalization Table, 3. Red Flag Entry, 4. Update description, Plugging Each Hole, Re-verify After Refactoring, REFACTOR Phase: Close Loopholes (Stay Green)

### Community 187 - "wealth_server.py"
Cohesion: 0.47
Nodes (3): extract_boundary(), handle_wealth_upload(), parse_multipart()

### Community 188 - "VERIFY GREEN: Pressure Testing"
Cohesion: 0.40
Nodes (5): Key Elements of Good Scenarios, Pressure Types, Testing Setup, VERIFY GREEN: Pressure Testing, Writing Pressure Scenarios

### Community 190 - "Example: TDD Skill Bulletproofing"
Cohesion: 0.50
Nodes (4): Example: TDD Skill Bulletproofing, Initial Test (Failed), Iteration 1 - Add Counter, Iteration 2 - Add Foundational Principle

### Community 192 - "🍎 Apple Ecosystem Cockpit"
Cohesion: 0.50
Nodes (3): 🍎 Apple Ecosystem Cockpit, 🌟 Key Features, 🚀 Quick Start (1-Click Launch)

### Community 193 - "Anti-patterns to avoid"
Cohesion: 0.67
Nodes (3): Anti-patterns to avoid, Avoid offering too many options, Avoid Windows-style paths

## Knowledge Gaps
- **1131 isolated node(s):** `crypto`, `http`, `fs`, `path`, `OPCODES` (+1126 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `TestFinanceBotQueryQA` to `link_identity`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `sqlite3` connect `link_identity` to `db.py`, `add_debt`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Why does `sqlite3` connect `link_identity` to `TestFinanceBotQueryQA`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `AudioControlService` (e.g. with `MainPopoverView` and `.testBassBoostStepCycling()`) actually correct?**
  _`AudioControlService` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 21 inferred relationships involving `main()` (e.g. with `handle_callback_query()` and `ask_cmd()`) actually correct?**
  _`main()` has 21 INFERRED edges - model-reasoned connections that need verification._
- **What connects `crypto`, `http`, `fs` to the rest of the system?**
  _1131 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend AI Initialization` be split into smaller, more focused modules?**
  _Cohesion score 0.06440677966101695 - nodes in this community are weakly interconnected._