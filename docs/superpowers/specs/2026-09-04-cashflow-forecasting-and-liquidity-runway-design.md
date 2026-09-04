# Design Specification: Smart Cashflow Forecasting & Liquidity Runway

**Date:** 2026-09-04  
**Project:** `telegram-finance-bot`  
**Status:** Approved by User  

---

## Executive Summary
While retrospective budget tracking (50/30/20) and expense categorization tell users where their money went, personal financial decisions depend heavily on forward-looking liquidity: *"Will I have enough balance to pay rent and SIPs before my next salary?"* and *"Can I afford this discretionary ₹20,000 purchase without dipping into emergency funds?"*

This specification introduces the **Smart Cashflow Forecasting & Liquidity Runway Engine** for `telegram-finance-bot` and its web dashboard. It simulates a day-by-day bank balance trajectory over a 30-day or 60-day horizon by synthesizing:
1. **Starting Liquid Balance** (Hybrid: month-to-date net cashflow with 1-click manual sync adjustment).
2. **Scheduled Fixed Inflows** (Salary, recurring incoming transfers, expected debt repayments).
3. **Scheduled Fixed Outflows** (Recurring subscriptions, rent, insurance, SIPs, pending utility bills).
4. **Baseline Discretionary Burn Rate** (Rolling average daily variable spend over the past 30 days).
5. **Interactive Visualization & Alerts** (Web Dashboard curved SVG/Canvas trajectory chart + Telegram `/runway` command + low-balance proactive danger alerts).

---

## 1. Architecture & Data Model

### 1.1 SQLite Schema Changes in `db.py`

