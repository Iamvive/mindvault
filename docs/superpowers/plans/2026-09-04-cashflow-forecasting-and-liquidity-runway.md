# Smart Cashflow Forecasting & Liquidity Runway Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a proactive Cashflow Forecasting & Liquidity Runway Engine that simulates daily bank balances over 30/60-day horizons, renders interactive trajectory charts on the dashboard, and delivers Telegram `/runway` commands & balance warnings.

**Architecture:** A standalone simulation engine (`cashflow_forecast.py`) combines user starting liquidity settings, scheduled recurring inflows/outflows, pending bills, and rolling 30-day discretionary daily burn into a day-by-day trajectory. Exposed via HTTP endpoints (`GET /api/cashflow/forecast`, `POST /api/cashflow/settings`), rendered via vanilla SVG in `dashboard/template.html`, and accessed in Telegram via `/runway` & `/forecast`.

**Tech Stack:** Python 3 (sqlite3, unittest, http.server), Vanilla JS/SVG (Dark mode, Subtle Gradient CSS tokens), python-telegram-bot.

## Global Constraints
- Strictly follow TDD: write failing test, verify failure, implement minimal code, verify pass, commit.
- Stage specific files with `git add <files>` (never `git add .` or `git add -A`).
- Adhere to the Subtle Gradient Design System: `Inter` font, negative tracking on large headings, `--sg-primary` (`#e60023`), rounded cards (16px/32px/full).
- Run `graphify update .` upon modifying code files.

---

### Task 1: SQLite Schema Migration & Cashflow Settings in `db.py`

**Files:**
- Modify: `telegram-finance-bot/db.py`
- Test: `telegram-finance-bot/tests/test_cashflow_db.py`

**Interfaces:**
- Consumes: `get_connection()`, `resolve_user_uuid(telegram_user_id)`
- Produces:
  - `get_user_cashflow_settings(telegram_user_id: Any) -> dict`
  - `update_user_cashflow_settings(telegram_user_id: Any, balance: float, threshold: float = 10000.0, include_daily_burn: bool = True, as_of_date: Optional[str] = None) -> bool`
  - `get_variable_daily_burn_rate(telegram_user_id: Any, days: int = 30) -> float`

- [ ] **Step 1: Write failing unit tests for cashflow DB settings & burn rate**

Create `telegram-finance-bot/tests/test_cashflow_db.py`:
```python
import os
import tempfile
import unittest
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db

class TestCashflowDB(unittest.TestCase):
    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp()
        os.environ["DB_PATH"] = self.db_path
        db.init_db()
        self.user_id = 12345
        self.user_uuid = "usr-cf-test-001"
        conn = db.get_connection()
        conn.execute("INSERT INTO users (telegram_user_id, token, user_uuid) VALUES (?, 'tok-123', ?)", (self.user_id, self.user_uuid))
        conn.commit()
        conn.close()

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(self.db_path)

    def test_default_cashflow_settings(self):
        settings = db.get_user_cashflow_settings(self.user_id)
        self.assertEqual(settings["low_balance_threshold"], 10000.0)
        self.assertEqual(settings["include_daily_burn"], 1)
        self.assertEqual(settings["starting_liquid_balance"], 0.0)

    def test_update_and_get_cashflow_settings(self):
        success = db.update_user_cashflow_settings(
            telegram_user_id=self.user_id,
            balance=150000.0,
            threshold=25000.0,
            include_daily_burn=True,
            as_of_date="2026-09-01"
        )
        self.assertTrue(success)
        settings = db.get_user_cashflow_settings(self.user_id)
        self.assertEqual(settings["starting_liquid_balance"], 150000.0)
        self.assertEqual(settings["low_balance_threshold"], 25000.0)
        self.assertEqual(settings["include_daily_burn"], 1)
        self.assertEqual(settings["balance_as_of_date"], "2026-09-01")

    def test_variable_daily_burn_rate_calculation(self):
        # Insert 3 transactions over the last 10 days
        conn = db.get_connection()
        # Non-recurring, non-debt NEEDS/WANTS debits
        conn.execute(
            "INSERT INTO transactions (telegram_user_id, date, amount, counterparty, category, bucket, type, confidence, source) VALUES (?, '2026-09-01', 3000.0, 'Grocery', 'Groceries', 'NEEDS', 'debit', 'high', 'text')",
            (self.user_id,)
        )
        conn.execute(
            "INSERT INTO transactions (telegram_user_id, date, amount, counterparty, category, bucket, type, confidence, source) VALUES (?, '2026-09-02', 6000.0, 'Dining', 'Food', 'WANTS', 'debit', 'high', 'text')",
            (self.user_id,)
        )
        # Recurring source should be excluded from variable burn
        conn.execute(
            "INSERT INTO transactions (telegram_user_id, date, amount, counterparty, category, bucket, type, confidence, source) VALUES (?, '2026-09-03', 20000.0, 'Rent', 'Rent', 'NEEDS', 'debit', 'high', 'recurring_cron')",
            (self.user_id,)
        )
        conn.commit()
        conn.close()

        burn_rate = db.get_variable_daily_burn_rate(self.user_id, days=30)
        # Total variable spend = 3000 + 6000 = 9000. 9000 / 30 = 300.0
        self.assertAlmostEqual(burn_rate, 300.0, places=2)

if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest telegram-finance-bot/tests/test_cashflow_db.py -v`
Expected: FAIL with AttributeError (`get_user_cashflow_settings` not found).

