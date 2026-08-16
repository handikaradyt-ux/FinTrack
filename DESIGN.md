---
name: FinTrack
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#855300'
  on-tertiary: '#ffffff'
  tertiary-container: '#e29100'
  on-tertiary-container: '#523200'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 24px
  margin: 40px
---

## Brand & Style
The design system is engineered for high-density financial data management, emphasizing clarity, precision, and a sense of calm control. The target audience includes professionals and proactive individuals seeking a sophisticated, SaaS-inspired interface to monitor their financial health.

The style is **Corporate / Modern Minimalism**. It prioritizes a high signal-to-noise ratio by utilizing generous whitespace, a structured grid, and a restricted color palette. The aesthetic response should be one of "effortless productivity"—where the interface recedes to let the user's data take center stage. Interaction patterns are intentional and predictable, avoiding unnecessary flourishes to maintain a professional atmosphere.

## Colors
The palette is anchored by "Modern Green," a vibrant yet professional primary hue that signals financial vitality. 

- **Primary & Success:** Used for growth indicators, CTA buttons, and positive balance states. While both are greens, Primary is reserved for brand actions and Success for validated system states.
- **Danger & Warning:** Critical for financial alerts. Use Red for negative cash flow and destructive actions. Amber is used for "near-limit" budget notifications.
- **Neutrals:** A cool-gray scale ensures the interface feels "Saas-like." Backgrounds utilize a subtle cool off-white to reduce eye strain, while surfaces are pure white to create a clear layered hierarchy.
- **Indonesian Context:** Color associations remain standard; however, ensure that "Danger" red is used judiciously to avoid creating unnecessary panic in ledger views.

## Typography
This design system utilizes **Inter** for its exceptional legibility in data-heavy environments and its neutral, systematic character.

- **Scale:** The hierarchy is aggressive to distinguish between high-level net worth figures and granular transaction details. 
- **Numerical Data:** For ledger tables and charts, use `font-variant-numeric: tabular-nums` to ensure that currency values align vertically for easy comparison.
- **Indonesian Language Support:** Inter supports all necessary glyphs for Indonesian. Note that Indonesian text strings (e.g., "Pengeluaran" vs "Expenses") can be 20-30% longer; ensure typography styles account for overflow and use `body-md` for dense list views.

## Layout & Spacing
The layout adheres to a strict **8px spacing grid** to maintain mathematical harmony and professional alignment.

- **Grid Model:** A 12-column fluid grid is used for the main dashboard content. Sidebars are fixed at 280px to ensure the navigation remains a constant anchor.
- **Density:** Given the desktop focus, the design system favors a "Compact" density for transaction lists and a "Spacious" density for reporting overviews.
- **Breakpoints:**
  - **Desktop (1440px+):** Full 12-column layout with 40px margins.
  - **Tablet (1024px):** 8-column layout; sidebar may collapse to an icon-only rail.
  - **Mobile (Adaptive):** Content stacks vertically with 16px horizontal margins.

## Elevation & Depth
Depth is communicated through **Tonal Layering** supplemented by subtle ambient shadows. 

1. **Level 0 (Background):** `#F8FAFC` - The canvas.
2. **Level 1 (Surface):** `#FFFFFF` - Cards, data tables, and white-space containers. These use a 1px border (`#E2E8F0`) instead of heavy shadows to maintain a clean SaaS look.
3. **Level 2 (Interaction):** Dropdowns, modals, and hovered cards. These feature a soft, diffused shadow: `0 10px 15px -3px rgba(0, 0, 0, 0.05)`.
4. **Level 3 (Overlay):** Modals and critical alerts. These utilize a backdrop blur (8px) on the Level 0 background to isolate the user's focus.

## Shapes
The shape language is "Rounded," balancing the rigidity of financial data with a modern, approachable feel.

- **Small Components (Buttons, Inputs):** Use `0.5rem` (8px) corner radius.
- **Large Containers (Cards, Modals):** Use `0.75rem` (12px) to `1rem` (16px) corner radius.
- **Charts:** Bar charts and progress bars should use a `4px` radius to maintain a clean but non-aggressive look.

## Components
- **Buttons:** Primary buttons use a solid Modern Green fill with white text. Secondary buttons use a light gray ghost style with `#475569` text. High-density views should use a "Small" button variant (32px height).
- **Input Fields:** Use a 1px border (`#CBD5E1`). On focus, the border transitions to Primary Green with a subtle 2px outer glow. Labels are always persistent above the field in `label-md`.
- **Cards:** White surfaces with a 1px `#E2E8F0` border. No shadow in resting state; subtle shadow on hover if the card is interactive.
- **Chips/Badges:** Used for transaction categories (e.g., "Food", "Rent"). These use a "Low-Contrast" style: a pale background tint of the category color with high-contrast text.
- **Data Tables:** Row heights are set to 48px. Use zebra-striping (`#F8FAFC`) only for tables exceeding 10 columns. Header cells use `label-sm` with a bottom border.
- **Financial Indicators:** "Income" items are prefixed with a plus (+) and use Success Green. "Expenses" are prefixed with a minus (-) and use Neutral Deep text.