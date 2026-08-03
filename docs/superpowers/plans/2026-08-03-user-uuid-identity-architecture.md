# Enterprise User UUID & Identity Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the identity system in `telegram-finance-bot` to decouple user identity from raw PII (Telegram IDs / emails) by implementing an internal, immutable `user_uuid` (UUIDv4) mapping layer with 100% backward compatibility and zero data loss.

**Architecture:** Add `users` and `auth_identities` tables to `db.py`. Migrations generate a `user_uuid` for every user, map existing Telegram IDs and Google emails as provider identities, add `user_uuid` columns to all core financial tables (`transactions`, `debts`, `recurring`, `pending_bills`), and provide a `resolve_user_uuid()` resolution helper to preserve backward compatibility.

**Tech Stack:** Python 3.11+, SQLite3 (WAL mode), pytest, Docker.

## Global Constraints

* Data loss is unacceptable: a pre-flight database backup snapshot MUST be created before running schema migrations.
* Backward compatibility is mandatory: existing API endpoints and functions taking `telegram_user_id` or `google_email` MUST continue working via `resolve_user_uuid()`.
* Tests MUST pass before claiming completion.

---

### Task 1: Database Migration & Identity Schema

**Files:**
- Modify: `telegram-finance-bot/db.py:17-100`
- Test: `telegram-finance-bot/test_auth_sso.py`

**Interfaces:**
- Consumes: None (Foundation layer)
- Produces: `users` table, `auth_identities` table, `user_uuid` columns on `transactions`, `debts`, `recurring`, `pending_bills`

- [ ] **Step 1: Write failing unit test for `users` and `auth_identities` creation**

Edit `telegram-finance-bot/test_auth_sso.py` to add:
```python
def test_identity_schema_creation(tmp_path):
    import os, sqlite3, db
    test_db = os.path.join(tmp_path, "test_schema.db")
    os.environ["DB_PATH"] = test_db
    db.init_db()
    conn = sqlite3.connect(test_db)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'auth_identities');")
    tables = [row[0] for row in cursor.fetchall()]
    assert "users" in tables
    assert "auth_identities" in tables
```

- [ ] **Step 2: Run test to verify failure**

Run: `../.venv/bin/pytest test_auth_sso.py -k test_identity_schema_creation`
Expected: FAIL (tables `users` / `auth_identities` missing expected columns/structure)

- [ ] **Step 3: Implement schema creation & `migrate_db()` backfill in `db.py`**

In `telegram-finance-bot/db.py`:
Update `init_db()` and `migrate_db()` to:
1. Create `users` (user_uuid TEXT PRIMARY KEY, primary_email TEXT UNIQUE, created_at TEXT).
2. Create `auth_identities` (id INTEGER PRIMARY KEY, user_uuid TEXT, provider TEXT, provider_uid TEXT, created_at TEXT, UNIQUE(provider, provider_uid)).
3. Add `user_uuid TEXT` column to `transactions`, `debts`, `recurring`, `pending_bills` if not present.
4. Backfill: For each existing `telegram_user_id` in `users`, generate `usr_<uuidv4>`, insert into `auth_identities (user_uuid, 'telegram', str(telegram_user_id))`, insert `google_email` identity if present, and UPDATE domain tables setting `user_uuid`.

- [ ] **Step 4: Run test to verify it passes**

Run: `../.venv/bin/pytest test_auth_sso.py -k test_identity_schema_creation`
Expected: PASS

- [ ] **Step 5: Commit Task 1**

```bash
git add db.py test_auth_sso.py
git commit -m "feat(db): add user_uuid and auth_identities schema with backfill migration"
```

---

### Task 2: Identity Resolution & Helper Functions

**Files:**
- Modify: `telegram-finance-bot/db.py:240-300`
- Test: `telegram-finance-bot/test_auth_sso.py`

**Interfaces:**
- Consumes: `users` and `auth_identities` tables from Task 1
- Produces: `resolve_user_uuid(identifier: Union[str, int]) -> Optional[str]`, `get_or_create_user_by_identity(provider: str, provider_uid: str, email: str = None) -> str`

- [ ] **Step 1: Write failing test for `resolve_user_uuid` and `get_or_create_user_by_identity`**

Add to `telegram-finance-bot/test_auth_sso.py`:
```python
def test_identity_resolution(tmp_path):
    import os, db
    os.environ["DB_PATH"] = os.path.join(tmp_path, "test_res.db")
    db.init_db()
    user_uuid = db.get_or_create_user_by_identity("google", "testuser@example.com")
    assert user_uuid.startswith("usr_")
    
    # Resolve via email
    resolved_by_email = db.resolve_user_uuid("testuser@example.com")
    assert resolved_by_email == user_uuid
    
    # Link Telegram identity
    db.link_identity(user_uuid, "telegram", "987654321")
    resolved_by_tg = db.resolve_user_uuid(987654321)
    assert resolved_by_tg == user_uuid
```

- [ ] **Step 2: Run test to verify failure**

Run: `../.venv/bin/pytest test_auth_sso.py -k test_identity_resolution`
Expected: FAIL (`AttributeError: module 'db' has no attribute 'get_or_create_user_by_identity'`)

