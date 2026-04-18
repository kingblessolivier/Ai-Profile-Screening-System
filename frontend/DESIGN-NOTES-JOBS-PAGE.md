# Jobs Page - Gmail-like Redesign

## Design Overview

The new jobs page has been completely redesigned to work like Gmail, providing a unified interface for managing jobs and their applicants without switching screens.

## Layout

### Three-Part Interface
1. **Top Action Bar** - Quick actions for job management
2. **Left Sidebar** - Job list (Gmail inbox-like)
3. **Right Panel** - Job details + Candidates panel

```
┌─────────────────────────────────────────────────────────────────┐
│  [Add Job] [Upload] [Screen] [Edit]  [+ Jobs] [+ Filters]       │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                   │
│ Job List     │  Job Details                  │  Candidates     │
│              │                               │                  │
│ • Senior     │  Senior React Developer       │  Alice (95%)    │
│   React      │                               │  Bob (82%)       │
│   Developer  │  📍 New York, NY              │  Carol (91%)    │
│              │  💼 Engineering               │                  │
│ • Product    │  ⏰ Posted recently           │  [Upload more]  │
│   Manager    │                               │                  │
│              │  Description:                 │                  │
│ • UX/UI      │  We're looking for...         │                  │
│   Designer   │                               │                  │
└──────────────┴──────────────────────────────────────────────────┘
```

## Key Features

### 1. Modal-Based Workflow (No Page Navigation)
Instead of navigating to different pages, all actions happen in modals:
- **Add Job Modal** - Create new jobs inline
- **Upload Candidates Modal** - Add candidates with drag-drop
- **Screening Modal** - Run AI screening with progress tracking
- **Edit Job Modal** - Modify job details

### 2. Job List Sidebar (Left)
- Search jobs by title or location
- Visual job preview with:
  - Job title
  - Location
  - Experience level badge
  - Employment type badge
- Click to select and view full details
- Visual indicator (blue highlight) for selected job

### 3. Job Details + Candidates (Right)
#### Job Details Section
- Full job title and description
- Location, department, experience level
- Employment type and salary range
- Delete job button

#### Candidates Section
- Shows all applicants for the job
- Candidate cards display:
  - Name and email
  - Match percentage
  - AI screening score with progress bar
- Click candidates to view more details
- Empty state with upload prompt

### 4. Top Action Bar
Contextual buttons that appear when a job is selected:
- **Add Job** - Opens AddJobModal
- **Upload** - Opens UploadCandidatesModal
- **Screen** - Runs AI screening (ScreeningModal with progress)
- **Edit** - Opens EditJobModal

## Modals

### BaseModal Component
All modals use the `BaseModal` wrapper which provides:
- Centered modal with backdrop blur
- Header with title and close button
- Scrollable content area
- Footer with action buttons
- Responsive sizing (sm, md, lg, xl)

### AddJobModal
```
┌─────────────────────────────────┐
│ Post New Job                    │ ✕
├─────────────────────────────────┤
│                                 │
│ Job Title *                     │
│ [____________________]          │
│                                 │
│ Description *                   │
│ [_________________________]      │
│ [_________________________]      │
│                                 │
│ Location          │ Department  │
│ [__________]      │ [__________]│
│                                 │
│ Level      │ Type       │ Salary │
│ [______]   │ [______]   │[______]│
│                                 │
├─────────────────────────────────┤
│              [Cancel] [Create]  │
└─────────────────────────────────┘
```

### UploadCandidatesModal
```
┌─────────────────────────────────┐
│ Upload Candidates               │ ✕
│ Add candidates for React Dev    │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │ 📁 Drag and drop your file  ││
│  │ or click to select          ││
│  │ (CSV, Excel, JSON)          ││
│  └─────────────────────────────┘│
│                                 │
│ ℹ Supported formats:            │
│ • CSV with columns...           │
│ • Excel (.xlsx, .xls)           │
│ • JSON with candidate objects   │
│                                 │
├─────────────────────────────────┤
│              [Cancel] [Upload]  │
└─────────────────────────────────┘
```

### ScreeningModal
```
Idle State:
┌─────────────────────────────────┐
│ Run AI Screening                │ ✕
│ Screen 3 candidates             │
├─────────────────────────────────┤
│                                 │
│ ⚡ AI-Powered Analysis          │
│ Our AI will evaluate...         │
│                                 │
│ Candidates to screen: 3         │
│                                 │
├─────────────────────────────────┤
│              [Cancel] [Screen]  │
└─────────────────────────────────┘

Running State:
┌─────────────────────────────────┐
│ Run AI Screening                │ ✕
├─────────────────────────────────┤
│        Screening in progress... │
│                                 │
│        Progress: 45%            │
│        [████░░░░░░░░░]          │
│                                 │
│  Keep this window open          │
└─────────────────────────────────┘

Complete State:
┌─────────────────────────────────┐
│          ✓ Screening Complete!  │
│  3 candidates have been screened│
│  and ranked.                    │
│                                 │
│   (Auto-closes in 2 seconds)    │
└─────────────────────────────────┘
```

## Candidate Cards Format

Each candidate in the right panel shows:
```
┌─────────────────────────────┐
│ Alice Johnson          95%  │
│ alice@example.com      Match│
│                             │
│ Score: 92/100              │
│ [███████████░░░░░░░] 92%   │
└─────────────────────────────┘
```

## Color Scheme

### Experience Level Badges
- **Junior**: Green background (#ecfdf5), green text (#059669)
- **Mid-level**: Blue background (#eff6ff), blue text (#2563eb)
- **Senior**: Indigo background, indigo text
- **Lead**: Amber background, amber text

### Employment Type Badges
- **Full-time**: Green (#f0fdf4, #16a34a)
- **Part-time**: Yellow (#fefce8, #ca8a04)
- **Contract**: Purple (#fdf4ff, #a21caf)

## API Integration Points

The following functions need to be connected to your backend API:

1. `handleAddJob()` - POST /api/jobs
2. `handleUploadCandidates()` - POST /api/candidates/upload
3. `handleScreening()` - POST /api/screening/run
4. `handleEditJob()` - PUT /api/jobs/:id

Currently using mock data for candidates. Replace with actual API calls.

## Benefits of This Design

✅ **No page navigation** - Stay on jobs page, use modals for actions
✅ **Gmail-like UX** - Familiar interface for power users
✅ **Single job + candidates view** - See applicants immediately
✅ **Visual scanning** - Job list on left, details on right
✅ **Responsive** - Left sidebar collapses on mobile
✅ **Fast workflows** - Keyboard shortcuts possible (future enhancement)
✅ **No context switching** - Everything in one place

## Migration Notes

- The separate candidates page should be deprecated or repurposed
- Direct navigation to /jobs/new and /jobs/[id] routes still work but could be removed
- Consider adding keyboard shortcuts (Ctrl+N for new job, etc.)
- Can add bulk actions (select multiple jobs for bulk screening)

## Future Enhancements

1. **Keyboard shortcuts** - Cmd+N for new job, Cmd+U for upload, etc.
2. **Bulk operations** - Select multiple jobs for batch screening
3. **Filters** - Level, type, status filters in the left sidebar
4. **Drag & drop reordering** - Reorder candidates by match %
5. **Candidate details modal** - Click candidate to view full profile
6. **Real-time updates** - WebSocket for live screening progress
7. **Saved searches** - Save and name frequent filter combinations
8. **Export** - Export candidates as CSV/PDF
