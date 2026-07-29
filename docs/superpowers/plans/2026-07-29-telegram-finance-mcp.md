# Telegram Finance Bot MCP Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Python MCP server (`mcp_server.py`) for `telegram-finance-bot` exposing tools, resources, and prompts to AI clients using the official Python `mcp` SDK and `db.py`.

**Architecture:** The server will run via `FastMCP` (stdio transport), reusing existing functions from `db.py`, `categorize.py`, and `dashboard.py`. Tools handle transaction CRUD, budget summaries, debt management, and recurring items, while resources provide read-only context snapshots.

**Tech Stack:** Python 3.11+, `mcp` SDK, `sqlite3`, `pytest` / standard unit testing.

## Global Constraints
- Target directory: `telegram-finance-bot/`
- Target file for MCP server: `telegram-finance-bot/mcp_server.py`
- Target file for tests: `telegram-finance-bot/test_mcp_server.py`
- All SQL operations must be parameterized (`?`).
- Amounts must be strictly positive (`> 0`).
- Category validation against taxonomy in `categorize.py` / `db.py`.

---

### Task 1: Environment Setup & MCP Dependency

**Files:**
- Modify: `telegram-finance-bot/requirements.txt`

**Interfaces:**
- Consumes: Python virtual environment `.venv`
- Produces: `mcp` package installed in `.venv`

- [ ] **Step 1: Update requirements.txt to include mcp**

Modify `telegram-finance-bot/requirements.txt`:
```text
mcp>=1.2.0
```

- [ ] **Step 2: Install dependencies into .venv**

Run:
```bash
cd telegram-finance-bot && .venv/bin/pip install mcp
```
Expected: Successfully installed `mcp`.

- [ ] **Step 3: Commit requirements.txt**

```bash
git add telegram-finance-bot/requirements.txt
git commit -m "chore: add mcp dependency to telegram-finance-bot"
```

---

### Task 2: Implement MCP Server Core, Resources, and Prompts

**Files:**
- Create: `telegram-finance-bot/mcp_server.py`

**Interfaces:**
- Consumes: `db.py`, `categorize.py`, `dashboard.py`
- Produces: `mcp_server.py` with `FastMCP("telegram-finance-bot")` instance, 3 resources, and 2 prompts.

- [ ] **Step 1: Create mcp_server.py with FastMCP instance, Resources, and Prompts**

Create `telegram-finance-bot/mcp_server.py`:
```python
import json
import os
from typing import Optional, List, Dict, Any
from mcp.server.fastmcp import FastMCP

import db
import dashboard
from categorize import VALID_CATEGORIES, BUCKET_MAPPING

# Initialize FastMCP server
mcp = FastMCP("telegram-finance-bot")

# Ensure DB initialized
db.init_db()


# ---------------------------------------------------------------------------
# MCP Resources (Read-Only Data Context)
# ---------------------------------------------------------------------------

@mcp.resource("finance://summary")
def get_finance_summary_resource() -> str:
    """Returns JSON snapshot of current month spending, income, and 50/30/20 budget breakdown."""
    summary = db.get_monthly_summary()
    return json.dumps(summary, indent=2)


@mcp.resource("finance://taxonomy")
def get_finance_taxonomy_resource() -> str:
    """Returns the complete 50/30/20 category taxonomy and bucket mapping."""
    taxonomy = {
        "buckets": BUCKET_MAPPING,
        "valid_categories": list(VALID_CATEGORIES)
    }
    return json.dumps(taxonomy, indent=2)


@mcp.resource("finance://debts")
def get_finance_debts_resource() -> str:
    """Returns a list of active peer-to-peer debts and net balances."""
    debts = db.get_debts()
    return json.dumps(debts, indent=2)


# ---------------------------------------------------------------------------
# MCP Prompts (Workflow Templates)
# ---------------------------------------------------------------------------

@mcp.prompt("monthly_budget_review")
def monthly_budget_review_prompt(month: Optional[str] = None) -> str:
    """Generates a system prompt for a comprehensive 50/30/20 monthly budget review."""
    target_month = month or "current month"
    return (
        f"Please perform a complete 50/30/20 budget review for {target_month}.\n"
        f"Use the `get_budget_summary` tool to retrieve current month metrics.\n"
        f"Compare actual spending percentages against targets (50% NEEDS, 30% WANTS, 20% SAVINGS).\n"
        f"Highlight major expense categories and provide 3 actionable optimization tips."
    )


@mcp.prompt("expense_audit")
def expense_audit_prompt() -> str:
    """Generates a system prompt for auditing recent expenses and flagging uncategorized items."""
    return (
        "Please inspect recent transactions using the `query_transactions` tool.\n"
        "Check for any transactions with low confidence or uncategorized status.\n"
        "Recommend correct categories based on the 50/30/20 taxonomy."
    )
```

