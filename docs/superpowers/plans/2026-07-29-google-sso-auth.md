# Google SSO Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace raw token URL authentication in `telegram-finance-bot` with Google Single Sign-On (SSO) using Google Identity Services (GIS), mapping Google accounts to existing Telegram user IDs while keeping all financial data 100% intact.

**Architecture:** Frontend embeds Google Identity Services SDK to receive signed OIDC ID Tokens upon login, sending them to backend endpoint `POST /api/auth/google`. Backend verifies ID token validity, checks `ALLOWED_GOOGLE_EMAILS` whitelist, maps the user to their `telegram_user_id` in SQLite, issues a `session_token` stored in a `user_sessions` table, and requires this session token for all `/api/*` dashboard operations.

**Tech Stack:** Python 3 (built-in `http.server`, `sqlite3`, `urllib.request`, `json`), HTML5 / Vanilla JS (Google Identity Services SDK `https://accounts.google.com/gsi/client`), pytest.

## Global Constraints

- **Language & Runtime:** Python 3, Vanilla JS / HTML5.
- **Database:** SQLite (`telegram-finance-bot/db.py`).
- **Data Protection:** Existing transaction tables (`transactions`, `debts`, `recurring_bills`) reference `telegram_user_id` and must remain untouched.
- **Configuration:** Environment variables `GOOGLE_CLIENT_ID` and `ALLOWED_GOOGLE_EMAILS`.

---

### Task 1: Database Migration & Session Management (`db.py`)

**Files:**
- Modify: `telegram-finance-bot/db.py`
- Test: `telegram-finance-bot/test_auth_sso.py`

**Interfaces:**
- Consumes: `get_connection()` from `db.py`.
- Produces: `get_user_id_by_google_email`, `link_google_email`, `create_user_session`, `get_user_id_by_session`, `delete_user_session`.

- [ ] **Step 1: Write failing tests for SQLite session and google_email schema**

Create `telegram-finance-bot/test_auth_sso.py`:
```python
import os
import pytest
import db

def test_sso_database_schema_and_session(tmp_path, monkeypatch):
    test_db = tmp_path / "test_sso.db"
    monkeypatch.setattr(db, "DB_PATH", str(test_db))
    db.init_db()

    # 1. Ensure schema supports user token & email linking
    token = db.get_or_create_user_token(12345)
    assert token is not None

    # 2. Link google email
    linked = db.link_google_email(12345, "testuser@gmail.com")
    assert linked is True
    assert db.get_user_id_by_google_email("testuser@gmail.com") == 12345

    # 3. Create and verify user session
    session_token = db.create_user_session(12345, ttl_days=1)
    assert session_token is not None
    assert db.get_user_id_by_session(session_token) == 12345

    # 4. Delete user session
    deleted = db.delete_user_session(session_token)
    assert deleted is True
    assert db.get_user_id_by_session(session_token) is None
```

- [ ] **Step 2: Run test to verify failure**

Run: `python3 -m pytest telegram-finance-bot/test_auth_sso.py`
Expected output: `FAIL` with `AttributeError: module 'db' has no attribute 'link_google_email'`

- [ ] **Step 3: Implement database migrations & session helper functions in `db.py`**

