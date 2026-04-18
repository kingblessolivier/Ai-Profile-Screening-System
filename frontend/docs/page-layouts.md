# Page Layouts & Visual Architecture

Detailed visual specifications for each page in the candidate screening system. These layouts define the information hierarchy, component composition, and spacing patterns.

---

## Dashboard Page

### Purpose
Mission control for recruiting activity. Answer instantly: Where are my jobs? How many candidates? What screened? What action now?

### Visual Structure

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Dashboard               [Today is Friday, Apr 18]       │
│  Hiring overview and task priorities                     │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┐
│  4 Active Jobs   │  87 Candidates   │  2 In Screening  │
│  [Stat cards]    │  [Stat cards]    │  [Stat cards]    │
│  Avg Match: 74%  │  New This Week: 12│ Avg: 3.5h to run│
└──────────────────┴──────────────────┴──────────────────┘

┌──────────────────────────────────────────────────────────┐
│  TODAY'S PRIORITIES                                      │
│                                                          │
│  ☐ 1. Senior React Dev – Only 4 candidates, add more    │
│      [Upload More] [View Screening]                      │
│                                                          │
│  ☐ 2. Full Stack – Ready to screen pool of 23           │
│      [Run Screening] [View Job Details]                  │
│                                                          │
│  ☐ 3. Product Manager – Screening in progress (Est 12m) │
│      [View Progress] [Pause]                             │
│                                                          │
│  [+ Add Custom Priority]                                 │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  RECENT JOBS (Sort: Updated, Filter: All, Status)       │
│  [Senior React Dev | Tech] [Full Stack | Tech] [PM | Biz]│
│  [View All] →                                            │
└──────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────────────────────────┐
│  ACTIVITY FEED   │  QUICK STATS                         │
│                  │  • 12 new candidates this week       │
│  [Recent actions │  • 3 screenings completed           │
│   and events]    │  • 87% avg match in last screening   │
│                  │  • Top source: LinkedIn (64%)        │
└──────────────────┴──────────────────────────────────────┘
```

### Component Breakdown

**Header Section**
- Page title (28px, bold)
- Date/greeting on right (secondary text)
- Spacing: 24px from top, 24px below title

**Stat Cards Grid** (3 columns)
- Each: Large number + label + sub-stat
- Shadow-sm, hover lift
- 16px gap between cards
- Responsive: 2 columns on tablet, 1 on mobile

**Today's Priorities Section**
- Card-based layout, accent left border on priority items
- Numbered list with context + recommended actions
- 12px spacing between items

**Recent Jobs Row**
- Show 3 most recent, carousel-style
- Each job as card preview
- [View All] link on right

**Activity Feed** (optional, 2-column on desktop)
- Left: Timestamped events
- Right: Quick statistics boxes

### Visual Hierarchy
1. Stat cards (immediate overview)
2. Today's priorities (action-oriented)
3. Recent jobs (context)
4. Activity (background info)

### Spacing Pattern
- Top padding: 24px
- Between major sections: 24px (space-y-6)
- Between cards: 16px
- Card internal: 20px (p-5)

---

## Jobs List Page

### Purpose
View all jobs at a glance. Create new jobs. See readiness status. Filter and compare.

### Visual Structure

```
┌──────────────────────────────────────────────────────────┐
│  Jobs                    [Search Jobs...] [+ New Job]   │
│  Manage your job openings and screening workflows         │
│                                                          │
│  [All Jobs ▼] [Status ▼] [Type ▼] [Level ▼] [× Clear]   │
│  Showing 12 jobs • Sort: [Updated ▼]                     │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  SENIOR REACT DEVELOPER          [Ready for Screening]   │
│  Tech · Full-time · Senior · San Francisco               │
│                                                          │
│  Candidates: 12 | Screened: 8 | Top: 85% | Open: 3 days │
│                                                          │
│  [View Details] [Run Screening] [Export Shortlist] [⋯]   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  FULL STACK ENGINEER            [Needs More Candidates]  │
│  Tech · Full-time · Mid-level · Remote                   │
│                                                          │
│  Candidates: 4 | Screened: – | Top: – | Open: 7 days    │
│                                                          │
│  [Upload More] [View Details] [Set Preferences] [⋯]      │
└──────────────────────────────────────────────────────────┘

[More job cards...]

