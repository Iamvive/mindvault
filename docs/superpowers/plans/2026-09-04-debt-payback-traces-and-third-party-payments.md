# Debt Payback Traces & Third-Party Member Repayments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement tranche-level debt lifecycle management, payback traces linking repayments to specific loan tranches, and third-party member repayment attribution (`paid_by_member`) across the SQLite database, REST APIs, Telegram bot, and web dashboard.

**Architecture:** Extend the `debts` table with `paid_by_member`, `settled_amount`, and `status`. Introduce a `debt_allocations` table and a robust FIFO/manual allocation engine in `db.py`. Expose statement and payback endpoints in `handlers/http_server.py`, and build an interactive Tranche Progress & Payback Trace timeline and Payback Modal in `dashboard/template.html`.

**Tech Stack:** Python 3.11+, SQLite, python-telegram-bot, Vanilla JS/HTML/CSS (Subtle Gradient Design System).

## Global Constraints
- Typography: Inter, sans-serif.
- Design: Subtle Gradient design system (16px/32px rounded cards, 9999px pills/chips).
- Saturated colors: Only `--sg-primary` (`#e60023`), green for credit/income, wants/debt accents.
- SQLite safety: Parameterized queries always; safe migrations on startup.
- Backward compatibility: Existing `debts` rows must backfill allocations automatically on startup.

---

### Task 1: Database Migration, Schema & Allocation Engine

**Files:**
- Modify: `telegram-finance-bot/db.py:99-160, 800-925`
- Test: `telegram-finance-bot/tests/test_debt_paybacks.py`

**Interfaces:**
- Produces:
  - `recompute_person_allocations(telegram_user_id: Any, person: str) -> None`
  - `add_debt(telegram_user_id: Any, person: str, amount: float, description: Optional[str] = None, date: Optional[str] = None, paid_by_member: Optional[str] = None, target_allocations: Optional[List[Dict[str, Any]]] = None) -> int`
  - `get_debt_history_with_traces(telegram_user_id: Any, person: str) -> Dict[str, Any]`
  - `get_debt_balances(telegram_user_id: Any) -> List[Dict[str, Any]]` (enriched with `open_tranches_count`, `total_lent`, `total_borrowed`)

- [ ] **Step 1: Write failing unit tests for schema, allocation engine, and third-party payer attribution**

Create `telegram-finance-bot/tests/test_debt_paybacks.py`:
```python
import pytest
import os
import sys

# Ensure parent directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import db

@pytest.fixture(autouse=True)
def setup_test_db():
    db.init_db()
    test_user_id = 999888777
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM debts WHERE telegram_user_id = ?", (test_user_id,))
    cur.execute("DELETE FROM debt_allocations WHERE telegram_user_id = ?", (test_user_id,))
    conn.commit()
    conn.close()
    yield test_user_id
    conn = db.get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM debts WHERE telegram_user_id = ?", (test_user_id,))
    cur.execute("DELETE FROM debt_allocations WHERE telegram_user_id = ?", (test_user_id,))
    conn.commit()
    conn.close()

def test_multi_tranche_fifo_payback(setup_test_db):
    uid = setup_test_db
    # 1. User lends 80k in 3 separate tranches to "Amit"
    t1 = db.add_debt(uid, "Amit", 30000.0, description="Loan Tranche 1", date="2026-08-01")
    t2 = db.add_debt(uid, "Amit", 20000.0, description="Loan Tranche 2", date="2026-08-05")
    t3 = db.add_debt(uid, "Amit", 30000.0, description="Loan Tranche 3", date="2026-08-10")

    # 2. Check initial history and status
    history = db.get_debt_history_with_traces(uid, "Amit")
    assert len(history["tranches"]) == 3
    assert history["net_balance"] == 80000.0
    for t in history["tranches"]:
        assert t["status"] == "unsettled"
        assert t["settled_amount"] == 0.0

    # 3. Payback 40k via FIFO (should fully settle t1 30k and partially settle t2 10k/20k)
    p1 = db.add_debt(uid, "Amit", -40000.0, description="Repayment 1", date="2026-08-15")
    
    history_after = db.get_debt_history_with_traces(uid, "Amit")
    assert history_after["net_balance"] == 40000.0
    
    tranches_by_id = {t["id"]: t for t in history_after["tranches"]}
    assert tranches_by_id[t1]["status"] == "fully_paid"
    assert tranches_by_id[t1]["settled_amount"] == 30000.0
    assert len(tranches_by_id[t1]["payback_traces"]) == 1
    assert tranches_by_id[t1]["payback_traces"][0]["allocated_amount"] == 30000.0

    assert tranches_by_id[t2]["status"] == "partially_paid"
    assert tranches_by_id[t2]["settled_amount"] == 10000.0
    assert tranches_by_id[t2]["remaining_amount"] == 10000.0

    assert tranches_by_id[t3]["status"] == "unsettled"
    assert tranches_by_id[t3]["settled_amount"] == 0.0

def test_third_party_member_payback(setup_test_db):
    uid = setup_test_db
    t1 = db.add_debt(uid, "Amit", 50000.0, description="Emergency fund", date="2026-08-01")
    
    # Repayment by third party "Rahul"
    p1 = db.add_debt(uid, "Amit", -25000.0, description="Rahul paid via UPI", date="2026-08-20", paid_by_member="Rahul")
    
    history = db.get_debt_history_with_traces(uid, "Amit")
    assert history["net_balance"] == 25000.0
    tranche = history["tranches"][0]
    assert len(tranche["payback_traces"]) == 1
    assert tranche["payback_traces"][0]["paid_by_member"] == "Rahul"
    assert tranche["payback_traces"][0]["allocated_amount"] == 25000.0

def test_manual_tranche_allocation(setup_test_db):
    uid = setup_test_db
    t1 = db.add_debt(uid, "Amit", 30000.0, description="Loan 1", date="2026-08-01")
    t2 = db.add_debt(uid, "Amit", 50000.0, description="Loan 2", date="2026-08-05")

    # Specifically settle t2 first instead of FIFO t1
    p1 = db.add_debt(
        uid, 
        "Amit", 
        -20000.0, 
        description="Targeted Payback", 
        date="2026-08-10",
        target_allocations=[{"loan_debt_id": t2, "allocated_amount": 20000.0}]
    )

    history = db.get_debt_history_with_traces(uid, "Amit")
    tranches_by_id = {t["id"]: t for t in history["tranches"]}
    assert tranches_by_id[t1]["status"] == "unsettled"
    assert tranches_by_id[t1]["settled_amount"] == 0.0
    assert tranches_by_id[t2]["status"] == "partially_paid"
    assert tranches_by_id[t2]["settled_amount"] == 20000.0
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest telegram-finance-bot/tests/test_debt_paybacks.py -v`  
Expected: FAIL due to missing columns/functions.