In `telegram-finance-bot/db.py`:
```python
import secrets
from datetime import datetime, timedelta
from typing import Optional

def migrate_sso_tables():
    """Applies schema migrations for Google SSO email linking and sessions."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Add google_email column if not exists
    cursor.execute("PRAGMA table_info(users);")
    columns = [col[1] for col in cursor.fetchall()]
    if "google_email" not in columns:
        cursor.execute("ALTER TABLE users ADD COLUMN google_email TEXT UNIQUE;")
        
    # Create user_sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_sessions (
            session_id TEXT PRIMARY KEY,
            telegram_user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            FOREIGN KEY (telegram_user_id) REFERENCES users(telegram_user_id)
        );
    """)
    conn.commit()
    conn.close()

def get_user_id_by_google_email(email: str) -> Optional[int]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT telegram_user_id FROM users WHERE LOWER(google_email) = LOWER(?)", (email.strip(),))
    row = cursor.fetchone()
    conn.close()
    return row['telegram_user_id'] if row else None

def link_google_email(telegram_user_id: int, email: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    db.get_or_create_user_token(telegram_user_id)
    cursor.execute("UPDATE users SET google_email = LOWER(?) WHERE telegram_user_id = ?", (email.strip(), telegram_user_id))
    conn.commit()
    updated = cursor.rowcount > 0
    conn.close()
    return updated

def create_user_session(telegram_user_id: int, ttl_days: int = 7) -> str:
    session_id = secrets.token_hex(24)
    expires_at = datetime.utcnow() + timedelta(days=ttl_days)
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO user_sessions (session_id, telegram_user_id, expires_at) VALUES (?, ?, ?)",
        (session_id, telegram_user_id, expires_at.isoformat())
    )
    conn.commit()
    conn.close()
    return session_id

def get_user_id_by_session(session_token: str) -> Optional[int]:
    if not session_token:
        return None
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT telegram_user_id, expires_at FROM user_sessions WHERE session_id = ?", (session_token,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    
    # Check expiration
    try:
        expires_at = datetime.fromisoformat(row['expires_at'])
        if datetime.utcnow() > expires_at:
            delete_user_session(session_token)
            return None
    except Exception:
        pass
    return row['telegram_user_id']

def delete_user_session(session_token: str) -> bool:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_sessions WHERE session_id = ?", (session_token,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted
```
Call `migrate_sso_tables()` inside `init_db()` in `db.py`.

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m pytest telegram-finance-bot/test_auth_sso.py`
Expected output: `1 passed`

- [ ] **Step 5: Commit**

```bash
git add telegram-finance-bot/db.py telegram-finance-bot/test_auth_sso.py
git commit -m "feat(auth): add database schema for google email linking and sessions"
```

---

### Task 2: Backend Google SSO Verification & Session Middleware (`handlers/http_server.py`)

**Files:**
- Modify: `telegram-finance-bot/handlers/http_server.py`
- Test: `telegram-finance-bot/test_auth_sso.py`

**Interfaces:**
- Consumes: `db.get_user_id_by_google_email`, `db.link_google_email`, `db.create_user_session`, `db.get_user_id_by_session`, `db.delete_user_session`.
- Produces: `POST /api/auth/google`, `POST /api/auth/logout`, session token authentication for all `/api/*` routes.

- [ ] **Step 1: Write failing test for `/api/auth/google` and session validation**

Add to `telegram-finance-bot/test_auth_sso.py`:
```python
def test_google_auth_whitelist_and_session(monkeypatch):
    monkeypatch.setenv("ALLOWED_GOOGLE_EMAILS", "allowed@example.com")
    monkeypatch.setenv("ALLOWED_TELEGRAM_USER_IDS", "99999")

    # Mock google id token verification
    def mock_verify_google_token(id_token):
        if id_token == "valid_google_token":
            return {"email": "allowed@example.com", "email_verified": True}
        elif id_token == "unallowed_google_token":
            return {"email": "unallowed@example.com", "email_verified": True}
        return None

    import handlers.http_server as http_server
    monkeypatch.setattr(http_server, "verify_google_id_token", mock_verify_google_token)

    # Test valid login
    res = http_server.authenticate_google_user("valid_google_token")
    assert res["success"] is True
    assert "session_token" in res

    # Test session resolution
    user_id = db.get_user_id_by_session(res["session_token"])
    assert user_id == 99999

    # Test unauthorized login
    res_unauthorized = http_server.authenticate_google_user("unallowed_google_token")
    assert res_unauthorized["success"] is False
    assert res_unauthorized["error"] == "Email not in whitelist"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `python3 -m pytest telegram-finance-bot/test_auth_sso.py::test_google_auth_whitelist_and_session`
Expected output: `FAIL` with `AttributeError: module 'handlers.http_server' has no attribute 'authenticate_google_user'`

- [ ] **Step 3: Implement Google Token verification & API session auth in `http_server.py`**

In `telegram-finance-bot/handlers/http_server.py`:
1. Add Google Token verification function:
```python
import json
import urllib.request

def verify_google_id_token(id_token: str) -> Optional[dict]:
    """Verifies a Google OIDC ID token against Google's tokeninfo endpoint."""
    try:
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={urllib.parse.quote(id_token)}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                expected_client_id = os.getenv("GOOGLE_CLIENT_ID")
                if expected_client_id and data.get("aud") != expected_client_id:
                    logger.error("Google ID Token aud mismatch")
                    return None
                if data.get("email_verified") is True or data.get("email_verified") == "true":
                    return data
    except Exception as e:
        logger.error(f"Error verifying Google ID token: {e}")
    return None

def authenticate_google_user(id_token: str) -> dict:
    token_data = verify_google_id_token(id_token)
    if not token_data or not token_data.get("email"):
        return {"success": False, "error": "Invalid or expired Google ID Token"}

    email = token_data["email"].strip().lower()
    allowed_emails_str = os.getenv("ALLOWED_GOOGLE_EMAILS", "")
    allowed_emails = [e.strip().lower() for e in allowed_emails_str.split(",") if e.strip()]

    if allowed_emails and email not in allowed_emails:
        return {"success": False, "error": "Email not in whitelist"}

    # Resolve telegram user id
    user_id = db.get_user_id_by_google_email(email)
    if not user_id:
        allowed_tg_ids = os.getenv("ALLOWED_TELEGRAM_USER_IDS", "").split(",")
        if allowed_tg_ids and allowed_tg_ids[0].strip().isdigit():
            user_id = int(allowed_tg_ids[0].strip())
            db.link_google_email(user_id, email)
        else:
            conn = db.get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT telegram_user_id FROM users LIMIT 1")
            row = cursor.fetchone()
            conn.close()
            if row:
                user_id = row['telegram_user_id']
                db.link_google_email(user_id, email)

    if not user_id:
        return {"success": False, "error": "No associated user found"}

    session_token = db.create_user_session(user_id)
    return {"success": True, "session_token": session_token, "email": email, "user_id": user_id}
```

2. Update `MultiUserHTTPRequestHandler`:
- Check authentication token via session token first (`db.get_user_id_by_session(token)`), falling back to token parameter for backward compatibility if session fails.
- In `do_POST`: Add handler for `/api/auth/google` and `/api/auth/logout`.

- [ ] **Step 4: Run test to verify it passes**

Run: `python3 -m pytest telegram-finance-bot/test_auth_sso.py`
Expected output: `2 passed`

- [ ] **Step 5: Commit**

```bash
git add telegram-finance-bot/handlers/http_server.py telegram-finance-bot/test_auth_sso.py
git commit -m "feat(auth): implement Google ID token verification and session endpoints"
```

---

### Task 3: Web Dashboard Frontend Google SSO Interface (`dashboard/template.html`)

**Files:**
- Modify: `telegram-finance-bot/dashboard/template.html` (and `telegram-finance-bot/dashboard.html` if present)

**Interfaces:**
- Consumes: Google Identity Services SDK (`https://accounts.google.com/gsi/client`), `POST /api/auth/google`, `POST /api/auth/logout`.
- Produces: Google Sign-in modal overlay, session management in browser `localStorage`, user email chip & logout button in navbar.

- [ ] **Step 1: Inspect existing HTML structure in `dashboard/template.html`**

View `telegram-finance-bot/dashboard/template.html` to find existing navbar & header elements.

- [ ] **Step 2: Add Google Identity Services SDK script & Login Modal Overlay**

In `template.html`:
1. Add Google GIS script tag:
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```
2. Add Google Login Overlay HTML element:
```html
<div id="login-overlay" style="position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.95); display:flex; align-items:center; justify-content:center; z-index:9999;">
    <div style="background:#1e293b; border:1px solid #334155; padding:40px; border-radius:24px; text-align:center; max-width:400px; width:90%; color:#f8fafc; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
        <h2 style="margin-bottom:12px; font-size:24px; font-weight:700;">Finance Dashboard Access</h2>
        <p style="color:#94a3b8; font-size:14px; margin-bottom:28px;">Sign in with your authorized Google account to view your finances.</p>
        <div id="g_id_onload" data-client_id="{{GOOGLE_CLIENT_ID}}" data-callback="handleCredentialResponse" data-auto_prompt="false"></div>
        <div class="g_id_signin" data-type="standard" data-size="large" data-theme="filled_blue" data-text="sign_in_with" data-shape="rectangular" data-logo_alignment="left"></div>
        <div id="login-error" style="color:#ef4444; font-size:13px; margin-top:16px; display:none;"></div>
    </div>
</div>
```
3. Add JS Auth Handler logic:
```javascript
function handleCredentialResponse(response) {
    const idToken = response.credential;
    fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: idToken })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.session_token) {
            localStorage.setItem('session_token', data.session_token);
            if (data.email) localStorage.setItem('user_email', data.email);
            document.getElementById('login-overlay').style.display = 'none';
            loadDashboardData();
        } else {
            const errEl = document.getElementById('login-error');
            errEl.innerText = data.error || 'Authentication failed';
            errEl.style.display = 'block';
        }
    })
    .catch(err => {
        console.error('SSO error:', err);
    });
}

function checkAuthAndInit() {
    const sessionToken = localStorage.getItem('session_token');
    if (sessionToken) {
        document.getElementById('login-overlay').style.display = 'none';
        loadDashboardData();
    } else {
        document.getElementById('login-overlay').style.display = 'flex';
    }
}

function handleLogout() {
    const sessionToken = localStorage.getItem('session_token');
    if (sessionToken) {
        fetch('/api/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: sessionToken })
        });
    }
    localStorage.removeItem('session_token');
    localStorage.removeItem('user_email');
    location.reload();
}
```

- [ ] **Step 3: Update `fetch` requests in dashboard template to pass `session_token`**

In `template.html`: Ensure `fetch('/api/data?token=' + sessionToken)` uses `localStorage.getItem('session_token')`.

- [ ] **Step 4: Commit**

```bash
git add telegram-finance-bot/dashboard/template.html
git commit -m "feat(ui): add Google Identity Services frontend modal and auth state handling"
```

---

### Task 4: Telegram `/dashboard` Command & Full End-to-End Verification

**Files:**
- Modify: `telegram-finance-bot/handlers/commands.py`
- Test: `telegram-finance-bot/test_pipeline.py`

- [ ] **Step 1: Update `/dashboard` command handler**

In `telegram-finance-bot/handlers/commands.py`:
Update `dashboard_cmd` to reply with clean dashboard URL link without raw secret tokens in query parameter.

- [ ] **Step 2: Run test pipeline and full test suite**

Run: `python3 -m pytest telegram-finance-bot/`
Expected output: All test cases PASS cleanly.

- [ ] **Step 3: Commit**

```bash
git add telegram-finance-bot/handlers/commands.py
git commit -m "feat(commands): update /dashboard command to use clean URL without URL token"
```