┌──────────────────────────────────────────────────────────┐
│ Showing 1–12 of 12 jobs  [< Previous] [Next >]           │
└──────────────────────────────────────────────────────────┘
```

### Component Breakdown

**Header**
- Page title (28px) + subtitle
- Search box + [+ New Job] button (right side)
- Filter bar below with [All Jobs], [Status], [Type], [Level], [Clear]

**Job Cards** (List, full-width)
- Title (18px, bold) + status badge on right
- Department · Type · Level · Location (secondary text)
- Metrics row: Candidates, Screened, Top score, Days open
- Action buttons: View, Run Screening, Export, More (⋯)
- Hover: Lift + accent left border
- Shadow-sm, rounded-lg, p-5

**Pagination** (if >12 jobs)
- Centered bottom, "Showing X–Y of Z jobs"
- Previous/Next buttons, or page numbers

### Status Badges (Color + Icon + Text)
- ✓ Ready for Screening (green)
- ⚠ Needs More Candidates (amber)
- ▶ Screening in Progress (blue)
- ✓ Screening Complete (green)
- ⏸ Paused (gray)

### Spacing Pattern
- Header section: 24px padding, 24px below to filter
- Filter to first card: 16px
- Between cards: 12px
- Card padding: 20px (p-5)
- Action button gap: 8px

### Responsive Behavior
- Desktop: Full card width, metrics horizontal
- Tablet: Same, but search stacks below title
- Mobile: Cards stack, metrics vertical, buttons wrap

---

## Candidates List Page

### Purpose
View candidate pool. Filter by quality, source, level. See which are screened. Add/import candidates.

### Visual Structure

```
┌──────────────────────────────────────────────────────────┐
│  Candidates              [Import CSV] [+ Add Candidate]   │
│  Manage your candidate pool – 87 total, 23 new this week  │
│                                                          │
│  [Job: All ▼] [Level ▼] [Quality ▼] [Source ▼] [× Clear] │
│  [Search by name, email...] Showing: 87 | Sort: [Recent] │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Avatar  Jane Smith              [Senior] [✓ Strong Lead]  │
│         Senior Engineer · Acme Inc · SF, CA              │
│         jane@example.com · +1-555-1234                  │
│         Skills: Python, React, AWS, DevOps              │
│         Source: [LinkedIn] Profile Quality: 95%          │
│         In Screenings: 3 | Last: React Dev (9/10)       │
│                                                          │
│         [View Profile] [View Screenings] [Export] [⋯]    │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Avatar  Alex Johnson            [Mid-level] [⚠ At Risk]   │
│         Software Engineer · TechCorp · NYC               │
│         alex@example.com                                 │
│         Skills: [Incomplete Profile – 40% complete]     │
│         Source: [Referral] Profile Quality: 40%         │
│         In Screenings: 1 | Last: Full Stack (6/10)      │
│                                                          │
│         [Complete Profile] [View Screenings] [⋯]         │
└──────────────────────────────────────────────────────────┘