- [ ] **Step 3: Implement table creation, migrations, and helper functions in `db.py`**

In `telegram-finance-bot/db.py`:
1. In `init_db()` add table `user_cashflow_settings`:
```python
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_cashflow_settings (
        user_uuid TEXT PRIMARY KEY,
        telegram_user_id INTEGER NOT NULL DEFAULT 0,
        starting_liquid_balance REAL DEFAULT 0.0,
        balance_as_of_date TEXT,
        low_balance_threshold REAL DEFAULT 10000.0,
        include_daily_burn INTEGER DEFAULT 1,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
    """)
```
2. In `migrate_db()` ensure table existence and columns.
3. Add helper functions:
```python
def get_user_cashflow_settings(telegram_user_id: Any) -> Dict[str, Any]:
    u_uuid = resolve_user_uuid(telegram_user_id) or (str(telegram_user_id) if str(telegram_user_id).startswith("usr_") else None)
    tg_id = int(telegram_user_id) if str(telegram_user_id).isdigit() else 0
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM user_cashflow_settings WHERE ((user_uuid IS NOT NULL AND user_uuid = ?) OR (telegram_user_id != 0 AND telegram_user_id = ?))",
        (u_uuid, tg_id)
    )
    row = cursor.fetchone()
    conn.close()
    if row:
        return dict(row)
    return {
        "user_uuid": u_uuid or f"usr_{tg_id}",
        "telegram_user_id": tg_id,
        "starting_liquid_balance": 0.0,
        "balance_as_of_date": datetime.now().strftime("%Y-%m-%d"),
        "low_balance_threshold": 10000.0,
        "include_daily_burn": 1,
        "updated_at": datetime.now().isoformat()
    }

def update_user_cashflow_settings(telegram_user_id: Any, balance: float, threshold: float = 10000.0, include_daily_burn: bool = True, as_of_date: Optional[str] = None) -> bool:
    u_uuid = resolve_user_uuid(telegram_user_id) or (str(telegram_user_id) if str(telegram_user_id).startswith("usr_") else f"usr_{telegram_user_id}")
    tg_id = int(telegram_user_id) if str(telegram_user_id).isdigit() else 0
    date_val = as_of_date or datetime.now().strftime("%Y-%m-%d")
    burn_int = 1 if include_daily_burn else 0

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO user_cashflow_settings (user_uuid, telegram_user_id, starting_liquid_balance, balance_as_of_date, low_balance_threshold, include_daily_burn, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_uuid) DO UPDATE SET
            starting_liquid_balance = excluded.starting_liquid_balance,
            balance_as_of_date = excluded.balance_as_of_date,
            low_balance_threshold = excluded.low_balance_threshold,
            include_daily_burn = excluded.include_daily_burn,
            telegram_user_id = CASE WHEN excluded.telegram_user_id != 0 THEN excluded.telegram_user_id ELSE user_cashflow_settings.telegram_user_id END,
            updated_at = CURRENT_TIMESTAMP
    """, (u_uuid, tg_id, float(balance), date_val, float(threshold), burn_int))
    conn.commit()
    conn.close()
    return True

def get_variable_daily_burn_rate(telegram_user_id: Any, days: int = 30) -> float:
    u_uuid = resolve_user_uuid(telegram_user_id) or (str(telegram_user_id) if str(telegram_user_id).startswith("usr_") else None)
    tg_id = int(telegram_user_id) if str(telegram_user_id).isdigit() else 0
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT COALESCE(SUM(amount), 0.0) as total_var_spend
        FROM transactions
        WHERE ((user_uuid IS NOT NULL AND user_uuid = ?) OR (telegram_user_id != 0 AND telegram_user_id = ?))
          AND type = 'debit'
          AND bucket IN ('NEEDS', 'WANTS')
          AND source != 'recurring_cron'
          AND date >= date('now', '-' || ? || ' days')
    """, (u_uuid, tg_id, days))
    row = cursor.fetchone()
    conn.close()
    total_spend = float(row["total_var_spend"]) if row else 0.0
    return round(total_spend / max(days, 1), 2)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest telegram-finance-bot/tests/test_cashflow_db.py -v`