#### New Table: `user_cashflow_settings`
```sql
CREATE TABLE IF NOT EXISTS user_cashflow_settings (
    user_uuid TEXT PRIMARY KEY,
    telegram_user_id INTEGER NOT NULL DEFAULT 0,
    starting_liquid_balance REAL DEFAULT 0.0,
    balance_as_of_date TEXT,                    -- YYYY-MM-DD when balance was calibrated
    low_balance_threshold REAL DEFAULT 10000.0,  -- Safety threshold for proactive alerts
    include_daily_burn INTEGER DEFAULT 1,       -- 1 = include average burn, 0 = fixed only
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2 Helper Functions in `db.py`
1. `get_user_cashflow_settings(telegram_user_id: Any) -> dict`
   - Returns existing settings or defaults (with starting balance computed from current month net cashflow if unset).
2. `update_user_cashflow_settings(telegram_user_id: Any, balance: float, threshold: float = 10000.0, as_of_date: str = None) -> bool`
   - Updates the user's liquid cash baseline.
3. `get_variable_daily_burn_rate(telegram_user_id: Any, days: int = 30) -> float`
   - Queries non-recurring, non-debt `NEEDS` and `WANTS` debits over the last `days` and divides by `days` to establish a realistic baseline daily spend rate.

---

## 2. Simulation Engine (`cashflow_forecast.py`)

A standalone module `cashflow_forecast.py` generates the day-by-day cashflow simulation.

### 2.1 Mathematical Model
Let $t_0$ be the current date (day 0) and $N \in \{30, 60\}$ be the simulation horizon.

For each day $t \in [1, N]$:
1. **Date:** $D(t) = \text{DateAdd}(t_0, t \text{ days})$.
2. **Day-of-Month:** $\text{dom}(t) = \text{ExtractDay}(D(t))$.
3. **Scheduled Inflows $I(t)$:**
   - Sum of recurring `income` rules where `day_of_month == dom(t)`.
   - Sum of debt receivables where expected due date matches $D(t)$.
4. **Scheduled Outflows $O_{\text{fixed}}(t)$:**
   - Sum of recurring expense rules (`NEEDS`, `SAVINGS`, `WANTS`, `TRANSFER`) where `day_of_month == dom(t)`.
   - Sum of `pending_bills` with status `'pending'` where `due_date == D(t)`.
   - Sum of debt payables due on $D(t)$.
5. **Variable Discretionary Outflow $O_{\text{var}}(t)$:**
   - Average daily burn rate $B_{\text{daily}}$ (if enabled in settings).
6. **Day Balance:**
   $$\text{Balance}(t) = \text{Balance}(t-1) + I(t) - O_{\text{fixed}}(t) - O_{\text{var}}(t)$$

### 2.2 Output Payload Structure
```json
{
  "horizon_days": 30,
  "starting_balance": 142500.0,
  "current_date": "2026-09-04",
  "daily_burn_rate": 820.0,
  "low_balance_threshold": 10000.0,
  "summary": {
    "runway_days": 30,
    "runway_status": "safe",
    "min_projected_balance": 28300.0,
    "min_balance_date": "2026-09-28",
    "total_expected_inflows": 125000.0,
    "total_scheduled_outflows": 44500.0,
    "total_estimated_burn": 24600.0,
    "ending_balance": 198400.0
  },
  "critical_events": [
    { "date": "2026-09-10", "type": "outflow", "amount": 15000.0, "title": "SIPs (Investments)" },
    { "date": "2026-09-15", "type": "outflow", "amount": 4500.0, "title": "Electricity Bill" },
    { "date": "2026-09-30", "type": "inflow", "amount": 125000.0, "title": "Monthly Salary" }
  ],
  "trajectory": [
    { "day": 1, "date": "2026-09-05", "balance": 141680.0, "inflow": 0, "outflow": 820.0, "events": [] }
  ]
}
```

---

## 3. REST API & Integration

### 3.1 Endpoints in `handlers/http_server.py`
1. **`GET /api/cashflow/forecast?horizon=30`**
   - Returns full simulation trajectory, critical milestones, and runway metrics.
2. **`POST /api/cashflow/settings`**
   - Updates starting liquid balance, safety threshold, and burn rate toggle:
   ```json
   {
     "token": "...",
     "starting_liquid_balance": 150000.0,
     "low_balance_threshold": 15000.0,
     "include_daily_burn": true
   }
   ```

---

## 4. Web Dashboard Visual Design

### 4.1 Top Runway KPI Cards
- **🛡️ Liquidity Runway:** `30+ Days` (🟢 Healthy / 🟡 Tight / 🔴 Danger).
- **💧 Available Liquid Balance:** `₹1,42,500` *(with quick ✏️ adjust icon)*.
- **📉 Minimum Projected Dip:** `₹28,300` on 28-Sep-2026.
- **⚡ Average Daily Burn:** `₹820 / day`.

### 4.2 Interactive Cashflow Trajectory Chart
- A smooth curved SVG line graph displaying the balance projection over 30 or 60 days.
- **Color Coding:** Green curve when comfortably above threshold; transitions to yellow/red if dipping below safety limits.
- **Event Tooltips:** Hovering over spikes/dips shows details (e.g. `10-Sep: -₹15,000 SIPs`).
- **Safety Line:** Red dashed horizontal line indicating `low_balance_threshold`.

### 4.3 Calibration Modal (`#cashflow-settings-drawer`)
- Simple drawer allowing users to enter/update their current bank balance and safety threshold anytime.

---

## 5. Telegram Bot Interface & Proactive Alerts

### 5.1 Telegram Commands in `handlers/commands.py`
- **`/runway` or `/forecast`:**
  Returns an instant formatted forecast message with current runway status, lowest projected dip date, upcoming major payments, and direct dashboard link.

### 5.2 Proactive Low-Balance Alert Hook
- When an expense or bill is logged that causes the 30-day projected balance to drop below `low_balance_threshold`, the bot appends a non-intrusive warning notice:
  > *"⚠️ **Runway Alert:** This ₹25k payment reduces your projected balance on Sept 28 to **₹4,200** (below your ₹10k threshold). Consider pacing discretionary spend."*

---

## 6. Verification & Test Plan

1. **Unit Tests (`tests/test_cashflow_forecast.py`):**
   - Mathematical verification of starting balance calibration.
   - Simulation of recurring salary + SIPs + bills over 30 and 60 days.
   - Variable burn rate calculation and threshold dip detection.
2. **E2E REST API Tests:**
   - Verify `GET /api/cashflow/forecast` and `POST /api/cashflow/settings`.
3. **Browser UI Tests:**
   - Verify trajectory curve renders smoothly, tooltips appear, and balance calibration drawer updates the state.
