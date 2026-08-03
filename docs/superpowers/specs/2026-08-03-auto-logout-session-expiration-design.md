# Feature Specification: Auto-Logout & Session Expiration Management

**Author:** Deepmind Antigravity  
**Date:** 2026-08-03  
**Status:** Proposed Task  
**Target Component:** `telegram-finance-bot` (`handlers/http_server.py`, `dashboard/template.html`, `db.py`)

---

## 1. Goal

Implement automatic logout and session expiration handling across the web dashboard and API backend. When a user's session expires:
1. Client-side storage (`localStorage` & `sessionStorage`) is cleanly cleared.
2. Background polling / interval fetches are halted to prevent request spamming.
3. The UI smoothly transitions to the Google SSO Login Overlay with an informative message ("Your session has expired. Please sign in again.").

---

## 2. Technical Architecture

### 2.1 Backend Expiration Verification (`handlers/http_server.py` & `db.py`)
* Session tokens in `user_sessions` carry an `expires_at` timestamp (default: 30 days).
* Any API request with an expired or invalid session token returns HTTP 401 with JSON:
  ```json
  { "error": "session_expired", "message": "Your session has expired. Please log in again." }
  ```

### 2.2 Client-Side Global Interceptor (`dashboard/template.html`)
* Intercept all `fetch()` calls to `/api/*`.
* If HTTP response status is `401` or returns `session_expired`:
  1. Call `handleAutoLogout("Session expired. Please sign in again.")`.
  2. Purge `session_token` from `localStorage` and `sessionStorage`.
  3. Show SSO Overlay container with clear error feedback.

---

## 3. Implementation Checklist

- [ ] Add `handleAutoLogout(reason)` function in [template.html](file:///Users/appworx/Desktop/ai-play-ground/telegram-finance-bot/dashboard/template.html).
- [ ] Add global fetch response interceptor for 401 status.
- [ ] Verify `user_sessions` expiration check in `db.get_user_id_by_session()`.
- [ ] Add unit test in `test_auth_sso.py` for session TTL expiration.