- [ ] **Step 2: Verify server imports cleanly**

Run:
```bash
cd telegram-finance-bot && .venv/bin/python -c "import mcp_server; print('MCP Server core initialized successfully')"
```
Expected: `MCP Server core initialized successfully`

- [ ] **Step 3: Commit mcp_server.py core**

```bash
git add telegram-finance-bot/mcp_server.py
git commit -m "feat(mcp): add FastMCP core server with resources and prompts"
```

---

### Task 3: Implement MCP Tools (Transaction CRUD, Debts, Recurring)

**Files:**
- Modify: `telegram-finance-bot/mcp_server.py`

**Interfaces:**
- Consumes: `db.add_transaction`, `db.get_monthly_summary`, `db.get_transactions`, `db.update_transaction`, `db.delete_transaction`, `db.add_debt`, `db.get_debts`, `db.add_recurring`, `db.get_recurring`
- Produces: 7 MCP tools (`add_transaction`, `get_budget_summary`, `query_transactions`, `update_transaction`, `delete_transaction`, `manage_debts`, `manage_recurring`).

- [ ] **Step 1: Add MCP Tools to mcp_server.py**

Append tools to `telegram-finance-bot/mcp_server.py`:

```python
# ---------------------------------------------------------------------------
# MCP Tools (Executable Actions)
# ---------------------------------------------------------------------------

@mcp.tool()
def add_transaction(
    amount: float,
    counterparty: str,
    category: str,
    bucket: str,
    type: str = "debit",
    date: Optional[str] = None,
    raw_message: Optional[str] = None,
    confidence: str = "high",
    source: str = "mcp",
    telegram_user_id: Optional[int] = None
) -> str:
    """
    Log a new income, expense, or transfer transaction in the database.
    
    Args:
        amount: Positive numerical value (> 0).
        counterparty: Merchant, source, or person (e.g., 'Starbucks', 'DMart', 'Salary').
        category: Category string matching 50/30/20 taxonomy (e.g., 'Groceries', 'Coffees').
        bucket: Bucket string ('NEEDS', 'WANTS', 'SAVINGS', 'TRANSFER', 'income').
        type: 'debit' for expenses, 'credit' for income.
        date: YYYY-MM-DD string (defaults to today if omitted).
        raw_message: Optional original message or note.
        confidence: 'high' or 'low'.
        source: Source identifier (default 'mcp').
        telegram_user_id: Optional user ID integer.
    """
    if amount <= 0:
        return json.dumps({"error": "Amount must be strictly greater than 0."})

    allowed_buckets = {"NEEDS", "WANTS", "SAVINGS", "TRANSFER", "income"}
    if bucket not in allowed_buckets:
        return json.dumps({
            "error": f"Invalid bucket '{bucket}'. Allowed buckets: {sorted(list(allowed_buckets))}"
        })

    if category not in VALID_CATEGORIES:
        return json.dumps({
            "error": f"Invalid category '{category}'. Valid categories: {sorted(list(VALID_CATEGORIES))}"
        })

    user_id = telegram_user_id or int(os.getenv("ALLOWED_TELEGRAM_USER_ID", "0"))
    
    tx_id = db.add_transaction(
        telegram_user_id=user_id,
        amount=amount,
        counterparty=counterparty,
        category=category,
        bucket=bucket,
        tx_type=type,
        confidence=confidence,
        source=source,
        raw_message=raw_message,
        date_str=date
    )

    # Regenerate dynamic HTML dashboard
    try:
        dashboard.generate_dashboard()
    except Exception:
        pass

    return json.dumps({
        "status": "success",
        "message": f"Transaction #{tx_id} logged successfully.",
        "transaction": {
            "id": tx_id,
            "amount": amount,
            "counterparty": counterparty,
            "category": category,
            "bucket": bucket,
            "type": type,
            "date": date or "today"
        }
    }, indent=2)


@mcp.tool()
def get_budget_summary(month: Optional[str] = None) -> str:
    """
    Get 50/30/20 budget summary for a given month (YYYY-MM).
    """
    summary = db.get_monthly_summary(month)
    return json.dumps(summary, indent=2)


@mcp.tool()
def query_transactions(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
    bucket: Optional[str] = None,
    keyword: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
) -> str:
    """
    Query transactions with filtering and pagination.
    """
    limit = max(1, min(limit, 100))
    offset = max(0, offset)

    conn = db.get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM transactions WHERE 1=1"
    params = []

    if start_date:
        query += " AND date >= ?"
        params.append(start_date)
    if end_date:
        query += " AND date <= ?"
        params.append(end_date)
    if category:
        query += " AND category = ?"
        params.append(category)
    if bucket:
        query += " AND bucket = ?"
        params.append(bucket)
    if keyword:
        query += " AND (counterparty LIKE ? OR raw_message LIKE ?)"
        params.append(f"%{keyword}%")
        params.append(f"%{keyword}%")

    query += " ORDER BY date DESC, id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    txs = [dict(row) for row in rows]
    return json.dumps({
        "count": len(txs),
        "limit": limit,
        "offset": offset,
        "transactions": txs
    }, indent=2)


@mcp.tool()
def update_transaction(
    transaction_id: int,
    amount: Optional[float] = None,
    counterparty: Optional[str] = None,
    category: Optional[str] = None,
    bucket: Optional[str] = None,
    date: Optional[str] = None
) -> str:
    """
    Update details of an existing transaction by transaction_id.
    """
    if amount is not None and amount <= 0:
        return json.dumps({"error": "Amount must be greater than 0."})

    if category is not None and category not in VALID_CATEGORIES:
        return json.dumps({"error": f"Invalid category '{category}'."})

    success = db.update_transaction(
        tx_id=transaction_id,
        amount=amount,
        counterparty=counterparty,
        category=category,
        bucket=bucket,
        date_str=date
    )

    if not success:
        return json.dumps({"error": f"Transaction #{transaction_id} not found."})

    try:
        dashboard.generate_dashboard()
    except Exception:
        pass

    return json.dumps({
        "status": "success",
        "message": f"Transaction #{transaction_id} updated successfully."
    })


@mcp.tool()
def delete_transaction(transaction_id: int) -> str:
    """
    Delete a transaction by ID.
    """
    success = db.delete_transaction(transaction_id)
    if not success:
        return json.dumps({"error": f"Transaction #{transaction_id} not found."})

    try:
        dashboard.generate_dashboard()
    except Exception:
        pass

    return json.dumps({
        "status": "success",
        "message": f"Transaction #{transaction_id} deleted successfully."
    })


@mcp.tool()
def manage_debts(
    action: str,
    person: Optional[str] = None,
    amount: Optional[float] = None,
    description: Optional[str] = None,
    telegram_user_id: Optional[int] = None
) -> str:
    """
    Manage peer-to-peer debts (action: 'list' or 'add').
    For 'add': positive amount = person owes you; negative amount = you owe person.
    """
    user_id = telegram_user_id or int(os.getenv("ALLOWED_TELEGRAM_USER_ID", "0"))

    if action == "list":
        debts = db.get_debts(telegram_user_id=user_id)
        return json.dumps({"status": "success", "debts": debts}, indent=2)

    elif action == "add":
        if not person or amount is None:
            return json.dumps({"error": "Parameters 'person' and 'amount' are required for action 'add'."})

        debt_id = db.add_debt(
            telegram_user_id=user_id,
            person=person,
            amount=amount,
            description=description or ""
        )
        return json.dumps({
            "status": "success",
            "message": f"Debt entry #{debt_id} added for {person}.",
            "debt_id": debt_id
        })

    return json.dumps({"error": f"Unknown action '{action}'. Use 'list' or 'add'."})


@mcp.tool()
def manage_recurring(
    action: str,
    counterparty_keyword: Optional[str] = None,
    amount: Optional[float] = None,
    bucket: Optional[str] = None,
    category: Optional[str] = None,
    day_of_month: Optional[int] = None,
    telegram_user_id: Optional[int] = None
) -> str:
    """
    Manage recurring expense rules (action: 'list' or 'add').
    """
    user_id = telegram_user_id or int(os.getenv("ALLOWED_TELEGRAM_USER_ID", "0"))

    if action == "list":
        rules = db.get_recurring(telegram_user_id=user_id)
        return json.dumps({"status": "success", "recurring_rules": rules}, indent=2)

    elif action == "add":
        if not counterparty_keyword or amount is None or not bucket or not category or not day_of_month:
            return json.dumps({
                "error": "Parameters 'counterparty_keyword', 'amount', 'bucket', 'category', and 'day_of_month' are required."
            })

        rule_id = db.add_recurring(
            telegram_user_id=user_id,
            counterparty_keyword=counterparty_keyword,
            amount=amount,
            bucket=bucket,
            category=category,
            day_of_month=day_of_month
        )
        return json.dumps({
            "status": "success",
            "message": f"Recurring rule #{rule_id} added for '{counterparty_keyword}'.",
            "rule_id": rule_id
        })

    return json.dumps({"error": f"Unknown action '{action}'. Use 'list' or 'add'."})


if __name__ == "__main__":
    mcp.run()
```