Expected: PASS (3/3 tests pass).

- [ ] **Step 5: Commit**

```bash
git add telegram-finance-bot/db.py telegram-finance-bot/tests/test_cashflow_db.py
git commit -m "feat(cashflow): add user_cashflow_settings schema and db helpers"
```

---

### Task 2: Simulation Engine (`cashflow_forecast.py`)

**Files:**
- Create: `telegram-finance-bot/cashflow_forecast.py`
- Test: `telegram-finance-bot/tests/test_cashflow_forecast.py`

**Interfaces:**
- Consumes: `db.get_user_cashflow_settings`, `db.get_variable_daily_burn_rate`, `db.get_recurring_rules`, `db.get_pending_bills`, `db.get_debts`
- Produces:
  - `simulate_cashflow_forecast(telegram_user_id: Any, horizon_days: int = 30, base_date: Optional[str] = None) -> Dict[str, Any]`

- [ ] **Step 1: Write failing unit tests for cashflow simulation**

Create `telegram-finance-bot/tests/test_cashflow_forecast.py`:
```python
import os
import tempfile
import unittest
from datetime import datetime, timedelta
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db
import cashflow_forecast

class TestCashflowForecast(unittest.TestCase):
    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp()
        os.environ["DB_PATH"] = self.db_path
        db.init_db()
        self.user_id = 55555
        self.user_uuid = "usr-forecast-001"
        conn = db.get_connection()
        conn.execute("INSERT INTO users (telegram_user_id, token, user_uuid) VALUES (?, 'tok-555', ?)", (self.user_id, self.user_uuid))
        conn.commit()
        conn.close()

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(self.db_path)

    def test_forecast_simulation_math(self):
        # 1. Set starting balance = 100,000, threshold = 15,000
        db.update_user_cashflow_settings(
            telegram_user_id=self.user_id,
            balance=100000.0,
            threshold=15000.0,
            include_daily_burn=True,
            as_of_date="2026-09-01"
        )
        
        # 2. Add recurring salary inflow on day 10 (amount: 50,000)
        db.add_recurring_rule(self.user_id, "Salary", 50000.0, "income", "Salary", 10)
        
        # 3. Add recurring rent outflow on day 5 (amount: 30,000)
        db.add_recurring_rule(self.user_id, "Rent", 30000.0, "NEEDS", "Housing", 5)

        # 4. Add pending electricity bill due on 2026-09-12 (amount: 2500)
        db.add_pending_bill(self.user_id, "Electricity", 2500.0, "NEEDS", "Utilities", "2026-09-12")

        # 5. Add debt receivable due on 2026-09-20 (amount: 5000)
        db.add_debt(self.user_id, "Ramesh", 5000.0, "Loan payback", "2026-09-20")

        # Run 30-day forecast starting 2026-09-01
        res = cashflow_forecast.simulate_cashflow_forecast(
            telegram_user_id=self.user_id,
            horizon_days=30,
            base_date="2026-09-01"
        )

        self.assertEqual(res["horizon_days"], 30)
        self.assertEqual(res["starting_balance"], 100000.0)
        self.assertEqual(len(res["trajectory"]), 30)
        
        # Summary checks
        summary = res["summary"]
        self.assertIn("min_projected_balance", summary)
        self.assertIn("runway_days", summary)
        self.assertIn("runway_status", summary)
        self.assertEqual(summary["total_expected_inflows"], 55000.0) # 50k salary + 5k debt
        self.assertGreaterEqual(summary["total_scheduled_outflows"], 32500.0) # 30k rent + 2.5k bill

    def test_runway_status_danger_when_below_threshold(self):
        # Starting balance 20,000, threshold 15,000, outflow 25,000
        db.update_user_cashflow_settings(
            telegram_user_id=self.user_id,
            balance=20000.0,
            threshold=15000.0,
            include_daily_burn=False,
            as_of_date="2026-09-01"
        )
        db.add_recurring_rule(self.user_id, "Big Expense", 25000.0, "NEEDS", "Other", 5)

        res = cashflow_forecast.simulate_cashflow_forecast(
            telegram_user_id=self.user_id,
            horizon_days=30,
            base_date="2026-09-01"
        )
        self.assertEqual(res["summary"]["runway_status"], "danger")
        self.assertLess(res["summary"]["min_projected_balance"], 15000.0)

if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest telegram-finance-bot/tests/test_cashflow_forecast.py -v`
Expected: FAIL with `ModuleNotFoundError: No module named 'cashflow_forecast'`.

