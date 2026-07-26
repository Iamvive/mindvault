# Graph Report - ai-play-ground  (2026-07-22)

## Corpus Check
- 98 files · ~81,515 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 900 nodes · 1045 edges · 74 communities (59 shown, 15 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.52)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `faee3734`
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

## God Nodes (most connected - your core abstractions)
1. `main()` - 23 edges
2. `get_connection()` - 23 edges
3. `Writing Skills` - 23 edges
4. `Testing Skills With Subagents` - 16 edges
5. `Code Review Reception` - 15 edges
6. `Subagent-Driven Development` - 15 edges
7. `Test-Driven Development (TDD)` - 15 edges
8. `handleRequest()` - 14 edges
9. `TestFinanceBotPipeline` - 14 edges
10. `Testing Anti-Patterns` - 13 edges

## Surprising Connections (you probably didn't know these)
- `execute_database_qa()` --calls--> `get_llm_client()`  [INFERRED]
  telegram-finance-bot/query_qa.py → telegram-finance-bot/llm_extract.py
- `is_finance_query()` --calls--> `get_llm_client()`  [INFERRED]
  telegram-finance-bot/query_qa.py → telegram-finance-bot/llm_extract.py
- `initBot()` --references--> `Database`  [EXTRACTED]
  backend/bot.js → backend/database.js
- `initBot()` --calls--> `enrichDocumentMetadata()`  [EXTRACTED]
  backend/bot.js → backend/gemini.js
- `initBot()` --calls--> `enrichResourceMetadata()`  [EXTRACTED]
  backend/bot.js → backend/gemini.js

## Import Cycles
- None detected.

## Communities (74 total, 15 thin omitted)

### Community 0 - "Backend AI Initialization"
Cohesion: 0.10
Nodes (29): __dirname, __filename, initBot(), uploadDir, Database, db, __dirname, __filename (+21 more)

### Community 1 - "bot.py"
Cohesion: 0.16
Nodes (30): DEFAULT_TYPE, InlineKeyboardMarkup, SimpleHTTPRequestHandler, ask_cmd(), dashboard_cmd(), debt_add_cmd(), debt_clear_cmd(), debts_list_cmd() (+22 more)

### Community 2 - "package.json"
Cohesion: 0.07
Nodes (27): dependencies, lucide-react, react, react-dom, devDependencies, oxlint, @types/react, @types/react-dom (+19 more)

### Community 3 - "db.py"
Cohesion: 0.11
Nodes (28): generate_dashboard(), get_user_dashboard_payload(), Deprecated: Dashboard is now rendered dynamically on client request via API., Assembles the dashboard data payload (months_data, debts, pending_bills)     for, add_debt(), add_pending_bill(), add_recurring(), check_duplicate() (+20 more)

### Community 4 - "Backend Dependencies"
Cohesion: 0.08
Nodes (23): axios, dependencies, axios, cheerio, cors, dotenv, express, multer (+15 more)

### Community 6 - "TestFinanceBotQueryQA"
Cohesion: 0.12
Nodes (16): any, BaseModel, _extract_claude(), _extract_gemini(), _extract_local(), _extract_openai(), extract_transaction(), get_llm_client() (+8 more)

### Community 7 - "llm_extract.py"
Cohesion: 0.06
Nodes (55): bootstrapPage(), brandMarkup(), broadcast(), browserLauncherForPlatform(), chmodOwnerOnly(), clients, companionUrl(), computeAcceptKey() (+47 more)

### Community 8 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, App(), oxc, react (+1 more)

### Community 9 - "package.json"
Cohesion: 0.17
Nodes (11): openskills, description, devDependencies, openskills, name, scripts, build, postinstall (+3 more)

### Community 10 - "categorize.py"
Cohesion: 0.25
Nodes (8): determine_type_and_bucket(), match_keyword_rules(), match_recurring_rules(), parse_amount(), Tries to extract a decimal or integer amount from a text string.     Example: "S, Checks the local keyword rules for counterparty keywords.     Returns (counterpa, Checks the text against active recurring item keywords.     Returns (counterpart, Helper to look up the bucket and type (credit/debit) for a valid category.

### Community 11 - "scheduler.py"
Cohesion: 0.36
Nodes (7): check_all_users_recurring(), process_due_recurring(), Scans the recurring table for a specific user, inserts due transactions into the, Asynchronous loop that runs on startup and every 4 hours.     Checks for due rec, Sends a summary notification to the user., run_scheduler(), send_summary()

### Community 12 - "MultiUserHTTPRequestHandler"
Cohesion: 0.05
Nodes (42): [Analysis Title], Avoid assuming tools are installed, Avoid deeply nested references, Avoid time-sensitive information, Checklist for effective Skills, Code and scripts, Common patterns, Concise is key (+34 more)

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
Cohesion: 0.12
Nodes (16): Advanced: Skills with executable code, [Analysis Title], Anti-patterns to avoid, Avoid offering too many options, Avoid Windows-style paths, Build evaluations first, Conditional workflow pattern, Develop Skills iteratively with the agent (+8 more)

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
Cohesion: 0.40
Nodes (4): AGENTS, Available Skills, graphify, Penpot Integration (MCP)

### Community 53 - "penpot"
Cohesion: 0.40
Nodes (4): PENPOT_ACCESS_TOKEN, npx, @penpot/mcp, penpot

### Community 54 - "penpot"
Cohesion: 0.40
Nodes (4): PENPOT_ACCESS_TOKEN, npx, @penpot/mcp, penpot

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

## Knowledge Gaps
- **509 isolated node(s):** `crypto`, `http`, `fs`, `path`, `OPCODES` (+504 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Backend Dependencies` to `Backend AI Initialization`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `dotenv` connect `Backend Dependencies` to `bot.py`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Are the 20 inferred relationships involving `main()` (e.g. with `ask_cmd()` and `dashboard_cmd()`) actually correct?**
  _`main()` has 20 INFERRED edges - model-reasoned connections that need verification._
- **What connects `crypto`, `http`, `fs` to the rest of the system?**
  _509 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend AI Initialization` be split into smaller, more focused modules?**
  _Cohesion score 0.1036036036036036 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `db.py` be split into smaller, more focused modules?**
  _Cohesion score 0.11174242424242424 - nodes in this community are weakly interconnected._