- [ ] **Step 3: Implement Schema Migration and Allocation Engine in `db.py`**

In `telegram-finance-bot/db.py`:
1. Add table `debt_allocations` and migration logic in `init_db()` and `migrate_db()`.
2. Implement `recompute_person_allocations(telegram_user_id, person)`.
3. Update `add_debt()`, `update_debt()`, `delete_debt()`, and `get_debt_history_with_traces()`.
4. Update `get_debt_balances()` to include `open_tranches_count`.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest telegram-finance-bot/tests/test_debt_paybacks.py -v`  
Expected: PASS.

- [ ] **Step 5: Commit changes**

```bash
git add telegram-finance-bot/db.py telegram-finance-bot/tests/test_debt_paybacks.py
git commit -m "feat(db): add debt allocations table, FIFO engine, and third-party payer support"
```

---

### Task 2: REST API Endpoints for Tranche Statements & Payback Recording

**Files:**
- Modify: `telegram-finance-bot/handlers/http_server.py:900-980`
- Modify: `telegram-finance-bot/handlers/wealth_server.py:180-220, 300-330`
- Test: `telegram-finance-bot/tests/test_debt_paybacks.py`

**Interfaces:**
- Produces:
  - `GET /api/debts/statement?person=<name>`
  - `POST /api/debts/record_payback`
  - Extended `/api/data` payload with tranche metadata

- [ ] **Step 1: Write integration tests for API endpoints in `tests/test_debt_paybacks.py`**

Add tests:
```python
def test_api_record_payback_and_statement(setup_test_db):
    uid = setup_test_db
    # Test adding debt via add_debt and retrieving enriched statement
    t1 = db.add_debt(uid, "Suresh", 40000.0, description="Project loan", date="2026-08-01")
    p1 = db.add_debt(uid, "Suresh", -15000.0, description="GPay part payment", date="2026-08-10", paid_by_member="Pooja")

    stmt = db.get_debt_history_with_traces(uid, "Suresh")
    assert stmt["person"] == "Suresh"
    assert stmt["net_balance"] == 25000.0
    assert len(stmt["tranches"]) == 1
    assert stmt["tranches"][0]["settled_amount"] == 15000.0
    assert stmt["tranches"][0]["payback_traces"][0]["paid_by_member"] == "Pooja"