- [ ] **Step 3: Implement `cashflow_forecast.py`**

Create `telegram-finance-bot/cashflow_forecast.py`:
```python
import os
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import db

logger = logging.getLogger(__name__)

def simulate_cashflow_forecast(
    telegram_user_id: Any,
    horizon_days: int = 30,
    base_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Simulates day-by-day cashflow balance trajectory over a specified horizon.
    Synthesizes starting balance, scheduled recurring inflows/outflows,
    pending bills, debt repayments, and rolling variable daily burn.
    """
    settings = db.get_user_cashflow_settings(telegram_user_id)
    starting_balance = float(settings.get("starting_liquid_balance", 0.0))
    threshold = float(settings.get("low_balance_threshold", 10000.0))
    include_burn = bool(settings.get("include_daily_burn", 1))

    # Determine daily burn rate
    daily_burn_rate = db.get_variable_daily_burn_rate(telegram_user_id, days=30) if include_burn else 0.0

    # Retrieve all schedules
    recurring_rules = db.get_recurring_rules(telegram_user_id)
    pending_bills = db.get_pending_bills(telegram_user_id)
    debts = db.get_debts(telegram_user_id)

    # Base date
    start_dt = datetime.strptime(base_date, "%Y-%m-%d").date() if base_date else datetime.now().date()
    
    current_balance = starting_balance
    min_balance = starting_balance
    min_balance_date = start_dt.strftime("%Y-%m-%d")
    
    total_inflows = 0.0
    total_scheduled_outflows = 0.0
    total_estimated_burn = 0.0
    
    trajectory: List[Dict[str, Any]] = []
    critical_events: List[Dict[str, Any]] = []
    runway_days = horizon_days
    danger_detected = False

    for day_idx in range(1, horizon_days + 1):
        target_dt = start_dt + timedelta(days=day_idx)
        date_str = target_dt.strftime("%Y-%m-%d")
        dom = target_dt.day

        day_inflows = 0.0
        day_outflows = 0.0
        day_events: List[Dict[str, Any]] = []

        # 1. Recurring rules
        for rule in recurring_rules:
            if rule["day_of_month"] == dom:
                amt = float(rule["amount"])
                bucket = (rule.get("bucket") or "").lower()
                cp = rule.get("counterparty_keyword", "Recurring")
                if bucket == "income":
                    day_inflows += amt
                    event = {"date": date_str, "type": "inflow", "amount": amt, "title": f"Recurring Income: {cp}"}
                    day_events.append(event)
                    critical_events.append(event)
                else:
                    day_outflows += amt
                    event = {"date": date_str, "type": "outflow", "amount": amt, "title": f"Recurring Bill: {cp}"}
                    day_events.append(event)
                    critical_events.append(event)

        # 2. Pending bills due on this exact date
        for bill in pending_bills:
            if bill.get("status") == "pending" and bill.get("due_date") == date_str:
                amt = float(bill.get("amount", 0.0))
                cp = bill.get("counterparty", "Bill")
                day_outflows += amt
                event = {"date": date_str, "type": "outflow", "amount": amt, "title": f"Pending Bill: {cp}"}
                day_events.append(event)
                critical_events.append(event)

        # 3. Debts due/expected on this date
        for debt in debts:
            if debt.get("status") != "settled" and debt.get("date") == date_str:
                amt = float(debt.get("amount", 0.0)) - float(debt.get("settled_amount", 0.0))
                if amt > 0: # They owe user -> inflow
                    day_inflows += amt
                    event = {"date": date_str, "type": "inflow", "amount": amt, "title": f"Debt Receivable: {debt.get('person')}"}
                    day_events.append(event)
                    critical_events.append(event)
                elif amt < 0: # User owes them -> outflow
                    out_amt = abs(amt)
                    day_outflows += out_amt
                    event = {"date": date_str, "type": "outflow", "amount": out_amt, "title": f"Debt Payable: {debt.get('person')}"}
                    day_events.append(event)
                    critical_events.append(event)

        # 4. Variable daily burn
        day_burn = daily_burn_rate if include_burn else 0.0
        
        # Balance computation
        current_balance = current_balance + day_inflows - day_outflows - day_burn
        
        if current_balance < min_balance:
            min_balance = current_balance
            min_balance_date = date_str

        if current_balance < threshold and not danger_detected:
            runway_days = day_idx
            danger_detected = True

        total_inflows += day_inflows
        total_scheduled_outflows += day_outflows
        total_estimated_burn += day_burn

        trajectory.append({
            "day": day_idx,
            "date": date_str,
            "balance": round(current_balance, 2),
            "inflows": round(day_inflows, 2),
            "outflows": round(day_outflows + day_burn, 2),
            "scheduled_outflow": round(day_outflows, 2),
            "daily_burn": round(day_burn, 2),
            "events": day_events
        })

    # Runway status determination
    if min_balance < 0:
        runway_status = "danger"
    elif min_balance < threshold:
        runway_status = "warning"
    else:
        runway_status = "healthy"

    return {
        "horizon_days": horizon_days,
        "starting_balance": round(starting_balance, 2),
        "current_date": start_dt.strftime("%Y-%m-%d"),
        "daily_burn_rate": round(daily_burn_rate, 2),
        "low_balance_threshold": round(threshold, 2),
        "summary": {
            "runway_days": runway_days if danger_detected else horizon_days,
            "runway_status": runway_status,
            "min_projected_balance": round(min_balance, 2),
            "min_balance_date": min_balance_date,
            "total_expected_inflows": round(total_inflows, 2),
            "total_scheduled_outflows": round(total_scheduled_outflows, 2),
            "total_estimated_burn": round(total_estimated_burn, 2),
            "ending_balance": round(current_balance, 2)
        },
        "critical_events": critical_events,
        "trajectory": trajectory
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest telegram-finance-bot/tests/test_cashflow_forecast.py -v`
Expected: PASS (2/2 tests pass).

