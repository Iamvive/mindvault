# Design Document: Telegram Finance Bot MCP Server

**Date**: 2026-07-29  
**Status**: Approved  
**Topic**: Python MCP Server for `telegram-finance-bot`  
**Target File**: `telegram-finance-bot/mcp_server.py`  

---

## 1. Executive Summary

This specification outlines the architecture, design, and implementation of a Model Context Protocol (MCP) server for the `telegram-finance-bot` repository. Built using Python and the official `mcp` SDK (`FastMCP`), the server exposes the bot's SQLite database (`finance.db` via `db.py`) to AI assistants (Claude Desktop, Cursor, Antigravity, VS Code). 

The design strictly follows Anthropic's official MCP recommendations, including granular tool definitions, rigid JSON Schema parameter validation, context-window token efficiency, read/write separation, and helpful error messaging.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 AI Client (Claude, Cursor, IDE)             │
└──────────────────────────────┬──────────────────────────────┘
                               │ MCP Protocol (stdio)
┌──────────────────────────────▼──────────────────────────────┐
│           Finance Bot MCP Server (mcp_server.py)            │
├─────────────────────────────────────────────────────────────┤
│  Tools:      add_transaction, get_budget_summary,          │
│              query_transactions, update_transaction,        │
│              delete_transaction, manage_debts,             │
│              manage_recurring                               │
│  Resources:  finance://summary, finance://taxonomy,         │
│              finance://debts                                │
│  Prompts:    monthly_budget_review, expense_audit          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Imports / Direct SQLite Calls
┌──────────────────────────────▼──────────────────────────────┐
│              db.py / SQLite Database (finance.db)           │
└─────────────────────────────────────────────────────────────┘
```

### Components
1. **Entry Point**: `telegram-finance-bot/mcp_server.py`
2. **SDK**: Official `mcp` Python SDK (`mcp.server.fastmcp.FastMCP`).
3. **Database Integration**: Direct imports from `db.py` (`get_connection`, `init_db`, `add_transaction`, `get_monthly_summary`, `get_transactions`, `delete_transaction`, `update_transaction`, `get_debts`, `add_debt`, `get_recurring`, `add_recurring`).
4. **Transport**: `stdio` transport mode for desktop/editor client integration.

---

## 3. MCP Tools (Executable Functions)

All tools provide comprehensive docstrings, strict parameter types, and explicit JSON return schemas.

### 3.1. `add_transaction`
Logs a new income, expense, or transfer transaction.
- **Parameters**:
  - `amount` (`float`): Transaction amount (must be > 0).
  - `counterparty` (`str`): Merchant, entity, or person involved (e.g., "DMart", "Starbucks", "Employer").
  - `category` (`str`): Category from the 50/30/20 taxonomy (e.g., "Groceries", "Coffees", "Salary").
  - `bucket` (`str`): 50/30/20 bucket (`NEEDS`, `WANTS`, `SAVINGS`, `TRANSFER`, `income`).
  - `type` (`str`): Transaction type (`debit` or `credit`).
  - `date` (`Optional[str]`): Date in `YYYY-MM-DD` format (defaults to current date).
  - `raw_message` (`Optional[str]`): Optional original text or context notes.
  - `confidence` (`str`): Confidence level (`high` or `low`, defaults to `"high"`).
  - `source` (`str`): Source identifier (defaults to `"mcp"`).
- **Behavior**:
  1. Validates `amount > 0`.
  2. Validates `category` and `bucket` against `VALID_CATEGORIES` taxonomy. On error, returns a detailed error string listing allowed categories.
  3. Inserts row via `db.add_transaction()`.
  4. Auto-regenerates static HTML dashboard (`dashboard.py`).
  5. Returns JSON response containing inserted record details.

### 3.2. `get_budget_summary`
Retrieves a detailed 50/30/20 budget breakdown for a specified month.
- **Parameters**:
  - `month` (`Optional[str]`): Target month in `YYYY-MM` format (defaults to current month).
- **Behavior**:
  1. Queries SQLite for income, spend per bucket (`NEEDS`, `WANTS`, `SAVINGS`), and debt transfers.
  2. Calculates actual percentages vs target allocations (50% NEEDS, 30% WANTS, 20% SAVINGS).
  3. Returns structured JSON with financial status summary.

### 3.3. `query_transactions`
Searches transactions with filtering and token-efficient pagination.
- **Parameters**:
  - `start_date` (`Optional[str]`): Start date `YYYY-MM-DD`.
  - `end_date` (`Optional[str]`): End date `YYYY-MM-DD`.
  - `category` (`Optional[str]`): Filter by specific category.
  - `bucket` (`Optional[str]`): Filter by bucket (`NEEDS`, `WANTS`, `SAVINGS`, `TRANSFER`, `income`).
  - `keyword` (`Optional[str]`): Search substring in counterparty or raw message.
  - `limit` (`int`): Maximum transactions to return (default: `50`, max: `100`).
  - `offset` (`int`): Pagination offset (default: `0`).
- **Behavior**:
  1. Runs parameterized SQL query on `transactions` table.
  2. Returns JSON list of transactions and total count.

### 3.4. `update_transaction`
Updates fields of an existing transaction by ID.
- **Parameters**:
  - `transaction_id` (`int`): Target transaction ID.
  - `amount` (`Optional[float]`): Updated amount.
  - `counterparty` (`Optional[str]`): Updated counterparty.
  - `category` (`Optional[str]`): Updated category.
  - `bucket` (`Optional[str]`): Updated bucket.
  - `date` (`Optional[str]`): Updated date (`YYYY-MM-DD`).
- **Behavior**:
  1. Validates updated fields.
  2. Executes SQL UPDATE via `db.update_transaction()`.
  3. Regenerates static HTML dashboard.
  4. Returns updated record details.

### 3.5. `delete_transaction`
Deletes a transaction by ID.
- **Parameters**:
  - `transaction_id` (`int`): ID of the transaction to delete.
- **Behavior**:
  1. Deletes record from `transactions` table using `db.delete_transaction()`.
  2. Regenerates static HTML dashboard.
  3. Returns confirmation message.

### 3.6. `manage_debts`
Records or lists peer-to-peer debts/lending.
- **Parameters**:
  - `action` (`str`): `"list"` or `"add"`.
  - `person` (`Optional[str]`): Name of person.
  - `amount` (`Optional[float]`): Amount (positive = person owes user; negative = user owes person).
  - `description` (`Optional[str]`): Debt description or note.
- **Behavior**:
  - If `"list"`: Returns all active debt records and net balances grouped by person.
  - If `"add"`: Adds a new debt entry via `db.add_debt()` and returns confirmation.

### 3.7. `manage_recurring`
Lists or creates monthly recurring expense rules.
- **Parameters**:
  - `action` (`str`): `"list"` or `"add"`.
  - `counterparty_keyword` (`Optional[str]`): Rule keyword (e.g. "Rent", "Netflix").
  - `amount` (`Optional[float]`): Recurring amount.
  - `bucket` (`Optional[str]`): Bucket enum.
  - `category` (`Optional[str]`): Category string.
  - `day_of_month` (`Optional[int]`): Day of month (1-31).
- **Behavior**:
  - If `"list"`: Returns active recurring rules.
  - If `"add"`: Registers recurring rule via `db.add_recurring_rule()`.

---

## 4. MCP Resources (Read-Only Data Context)

- **`finance://summary`**
  - **MIME**: `application/json`
  - **Description**: Real-time snapshot of the current month's income, bucket spending, and budget ratios.