[More candidates...]
```

### Component Breakdown

**Header**
- Page title + subtitle with count
- Import + Add buttons (right)
- Filter bar: Job, Level, Quality, Source, Clear

**Candidate Cards** (List format)
- Avatar (left) + Name/Title/Company/Location
- Contact info (secondary color, small)
- Skills list (inline, pill badges)
- Source badge (LinkedIn, PDF, CSV, Referral, etc.)
- Profile quality % + quality flag (Strong Lead, At Risk, Incomplete)
- Screening history (count, last job result)
- Actions: View Profile, View Screenings, Export, More

**Quality Flags**
- ✓ Strong Lead (green, 85%+)
- ✓ Profile Complete (green, >90%)
- ⚠ Incomplete Profile (orange, <60%)
- ⚠ At Risk (orange, likely mismatch)
- ✗ Duplicate (red, likely same person)

**Source Badges**
- Colors/icons: LinkedIn (blue), PDF (red), CSV (purple), Referral (green), Manual (gray)

### Spacing Pattern
- Card padding: 20px (p-5)
- Between cards: 12px gap
- Within card: Skills/source/screening info: 8px gap
- Actions button row: gap-2

### Mobile Responsive
- Stacked layout: Avatar above, info below
- Skills wrap to multiple lines
- Buttons become icon-only or split menu

---

## Job Detail Page

### Purpose
Deep view of single job. See candidate pool health. Manage preferences. Run/view screening.

### Visual Structure

```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Jobs                                           │
│                                                          │
│  SENIOR REACT DEVELOPER                  [Edit] [⋯]      │
│  Tech · Full-time · Senior · San Francisco               │
│                                                          │
│  Status: [Ready for Screening]  Open: 12 days  Created: 5d │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────┬──────────────────────────────────────────┐
│ JOB OVERVIEW │ CANDIDATE POOL HEALTH                   │
│              │                                         │
│ Description  │ ╔════════════════════╗                 │
│ [Full text]  │ ║  Pool Score: 78%   ║                 │
│              │ ║  Good diversity    ║                 │
│ Prefer…      │ ╚════════════════════╝                 │
│ • Python     │                                         │
│ • React      │ Candidates: 12                         │
│ • 5+ exp     │ ├─ Senior: 4 (33%)                    │
│              │ ├─ Mid: 6 (50%)                       │
│ Compensa…    │ ├─ Junior: 2 (17%)                    │
│ $150–180k    │ └─ Screened: 8                         │
│              │                                         │
│              │ Missing: Frontend specialist, DevOps  │
│              │ [Upload More] [Refine Preferences]     │
└──────────────┴──────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ SCREENING WORKFLOW                                       │
│                                                          │
│ Step 1: [✓] Match Preferences                           │
│ Step 2: [✓] Rank by Fit                                 │
│ Step 3: [→] Human Review                                │
│ Step 4: [○] Export Shortlist                            │
│                                                          │
│ Last screened: 3 days ago (8 candidates, 82% top score) │
│                                                          │
│ [Run Screening Again] [View Results] [Export Shortlist] │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ CANDIDATE POOL (View all 12)                             │
│                                                          │
│ [Quick compare: 2–3 candidates]  [View in detail]        │
│                                                          │
│ [Cards for each candidate with match score]              │
└──────────────────────────────────────────────────────────┘
```

### Component Breakdown

**Header Section**
- Breadcrumb: "← Back to Jobs"
- Job title (28px, bold) + badges (type, level, location)
- Status badge + metadata (open days, created date)
- Edit/More buttons

**Two-Column Layout**
- Left (40%): Job overview, preferences, compensation
- Right (60%): Candidate pool health metrics, workflow status, actions

**Pool Health Card** (Emphasized)
- Large pool score (78%)
- Level distribution (bar chart or breakdown)
- Missing skills/attributes
- Call to action: [Upload More], [Refine Preferences]

**Screening Workflow**
- Step indicator: Linear flow (4 steps)
- Current step highlighted
- Last run info
- Action buttons

### Spacing Pattern
- Header: 24px padding + 24px below
- Two-column gap: 16px
- Card padding: 20px
- Section gaps: 16px

---

## Screening Detail Page

### Purpose
Run AI screening and view candidates scored and ranked.

### Visual Structure

```
┌──────────────────────────────────────────────────────────┐
│ Job: Senior React Dev · Pool: 12 candidates              │
│                                                          │
│  SCREENING TERMINAL                                      │
│  AI is matching candidates to your preferences...        │
│  Est. completion: 2–3 minutes | Cancel                   │
│                                                          │
│  [████████░░] 64% complete (8 of 12 scored)              │
│                                                          │
│  Currently processing: Jane Smith                        │
│  Evaluating: Python, React, AWS, Team leadership        │
│                                                          │
└──────────────────────────────────────────────────────────┘

[After completion:]

