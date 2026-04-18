# Component Library: Visual Usage Guide

A visual reference for using existing components consistently across the platform. This guide shows the recommended visual hierarchy, spacing, and composition patterns.

---

## Button Component

### Visual Variants

**Primary Button**
- Use for: Main actions (Create Job, Run Screening, Submit, Save)
- Visual: Blue background, white text, shadow on rest
- Hover: Darker blue, lift up 2px, larger shadow
- Icon position: Before text, 8px gap
- Size guidance: Default (40px height) for standard, Large (48px) for hero CTAs

**AI Button**
- Use for: AI-powered actions, intelligent defaults
- Visual: Dark gradient background, white text, glow shadow
- Hover: Increase glow intensity, lift
- Icon: AI badge or sparkles icon
- Placement: Primary action when AI-driven

**Outline Button**
- Use for: Secondary/alternative actions (Cancel, Skip, Learn More)
- Visual: Transparent background, slate border, slate text
- Hover: Light gray background, slightly darker border
- Best paired with Primary button

**Ghost Button**
- Use for: Minimal actions, links, filter toggles
- Visual: Transparent, slate text, no border
- Hover: Light gray background
- Use sparingly to avoid action ambiguity

### Visual Hierarchy Example

```
Page with mixed actions:
┌─────────────────────────────────┐
│  [Primary Button] [Outline Button]  │
│                                     │
│  Ghost Link  /  Another Ghost Link  │
└─────────────────────────────────┘
```

**Spacing between buttons**: 12px (use gap-3 or mx-1.5)

---

## Card Component

### Structure

```
┌──────────────────────────────────┐
│  ┌─ Title (18px, Semibold)      │
│  │ Subtitle or description       │
│  │ (14px, Slate-600)            │
│  └──────────────────────────────┘
│                                  │
│  Main content area              │
│  (p-5 or p-6)                   │
│                                  │
│  ┌──────────────────────────────┐
│  │ Footer actions               │
│  │ (gap-2 flex)                 │
│  └──────────────────────────────┘
└──────────────────────────────────┘
```

### Visual States

**At Rest**
- White background, slate-200 border
- Shadow-sm (1px 4px with 1px offset)
- Padding: 20px (p-5) for compact, 24px (p-6) for breathing room

**Hover** (if interactive)
- Lift -2px (translate-y)
- Shadow-md increases
- Border slightly darker
- Smooth 150ms transition

