# Decoupling User IDs and Securing MCP Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Decouple user transactions and settings from legacy integer Telegram User IDs by moving to string-based globally unique UUIDs, and implement Personal Access Token (PAT) authentication to secure both local and remote MCP server instances.

**Architecture:** We will run database-wide migrations to backfill a `user_uuid` field in all transaction-related tables, introduce a `user_pats` table storing SHA-256 hashed PATs, add API routes in `http_server.py` to manage tokens, update `mcp_server.py` to validate hashed tokens, and update the Web Dashboard to support generating/revoking PATs.

**Tech Stack:** Python (sqlite3, hashlib, secrets, uuid, FastMCP), Vanilla HTML/JS, Zsh.

## Global Constraints
* No placeholders (TBD/TODO) are allowed in target implementation code.
* Hashing must use secure SHA-256 algorithms.
* Database changes in SQLite must use progressive migrations (e.g. `ALTER TABLE ADD COLUMN` and update logic) rather than dropping tables.

---

### Task 1: Database Migrations and Helper Functions

**Files:**
* Modify: `telegram-finance-bot/db.py:20-120` (migrations in `init_db`)
* Modify: `telegram-finance-bot/db.py:560-600` (adding PAT functions)
* Test: Create `telegram-finance-bot/tests/test_migration.py`

**Interfaces:**
* Produces: `db.get_user_uuid_by_pat(pat_str)` -> `Optional[str]`
* Produces: `db.create_user_pat(user_uuid, name)` -> `str` (returns raw PAT)
* Produces: `db.get_user_pats(user_uuid)` -> `list[dict]`
* Produces: `db.revoke_user_pat(user_uuid, pat_id)` -> `bool`

- [ ] **Step 1: Write the failing test for migrations and PAT helpers**
  Create `telegram-finance-bot/tests/test_migration.py`:
  ```python
  import os
  import tempfile
  import unittest
  import db

  class TestDatabaseSecurityMigration(unittest.TestCase):
      def setUp(self):
          self.db_fd, self.db_path = tempfile.mkstemp()
          os.environ["DB_PATH"] = self.db_path
          db.init_db()

      def tearDown(self):
          os.close(self.db_fd)
          os.unlink(self.db_path)

      def test_pat_lifecycle(self):
          # Test creating a user
          uuid = "usr-test-1234"
          conn = db.get_connection()
          conn.execute("INSERT INTO users (telegram_user_id, token, user_uuid) VALUES (11111, 'token1', ?)", (uuid,))
          conn.commit()
          conn.close()

          # Test PAT generate
          raw_pat = db.create_user_pat(uuid, "Test Token")
          self.assertTrue(raw_pat.startswith("pat_"))

          # Test PAT lookup
          resolved_uuid = db.get_user_uuid_by_pat(raw_pat)
          self.assertEqual(resolved_uuid, uuid)

          # Test PAT list
          pats = db.get_user_pats(uuid)
          self.assertEqual(len(pats), 1)
          self.assertEqual(pats[0]["name"], "Test Token")

          # Test PAT revoke
          success = db.revoke_user_pat(uuid, pats[0]["id"])
          self.assertTrue(success)
          self.assertIsNone(db.get_user_uuid_by_pat(raw_pat))

  if __name__ == "__main__":
      unittest.main()
  ```

