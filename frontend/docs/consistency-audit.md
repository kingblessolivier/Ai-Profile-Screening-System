# Phase 1: UX Consistency Audit & Implementation Checklist

A practical guide to assess your current UI and apply the world-class design direction. Use this checklist to prioritize fixes and track progress.

---

## Section 1: Design System Audit

### Color & Contrast
- [ ] All primary text on white background: 9.5:1+ contrast (WCAG AAA) ✓
- [ ] All secondary text: 7.2:1+ contrast (WCAG AA) ✓
- [ ] All muted text: 5.5:1+ contrast (WCAG AA) ✓
- [ ] All action text on blue background: 6.7:1+ contrast ✓
- [ ] No status indicated by color alone on any page
- [ ] Color palette matches `design-system.md` tokens

### Typography
- [ ] Page titles: 28px, bold (700), slate-900
- [ ] Section titles: 22px, bold (700), slate-900
- [ ] Card titles: 18px, semibold (600), slate-900
- [ ] Form labels: 14px, semibold (600), slate-900
- [ ] Body text: 14px, regular (400), slate-900
- [ ] Secondary text: 14px, regular (400), slate-600
- [ ] Small text: 12px, regular (400), slate-500
- [ ] All text uses Inter or system font family
- [ ] No custom font sizes outside this hierarchy

### Spacing
- [ ] All padding/margin uses 4px base unit (4px, 8px, 12px, 16px, 20px, 24px, etc.)
- [ ] Cards use `p-5` (20px) or `p-6` (24px) padding
- [ ] Page sections separated by 24px+ gaps
- [ ] List items separated by 12px gaps
- [ ] Button groups use 8px gap
- [ ] Form field groups use 12px gap between fields
- [ ] No arbitrary spacing values (e.g., 13px, 22px, 19px)

### Shadows & Elevation
- [ ] Cards at rest: `shadow-sm` (1px 4px)
- [ ] Cards on hover: `shadow-md` (4px 8px)
- [ ] Dropdowns: `shadow-lg` (12px 24px)
- [ ] Modals: `shadow-xl` (20px 40px)
- [ ] AI-featured elements: `shadow-glow` or `shadow-glow-lg`
- [ ] No shadowing outside this 5-level system

### Border Radius
- [ ] Buttons: `rounded-lg` (8px)
- [ ] Cards: `rounded-lg` (8px) or `rounded-xl` (12px) for emphasis
- [ ] Form inputs: `rounded-lg` (8px)
- [ ] Badges: `rounded-md` (6px)
- [ ] No radius values outside: 6px, 8px, 12px, 16px

---

## Section 2: Component Audit

