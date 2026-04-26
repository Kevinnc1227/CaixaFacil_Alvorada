---
name: Alvorada Dynamic
colors:
  surface: '#001135'
  surface-dim: '#001135'
  surface-bright: '#29385d'
  surface-container-lowest: '#000c2b'
  surface-container-low: '#081a3d'
  surface-container: '#0d1e42'
  surface-container-high: '#19294d'
  surface-container-highest: '#243458'
  on-surface: '#d9e2ff'
  on-surface-variant: '#c6c6cf'
  inverse-surface: '#d9e2ff'
  inverse-on-surface: '#202f54'
  outline: '#8f9099'
  outline-variant: '#45464e'
  surface-tint: '#b9c5f2'
  primary: '#b9c5f2'
  on-primary: '#222f53'
  primary-container: '#0d1b3e'
  on-primary-container: '#7784ad'
  inverse-primary: '#515d84'
  secondary: '#ffb3ae'
  on-secondary: '#68000c'
  secondary-container: '#9b0217'
  on-secondary-container: '#ffa39d'
  tertiary: '#c6c6c7'
  on-tertiary: '#2f3131'
  tertiary-container: '#1b1d1d'
  on-tertiary-container: '#848585'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b9c5f2'
  on-primary-fixed: '#0b1a3d'
  on-primary-fixed-variant: '#39456b'
  secondary-fixed: '#ffdad7'
  secondary-fixed-dim: '#ffb3ae'
  on-secondary-fixed: '#410004'
  on-secondary-fixed-variant: '#930015'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#001135'
  on-background: '#d9e2ff'
  surface-variant: '#243458'
typography:
  display-lg:
    fontFamily: Lexend
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
  headline-lg:
    fontFamily: Lexend
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Lexend
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.5'
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  stat-lg:
    fontFamily: Lexend
    fontSize: 40px
    fontWeight: '800'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 16px
  margin: 24px
---

## Brand & Style

The design system is built for the high-intensity environment of a professional football club’s operations. It balances the aggressive energy of sports with the clinical precision of a modern POS tool. 

The aesthetic is **High-Contrast Bold**, utilizing deep, saturated backgrounds to make functional elements "pop" with maximum visibility under stadium lights or in fast-paced retail settings. It avoids the softness of traditional SaaS products, opting instead for a flat, tectonic style where information is organized in solid, structural blocks. This creates a sense of reliability, speed, and passion, ensuring that volunteers and professional staff alike can navigate the interface with zero friction.

## Colors

The palette is rooted in the club’s identity, prioritizing high-legibility and action-oriented signals.

*   **Primary Background:** Deep Navy (#0D1B3E) provides a stable, low-fatigue base for touchscreen use.
*   **Action & Accent:** Vivid Red (#C0272D) is reserved strictly for primary buttons, alerts, and critical highlights. It is the "heat" of the system.
*   **Surface Tiers:** Neutral Navy (#1A2A4E) is used to differentiate cards and containers from the base background.
*   **Text & Strokes:** Clean White (#FFFFFF) and low-opacity variants ensure that content is readable in any lighting condition.

## Typography

This design system utilizes **Lexend** across all levels. Originally designed for readability, its athletic and geometric character fits the sports motif perfectly. 

Large numbers for prices, scores, and totals use the `stat-lg` style to ensure they are the first thing a user sees. Headlines are set with tight line heights and heavy weights to mimic sports journalism and broadcast graphics. All labels are capitalized with slight tracking to maintain clarity on smaller touchscreen buttons.

## Layout & Spacing

The layout employs a **Fluid Grid** model optimized for tablets and POS terminals. It follows a 12-column structure with generous touch targets.

*   **Touch Optimality:** No interactive element (button or input) should be smaller than 44x44px.
*   **Spacing Rhythm:** A 4px base unit is used. 16px (md) is the standard padding for cards and containers, while 24px (lg) is used for external margins to prevent thumb-accidents at the screen edges.
*   **Density:** While the design is bold, the spacing remains "airy" enough to prevent visual clutter during high-speed data entry.

## Elevation & Depth

To maintain a fast and modern feel, the design system utilizes **Low-contrast Outlines** and **Tonal Layering** instead of traditional shadows.

*   **Z-0 (Base):** The primary deep navy background.
*   **Z-1 (Cards):** Surfaces set to a slightly lighter neutral navy to create a tiered effect.
*   **Borders:** All cards and containers feature a 1px solid border at 10-15% white opacity. This creates a crisp, "etched" look that defines edges without adding visual weight.
*   **Active States:** Interaction is signaled by color changes (e.g., a card border turning Vivid Red) rather than lift or shadow.

## Shapes

The shape language is controlled and geometric. A consistent **8px to 12px radius** is applied to all cards and buttons to provide a professional, modern feel that avoids the "childish" look of fully pill-shaped elements while remaining friendlier than sharp corners. 

Secondary elements like tags or "chips" may use a higher roundedness (Pill) to distinguish them from actionable primary buttons.

## Components

*   **Buttons:** Primary actions are solid Vivid Red with white text. Secondary actions use the low-opacity white border with no fill.
*   **Cards:** Rounded containers with a subtle white border. Used for product items in the POS or player stats. They should include a "hollow" state when empty.
*   **Lists:** High-density rows with 1px dividers. Each row must have a minimum height of 56px for touch accuracy.
*   **Inputs:** Darker than the card background to create a "well" effect. Borders brighten on focus.
*   **Total Bar:** A persistent footer component for POS views, using `stat-lg` typography in Vivid Red to highlight the final transaction amount.
*   **Keypad:** Large, block-style buttons for numeric entry, utilizing the full width of their container for speed.