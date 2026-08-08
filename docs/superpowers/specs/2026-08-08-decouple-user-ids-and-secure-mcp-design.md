# Spec: Decoupling User IDs and Securing MCP Server

## 1. Overview
The goal of this change is to secure the `telegram-finance-bot` platform and address two critical vulnerabilities:
1. **Exposed User IDs & Telegram Dependency:** The database and API currently rely on exposed, numeric Telegram User IDs (`telegram_user_id`) to track data ownership. If a user logs in via Google SSO, a collision-prone fake ID is generated.
2. **Insecure MCP Authentication:** The MCP server accepts raw email addresses as authentication tokens (`?token=email`), allowing anyone to view or modify database transactions for any registered email.

To fix these issues, we will transition the data ownership to globally unique `user_uuid` strings and introduce **Personal Access Tokens (PATs)** managed directly through the Web Dashboard.

---

## 2. Proposed Changes

### 2.1 Database Schema & Migrations

We will modify the database schemas to support UUID ownership and store SHA-256 hashes of Personal Access Tokens (PATs).

#### `users` Table Updates
Ensure `user_uuid` is the primary identity key, and decouple it from `telegram_user_id`.

#### New `user_pats` Table
```sql
CREATE TABLE IF NOT EXISTS user_pats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_uuid TEXT NOT NULL,
    pat_hash TEXT UNIQUE NOT NULL, -- SHA-256 hash of the PAT
    name TEXT NOT NULL,            -- Descriptive label (e.g. "Claude Desktop")
    masked_token TEXT NOT NULL,    -- E.g. "pat_7a8f...b2d1"
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_used_at TEXT,
    FOREIGN KEY (user_uuid) REFERENCES users (user_uuid) ON DELETE CASCADE
);
```

#### Altering Domain Tables
Add a `user_uuid TEXT` column to:
*   `transactions`
*   `recurring`
*   `pending_bills`
*   `debts`
*   `user_sessions`

#### One-Time Migration Script
During initialization (`db.init_db()`):
1. Any user record missing a `user_uuid` will be assigned a new one using `uuid.uuid4()`.
2. A database-wide update will map each table's historical records by resolving their `telegram_user_id` to the corresponding `user_uuid` and updating the `user_uuid` column.

---

### 2.2 API Endpoints

We will add three endpoints to `http_server.py` for token management (all require a valid session token/cookie):

1. **`GET /api/pat/list`:** Lists active PATs for the authenticated user (name, masked token, creation date, last used date).
2. **`POST /api/pat/generate`:**
   * Payload: `{"name": "Label"}`
   * Behavior: Generates a secure token `pat_` + 24 bytes, hashes it using SHA-256, stores the hash and masked version, and returns the raw token in the response **once**.
3. **`POST /api/pat/revoke`:**
   * Payload: `{"pat_id": <id>}`
   * Behavior: Deletes the corresponding token hash from `user_pats`.

---

### 2.3 Authentication Layer

#### MCP Token Verification
In `mcp_server.py` (inside `TokenAuthMiddleware`):
* Disable the insecure raw email `@` verification.
* Detect if the incoming token starts with `pat_`.
* Hash the token using SHA-256 and look it up in the `user_pats` table. If a match is found, assign the request context to that `user_uuid`.

#### Stdio Mode Support (Local Integration)
* For local integration (e.g., Claude Desktop running stdio commands), the user can set the token as an environment variable `FINANCE_PAT` inside the configuration file.
* On startup, if `FINANCE_PAT` is defined, the process hashes it, resolves the matching `user_uuid`, and enforces that identity for all incoming stdio tools automatically.

---

### 2.4 Web Dashboard UI

We will add an **"API Access"** section in the settings tab of `template.html`:
1. **Token List:** A clean list of active tokens showing name, masked token, last used date, and a "Revoke" button.
2. **Generate Panel:** An input field for the token label and a "Generate Token" button.
3. **Modal Dialog:** Shows the newly created PAT only once with a copy button and integration helper code showing the exact JSON block to paste into `claude_desktop_config.json`.

---

## 3. Verification Plan

### 3.1 Automated Tests
*   Run unit tests to verify database migrations.
*   Assert that raw email addresses no longer authenticate against the MCP endpoint.
*   Assert that valid PATs match their corresponding SHA-256 hashes and authenticate successfully.

### 3.2 Manual Verification
*   Log in to the Web Dashboard, generate a new token named "Claude Dev", and copy the token.
*   Update `claude_desktop_config.json` with the new token.
*   Relaunch Claude Desktop and verify that running `/api/data` or using MCP tools returns the correct budget info.
*   Revoke the token on the dashboard, relaunch Claude, and verify that it is denied access.