- [ ] **Step 5: Commit**

```bash
git add telegram-finance-bot/cashflow_forecast.py telegram-finance-bot/tests/test_cashflow_forecast.py
git commit -m "feat(cashflow): implement simulation trajectory engine"
```

---

### Task 3: REST API Endpoints (`handlers/http_server.py`)

**Files:**
- Modify: `telegram-finance-bot/handlers/http_server.py`
- Test: `telegram-finance-bot/tests/test_cashflow_api.py`

**Interfaces:**
- Consumes: `cashflow_forecast.simulate_cashflow_forecast`, `db.update_user_cashflow_settings`, `db.get_user_cashflow_settings`
- Produces:
  - `GET /api/cashflow/forecast?horizon=30`
  - `POST /api/cashflow/settings`

- [ ] **Step 1: Write failing integration test for cashflow API endpoints**

Create `telegram-finance-bot/tests/test_cashflow_api.py`:
```python
import os
import tempfile
import unittest
import sys
import json
import urllib.request
import urllib.parse
import threading
import time
from socketserver import TCPServer

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db
from handlers.http_server import MultiUserHTTPRequestHandler

class TestCashflowAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db_fd, cls.db_path = tempfile.mkstemp()
        os.environ["DB_PATH"] = cls.db_path
        db.init_db()

        cls.user_uuid = "usr-api-cf-001"
        cls.telegram_user_id = 88888
        conn = db.get_connection()
        conn.execute("INSERT INTO users (telegram_user_id, token, user_uuid) VALUES (?, 'tok-api-cf', ?)", (cls.telegram_user_id, cls.user_uuid))
        conn.commit()
        conn.close()

        cls.session_token = db.create_user_session(cls.telegram_user_id)

        cls.server = TCPServer(("127.0.0.1", 0), MultiUserHTTPRequestHandler)
        cls.port = cls.server.server_address[1]
        cls.server_thread = threading.Thread(target=cls.server.serve_forever)
        cls.server_thread.daemon = True
        cls.server_thread.start()
        time.sleep(0.3)

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        os.close(cls.db_fd)
        os.unlink(cls.db_path)

    def test_cashflow_settings_and_forecast_api(self):
        # 1. Update Settings via POST
        url_settings = f"http://127.0.0.1:{self.port}/api/cashflow/settings"
        payload = {
            "token": self.session_token,
            "starting_liquid_balance": 180000.0,
            "low_balance_threshold": 20000.0,
            "include_daily_burn": True
        }
        req = urllib.request.Request(
            url_settings,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            self.assertTrue(data.get("success"))

        # 2. Query Forecast via GET
        url_forecast = f"http://127.0.0.1:{self.port}/api/cashflow/forecast?token={self.session_token}&horizon=30"
        with urllib.request.urlopen(url_forecast) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            self.assertEqual(data["starting_balance"], 180000.0)
            self.assertEqual(data["low_balance_threshold"], 20000.0)
            self.assertEqual(len(data["trajectory"]), 30)
            self.assertIn("summary", data)

if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest telegram-finance-bot/tests/test_cashflow_api.py -v`
Expected: FAIL with 404 Not Found for `/api/cashflow/settings`.