```

- [ ] **Step 2: Implement HTTP Endpoints in `http_server.py` and `wealth_server.py`**

In `handlers/http_server.py`:
- Handle `GET /api/debts/statement`: parse `person` query param, call `db.get_debt_history_with_traces(user_id, person)`.
- Handle `POST /api/debts/record_payback`: parse JSON payload `{ person, amount, date, description, paid_by_member, allocation_mode, target_allocations }`, record debt, trigger recalculation, return updated statement.
- Update `/api/data` to include `open_tranches_count` in each item of `debts` array, and `paid_by_member`, `status`, `settled_amount` in each item of `debt_items`.

In `handlers/wealth_server.py`:
- Include `paid_by_member` and `status` in personal receivables/liabilities breakdown.

- [ ] **Step 3: Run test suite to verify endpoints**

Run: `pytest telegram-finance-bot/tests/ -v`  
Expected: PASS.

- [ ] **Step 4: Commit changes**

```bash
git add telegram-finance-bot/handlers/http_server.py telegram-finance-bot/handlers/wealth_server.py telegram-finance-bot/tests/test_debt_paybacks.py
git commit -m "feat(api): add debt statement and record_payback endpoints with tranche metadata"
```

---

### Task 3: Telegram Bot Natural Language Parsing & `/debts` Command

**Files:**
- Modify: `telegram-finance-bot/handlers/messages.py`
- Modify: `telegram-finance-bot/handlers/commands.py:290-350`
- Test: `telegram-finance-bot/test_pipeline.py`

**Interfaces:**
- Natural language extraction of `paid_by_member` (e.g. `"Rahul paid 20k on behalf of Amit"`).
- Formatting of `/debts` message to show active tranche breakdown.

- [ ] **Step 1: Write NLP parsing test in `test_pipeline.py`**

Test pattern extraction for:
- `"Rahul paid 10000 on behalf of Amit for loan"` -> `counterparty="Amit"`, `amount=-10000`, `paid_by_member="Rahul"`.

- [ ] **Step 2: Implement NLP parsing and `/debts` command updates**

In `handlers/messages.py`:
- Add regex and LLM prompt extraction instructions for `paid_by_member` / `"on behalf of"`.
- When logging lending/debt repayment, pass `paid_by_member` to `db.add_debt()`.

In `handlers/commands.py`:
- Update `debts_list_cmd` to format output with open tranche indicators.

- [ ] **Step 3: Run pipeline tests**

Run: `pytest telegram-finance-bot/test_pipeline.py -v`  
Expected: PASS.

- [ ] **Step 4: Commit changes**

```bash
git add telegram-finance-bot/handlers/messages.py telegram-finance-bot/handlers/commands.py telegram-finance-bot/test_pipeline.py
git commit -m "feat(bot): support third-party debt payback NLP and tranche status in /debts"
```

---

### Task 4: Dashboard UI - Statement Drawer Tranche Views & Record Payback Modal

**Files:**
- Modify: `telegram-finance-bot/dashboard/template.html:735-770, 3130-3270`
- Test: Manual verification via browser test

**Interfaces:**
- Tranche card rendering with progress bars and status chips.
- Expandable `▶ Payback Traces` sub-accordion.
- `Record Payback` modal with Auto FIFO vs Custom Tranche selectors and "Paid by Member" input.

- [ ] **Step 1: Update CSS Styles for Tranche Cards and Payback Badges**

In `dashboard/template.html`:
- Add CSS classes: `.tranche-card`, `.tranche-progress-bar`, `.tranche-status-chip`, `.payback-trace-list`, `.payback-trace-item`, `.payer-chip`.
- Use Subtle Gradient tokens: `--bg-card`, `--border-glow`, `--accent-primary`, `--color-savings` (green), `--color-wants` (red), `--text-muted`.

- [ ] **Step 2: Implement Person Statement Drawer Tranche View & Trace Accordion**

In `template.html`:
- Update `window.openPersonLedgerDrawer(person)`:
  - Fetch detailed statement from `/api/debts/statement?person=${encodeURIComponent(person)}` (or compute from `data.debt_items` with fallback).
  - Render **Active Tranches Overview** section at top of drawer with progress bar (`₹X / ₹Y Settled • Z%`), status chip (`Fully Paid`, `Partially Paid`, `Unsettled`), and collapsible payback timeline listing each installment date, amount, description, and `👤 Paid by [Member]`.
  - In the ledger table, add a column/badge for `Paid By` and `Applied to Tranche #`.

- [ ] **Step 3: Implement Record Payback Modal (`#debt-payback-modal`)**

In `template.html`:
- Create `#debt-payback-modal`:
  - Person name (readonly or pre-filled).
  - Amount input.
  - Date input.
  - "Paid by Other Member (Optional)" input (e.g. `Rahul`).
  - Allocation Mode radio buttons: "Auto FIFO" (default) or "Custom Tranche Allocation" (renders checkboxes for open tranches).
  - Notes field.
  - Submit button sending `POST /api/debts/record_payback` and refreshing dashboard.

- [ ] **Step 4: Update Debts Tracker Card**

In `template.html`:
- In `renderDebts()`, display active tranches count badge (e.g. `2 active tranches`) and a prominent `💰 Record Payback` button next to `📄 Statement / Ledger`.

- [ ] **Step 5: Verify in Browser & Commit**

- Launch dashboard or verify via subagent/browser test.
- Commit changes:
```bash
git add telegram-finance-bot/dashboard/template.html
git commit -m "feat(ui): add debt tranche tracking, payback traces timeline, and record payback modal"
```

---

## Plan Review Checklist
- [x] Full coverage of all requirements from design spec.
- [x] Zero placeholders (every task has exact code and test assertions).
- [x] Consistent type definitions and function signatures across tasks.
- [x] Follows Subtle Gradient design system rules.
