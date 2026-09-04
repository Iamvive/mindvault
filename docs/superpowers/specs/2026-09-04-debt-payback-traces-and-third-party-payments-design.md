# Design Specification: Debt Payback Traces & Third-Party Member Repayments

**Date:** 2026-09-04  
**Project:** `telegram-finance-bot`  
**Status:** Approved by User  

---

## Executive Summary
In personal finances, debts and loans often occur across multiple tranches (e.g. someone borrows ₹80,000 across 3 separate transactions: ₹30k, ₹20k, ₹30k) and are paid back through multiple partial installments, sometimes by another family member or third party on their behalf (e.g. Rahul paying back on behalf of Amit).

This design introduces a **Tranche-Level Payback Tracking & Allocation System** for the Debts Tracker in `telegram-finance-bot` and its web dashboard, supporting:
1. **Tranche-level lifecycle management** (tracking unsettled, partially paid, and fully paid loan chunks).
2. **Payback Traces** linking every repayment installment to the specific loan tranche(s) it paid down.
3. **Third-party member attribution** (`paid_by_member`) to clearly audit who made each payment.
4. **Automated FIFO allocation with manual tranche override** support in both the Web Dashboard and Telegram bot.

---

## 1. Data Model & Architecture

### 1.1 SQLite Schema Changes in `db.py`

#### Enhancements to `debts` Table
```sql
ALTER TABLE debts ADD COLUMN paid_by_member TEXT DEFAULT NULL;
ALTER TABLE debts ADD COLUMN settled_amount REAL DEFAULT 0.0;
ALTER TABLE debts ADD COLUMN status TEXT DEFAULT 'unsettled';
```
- `paid_by_member`: Optional name of the person who actually transferred/settled the money (e.g., `"Rahul"` when settling debt for `"Amit"`).
- `settled_amount`: Cached sum of repayment amounts applied against this debt tranche.
- `status`: 
  - For loan tranches (positive `amount` for lent / negative for borrowed): `'unsettled'`, `'partially_paid'`, or `'fully_paid'`.
  - For repayment entries: `'applied'` or `'excess'`.

#### New Table: `debt_allocations`
```sql
CREATE TABLE IF NOT EXISTS debt_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_user_id INTEGER NOT NULL,
    user_uuid TEXT,
    repayment_debt_id INTEGER NOT NULL, -- Reference to the repayment debt entry
    loan_debt_id INTEGER NOT NULL,      -- Reference to the loan debt entry being settled
    allocated_amount REAL NOT NULL,     -- Rupee amount allocated from repayment to loan
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (repayment_debt_id) REFERENCES debts(id) ON DELETE CASCADE,
    FOREIGN KEY (loan_debt_id) REFERENCES debts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_debt_alloc_repay ON debt_allocations(repayment_debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_alloc_loan ON debt_allocations(loan_debt_id);
CREATE INDEX IF NOT EXISTS idx_debt_alloc_user ON debt_allocations(telegram_user_id, user_uuid);
```

### 1.2 Allocation Engine & Consistency Rules
- **Automatic FIFO Allocation**:
  - When a repayment entry is recorded without custom tranche targets, the allocation engine fetches all open loan tranches for that person sorted chronologically (`date ASC, id ASC`).
  - It sequentially applies the repayment amount against open tranches until the payment amount is exhausted.
  - Updates `settled_amount = sum(allocated_amount)` and assigns `status`:
    - `settled_amount >= abs(amount)` $\rightarrow$ `'fully_paid'`
    - `0 < settled_amount < abs(amount)` $\rightarrow$ `'partially_paid'`
    - `settled_amount == 0` $\rightarrow$ `'unsettled'`
- **Manual Tranche Allocation**:
  - If specific `target_loan_ids` and custom amounts are supplied, allocations are created directly for the specified loan entries.
- **Recomputation on Update/Delete**:
  - When a debt entry or repayment is updated or deleted, `recompute_person_allocations(telegram_user_id, person)` runs to maintain full mathematical integrity across all allocations.

---

## 2. API & Backend Integration