┌──────────────────────────────────────────────────────────┐
│ SCREENING COMPLETE                                       │
│ 12 candidates scored · Avg match: 74% · Top: 92%        │
│                                                          │
│ [Confidence: High] [Run Again] [Export Results] [Back]   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ RANKED RESULTS                                           │
│                                                          │
│ ★★★★★ 92%  Jane Smith           [View] [Export]         │
│         Python • React • AWS • 8y exp                   │
│         ✓ Exceeds all preferences                       │
│                                                          │
│ ★★★★☆ 87%  Alex Johnson         [View] [Export]         │
│         Python • React • 6y exp                         │
│         • Missing: DevOps, AWS                          │
│                                                          │
│ ★★★★☆ 82%  Taylor Chen          [View] [Export]         │
│         React • Vue • 5y exp                            │
│         • Missing: Python, AWS • New to leadership      │
│                                                          │
│ ★★★☆☆ 71%  Morgan Lee           [View] [Export]         │
│         Full Stack • 4y exp • Junior mid-level          │
│         • Limited experience in preferences             │
│                                                          │
│ [Load More Results] [Export All] [Save Shortlist]       │
└──────────────────────────────────────────────────────────┘
```

### Component Breakdown

**Terminal State** (During screening)
- Job context header (small, gray)
- Title "SCREENING TERMINAL"
- Status message in plain English
- Progress bar: animated fill
- Current candidate name + attributes being evaluated
- Est. time + Cancel button

**Complete State** (After screening)
- "SCREENING COMPLETE" header with summary stats
- Confidence level indicator
- Quick actions: Run Again, Export, Back

**Results Section**
- Ranked list of candidates
- Each item shows: Star rating + % match + name + skills + reasoning
- Hover: Lift, accent left border
- Actions: View (detail), Export (single)
- Bottom: Load more, Export all, Save shortlist

### Visual Indicators
- Star rating (filled/hollow stars, color by match %)
- Confidence bands: Green (>80%), Yellow (60–80%), Red (<60%)
- Status messages: Plain language, no jargon

### Spacing Pattern
- Terminal/header: 24px padding
- Progress bar: 12px height
- Results list: 12px between items
- Star + name + skills: 8px gaps

---

## Results Page

### Purpose
Inspect screening results with confidence scores and evidence. Make hiring decisions.

### Visual Structure

```
┌──────────────────────────────────────────────────────────┐
│ Job: Senior React Dev · Screening: April 18, 2:15 PM    │
│ Model: GPT-4 Turbo · Confidence: High (94%)              │
│                                                          │
│  DECISION-READY SUMMARY                                  │
│  Recommended: 3 candidates to interview                  │
│  [Export Results] [Save to Job] [⋯]                      │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ TOP 3 RECOMMENDATIONS                                    │
│                                                          │
│ ╔════════════════════════════════════════════════════════╗
│ ║ 1. JANE SMITH                      92% Match ★★★★★   ║
│ ║    Senior Engineer · 8y exp · Acme Inc               ║
│ ║                                                      ║
│ ║    WHY RANKED HIGH:                                 ║
│ ║    ✓ Exceeds Python requirement (10y vs 5y min)   ║
│ ║    ✓ React expert (lead dev experience)            ║
│ ║    ✓ AWS certified                                 ║
│ ║    ✓ Team leadership demonstrated                 ║
│ ║    ✓ Recent role: TechCorp, similar role          ║
│ ║                                                      ║
│ ║    CONFIDENCE: 96% (High)                           ║
│ ║    Risk notes: None identified                      ║
│ ║                                                      ║
│ ║    INTERVIEW QUESTION STARTERS:                     ║
│ ║    1. "Tell us about your largest React project"   ║
│ ║    2. "How do you approach mentoring junior devs?" ║
│ ║    3. "What's your AWS infrastructure experience?" ║
│ ║                                                      ║
│ ║    [View Full Profile] [Export Card] [Add to Board] ║
│ ╚════════════════════════════════════════════════════════╝
│
│ ╔════════════════════════════════════════════════════════╗
│ ║ 2. ALEX JOHNSON                    87% Match ★★★★☆   ║
│ ║    Software Engineer · 6y exp · TechCorp             ║
│ ║    [Same structure as above]                         ║
│ ╚════════════════════════════════════════════════════════╝
│
│ ╔════════════════════════════════════════════════════════╗
│ ║ 3. TAYLOR CHEN                     82% Match ★★★★☆   ║
│ ║    Frontend Developer · 5y exp · StartupXYZ          ║
│ ║    [Same structure as above]                         ║
│ ╚════════════════════════════════════════════════════════╝
│
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ OTHER CANDIDATES (View all 12)                           │
│                                                          │
│ 71% – Morgan Lee  [Likely mismatch, missing 3 skills]   │
│ 68% – Casey Park  [New to field, consider as backup]    │
│ [Show all 12]                                            │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ SCREENING TRANSPARENCY                                   │
│                                                          │
│ Model: GPT-4 Turbo v2.4                                 │
│ Run date: April 18, 2026, 2:15 PM UTC                   │
│ Confidence: 94% (High)                                  │
│ Data version: v3.2 (Updated: April 1, 2026)           │
│ Status: [Export Report] [Audit Log] [FAQ]               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Component Breakdown

**Header**
- Job + screening metadata (date, model name, confidence)
- "DECISION-READY SUMMARY" title
- Recommendation count + export button

