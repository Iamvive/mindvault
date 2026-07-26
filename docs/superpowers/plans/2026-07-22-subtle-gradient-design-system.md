# Subtle Gradient Design System Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a shared "Subtle Gradient" design system asset and configure the AI rules so all future UI development automatically aligns with it, then apply it directly to the Telegram Finance Bot dashboard.

**Architecture:** We will create a shared `shared/design-system/` folder housing the core CSS style variable sheet and manual. We will configure `.agents/AGENTS.md` to enforce UI styling parameters, and then refactor the Telegram Finance Bot's HTML template variables to map to these tokens.

**Tech Stack:** Vanilla CSS, HTML, Markdown

## Global Constraints
- **Accent Color:** `#e60023` is the sole saturated brand color.
- **Rounding:** Must use rounded corners (`16px`/`32px`/`9999px`) on cards/buttons.
- **Typography:** Inter sans-serif font globally. No serif/monospace.

---

### Task 1: Create Core CSS stylesheet & Documentation

**Files:**
- Create: `shared/design-system/subtle-gradient.css`
- Create: `shared/design-system/README.md`

**Interfaces:**
- Consumes: None
- Produces: `subtle-gradient.css` variable tokens and `README.md` style documentation.

- [ ] **Step 1: Create directories and write `subtle-gradient.css`**
  Write variables and helper utility classes for the Subtle Gradient theme.
  
  Code Content for `shared/design-system/subtle-gradient.css`:
  ```css
  /* ============================================================
     Subtle Gradient Design System — Core Tokens
     ============================================================ */
  :root {
    /* -- Brand & Accent -- */
    --sg-primary: #e60023;
    --sg-on-primary: #ffffff;
    --sg-primary-pressed: #cc001f;

    /* -- Ink / Text -- */
    --sg-ink: #000000;
    --sg-ink-soft: #211922;
    --sg-body: #33332e;
    --sg-charcoal: #262622;
    --sg-mute: #62625b;
    --sg-ash: #91918c;
    --sg-stone: #c8c8c1;

    /* -- Surfaces -- */
    --sg-canvas: #ffffff;
    --sg-surface-soft: #fbfbf9;
    --sg-surface-card: #f6f6f3;
    --sg-surface-dark: #262622;
    --sg-secondary-bg: #e5e5e0;
    --sg-secondary-pressed: #c8c8c1;
    --sg-on-secondary: #000000;

    /* -- Lines -- */
    --sg-hairline: #dadad3;
    --sg-hairline-soft: #e5e5e0;

    /* -- Focus Ring -- */
    --sg-focus-outer: #435ee5;
    --sg-focus-inner: #ffffff;

    /* -- Gradients -- */
    --gradient-page: linear-gradient(180deg, #ffffff 0%, #fbfbf9 60%, #f6f6f3 100%);
    --gradient-wash-blush: linear-gradient(135deg, #f7ede9 0%, #efe1e8 100%);
    --gradient-wash-sage:  linear-gradient(135deg, #eef1ea 0%, #e2ebe4 100%);
    --gradient-wash-slate: linear-gradient(135deg, #eaedf1 0%, #e1e4ec 100%);
    --gradient-wash-sand:  linear-gradient(135deg, #f4efe6 0%, #ede5d8 100%);
    --gradient-wash-dusk:  linear-gradient(135deg, #ece7f0 0%, #e2e4ef 100%);
    --gradient-wash-ember: linear-gradient(135deg, #f7e9e5 0%, #f0dad4 100%);
    --gradient-wash-fog:   linear-gradient(135deg, #f2f2ef 0%, #e7e7e2 100%);
    --gradient-wash-clay:  linear-gradient(135deg, #f0e7e0 0%, #e4d3c8 100%);

    /* -- Semantic Aliases -- */
    --text-heading: var(--sg-ink);
    --text-body: var(--sg-body);
    --text-muted: var(--sg-mute);
    --surface-page: var(--sg-surface-soft);
    --surface-canvas: var(--sg-canvas);
    --surface-card: var(--sg-surface-card);
    --border-hairline: var(--sg-hairline);
    --action-primary: var(--sg-primary);
    --action-secondary: var(--sg-secondary-bg);

    /* -- Spacing -- */
    --space-xxs: 4px;
    --space-xs: 6px;
    --space-sm: 8px;
    --space-md: 12px;
    --space-lg: 16px;
    --space-xl: 24px;
    --space-xxl: 32px;
    --space-section: 64px;

    /* -- Radius -- */
    --radius-sm: 8px;
    --radius-md: 16px;
    --radius-lg: 32px;
    --radius-full: 9999px;

    /* -- Focus Ring Outline -- */
    --focus-ring: 0 0 0 2px var(--focus-inner), 0 0 0 6px var(--focus-outer);
  }
  ```