### Button Component
- [ ] Primary (default): Blue (#2563eb) background, white text
- [ ] Primary hover: Darker blue (#1d4ed8), lift -2px, shadow-md
- [ ] Outline: White background, slate border, slate text
- [ ] Outline hover: Light gray background, darker border
- [ ] Ghost: Transparent, slate text
- [ ] Ghost hover: Light gray background
- [ ] AI variant: Gradient background (slate-900 to blue-900), glow shadow
- [ ] All buttons have `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`
- [ ] All buttons have smooth `transition-all duration-150`
- [ ] Button sizes: sm (32px), default (40px), lg (48px)
- [ ] Loading state: Spinner icon shows while disabled

### Card Component
- [ ] Base: White background, slate-200 border, rounded-lg, shadow-sm, p-5
- [ ] Card hover: Lift -2px, shadow-md, border lighter
- [ ] Card headers: Flex layout with title + optional action buttons
- [ ] Card titles: 18px semibold, slate-900
- [ ] Card descriptions: 14px regular, slate-600
- [ ] Card footers: Flex row, gap-2, actions right-aligned
- [ ] No horizontal scrolling on cards (mobile)

### Badge Component
- [ ] Status badges: Icon + text, never color alone
- [ ] Level badges: Match `--level-*` colors in `design-system.md`
- [ ] Skill badges: Pill-shaped, `rounded-md`, small (12px) text
- [ ] All badges have consistent padding: 6px 12px minimum
- [ ] Skill badges colors: Blue (#eff6ff) background, blue text, blue border

### Input Component
- [ ] Height: 40px (h-10)
- [ ] Padding: 12px left/right (px-3)
- [ ] Border: slate-200, 1px
- [ ] Focus: Blue ring (2px) with 2px offset
- [ ] Placeholder: `text-slate-500`
- [ ] Disabled: `opacity-50 pointer-events-none`
- [ ] No custom input styling outside Tailwind classes

### Empty State Component
- [ ] Icon: 64px, slate-300 color, centered
- [ ] Title: 18px bold, slate-900
- [ ] Description: 14px regular, slate-600
- [ ] CTA button: Primary variant, centered
- [ ] Spacing: Icon-to-title 16px, title-to-desc 8px, desc-to-button 20px
- [ ] Used consistently for: no jobs, no candidates, no screening results, etc.

### Filter Bar Component
- [ ] Layout: Horizontal filters + sort on same row (desktop)
- [ ] Active filter: Blue background, white text
- [ ] Inactive filter: Ghost style
- [ ] Clear button: Shows only when filters applied
- [ ] Responsive: Wraps to next line on tablet, stacks on mobile
- [ ] Spacing: 8px between filters, 16px to sort controls

### Score Display Component
- [ ] Score ring (circular): 70px diameter, 6px stroke, colored arc
- [ ] Score bar (linear): Full width, 8px height, colored fill
- [ ] Score text: Large bold percentage + label below
- [ ] Color coding: Green (75%+), Yellow (50–74%), Red (<50%)
- [ ] Confidence indicator: Icon + text, never color alone
- [ ] Stars rating: Used for ranking (e.g., ★★★★☆)

---

## Section 3: Page-Level Audit

### Dashboard Page
- [ ] Header: 28px title + optional subtitle + action buttons
- [ ] Stat cards: 3-column grid, consistent sizing, shadow-sm, hover lift
- [ ] Today's Priorities: Card-based, accent left border (4px blue), 12px gap
- [ ] Priority items: Numbered, action-focused, clear CTA
- [ ] Recent jobs: Carousel or horizontal scroll, 3 visible
- [ ] All sections have 24px vertical spacing
- [ ] No custom styling on stat cards (use component library)
- [ ] Empty state if no jobs: Friendly icon + "Get started" CTA

### Jobs List Page
- [ ] Header: Page title + search box + [+ New Job] button
- [ ] Filter bar: All filters visible, clear button appears when active
- [ ] Job cards: Full width, rounded-lg, shadow-sm, p-5
- [ ] Card layout: Title + badges (right) → Company/Meta → Metrics → Actions
- [ ] Card hover: -translate-y-0.5, shadow-md, border-l-4 blue border
- [ ] Status badges: Icon + text (✓ Ready, ⚠ At Risk, etc.)
- [ ] Metrics: Show Candidates, Screened, Top Score, Days Open
- [ ] Action buttons: [View], [Run Screening], [Export], [⋯]
- [ ] Button spacing: 8px gap between actions
- [ ] Pagination: Shown if >12 jobs
- [ ] Mobile: Cards stack, metrics vertical, buttons wrap
- [ ] Empty state: Friendly icon + [Create First Job] CTA

### Candidates List Page
- [ ] Header: Page title + [Import CSV] + [+ Add] buttons
- [ ] Filter bar: Job, Level, Quality, Source filters
- [ ] Candidate cards: Avatar (left) → Name/Title/Company → Contact → Skills
- [ ] Skills: Pill-shaped badges, rounded-md, blue colors
- [ ] Source badge: Icon + text (LinkedIn, PDF, CSV, Referral, Manual)
- [ ] Quality flags: Top-right corner badges (Strong Lead, Incomplete, At Risk, Duplicate)
- [ ] Quality progress bar: Shows % profile complete (visual)
- [ ] Screening history: "Last: Job Name (Score)"
- [ ] Actions: [View Profile], [Screenings], [Export], [⋯]
- [ ] Card hover: Same pattern as jobs (lift, shadow, border)
- [ ] Mobile: Avatar + name stacks, info flows vertically
- [ ] Empty state: [Import CSV] CTA prominent

### Screening Page
- [ ] During screening: Terminal-style UI with status message + progress bar
- [ ] Message: Plain English (e.g., "AI is evaluating Python skills")
- [ ] Progress bar: Animated, shows % complete + "X of Y scored"
- [ ] Est. time: "Est. 2–3 minutes | Cancel"
- [ ] Current candidate: Name + attributes being evaluated
- [ ] After complete: Summary stats + ranking preview
- [ ] Ranked results: Star rating + % match + name + top reasons
- [ ] Confidence band: High (green), Medium (amber), Low (red)
- [ ] Each result links to [View] full profile detail
- [ ] Export button: Prominent, [Export Results]
- [ ] Mobile: Single column, results scroll vertically

### Results Page
- [ ] Header: Job name + screening metadata (model, date, confidence)
- [ ] Decision summary: "3 recommended for interview"
- [ ] Top 3 cards: Emphasized layout, numbered badges, large cards
- [ ] Card structure: Name/Title/Experience → Why Ranked High (bullets) → Confidence → Risk Notes → Interview Questions
- [ ] Why Ranked High: Bulleted list of reasons aligned to job preferences
- [ ] Confidence: % + icon (✓ High, ⚠ Medium, ✗ Low)
- [ ] Interview questions: 3–4 concrete questions based on candidate profile
- [ ] Other candidates: Collapsible section, brief cards, reasoning shown
- [ ] Transparency footer: Model name, run time, confidence, audit link
- [ ] Export button: Available at top
- [ ] All colors have icon + text (not color alone for status)
- [ ] Mobile: Single column, cards full width, interview questions collapse

---

## Section 4: Global Patterns Audit

### Header/Navigation
- [ ] Logo + main navigation visible on all pages
- [ ] Active page highlighted in navigation
- [ ] Active job context chip shown (if applicable)
- [ ] User menu in top-right
- [ ] No horizontal scrolling on header
- [ ] Mobile: Navigation becomes hamburger menu, active job chip stays visible

### Page Headers
- [ ] Consistent 28px bold title
- [ ] Optional 14px subtitle below
- [ ] Actions (buttons) right-aligned
- [ ] 24px top padding, 4px title-to-subtitle gap, 16px to filter bar
- [ ] Breadcrumb or back link on detail pages

### Focus & Keyboard Navigation
- [ ] All interactive elements tab-accessible
- [ ] Tab order: Left→Right, Top→Bottom
- [ ] Focus indicator: 2px blue ring, 2px offset (visible on all elements)
- [ ] No `tabindex=1, 2, ...` (positive values prohibited)
- [ ] Modal: Focus trapped inside modal
- [ ] Escape key closes modals/overlays
- [ ] Enter activates buttons, Space toggles checkboxes

### Mobile Responsive
- [ ] Tested at 375px (narrow mobile)
- [ ] Tested at 768px (tablet)
- [ ] Tested at 1024px (desktop)
- [ ] No horizontal scrolling at any breakpoint
- [ ] Cards stack vertically on mobile
- [ ] Buttons: Icons + tooltips on mobile (if space constrained)
- [ ] Filter bars wrap or collapse into drawer on mobile
- [ ] Touch targets: Minimum 44px for buttons/links
- [ ] Typography scales down on mobile (base 14px → 12px for body)

### Accessibility (WCAG AA)
- [ ] All text: 4.5:1+ contrast ratio (verified)
- [ ] All interactive elements: Keyboard accessible
- [ ] All status: Icon + text + color (never color alone)
- [ ] Form labels: Associated with inputs (for-attribute)
- [ ] Images: Alt text present or `alt=""`
- [ ] Icons: Paired with text or aria-label
- [ ] Animations: `prefers-reduced-motion` variants present
- [ ] Error messages: Clear, actionable, associated with fields
- [ ] Loading states: Aria-busy, label visible
- [ ] Screen reader tested on critical flows: Create job, Run screening, View results

### Motion & Transitions
- [ ] All transitions: `transition-all duration-150` (hover states)
- [ ] Page transitions: `animate-fade-in` on load
- [ ] Modal entrance: `animate-scale-in`
- [ ] Modals: Backdrop fade-in smooth
- [ ] Progress bars: Animated fill
- [ ] Animations: Removed with `prefers-reduced-motion: reduce`
- [ ] No animations longer than 500ms (unless intentional)
- [ ] No spinning/pulsing unless actively processing

---

## Section 5: Consistency Fixes by Priority

### Priority 1: Card & List Consistency (1–2 hours)

**Fix Targets:**
- Dashboard stat cards: Ensure all use `rounded-lg shadow-sm p-5 border border-slate-200`
- Job cards: Standardize all to same width, padding, shadow
- Candidate cards: Match job card height/styling pattern
- All cards hover: Consistent `-translate-y-0.5 shadow-md transition-all duration-150`

**Checklist:**
- [ ] Search codebase for `.shadow-` usage; standardize to 4 levels
- [ ] Search for arbitrary padding (p-4, p-7, etc.); align to p-5 or p-6
- [ ] Search for arbitrary margins/gaps; align to 4px base unit multiples
- [ ] Verify all cards have hover states with lift + shadow increase
- [ ] Test hover on Dashboard stat cards, Jobs list, Candidates list

### Priority 2: Status & Badge Consistency (1 hour)

**Fix Targets:**
- Dashboard priority badges: Add icon + text
- Job status badges: All use consistent icon + color + text
- Candidate quality badges: Add icons (✓, ⚠, ✗)
- Screening results: Confidence indicators use icon + text

**Checklist:**
- [ ] Audit all badge usage: Search for `<Badge` in codebase
- [ ] Replace color-only indicators with icon + text
- [ ] Verify badge colors match `design-system.md` semantic palette
- [ ] Test badge rendering on mobile (no overflow)
- [ ] Screenshot before/after of badge changes

### Priority 3: Page Header Standardization (30 mins)

**Fix Targets:**
- Dashboard title: 28px bold
- Jobs page title: 28px bold
- Candidates page title: 28px bold
- Screening page title: 28px bold
- Results page title: 28px bold

**Checklist:**
- [ ] Search for page titles; standardize font size/weight
- [ ] Verify all have optional subtitle slot
- [ ] Add action buttons (Create, Upload, etc.) to right side
- [ ] Test spacing: 24px top, 4px title-to-subtitle, 16px to content

### Priority 4: Button Consistency (1 hour)

**Fix Targets:**
- Primary actions: Blue, 40px height, consistent across all pages
- Secondary actions: Outline, 40px height
- Ghost actions: Minimal styling
- All buttons: 150ms hover transition

**Checklist:**
- [ ] Audit all `<Button` component usage
- [ ] Verify variant usage: default (primary), outline, ghost, destructive
- [ ] Check all buttons have `transition-all duration-150`
- [ ] Verify focus rings present: `focus-visible:ring-2`
- [ ] Test button states: rest, hover, active, disabled, loading

### Priority 5: Filter Bar Consistency (30 mins)

**Fix Targets:**
- Jobs filter bar: Matches Candidates filter bar
- All filter buttons: Ghost style when inactive
- Clear button: Appears only when filters applied
- Sort dropdown: Consistent styling

**Checklist:**
- [ ] Verify filter bars use same component
- [ ] Ensure filters are ghost variant (not outline)
- [ ] Active filter: Show with blue background + white text
- [ ] Clear button: Conditional rendering when filters != default
- [ ] Responsive: Wraps on tablet, stacks on mobile

---

## Section 6: Quality Assurance Checklist

### Visual Verification
- [ ] Screenshot Dashboard at 1024px, 768px, 375px widths
- [ ] Screenshot Jobs list at 1024px, 768px, 375px widths
- [ ] Screenshot Candidates list at 1024px, 768px, 375px widths
- [ ] Screenshot Screening page (during and after)
- [ ] Screenshot Results page (top 3 + other candidates)
- [ ] Compare before/after: Overall visual cohesion improved?
- [ ] No visual regressions from existing functionality

### Functional Verification
- [ ] All buttons clickable and responsive
- [ ] All links navigate correctly
- [ ] Hover states show on all interactive elements
- [ ] Focus rings visible when tabbing through page
- [ ] No console errors or warnings
- [ ] Form validation messages show correctly
- [ ] Empty states render properly
- [ ] Loading states render properly

### Mobile Verification (375px width)
- [ ] No horizontal scrolling
- [ ] Cards stack vertically
- [ ] Text readable without zoom
- [ ] Buttons easy to tap (44px+ height)
- [ ] Images scale appropriately
- [ ] Filter bars don't overflow

### Accessibility Verification
- [ ] Tab through every interactive element
- [ ] Verify focus ring visible at every stop
- [ ] Test with screen reader (NVDA/JAWS on Windows, VoiceOver on Mac)
- [ ] All buttons/links have accessible names
- [ ] All form inputs have associated labels
- [ ] Color contrast verified with tool (WebAIM, Stark)
- [ ] No WCAG AA violations reported

### Performance Verification
- [ ] Page load time <3s
- [ ] No layout shifts during load
- [ ] Animations smooth (60fps)
- [ ] Hover states respond instantly
- [ ] No memory leaks (dev tools)

---

## Success Criteria

**Phase 1 is complete when:**

✓ All pages use consistent card styling (rounded-lg, shadow-sm, p-5, border)
✓ All status indicators have icon + text (never color alone)
✓ All list items have consistent hover behavior (lift + shadow + border)
✓ All page headers are 28px bold with consistent layout
✓ All buttons follow sizing/variant convention
✓ All spacing uses 4px base unit multiples
✓ All colors match `design-system.md` token names
✓ All pages pass WCAG AA contrast check
✓ All interactive elements keyboard-accessible
✓ No horizontal scrolling at any breakpoint
✓ Mobile layouts tested at 375px, 768px, 1024px
✓ Before/after screenshots show cohesive improvement

---

## Measuring Impact

**After Phase 1 Complete:**
- Take screenshots of Dashboard, Jobs, Candidates, Screening, Results at 1024px
- Compare to previous screenshots
- Ask: "Does the UI feel more polished and consistent?"
- Verify: No visual regressions, all functionality preserved
- Team feedback: "The platform looks and feels more professional"

**Next Phase:**
Once consistency is locked in, Phase 2 focuses on decision UX:
- Enhanced Results page explainability
- Confidence framing and risk indicators
- "Why not selected" insights
- Decision-focused summary

---

## Quick Reference: Files to Know

- **design-system.md**: Color tokens, typography scale, spacing, shadows, border radius
- **component-library.md**: How to use Button, Card, Badge, Filter, Empty State, Scores
- **page-layouts.md**: Visual structure for Dashboard, Jobs, Candidates, Screening, Results
- **visual-redesign-guide.md**: This document—detailed page-by-page redesign specs

**Your design system is documented. Now apply it consistently.**