- [ ] **Step 3: Implement API endpoints in `handlers/http_server.py`**

In `telegram-finance-bot/handlers/http_server.py`:
1. Import `import cashflow_forecast`.
2. In `do_GET`, add route:
```python
        if parsed_path.path == "/api/cashflow/forecast":
            user_id = self.authenticate(parsed_path.query)
            if not user_id:
                self.send_response(401)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Unauthorized"}).encode("utf-8"))
                return

            query_params = urllib.parse.parse_qs(parsed_path.query)
            horizon = int(query_params.get("horizon", ["30"])[0])
            forecast = cashflow_forecast.simulate_cashflow_forecast(user_id, horizon_days=horizon)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(forecast).encode("utf-8"))
            return
```
3. In `do_POST`, add route:
```python
        if parsed_path.path == "/api/cashflow/settings":
            user_id = self.authenticate(post_data.get("token") or "")
            if not user_id:
                self.send_response(401)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Unauthorized"}).encode("utf-8"))
                return

            balance = float(post_data.get("starting_liquid_balance", 0.0))
            threshold = float(post_data.get("low_balance_threshold", 10000.0))
            include_burn = bool(post_data.get("include_daily_burn", True))
            as_of_date = post_data.get("balance_as_of_date")

            success = db.update_user_cashflow_settings(
                telegram_user_id=user_id,
                balance=balance,
                threshold=threshold,
                include_daily_burn=include_burn,
                as_of_date=as_of_date
            )
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"success": success}).encode("utf-8"))
            return
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest telegram-finance-bot/tests/test_cashflow_api.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add telegram-finance-bot/handlers/http_server.py telegram-finance-bot/tests/test_cashflow_api.py
git commit -m "feat(api): add GET /api/cashflow/forecast and POST /api/cashflow/settings"
```