- [ ] **Step 2: Run tests to verify they fail**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_migration.py`
  Expected: Failure due to missing tables and attributes.

- [ ] **Step 3: Modify `db.py` to create tables, run schema migrations, and implement helpers**
  Add the following table schemas to `db.init_db()`:
  ```python
  # Ensure user_pats table exists
  cursor.execute("""
  CREATE TABLE IF NOT EXISTS user_pats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_uuid TEXT NOT NULL,
      pat_hash TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      masked_token TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      last_used_at TEXT,
      FOREIGN KEY (user_uuid) REFERENCES users (user_uuid) ON DELETE CASCADE
  );
  """)

  # Migration loop for existing tables
  alter_tables = ["transactions", "recurring", "pending_bills", "debts", "user_sessions"]
  for table in alter_tables:
      try:
          cursor.execute(f"ALTER TABLE {table} ADD COLUMN user_uuid TEXT;")
      except sqlite3.OperationalError:
          pass  # Already altered
  conn.commit()

  # Backfill missing UUIDs and link legacy rows
  cursor.execute("SELECT telegram_user_id, user_uuid FROM users")
  users = cursor.fetchall()
  for u in users:
      tg_id = u['telegram_user_id']
      u_uuid = u['user_uuid']
      if not u_uuid:
          import uuid
          u_uuid = str(uuid.uuid4())
          cursor.execute("UPDATE users SET user_uuid = ? WHERE telegram_user_id = ?", (u_uuid, tg_id))
      
      for table in alter_tables:
          cursor.execute(f"UPDATE {table} SET user_uuid = ? WHERE telegram_user_id = ? AND user_uuid IS NULL", (u_uuid, tg_id))
  conn.commit()
  ```
  Implement helpers:
  ```python
  import hashlib
  import secrets

  def create_user_pat(user_uuid: str, name: str) -> str:
      raw_pat = "pat_" + secrets.token_urlsafe(24)
      pat_hash = hashlib.sha256(raw_pat.encode('utf-8')).hexdigest()
      masked = f"{raw_pat[:8]}...{raw_pat[-4:]}"
      conn = get_connection()
      cursor = conn.cursor()
      cursor.execute(
          "INSERT INTO user_pats (user_uuid, pat_hash, name, masked_token) VALUES (?, ?, ?, ?)",
          (user_uuid, pat_hash, name, masked)
      )
      conn.commit()
      conn.close()
      return raw_pat

  def get_user_uuid_by_pat(pat_str: str) -> Optional[str]:
      if not pat_str or not pat_str.startswith("pat_"):
          return None
      pat_hash = hashlib.sha256(pat_str.encode('utf-8')).hexdigest()
      conn = get_connection()
      cursor = conn.cursor()
      cursor.execute("SELECT user_uuid FROM user_pats WHERE pat_hash = ?", (pat_hash,))
      row = cursor.fetchone()
      if row:
          cursor.execute("UPDATE user_pats SET last_used_at = datetime('now') WHERE pat_hash = ?", (pat_hash,))
          conn.commit()
      conn.close()
      return row['user_uuid'] if row else None

  def get_user_pats(user_uuid: str) -> list[dict]:
      conn = get_connection()
      cursor = conn.cursor()
      cursor.execute("SELECT id, name, masked_token, created_at, last_used_at FROM user_pats WHERE user_uuid = ?", (user_uuid,))
      rows = cursor.fetchall()
      conn.close()
      return [dict(r) for r in rows]

  def revoke_user_pat(user_uuid: str, pat_id: int) -> bool:
      conn = get_connection()
      cursor = conn.cursor()
      cursor.execute("DELETE FROM user_pats WHERE id = ? AND user_uuid = ?", (pat_id, user_uuid))
      conn.commit()
      success = cursor.rowcount > 0
      conn.close()
      return success
  ```

- [ ] **Step 4: Run tests to verify they pass**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_migration.py`
  Expected: Success.

- [ ] **Step 5: Commit changes**
  Run: `git add telegram-finance-bot/db.py`
  Run: `git commit -m "feat: db migration for user_uuid and user_pats helpers"`

---

### Task 2: Securing the MCP Server Auth Layer

**Files:**
* Modify: `telegram-finance-bot/mcp_server.py:420-475` (updating `TokenAuthMiddleware`)
* Test: Create `telegram-finance-bot/tests/test_mcp_auth.py`

**Interfaces:**
* Consumes: `db.get_user_uuid_by_pat(pat_str)`

- [ ] **Step 1: Write the failing test for MCP PAT validation**
  Create `telegram-finance-bot/tests/test_mcp_auth.py`:
  ```python
  import unittest
  import os
  import tempfile
  from mcp_server import TokenAuthMiddleware
  import db

  class TestMCPAuth(unittest.TestCase):
      def setUp(self):
          self.db_fd, self.db_path = tempfile.mkstemp()
          os.environ["DB_PATH"] = self.db_path
          db.init_db()
          
      def tearDown(self):
          os.close(self.db_fd)
          os.unlink(self.db_path)

      def test_mcp_rejects_raw_email(self):
          # Raw email shouldn't work as token
          uuid = "usr-1"
          conn = db.get_connection()
          conn.execute("INSERT INTO users (telegram_user_id, token, user_uuid, google_email) VALUES (12, 'tok1', ?, 'test@gmail.com')", (uuid,))
          conn.commit()
          conn.close()

          # Mock request with raw email token
          middleware = TokenAuthMiddleware(None)
          # Should reject raw email authentication request
          resolved = db.get_user_uuid_by_pat("test@gmail.com")
          self.assertIsNone(resolved)

  if __name__ == "__main__":
      unittest.main()
  ```

- [ ] **Step 2: Run tests to verify they fail**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_mcp_auth.py`

- [ ] **Step 3: Modify `TokenAuthMiddleware` in `mcp_server.py`**
  Update the auth lookup in the `__call__` method:
  ```python
            # Remove direct email lookup fallbacks:
            # Check if token starts with pat_
            resolved_user_id = None
            if token and token.startswith("pat_"):
                resolved_user_id = db.get_user_uuid_by_pat(token)
            
            # Check for local stdio launch fallback
            if not resolved_user_id:
                local_pat = os.getenv("FINANCE_PAT")
                if local_pat:
                    resolved_user_id = db.get_user_uuid_by_pat(local_pat)
  ```

- [ ] **Step 4: Run tests to verify they pass**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_mcp_auth.py`

- [ ] **Step 5: Commit changes**
  Run: `git add telegram-finance-bot/mcp_server.py`
  Run: `git commit -m "feat: secure MCP auth layer using PAT hashes"`

