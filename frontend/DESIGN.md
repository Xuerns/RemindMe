---
name: RemindMe
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbd9da'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efedee'
  surface-container-high: '#eae8e8'
  surface-container-highest: '#e4e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#43474a'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#73787b'
  outline-variant: '#c3c7cb'
  surface-tint: '#526069'
  primary: '#526069'
  on-primary: '#ffffff'
  primary-container: '#e3f2fd'
  on-primary-container: '#606f78'
  inverse-primary: '#bac9d3'
  secondary: '#655b68'
  on-secondary: '#ffffff'
  secondary-container: '#ecdeee'
  on-secondary-container: '#6b616e'
  tertiary: '#695d46'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffeed0'
  on-tertiary-container: '#776b53'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e5ef'
  primary-fixed-dim: '#bac9d3'
  on-primary-fixed: '#0f1d25'
  on-primary-fixed-variant: '#3b4951'
  secondary-fixed: '#ecdeee'
  secondary-fixed-dim: '#cfc2d2'
  on-secondary-fixed: '#201924'
  on-secondary-fixed-variant: '#4d4450'
  tertiary-fixed: '#f1e1c3'
  tertiary-fixed-dim: '#d4c5a8'
  on-tertiary-fixed: '#221b08'
  on-tertiary-fixed-variant: '#504630'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e2'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system for this project is built upon a **Soft-Minimalist Tech** aesthetic, blending the systematic efficiency of tools like Linear with a welcoming, "feminine-tech" warmth. It targets young professionals and students who value clarity and emotional calm when managing their finances.

The UI should evoke a sense of **ordered serenity**. By leveraging high-quality whitespace, a luminous color palette, and subtle glassmorphism, the design system transforms the often-stressful task of expense tracking into a light, manageable experience. The visual language is professional yet approachable, prioritizing effortless legibility and a tactile, premium feel.

## Colors

The palette is anchored by high-luminance pastels to create a "breathable" interface. 

- **Primary (#E3F2FD):** A soft, ethereal blue used for large surface highlights, active states, and subtle backgrounds.
- **Secondary (#F3E5F5):** A delicate lavender used for categorization, secondary accents, and to provide the "feminine-tech" warmth.
- **Accent (#6366F1):** A refined Indigo-Violet used sparingly for critical Call-to-Actions (CTAs) and focus indicators to ensure accessibility against the pastel backdrop.
- **Neutrals:** Surfaces utilize a crisp white (#FFFFFF) with background scaffolding in a cool slate-gray (#F8FAFC) to maintain depth without sacrificing cleanliness.

## Typography

The design system utilizes **Inter** exclusively to achieve a modern, Swiss-inspired typographic hierarchy. The focus is on tight tracking for headlines and generous leading for body text to ensure a premium editorial feel.

- **Headlines:** Use Semi-Bold (600) or Bold (700) weights with slight negative letter-spacing to create a "contained" and professional look.
- **Body Text:** Standardizes on a 16px base for optimal readability. Use the "Slate 600" range for secondary body text to maintain a soft contrast ratio that is easy on the eyes.
- **Labels:** Use uppercase or medium weights for metadata and navigation items to distinguish them clearly from prose.

## Layout & Spacing

The layout philosophy follows a **Fluid-Fixed Hybrid** model. Content is housed within a centered container (1200px max) to prevent line lengths from becoming unreadable on ultra-wide monitors.

- **Grid:** Use a 12-column grid for desktop with 24px gutters. For mobile, transition to a single-column stack with 16px side margins.
- **Rhythm:** An 8px linear scale governs all padding and margins. Use generous "Section Padding" (80px - 120px) to separate high-level features, mimicking the spaciousness of high-end SaaS marketing pages.
- **Safe Zones:** Ensure that cards and interactive elements have at least 24px of internal padding to maintain the "premium" feel.

## Elevation & Depth

This design system moves away from heavy drop shadows in favor of **Luminous Depth**. 

- **Tonal Layering:** Depth is primarily communicated through color shifts (e.g., a white card on a #F8FAFC background).
- **Soft Glows:** When shadows are used (e.g., on elevated cards), they are highly diffused: `0 10px 30px rgba(0, 0, 0, 0.04)`.
- **Glassmorphism:** Navigation bars and floating action menus should use a backdrop blur (`12px`) with a 60% translucent white fill and a 1px "inner-glow" white border to create a crystalline effect.
- **Interactive States:** On hover, elements should lift slightly with a subtle increase in shadow spread or a transition to the Primary Soft Blue tint.

## Shapes

The shape language is defined by **organic geometricism**. While the base unit is 8px (Soft), the design system utilizes exaggerated corner radii for major containers to enhance the "friendly" and "premium" tech aesthetic.

- **Cards:** Use `rounded-2xl` (1.5rem / 24px) to create a soft, friendly framing for financial data.
- **Buttons & Inputs:** Use `rounded-lg` (0.5rem / 8px) to maintain a sense of precision and structure within the softer card containers.
- **Icons:** Use 2px stroke-width "Outline" icons with rounded caps and joins to match the typographic weight of Inter.

## Components

- **Buttons:** Primary buttons use a solid Accent Indigo or a high-contrast White-on-Blue. Secondary buttons should use a ghost style with a subtle 1px border or a faint pastel background.
- **Cards (2xl):** The core component. Always include a white background, the defined "Luminous" shadow, and 24px internal padding.
- **Inputs:** Use a soft-gray border (`#E2E8F0`) that transitions to the Primary Blue on focus. Labels should always be positioned above the field in `label-sm`.
- **Navigation:** A top-mounted or side-docked glassmorphism bar. Use active state indicators that are small horizontal "pills" of the Secondary Purple.
- **Subscription Chips:** Use highly rounded (pill-shaped) badges for status indicators (e.g., "Active", "Trial", "Canceled") using varying tints of the Primary Blue and Secondary Purple.
- **Data Visualizations:** Charts should utilize smooth, rounded line caps and gradients that transition from the Primary Blue to the Secondary Purple.