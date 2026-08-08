# Wealth Monitor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the personal finance logger with an overall Wealth Monitor dashboard tab, featuring assets/liabilities tracking, secure document uploads, and an AI-driven financial health audit based on Monika Halan's and Morgan Housel's rules.

**Architecture:** Create isolated domains (`db_wealth.py`, `wealth_server.py`, `manana_wealth.py`) to keep the core transaction bot intact. Expose views in the dashboard via a modular tab switch, loading CSS and JS scripts from a subfolder.

**Tech Stack:** Python 3.11+, SQLite, Google Gemini API, Vanilla HTML/CSS/JS.

## Global Constraints
- **Separation of Concerns**: Never import `db_wealth.py` or wealth API logic into the core transaction logging code (`bot.py`, `db.py`, `categorize.py`).
- **Secure File Storage**: Hashed and randomized filenames for user uploaded documents saved under `./data/documents/<user_uuid>/`.
- **Multi-Tenant Boundaries**: Every API request must authenticate user sessions or PATs to isolate `user_uuid` before reading/writing wealth data.

---

### Task 1: Database Migration & Schema Setup

**Files:**
- Create: `telegram-finance-bot/db_wealth.py`
- Test: `telegram-finance-bot/tests/test_wealth_db.py`

**Interfaces:**
- Produces: 
  - `init_wealth_db() -> None`
  - `add_wealth_asset(user_uuid: str, type: str, subtype: str, name: str, valuation: float, notes: str = None, source: str = 'manual') -> int`
  - `get_wealth_assets(user_uuid: str) -> list[dict]`
  - `add_wealth_liability(user_uuid: str, institution: str, loan_ac_no: str, sanctioned_amount: float, principal_outstanding: float, interest_rate: float, emi: float, remaining_tenure_months: int, next_emi_date: str) -> int`
  - `get_wealth_liabilities(user_uuid: str) -> list[dict]`
  - `add_nominee_item(user_uuid: str, account_name: str, nominee_name: str = None, status: str = 'missing', is_ai_suggested: int = 0) -> int`
  - `get_nominee_checklist(user_uuid: str) -> list[dict]`
  - `toggle_nominee_item(user_uuid: str, item_id: int, nominee_name: str, status: str) -> bool`

- [ ] **Step 1: Write database schema and CRUD unit tests**
  Write code in `telegram-finance-bot/tests/test_wealth_db.py`:
  ```python
  import os
  import tempfile
  import unittest
  import sys

  sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
  import db
  import db_wealth

  class TestWealthDB(unittest.TestCase):
      def setUp(self):
          self.db_fd, self.db_path = tempfile.mkstemp()
          os.environ["DB_PATH"] = self.db_path
          db.init_db()
          db_wealth.init_wealth_db()

      def tearDown(self):
          os.close(self.db_fd)
          os.unlink(self.db_path)

      def test_wealth_crud(self):
          user = "usr-test-999"
          asset_id = db_wealth.add_wealth_asset(user, "vehicle", "car", "Creta SUV", 1500000.0)
          self.assertTrue(asset_id > 0)
          assets = db_wealth.get_wealth_assets(user)
          self.assertEqual(len(assets), 1)
          self.assertEqual(assets[0]["name"], "Creta SUV")
  ```