**Top 3 Cards** (Emphasized)
- Rank + name + position + years exp + company
- Match % + star rating
- "WHY RANKED HIGH" section: Bulleted reasons aligned to job preferences
- Confidence % + risk notes
- Interview question starters (3–4 questions based on profile)
- Actions: View Full Profile, Export Card, Add to Board

**Other Candidates Section** (Collapsible)
- Collapsed by default, shows count
- Click to expand: Smaller cards with brief reason for ranking
- Reasons: "Likely mismatch, missing X skills", "Strong backup", "Below threshold"

**Screening Transparency Footer**
- Model name + version
- Run date/time
- Confidence band
- Data version
- Links: Export Report, Audit Log, FAQ

### Visual Hierarchy
1. Top 3 (emphasized, large cards, detailed reasoning)
2. Other candidates (secondary, brief info)
3. Transparency info (footer, subtle)

### Spacing Pattern
- Header: 24px
- Between top-3 cards: 16px
- Card padding: 24px (p-6)
- Within card sections: 12px gaps
- Footer: 24px top margin

---

## Navigation & Global Header

### Header Pattern

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│ [Logo] Dashboard  Jobs  Candidates  Screening  Results  │
│                                                          │
│         [Active Job: Senior React Dev ↓] [User ↓]       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Components**:
- Left: Logo + navigation links
- Center: Job context chip (if job selected) with dropdown
- Right: User profile menu

**Active Job Context Chip**
- Shows selected job title (if any)
- Dropdown to switch jobs or clear selection
- Subtle background, rounded-md, 8px padding
- Hover: Slightly darker background

### Sidebar (Optional, on desktop)

```
┌─────────────┐
│ Logo        │
│             │
│ Dashboard   │
│ Jobs        │
│ Candidates  │
│ Screening   │
│ Results     │
│             │
│ Help        │
│ Settings    │
│ Logout      │
└─────────────┘
```

---

## Mobile Responsive Strategy

### Breakpoints & Adjustments

**Mobile (< 640px)**
- Single column layouts
- Cards stack vertically
- Filter bars wrap or collapse into drawer
- Action buttons: Icons with tooltips or bottom sheet
- Navigation: Hamburger menu with drawer
- Reduced font sizes: -2px for body text

**Tablet (640px – 1024px)**
- Two-column layouts where applicable
- Cards remain horizontal but may be tighter
- Filter bars horizontal but wrapped
- Navigation: Sidebar optional, hidden by default

**Desktop (> 1024px)**
- Multi-column layouts
- Full sidebars/filtering visible
- All actions visible as buttons
- Optimal spacing applied

### Mobile-Specific Patterns

**List Item Collapse**
- Tap to expand detail inline or in modal
- No horizontal scrolling

**Filter Drawer**
- Swipe from left or tap [Filters]
- Sticky header, scrollable content
- [Apply] [Reset] buttons at bottom

**Bottom Action Sheet**
- For secondary actions (⋯ menu)
- Swipe down to dismiss

---

## Dark Mode Considerations

While primary design is light mode, support dark mode with:
- `--dark-bg`: Gradient background
- `--dark-border`: Semi-transparent blue
- `--dark-text`: Light blue text
- Shadows reduced in dark mode
- All contrast ratios maintained

---

## Summary: Visual Design Principles

1. **Clear hierarchy**: Size, weight, color establish priority
2. **Generous spacing**: Breathe room between sections
3. **Consistent patterns**: Repeat layouts across pages
4. **Status + semantics**: Never color alone; always icon + text
5. **Action-oriented**: Primary CTA is always visible
6. **Trust through transparency**: Show reasoning, confidence, data source
7. **Mobile-first responsive**: Optimize for smallest first
8. **Accessibility**: WCAG AA, keyboard nav, reduced motion

---

## Implementation Checklist

- [ ] Verify all page headers follow PageHeader pattern
- [ ] Confirm stat cards use consistent styling
- [ ] Check badge usage: Status always icon + text
- [ ] Ensure filter bars consistent across all list pages
- [ ] Test list item patterns for hover/active states
- [ ] Verify buttons follow hierarchy (Primary, Outline, Ghost)
- [ ] Check spacing: 4px base unit, logical multiples
- [ ] Test mobile breakpoints: 375px, 768px, 1024px
- [ ] Verify WCAG AA contrast on all text
- [ ] Test keyboard navigation on all interactive elements