---

### Task 4: Telegram Commands & Proactive Alerts (`handlers/commands.py`, `bot.py`, `handlers/messages.py`)

**Files:**
- Modify: `telegram-finance-bot/handlers/commands.py`
- Modify: `telegram-finance-bot/bot.py`
- Modify: `telegram-finance-bot/handlers/messages.py`
- Test: `telegram-finance-bot/tests/test_cashflow_commands.py`

**Interfaces:**
- Consumes: `cashflow_forecast.simulate_cashflow_forecast`
- Produces:
  - Command `/runway` and `/forecast`
  - Proactive runway dip alert text helper `check_runway_alert_after_expense(user_id, amount) -> Optional[str]`

- [ ] **Step 1: Write failing test for runway command formatting**

Create `telegram-finance-bot/tests/test_cashflow_commands.py`:
```python
import os
import tempfile
import unittest
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import db
import cashflow_forecast
from handlers.commands import format_runway_message

class TestCashflowCommands(unittest.TestCase):
    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp()
        os.environ["DB_PATH"] = self.db_path
        db.init_db()
        self.user_id = 77777
        db.update_user_cashflow_settings(self.user_id, balance=80000.0, threshold=10000.0)

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(self.db_path)

    def test_format_runway_message(self):
        forecast = cashflow_forecast.simulate_cashflow_forecast(self.user_id, horizon_days=30)
        msg = format_runway_message(forecast, dashboard_url="http://localhost:8080/dashboard")
        self.assertIn("Liquidity Runway", msg)
        self.assertIn("₹80,000", msg)
        self.assertIn("Dashboard", msg)

if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest telegram-finance-bot/tests/test_cashflow_commands.py -v`
Expected: FAIL with `ImportError: cannot import name 'format_runway_message'`.

- [ ] **Step 3: Implement `/runway` command and alert hooks**

In `telegram-finance-bot/handlers/commands.py`:
```python
import cashflow_forecast

def format_runway_message(forecast: dict, dashboard_url: str = "") -> str:
    summary = forecast["summary"]
    status_icon = "🟢" if summary["runway_status"] == "healthy" else ("🟡" if summary["runway_status"] == "warning" else "🔴")
    status_text = summary["runway_status"].capitalize()
    
    msg = (
        f"{status_icon} **30-Day Liquidity Runway & Cashflow**\n"
        f"───────────────────\n"
        f"• **Runway Status:** {status_text} ({summary['runway_days']} days)\n"
        f"• **Starting Liquid Cash:** ₹{forecast['starting_balance']:,.0f}\n"
        f"• **Min. Projected Dip:** ₹{summary['min_projected_balance']:,.0f} ({summary['min_balance_date']})\n"
        f"• **Est. Daily Burn:** ₹{forecast['daily_burn_rate']:,.0f}/day\n"
        f"• **Scheduled Outflows:** ₹{summary['total_scheduled_outflows']:,.0f}\n"
        f"• **Expected Inflows:** ₹{summary['total_expected_inflows']:,.0f}\n"
    )
    if forecast.get("critical_events"):
        msg += "\n📌 **Upcoming Key Events:**\n"
        for ev in forecast["critical_events"][:3]:
            icon = "🔻" if ev["type"] == "outflow" else "🔺"
            msg += f"  {icon} {ev['date']}: ₹{ev['amount']:,.0f} ({ev['title']})\n"
            
    if dashboard_url:
        msg += f"\n🌐 [Open Interactive Trajectory Chart]({dashboard_url})\n"
        
    return msg

@restricted
async def runway_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    login_code = db.create_temp_login_code(user_id)
    port = os.getenv("PORT", "8080")
    base_url = os.getenv("DASHBOARD_BASE_URL", f"http://localhost:{port}")
    dashboard_url = f"{base_url}/dashboard?login_code={login_code}"
    
    forecast = cashflow_forecast.simulate_cashflow_forecast(user_id, horizon_days=30)
    msg = format_runway_message(forecast, dashboard_url)
    await update.message.reply_text(msg, parse_mode="Markdown", disable_web_page_preview=True)
```