- [ ] **Step 3: Implement helper functions in `db.py`**

In `telegram-finance-bot/db.py`:
Implement:
```python
import uuid

def resolve_user_uuid(identifier: Any) -> Optional[str]:
    if not identifier:
        return None
    ident_str = str(identifier).strip()
    if ident_str.startswith("usr_"):
        return ident_str
    conn = get_connection()
    cursor = conn.cursor()
    # Check auth_identities table
    cursor.execute("SELECT user_uuid FROM auth_identities WHERE LOWER(provider_uid) = LOWER(?)", (ident_str,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return row[0]
    return None

def get_or_create_user_by_identity(provider: str, provider_uid: str, email: Optional[str] = None) -> str:
    provider_uid_str = str(provider_uid).strip().lower()
    existing_uuid = resolve_user_uuid(provider_uid_str)
    if existing_uuid:
        return existing_uuid
    
    new_uuid = f"usr_{uuid.uuid4().hex}"
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO users (user_uuid, primary_email) VALUES (?, ?)", (new_uuid, email))
    cursor.execute("INSERT INTO auth_identities (user_uuid, provider, provider_uid) VALUES (?, ?, ?)", (new_uuid, provider, provider_uid_str))
    conn.commit()
    conn.close()
    return new_uuid

def link_identity(user_uuid: str, provider: str, provider_uid: str) -> bool:
    provider_uid_str = str(provider_uid).strip().lower()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT OR IGNORE INTO auth_identities (user_uuid, provider, provider_uid) VALUES (?, ?, ?)", (user_uuid, provider, provider_uid_str))
    conn.commit()
    conn.close()
    return True
```

- [ ] **Step 4: Run test to verify it passes**

Run: `../.venv/bin/pytest test_auth_sso.py -k test_identity_resolution`
Expected: PASS

- [ ] **Step 5: Commit Task 2**

```bash
git add db.py test_auth_sso.py
git commit -m "feat(auth): implement identity resolution and user_uuid lookup helpers"
```

---

### Task 3: Update API Endpoints & Auth Handlers

**Files:**
- Modify: `telegram-finance-bot/handlers/http_server.py:40-90`
- Modify: `telegram-finance-bot/dashboard.py`
- Test: `telegram-finance-bot/test_auth_sso.py`

**Interfaces:**
- Consumes: `get_or_create_user_by_identity`, `resolve_user_uuid` from Task 2
- Produces: Updated Google SSO authentication payload with `user_uuid`

- [ ] **Step 1: Write failing test for SSO handler `user_uuid` payload**

Add to `telegram-finance-bot/test_auth_sso.py`:
```python
def test_google_sso_returns_user_uuid():
    from handlers.http_server import verify_and_authenticate_google_user
    # Mock token validation to return whitelist email
    result = verify_and_authenticate_google_user({"email": "test@example.com", "email_verified": True})
    assert result["success"] is True
    assert "user_uuid" in result
    assert result["user_uuid"].startswith("usr_")
```

- [ ] **Step 2: Run test to verify failure**

Run: `../.venv/bin/pytest test_auth_sso.py -k test_google_sso_returns_user_uuid`
Expected: FAIL

- [ ] **Step 3: Update `verify_and_authenticate_google_user` in `handlers/http_server.py`**

In `telegram-finance-bot/handlers/http_server.py`:
Update SSO logic to look up or create user via `get_or_create_user_by_identity("google", email, email)` and include `user_uuid` in session response.

- [ ] **Step 4: Run test to verify it passes**

Run: `../.venv/bin/pytest test_auth_sso.py`
Expected: ALL PASS

- [ ] **Step 5: Commit Task 3**

```bash
git add handlers/http_server.py test_auth_sso.py
git commit -m "feat(api): connect Google SSO to unified user_uuid identity"
```

---

### Task 4: Complete Domain Query Compatibility & Deploy Verification

**Files:**
- Modify: `telegram-finance-bot/db.py` (query functions `get_transactions`, `get_debts`, `add_recurring`)
- Test: `telegram-finance-bot/test_pipeline.py`

**Interfaces:**
- Consumes: `resolve_user_uuid`
- Produces: Fully backward-compatible DB functions accepting either legacy `telegram_user_id` or canonical `user_uuid`

- [ ] **Step 1: Write failing test for domain query with `user_uuid`**

In `telegram-finance-bot/test_pipeline.py`:
Add test ensuring `get_transactions` and `add_recurring` work seamlessly when passed a `user_uuid`.

- [ ] **Step 2: Run test to verify failure**

Run: `../.venv/bin/pytest test_pipeline.py -k test_user_uuid`
Expected: FAIL

- [ ] **Step 3: Update domain DB query functions in `db.py`**

Wrap parameters in `user_uuid = resolve_user_uuid(user_id_param)` inside DB functions so `user_uuid` is filtered in SQL (`WHERE user_uuid = ?`).

- [ ] **Step 4: Run full test suite**

Run: `../.venv/bin/pytest test_auth_sso.py test_pipeline.py`
Expected: ALL PASS

- [ ] **Step 5: Commit Task 4**

```bash
git add db.py test_pipeline.py
git commit -m "refactor(db): wrap domain functions with resolve_user_uuid for dual compatibility"
```
