export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskCategory = 'GDG' | 'Academics' | 'Personal';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export interface UserTask {
  id: string;
  title: string;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string | null; // local calendar date in YYYY-MM-DD, or null if absent
  status: TaskStatus;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
  subtasks?: Subtask[]; // optional checklist items, defaults to []
  favorite?: boolean; // optional favorite flag, defaults to false
}

export type SortOption =
  | 'dueDate-asc'
  | 'dueDate-desc'
  | 'priority-high-low'
  | 'priority-low-high'
  | 'newest'
  | 'oldest'
  | 'title-asc';

export interface TaskFiltersState {
  search: string;
  category: TaskCategory | 'All';
  priority: TaskPriority | 'All';
  status: TaskStatus | 'All';
  sortBy: SortOption;
  favoritesOnly: boolean;
}

export interface TaskExportPayload {
  schemaVersion: 1;
  exportedAt: string;
  appName: 'TaskFlow';
  tasks: UserTask[];
}