In `telegram-finance-bot/bot.py`:
Register commands:
```python
    app.add_handler(CommandHandler("runway", runway_cmd))
    app.add_handler(CommandHandler("forecast", runway_cmd))
```

In `telegram-finance-bot/handlers/messages.py`:
Add helper to append a runway alert if an expense breaches runway threshold.

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest telegram-finance-bot/tests/test_cashflow_commands.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add telegram-finance-bot/handlers/commands.py telegram-finance-bot/bot.py telegram-finance-bot/handlers/messages.py telegram-finance-bot/tests/test_cashflow_commands.py
git commit -m "feat(telegram): add /runway and /forecast commands with cashflow alerts"
```

---

### Task 5: Web Dashboard Visual Runway UI & Trajectory Chart (`dashboard/template.html`)

**Files:**
- Modify: `telegram-finance-bot/dashboard/template.html`

**Interfaces:**
- Consumes: `GET /api/cashflow/forecast`, `POST /api/cashflow/settings`
- Produces:
  - Top Runway & Cashflow KPI cards in Dashboard overview.
  - Interactive SVG Cashflow Trajectory Chart with hover point tooltip, min dip marker, and safety threshold guideline.
  - `#cashflow-settings-drawer` calibration drawer with form inputs for starting balance and threshold.

- [ ] **Step 1: Add HTML Structure for Cashflow Section & Calibration Drawer**

In `telegram-finance-bot/dashboard/template.html`:
1. Add Runway Summary Card Row (Grid):
   - **Liquidity Runway Card** (days remaining, badge with green/yellow/red).
   - **Liquid Balance Card** (current starting balance with ✏️ button).
   - **Lowest Projected Dip Card** (amount & date).
   - **Average Daily Burn Card** (₹/day).
2. Add Interactive Trajectory Chart Container (`#cashflow-chart-container`) with horizon switch buttons (30D / 60D).
3. Add Calibration Drawer (`#cashflow-settings-drawer`):
   - Input: Starting Liquid Cash Balance (₹)
   - Input: Low Balance Safety Threshold (₹)
   - Checkbox: Include Variable Discretionary Daily Spend
   - Button: Save & Recalibrate.

- [ ] **Step 2: Add CSS & Styling adhering to Subtle Gradient Design System**

Add sleek dark mode styles:
- SVG smooth Bézier curve `<path>` with gradient fill underneath (`--gradient-wash-primary`).
- Subtle grid lines, threshold dashed red line.
- Hover crosshairs with glassmorphism tooltip card showing date, balance, and event breakdown.

- [ ] **Step 3: Add Client-side JS Controller for Cashflow Simulation & Rendering**

Implement:
- `fetchCashflowForecast(horizon)`
- `renderCashflowTrajectory(data)`
- `openCashflowCalibrationDrawer()` / `saveCashflowSettings()`

- [ ] **Step 4: Run Full Test Suite**

Run: `pytest telegram-finance-bot/tests/ -v`
Expected: ALL tests pass (14+ test files).

- [ ] **Step 5: Commit**

```bash
git add telegram-finance-bot/dashboard/template.html
git commit -m "feat(dashboard): add liquidity runway cards, trajectory chart, and calibration drawer"
```

---

### Task 6: End-to-End Verification & Browser Testing

**Files:**
- Test via Browser Subagent & Pytest

- [ ] **Step 1: Run comprehensive pytest suite**
Run: `pytest telegram-finance-bot/tests/ -v`
Expected: 100% PASS.

- [ ] **Step 2: Launch local test instance and verify interactive UI in browser**
Use `browser_subagent` to navigate to `http://127.0.0.1:8080/dashboard`, open the cashflow calibration drawer, update the starting balance, and confirm the trajectory chart re-renders dynamically.

- [ ] **Step 3: Run `graphify update .`**
Run: `graphify update .` to keep knowledge graph up to date.

- [ ] **Step 4: Commit and finalize**
```bash
git add graphify-out/
git commit -m "chore(graphify): update knowledge graph for cashflow forecasting"
```
