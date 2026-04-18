# Design System: Candidate Screening Platform

An executive-grade, AI-native design system built on Tailwind CSS and Radix UI. Designed for speed, clarity, and trust in hiring workflows.

## Design Philosophy

- **Executive-grade**: Professional, serious, trustworthy
- **AI-native**: Visual language emphasizes AI capabilities while keeping humans in control
- **Calm and clear**: No unnecessary noise; every visual element has purpose
- **Progressive disclosure**: Advanced options hidden, key actions elevated
- **Trust through transparency**: Show reasoning, confidence levels, uncertainties

---

## Color Palette

### Semantic Colors

| Token | Value | Use Case |
|-------|-------|----------|
| `--accent` | #2563eb (Blue-600) | Primary actions, links, focus states |
| `--accent-hover` | #1d4ed8 (Blue-700) | Hover state for accent elements |
| `--accent-light` | #eff6ff (Blue-50) | Background for accent emphasis |
| `--accent-border` | #bfdbfe (Blue-200) | Border for accent containers |
| `--ai` | #0284c7 (Sky-600) | AI features, AI-generated content |
| `--ai-hover` | #099ded (Sky-500) | Hover state for AI elements |
| `--ai-light` | #f0f9ff (Sky-50) | Background for AI emphasis |
| `--ai-border` | #bae6fd (Sky-200) | Border for AI containers |

### Success State
| Token | Value | Use Case |
|-------|-------|----------|
| `--success` | #059669 (Emerald-600) | Success messages, completed items |
| `--success-light` | #ecfdf5 (Emerald-50) | Background for success emphasis |
| `--success-border` | #a7f3d0 (Emerald-200) | Border for success containers |

### Warning/Caution State
| Token | Value | Use Case |
|-------|-------|----------|
| `--warning` | #d97706 (Amber-600) | Warnings, at-risk items, caution |
| `--warning-light` | #fffbeb (Amber-50) | Background for warning emphasis |
| `--warning-border` | #fde68a (Amber-200) | Border for warning containers |

### Error State
| Token | Value | Use Case |
|-------|-------|----------|
| `--error` | #dc2626 (Red-600) | Errors, destructive actions |
| `--error-light` | #fef2f2 (Red-50) | Background for error emphasis |
| `--error-border` | #fecaca (Red-200) | Border for error containers |

### Neutral Colors

| Token | Value | Use Case |
|-------|-------|----------|
| `--canvas` | #f6f8fa (Slate-50) | Page background |
| `--surface` | #ffffff | Card/panel backgrounds |
| `--surface-inset` | #f3f5f8 (Slate-100) | Nested/inset panels |
| `--border` | #e4e7ec (Slate-200) | Default borders |
| `--border-strong` | #c9cfd8 (Slate-300) | Emphasis borders |
| `--text-primary` | #0c111d (Slate-950) | Primary text, headings |
| `--text-secondary` | #4b5563 (Slate-600) | Secondary text, descriptions |
| `--text-muted` | #8f99a8 (Slate-500) | Muted text, placeholders |

---

## Typography

### Type Scale

| Level | Size | Weight | Use Case |
|-------|------|--------|----------|
| Page Title | 28px | Bold (700) | Page titles, major section headings |
| Section Title | 22px | Bold (700) | Section headers within pages |
| Subsection | 18px | Semibold (600) | Card titles, subsection headings |
| Label | 14px | Semibold (600) | Form labels, list item titles |
| Body | 14px | Regular (400) | Primary content, descriptions |
| Small | 12px | Regular (400) | Timestamps, secondary info, captions |
| Tiny | 11px | Regular (400) | Badge text, helper text |

### Font Families

```
Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
```

---

## Spacing System

All spacing uses 4px base unit (Tailwind scale):

| Tokens | Values | Use Case |
|--------|--------|----------|
| xs–sm | 4–8px | Tight grouped elements, badges |
| md | 12px | Component padding, small gaps |
| lg | 16px | Card padding, section gaps |
| xl | 20px | Page section gaps, large components |
| 2xl–3xl | 24–32px | Layout divisions, breathing room |
| 4xl+ | 40px+ | Full-width section gaps |

---

## Shadows & Elevation

| Token | Use Case |
|-------|----------|
| `shadow-sm` | Cards at rest, default elevation |
| `shadow-md` | Cards on hover, form field focus |
| `shadow-lg` | Dropdowns, elevated panels |
| `shadow-xl` | Modals, hero sections |
| `shadow-glow` | AI-generated highlights |
| `shadow-glow-lg` | Hero AI callouts, primary CTAs |

---

## Border Radius

| Size | Value | Use Case |
|------|-------|----------|
| sm | 6px | Small UI elements, buttons, badges |
| md | 8px | Cards, modals, form fields |
| lg | 12px | Large cards, containers |
| xl | 16px | Hero sections, full-width panels |

---

## Motion & Transitions

### Timing

- **100ms**: Hover states, quick feedback
- **150ms**: Button presses, state changes
- **300ms**: Modal opens, page transitions
- **500ms**: Complex animations, progressive reveals

### Animations

| Animation | Purpose |
|-----------|---------|
| `slide-up` | Content enters from below (modals, dropdowns) |
| `slide-down` | Content enters from above (notifications) |
| `fade-in` | Content fades in (page transitions) |
| `scale-in` | Content scales up (emphasis, reveals) |
| `ai-pulse-ring` | AI processing indicator |

### Accessibility

Provide `prefers-reduced-motion` variants for all animations.

---

## Component Visual Patterns

### Buttons

**Primary** (Default Actions)
- Blue (#2563eb) background, white text
- Hover: Darker blue (#1d4ed8), slight lift (shadow-md)
- Used for: Main CTAs, job creation, run screening

**AI-Powered** (AI Actions)
- Gradient background (slate-900 → blue-900)
- White text, glowing shadow
- Used for: AI screening, auto-ranking

**Destructive** (Delete/Reject)
- Red background, white text
- Used for: Delete, reject, cancel

**Outline** (Secondary)
- White background, slate border
- Hover: Light gray background
- Used for: Secondary actions, navigation

**Ghost** (Minimal)
- Transparent, slate text
- Hover: Light gray background
- Used for: Links, minimal actions

---

## Accessibility (WCAG AA)

✓ All text meets 4.5:1 contrast minimum
✓ Focus indicators: 2px ring, 2px offset, blue color
✓ Keyboard navigation: Logical, no positive tab indices
✓ Status never indicated by color alone: Always pair with icon/text

---

## Quick Reference: Common Patterns

**Card Container**: `rounded-lg bg-white border border-slate-200 shadow-sm p-5`

**Section Title**: `text-xl font-bold text-slate-900`

**Secondary Text**: `text-sm text-slate-500`

**Disabled State**: `pointer-events-none opacity-50`

**Hover Lift**: `transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md`