- [ ] **Step 2: Create `shared/design-system/README.md`**
  Write documentation explaining the Subtle Gradient guidelines.

  Code Content for `shared/design-system/README.md`:
  ```markdown
  # Subtle Gradient Design System Reference Manual

  This folder houses the core assets for the Subtle Gradient UI theme.

  ## Principles
  - **Single Accent Color:** `#e60023` (red) is the sole saturated brand color.
  - **No Serif/Monospace:** Fonts are geometric sans-serif (Inter) globally.
  - **Soft Rounding:** Cards use `16px`/`32px` corners. Chips/pill buttons are circular (`9999px`).
  - **Double-Ring Focus:** Focused elements must display a high-contrast focus outline.
  ```

- [ ] **Step 3: Verify the files exist**
  Run: `ls -la shared/design-system`
  Expected: Output listing `subtle-gradient.css` and `README.md`.

- [ ] **Step 4: Commit**
  ```bash
  git add shared/design-system/
  git commit -m "style: add subtle gradient core css and documentation"
  ```

---

### Task 2: Configure Workspace AI Rules

**Files:**
- Modify: `.agents/AGENTS.md` (append guidelines)

**Interfaces:**
- Consumes: None
- Produces: AI instructions block for the design language.

- [ ] **Step 1: Append design system guidelines to `.agents/AGENTS.md`**
  Write rules under a new section.

  Append content:
  ```markdown
  ## Subtle Gradient Design System Constraints

  Whenever generating UI styling, writing CSS, or styling frontend components:
  1. **Typography:** Never use monospace, serif, or generic display fonts. Standard font family must be `Inter`, system-ui, sans-serif. Use negative tracking (e.g. `letter-spacing: -1.2px`) on display/large headings.
  2. **Colors:** Use variables from the Subtle Gradient CSS. The only saturated accent color allowed is `--sg-primary` (`#e60023`). Avoid saturated greens, blues, or yellows unless explicitly requested.
  3. **Surfaces:** Use desaturated washes (`--gradient-wash-*`) for card mockups, section backgrounds, or image placeholders.
  4. **Rounding:** UI elements must be rounded. Use `16px` for standard cards/buttons, `32px` for major cards, and `9999px` for search bars, status chips, pill buttons, and avatars.
  5. **Focus States:** Every button, input, or link must have a double-ring focus state on active/focus transitions using `box-shadow: var(--focus-ring)`.
  ```

- [ ] **Step 2: Verify guidelines are appended**
  Run: `tail -n 25 .agents/AGENTS.md`
  Expected: The output should end with the newly appended constraints.

- [ ] **Step 3: Commit**
  ```bash
  git add .agents/AGENTS.md
  git commit -m "config: add subtle gradient constraints to agents rules"
  ```

---

### Task 3: Refactor Telegram Finance Bot HTML Dashboard Template

**Files:**
- Modify: `telegram-finance-bot/dashboard/template.html`

**Interfaces:**
- Consumes: `shared/design-system/subtle-gradient.css` variables
- Produces: Refactored CSS theme styling for the finance dashboard.

- [ ] **Step 1: Modify CSS variables and overrides in `telegram-finance-bot/dashboard/template.html`**
  Find the `:root` block starting around line 14 and replace it with:
  ```html
      <style>
          :root {
              /* Map to Subtle Gradient Design Tokens */
              --bg-main: var(--surface-page, #fbfbf9);
              --bg-card: var(--surface-canvas, #ffffff);
              --bg-card-hover: var(--surface-card, #f6f6f3);
              --border-glow: var(--border-hairline, #dadad3);
              --border-active: var(--action-primary, #e60023);
              --text-primary: var(--sg-ink, #000000);
              --text-secondary: var(--sg-body, #33332e);
              --text-muted: var(--sg-mute, #62625b);
              
              /* Subtle Gradient Accents */
              --color-needs: var(--sg-accent-blue, #617bff);
              --color-needs-glow: rgba(97, 123, 255, 0.08);
              --color-wants: var(--sg-primary, #e60023);
              --color-wants-glow: rgba(230, 0, 35, 0.08);
              --color-savings: var(--sg-accent-purple-deep, #6845ab);
              --color-savings-glow: rgba(104, 69, 171, 0.08);
              --color-income: #103c25;
              --color-income-glow: var(--sg-success-pale, #c7f0da);
              --color-transfer: var(--sg-ash, #91918c);

              /* Typography overrides (Remove Serif) */
              --font-serif: var(--font-sans);
              --font-sans: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
              --font-stack: var(--font-sans);
              --transition-smooth: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          }
  ```

- [ ] **Step 2: Refactor brand logo styling to remove Georgia/serif font**
  Find in `template.html` the styling rules that set font-family to serif, such as:
  ```css
          .brand-logo {
              ...
              font-family: var(--font-serif);
              ...
          }
          .brand-name {
              ...
              font-family: var(--font-serif);
              ...
          }
  ```
  Change them to use `var(--font-sans)` or remove the font-family specification so they inherit `var(--font-stack)`.

- [ ] **Step 3: Verify template compiles and has updated variables**
  Run: `grep -A 20 ":root" telegram-finance-bot/dashboard/template.html`
  Expected: Output showing the new Subtle Gradient mappings.

- [ ] **Step 4: Commit**
  ```bash
  git add telegram-finance-bot/dashboard/template.html
  git commit -m "style: apply subtle gradient styles to telegram bot dashboard"
  ```
