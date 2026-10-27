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
| **Core Task Flow (CRUD)** | • **Create:** Add tasks with Title, Category (`GDG`, `Academics`, `Personal`), Priority (`High`, `Medium`, `Low`), optional Due Date (`YYYY-MM-DD`), and Status (`Pending` default).<br>• **Validation:** Trims title, rejects blank/whitespace-only input, displays inline error messages.<br>• **Read:** Displays title, category, priority, localized deadline status badge, and status control on every item.<br>• **Update:** Prefilled modal editor to modify all task attributes with instant refresh across views.<br>• **Quick Status Toggle:** One-click checkbox control to toggle between `Completed` and `Pending` with visual strikethrough.<br>• **Delete:** Confirmation modal stating task title, paired with an immediate "Undo" toast.<br>• **Clear Completed:** Batch removes completed user tasks after confirmation, leaving pending tasks and API samples untouched. |
| **Search, Filters & Sorting** | • **Immediate Search:** Real-time case-insensitive search matching task title.<br>• **Category Filter:** `All`, `GDG`, `Academics`, `Personal`.<br>• **Priority Filter:** `All`, `High`, `Medium`, `Low`.<br>• **Status Filter:** `All`, `Pending`, `In Progress`, `Completed`.<br>• **Deterministic Sorting:** Due date ascending/descending (null dates grouped at end), Priority (High to Low / Low to High), Creation date (Newest / Oldest), Title (A to Z).<br>• **Filter Indicators & Reset:** Active filter chip count and a one-click `Clear filters` button. |
| **Dashboard Statistics** | • **Four Metrics:** Computed exclusively from user-owned tasks:<br>&nbsp;&nbsp;1. **Total Tasks:** Count of all user tasks.<br>&nbsp;&nbsp;2. **Completed:** Tasks with status `Completed`.<br>&nbsp;&nbsp;3. **Pending:** Tasks with status `Pending` (explicitly excludes `In Progress`).<br>&nbsp;&nbsp;4. **Completion Rate:** `(completed / total) * 100`, handled cleanly for zero tasks (`0%`, no `NaN` or divide-by-zero). |
| **Deadline Intelligence** | • **Local Calendar Dates:** Avoids UTC timezone day-shifts using local year-month-day components.<br>• **Semantic Badges:** `Overdue` (past due date & not completed), `Due today` (today's date & not completed), `Upcoming` (within 3 days), and `Completed` (completed tasks are never marked overdue). |
| **DummyJSON Sample Todos API** | • Endpoint: `https://dummyjson.com/todos`<br>• Read-only reference list isolated in separate React state.<br>• Loading skeletons, error state with `Retry Loading`, and empty state.<br>• **"Add copy to My Tasks":** Clones any sample todo into an independent user-owned task with a new UUID, category `Personal`, priority `Medium`, and status `Pending`. Never mutates the source sample. |
| **Daily Advice Slip API** | • Endpoint: `https://api.adviceslip.com/advice`<br>• Non-blocking inspirational quotation attributed to "Daily advice" (no fabricated authors).<br>• Cache-busting refresh button, loading skeleton, and error resilience without blocking task workflows. |
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
| `npm run test` | Runs the full Vitest suite (76 tests across 13 test files covering CRUD, hooks, API guards, storage resilience, validation, sorting, filtering, modal focus, and a11y). |
| `npm run type-check` | Runs the TypeScript compiler (`tsc --noEmit`) to verify strict type safety. |
| `npm run lint` | Runs ESLint across all source and test files. |
| `npm run build` | Compiles TypeScript and creates an optimized production bundle in `dist/`. |
| `npm run preview` | Previews the production build locally. |

---

## 📁 Architecture & Directory Structure

```text
taskflow/
├── src/
│   ├── types/
│   │   ├── task.ts            # UserTask, TaskPriority, TaskCategory, TaskStatus, TaskExportPayload
│   │   └── api.ts             # SampleTodo, DummyJsonResponse, AdviceSlipResponse
│   ├── utils/
│   │   ├── dates.ts           # Local date parsing, relative formatting, deadline classification
│   │   ├── validation.ts      # Input validation, strict UserTask schema check, import validation
│   │   ├── sorting.ts         # Deterministic multi-tier sorting & tie-breakers
│   │   ├── filtering.ts       # Composable search, category, priority, status filters
│   │   ├── statistics.ts      # Pure calculation of Total, Completed, Pending, Completion Rate
│   │   └── storage.ts         # Namespaced localStorage operations & recovery
│   ├── services/
│   │   ├── dummyjson.ts       # DummyJSON todos API client with AbortController
│   │   ├── advice.ts          # Advice Slip API client with cache-busting refresh
│   │   └── importExport.ts    # JSON export file trigger and all-or-nothing file import
│   ├── hooks/
│   │   ├── useTheme.ts        # Theme preference management (light/dark/system) & FOUC prevention
│   │   ├── useTasks.ts        # User task CRUD, status toggling, and storage persistence
│   │   ├── useAdvice.ts       # Async hook for Daily Advice Slip
│   │   └── useSampleTodos.ts  # Async hook for DummyJSON sample todos
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.tsx      # Semantic badges for Priority, Category, Status, Deadlines
│   │   │   ├── Modal.tsx      # Accessible modal dialog with focus trap & Esc handler
│   │   │   ├── ConfirmModal.tsx # Confirmation dialog for Delete and Clear Completed
│   │   │   └── Toast.tsx      # Transient polite notifications with Undo support
│   │   ├── navigation/
│   │   │   ├── Sidebar.tsx    # Desktop navigation rail with quick actions & theme toggle
│   │   │   └── MobileHeader.tsx # Mobile top bar with collapsible navigation drawer
│   │   ├── dashboard/
│   │   │   ├── StatCards.tsx  # 4 overview cards: Total, Completed, Pending, Completion Rate
│   │   │   ├── AdviceCard.tsx # Daily advice card with refresh and error states
│   │   │   ├── TaskFilters.tsx # Search, filter dropdowns, sort options, and reset
│   │   │   ├── TaskList.tsx   # Task list view (empty state, filtered empty, list)
│   │   │   ├── TaskItem.tsx   # Individual task card with status toggle, badges, edit/delete
│   │   │   └── TaskFormModal.tsx # Task editor modal (create & edit) with inline validation
│   │   ├── samples/
│   │   │   └── SampleTodosView.tsx # DummyJSON sample tasks view with "Add copy" action
│   │   └── transfer/
│   │       └── ImportModal.tsx # JSON import dialog with validation report
│   ├── App.tsx                # App shell, routing between My Tasks & Samples, modal state
│   ├── main.tsx               # React application entry point
│   └── index.css              # Tailwind CSS directives, accessible focus styles, reduced-motion
├── tests/
│   ├── setup.ts               # Global testing setup (jest-dom matchers and automatic cleanup)
│   ├── dates.test.ts          # Unit tests for date logic and deadline status rules
│   ├── filtering.test.ts      # Unit tests for search, multi-filter composition, and sort separation
│   ├── sorting.test.ts        # Unit tests for deterministic sorting and tie-breakers
│   ├── statistics.test.ts     # Unit tests for stats and zero-task edge cases
│   ├── storage.test.ts        # Unit tests for guarded localStorage property access & quota handling
│   ├── validation.test.ts     # Unit tests for input boundary (120/121 chars) and import schemas
│   ├── importExport.test.ts   # Unit tests for ID allocation, bounded retries & collision resolution
│   ├── useTasks.test.tsx      # Tests for pure task state updaters, delete/undo, and StrictMode purity
│   ├── useAdvice.test.tsx     # Tests for advice loading, error retry, unmount abort, and stale guards
│   ├── useSampleTodos.test.tsx# Tests for DummyJSON loading, retry, unmount abort, and stale guards
│   ├── modal.test.tsx         # Tests for dialog focus management, disabled skip, and focus trap
│   ├── adviceCard.test.tsx    # Tests for aria-busy and polite live region screen reader announcements
│   └── mobileHeader.test.tsx  # Tests for mobile drawer expansion and aria-current tab navigation
├── index.html                 # HTML root with meta tags, Inter font, and FOUC prevention
├── package.json               # Scripts, dependencies, and configuration
├── tailwind.config.js         # Tailwind theme extension (colors, dark mode class)
└── tsconfig.json              # Strict TypeScript configuration
```

---

## 💾 Data Model & Local Storage Architecture

### UserTask Model

```typescript
type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
type TaskPriority = 'High' | 'Medium' | 'Low';
type TaskCategory = 'GDG' | 'Academics' | 'Personal';

interface UserTask {
  id: string;            // Unique ID: crypto.randomUUID() when available, with collision-resistant timestamp/counter fallback
  title: string;         // Trimmed, non-empty, 1-120 characters
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string | null;// Calendar date in YYYY-MM-DD or null if absent
  status: TaskStatus;    // Defaults to 'Pending' for new tasks
  createdAt: string;     // ISO 8601 string
  updatedAt: string;     // ISO 8601 string
}
```

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
      "createdAt": "2026-10-27T10:00:00.000Z",
      "updatedAt": "2026-10-27T10:00:00.000Z"
    }
  ]
}
```

### Import Validation & Merge Policy

1. **Formats Supported:** Accepts either the standard TaskFlow export object with `schemaVersion: 1` (`{ schemaVersion: 1, exportedAt, appName, tasks: [...] }`) or a raw JSON array of valid `UserTask` objects. Object payloads with a missing `schemaVersion` or unsupported version numbers are explicitly rejected with an informative error message.
2. **All-or-Nothing Validation:** If the file contains unparseable JSON, an unsupported or missing schema version, or any invalid task record (e.g., empty or whitespace-only title, title exceeding 120 characters, invalid priority/category/status enum, malformed date), the entire import is rejected with a specific error message. **Existing tasks remain completely untouched.**
3. **Collision Resolution:** When an imported task shares an ID with an existing task or with another task inside the same imported file, TaskFlow generates a replacement unique ID using bounded retries and deterministic fallbacks. Both existing tasks and all valid imported tasks are preserved as distinct records without data loss.

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

## 📸 Screenshots

> **Note:** Screenshots still need to be captured from your local run. Start the development server using `npm run dev` and navigate to `http://localhost:5173/` to view and capture these states:

| Screen | Description |
| :--- | :--- |
| **Main Dashboard (Desktop)** | Overview of statistic cards, daily advice slip, search filters, and active task cards with priority badges. |
| **Dark Theme** | Sleek, eye-friendly dark mode with contrast-compliant surfaces and subtle semantic accents. |
| **Task Creation Modal** | Accessible modal dialog with inline validation and priority/category selection. |
| **Sample Tasks (DummyJSON)** | Dedicated API view showing reference sample todos and the "Add copy to My Tasks" action. |
| **Mobile Viewport** | Responsive mobile layout with header actions and touch-friendly controls. |

---

## 📄 License & Attribution

- Built as a submission for the **GDG BPPIMT Tech Team** selection assignment.
- External endpoints: [DummyJSON](https://dummyjson.com/) and [Advice Slip API](https://api.adviceslip.com/).
