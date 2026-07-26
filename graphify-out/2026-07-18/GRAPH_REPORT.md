# Graph Report - .  (2026-07-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 242 nodes · 380 edges · 17 communities (13 shown, 4 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.5)
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

## God Nodes (most connected - your core abstractions)
1. `get_connection()` - 23 edges
2. `main()` - 23 edges
3. `TestFinanceBotPipeline` - 14 edges
4. `Database` - 8 edges
5. `extract_transaction()` - 8 edges
6. `initBot()` - 7 edges
7. `TransactionExtraction` - 7 edges
8. `TestFinanceBotQueryQA` - 7 edges
9. `MultiUserHTTPRequestHandler` - 7 edges
10. `handle_callback_query()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `initBot()` --references--> `Database`  [EXTRACTED]
  backend/bot.js → backend/database.js
- `initBot()` --calls--> `enrichDocumentMetadata()`  [EXTRACTED]
  backend/bot.js → backend/gemini.js
- `initBot()` --calls--> `enrichResourceMetadata()`  [EXTRACTED]
  backend/bot.js → backend/gemini.js
- `initBot()` --calls--> `convertFileToMarkdown()`  [EXTRACTED]
  backend/bot.js → backend/markitdown-wrapper.js
- `initBot()` --calls--> `scrapeUrl()`  [EXTRACTED]
  backend/bot.js → backend/scraper.js

## Import Cycles
- None detected.

## Communities (17 total, 4 thin omitted)

### Community 0 - "Backend AI Initialization"
Cohesion: 0.10
Nodes (29): __dirname, __filename, initBot(), uploadDir, Database, db, __dirname, __filename (+21 more)

### Community 1 - "bot.py"
Cohesion: 0.22
Nodes (28): DEFAULT_TYPE, InlineKeyboardMarkup, ask_cmd(), dashboard_cmd(), debt_add_cmd(), debt_clear_cmd(), debts_list_cmd(), delete_cmd() (+20 more)

### Community 2 - "package.json"
Cohesion: 0.07
Nodes (27): dependencies, lucide-react, react, react-dom, devDependencies, oxlint, @types/react, @types/react-dom (+19 more)

### Community 3 - "db.py"
Cohesion: 0.15
Nodes (24): add_debt(), add_pending_bill(), add_recurring(), check_duplicate(), clear_debts_for_person(), delete_last_transaction(), delete_recurring(), delete_transaction() (+16 more)

### Community 4 - "Backend Dependencies"
Cohesion: 0.08
Nodes (23): axios, dependencies, axios, cheerio, cors, dotenv, express, multer (+15 more)

### Community 5 - "TestFinanceBotPipeline"
Cohesion: 0.10
Nodes (5): generate_dashboard(), get_user_dashboard_payload(), Deprecated: Dashboard is now rendered dynamically on client request via API., Assembles the dashboard data payload (months_data, debts, pending_bills)     for, TestFinanceBotPipeline

### Community 6 - "TestFinanceBotQueryQA"
Cohesion: 0.15
Nodes (5): execute_database_qa(), is_finance_query(), Classifies if the user's message is a natural language question or query     abo, Generates a secure SQL query to answer the user's financial question,     execut, TestFinanceBotQueryQA

### Community 7 - "llm_extract.py"
Cohesion: 0.32
Nodes (11): any, BaseModel, _extract_claude(), _extract_gemini(), _extract_local(), _extract_openai(), extract_transaction(), get_llm_client() (+3 more)

### Community 8 - ".oxlintrc.json"
Cohesion: 0.20
Nodes (9): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, App(), oxc, react (+1 more)

### Community 9 - "package.json"
Cohesion: 0.22
Nodes (8): description, name, scripts, build, postinstall, start, type, version

### Community 10 - "categorize.py"
Cohesion: 0.25
Nodes (8): determine_type_and_bucket(), match_keyword_rules(), match_recurring_rules(), parse_amount(), Tries to extract a decimal or integer amount from a text string.     Example: "S, Checks the local keyword rules for counterparty keywords.     Returns (counterpa, Checks the text against active recurring item keywords.     Returns (counterpart, Helper to look up the bucket and type (credit/debit) for a valid category.

### Community 11 - "scheduler.py"
Cohesion: 0.36
Nodes (7): check_all_users_recurring(), process_due_recurring(), Scans the recurring table for a specific user, inserts due transactions into the, Asynchronous loop that runs on startup and every 4 hours.     Checks for due rec, Sends a summary notification to the user., run_scheduler(), send_summary()

## Knowledge Gaps
- **61 isolated node(s):** `__filename`, `__dirname`, `uploadDir`, `__filename`, `__dirname` (+56 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Backend Dependencies` to `Backend AI Initialization`?**
  _High betweenness centrality (0.287) - this node is a cross-community bridge._
- **Why does `dotenv` connect `Backend Dependencies` to `bot.py`?**
  _High betweenness centrality (0.259) - this node is a cross-community bridge._
- **Are the 20 inferred relationships involving `main()` (e.g. with `ask_cmd()` and `dashboard_cmd()`) actually correct?**
  _`main()` has 20 INFERRED edges - model-reasoned connections that need verification._
- **What connects `__filename`, `__dirname`, `uploadDir` to the rest of the system?**
  _61 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Backend AI Initialization` be split into smaller, more focused modules?**
  _Cohesion score 0.1036036036036036 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `db.py` be split into smaller, more focused modules?**
  _Cohesion score 0.14814814814814814 - nodes in this community are weakly interconnected._