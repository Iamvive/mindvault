# Design Specification - Wealth Monitor, Nominee Audit & Document Vault

This document outlines the design for extending the personal finance logger (`telegram-finance-bot`) into an overall Wealth Monitor and Financial Health Audit system. 

It implements a modular architecture that does not affect the core transactions parser or bot loop, in alignment with best practices from top tech companies.

---

## 1. Goal & Context
The goal is to provide a unified dashboard view to monitor:
- **Assets & Net Worth**: Syncing active equity/mutual fund holdings from Zerodha Kite and manually tracking vehicles, cash, gold, real estate, and insurance policies.
- **Liabilities**: Detailed tracking of loans (e.g. Aditya Birla home loans) with principal outstanding, EMIs, remaining tenure, and next payment dates.
- **Nominee Audit Checklist**: AI-predicted checklist of required nominations across all assets/accounts to assist in estate planning.
- **Secure Document Vault**: Uploading and viewing PDF copies of insurance policy certificates, registration cards (RC), and loan agreements securely.
- **AI Prosperity Audit**: Algorithmic assessment based on Monika Halan's *Let's Talk Money* (Emergency Fund coverage, Insurance targets) and Morgan Housel's *Psychology of Money* (high-interest debt alerts, margin of safety prepayments).

---

## 2. Directory & Module Boundaries
To keep the codebase modular, all wealth-specific code will reside in dedicated files:

```
telegram-finance-bot/
├── db_wealth.py             # Isolated SQLite schema, migrations, and CRUD helpers for wealth
├── handlers/
│   └── wealth_server.py     # HTTP request router for /api/wealth/* and secure file streaming
├── src/
│   └── manana_wealth.py     # AI Prosperity Audit engine using the Gemini API client
└── dashboard/
    ├── template.html        # Navigation tab switcher wrapper
    └── wealth/              # Isolated frontend view files
        ├── wealth.css       # Glassmorphic layout rules
        └── wealth.js        # Form drawers, list loaders, and AI trigger buttons
```

---

## 3. Database Schema (finance.db additions)
We will create four new tables using SQL scripts executed on startup inside `db_wealth.py`:

### `user_wealth_assets`
Stores holdings, vehicles, cash, gold, and insurance policies.
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `user_uuid` (TEXT NOT NULL, FOREIGN KEY REFERENCES users(user_uuid))
- `type` (TEXT NOT NULL) — e.g. `liquid`, `equity`, `gold`, `real_estate`, `vehicle`, `insurance_life`, `insurance_health`
- `subtype` (TEXT NOT NULL) — e.g. `mutual_fund`, `stock`, `fd`, `epf`, `cash`
- `name` (TEXT NOT NULL) — e.g. `Creta SUV`, `HDFC Ergo Health Plan`, `Nippon Liquid Fund`
- `valuation` (REAL NOT NULL) — current worth or Sum Assured in INR
- `notes` (TEXT) — e.g. policy number, renewal date, annual premium, loan links
- `source` (TEXT DEFAULT 'manual') — `manual` or `kite_sync`
- `last_synced_at` (TEXT)

### `user_wealth_liabilities`
Stores loans and outstanding debt.
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `user_uuid` (TEXT NOT NULL, FOREIGN KEY REFERENCES users(user_uuid))
- `institution` (TEXT NOT NULL) — e.g. `Aditya Birla Capital`
- `loan_ac_no` (TEXT NOT NULL)
- `sanctioned_amount` (REAL NOT NULL)
- `principal_outstanding` (REAL NOT NULL)
- `interest_rate` (REAL NOT NULL) — e.g. `13.35`
- `emi` (REAL NOT NULL)
- `remaining_tenure_months` (INTEGER NOT NULL)
- `next_emi_date` (TEXT)

### `user_nominee_checklist`
Actionable nominee audit progress.
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `user_uuid` (TEXT NOT NULL, FOREIGN KEY REFERENCES users(user_uuid))
- `account_name` (TEXT NOT NULL) — e.g. `HDFC Salary Account`, `Demat (Zerodha)`
- `nominee_name` (TEXT)
- `status` (TEXT DEFAULT 'missing') — `missing`, `pending`, `complete`
- `is_ai_suggested` (INTEGER DEFAULT 0) — `0` or `1`
- `created_at` (TEXT DEFAULT CURRENT_TIMESTAMP)

