# TaskFlow — Student Productivity Dashboard

> A calm, dependable student productivity dashboard built for the **GDG BPPIMT Tech Team** selection assignment. Organizes academic deadlines, GDG commitments, and personal tasks in one unified, responsive workspace.

---

## 🌟 Overview & Product Statement

**TaskFlow** gives students one calm, dependable place to capture tasks, track upcoming deadlines, organize commitments across **GDG**, **Academics**, and **Personal** categories, and visualize completion progress.

The interface prioritizes clarity and speed:
- **Fast capture:** Creating a task is intuitive and requires only the essential fields.
- **Strict data isolation:** User-created tasks and external API samples are unmistakably separate.
- **Honest states:** Comprehensive coverage for empty, filtered, loading, error, and recovery states.
- **Zero AI/ML dependencies:** Frontend-first architecture with local browser persistence.

---

## ✨ Feature List Mapped to Assignment Requirements

| Requirement Area | Implemented Features & Behaviors |
| :--- | :--- |
| **Core Task Flow (CRUD)** | • **Create:** Add tasks with Title, Category (`GDG`, `Academics`, `Personal`), Priority (`High`, `Medium`, `Low`), optional Due Date (`YYYY-MM-DD`), and Status (`Pending` default).<br>• **Custom DatePicker Popover:** Accessible inline calendar popover with month/year navigation across years, Monday-start 7-column grid, Today/Tomorrow presets, clear date action, and Escape/click-outside dismissal.<br>• **Validation:** Trims title, rejects blank/whitespace-only input, displays inline error messages.<br>• **Read:** Displays title, category, priority, localized deadline status badge, and status control on every item.<br>• **Update:** Prefilled modal editor to modify all task attributes with instant refresh across views.<br>• **Quick Status Toggle:** One-click checkbox control to toggle between `Completed` and `Pending` with visual strikethrough.<br>• **Delete:** Confirmation modal stating task title, paired with an immediate "Undo" toast.<br>• **Clear Completed:** Batch removes completed user tasks after confirmation, leaving pending tasks and API samples untouched. |
| **Checklists & Subtasks (Optional Assignment Feature)** | • **Nested Checklists:** Users can add multiple checklist subtasks beneath any user-owned parent task.<br>• **Subtask Capabilities:** Add with trimmed title validation (1-120 chars), toggle completion checkbox, inline title editing, and deletion.<br>• **Visual Progress & Collapsible List:** Task cards with subtasks feature an accessible expand/collapse toggle, clear counts (e.g. "2 of 4 complete"), and a subtle progress bar. Tasks without subtasks remain uncluttered.<br>• **Parent-Status Independence:** Completing all subtasks does not auto-complete the parent task; completing or reopening a parent task never alters or discards subtask states.<br>• **Zero Metric Leakage:** Subtasks do not inflate top-level task counts, dashboard statistics, global search, due-date alerts, or API sample counts.<br>• **Detail Panel Checklist:** Interactive checklist management is also seamlessly accessible directly inside the slide-over Task Detail Panel. |
| **Search, Filters & Sorting** | • **Global Search Bar:** Prominently defined input with high-contrast surfaces (`bg-white` in light mode, `#151515` in dark mode), visible borders, brand orange icon, keyboard shortcuts (`/`), and quick clear control.<br>• **Category Filter:** `All`, `GDG`, `Academics`, `Personal`.<br>• **Priority Filter:** `All`, `High`, `Medium`, `Low`.<br>• **Status Filter:** `All`, `Pending`, `In Progress`, `Completed`.<br>• **Deterministic Sorting:** Due date ascending/descending (null dates grouped at end), Priority (High to Low / Low to High), Creation date (Newest / Oldest), Title (A to Z).<br>• **Filter Indicators & Reset:** Active filter chip count and a one-click `Clear filters` button. |
| **Dashboard Statistics & Micro-Charts** | • **Data-Driven Visualizations (No decorative lines):**<br>&nbsp;&nbsp;1. **Total Tasks:** Real 7-day cumulative task creation volume trend sparkline with gradient fill.<br>&nbsp;&nbsp;2. **Completed:** Circular SVG progress gauge communicating exact completion rate `(completed / total) * 100` (safe at 0).<br>&nbsp;&nbsp;3. **Pending:** Segmented priority workload breakdown bars (High in Rose, Medium in Amber, Low in Slate) with interactive count tooltips.<br>&nbsp;&nbsp;4. **Mathematical Consistency:** Guarantees `Completed + Pending = Total Tasks` at all times. |
| **Deadline Intelligence & Notifications** | • **Local Calendar Dates:** Avoids UTC timezone day-shifts using local year-month-day components.<br>• **Semantic Badges:** `Overdue` (past due date & not completed), `Due today` (today's date & not completed), `Upcoming` (within 3 days), and `Completed` (completed tasks are never marked overdue).<br>• **Approaching Deadline Alerts:** Real-time toast alerts, interactive top-bar `NotificationCenter` dropdown with badge count, and optional Web Notifications API browser integration. |
| **Interactive DateStrip & Detail Panel** | • **7-Day DateStrip:** Compact date strip with today indicators, task counts per day, and quick date filtering.<br>• **Task Detail Panel:** Slide-over detail inspection showing metadata, timestamps, priority, category, and direct action triggers. |
| **DummyJSON Sample Todos API** | • Endpoint: `https://dummyjson.com/todos`<br>• Read-only reference list isolated in separate React state.<br>• Loading skeletons, error state with `Retry Loading`, and empty state.<br>• **"Add copy to My Tasks":** Clones any sample todo into an independent user-owned task with a new UUID, category `Personal`, priority `Medium`, and status `Pending`. Never mutates the source sample. |
| **Daily Advice Slip API** | • Endpoint: `https://api.adviceslip.com/advice`<br>• Non-blocking inspirational quotation attributed to "Daily advice" (no fabricated authors).<br>• Cache-busting refresh button, loading skeleton, and error resilience without blocking task workflows. |
| **Open-Meteo Weather Service** | • Keyless, public endpoints for current weather conditions and city geocoding.<br>• Contextual widget for student planning with 30-minute client caching and non-blocking failure states. |
| **Persistence & Resilience** | • Namespaced keys: `taskflow:user-tasks:v1` and `taskflow:theme:v1`.<br>• Defensive validation of every record during load; recovers valid tasks from partially corrupt data.<br>• Quota and private-browsing error handling with a dismissible storage notice banner. |
| **JSON Export & Import** | • **Export:** Downloads `taskflow-tasks-YYYY-MM-DD.json` with `{ schemaVersion: 1, exportedAt, appName, tasks }`.<br>• **Import:** File drop/picker with all-or-nothing validation, supporting schema v1 and raw task arrays.<br>• **Collision Policy:** Safely merges imported tasks into existing user tasks; duplicate IDs are assigned fresh UUIDs without data loss. |
| **UX & Accessibility** | • Light & Dark themes persisted in localStorage with system preference fallback and FOUC prevention.<br>• Responsive app shell: desktop sidebar rail + compact mobile header with collapsible navigation.<br>• Accessible dialogs (`role="dialog"`, `aria-modal="true"`, Escape key dismiss, backdrop dismissal, focus containment).<br>• Respects `prefers-reduced-motion` and keyboard tab order with visible `:focus-visible` rings. |

---

## 🛠️ Tech Stack & Prerequisites

- **Node.js:** v18.0.0 or higher (tested on Node v26.8.1)
- **Framework:** React 18 + Vite (ESM) + TypeScript
- **Styling:** Tailwind CSS + PostCSS + Autoprefixer
- **Icons:** Lucide React
- **Unit Testing:** Vitest

---

## 🚀 Local Setup & Run Commands

Clone the repository and install dependencies:

```bash
# 1. Clone repository
git clone https://github.com/narayan-nkj/Taskflow.git
cd Taskflow

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 🧪 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Vite development server with Hot Module Replacement (HMR). |
| `npm run test` | Runs the full Vitest suite (154 unit and component tests across 26 test files covering CRUD, subtasks & checklists, sidebar navigation and clipping prevention, weather services & manual city search, hooks, API resilience, storage corruption recovery, sorting, filtering, dialog focus traps, custom calendar date pickers, statistics micro-visualizations, deadline notifications, and cinematic typographic loading screen). |
| `npm run type-check` | Runs the TypeScript compiler (`tsc --noEmit`) to verify strict type safety. |
| `npm run lint` | Runs ESLint across all source and test files. |
| `npm run build` | Compiles TypeScript and creates an optimized production bundle in `dist/`. |
| `npm run preview` | Previews the production build locally. |

---

## 📁 Architecture & Directory Structure

```text
taskflow/
├── public/
│   ├── _redirects                         # SPA client-side route redirects (Netlify/Cloudflare)
│   └── taskflow.svg                       # Brand favicon vector asset
├── src/
│   ├── types/
│   │   ├── task.ts                        # UserTask, Subtask, TaskPriority, TaskCategory, TaskStatus, TaskExportPayload
│   │   ├── api.ts                         # SampleTodo, DummyJsonResponse, AdviceSlipResponse
│   │   └── notification.ts                # DeadlineNotification, AlertSeverity model definitions
│   ├── config/
│   │   └── user.ts                        # Student profile identity constants (displayName, roleSubtitle)
│   ├── utils/
│   │   ├── categoryIcons.ts               # Category-to-icon semantic mapping
│   │   ├── dates.ts                       # Local date parsing, relative formatting, deadline classification
│   │   ├── filtering.ts                   # Composable search, category, priority, status filters
│   │   ├── metricHistory.ts               # Daily metric history logging and cumulative 7-day sparkline models
│   │   ├── sorting.ts                     # Deterministic multi-tier sorting & tie-breakers
│   │   ├── statistics.ts                  # Pure calculation of Total, Completed, Pending, Completion Rate
│   │   ├── storage.ts                     # Namespaced localStorage operations & recovery
│   │   ├── subtasks.ts                    # Subtask progress calculations, validation, and ID generation
│   │   └── validation.ts                  # Input validation, strict UserTask & Subtask schema check, import validation
│   ├── services/
│   │   ├── advice.ts                      # Advice Slip API client with cache-busting refresh
│   │   ├── dummyjson.ts                   # DummyJSON todos API client with AbortController
│   │   ├── importExport.ts                # JSON export file trigger and all-or-nothing file import
│   │   └── weatherService.ts              # Open-Meteo keyless weather & geocoding client with local caching
│   ├── hooks/
│   │   ├── useAdvice.ts                   # Async hook for Daily Advice Slip
│   │   ├── useDeadlineAlerts.ts           # Real-time approaching deadline detection and browser alert sync
│   │   ├── useSampleTodos.ts              # Async hook for DummyJSON sample todos
│   │   ├── useTasks.ts                    # User task CRUD, subtask management, and storage persistence
│   │   ├── useTheme.ts                    # Theme preference management (light/dark/system) & FOUC prevention
│   │   └── useWeather.ts                  # Geolocation & weather data fetch hook with search fallback
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.tsx                  # Semantic badges for Priority, Category, Status, Deadlines
│   │   │   ├── CategoryIcon.tsx           # Category visual icon renderer
│   │   │   ├── CircularProgress.tsx       # SVG circular progress gauge ring for completion rate
│   │   │   ├── ConfirmModal.tsx           # Confirmation dialog for Delete and Clear Completed
│   │   │   ├── DatePickerPopover.tsx      # Accessible inline calendar date-picker popover
│   │   │   ├── LoadingScreen.tsx          # Cinematic typography-driven startup loading screen
│   │   │   ├── Modal.tsx                  # Accessible modal dialog with focus trap & Esc handler
│   │   │   ├── PriorityDistributionBar.tsx # Segmented workload priority distribution bars
│   │   │   ├── Sparkline.tsx              # Clean SVG volume trend sparkline with gradient fill
│   │   │   └── Toast.tsx                  # Transient polite notifications with Undo support
│   │   ├── navigation/
│   │   │   ├── MobileHeader.tsx           # Mobile top bar with collapsible navigation drawer
│   │   │   ├── NotificationCenter.tsx     # TopBar bell popover with deadline alerts and permissions
│   │   │   ├── Sidebar.tsx                # Vertical navigation rail with quick actions & theme toggle
│   │   │   └── TopBar.tsx                 # Search input, notification trigger, and profile pill
│   │   ├── dashboard/
│   │   │   ├── AdviceCard.tsx             # Daily advice card with refresh and error states
│   │   │   ├── DateStrip.tsx              # Interactive 7-day calendar strip with task counts
│   │   │   ├── StatCards.tsx              # Data-driven overview cards with sparklines & micro-gauges
│   │   │   ├── TaskChecklist.tsx          # Interactive subtasks checklist with progress bar and inline editor
│   │   │   ├── TaskDetailPanel.tsx        # Slide-over detail inspection, subtasks, and quick actions
│   │   │   ├── TaskFilters.tsx            # Search, filter dropdowns, sort options, and reset
│   │   │   ├── TaskFormModal.tsx          # Task editor modal with custom date picker & validation
│   │   │   ├── TaskItem.tsx               # Individual task card with collapsible subtasks, badges, actions
│   │   │   ├── TaskList.tsx               # Task list view (empty state, filtered empty, list)
│   │   │   └── WeatherCard.tsx            # Contextual weather forecast card with city search
│   │   ├── samples/
│   │   │   └── SampleTodosView.tsx        # DummyJSON sample tasks view with "Add copy" action
│   │   └── transfer/
│   │       └── ImportModal.tsx            # JSON import dialog with validation report
│   ├── App.tsx                            # Root application shell, state orchestration, layout
│   ├── main.tsx                           # React application entry point
│   └── index.css                          # Tailwind CSS directives, accessible focus styles, reduced-motion
├── tests/
│   ├── setup.ts                           # Global testing setup (jest-dom matchers and automatic cleanup)
│   ├── adviceCard.test.tsx                # Tests for aria-busy and polite live region screen reader announcements
│   ├── categoryIcons.test.tsx             # Tests for category icon mapping and rendering
│   ├── datePickerPopover.test.tsx         # Tests for calendar popover navigation, presets, and selection
│   ├── dateStripAndDetails.test.tsx       # Tests for DateStrip selection and TaskDetailPanel inspection
│   ├── dates.test.ts                      # Unit tests for date logic and deadline status rules
│   ├── deadlineAlerts.test.ts             # Unit tests for deadline notification rules and urgency computation
│   ├── filtering.test.ts                  # Unit tests for search, multi-filter composition, and sort separation
│   ├── importExport.test.ts               # Unit tests for ID allocation, bounded retries & collision resolution
│   ├── loadingScreen.test.tsx             # Tests for cinematic typographic loading screen, countdown, and themes
│   ├── metricHistory.test.ts              # Unit tests for 7-day metric tracking and history formatting
│   ├── mobileHeader.test.tsx              # Tests for mobile drawer expansion and aria-current tab navigation
│   ├── modal.test.tsx                     # Tests for dialog focus management, disabled skip, and focus trap
│   ├── sidebar.test.tsx                   # Tests for sidebar rail navigation, zero/1/99+ badges, and clipping prevention
│   ├── sorting.test.ts                    # Unit tests for deterministic sorting and tie-breakers
│   ├── sparkline.test.tsx                 # Tests for SVG sparkline stroke, fill, and area path rendering
│   ├── statistics.test.ts                 # Unit tests for stats and zero-task edge cases
│   ├── storage.test.ts                    # Unit tests for guarded localStorage property access & quota handling
│   ├── subtasks.test.tsx                  # Tests for subtasks CRUD, progress, parent independence, legacy migration, collision handling, and accessibility
│   ├── topBarAndNotifications.test.tsx    # Tests for TopBar search input and NotificationCenter popover
│   ├── useAdvice.test.tsx                 # Tests for advice loading, error retry, unmount abort, and stale guards
│   ├── useSampleTodos.test.tsx            # Tests for DummyJSON loading, retry, unmount abort, and stale guards
│   ├── useTasks.test.tsx                  # Tests for pure task state updaters, delete/undo, and StrictMode purity
│   ├── validation.test.ts                 # Unit tests for input boundary (120/121 chars) and import schemas
│   ├── visualizations.test.tsx            # Tests for CircularProgress ratio and PriorityDistributionBar counts
│   ├── weatherCard.test.tsx               # Tests for weather card presentation, city lookup, and non-blocking failure states
│   └── weatherService.test.ts             # Tests for weather API data mapping, code translation, and caching
├── index.html                             # HTML root with meta tags, Inter font, and FOUC prevention
├── package.json                           # Scripts, dependencies, and configuration
├── tailwind.config.js                     # Tailwind theme extension (colors, dark mode class)
└── tsconfig.json                          # Strict TypeScript configuration
```

---

## 💾 Data Model & Local Storage Architecture

### UserTask Model

```typescript
type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
type TaskPriority = 'High' | 'Medium' | 'Low';
type TaskCategory = 'GDG' | 'Academics' | 'Personal';

interface Subtask {
  id: string;            // Unique ID per parent task: crypto.randomUUID() or timestamp fallback
  title: string;         // Trimmed, non-empty, 1-120 characters
  completed: boolean;    // Independent completion state
  createdAt: string;     // ISO 8601 string
  updatedAt: string;     // ISO 8601 string
}

interface UserTask {
  id: string;            // Unique ID: crypto.randomUUID() when available, with collision-resistant timestamp/counter fallback
  title: string;         // Trimmed, non-empty, 1-120 characters
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string | null;// Calendar date in YYYY-MM-DD or null if absent
  status: TaskStatus;    // Defaults to 'Pending' for new tasks
  subtasks?: Subtask[];  // Checklist items beneath parent task; defaults to [] for legacy records
  createdAt: string;     // ISO 8601 string
  updatedAt: string;     // ISO 8601 string
}
```

### Subtasks & Checklists Design Principles
1. **Parent-Status Independence:** Completing all subtasks does not auto-complete the parent task. Reopening or completing a parent task does not discard, reset, or alter subtask completion states.
2. **Metric & Search Isolation:** Subtasks do not inflate top-level task counts, dashboard statistics, global search, due-date alerts, or API sample counts.
3. **Legacy Data Compatibility:** Stored tasks or imported files lacking the `subtasks` field seamlessly default to `subtasks: []` upon load and import, without requiring migration flags or user action.
4. **Cascade Deletion & Undo Preservation:** Deleting a parent task removes its checklist as an atomic operation; clicking "Undo" restores the parent task with its complete checklist intact.
5. **ID Deduplication:** During file import/merge, if any subtask ID collides within the parent, fresh collision-resistant IDs are allocated safely.

### Storage Keys & Versioning

- `taskflow:user-tasks:v1` — Stores the array of user-created tasks.
- `taskflow:theme:v1` — Stores `'light'`, `'dark'`, or removes the key when following system default.

### Resilience & Corruption Recovery

When reading `taskflow:user-tasks:v1`:
1. JSON is parsed defensively in a `try...catch`.
2. Each item in the array is verified using `isValidUserTask(obj)`.
3. If partial corruption is detected (e.g. manually modified storage or third-party extension error), valid tasks are recovered while corrupted records are safely skipped.
4. A dismissible **Storage Notice Banner** is displayed to the student explaining the recovery.
5. If `localStorage` access is blocked (e.g. strict private mode or quota exceeded), write errors are caught and shown politely without crashing the session.

---

## 🔒 Separation of User Tasks vs. API Sample Tasks

A fundamental architectural principle of TaskFlow is the **strict isolation of user data from remote sample records**:

1. **Storage Separation:** Sample records from DummyJSON are never saved to `taskflow:user-tasks:v1`. They reside in dedicated React state (`useSampleTodos`).
2. **Dashboard Isolation:** The 4 statistic cards (Total, Completed, Pending, Completion Rate) and the My Tasks list compute derived values **exclusively from user-owned tasks**.
3. **Destructive Safety:** Operations such as "Clear Completed" or "Delete" only affect user-owned tasks and cannot mutate or wipe remote samples.
4. **Copying Behavior:** Clicking **"Add copy to My Tasks"** generates an independent `UserTask` with:
   - A newly generated unique ID (`crypto.randomUUID()` with collision-resistant fallback)
   - Category set to `Personal`
   - Priority set to `Medium`
   - Status set to `Pending`
   - Due date set to `null`
   - Current ISO timestamp for `createdAt` and `updatedAt`

---

## 🌐 External API Integrations

### 1. DummyJSON Todos
- **Endpoint:** `https://dummyjson.com/todos`
- **Purpose:** Supplies reference sample records for demonstration.
- **Handling:** Asynchronously fetched via `fetchDummyJsonTodos` with `AbortController` cancellation on component unmount.
- **Resilience:** Includes skeleton loading cards, error banner with a working `Retry Loading` button, and an empty state if no records return.

### 2. Advice Slip
- **Endpoint:** `https://api.adviceslip.com/advice`
- **Purpose:** Supplies daily motivational inspiration.
- **Attribution:** Clearly labelled as **"Daily Advice"** (no fabricated author).
- **Handling:** Non-blocking widget; failure to fetch advice does not disable or impair any task management capabilities. Uses timestamp query parameters to prevent aggressive browser caching on manual refresh.

### 3. Open-Meteo Weather Service (Contextual Planning)
- **Endpoints:**
  - Forecast: `https://api.open-meteo.com/v1/forecast`
  - Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- **Purpose:** Supplies current weather and temperature context for student daily scheduling.
- **Security & Privacy:** 100% keyless, public API. No API keys, credentials, or private secrets required or exposed.
- **Handling:** Cached in `localStorage` for 30 minutes (`taskflow_weather_cache_v1`) to prevent redundant network traffic. Includes 9-second `AbortController` timeout guard, geolocation auto-detection with graceful permission fallback, and manual city search. Failures never block task management workflows.

---

## 🚫 Zero AI/ML Statement
In strict adherence to the assignment guidelines:
- **No AI/ML Frameworks:** TaskFlow contains zero artificial intelligence, machine learning, OpenAI/Gemini/Claude SDKs, neural network libraries, or algorithmic prediction services.
- **Deterministic Engineering:** All data processing, sorting, filtering, deadline calculations, metric histories, and form validations are performed via standard, deterministic TypeScript logic and React hooks.

---

## 📦 JSON Import & Export Specification

### Export Format

Exports a downloadable file named `taskflow-tasks-YYYY-MM-DD.json`:

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-10-27T13:30:00.000Z",
  "appName": "TaskFlow",
  "tasks": [
    {
      "id": "7f8b9c2a-1234-4567-89ab-cdef01234567",
      "title": "Prepare GDG Android Workshop Slides",
      "priority": "High",
      "category": "GDG",
      "dueDate": "2026-10-28",
      "status": "Pending",
      "subtasks": [
        {
          "id": "c8a1e2f3-0001-4444-8888-0123456789ab",
          "title": "Draft code examples for Jetpack Compose",
          "completed": true,
          "createdAt": "2026-10-27T10:15:00.000Z",
          "updatedAt": "2026-10-27T10:30:00.000Z"
        },
        {
          "id": "c8a1e2f3-0002-4444-8888-0123456789ab",
          "title": "Review Q&A handout notes",
          "completed": false,
          "createdAt": "2026-10-27T10:20:00.000Z",
          "updatedAt": "2026-10-27T10:20:00.000Z"
        }
      ],
      "createdAt": "2026-10-27T10:00:00.000Z",
      "updatedAt": "2026-10-27T10:00:00.000Z"
    }
  ]
}
```

### Import Validation & Merge Policy

1. **Formats Supported:** Accepts either the standard TaskFlow export object with `schemaVersion: 1` (`{ schemaVersion: 1, exportedAt, appName, tasks: [...] }`) or a raw JSON array of valid `UserTask` objects. Object payloads with a missing `schemaVersion` or unsupported version numbers are explicitly rejected with an informative error message.
2. **Backward-Compatible Migration:** Legacy exports and task arrays without a `subtasks` field are automatically normalized on import to `subtasks: []`.
3. **All-or-Nothing Validation:** If the file contains unparseable JSON, an unsupported or missing schema version, or any invalid task or subtask record (e.g., empty or whitespace-only title, title exceeding 120 characters, invalid priority/category/status enum, malformed date, invalid subtask timestamps), the entire import is rejected with a specific error message. **Existing tasks remain completely untouched.**
4. **Collision Resolution:** When an imported task shares an ID with an existing task or with another task inside the same imported file, TaskFlow generates a replacement unique ID using bounded retries and deterministic fallbacks. Similarly, duplicate subtask IDs within the same parent are deduplicated with fresh unique IDs so that both existing tasks and all valid imported tasks are preserved as distinct records without data loss.

---

## ♿ Accessibility & Responsive Design

- **Semantic HTML:** Structured with `<header>`, `<nav>`, `<aside>`, `<main>`, `<section>`, `<h1>`-`<h3>`, and semantic form controls.
- **Keyboard Navigation:** Fully operable via Tab, Enter, Space, and Escape keys.
- **Accessible Modals:** Includes `role="dialog"`, `aria-modal="true"`, labelled headings (`aria-labelledby`), focus trapping, and Escape key dismissal.
- **Focus Rings:** Distinct 2px indigo outline on `:focus-visible` states.
- **Color Independence:** Priority and deadline statuses are represented by both descriptive text badges and color indicators, ensuring clarity for color-blind users.
- **Reduced Motion:** All transitions and animations respect `@media (prefers-reduced-motion: reduce)`.
- **Responsive Layout:**
  - **Desktop (>= 1024px):** Fixed navigation rail + responsive dashboard grid.
  - **Tablet (768px - 1023px):** Compact spacing and adaptive card columns.
  - **Mobile (< 768px):** Sticky top bar, quick Add button, collapsible drawer navigation with `aria-current="page"`, and touch-friendly controls (`min-h-[44px]`).

---

## 🚢 Deployment Guide

> **Note on Deployment:** No live automated deployment pipeline or hosting credentials are configured. The instructions below describe manual deployment steps to static web hosts. A standard `public/_redirects` file is included in the repository to support single-page application (SPA) routing on Netlify and Cloudflare Pages.

### Manual Deployment to Netlify

1. Connect your repository in [Netlify](https://www.netlify.com/).
2. Set Build Command to `npm run build`.
3. Set Publish Directory to `dist`.
4. The included `public/_redirects` file (`/*  /index.html  200`) automatically handles client-side routing.
5. Click **"Deploy Site"**.

### Manual Deployment to Vercel

1. Push your repository to GitHub.
2. Log into [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import your `Taskflow` repository.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`
6. Output Directory: `dist`
7. Click **"Deploy"**.

### Manual Deployment to GitHub Pages

1. In `vite.config.ts`, set `base: '/Taskflow/'`.
2. Configure a GitHub Actions workflow (e.g. `.github/workflows/deploy.yml`) to run `npm run build` and publish the `dist` artifact to GitHub Pages.

---

## 📸 Application Screenshots

The repository preserves high-resolution visual captures in the [`SCREENSHOTS/`](SCREENSHOTS/) directory illustrating TaskFlow in live operation across core modes and themes:

### 1. Main Dashboard — Desktop (Light Theme)
![TaskFlow Main Dashboard — Light Theme](SCREENSHOTS/Screenshot%202026-10-27%20at%206.25.16%E2%80%AFPM.png)

*Caption: **TaskFlow Main Dashboard (Light Theme)** — Comprehensive overview featuring the black navigation capsule rail with active task counts, live statistics cards (Total Tasks volume trend sparkline, Completed circular gauge, and Pending priority workload distribution), horizontal 7-day DateStrip with date filtering, user-owned task cards with category & deadline urgency badges, slide-over Task Workspace detail inspection, real-time Open-Meteo weather context, and daily motivation inspiration from the Advice Slip API.*

---

### 2. External API Integration — DummyJSON Sample Todos View
![TaskFlow DummyJSON Sample Todos Integration](SCREENSHOTS/Screenshot%202026-10-27%20at%206.25.29%E2%80%AFPM.png)

*Caption: **DummyJSON Sample Todos API View** — Demonstrates strict architectural data isolation between remote reference todos fetched live from `https://dummyjson.com/todos` and local user tasks. Provides single-click **"Add copy to My Tasks"** action to safely duplicate sample todos into independent, user-owned personal tasks with fresh UUIDs.*

---

### 3. Main Dashboard — Desktop (Dark Theme)
![TaskFlow Main Dashboard — Dark Theme](SCREENSHOTS/Screenshot%202026-10-27%20at%206.25.45%E2%80%AFPM.png)

*Caption: **TaskFlow Main Dashboard (Dark Theme)** — Contrast-compliant dark mode utilizing `#050505` and `#111111` surfaces, vibrant brand orange highlights, WCAG-tested typography, and full feature parity across task cards, detail inspection, live weather conditions, and micro-visualizations.*

---

## 📄 License & Attribution

- Built as a submission for the **GDG BPPIMT Tech Team** selection assignment.
- External endpoints: [DummyJSON](https://dummyjson.com/), [Advice Slip API](https://api.adviceslip.com/), and [Open-Meteo](https://open-meteo.com/).