- [ ] **Step 2: Run test to verify failure**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_wealth_db.py`
  Expected: ModuleNotFoundError or AttributeError.

- [ ] **Step 3: Implement database migrations & CRUD helper functions**
  Create `telegram-finance-bot/db_wealth.py`:
  ```python
  import sqlite3
  from typing import Any, Optional, List, Dict
  import db

  def get_connection():
      return db.get_connection()

  def init_wealth_db():
      conn = get_connection()
      cursor = conn.cursor()
      cursor.execute("""
          CREATE TABLE IF NOT EXISTS user_wealth_assets (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_uuid TEXT NOT NULL,
              type TEXT NOT NULL,
              subtype TEXT NOT NULL,
              name TEXT NOT NULL,
              valuation REAL NOT NULL,
              notes TEXT,
              source TEXT DEFAULT 'manual',
              last_synced_at TEXT
          );
      """)
      cursor.execute("""
          CREATE TABLE IF NOT EXISTS user_wealth_liabilities (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_uuid TEXT NOT NULL,
              institution TEXT NOT NULL,
              loan_ac_no TEXT NOT NULL,
              sanctioned_amount REAL NOT NULL,
              principal_outstanding REAL NOT NULL,
              interest_rate REAL NOT NULL,
              emi REAL NOT NULL,
              remaining_tenure_months INTEGER NOT NULL,
              next_emi_date TEXT
          );
      """)
      cursor.execute("""
          CREATE TABLE IF NOT EXISTS user_nominee_checklist (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_uuid TEXT NOT NULL,
              account_name TEXT NOT NULL,
              nominee_name TEXT,
              status TEXT DEFAULT 'missing',
              is_ai_suggested INTEGER DEFAULT 0,
              created_at TEXT DEFAULT CURRENT_TIMESTAMP
          );
      """)
      cursor.execute("""
          CREATE TABLE IF NOT EXISTS user_wealth_documents (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_uuid TEXT NOT NULL,
              associated_type TEXT NOT NULL,
              associated_id INTEGER NOT NULL,
              file_name TEXT NOT NULL,
              file_path TEXT NOT NULL,
              uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
          );
      """)
      conn.commit()
      conn.close()

  def add_wealth_asset(user_uuid: str, type: str, subtype: str, name: str, valuation: float, notes: str = None, source: str = 'manual') -> int:
      conn = get_connection()
      cursor = conn.cursor()
      cursor.execute(
          "INSERT INTO user_wealth_assets (user_uuid, type, subtype, name, valuation, notes, source) VALUES (?, ?, ?, ?, ?, ?, ?)",
          (user_uuid, type, subtype, name, valuation, notes, source)
      )
      row_id = cursor.lastrowid
      conn.commit()
      conn.close()
      return row_id

  def get_wealth_assets(user_uuid: str) -> List[Dict[str, Any]]:
      conn = get_connection()
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM user_wealth_assets WHERE user_uuid = ?", (user_uuid,))
      rows = [dict(r) for r in cursor.fetchall()]
      conn.close()
      return rows

  def add_wealth_liability(user_uuid: str, institution: str, loan_ac_no: str, sanctioned_amount: float, principal_outstanding: float, interest_rate: float, emi: float, remaining_tenure_months: int, next_emi_date: str) -> int:
      conn = get_connection()
      cursor = conn.cursor()
      cursor.execute(
          "INSERT INTO user_wealth_liabilities (user_uuid, institution, loan_ac_no, sanctioned_amount, principal_outstanding, interest_rate, emi, remaining_tenure_months, next_emi_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          (user_uuid, institution, loan_ac_no, sanctioned_amount, principal_outstanding, interest_rate, emi, remaining_tenure_months, next_emi_date)
      )
      row_id = cursor.lastrowid
      conn.commit()
      conn.close()
      return row_id

  def get_wealth_liabilities(user_uuid: str) -> List[Dict[str, Any]]:
      conn = get_connection()
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM user_wealth_liabilities WHERE user_uuid = ?", (user_uuid,))
      rows = [dict(r) for r in cursor.fetchall()]
      conn.close()
      return rows

  def add_nominee_item(user_uuid: str, account_name: str, nominee_name: str = None, status: str = 'missing', is_ai_suggested: int = 0) -> int:
      conn = get_connection()
      cursor = conn.cursor()
      cursor.execute(
          "INSERT INTO user_nominee_checklist (user_uuid, account_name, nominee_name, status, is_ai_suggested) VALUES (?, ?, ?, ?, ?)",
          (user_uuid, account_name, nominee_name, status, is_ai_suggested)
      )
      row_id = cursor.lastrowid
      conn.commit()
      conn.close()
      return row_id

  def get_nominee_checklist(user_uuid: str) -> List[Dict[str, Any]]:
      conn = get_connection()
      cursor = conn.cursor()
      cursor.execute("SELECT * FROM user_nominee_checklist WHERE user_uuid = ?", (user_uuid,))
      rows = [dict(r) for r in cursor.fetchall()]
      conn.close()
      return rows

  def toggle_nominee_item(user_uuid: str, item_id: int, nominee_name: str, status: str) -> bool:
      conn = get_connection()
      cursor = conn.cursor()
      cursor.execute(
          "UPDATE user_nominee_checklist SET nominee_name = ?, status = ? WHERE id = ? AND user_uuid = ?",
          (nominee_name, status, item_id, user_uuid)
      )
      affected = cursor.rowcount
      conn.commit()
      conn.close()
      return affected > 0
  ```

- [ ] **Step 4: Run test to verify success**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_wealth_db.py`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add telegram-finance-bot/db_wealth.py telegram-finance-bot/tests/test_wealth_db.py
  git commit -m "feat: db_wealth schemas and CRUD helper methods"
  ```

---

### Task 2: API Endpoints & Request Handlers

**Files:**
- Create: `telegram-finance-bot/handlers/wealth_server.py`
- Modify: `telegram-finance-bot/handlers/http_server.py` (delegate `/api/wealth/*` routes)
- Test: `telegram-finance-bot/tests/test_wealth_api.py`

- [ ] **Step 1: Write HTTP endpoint integration tests**
  Write code in `telegram-finance-bot/tests/test_wealth_api.py`:
  ```python
  import os
  import tempfile
  import unittest
  import sys
  import json
  import urllib.request

  sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
  import db
  import db_wealth

  class TestWealthAPI(unittest.TestCase):
      def setUp(self):
          self.db_fd, self.db_path = tempfile.mkstemp()
          os.environ["DB_PATH"] = self.db_path
          db.init_db()
          db_wealth.init_wealth_db()

          # Setup mock user & session
          self.user_uuid = "usr-test-888"
          self.telegram_user_id = 88888
          conn = db.get_connection()
          conn.execute("INSERT INTO users (telegram_user_id, token, user_uuid) VALUES (?, 'tok-wealth', ?)", (self.telegram_user_id, self.user_uuid))
          conn.commit()
          conn.close()
          self.session_token = db.create_user_session(self.telegram_user_id)

      def tearDown(self):
          os.close(self.db_fd)
          os.unlink(self.db_path)

      # Actual tests will run against mock HTTP server; we will verify router mapping
  ```

- [ ] **Step 2: Run test to verify failure**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_wealth_api.py`
  Expected: FAIL/Error.

- [ ] **Step 3: Implement wealth router and HTTP APIs**
  Create `telegram-finance-bot/handlers/wealth_server.py`:
  ```python
  import json
  import db
  import db_wealth

  def handle_wealth_get(handler, parsed_path, user_id):
      user_uuid = db.resolve_user_uuid(user_id)
      assets = db_wealth.get_wealth_assets(user_uuid)
      liabilities = db_wealth.get_wealth_liabilities(user_uuid)
      nominees = db_wealth.get_nominee_checklist(user_uuid)
      
      handler.send_response(200)
      handler.send_header("Content-Type", "application/json")
      handler.send_header("Access-Control-Allow-Origin", "*")
      handler.end_headers()
      handler.wfile.write(json.dumps({
          "success": True,
          "assets": assets,
          "liabilities": liabilities,
          "nominees": nominees
      }).encode("utf-8"))

  def handle_wealth_post(handler, parsed_path, payload, user_id):
      user_uuid = db.resolve_user_uuid(user_id)
      
      if parsed_path.path == "/api/wealth/assets/update":
          w_type = payload.get("type")
          subtype = payload.get("subtype", "manual")
          name = payload.get("name")
          valuation = float(payload.get("valuation", 0))
          notes = payload.get("notes", "")
          
          row_id = db_wealth.add_wealth_asset(user_uuid, w_type, subtype, name, valuation, notes)
          handler.send_response(200)
          handler.send_header("Content-Type", "application/json")
          handler.send_header("Access-Control-Allow-Origin", "*")
          handler.end_headers()
          handler.wfile.write(json.dumps({"success": True, "id": row_id}).encode("utf-8"))
          return True

      if parsed_path.path == "/api/wealth/liabilities/update":
          institution = payload.get("institution")
          loan_ac_no = payload.get("loan_ac_no")
          sanctioned = float(payload.get("sanctioned_amount", 0))
          outstanding = float(payload.get("principal_outstanding", 0))
          rate = float(payload.get("interest_rate", 0))
          emi = float(payload.get("emi", 0))
          tenure = int(payload.get("remaining_tenure_months", 0))
          next_date = payload.get("next_emi_date", "")
          
          row_id = db_wealth.add_wealth_liability(user_uuid, institution, loan_ac_no, sanctioned, outstanding, rate, emi, tenure, next_date)
          handler.send_response(200)
          handler.send_header("Content-Type", "application/json")
          handler.send_header("Access-Control-Allow-Origin", "*")
          handler.end_headers()
          handler.wfile.write(json.dumps({"success": True, "id": row_id}).encode("utf-8"))
          return True
          
      return False
  ```
  
  Modify `telegram-finance-bot/handlers/http_server.py` to route `/api/wealth/*` requests:
  - Add router imports and switch statement inside `do_GET` and `do_POST`.

- [ ] **Step 4: Run tests to verify passing**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_wealth_api.py`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add telegram-finance-bot/handlers/wealth_server.py telegram-finance-bot/handlers/http_server.py
  git commit -m "feat: wealth API server router and endpoints"
  ```

---

### Task 3: Secure Document Vault Upload & Stream

**Files:**
- Modify: `telegram-finance-bot/handlers/wealth_server.py` (add file handlers)
- Test: `telegram-finance-bot/tests/test_wealth_api.py` (add upload/download tests)

- [ ] **Step 1: Add document upload/download test cases**
  Write tests in `telegram-finance-bot/tests/test_wealth_api.py` validating that document download requests verify the user's secure token and block unauthorized files.

- [ ] **Step 2: Run test to verify failure**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_wealth_api.py`
  Expected: Fail.

- [ ] **Step 3: Implement multipart upload parsing and secure file streaming**
  Modify `telegram-finance-bot/handlers/wealth_server.py`:
  - Implement `/api/wealth/document/upload` using boundary parsing or `cgi.FieldStorage` (respecting Python 3.11/3.12/3.13 deprecations, fallback to standard stream slice if `cgi` is absent).
  - Implement file viewing in `do_GET` route mapping: stream file with headers `Content-Disposition: inline` and `Content-Type: application/pdf`.

- [ ] **Step 4: Run test to verify success**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_wealth_api.py`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add telegram-finance-bot/handlers/wealth_server.py
  git commit -m "feat: secure document vault upload and download streams"
  ```

---

### Task 4: AI Audit Engine & Prompts

**Files:**
- Create: `telegram-finance-bot/src/manana_wealth.py`
- Modify: `telegram-finance-bot/handlers/wealth_server.py` (add `/api/wealth/audit`)
- Test: `telegram-finance-bot/tests/test_wealth_audit.py`

- [ ] **Step 1: Write test case for the AI Prosperity Audit**
  Create `telegram-finance-bot/tests/test_wealth_audit.py` and mock the Gemini API client response.

- [ ] **Step 2: Run test to verify failure**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_wealth_audit.py`
  Expected: Fail.

- [ ] **Step 3: Implement manana_wealth.py prompts & Gemini caller**
  Create `telegram-finance-bot/src/manana_wealth.py` implementing the CBT CBT-style nominee scan, prepayment optimization, and Monika Halan ratios.
  Modify `telegram-finance-bot/handlers/wealth_server.py` to route `/api/wealth/audit`.

- [ ] **Step 4: Run test to verify success**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_wealth_audit.py`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add telegram-finance-bot/src/manana_wealth.py telegram-finance-bot/handlers/wealth_server.py
  git commit -m "feat: AI wealth audit engine using Gemini prompts"
  ```

---

### Task 5: Frontend UI & Tab Integration

**Files:**
- Create: `telegram-finance-bot/dashboard/wealth/wealth.css`
- Create: `telegram-finance-bot/dashboard/wealth/wealth.js`
- Modify: `telegram-finance-bot/dashboard/template.html`

- [ ] **Step 1: Write integration tests**
  Write tests in `telegram-finance-bot/tests/test_api_endpoints.py` to verify that assets, liabilities, and UI scripts load properly.

- [ ] **Step 2: Run test to verify failure**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_api_endpoints.py`
  Expected: Fail.

- [ ] **Step 3: Implement HTML layout, CSS rules, and JS rendering functions**
  Create `dashboard/wealth/wealth.css` and `dashboard/wealth/wealth.js`.
  Update `template.html` to integrate the tab switcher and render the components.

- [ ] **Step 4: Run test to verify success**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_api_endpoints.py`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add telegram-finance-bot/dashboard/
  git commit -m "feat: wealth tab frontend UI layout and script integrations"
  ```
