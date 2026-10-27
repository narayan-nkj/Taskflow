# TaskFlow

TaskFlow is a student productivity and task dashboard built with React, JavaScript, and Vite to organize academic deadlines, GDG commitments, and personal tasks in a single responsive workspace.

**Live Demo:** [https://taskflow-nkj.vercel.app/](https://taskflow-nkj.vercel.app/)

---

## Screenshots

Authentic application captures preserved from live sessions in [`SCREENSHOTS/`](SCREENSHOTS/):

### 1. Main Dashboard — Desktop (Light Theme)
![TaskFlow Main Dashboard — Light Theme](SCREENSHOTS/Screenshot%202026-10-27%20at%206.25.16%E2%80%AFPM.png)

*Caption: Main dashboard in light theme showing task overview cards, 7-day DateStrip, filtered task list, and task detail inspector.*

### 2. External API Integration — DummyJSON Sample Todos
![TaskFlow DummyJSON Sample Todos Integration](SCREENSHOTS/Screenshot%202026-10-27%20at%206.25.29%E2%80%AFPM.png)

*Caption: DummyJSON sample todos view demonstrating isolation between remote reference items and user-owned tasks, with single-click copying.*

### 3. Main Dashboard — Desktop (Dark Theme)
![TaskFlow Main Dashboard — Dark Theme](SCREENSHOTS/Screenshot%202026-10-27%20at%206.25.45%E2%80%AFPM.png)

*Caption: Main dashboard in dark theme with high-contrast surfaces, category and priority badges, and weather widget.*

---

## Features

### Core Assignment Requirements

- **Task Creation:** Add tasks with a Title (1–120 characters, whitespace-trimmed), Priority (`High`, `Medium`, `Low`), Category (`GDG`, `Academics`, `Personal`), optional Due Date (`YYYY-MM-DD`), and Status (`Pending`, `In Progress`, `Completed`).
- **Dynamic Task Display:** Tasks are displayed with title, category icon and label, priority badge, localized deadline status badge, and status controls.
- **Task Management Operations:**
  - Prefilled edit modal to modify all task attributes.
  - One-click status toggle between `Completed` and `Pending` with visual strikethrough.
  - Single task deletion with explicit confirmation modal and immediate "Undo" toast.
  - Batch "Clear Completed" modal to remove finished user tasks while leaving incomplete tasks and remote samples untouched.
- **Search, Filtering & Sorting:**
  - Case-insensitive search across task titles.
  - Category filter: `All`, `GDG`, `Academics`, `Personal`.
  - Priority filter: `All`, `High`, `Medium`, `Low`.
  - Status filter: `All`, `Pending`, `In Progress`, `Completed`.
  - Favorites filter toggle with dedicated zero-state.
  - Deterministic sorting by due date (earliest/latest, null dates grouped at end), priority (high-to-low / low-to-high), creation date (newest/oldest), or title (A–Z).
- **Persistence & Isolation:**
  - User-owned tasks and updates persist across browser refreshes via `localStorage` (`taskflow:user-tasks:v1`).
  - Remote sample data is kept strictly in separate React state and never overwrites user records.
- **Asynchronous REST API Integrations:**
  - **DummyJSON Todos:** Fetches sample items with skeleton loading cards, error banner with a retry button, empty state, and non-mutating "Add copy to My Tasks".
  - **Daily Advice Slip:** Fetches motivational advice with refresh action, loading skeleton, and graceful failure that never blocks task operations.
- **Responsive UI & Clear States:**
  - Responsive app shell adapting between a desktop navigation rail and a mobile drawer header.
  - Open-canvas layout with dedicated empty states for zero tasks, no filter results, and no favorites.
- **Zero AI/ML Dependencies:**
  - Pure deterministic JavaScript logic and React state. No AI/ML libraries, APIs, or prediction frameworks.

### Implemented Optional & User-Requested Features

- **Favorite Tasks:** Star toggle buttons on cards and inside the detail panel with dynamic accessible names (`Add "[title]" to favorites` / `Remove "[title]" from favorites`) and `aria-pressed` states. Accessible in both light and dark themes without relying on color alone, fully persisted, and preserved through JSON export/import.
- **Checklists & Subtasks:** Add, inline-edit, toggle, and delete nested subtasks per parent task. Visual progress indicator and collapsible checklist. Subtask completion is independent of parent task status and does not inflate top-level statistics or search counts.
- **Dashboard Statistics & Micro-Charts:**
  - Total Tasks sparkline derived strictly from recorded daily snapshot counts (displays neutral baseline when fewer than 2 snapshots exist).
  - Completed tasks circular SVG progress gauge calculating completion percentage.
  - Pending priority workload bars (High in Rose, Medium in Amber, Low in Slate) strictly counting tasks with `status === 'Pending'`.
  - Mathematical consistency: `Completed + Pending + In Progress = Total Tasks` at all times.
- **Deadline Intelligence & Alerts:**
  - Local calendar date parsing to prevent UTC day shifts.
  - Semantic badges: `Overdue` (past due and not completed), `Due today`, `Upcoming` (within 3 days), and `Completed`.
  - In-app toast alerts with deduplication keys (`${id}:${dueDate}:${urgency}`) and coalesced multi-alert summaries.
  - TopBar `NotificationCenter` popover with unread badge count and direct task selection.
  - Optional user-permissioned desktop Web Notifications (active while browser tab is open; never prompts on initial page load).
- **Date Navigation & Custom DatePicker:**
  - 7-day DateStrip with active task counts per day and single-day filtering.
  - Accessible custom calendar DatePicker popover with month/year navigation, Monday-start 7-column grid, Today/Tomorrow presets, and clear button.
- **Open-Meteo Weather Widget:**
  - Keyless weather conditions and temperature widget for student daily planning.
  - 30-minute client caching in `localStorage`.
  - User-initiated location consent ("Use My Location") with graceful permission fallback, plus instant debounced city search.
- **JSON Import & Export:**
  - Export user tasks to `taskflow-tasks-YYYY-MM-DD.json`.
  - Import modal supporting `schemaVersion: 1` payloads and raw task arrays.
  - All-or-nothing validation preventing corrupted imports, with collision-resistant ID reassignment when imported IDs match existing tasks.
- **Theme Preferences:**
  - High-contrast Light and Dark modes with smooth transitions.
  - Stored in `taskflow:theme:v1` with system OS preference fallback and FOUC prevention.

---

## Technology Stack

- **Framework & Build:** React 18, Vite 8, JavaScript (ES2020+)
- **Styling:** Tailwind CSS 3.4, PostCSS, Autoprefixer
- **Icons:** Lucide React
- **Test Framework:** Vitest 5, `@testing-library/react`, `@testing-library/jest-dom`, JSDOM

---

## External APIs

| API | Endpoint | Purpose | Failure / Loading Handling |
| :--- | :--- | :--- | :--- |
| **DummyJSON** | `https://dummyjson.com/todos` | Provides sample reference todos | `AbortController` cancellation on unmount; skeleton cards during fetch; error banner with `Retry Loading` button; empty state if array is empty; isolated from user storage. |
| **Advice Slip** | `https://api.adviceslip.com/advice` | Provides daily student motivation | Non-blocking; cache-busting timestamp on manual refresh; loading skeleton; silent fallback error state that leaves task management intact. |
| **Open-Meteo** | `https://api.open-meteo.com/v1/forecast`<br>`https://geocoding-api.open-meteo.com/v1/search` | Contextual weather & geocoding | 100% keyless public API; 30-minute client cache (`taskflow_weather_cache_v1`); 9-second fetch timeout; user-consented location lookup with fallback to manual search; non-blocking failures. |

---

## Local Setup

### Prerequisites

- Node.js v18.0.0 or higher
- npm (uses `package-lock.json` for deterministic installs)

### Installation & Execution

```bash
# 1. Clone repository
git clone https://github.com/narayan-nkj/Taskflow.git
cd Taskflow

# 2. Install dependencies cleanly from lockfile
npm ci

# 3. Start development server
npm run dev
```

The application will run locally at `http://localhost:5173/`.

---

## Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts Vite dev server with Hot Module Replacement (HMR). |
| **Lint** | `npm run lint` | Runs ESLint across all JavaScript, JSX, and test files. |
| **Test Suite** | `npm test` | Runs the full Vitest suite (183 tests across 27 files). |
| **Build** | `npm run build` | Bundles assets with Vite into `dist/`. |
| **Preview** | `npm run preview` | Spins up a local web server to preview the production build. |

---

## Project Structure

```text
Taskflow/
├── public/
│   ├── _redirects                         # Client-side SPA routing rule for hosting providers
│   └── taskflow.svg                       # Brand favicon asset
├── SCREENSHOTS/                           # Authentic application screenshots referenced above
│   ├── Screenshot 2026-10-27 at 6.25.16 PM.png
│   ├── Screenshot 2026-10-27 at 6.25.29 PM.png
│   └── Screenshot 2026-10-27 at 6.25.45 PM.png
├── src/
│   ├── config/
│   │   └── user.js                        # Student profile identity constants
│   ├── types/
│   │   ├── api.js                         # DummyJSON and Advice Slip response schemas (JSDoc)
│   │   ├── notification.js                # In-app and desktop alert types (JSDoc)
│   │   └── task.js                        # UserTask, Subtask, enums, and export payload types (JSDoc)
│   ├── utils/
│   │   ├── categoryIcons.js               # Category-to-icon semantic mapping
│   │   ├── dates.js                       # Local calendar date parsing & deadline classification
│   │   ├── filtering.js                   # Composable search, category, priority, status, favorites filters
│   │   ├── metricHistory.js               # Daily snapshot volume logging for sparklines
│   │   ├── sorting.js                     # Deterministic multi-tier sorting
│   │   ├── statistics.js                  # Pure calculation of Total, Completed, Pending, Completion Rate
│   │   ├── storage.js                     # Namespaced localStorage operations & recovery
│   │   ├── subtasks.js                    # Subtask title validation and ID generation
│   │   └── validation.js                  # Schema guards for UserTask, Subtask, and JSON imports
│   ├── services/
│   │   ├── advice.js                      # Advice Slip API client
│   │   ├── dummyjson.js                   # DummyJSON API client with AbortController
│   │   ├── importExport.js                # JSON file export trigger and merge parser
│   │   └── weatherService.js              # Open-Meteo weather and geocoding client with cache
│   ├── hooks/
│   │   ├── useAdvice.js                   # Daily advice query hook
│   │   ├── useDeadlineAlerts.js           # Proactive deadline alerts, deduplication & notifications
│   │   ├── useSampleTodos.js              # DummyJSON query hook
│   │   ├── useTasks.js                    # Core user task CRUD, subtasks, favorites & persistence
│   │   ├── useTheme.js                    # Light/dark theme preference hook
│   │   └── useWeather.js                  # Weather fetching, geolocation consent & city search hook
│   ├── components/
│   │   ├── common/                        # Reusable UI primitives (Badge, Modal, Toast, DatePickerPopover, etc.)
│   │   ├── navigation/                    # Sidebar, MobileHeader, TopBar, NotificationCenter
│   │   ├── dashboard/                     # StatCards, DateStrip, TaskFilters, TaskList, TaskItem, TaskDetailPanel, WeatherCard
│   │   ├── samples/                       # SampleTodosView for DummyJSON items
│   │   └── transfer/                      # ImportModal for JSON file restore
│   ├── App.jsx                            # Root application component and state orchestration
│   ├── main.jsx                           # React entry point
│   └── index.css                          # Tailwind CSS imports and accessible focus styles
├── tests/                                 # 27 Vitest test files covering all hooks, components, and utilities
├── eslint.config.js                       # ESLint configuration for JavaScript and JSX
├── index.html                             # HTML entry with font preconnect and FOUC prevention
├── package.json                           # Dependencies and scripts
├── tailwind.config.js                     # Tailwind configuration and color tokens
└── vite.config.js                         # Vite build configuration
```

---

## Data, Privacy & Storage

### Local Storage Usage

TaskFlow stores data locally on the user's device using namespaced keys:

- `taskflow:user-tasks:v1` — Persists the array of user-created tasks and checklists.
- `taskflow:theme:v1` — Persists theme choice (`'light'` or `'dark'`).
- `taskflow:metric-history:v1` — Stores daily metric snapshot history for the sparkline.
- `taskflow_weather_cache_v1` — Caches weather forecast data for 30 minutes to minimize network calls.
- `taskflow_seen_alerts_v1` — Tracks seen/dismissed deadline alerts to prevent duplicate notifications.

### Defensive Storage Recovery

- Stored JSON is parsed safely within `try...catch` blocks.
- Each task record is individually validated against `isValidUserTask`.
- If storage contains partially corrupted records (e.g., from manual editing), valid tasks are recovered while invalid items are discarded.
- A dismissible **Storage Notice Banner** informs the student of any recovery event.

### Privacy & API Secrets

- **Zero API Secrets:** No API keys, credentials, or private secrets are required or stored.
- **Zero Tracking:** No analytics scripts, cookies, or remote telemetries.
- **User-Initiated Geolocation:** Geolocation is never requested automatically on load. Location coordinates are only accessed when the user explicitly clicks the "Use My Location" button in the weather widget.

---

## Deployment

### Live Deployment

The application is deployed on Vercel at:
👉 **[https://taskflow-nkj.vercel.app/](https://taskflow-nkj.vercel.app/)**

### Single-Page Application (SPA) Routing

Single-page application client routing is supported via:
- `public/_redirects`: `/*  /index.html  200` (for Netlify and compatible static hosts).
- `vercel.json`: Rewrites all routes to `/index.html`.

### Production Build

To build the project for production deployment:

```bash
npm run build
```

This bundles assets with Vite into the `dist/` directory.

---

## Known Constraints & Browser Behavior

- **Client-Side Storage:** Tasks are stored in browser `localStorage`. Data does not automatically synchronize across different browsers or devices without exporting and importing a JSON backup.
- **Desktop Notifications:** Browser desktop notifications require user permission via the browser prompt and are delivered only while the TaskFlow tab remains open.
- **Geolocation Context:** Browser geolocation requires a secure context (`https://` or `localhost`) and explicit user consent. When unavailable or denied, the manual city search provides complete weather functionality.
- **Private Browsing Quota:** In strict private browsing modes where `localStorage` is disabled or blocked, tasks remain stored in React memory for the duration of the session, and a notification banner advises the user.

---

## Attribution & Submission

- Developed as a submission for the **GDG BPPIMT Tech Team** selection assignment.
- External REST endpoints: [DummyJSON](https://dummyjson.com/), [Advice Slip API](https://api.adviceslip.com/), and [Open-Meteo](https://open-meteo.com/).