### 2.1 Backend Functions in `db.py`
- `add_debt(telegram_user_id, person, amount, description=None, date=None, paid_by_member=None, allocation_mode='fifo', target_allocations=None) -> int`
- `recompute_person_allocations(telegram_user_id, person) -> None`
- `get_debt_history_with_traces(telegram_user_id, person) -> Dict[str, Any]`
  - Returns itemized loan tranches, embedded payback traces (`repayment_date`, `allocated_amount`, `paid_by_member`, `repayment_desc`), and running net balance.

### 2.2 HTTP Endpoints in `handlers/http_server.py` & `handlers/wealth_server.py`
- **`GET /api/debts/statement`**:
  - Query parameters: `person` (string).
  - Returns statement breakdown including running balance, loan tranches, payback traces, and member attribution.
- **`POST /api/debts/record_payback`**:
  - Accepts `{ person, amount, date, description, paid_by_member, allocation_mode, target_allocations }`.
- **`POST /api/add_debt`, `POST /api/update_debt`, `POST /api/delete_debt`**:
  - Enhanced to accept and preserve `paid_by_member` and trigger recomputation of payback allocations.
- **`GET /api/data`**:
  - Returns `debts` with active tranche counts and `debt_items` with settlement status and allocation traces.

### 2.3 Telegram Bot Commands & NLP
- **Natural Language Parsing (`handlers/messages.py`)**:
  - Recognizes third-party repayment phrases:
    - `"Rahul paid 20k on behalf of Amit for loan"`
    * Extracts: `counterparty="Amit"`, `amount=-20000`, `paid_by_member="Rahul"`.
- **`/debts` Command (`handlers/commands.py`)**:
  - Displays formatted net balance with open tranche breakdown (e.g. `Amit: ₹50,000 pending across 2 open tranches`).

---

## 3. Web Dashboard UI Specification

### 3.1 Person Account Statement Drawer (`#person-ledger-drawer`)
- **Tranche Cards & Progress Bars**:
  - For each loan transaction:
    - Displays Date, Amount, Description, and a Status Badge (`Fully Settled`, `Partially Paid - ₹X remaining`, `Unsettled`).
    - Expandable **"Payback Traces (N payments)"** button displaying a visual sub-tree of each payment linked to that loan chunk with date, amount, and payer badge (`👤 Paid by Rahul`).
- **Ledger Table**:
  - Displays comprehensive history with columns: `Date | Description | Paid By | Amount | Running Bal | Actions`.
  - Repayments feature subtle badge linking to target tranches: `↳ Settled: Loan on 10 Aug (₹20,000)`.

### 3.2 "Record Payback" Drawer / Modal (`#debt-payback-modal`)
- **Fields**:
  1. **Person Name**: Pre-filled text/autocomplete.
  2. **Payback Amount (₹)**: Number input.
  3. **Date**: Date picker.
  4. **Paid By Other Member (Optional)**: Text input with quick suggestions (e.g., `"Rahul (Brother)"`).
  5. **Allocation Strategy**:
     - Radio 1: *Auto FIFO (Oldest loan first)*.
     - Radio 2: *Custom Tranche Selection* (reveals checkbox list of open loan tranches with custom allocation inputs).
  6. **Notes / Reference**: Description field (e.g. UPI Ref / GPay notes).

### 3.3 Debts Tracker Card on Main Dashboard
- Summary rows display active tranche counts: e.g. `Amit • Owes ₹50,000 (2/3 Tranches Active)` with a quick action button `💰 Record Payback`.

---

## 4. Verification Plan

### 4.1 Automated Unit & Integration Tests
- Write test suite in `tests/test_debt_paybacks.py`:
  - Test 1: Single loan, single repayment via FIFO.
  - Test 2: Multi-tranche loan (e.g. ₹30k + ₹20k + ₹30k = ₹80k), partial repayment (₹25k) verifies first tranche is ₹25k paid and ₹5k remaining.
  - Test 3: Multi-tranche loan, repayment with third-party `paid_by_member` attribute preserved.
  - Test 4: Custom manual allocation against specific loan tranche.
  - Test 5: Deleting or updating a debt entry triggers recomputation and maintains data consistency.
  - Test 6: API endpoints `/api/debts/record_payback` and `/api/debts/statement`.

### 4.2 Manual Verification
- Launch dashboard and test recording a multi-tranche debt and partial payback with third-party member name.
- Verify drawer UI expands payback traces and reflects running balances accurately.