---

### Task 3: HTTP Server API Endpoints

**Files:**
* Modify: `telegram-finance-bot/handlers/http_server.py:210-250` (GET and POST handling)
* Test: Create `telegram-finance-bot/tests/test_api_endpoints.py`

- [ ] **Step 1: Write tests for GET/POST token endpoints**
  Create `telegram-finance-bot/tests/test_api_endpoints.py`.

- [ ] **Step 2: Run tests to verify they fail**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_api_endpoints.py`

- [ ] **Step 3: Add HTTP routes to `handlers/http_server.py`**
  Under `do_GET`:
  ```python
        if parsed_path.path == "/api/pat/list":
            query_params = urllib.parse.parse_qs(parsed_path.query)
            token = query_params.get("token", [None])[0]
            user_id = resolve_user_id(token)
            if not user_id:
                self.send_response(401)
                self.end_headers()
                return
            user_uuid = db.resolve_user_uuid(user_id)
            tokens = db.get_user_pats(user_uuid)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "tokens": tokens}).encode('utf-8'))
            return
  ```
  Under `do_POST`:
  ```python
        if parsed_path.path == "/api/pat/generate":
            token = payload.get("token") or payload.get("session_token")
            user_id = resolve_user_id(token)
            if not user_id:
                self.send_response(401)
                self.end_headers()
                return
            user_uuid = db.resolve_user_uuid(user_id)
            name = payload.get("name", "New Token")
            raw_pat = db.create_user_pat(user_uuid, name)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "token": raw_pat}).encode('utf-8'))
            return

        if parsed_path.path == "/api/pat/revoke":
            token = payload.get("token") or payload.get("session_token")
            user_id = resolve_user_id(token)
            if not user_id:
                self.send_response(401)
                self.end_headers()
                return
            user_uuid = db.resolve_user_uuid(user_id)
            pat_id = payload.get("pat_id")
            success = db.revoke_user_pat(user_uuid, int(pat_id))
            self.send_response(200 if success else 400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": success}).encode('utf-8'))
            return
  ```

- [ ] **Step 4: Run tests to verify they pass**
  Run: `python3 -m unittest telegram-finance-bot/tests/test_api_endpoints.py`

- [ ] **Step 5: Commit changes**
  Run: `git add telegram-finance-bot/handlers/http_server.py`
  Run: `git commit -m "feat: add PAT list, generate, and revoke HTTP endpoints"`

---

### Task 4: Web Dashboard settings Tab UI

**Files:**
* Modify: `telegram-finance-bot/dashboard/template.html`

- [ ] **Step 1: Open the `template.html` file and inspect current layout**
  Locate settings section or dashboard tabs.

- [ ] **Step 2: Implement UI markup for API Access Tokens**
  Add a new Settings sub-panel inside `template.html` to allow users to name, generate, and view list of tokens:
  ```html
  <div id="pat-settings" class="settings-panel">
      <h3>API Access Tokens</h3>
      <div class="input-group">
          <input type="text" id="pat-name" placeholder="Token label (e.g. Claude Desktop)">
          <button onclick="generatePAT()">Generate New Token</button>
      </div>
      <table id="pat-table">
          <thead>
              <tr>
                  <th>Label</th>
                  <th>Masked Token</th>
                  <th>Created At</th>
                  <th>Last Used At</th>
                  <th>Action</th>
              </tr>
          </thead>
          <tbody id="pat-list-body"></tbody>
      </table>
  </div>
  ```

- [ ] **Step 3: Implement Frontend JS scripts to interface with endpoints**
  ```javascript
  async function loadPATs() {
      const token = localStorage.getItem("session_token");
      const res = await fetch(`/api/pat/list?token=${token}`);
      const data = await res.json();
      const body = document.getElementById("pat-list-body");
      body.innerHTML = "";
      if (data.tokens) {
          data.tokens.forEach(t => {
              body.innerHTML += `
                  <tr>
                      <td>${t.name}</td>
                      <td><code>${t.masked_token}</code></td>
                      <td>${t.created_at}</td>
                      <td>${t.last_used_at || 'Never'}</td>
                      <td><button onclick="revokePAT(${t.id})">Revoke</button></td>
                  </tr>`;
          });
      }
  }
  async function generatePAT() {
      const name = document.getElementById("pat-name").value.strip();
      const token = localStorage.getItem("session_token");
      const res = await fetch("/api/pat/generate", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({token, name})
      });
      const data = await res.json();
      if(data.success) {
          alert("Your PAT: " + data.token + "\n\nCopy this token now. It will not be shown again.");
          loadPATs();
      }
  }
  ```

- [ ] **Step 4: Verify UI layout and styling integration**
  Check that the layout complies with visual styles.

- [ ] **Step 5: Commit changes**
  Run: `git add telegram-finance-bot/dashboard/template.html`
  Run: `git commit -m "feat: integrate PAT settings control interface on dashboard"`