**Active/Selected**
- Accent border color (#2563eb)
- Shadow-md + accent tint
- Slight blue background wash

### Card Hierarchy

```
Hero Card (Emphasized)
- Rounded-xl (12px) instead of lg
- Shadow-md at rest
- Accent-light background or accent border
- Used for: Critical info, top recommendations

Standard Card
- Rounded-lg (8px)
- Shadow-sm
- White background
- Used for: List items, data containers

Nested Card (Inset)
- Rounded-lg
- Surface-inset background (#f3f5f8)
- No border or light border
- Used for: Supplementary info, details
```

---

## Badge Component

### Visual Patterns

**Status Badge** (Information display, no action)
- Small pill shape, rounded-md
- Icon (left) + text + optional count (right)
- Height: 24px (tight)
- Padding: 6px 12px
- Colors: Semantic (success, warning, error, info)
- Example: ✓ Screening Complete

**Level Badge** (Candidate experience level)
- Green for Junior, Blue for Mid-level, Blue-dark for Senior, Amber for Lead
- Icon + text (e.g., "🎯 Senior")
- Used in candidate cards, screening results
- Semantic coloring based on `--level-*` tokens

**Readiness Badge** (Job status indicator)
- Visual codes: Draft (gray), Ready (green), Needs Candidates (orange), Recently Screened (blue)
- Icon + text
- Example: "📋 Ready for Screening"

**Quality Flag** (Candidate data quality)
- Incomplete Profile (warning), Strong Match (success), At Risk (error)
- Small indicator badge in corner of candidate cards
- Icon-only or icon + brief text

### Badge Spacing

- Gap between badge and adjacent content: 8px
- Multiple badges in a row: 8px gap between each
- Badge group to next element: 12px

---

## Empty State Component

### Structure

```
┌──────────────────────────────┐
│                              │
│         [Empty Icon]         │
│      (64px, slate-300)       │
│                              │
│   "No candidates yet"        │
│   (18px, slate-900)          │
│                              │
│   "Import CSV or PDF to      │
│    get started"              │
│   (14px, slate-600)          │
│                              │
│   [Primary Action Button]    │
│   (Upload, Create, etc)      │
│                              │
└──────────────────────────────┘
```

### Visual States

**For no data**: Friendly icon, encouraging message, clear CTA
**For error**: Error icon, explain what went wrong, recovery action
**For no results**: Search icon, suggest filters, show quick actions

### Spacing
- Icon to title: 16px
- Title to description: 8px
- Description to action: 20px
- Padding around container: 40px

---

## Filter Bar Component

### Structure

```
┌────────────────────────────────────────┐
│ [Status ▼] [Level ▼] [Type ▼] [× Clear] │
│                            [Search Box]  │
└────────────────────────────────────────┘
```

### Visual Hierarchy

- Compact on mobile (stacked or wrapped)
- Horizontal on tablet/desktop
- Active filters: Accent blue background, white text
- Inactive filters: Ghost style
- Search box: Right-aligned or full-width below filters
- Clear button: Ghost style, appears when filters active

### Spacing
- Between filters: 12px gap
- Between filter groups: 16px
- Search box left padding: 16px

---

## Score Display Components

### Score Ring (Circular)

**Visual** (70px diameter):
```
        ╭─────╮
        │ 82% │  ← Large bold number
        │ ▓▓▓ │  ← Colored arc (green, yellow, red)
        ╰─────╯
    "Match Score"  ← Label below (12px)
```

- Green arc: 75%+
- Yellow arc: 50–74%
- Red arc: <50%
- Stroke width: 6px
- Background ring: Light gray (10% opacity)

### Score Bar (Linear)

**Visual**:
```
Match Score
████████░░ 80%
```

- Full width, 8px height
- Colored fill based on score band
- Percentage text right-aligned
- Label above (12px, slate-600)
- No rounded corners on ends (square)

### Confidence Indicator

**Visual**:
```
Confidence: ★★★★☆ (4/5)
Or:
Confidence: 80% (green check if high, amber caution if medium)
```

- Icon + text, 12px size
- Green (>75%), Amber (50–75%), Red (<50%)
- Always pair color with icon for accessibility

---

## List Item Patterns

### Candidate List Item

```
┌─────────────────────────────────────────┐
│ [Avatar] Name           [Badge] [Badge] │
│         Title · Company · Location      │
│         Skills: Python, React, AWS      │
│ Match: 85% | Fit: 9/10 | Flag: ⚠️      │
│         [View] [Export]                 │
└─────────────────────────────────────────┘
```

**Spacing**: 16px padding, 12px between sections
**Hover**: Lift, shadow increase, accent border

### Job List Item

```
┌─────────────────────────────────────────┐
│ Job Title                   [Badge]     │
│ Department · Level · Type              │
│ Candidates: 12 | Screened: 8 | Top: 82% │
│         Created 5 days ago             │
│ [View Details] [Run Screening]         │
└─────────────────────────────────────────┘
```

**Spacing**: 16px padding, 12px gaps
**Status indicator**: Left border accent color or status badge

---

## Form Field Pattern

### Text Input

```
Label Text (14px, semibold)
┌────────────────────────────┐
│ Placeholder or value       │
└────────────────────────────┘
Helper text (12px, slate-500)
```

- Height: 40px (default)
- Padding: 12px left/right
- Border: Slate-200
- Focus: Blue accent ring (2px offset)
- Disabled: Opacity-50, pointer-events-none

### Select/Dropdown

```
Label
┌──────────────────────────────┐
│ Selected Item          [▼]   │
└──────────────────────────────┘
```

- Same height/padding as text input
- Dropdown arrow on right (slate-400)
- Hover: Border slightly darker
- Open state: Blue border, shadow-lg

---

## Page Header Pattern

### Layout Structure

```
┌─────────────────────────────────────────┐
│                                         │
│  Page Title (28px, bold)                │
│  Optional subtitle or breadcrumb        │
│                                         │
│         [Primary CTA] [Secondary CTA]   │
│                                         │
└─────────────────────────────────────────┘
```

**Spacing**:
- Title to subtitle: 4px
- Subtitle to buttons: 16px
- Between buttons: 12px gap
- Overall padding: 24px (section xl)

**Visual Hierarchy**:
- Title in slate-900 (primary text)
- Subtitle in slate-600 (secondary text)
- Primary button: Blue, default size
- Secondary button: Outline or ghost

---

## Status Indicator Pattern

### Never Use Color Alone

✗ **Bad**: Only red background = ambiguous meaning
✓ **Good**: Red background + "✗ Rejected" text + tooltip on hover

### Visual Pattern

```
[Icon] Status Text
  ↓
✓ Screening Complete
✗ No Match
⏱ In Progress
⚠ At Risk
? Uncertain
```

**Spacing**: Icon (16px) + 8px gap + text (14px)

---

## Comparison Patterns

### Side-by-Side Comparison (2–3 items)

```
Candidate 1          Candidate 2          Candidate 3
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Avatar      │    │ Avatar      │    │ Avatar      │
│ Name        │    │ Name        │    │ Name        │
│ Stats...    │    │ Stats...    │    │ Stats...    │
│ [Compare]   │    │ [Compare]   │    │ [Compare]   │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Spacing**: 16px between columns
**Breakpoint**: Collapses to vertical stack on tablet/mobile

---

## Modal Pattern

### Structure

```
╭─────────────────────────────╮
│ Title                    [×] │
│                             │
│ Content area                │
│ (Scrollable if >400px)      │
│                             │
│ [Cancel] ────────────── [OK]│
╰─────────────────────────────╯
```

**Sizing**: Max 600px width, centered on screen
**Backdrop**: Dark semi-transparent overlay
**Shadows**: shadow-xl for elevated appearance
**Padding**: 24px (p-6) internal
**Footer**: Flex row, gap-2, buttons right-aligned

---

## Best Practices

1. **Consistency**: Use the same components across all pages
2. **Spacing**: Respect the 4px base unit; use logical multiples
3. **Color**: Never indicate status by color alone
4. **Icons**: Pair with text for clarity and accessibility
5. **Motion**: Only animate to show status change or guide focus
6. **Mobile**: Test all patterns at 375px and 768px widths
7. **Contrast**: Verify all text meets WCAG AA (4.5:1 for normal text)
8. **Keyboard**: Ensure all interactive elements are tab-accessible

---

## Next Steps

Use this guide when designing layouts. Match component patterns to these visual specifications for consistency across all pages.