- **`finance://taxonomy`**
  - **MIME**: `application/json`
  - **Description**: Complete taxonomy listing allowed categories grouped by bucket (`NEEDS`, `WANTS`, `SAVINGS`, `TRANSFER`, `income`).
- **`finance://debts`**
  - **MIME**: `application/json`
  - **Description**: Summary of peer-to-peer balance ledger (who owes what).

---

## 5. MCP Prompts (Workflow Templates)

- **`monthly_budget_review`**
  - Prompt template instructing the AI model to perform a 50/30/20 audit for the current month, identifying over-budget categories and actionable savings opportunities.
- **`expense_audit`**
  - Prompt template guiding the AI model to check for duplicate transactions, low-confidence entries, or unexpected high spending.

---

## 6. Anthropic Best Practices & Validation Guardrails

1. **Defensive Parameter Validation**:
   - Amounts must be strictly positive (`> 0`).
   - Dates must match `YYYY-MM-DD` standard format.
   - Categories must exist in `VALID_CATEGORIES` taxonomy.
2. **Context Token Efficiency**:
   - Limits default query size to `50` records to avoid clogging the LLM context window.
3. **Informative Error Messages**:
   - Errors explicitly explain what went wrong and provide correct options (e.g. listing allowed categories).
4. **Parameterized SQL Safety**:
   - All queries use SQLite placeholders (`?`) to prevent any SQL injection risks.

---

## 7. Testing & Verification Strategy

- Create unit test script `test_mcp_server.py` in `telegram-finance-bot/`.
- Test tool executions (`add_transaction`, `query_transactions`, `update_transaction`, `delete_transaction`, `get_budget_summary`, `manage_debts`, `manage_recurring`).
- Test resource readers (`finance://summary`, `finance://taxonomy`, `finance://debts`).
- Validate invalid input handling (negative amounts, bad categories).
