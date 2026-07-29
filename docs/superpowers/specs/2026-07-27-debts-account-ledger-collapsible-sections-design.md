# Design Specification: Person Account Ledger & Collapsible Dashboard Sections

**Date:** 2026-07-27  
**Project:** `telegram-finance-bot`  
**Status:** Approved by User  

---

## Executive Summary
This design introduces a **KhataBook / Splitwise-style Person Account Ledger** for managing multi-date lendings, repayments, and borrowings per person, and adds **Collapsible Section Toggles** with state persistence for all major dashboard cards.

---

## 1. Person Account Ledger (Debts Tracker)

### 1.1 Overview & Requirements
Users often lend or borrow money from the same person across multiple dates. Instead of flattening or obscuring these transactions, each person is treated as an Account with an itemized statement ledger and net balance.

### 1.2 Debts Tracker Card UI
- **Card Summary Row**:
  - Person Name (e.g., *Jagvir*)
  - Net Balance Badge (*Owes You ₹2,000.00* or *You Owe ₹1,000.00*)
  - Relationship Timeline (`Since 27 Jul 2026` • `2 entries`)
  - Quick Action Buttons: `📄 Statement / Ledger`, `✅ Quick Settle`

### 1.3 Person Account Statement Drawer (`#person-ledger-drawer`)
- **Header**: Person Name, Net Balance, Date Range.
- **Running Balance History Table**:
  - **Columns**: Date | Description | Type (Lent / Borrowed / Payment) | Amount (₹) | Running Balance (₹) | Actions (`Edit`, `Delete`)
  - **Running Balance Calculation**: Sorted by date ascending; running balance accumulates positive/negative amounts.
- **Drawer Actions**:
  - `+ Add Entry`: Opens modal to add a new lending/borrowing/repayment for this person.
  - `✅ Settle Full Balance`: Inserts balancing payment transaction to bring net balance to ₹0.00.

---

## 2. Collapsible Dashboard Sections

### 2.1 Overview & Requirements
To optimize vertical space on both desktop and mobile browsers, all major dashboard cards will feature a section collapse toggle button in their headers.

### 2.2 Sections with Collapse Support
1. **Category Breakdown** (`card-category-breakdown`)
2. **Debts Tracker** (`card-debts-tracker`)
3. **Month-on-Month Trends** (`card-monthly-trends`)
4. **Upcoming Pending Bills** (`card-pending-bills`)
5. **Recurring Rules (SIPs)** (`card-recurring-rules`)

### 2.3 UI & State Persistence
- **Toggle Icon**: A chevron icon (`▲` / `▼`) in each card header.
- **CSS Animation**: Smooth max-height and opacity transition.
- **Persistence**: Collapsed section IDs stored in `localStorage` under key `kuber_collapsed_sections`. Layout preferences persist across browser reloads and sessions.

---

## 3. Data Flow & Security
- **API Endpoints**:
  - Existing `/api/data` payload extended to supply `debts` summary and `debt_items` detailed breakdown.
  - `/api/add_debt`, `/api/update_debt`, `/api/delete_debt`, `/api/clear_debt` endpoints handle CRUD actions securely with token validation.
- **Automatic Sync**:
  - Setting any transaction category to `Lending` automatically creates/updates an entry in the `debts` table.

---

## 4. Acceptance Criteria
- [x] Person-centric ledger drawer displays running balances correctly across multiple dates.
- [x] All major dashboard sections toggle between expanded and collapsed states smoothly.
- [x] Section collapse states persist in `localStorage`.
- [x] Automated unit tests in `test_pipeline.py` and integration tests pass cleanly.