- [ ] **Step 2: Commit complete mcp_server.py**

```bash
git add telegram-finance-bot/mcp_server.py
git commit -m "feat(mcp): add all tools to mcp_server.py"
```

---

### Task 4: Automated Test Suite & Verification

**Files:**
- Create: `telegram-finance-bot/test_mcp_server.py`

**Interfaces:**
- Consumes: `mcp_server.py` tools and resources functions directly.
- Produces: Test suite validating tool execution, input sanitization, and resource JSON structures.

- [ ] **Step 1: Create test_mcp_server.py**

Create `telegram-finance-bot/test_mcp_server.py`:
```python
import json
import unittest
import os
import db
import mcp_server

class TestMCPServer(unittest.TestCase):
    def setUp(self):
        os.environ["DB_PATH"] = "test_mcp_finance.db"
        if os.path.exists("test_mcp_finance.db"):
            os.remove("test_mcp_finance.db")
        db.init_db()

    def tearDown(self):
        if os.path.exists("test_mcp_finance.db"):
            os.remove("test_mcp_finance.db")

    def test_add_and_query_transaction(self):
        # 1. Add valid transaction
        res = json.loads(mcp_server.add_transaction(
            amount=150.0,
            counterparty="Supermarket",
            category="Groceries",
            bucket="NEEDS",
            type="debit",
            date="2026-07-29"
        ))
        self.assertEqual(res["status"], "success")
        tx_id = res["transaction"]["id"]

        # 2. Query transactions
        q_res = json.loads(mcp_server.query_transactions(keyword="Supermarket"))
        self.assertEqual(q_res["count"], 1)
        self.assertEqual(q_res["transactions"][0]["id"], tx_id)

        # 3. Update transaction
        u_res = json.loads(mcp_server.update_transaction(
            transaction_id=tx_id,
            amount=180.0
        ))
        self.assertEqual(u_res["status"], "success")

        # 4. Delete transaction
        d_res = json.loads(mcp_server.delete_transaction(tx_id))
        self.assertEqual(d_res["status"], "success")

    def test_invalid_add_transaction_inputs(self):
        # Negative amount
        res1 = json.loads(mcp_server.add_transaction(
            amount=-50.0,
            counterparty="Test",
            category="Groceries",
            bucket="NEEDS"
        ))
        self.assertIn("error", res1)

        # Invalid category
        res2 = json.loads(mcp_server.add_transaction(
            amount=50.0,
            counterparty="Test",
            category="NonExistentCategory",
            bucket="NEEDS"
        ))
        self.assertIn("error", res2)

    def test_resources_and_summary(self):
        summary_json = mcp_server.get_finance_summary_resource()
        data = json.loads(summary_json)
        self.assertIn("NEEDS", data)

        taxonomy_json = mcp_server.get_finance_taxonomy_resource()
        tax_data = json.loads(taxonomy_json)
        self.assertIn("valid_categories", tax_data)

    def test_manage_debts_and_recurring(self):
        # Debt add & list
        d_add = json.loads(mcp_server.manage_debts(action="add", person="Alice", amount=200.0, description="Lunch"))
        self.assertEqual(d_add["status"], "success")

        d_list = json.loads(mcp_server.manage_debts(action="list"))
        self.assertEqual(d_list["status"], "success")

        # Recurring add & list
        r_add = json.loads(mcp_server.manage_recurring(
            action="add",
            counterparty_keyword="Wifi",
            amount=50.0,
            bucket="NEEDS",
            category="Internet",
            day_of_month=1
        ))
        self.assertEqual(r_add["status"], "success")

        r_list = json.loads(mcp_server.manage_recurring(action="list"))
        self.assertEqual(r_list["status"], "success")

if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run test_mcp_server.py to verify unit tests pass**

Run:
```bash
cd telegram-finance-bot && .venv/bin/python test_mcp_server.py
```
Expected: `OK` (all unit tests pass clean).

- [ ] **Step 3: Commit test_mcp_server.py**

```bash
git add telegram-finance-bot/test_mcp_server.py
git commit -m "test(mcp): add automated test suite for mcp_server.py"
```