### `user_wealth_documents`
Binds document filenames and hashed paths to assets or liabilities.
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `user_uuid` (TEXT NOT NULL, FOREIGN KEY REFERENCES users(user_uuid))
- `associated_type` (TEXT NOT NULL) — `asset` or `liability`
- `associated_id` (INTEGER NOT NULL) — ID of the respective asset or liability
- `file_name` (TEXT NOT NULL) — user-facing name e.g. `Creta_RC_Copy.pdf`
- `file_path` (TEXT NOT NULL) — relative server storage path
- `uploaded_at` (TEXT DEFAULT CURRENT_TIMESTAMP)

---

## 4. API Endpoints
All routes verify request authorization using the request token/PAT.

### Data & Sync
- **`GET /api/wealth/data`**
  - Fetches the consolidated wealth dashboard snapshot (Net Worth calculation, list of assets/liabilities, nominee items, uploaded files).
- **`POST /api/wealth/sync/kite`**
  - Accepts a JSON array of active Zerodha holdings or mutual funds and upserts them to `user_wealth_assets` under the `kite_sync` source tag.

### CRUD Updates
- **`POST /api/wealth/assets/update`**: Saves manual assets (real estate, vehicles, gold, insurance).
- **`POST /api/wealth/liabilities/update`**: Saves loan accounts (sanction details, outstanding balance, rates).
- **`POST /api/wealth/nominees/toggle`**: Marks nomination as completed with nominee name.

### Document Upload & Secure Stream
- **`POST /api/wealth/document/upload`**
  - Accepts `multipart/form-data` containing: `{ token, associated_type, associated_id, file }`.
  - Saves file securely to `./data/documents/<user_uuid>/<random_hash>.pdf`.
- **`GET /api/wealth/document/view?token=...&document_id=...`**
  - Verifies the user token/PAT.
  - Confirms the document matches the user's UUID.
  - Streams the file with correct MIME type (e.g. `application/pdf`).
- **`POST /api/wealth/document/delete`**: Deletes the document file and database entry.

---

## 5. AI Audit Engine (manana_wealth.py)
A specialized promoter scans the synced holdings, manual accounts, and loans to generate structured recommendations:
1. **Nomination Gap Detection**: Identifies missing nominees and highlights the legal risks (e.g. intestate succession hurdles).
2. **Loan Overhead Audit**: 
   - Detects high interest rates (such as **13.35% p.a.**).
   - Generates refinancing / balance transfer projections showing interest saved at standard rates.
   - Calculates a prepayment sequence (e.g. suggesting the clearing of the smaller ₹93k loan first to free up ₹1,184/month in cash flow, maximizing "margin of safety").
3. **Monika Halan Ratios**: Calculates emergency coverage (Liquid Cash / 3-month average monthly cash flow), private floater health insurance recommendations, and term policy sum assurers (10-12x annual income).

---

## 6. Frontend Layout & CSS Styling
- **CSS Variable Compatibility**: Reuses subtle gradient vars (`--bg-main`, `--bg-card`, `--border-glow`, `--color-wants` for primary highlights).
- **Layout Grid**: Full-screen split layout:
  - **Left Panel**: Net Worth KPI, Assets valuation list, Liabilities/Loan progress bars.
  - **Right Panel**: Nominee Checklist board (with trigger AI scan button) and AI Audit advice cards.
- **Modals & Drawers**: Slide-out form drawers to add assets, add loans, and upload document files.

---

## 7. Verification Plan
- **Unit Tests**: Add tests verifying database schema migrations and multi-tenant document permission checks.
- **Kite Parsing Validation**: Mock Kite holdings JSON inputs and verify that asset valuation is computed and updated.
- **AI Audit Mocking**: Mock Gemini responses to verify parsing of loan refinancing alerts, CBT nomination checklist updates, and Monika Halan indicators.
